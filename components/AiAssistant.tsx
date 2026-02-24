
import React, { useState, useRef, useEffect } from 'react';
import { generateFallasAdvice } from '../services/geminiService';
import {
  X, Send, Bot, Loader2, ArrowLeft, Home,
  PieChart, Users, Package, CreditCard, ShoppingCart,
  TrendingDown, AlertTriangle, CheckCircle2, Clock, Euro,
  Sparkles, MessageSquare, BarChart3, ChevronRight
} from 'lucide-react';
import { AppData, TransactionType, ShiftTime } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
}

type ViewMode = 'home' | 'chat' | 'budget' | 'shifts' | 'stock' | 'cash' | 'shopping';

// ─── helpers ────────────────────────────────────────────────
const currency = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const pct = (v: number, total: number) =>
  total > 0 ? Math.round((v / total) * 100) : 0;

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getCurrentShiftTime = () => {
  const h = new Date().getHours();
  if (h >= 10 && h < 15) return ShiftTime.MORNING;
  if (h >= 15 && h < 20) return ShiftTime.AFTERNOON;
  return ShiftTime.NIGHT;
};

// ─── reusable AI response panel ─────────────────────────────
const AiResponsePanel: React.FC<{ response: string | null; loading: boolean }> = ({ response, loading }) => {
  if (!loading && !response) return null;
  return (
    <div className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-indigo-600 rounded-lg"><Bot size={12} className="text-white" /></div>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Merello AI</span>
        {loading && <Loader2 size={12} className="text-indigo-400 animate-spin ml-auto" />}
      </div>
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Analizando tus datos...</p>
      ) : (
        <div className="text-sm text-slate-200 leading-relaxed space-y-1">
          {response!.split('\n').map((line, i) => (
            <p key={i} className={`${line.trim() === '' ? 'h-2' : ''}`}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PRESUPUESTO ─────────────────────────────────────────────
const BudgetView: React.FC<{ data: AppData }> = ({ data }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const income = data.transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, t) => a + t.amount, 0);
  const expenses = data.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0);
  const limit = data.budgetLimit || 0;
  const remaining = limit - expenses;
  const usedPct = pct(expenses, limit);
  const byCategory: Record<string, number> = {};
  data.transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const analyze = async () => {
    setLoading(true);
    setAiResponse(null);
    const ctx = JSON.stringify({ presupuesto_limite: limit, total_gastado: expenses, total_ingresos: income, disponible: remaining, porcentaje_usado: usedPct, top_gastos: topCategories.map(([c, v]) => ({ categoria: c, importe: v })) });
    const prompt = `Analiza el presupuesto actual. Presupuesto: ${currency(limit)}, Gastado: ${currency(expenses)} (${usedPct}%), Disponible: ${currency(remaining)}. Los mayores gastos son: ${topCategories.map(([c, v]) => `${c}: ${currency(v)}`).join(', ')}. Dime si la situación es buena o hay que actuar, y qué hacer.`;
    const r = await generateFallasAdvice(prompt, ctx);
    setAiResponse(r);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Presupuesto</p>
          <p className="text-2xl font-black">{currency(limit)}</p>
        </div>
        <div className={`rounded-2xl p-4 ${remaining >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          <p className="text-[10px] font-bold uppercase mb-1 opacity-70">{remaining >= 0 ? 'Disponible' : 'Déficit'}</p>
          <p className="text-2xl font-black">{currency(Math.abs(remaining))}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
          <span>Gastado {currency(expenses)}</span>
          <span>{usedPct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${usedPct > 90 ? 'bg-rose-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
        </div>
      </div>
      <div className="bg-blue-50 rounded-2xl p-3 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Euro size={16} /></div>
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase">Ingresos totales</p>
          <p className="text-lg font-black text-blue-900">{currency(income)}</p>
        </div>
      </div>
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top gastos por categoría</p>
          {topCategories.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct(amt, expenses)}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-600 w-24 truncate text-right">{cat}</span>
              <span className="text-xs font-black text-slate-900 w-16 text-right">{currency(amt)}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={analyze} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? 'Analizando...' : 'Analizar Presupuesto con IA'}
      </button>
      <AiResponsePanel response={aiResponse} loading={loading} />
    </div>
  );
};

// ─── TURNOS ──────────────────────────────────────────────────
const ShiftsView: React.FC<{ data: AppData }> = ({ data }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = getTodayStr();
  const currentShift = getCurrentShiftTime();
  const todayShifts = data.shifts?.filter(s => s.date === today) || [];
  const currentShiftData = todayShifts.find(s => s.time === currentShift);

  const analyze = async () => {
    setLoading(true);
    setAiResponse(null);
    const ctx = JSON.stringify({ hoy: today, turno_actual: currentShift, asignados_ahora: currentShiftData?.assignedMembers || [], turnos_hoy: todayShifts });
    const prompt = `Analiza la cobertura de turnos de hoy (${today}). Turno actual: ${currentShift}. ${currentShiftData?.assignedMembers?.length ? `Hay ${currentShiftData.assignedMembers.length} personas: ${currentShiftData.assignedMembers.join(', ')}` : 'NADIE asignado al turno actual'}. ¿Hay problemas de cobertura? ¿Qué riesgos hay? ¿Cómo lo solucionarías?`;
    const r = await generateFallasAdvice(prompt, ctx);
    setAiResponse(r);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-indigo-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turno Actual</p>
          <span className="ml-auto bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">{currentShift.split('(')[0].trim()}</span>
        </div>
        {currentShiftData?.assignedMembers?.length ? (
          <div className="space-y-2">
            {currentShiftData.assignedMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-black">{m.charAt(0)}</div>
                <span className="text-sm font-bold">{m}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-rose-500/20 rounded-xl px-3 py-2 border border-rose-500/30">
            <AlertTriangle size={14} className="text-rose-400" />
            <p className="text-xs font-bold text-rose-300">Nadie asignado a este turno</p>
          </div>
        )}
      </div>
      {todayShifts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Todos los turnos de hoy</p>
          {todayShifts.map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border-2 ${s.time === currentShift ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-white'}`}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-black text-slate-700 uppercase">{s.time.split('(')[0].trim()}</p>
                <span className="text-[10px] font-bold text-slate-400">{s.assignedMembers?.length || 0} personas</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{s.assignedMembers?.join(', ') || 'Sin asignar'}</p>
            </div>
          ))}
        </div>
      )}
      {!todayShifts.length && (
        <div className="text-center py-8 text-slate-400">
          <Users size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-bold">No hay turnos registrados para hoy</p>
        </div>
      )}
      <button onClick={analyze} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? 'Analizando...' : 'Analizar Turnos con IA'}
      </button>
      <AiResponsePanel response={aiResponse} loading={loading} />
    </div>
  );
};

