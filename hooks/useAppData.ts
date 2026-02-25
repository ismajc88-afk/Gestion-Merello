
import { useState, useEffect, useCallback } from 'react';
import { AppData, DEFAULT_DATA, UserRole, Transaction, TransactionType } from '../types';
import { db, doc, onSnapshot, setDoc } from '../services/firebase';

const FIREBASE_DOC_PATH = 'falla/merello2026';

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
        return parsed;
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
        const remoteData = docSnap.data() as AppData;

        // Mantener las comprobaciones de migración seguras
        if (remoteData.appConfig && (!remoteData.appConfig.stockCategoryDefs || remoteData.appConfig.stockCategoryDefs.length === 0)) {
          remoteData.appConfig.stockCategoryDefs = [...DEFAULT_DATA.appConfig.stockCategoryDefs!];
        }

        setData(remoteData);
      }
    }, (error) => {
      console.error("Error en Firebase onSnapshot:", error);
    });

    return () => unsub();
  }, []);

  // 3. Helper de actualización genérico (Escribe en React State optimista y luego en Firebase)
  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => {
      const mergedData = { ...prev, ...updates, lastModified: Date.now() };

      // 🐞 FIX CRÍTICO: Firebase odia las propiedades explícitamente "undefined" (ej. en incidentes de hielo)
      // y lanza un error TypeError SÍNCRONO que colapsa el re-render de React entero.
      // 1. Usamos JSON parse/stringify para omitir/purgar y limpiar mágicamente todos los nulls/undefined del árbol
      // 2. Lo metemos en un microtask para sacarlo de la vía crítica de renderizado de React
      Promise.resolve().then(() => {
        try {
          const cleanedData = JSON.parse(JSON.stringify(mergedData));
          setDoc(doc(db, FIREBASE_DOC_PATH), cleanedData).catch(err => {
            console.error("Error guardando datos en Firebase:", err);
          });
        } catch (e) {
          console.error("Error en sanitización previa a Firebase:", e);
        }
      });

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
