import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { Transaction, TransactionType, BudgetLine, ShoppingItem } from '../types';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, AlertTriangle, Coins, PieChart as PieIcon, Calculator, Download, ShoppingCart, ArrowRight, Printer, Flame, Target, Trophy, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FinanceProps {
  transactions: Transaction[];
  budgetLimit: number;
  budgetLines: BudgetLine[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateBudget: (category: string, amount: number) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
}

export const FinanceModules: React.FC<FinanceProps> = ({ transactions, budgetLimit, budgetLines, onAddTransaction, onAddShoppingItem }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'entry' | 'audit' | 'budget' | 'stock' | 'purchase'>('overview');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');

  // Arqueo State
  const [cashCounts, setCashCounts] = useState<Record<string, number>>({
    '50': 0, '20': 0, '10': 0, '5': 0, '2': 0, '1': 0, '0.50': 0, '0.20': 0, '0.10': 0, '0.05': 0
  });

  // Stock Audit State
  const [auditItem, setAuditItem] = useState({ name: 'Cerveza', start: 100, end: 20, price: 1.5 });

  // Purchase Planner State
  const CATALOG = [
    { name: 'Barril Cerveza 50L', price: 90, unit: 'barriles' },
    { name: 'Botella Whisky', price: 12, unit: 'botellas' },
    { name: 'Botella Ginebra', price: 14, unit: 'botellas' },
    { name: 'Refresco Cola 2L', price: 1.80, unit: 'botellas' },
    { name: 'Saco Hielo 20kg', price: 6, unit: 'sacos' },
    { name: 'Vasos Tubo (500u)', price: 35, unit: 'cajas' },
  ];
  const [purchasePlan, setPurchasePlan] = useState<{ name: string, quantity: number, price: number }[]>([]);

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;
  const isOverBudget = totalExpense > budgetLimit;

  const handleAdd = (type: TransactionType) => {
    if (!desc || !amount) return;
    onAddTransaction({
      description: desc,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
      category
    });
    setDesc('');
    setAmount('');
  };

  const addToPlan = (item: typeof CATALOG[0]) => {
    setPurchasePlan([...purchasePlan, { name: item.name, quantity: 1, price: item.price }]);
  };

  const convertPlanToOrder = () => {
    purchasePlan.forEach(item => {
      onAddShoppingItem({
        name: item.name,
        quantity: item.quantity,
        unit: 'u',
        location: 'Por clasificar'
      });
    });
    setPurchasePlan([]);
    toast.success('Plan convertido a Pedido en Logística');
  };

  const downloadCSV = () => {
    const headers = ['Partida', 'Estimado', 'Real', 'Desviación'];
    const rows = budgetLines.map(line => {
      const realSpent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === line.category)
        .reduce((acc, t) => acc + t.amount, 0);
      return [line.category, line.estimated, realSpent, line.estimated - realSpent].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "presupuesto_fallas_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateCashTotal = () => {
    return Object.entries(cashCounts).reduce((acc: number, [denom, count]) => acc + (parseFloat(denom) * Number(count)), 0);
  };

  const cashTotal = calculateCashTotal();
  const discrepancy = cashTotal - balance;

  const unitsSold = auditItem.start - auditItem.end;
  const expectedRevenue = unitsSold * auditItem.price;

  // --- SEMANA FALLERA DASHBOARD LOGIC ---
  const isBreakEven = balance > 0 && totalIncome > 0;
  const roiPercentage = totalExpense === 0 ? 100 : (totalIncome / totalExpense) * 100;

  const forecast = React.useMemo(() => {
    if (transactions.length === 0) return { dailyBurn: 0, estimatedFinal: 0, daysElapsed: 0 };
    const dates = transactions.map(t => new Date(t.date).getTime());
    const minD = Math.min(...dates);
    const maxD = Math.max(...dates);
    const msInDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(1, (maxD - minD) / msInDay);
    const dailyBurn = totalExpense / daysElapsed;
    const remainingDays = Math.max(0, 5 - daysElapsed); // Fallas = 5 days
    const estimatedFinal = totalIncome - (totalExpense + (dailyBurn * remainingDays));
    return { dailyBurn, estimatedFinal, daysElapsed };
  }, [transactions, totalExpense, totalIncome]);

  const hourlyData = React.useMemo(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}h`, Ingresos: 0 }));
    transactions.filter(t => t.type === TransactionType.INCOME).forEach(t => {
      const h = new Date(t.date).getHours();
      data[h].Ingresos += t.amount;
    });
    return data;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Saldo en Caja</p>
              <h2 className="text-2xl font-bold text-gray-900">{balance.toFixed(2)}€</h2>
            </div>
            <Wallet className="text-green-500 h-8 w-8" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Gastos Totales</p>
              <h2 className="text-2xl font-bold text-gray-900">{totalExpense.toFixed(2)}€</h2>
            </div>
            <TrendingUp className="text-red-500 h-8 w-8" />
          </div>
        </div>
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${isOverBudget ? 'border-red-600 bg-red-50' : 'border-blue-500'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Techo de Gasto</p>
              <h2 className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>{budgetLimit}€</h2>
            </div>
            {isOverBudget && <AlertTriangle className="text-red-600 h-8 w-8" />}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-print">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><PieIcon size={16} /> Resumen</button>
        <button onClick={() => setActiveTab('entry')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'entry' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><PlusCircle size={16} /> Libro Diario</button>
        <button onClick={() => setActiveTab('purchase')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'purchase' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><ShoppingCart size={16} /> Compras</button>
        <button onClick={() => setActiveTab('budget')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'budget' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><TrendingUp size={16} /> Presupuesto</button>
        <button onClick={() => setActiveTab('audit')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'audit' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><Coins size={16} /> Arqueo</button>
        <button onClick={() => setActiveTab('stock')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'stock' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}><Calculator size={16} /> Auditoría Stock</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* BREAK-EVEN ALERT */}
          {isBreakEven && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <Trophy size={32} className="text-yellow-300" />
                <div>
                  <h3 className="font-black text-xl uppercase tracking-wider">¡Punto de Equilibrio Superado!</h3>
                  <p className="text-emerald-100 text-sm font-medium">La Falla ha cubierto todos los gastos de la semana. A partir de ahora es beneficio limpio.</p>
                </div>
              </div>
            </div>
          )}

          {/* TOP CONTROLS */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Flame className="text-orange-500" /> Dashboard Semana Fallera
            </h3>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow">
              <Printer size={16} /> Cierre Día 20 (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI SPEEDOMETER */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
              <h4 className="font-bold text-slate-600 mb-4 flex items-center gap-2"><Target size={18} /> Rentabilidad (ROI)</h4>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ name: 'ROI', value: roiPercentage }, { name: 'Resto', value: Math.max(0, 100 - roiPercentage) }]}
                      cx="50%" cy="100%" startAngle={180} endAngle={0}
                      innerRadius={80} outerRadius={120}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={roiPercentage >= 100 ? '#10b981' : roiPercentage > 75 ? '#f59e0b' : '#ef4444'} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-10">
                <p className={`text-4xl font-black ${roiPercentage >= 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {roiPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ingresos vs Gastos</p>
              </div>
            </div>

            {/* FORECAST */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <h4 className="font-bold text-slate-600 mb-6 flex items-center gap-2"><TrendingUp size={18} /> Proyección de Aterrizaje</h4>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500 font-medium">Ritmo de Gasto Diario</span>
                    <span className="font-bold text-rose-500">{forecast.dailyBurn.toFixed(2)}€ / día</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${Math.min(100, (forecast.dailyBurn / budgetLimit) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium mb-1">Estimación Saldo Final (Día 20)</p>
                  <p className={`text-3xl font-black ${forecast.estimatedFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {forecast.estimatedFinal > 0 ? '+' : ''}{forecast.estimatedFinal.toFixed(2)}€
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Basado en un evento de 5 días (Han pasado {forecast.daysElapsed.toFixed(1)} días)</p>
                </div>
              </div>
            </div>
          </div>

          {/* HEATMAP POR HORAS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:break-inside-avoid">
            <h4 className="font-bold text-slate-600 mb-6 flex items-center gap-2"><Clock size={18} /> Mapa de Calor: Horas de Mayor Ingreso</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'purchase' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Catálogo de Precios</h3>
            <div className="space-y-2">
              {CATALOG.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 cursor-pointer" onClick={() => addToPlan(item)}>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700">{item.price}€</span>
                    <PlusCircle size={20} className="text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Plan de Compra Actual</h3>
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-[300px]">
              {purchasePlan.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newPlan = [...purchasePlan];
                        newPlan[idx].quantity = parseInt(e.target.value);
                        setPurchasePlan(newPlan);
                      }}
                      className="w-16 p-1 border rounded text-center"
                    />
                    <button onClick={() => setPurchasePlan(purchasePlan.filter((_, i) => i !== idx))}><MinusCircle size={16} className="text-red-500" /></button>
                  </div>
                </div>
              ))}
              {purchasePlan.length === 0 && <p className="text-gray-400 italic text-center py-8">Selecciona productos del catálogo...</p>}
            </div>

            {purchasePlan.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total Estimado:</span>
                  <span className="text-2xl font-bold">{purchasePlan.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}€</span>
                </div>
                <button onClick={convertPlanToOrder} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                  Convertir a Pedido <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'entry' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Nueva Transacción</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input type="text" placeholder="Concepto" value={desc} onChange={e => setDesc(e.target.value)} className="flex-1 p-2 border rounded-lg" />
            <input type="number" placeholder="Importe" value={amount} onChange={e => setAmount(e.target.value)} className="w-32 p-2 border rounded-lg" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg">
              {budgetLines.map(line => (
                <option key={line.category} value={line.category}>{line.category}</option>
              ))}
              <option value="General">General</option>
              <option value="Cuota">Cuota</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleAdd(TransactionType.INCOME)} className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200">
              <PlusCircle size={20} /> Ingreso
            </button>
            <button onClick={() => handleAdd(TransactionType.EXPENSE)} className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">
              <MinusCircle size={20} /> Gasto
            </button>
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-gray-700 mb-2">Últimos Movimientos</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactions.slice().reverse().map(t => (
                <div key={t.id} className="flex justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-transparent hover:border-gray-300">
                  <div>
                    <p className="font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} - {t.category}</p>
                  </div>
                  <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount}€
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-orange-500" /> Control Presupuestario
            </h3>
            <button onClick={downloadCSV} className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200">
              <Download size={14} /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Partida</th>
                  <th className="px-4 py-3 text-right">Previsto</th>
                  <th className="px-4 py-3 text-right">Real</th>
                  <th className="px-4 py-3 text-center">Desviación</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines.map((line) => {
                  const realSpent = transactions
                    .filter(t => t.type === TransactionType.EXPENSE && t.category === line.category)
                    .reduce((acc, t) => acc + t.amount, 0);
                  const deviation = line.estimated - realSpent;
                  const isNegative = deviation < 0;

                  return (
                    <tr key={line.category} className="border-b">
                      <td className="px-4 py-3 font-medium text-gray-900">{line.category}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{line.estimated}€</td>
                      <td className="px-4 py-3 text-right font-bold">{realSpent}€</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isNegative ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {isNegative ? 'SOBRECOSTE' : 'AHORRO'} ({Math.abs(deviation)}€)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <Coins size={24} />
            <h3 className="text-xl font-bold">Calculadora de Arqueo</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Cuenta el dinero físico y comprueba si cuadra con el sistema.</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.keys(cashCounts).map((denom) => (
              <div key={denom} className="bg-gray-50 p-2 rounded text-center">
                <span className="block text-xs font-bold text-gray-500">{denom}€</span>
                <input
                  type="number"
                  min="0"
                  className="w-full text-center border-b border-gray-300 bg-transparent outline-none focus:border-orange-500"
                  value={cashCounts[denom]}
                  onChange={(e) => setCashCounts(prev => ({ ...prev, [denom]: parseInt(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-gray-500 text-sm">Total Contado</p>
              <p className="text-2xl font-bold text-gray-800">{cashTotal.toFixed(2)}€</p>
            </div>
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-gray-500 text-sm">Saldo en Sistema</p>
              <p className="text-2xl font-bold text-gray-800">{balance.toFixed(2)}€</p>
            </div>
            <div className={`p-3 rounded-lg ${Math.abs(discrepancy) < 0.05 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p className="text-xs font-bold uppercase">Desviación</p>
              <p className="text-xl font-bold">{discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}€</p>
              <p className="text-xs">{Math.abs(discrepancy) < 0.05 ? '¡Cuadra Perfecto!' : '¡Falta/Sobra dinero!'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Calculator size={24} />
            <h3 className="text-xl font-bold">Auditoría de Stock</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Calcula el dinero que debería haber según lo vendido.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-500">Producto</label>
              <input type="text" value={auditItem.name} onChange={e => setAuditItem({ ...auditItem, name: e.target.value })} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Stock Inicial</label>
              <input type="number" value={auditItem.start} onChange={e => setAuditItem({ ...auditItem, start: parseFloat(e.target.value) })} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Stock Final</label>
              <input type="number" value={auditItem.end} onChange={e => setAuditItem({ ...auditItem, end: parseFloat(e.target.value) })} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Precio Unit.</label>
              <input type="number" value={auditItem.price} onChange={e => setAuditItem({ ...auditItem, price: parseFloat(e.target.value) })} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-800">Unidades Vendidas</p>
              <p className="text-2xl font-bold text-blue-900">{unitsSold} u.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-800">Recaudación Esperada</p>
              <p className="text-3xl font-black text-blue-600">{expectedRevenue.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};