// ─── STOCK ───────────────────────────────────────────────────
const StockView: React.FC<{ data: AppData }> = ({ data }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const critical = data.stock?.filter(s => s.quantity <= s.minStock) || [];
  const warning = data.stock?.filter(s => s.quantity > s.minStock && s.quantity <= s.minStock * 2) || [];
  const ok = data.stock?.filter(s => s.quantity > s.minStock * 2) || [];

  const analyze = async () => {
    setLoading(true);
    setAiResponse(null);
    const ctx = JSON.stringify({ stock_critico: critical.map(s => ({ nombre: s.name, cantidad: s.quantity, minimo: s.minStock, unidad: s.unit })), stock_aviso: warning.map(s => s.name) });
    const prompt = `Analiza las alertas de stock. CRÍTICO (${critical.length} productos): ${critical.map(s => `${s.name} (${s.quantity}/${s.minStock} ${s.unit})`).join(', ')}. AVISO (${warning.length}): ${warning.map(s => s.name).join(', ')}. ¿Qué hay que reponer YA? ¿En qué orden de prioridad? ¿Cuánto pedir?`;
    const r = await generateFallasAdvice(prompt, ctx);
    setAiResponse(r);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-rose-600">{critical.length}</p>
          <p className="text-[10px] font-black text-rose-500 uppercase">Crítico</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{warning.length}</p>
          <p className="text-[10px] font-black text-amber-500 uppercase">Aviso</p>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{ok.length}</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase">OK</p>
        </div>
      </div>
      {critical.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
          <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600"><TrendingDown size={14} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
            <p className="text-[10px] text-rose-500 font-bold">{item.quantity} {item.unit} — mín. {item.minStock}</p>
          </div>
          <span className="text-[10px] font-black bg-rose-200 text-rose-700 px-2 py-0.5 rounded-full uppercase">{item.usageType}</span>
        </div>
      ))}
      {warning.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><Package size={14} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
            <p className="text-[10px] text-amber-600 font-bold">{item.quantity} {item.unit}</p>
          </div>
        </div>
      ))}
      {!critical.length && !warning.length && (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-black text-emerald-600">Todo el stock en niveles correctos</p>
        </div>
      )}
      <button onClick={analyze} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? 'Analizando...' : 'Analizar Stock con IA'}
      </button>
      <AiResponsePanel response={aiResponse} loading={loading} />
    </div>
  );
};

