
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppData, DEFAULT_DATA, UserRole, Transaction, TransactionType } from '../types';
import { db, doc, onSnapshot, setDoc } from '../services/firebase';

const FIREBASE_DOC_PATH = 'falla/merello2026';

// SANITIZADOR MAESTRO: Garantiza que TODOS los campos de data tengan valores seguros.
// Si Firebase devuelve un JSON parcial (ej: sin barSessions o sin incidents),
// esta función los rellena con arrays vacíos para evitar crashes de UI.
const sanitizeData = (raw: any): AppData => {
  return {
    ...DEFAULT_DATA,
    ...raw,
    // Asegurar que todos los arrays críticos existan
    members: raw?.members ?? [],
    transactions: raw?.transactions ?? [],
    tasks: raw?.tasks ?? [],
    shoppingList: raw?.shoppingList ?? [],
    orders: raw?.orders ?? [],
    shifts: raw?.shifts ?? [],
    suppliers: raw?.suppliers ?? [],
    budgetLines: raw?.budgetLines ?? [],
    mealEvents: raw?.mealEvents ?? [],
    incidents: raw?.incidents ?? [],
    stock: raw?.stock ?? [],
    barSessions: raw?.barSessions ?? [],
    catalog: raw?.catalog ?? [],
    workGroups: raw?.workGroups ?? [],
    auditLog: raw?.auditLog ?? [],
    budgetLimit: raw?.budgetLimit ?? DEFAULT_DATA.budgetLimit,
    // Asegurar objetos complejos
    appConfig: {
      ...DEFAULT_DATA.appConfig,
      ...(raw?.appConfig ?? {}),
      pins: { ...DEFAULT_DATA.appConfig.pins, ...(raw?.appConfig?.pins ?? {}) },
      barPrices: raw?.appConfig?.barPrices ?? DEFAULT_DATA.appConfig.barPrices,
      shiftLabels: raw?.appConfig?.shiftLabels ?? DEFAULT_DATA.appConfig.shiftLabels,
      stockCategories: raw?.appConfig?.stockCategories ?? DEFAULT_DATA.appConfig.stockCategories,
      stockCategoryDefs: raw?.appConfig?.stockCategoryDefs ?? DEFAULT_DATA.appConfig.stockCategoryDefs,
    },
    kioskConfig: raw?.kioskConfig ?? DEFAULT_DATA.kioskConfig,
    kioskStatus: raw?.kioskStatus ?? DEFAULT_DATA.kioskStatus,
  };
};

