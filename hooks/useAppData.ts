
import { useState, useEffect, useCallback } from 'react';
import { AppData, DEFAULT_DATA, UserRole, Transaction, TransactionType } from '../types';

export const useAppData = () => {
  // 1. Inicialización Lazy del Estado
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem('merello_app_data');
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch (e) {
      console.error("Error cargando datos", e);
      return DEFAULT_DATA;
    }
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // 2. Persistencia Optimista (Debounced podría añadirse aquí si fuera necesario)
  useEffect(() => {
    localStorage.setItem('merello_app_data', JSON.stringify(data));
  }, [data]);

  // 3. Helper de actualización genérico
  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates, lastModified: Date.now() }));
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

    // Acciones Complejas
    actions: {
      handleMarkOrderReceived,
      handleShoppingToggle,
      resetModule
    }
  };
};