// ─── CAJA ────────────────────────────────────────────────────
const CashView: React.FC<{ data: AppData }> = ({ data }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = getTodayStr();
  const todayTx = data.transactions.filter(t => t.date?.startsWith(today));
  const todayIncome = todayTx.filter(t => t.type === TransactionType.INCOME).reduce((a, t) => a + t.amount, 0);
  const todayExpenses = todayTx.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0);
  const todayBalance = todayIncome - todayExpenses;
  const totalIncome = data.transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, t) => a + t.amount, 0);
  const totalExpenses = data.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0);

  const analyze = async () => {
    setLoading(true);
    setAiResponse(null);
    const ctx = JSON.stringify({ hoy: today, ingresos_hoy: todayIncome, gastos_hoy: todayExpenses, balance_hoy: todayBalance, total_ingresos: totalIncome, total_gastos: totalExpenses, movimientos_hoy: todayTx.length });
    const prompt = `Dame el cierre de caja de hoy (${today}). HOY: ingresos ${currency(todayIncome)}, gastos ${currency(todayExpenses)}, balance ${currency(todayBalance)} (${todayTx.length} movimientos). TOTAL HISTÓRICO: ingresos ${currency(totalIncome)}, gastos ${currency(totalExpenses)}. ¿Es un buen día? ¿Hay alguna anomalía? ¿Qué recomendaciones tienes?`;
    const r = await generateFallasAdvice(prompt, ctx);
    setAiResponse(r);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-4 text-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Movimientos de Hoy</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-emerald-400">Ingresos</span>
          <span className="text-lg font-black text-emerald-400">+{currency(todayIncome)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-rose-400">Gastos</span>
          <span className="text-lg font-black text-rose-400">-{currency(todayExpenses)}</span>
        </div>
        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
          <span className="text-xs font-black text-white uppercase">Balance del Día</span>
          <span className={`text-2xl font-black ${todayBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{todayBalance >= 0 ? '+' : ''}{currency(todayBalance)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Ingresos</p>
          <p className="text-xl font-black text-emerald-600">{currency(totalIncome)}</p>
        </div>
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-3">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Gastos</p>
          <p className="text-xl font-black text-rose-600">{currency(totalExpenses)}</p>
        </div>
      </div>
      {todayTx.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoy ({todayTx.length} movimientos)</p>
          {todayTx.slice(0, 5).map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl">
              <div className={`p-1.5 rounded-lg ${tx.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}><CreditCard size={12} /></div>
              <span className="flex-1 text-xs font-bold text-slate-700 truncate">{tx.description}</span>
              <span className={`text-xs font-black ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.type === TransactionType.INCOME ? '+' : '-'}{currency(tx.amount)}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={analyze} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? 'Analizando...' : 'Analizar Caja con IA'}
      </button>
      <AiResponsePanel response={aiResponse} loading={loading} />
    </div>
  );
};

// ─── COMPRAS ─────────────────────────────────────────────────
const ShoppingView: React.FC<{ data: AppData }> = ({ data }) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const urgent = data.shoppingList?.filter(i => !i.checked && !i.isBought && i.priority === 'HIGH') || [];
  const pending = data.shoppingList?.filter(i => !i.checked && !i.isBought && i.priority !== 'HIGH') || [];
  const done = data.shoppingList?.filter(i => i.checked || i.isBought) || [];

  const analyze = async () => {
    setLoading(true);
    setAiResponse(null);
    const ctx = JSON.stringify({ urgentes: urgent.map(i => ({ nombre: i.name, cantidad: i.quantity, unidad: i.unit })), pendientes: pending.length, comprados: done.length });
    const prompt = `Analiza la lista de compra. URGENTES (${urgent.length}): ${urgent.slice(0, 8).map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}. Pendientes normales: ${pending.length}. Ya comprado: ${done.length}. ¿Cómo organizo mejor las compras? ¿Hay que ir ya? ¿En qué orden?`;
    const r = await generateFallasAdvice(prompt, ctx);
    setAiResponse(r);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-rose-600">{urgent.length}</p>
          <p className="text-[10px] font-black text-rose-500 uppercase">Urgente</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{pending.length}</p>
          <p className="text-[10px] font-black text-amber-500 uppercase">Pendiente</p>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{done.length}</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase">Comprado</p>
        </div>
      </div>
      {urgent.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <ShoppingCart size={14} className="text-rose-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
            <p className="text-[10px] text-rose-400 font-bold">{item.quantity} {item.unit} — {item.location || 'Sin ubicación'}</p>
          </div>
        </div>
      ))}
      {pending.slice(0, 4).map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
          <ShoppingCart size={14} className="text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-700 truncate">{item.name}</p>
            <p className="text-[10px] text-slate-400 font-bold">{item.quantity} {item.unit}</p>
          </div>
        </div>
      ))}
      {!urgent.length && !pending.length && (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-black text-emerald-600">Lista al día</p>
        </div>
      )}
      <button onClick={analyze} disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? 'Analizando...' : 'Analizar Compras con IA'}
      </button>
      <AiResponsePanel response={aiResponse} loading={loading} />
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, appData }) => {
  const [view, setView] = useState<ViewMode>('home');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view]);

  if (!isOpen) return null;

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    const ctx = JSON.stringify({
      presupuesto_limite: appData.budgetLimit,
      total_gastado: appData.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, t) => a + t.amount, 0),
      total_ingresos: appData.transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, t) => a + t.amount, 0),
      falleros: appData.members?.length,
      stock_critico: appData.stock?.filter(s => s.quantity <= s.minStock).map(s => s.name),
      compra_urgente: appData.shoppingList?.filter(i => !i.checked && i.priority === 'HIGH').map(i => i.name),
      alertas_abiertas: appData.incidents?.filter(i => i.status === 'OPEN').length,
    });
    try {
      const response = await generateFallasAdvice(userMsg, ctx);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error de conexión. Inténtalo de nuevo.' }]);
    }
    setLoading(false);
  };

  const viewTitles: Record<ViewMode, string> = {
    home: 'Inicio', chat: 'Chat', budget: 'Presupuesto',
    shifts: 'Turnos de Hoy', stock: 'Alertas Stock',
    cash: 'Cierre de Caja', shopping: 'Lista Urgente',
  };

  const functions = [
    { id: 'budget' as ViewMode, label: 'Análisis Presupuesto', desc: 'Gastos, ingresos y desvíos', icon: PieChart, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'shifts' as ViewMode, label: 'Turnos de Hoy', desc: 'Quién está de barra ahora', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'stock' as ViewMode, label: 'Alertas de Stock', desc: 'Productos por reponer', icon: Package, color: 'bg-rose-50 text-rose-600' },
    { id: 'cash' as ViewMode, label: 'Cierre de Caja', desc: 'Balance del día de hoy', icon: CreditCard, color: 'bg-amber-50 text-amber-600' },
    { id: 'shopping' as ViewMode, label: 'Lista de Compra', desc: 'Artículos urgentes pendientes', icon: ShoppingCart, color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end items-end md:items-center animate-in fade-in duration-200 md:bg-black/60 md:backdrop-blur-sm">
      <div className="bg-[#f8fafc] w-full md:w-[480px] h-[100dvh] md:h-[90vh] md:mr-8 md:rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300 md:border-4 md:border-white md:ring-4 md:ring-black/10">

        {/* Header */}
        <div className="bg-slate-900 px-4 py-4 md:px-5 flex items-center gap-3 shrink-0 safe-pt">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowLeft size={16} className="text-white" />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-indigo-600 p-2 rounded-xl shrink-0"><BarChart3 size={18} className="text-white" /></div>
            <div>
              <h3 className="font-black text-white text-base leading-none tracking-tight">Merello AI</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest">{viewTitles[view]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* HOME */}
          {view === 'home' && (
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Funciones con IA</p>
              {functions.map(fn => (
                <button key={fn.id} onClick={() => setView(fn.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-[0.98] group">
                  <div className={`p-3 rounded-xl ${fn.color} shrink-0`}><fn.icon size={20} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm">{fn.label}</p>
                    <p className="text-xs text-slate-400">{fn.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                </button>
              ))}
              <button onClick={() => setView('chat')}
                className="w-full flex items-center gap-4 p-4 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] group">
                <div className="p-3 bg-white/10 rounded-xl shrink-0"><MessageSquare size={20} className="text-white" /></div>
                <div className="text-left flex-1">
                  <p className="font-black text-white text-sm">Chat Libre</p>
                  <p className="text-xs text-slate-400">Pregunta lo que quieras</p>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            </div>
          )}

          {/* FUNCTION VIEWS */}
          {view === 'budget' && <div className="p-4"><BudgetView data={appData} /></div>}
          {view === 'shifts' && <div className="p-4"><ShiftsView data={appData} /></div>}
          {view === 'stock' && <div className="p-4"><StockView data={appData} /></div>}
          {view === 'cash' && <div className="p-4"><CashView data={appData} /></div>}
          {view === 'shopping' && <div className="p-4"><ShoppingView data={appData} /></div>}

          {/* CHAT */}
          {view === 'chat' && (
            <div className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Bot size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-black">Chat libre con Merello AI</p>
                  <p className="text-xs mt-1">Escribe cualquier pregunta sobre la falla</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'}`}>
                    {m.text.split('\n').map((line, j) => <span key={j} className="block min-h-[1em]">{line}</span>)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-bl-sm border border-slate-200 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Merello AI analizando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — solo en chat */}
        {view === 'chat' && (
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0 safe-pb">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Pregunta algo sobre la falla..."
              className="flex-1 border-2 border-slate-100 rounded-[20px] px-5 py-3 outline-none focus:border-indigo-400 transition-all bg-slate-50 focus:bg-white font-semibold text-slate-700 placeholder:text-slate-300 text-sm"
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-[20px] hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-90 aspect-square flex items-center justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
