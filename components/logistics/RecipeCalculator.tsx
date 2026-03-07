import { useState, useMemo } from 'react';
import { ShoppingItem } from '../../types';
import { FALLA_RECIPES } from './recipes';
import { Calculator, Users, Plus, ChevronRight, UtensilsCrossed } from 'lucide-react';

interface Props {
    onAddShoppingItems: (items: Omit<ShoppingItem, 'id' | 'checked'>[]) => void;
}

export function RecipeCalculator({ onAddShoppingItems }: Props) {
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [peopleCount, setPeopleCount] = useState<number>(50);

    const selectedRecipe = useMemo(() => {
        return FALLA_RECIPES.find(r => r.id === selectedRecipeId) || null;
    }, [selectedRecipeId]);

    const calculatedIngredients = useMemo(() => {
        if (!selectedRecipe) return [];
        return selectedRecipe.ingredients.map(ing => ({
            ...ing,
            totalAmount: ing.amountPerPerson * peopleCount
        }));
    }, [selectedRecipe, peopleCount]);

    const handleAddToList = () => {
        if (!selectedRecipe) return;

        const itemsToAdd: Omit<ShoppingItem, 'id' | 'checked'>[] = calculatedIngredients.map(ing => ({
            name: `${ing.name} (Para ${selectedRecipe.name})`,
            quantity: Number(ing.totalAmount.toFixed(2)),
            unit: ing.unit,
            location: 'Sin asignar',
            priority: 'NORMAL',
            budgetCategory: 'Comida',
            isBought: false,
            notes: `Menú para ${peopleCount} personas`
        }));

        onAddShoppingItems(itemsToAdd);
        alert(`✅ ${itemsToAdd.length} ingredientes añadidos a la Lista de la Compra`);
    };

    if (!selectedRecipe) {
        return (
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <Calculator className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
                    <h3 className="text-xl font-black uppercase mb-2 relative z-10 flex items-center gap-2">
                        <UtensilsCrossed /> Calculadora de Menús
                    </h3>
                    <p className="text-indigo-100 font-medium relative z-10 text-sm max-w-[80%]">
                        Selecciona un plato típico fallero, indica cuántos vais a ser, y la app calculará automáticamente las cantidades exactas para comprar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FALLA_RECIPES.map(recipe => (
                        <button
                            key={recipe.id}
                            onClick={() => setSelectedRecipeId(recipe.id)}
                            className="bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-indigo-200 p-5 rounded-2xl flex items-start gap-4 transition-all text-left group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                                {recipe.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-800 text-lg">{recipe.name}</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1 mb-2 line-clamp-2">{recipe.description}</p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    Ver receta y cálculo <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
            {/* HEADER RECETA */}
            <div className="bg-slate-50 p-6 border-b border-slate-100">
                <button
                    onClick={() => setSelectedRecipeId(null)}
                    className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 hover:text-slate-600 mb-4 transition-colors"
                >
                    <ChevronRight size={14} className="rotate-180" /> Volver al catálogo
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-5xl drop-shadow-sm">{selectedRecipe.icon}</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{selectedRecipe.name}</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{selectedRecipe.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                {/* CONTROL COMENSALES */}
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">
                                Comensales
                            </p>
                            <h3 className="text-slate-900 font-black text-lg leading-none">
                                ¿Para cuántos cocinamos?
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border-2 border-indigo-100 w-full md:w-auto justify-center">
                        <button
                            onClick={() => setPeopleCount(Math.max(1, peopleCount - 5))}
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-rose-50 rounded-xl text-slate-600 font-black text-xl transition-colors"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={peopleCount}
                            onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 text-center font-black text-3xl text-indigo-600 bg-transparent outline-none focus:ring-0 p-0"
                        />
                        <button
                            onClick={() => setPeopleCount(peopleCount + 5)}
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 rounded-xl text-slate-600 font-black text-xl transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* LISTA INGREDIENTES */}
                <div className="mb-8">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Cantidades calculadas para {peopleCount} personas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {calculatedIngredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors bg-white">
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{ing.name}</p>
                                    <p className="text-[10px] uppercase font-black text-slate-400">{ing.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-indigo-600 text-lg">
                                        {ing.totalAmount < 0.1 ? ing.totalAmount.toFixed(3) : ing.totalAmount.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 ml-1">{ing.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                    onClick={handleAddToList}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                    Añadir todo a la Lista de la Compra
                </button>

            </div>
        </div>
    );
}
