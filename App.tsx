
import React, { useEffect, useState, useRef, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { joinRoom } from 'trystero';
import { useAppData } from './hooks/useAppData';
import { useToast } from './hooks/useToast';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BarManager } from './components/BarManager';
import { MealPlanner } from './components/MealPlanner';
import { InventoryManager } from './components/InventoryManager';
import { CashManager } from './components/CashManager';
import { BarProfitManager } from './components/BarProfitManager';
import { StockControl } from './components/StockControl';
import { PurchasePlanner } from './components/PurchasePlanner';
import { ShoppingListManager } from './components/ShoppingListManager';
import { SupplierManager } from './components/SupplierManager';
import { LogisticsManager } from './components/LogisticsManager';
import { PasacallesRoute } from './components/logistics/PasacallesRoute';
import { AttendeeManager } from './components/AttendeeManager';
import { ReportsManager } from './components/ReportsManager';
import { AdminControlPanel } from './components/AdminControlPanel';
import { ToolsManager } from './components/ToolsModules';
import { HelpGuide } from './components/HelpGuide';
import { KioskMode } from './components/KioskMode';

import { WorkGroupManager } from './components/WorkGroupManager';
import { Task, KioskWorkload, TransactionType, Incident, UserRole } from './types';
import { Siren } from 'lucide-react';