export const useAppData = () => {
  // 1. Inicialización Lazy del Estado
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem('merello_app_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure new predefined categories are available if the user had legacy data
        if (parsed.appConfig) {
          if (!parsed.appConfig.stockCategoryDefs || parsed.appConfig.stockCategoryDefs.length === 0) {
            parsed.appConfig.stockCategoryDefs = [...DEFAULT_DATA.appConfig.stockCategoryDefs!];
          }

          if (parsed.appConfig.stockCategories) {
            const defs = parsed.appConfig.stockCategoryDefs;
            parsed.appConfig.stockCategories.forEach((catName: string, idx: number) => {
              // Check if it's already a known predefined ID or name
              const exists = defs.find((d: any) => d.id === catName || d.name === catName);
              if (!exists) {
                // It's a legacy custom category or user-created, let's create a definition for it
                const newId = catName.toUpperCase().replace(/\s+/g, '_');
                defs.push({
                  id: newId,
                  name: catName,
                  icon: 'Box',
                  subcategories: []
                });

                // Update the stockCategories array to use the new ID
                parsed.appConfig.stockCategories[idx] = newId;
              }
            });

            // Activate the default ones if array is totally empty
            if (parsed.appConfig.stockCategories.length === 0 && defs.length > 0) {
              parsed.appConfig.stockCategories = [...DEFAULT_DATA.appConfig.stockCategories];
            }
          }
        }
        return sanitizeData(parsed);
      }
      return DEFAULT_DATA;
    } catch (e) {
      console.error("Error cargando datos", e);
      return DEFAULT_DATA;
    }
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);

  // 2. Sincronización bidireccional con Firebase + Backup Local
  useEffect(() => {
    // Respaldo local por si acaso falla todo
    localStorage.setItem('merello_app_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    // Escucha en tiempo real de Firebase
    const unsub = onSnapshot(doc(db, FIREBASE_DOC_PATH), (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();

        // Sanitizar datos remotos para rellenar campos faltantes
        const safeData = sanitizeData(remoteData);

        // Mantener las comprobaciones de migración seguras
        if (safeData.appConfig && (!safeData.appConfig.stockCategoryDefs || safeData.appConfig.stockCategoryDefs.length === 0)) {
          safeData.appConfig.stockCategoryDefs = [...DEFAULT_DATA.appConfig.stockCategoryDefs!];
        }

        setData(safeData);
      }
    }, (error) => {
      console.error("Error en Firebase onSnapshot:", error);
    });

    return () => unsub();
  }, []);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // 3. Helper de actualización genérico (Escribe en React State optimista y luego en Firebase con BATCHING)
  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => {
      const mergedData = { ...prev, ...updates, lastModified: Date.now() };

      // BATCHING: Evita freír la cuota de Firebase. Espera 3s agrupando peticiones antes de subir.
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        setDoc(doc(db, FIREBASE_DOC_PATH), mergedData).catch(err => {
          console.error("Error guardando datos en Firebase (Batch):", err);
        });
      }, 3000);

      return mergedData;
    });
  }, []);

  // 4. Lógica de Negocio Compleja (Extraída de la UI)

  // Procesar recepción de pedidos
  const handleMarkOrderReceived = useCallback((id: string, cost: number, receivedItems?: { name: string; quantity: number }[]) => {
    const order = data.orders.find(o => o.id === id);
    if (order) {
      const newTransaction: Transaction | null = cost > 0 ? {
        id: Date.now().toString(),
        description: `Pedido: ${order.title} (${order.supplierName})`,
        amount: cost,
        type: TransactionType.EXPENSE,
        category: order.orderType === 'BAR' ? 'Inversión Barra' : 'Varios',
        date: new Date().toISOString(),
        isBarInvestment: order.orderType === 'BAR'
      } : null;

      updateData({
        orders: data.orders.map(o => o.id === id ? {
          ...o,
          status: 'RECEIVED',
          items: receivedItems || o.items, // Actualiza ítems si hay corrección en recepción
          estimatedCost: cost // Actualizamos el coste estimado con el real pagado para futuros reportes
        } : o),
        transactions: newTransaction ? [...data.transactions, newTransaction] : data.transactions
      });
    }
  }, [data.orders, data.transactions, updateData]);

  // Gestión de listas de compra
  const handleShoppingToggle = useCallback((id: string, cost?: number, cat?: string) => {
    const item = data.shoppingList.find(i => i.id === id);
    if (item && !item.checked && cost) {
      updateData({
        transactions: [...data.transactions, {
          id: Date.now().toString(),
          description: `Compra: ${item.name}`,
          amount: cost,
          type: TransactionType.EXPENSE,
          category: cat || 'Varios',
          date: new Date().toISOString()
        }],
        shoppingList: data.shoppingList.map(i => i.id === id ? { ...i, checked: true, actualCost: cost } : i)
      });
    } else {
      updateData({ shoppingList: data.shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i) });
    }
  }, [data.shoppingList, data.transactions, updateData]);

  // Reset completo de módulos (Danger Zone)
  const resetModule = useCallback((key: string) => {
    if (key === 'members') updateData({ members: [] });
    if (key === 'transactions') updateData({ transactions: [] });
    if (key === 'tasks') updateData({ tasks: [] });
    if (key === 'stock') updateData({ stock: [] });
  }, [updateData]);

  return {
    data,
    updateData, // Exposed for simple updates
    setData, // Exposed for full imports
    userRole,
    setUserRole,
    currentView,
    setCurrentView,
    isAiOpen,
    setIsAiOpen,
    // Acciones Complejas
    actions: {
      handleMarkOrderReceived,
      handleShoppingToggle,
      resetModule
    }
  };
};