const App: React.FC = () => {
    const {
        data, updateData, setData,
        userRole, setUserRole,
        currentView, setCurrentView,

        actions
    } = useAppData();
    const toast = useToast();

    // --- ESTADOS CRÍTICOS ---
    const [alertState, setAlertState] = useState<{ active: boolean, title: string, msg: string, source: string } | null>(null);
    const [, setPushStatus] = useState<{ status: 'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR', msg: string }>({ status: 'IDLE', msg: '' });

    // Estado de Red y Background
    const [, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE' | 'CONNECTING'>('CONNECTING');
    const [peerCount, setPeerCount] = useState(0);

    // Refs para lógica de Polling y Audio (ESTABILIDAD)
    const configRef = useRef(data.appConfig);
    const lastPollTimeRef = useRef<number>(0);
    const processedMsgIds = useRef<Set<string>>(new Set());
    const audioContextRef = useRef<AudioContext | null>(null);
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);
    const initRef = useRef(false);

    // Canales Secundarios
    const [sendP2P, setSendP2P] = useState<any>(null);
    const [localChannel, setLocalChannel] = useState<BroadcastChannel | null>(null);

    // --- CONSTANTES ---
    const ONE_SIGNAL_APP_ID = "bbb260df-3c34-48c9-a515-3f84c4c7fe38";
    const SILENT_MP3 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//oeAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw//oeAAAAAAAAAAAAAAAAAAAAAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAAAAAAAAAAAAACCAAAAAAAAAAASAAAAAAAAD/++WEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//oeQAA=";

    useEffect(() => {
        configRef.current = data.appConfig;
    }, [data.appConfig]);

    // --- SONIDO DE ALERTA (BEEP) ---
    const playBeep = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx?.state === 'suspended') {
                ctx.resume().catch(e => console.log("No se pudo reactivar audio:", e));
            }
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            osc.type = 'square';
            [0, 0.2, 0.4].forEach(offset => {
                osc.frequency.setValueAtTime(800, now + offset);
                osc.frequency.linearRampToValueAtTime(1200, now + offset + 0.1);
                gain.gain.setValueAtTime(0.5, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1);
            });

            osc.start(now);
            osc.stop(now + 0.6);
        } catch (e) {
            console.error("Error crítico audio beep", e);
        }
    }, []);

    const triggerGlobalAlert = useCallback((title: string, msg: string, source: string) => {
        console.log("ALERTA RECIBIDA:", title);
        playBeep();
        const vibrationPattern = configRef.current.hapticPattern || [200, 100, 200, 100, 200, 100, 200];
        if (Notification.permission === 'granted') {
            try {
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification(title, { body: msg, icon: '/icon.svg', vibrate: vibrationPattern, tag: 'merello-alert-' + Date.now(), renotify: true, requireInteraction: true } as any);
                    });
                } else {
                    new Notification(title, { body: msg, icon: '/icon.svg', vibrate: vibrationPattern, tag: 'merello-alert-' + Date.now(), requireInteraction: true } as any);
                }
            } catch (e) { }
        }
        if (navigator.vibrate) { try { navigator.vibrate(vibrationPattern); } catch (e) { } }
        setAlertState({ active: true, title, msg, source });
    }, [playBeep]);

    const handleAudioHeartbeat = useCallback(async () => {
        const now = Date.now();
        const topic = configRef.current.ntfyTopic || "merello-planner-2026-global-alerts";
        if (now - lastPollTimeRef.current > 2000) {
            lastPollTimeRef.current = now;
            try {
                const response = await fetch(`https://ntfy.sh/${topic}/json?since=all&limit=5`, { cache: 'no-store', method: 'GET' });
                if (response.ok) {
                    setNetworkStatus('ONLINE');
                    const text = await response.text();
                    const lines = text.trim().split('\n');
                    lines.forEach(line => {
                        if (!line) return;
                        try {
                            const msg = JSON.parse(line);
                            if (msg.event === 'message') {
                                const msgTime = msg.time * 1000;
                                const isRecent = (Date.now() - msgTime) < 300000;
                                if (!processedMsgIds.current.has(msg.id) && isRecent) {
                                    processedMsgIds.current.add(msg.id);
                                    triggerGlobalAlert(msg.title || 'ALERTA', msg.message, 'RED MÓVIL');
                                }
                            }
                        } catch (e) { }
                    });
                } else {
                    if (response.status !== 404) setNetworkStatus('OFFLINE');
                }
            } catch (e) {
                setNetworkStatus('OFFLINE');
            }
        }
    }, [triggerGlobalAlert]);

    useEffect(() => {
        const interval = setInterval(handleAudioHeartbeat, 2000);
        return () => clearInterval(interval);
    }, [handleAudioHeartbeat]);

    const activateAudio = () => {
        if (silentAudioRef.current) {
            silentAudioRef.current.play().then(() => {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
            }).catch(e => console.error("Audio autoplay block:", e));
        }
    };

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;
        try {
            const config = { appId: 'merello-planner-2026' };
            const room = joinRoom(config, 'global-alerts');
            const [sendAlert, getAlert] = room.makeAction('alert');
            setSendP2P(() => sendAlert);
            getAlert((payload: any) => triggerGlobalAlert(payload.title, payload.msg, 'P2P LOCAL'));
            room.onPeerJoin(() => setPeerCount(c => c + 1));
            room.onPeerLeave(() => setPeerCount(c => Math.max(0, c - 1)));
        } catch (e) { }
        try {
            const channel = new BroadcastChannel('merello_alerts');
            channel.onmessage = (event) => triggerGlobalAlert(event.data.title, event.data.msg, 'LOCAL TAB');
            setLocalChannel(channel);
        } catch (e) { }
        try {
            OneSignal.init({ appId: ONE_SIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true }).catch(() => { });
        } catch (e) { }
    }, [triggerGlobalAlert]);

    const sendPushAlert = async (title: string, msg: string) => {
        const topic = configRef.current.ntfyTopic || "merello-planner-2026-global-alerts";
        setPushStatus({ status: 'SENDING', msg: 'Contactando App Externa...' });
        try {
            await fetch(`https://ntfy.sh/${topic}`, {
                method: 'POST',
                headers: { 'Title': btoa(unescape(encodeURIComponent(title))), 'Priority': '5', 'Tags': 'rotating_light,vibration' },
                body: msg
            });
        } catch (e) { console.error("Error envío Ntfy", e); }
        if (sendP2P) sendP2P({ title, msg, timestamp: Date.now() });
        if (localChannel) localChannel.postMessage({ title, msg });
        setPushStatus({ status: 'SUCCESS', msg: '¡SEÑAL ENVIADA!' });
        setTimeout(() => setPushStatus({ status: 'IDLE', msg: '' }), 2000);
    };

    const initPermissions = () => {
        activateAudio();
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') { Notification.requestPermission(); }
    };

    const handleKioskWorkloadUpdate = (terminal: 'VENTA' | 'CASAL', status: KioskWorkload) => {
        updateData({ kioskStatus: { ...(data.kioskStatus || { VENTA: 'NORMAL', CASAL: 'NORMAL' }), [terminal]: status } });
    };

    const getActiveSessionCounts = () => {
        const activeSession = data.barSessions?.find(s => !s.isClosed);
        return activeSession?.ticketCounts || {};
    };

    const GlobalAlertOverlay = () => {
        if (!alertState || !alertState.active) return null;
        return (
            <div className="fixed inset-0 z-[9999] bg-rose-600 animate-pulse flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer" onClick={() => { setAlertState(null); if (audioContextRef.current) audioContextRef.current.suspend(); }}>
                <Siren size={120} className="mb-8 animate-bounce" />
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">{alertState.title}</h1>
                <p className="text-3xl font-bold uppercase tracking-widest">{alertState.msg}</p>
                <p className="mt-12 text-sm font-mono opacity-80">Toque para silenciar • Origen: {alertState.source}</p>
            </div>
        );
    };

    if (!userRole) {
        return (
            <>
                <LoginScreen config={data.appConfig} onLogin={setUserRole} onInitAudio={initPermissions} hasPushSupport={true} isSubscribed={Notification.permission === 'granted'} onToggleNotifications={initPermissions} />
                <audio ref={silentAudioRef} src={SILENT_MP3} loop muted style={{ display: 'none' }} />
            </>
        );
    }

    // --- RENDER CONTENT WITH ROLE OVERRIDES ---

    // 1. MODO CAJERO / TPV -> Cobra y vende tickets
    if (userRole === 'KIOSKO_VENTA' || userRole === 'CAJERO') {
        return (
            <KioskMode
                stock={data.stock}
                shifts={data.shifts}
                incidents={data.incidents}
                config={data.kioskConfig}
                prices={data.appConfig.barPrices}
                appConfig={data.appConfig}
                onExit={() => setUserRole(null)}
                totalSessionRevenue={data.barSessions?.find(s => !s.isClosed)?.revenue || 0}
                ticketCounts={getActiveSessionCounts()}
                onCreateIncident={(t, p, sId, q, term) => { updateData({ incidents: [...data.incidents, { id: Date.now().toString(), title: t, priority: p, status: 'OPEN', timestamp: new Date().toISOString(), stockItemId: sId, quantity: q, terminal: term }] }); if (p === 'URGENT') sendPushAlert(`🚨 ALERTA CAJA`, t); }}
                onResolveIncident={(id) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: 'RESOLVED' } : i) })}
                onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })}
                onUpdateWorkload={handleKioskWorkloadUpdate}
                onTicketSale={(items) => {
                    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                    updateData({
                        transactions: totalAmount > 0 ? [...data.transactions, {
                            id: Date.now().toString(),
                            description: `Ticket Compuesto (${items.length} refs)`,
                            amount: totalAmount,
                            type: TransactionType.INCOME,
                            category: 'Venta Barra',
                            date: new Date().toISOString(),
                            isBarInvestment: true
                        }] : data.transactions,
                        barSessions: data.barSessions.map(s => {
                            if (!s.isClosed) {
                                const newCounts = { ...s.ticketCounts };
                                items.forEach(item => {
                                    newCounts[item.name] = (newCounts[item.name] || 0) + item.quantity;
                                });
                                return { ...s, ticketCounts: newCounts, revenue: s.revenue + totalAmount };
                            }
                            return s;
                        })
                    });
                }}
                initialMode="VENTA"
                mode="POS"
                userRole={userRole}
            />
        );
    }

    // 2. MODO CAMARERO (DISPENSADOR) -> SOLO STOCK Y REPOSICIÓN
    if (userRole === 'CAMARERO') {
        return (
            <KioskMode
                stock={data.stock}
                shifts={data.shifts}
                incidents={data.incidents}
                config={data.kioskConfig}
                prices={data.appConfig.barPrices}
                appConfig={data.appConfig}
                onExit={() => setUserRole(null)}
                onCreateIncident={(t, p, sId, q, term) => {
                    const isApproval = t.includes('🔓 APROBACIÓN REQUERIDA');
                    updateData({
                        incidents: [...data.incidents, {
                            id: Date.now().toString(),
                            title: t,
                            priority: p,
                            status: isApproval ? 'PENDING_APPROVAL' : 'OPEN',
                            timestamp: new Date().toISOString(),
                            stockItemId: sId,
                            quantity: q,
                            terminal: term,
                            requiresAuthorization: isApproval,
                            requestedBy: userRole
                        }]
                    });
                    if (p === 'URGENT') sendPushAlert(`🚨 ALERTA BARRA`, t);
                }}
                onResolveIncident={(id, status) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: (status as Incident['status']) || 'RESOLVED' } : i) })}
                onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })}
                onUpdateWorkload={handleKioskWorkloadUpdate}
                onMarkAsDelivered={(id) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: 'DELIVERED', deliveredAt: new Date().toISOString(), deliveredBy: userRole } : i) })}
                onConfirmReceipt={(id) => {
                    const incident = data.incidents.find(i => i.id === id);
                    if (incident && incident.stockItemId && incident.quantity) {
                        const currentStock = data.stock.find(s => s.id === incident.stockItemId);
                        if (currentStock) {
                            const newQty = Math.max(0, currentStock.quantity - (incident.quantity || 0));
                            updateData({
                                stock: data.stock.map(s => s.id === incident.stockItemId ? { ...s, quantity: newQty } : s),
                                incidents: data.incidents.map(i => i.id === id ? {
                                    ...i,
                                    status: 'RESOLVED',
                                    confirmedAt: new Date().toISOString(),
                                    confirmedBy: userRole
                                } : i)
                            });
                            toast.success(`Stock actualizado: ${currentStock.quantity} → ${newQty}`);
                        }
                    }
                }}
                ticketCounts={getActiveSessionCounts()}
                initialMode="VENTA"
                mode="STOCK_ONLY"
                userRole={userRole}
            />
        );
    }

    // 3. MODO CAMARERO FALLERO (CASAL) -> SOLO STOCK Y REPOSICIÓN
    if (userRole === 'KIOSKO_CASAL') {
        return (
            <KioskMode
                stock={data.stock}
                shifts={data.shifts}
                incidents={data.incidents}
                config={data.kioskConfig}
                prices={data.appConfig.barPrices}
                appConfig={data.appConfig}
                onExit={() => setUserRole(null)}
                onCreateIncident={(t, p, sId, q, term) => {
                    const isApproval = t.includes('🔓 APROBACIÓN REQUERIDA');
                    updateData({
                        incidents: [...data.incidents, {
                            id: Date.now().toString(),
                            title: t,
                            priority: p,
                            status: isApproval ? 'PENDING_APPROVAL' : 'OPEN',
                            timestamp: new Date().toISOString(),
                            stockItemId: sId,
                            quantity: q,
                            terminal: term,
                            requiresAuthorization: isApproval,
                            requestedBy: userRole
                        }]
                    });
                    if (p === 'URGENT') sendPushAlert(`🚨 ALERTA CASAL`, t);
                }}
                onResolveIncident={(id, status) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: (status as Incident['status']) || 'RESOLVED' } : i) })}
                onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })}
                onUpdateWorkload={handleKioskWorkloadUpdate}
                onMarkAsDelivered={(id) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: 'DELIVERED', deliveredAt: new Date().toISOString(), deliveredBy: userRole } : i) })}
                onConfirmReceipt={(id) => {
                    const incident = data.incidents.find(i => i.id === id);
                    if (incident && incident.stockItemId && incident.quantity) {
                        const currentStock = data.stock.find(s => s.id === incident.stockItemId);
                        if (currentStock) {
                            const newQty = Math.max(0, currentStock.quantity - (incident.quantity || 0));
                            updateData({
                                stock: data.stock.map(s => s.id === incident.stockItemId ? { ...s, quantity: newQty } : s),
                                incidents: data.incidents.map(i => i.id === id ? {
                                    ...i,
                                    status: 'RESOLVED',
                                    confirmedAt: new Date().toISOString(),
                                    confirmedBy: userRole
                                } : i)
                            });
                            toast.success(`Stock actualizado: ${currentStock.quantity} → ${newQty}`);
                        }
                    }
                }}
                ticketCounts={getActiveSessionCounts()}
                initialMode="CASAL"
                mode="STOCK_ONLY"
                userRole={userRole}
            />
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard data={data} onResolveIncident={(id, status) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: (status as Incident['status']) || 'RESOLVED' } : i) })} userRole={userRole} kioskStatus={data.kioskStatus} />;
            case 'cash': return <CashManager data={data} onAddTransaction={t => updateData({ transactions: [...data.transactions, { ...t, id: Date.now().toString() }] })} />;
            case 'inventory': return <InventoryManager data={data} onUpdateLimit={l => updateData({ budgetLimit: l })} onUpdateBudget={(c, a) => updateData({ budgetLines: data.budgetLines.map(l => l.category === c ? { ...l, estimated: a } : l) })} onAddLine={(c, a) => updateData({ budgetLines: [...data.budgetLines, { category: c, estimated: a }] })} onDeleteLine={c => updateData({ budgetLines: data.budgetLines.filter(l => l.category !== c) })} />;
            case 'bar-profit': return <BarProfitManager data={data} onUpdateSessions={s => updateData({ barSessions: s })} onAddTransaction={t => updateData({ transactions: [...data.transactions, { ...t, id: Date.now().toString() }] })} onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })} />;
            case 'stock': return <StockControl items={data.stock} categories={data.appConfig.stockCategories} units={data.appConfig.units} barSessions={data.barSessions} incidents={data.incidents} onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })} onAddItem={i => updateData({ stock: [...data.stock, { ...i, id: Date.now().toString(), lastUpdated: new Date().toISOString() }] })} onUpdateItem={(id, u) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, ...u } : i) })} onDelete={id => updateData({ stock: data.stock.filter(i => i.id !== id) })} />;
            case 'purchase': return <PurchasePlanner catalog={data.catalog} onUpdateCatalog={c => updateData({ catalog: c })} onCreateOrder={o => updateData({ orders: [...data.orders, { ...o, id: Date.now().toString() }] })} suppliers={data.suppliers} attendeesCount={data.members.length} totalBudget={data.budgetLimit} currentSpent={data.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)} stock={data.stock} />;
            case 'shopping': return <ShoppingListManager items={data.shoppingList} budgetLines={data.budgetLines} locations={data.appConfig.locations} onToggle={actions.handleShoppingToggle} onAdd={i => updateData({ shoppingList: [...data.shoppingList, { ...i, id: Date.now().toString(), checked: false }] })} onEdit={(id, u) => updateData({ shoppingList: data.shoppingList.map(i => i.id === id ? { ...i, ...u } : i) })} onDelete={id => updateData({ shoppingList: data.shoppingList.filter(i => i.id !== id) })} onAutoFill={() => { const basics = [{ name: 'Agua 1.5L', quantity: 20, location: 'Barra' }, { name: 'Servilletas', quantity: 10, location: 'Cocina' }]; basics.forEach(b => updateData({ shoppingList: [...data.shoppingList, { ...b, id: Math.random().toString(), unit: 'u', checked: false }] })) }} />;
            case 'suppliers': return <SupplierManager suppliers={data.suppliers} orders={data.orders} categories={data.appConfig.supplierCategories} onMarkReceived={actions.handleMarkOrderReceived} onAddSupplier={s => updateData({ suppliers: [...data.suppliers, { ...s, id: Date.now().toString() }] })} onUpdateSupplier={(id, u) => updateData({ suppliers: data.suppliers.map(s => s.id === id ? { ...s, ...u } : s) })} onDeleteSupplier={id => updateData({ suppliers: data.suppliers.filter(s => s.id !== id) })} />;
            case 'logistics': return <LogisticsManager tasks={data.tasks} members={data.members} onAddTask={t => updateData({ tasks: [...data.tasks, { ...t, id: Date.now().toString() } as Task] })} onUpdateTask={(id, u) => updateData({ tasks: data.tasks.map(t => t.id === id ? { ...t, ...u } : t) })} onDeleteTask={id => updateData({ tasks: data.tasks.filter(t => t.id !== id) })} onAiSuggest={() => toast.info('IA sugerencias en desarrollo...')} />;
            case 'pasacalles': return <PasacallesRoute />;
            case 'hr': return <AttendeeManager members={data.members} tasks={data.tasks} shifts={data.shifts} mealEvents={data.mealEvents} onAddMember={m => updateData({ members: [...data.members, { ...m, id: Date.now().toString() }] })} onDeleteMember={id => updateData({ members: data.members.filter(m => m.id !== id) })} onUpdateMember={(id, u) => updateData({ members: data.members.map(m => m.id === id ? { ...m, ...u } : m) })} />;
            case 'reports': return <ReportsManager data={data} />;
            case 'settings-master': return <AdminControlPanel data={data} kioskConfig={data.kioskConfig} onUpdateConfig={c => updateData({ appConfig: c })} onUpdateKioskConfig={c => updateData({ kioskConfig: c })} onResetModule={actions.resetModule} onFullImport={setData} peerCount={peerCount} onUpdateData={updateData} />;
            case 'tools': return <ToolsManager onAddShoppingItem={i => updateData({ shoppingList: [...data.shoppingList, { ...i, id: Date.now().toString(), checked: false }] })} appData={data} onUpdateKioskConfig={c => updateData({ kioskConfig: c })} onUpdateAppConfig={c => updateData({ appConfig: c })} />;
            case 'help': return <HelpGuide />;
            case 'kiosk': return <KioskMode
                stock={data.stock}
                shifts={data.shifts}
                incidents={data.incidents}
                config={data.kioskConfig}
                prices={data.appConfig.barPrices}
                appConfig={data.appConfig}
                onExit={() => setCurrentView('dashboard')}
                onCreateIncident={(t, p, sId, q, term) => {
                    const isApproval = t.includes('🔓 APROBACIÓN REQUERIDA');
                    updateData({
                        incidents: [...data.incidents, {
                            id: Date.now().toString(),
                            title: t,
                            priority: p,
                            status: isApproval ? 'PENDING_APPROVAL' : 'OPEN',
                            timestamp: new Date().toISOString(),
                            stockItemId: sId,
                            quantity: q,
                            terminal: term,
                            requiresAuthorization: isApproval,
                            requestedBy: userRole || 'KIOSKO_CASAL'
                        }]
                    });
                    if (p === 'URGENT') sendPushAlert(`🚨 ALERTA BARRA ${term || ''}`, t);
                }}
                onResolveIncident={(id, status) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: (status as Incident['status']) || 'RESOLVED' } : i) })}
                onUpdateStock={(id, q) => updateData({ stock: data.stock.map(i => i.id === id ? { ...i, quantity: q } : i) })}
                onUpdateWorkload={handleKioskWorkloadUpdate}
                onMarkAsDelivered={(id) => updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: 'DELIVERED', deliveredAt: new Date().toISOString(), deliveredBy: userRole } : i) })}
                onConfirmReceipt={(id) => {
                    const incident = data.incidents.find(i => i.id === id);
                    if (incident && incident.stockItemId && incident.quantity) {
                        // 1. Update stock
                        const currentStock = data.stock.find(s => s.id === incident.stockItemId);
                        if (currentStock) {
                            const newQty = Math.max(0, currentStock.quantity - (incident.quantity || 0));
                            // 2. Resolve incident and update stock in one updateData call
                            updateData({
                                stock: data.stock.map(s => s.id === incident.stockItemId ? { ...s, quantity: newQty } : s),
                                incidents: data.incidents.map(i => i.id === id ? {
                                    ...i,
                                    status: 'RESOLVED',
                                    confirmedAt: new Date().toISOString(),
                                    confirmedBy: userRole
                                } : i)
                            });
                            toast.success(`Stock actualizado: ${currentStock.quantity} → ${newQty}`);
                        }
                    }
                }}
                userRole={userRole}
                initialMode={userRole === ('KIOSKO_CASAL' as UserRole) ? 'CASAL' : 'VENTA'}
                ticketCounts={getActiveSessionCounts()}
                mode={userRole === ('LOGISTICA' as UserRole) ? 'LOGISTICS' : (userRole === ('CAJERO' as UserRole) ? 'POS' : 'STOCK_ONLY')}
                onTicketSale={(items) => {
                    // Deducir stock para cada item vendido en el POS
                    const updatedStock = [...data.stock];
                    items.forEach(soldItem => {
                        const stockIdx = updatedStock.findIndex(s =>
                            s.name.toLowerCase() === soldItem.name.toLowerCase() && s.usageType === 'VENTA'
                        );
                        if (stockIdx !== -1) {
                            updatedStock[stockIdx] = {
                                ...updatedStock[stockIdx],
                                quantity: Math.max(0, updatedStock[stockIdx].quantity - soldItem.quantity),
                                lastUpdated: new Date().toISOString()
                            };
                        }
                    });
                    updateData({ stock: updatedStock });
                }}
            />;
            case 'bar': return <BarManager shifts={data.shifts} members={data.members} onAutoAssign={() => { toast.success('Auto-asignación completada') }} onUpdateShift={(id, u) => updateData({ shifts: data.shifts.map(s => s.id === id ? { ...s, ...u } : s) })} userRole={userRole} labels={data.appConfig.shiftLabels} onAddDay={(date) => { const newShifts = Object.values(data.appConfig.shiftLabels).map(label => ({ id: Math.random().toString(), date, time: label, assignedMembers: [] })); updateData({ shifts: [...data.shifts, ...newShifts] }) }} />;
            case 'meals': return <MealPlanner mealEvents={data.mealEvents} onUpdateEvents={e => updateData({ mealEvents: e })} onAddList={i => updateData({ shoppingList: [...data.shoppingList, { ...i, id: Date.now().toString(), checked: false }] })} onAddTransaction={t => updateData({ transactions: [...data.transactions, { ...t, id: Date.now().toString() }] })} onCreateOrder={o => updateData({ orders: [...data.orders, { ...o, id: Date.now().toString() }] })} memberCount={data.members.length} currentStock={data.stock} userRole={userRole} />;
            case 'work-groups': return <WorkGroupManager members={data.members} workGroups={data.workGroups || []} onUpdateGroups={g => updateData({ workGroups: g })} onAddMember={m => updateData({ members: [...data.members, m] })} userRole={userRole} />;
            default: return <Dashboard data={data} onResolveIncident={(id, status) => {
                updateData({ incidents: data.incidents.map(i => i.id === id ? { ...i, status: (status as Incident['status']) || 'RESOLVED' } : i) });
            }} userRole={userRole} kioskStatus={data.kioskStatus} />;
        }
    };

    return (
        <Layout currentView={currentView} onChangeView={setCurrentView} userRole={userRole} onLogout={() => setUserRole(null)} peerCount={peerCount} onForceSync={() => { }}>
            <GlobalAlertOverlay />
            <audio ref={silentAudioRef} src={SILENT_MP3} loop muted style={{ display: 'none' }} />
            {renderContent()}
        </Layout>
    );
};

export default App;
