export interface RecipeIngredient {
    name: string;
    amountPerPerson: number;
    unit: string;
    category: string;
}

export interface FallaRecipe {
    id: string;
    name: string;
    description: string;
    icon: string;
    ingredients: RecipeIngredient[];
}

export const FALLA_RECIPES: FallaRecipe[] = [
    {
        id: 'paella-valenciana',
        name: 'Paella Valenciana',
        description: 'La auténtica receta para hacer a leña en la calle.',
        icon: '🥘',
        ingredients: [
            { name: 'Arroz bomba', amountPerPerson: 0.100, unit: 'kg', category: 'Comida' },
            { name: 'Pollo', amountPerPerson: 0.150, unit: 'kg', category: 'Comida' },
            { name: 'Conejo', amountPerPerson: 0.100, unit: 'kg', category: 'Comida' },
            { name: 'Bajoqueta (Judía plana)', amountPerPerson: 0.050, unit: 'kg', category: 'Comida' },
            { name: 'Garrofón', amountPerPerson: 0.025, unit: 'kg', category: 'Comida' },
            { name: 'Tomate triturado', amountPerPerson: 0.030, unit: 'L', category: 'Comida' },
            { name: 'Aceite de oliva virgen', amountPerPerson: 0.020, unit: 'L', category: 'Comida' },
            { name: 'Sal', amountPerPerson: 0.005, unit: 'kg', category: 'Comida' },
            { name: 'Pimentón dulce', amountPerPerson: 0.001, unit: 'kg', category: 'Comida' },
            { name: 'Azafrán / Colorante', amountPerPerson: 1, unit: 'sobres (cada 10p)', category: 'Comida' },
            { name: 'Agua', amountPerPerson: 0.350, unit: 'L', category: 'Comida' },
            { name: 'Leña de naranjo', amountPerPerson: 0.5, unit: 'kg', category: 'Material' },
        ]
    },
    {
        id: 'fideua',
        name: 'Fideuà de Gandia',
        description: 'Clásica fideuà de marisco para comer al medio día.',
        icon: '🍝',
        ingredients: [
            { name: 'Fideo nº 3 o 4', amountPerPerson: 0.100, unit: 'kg', category: 'Comida' },
            { name: 'Morralla (para caldo)', amountPerPerson: 0.150, unit: 'kg', category: 'Comida' },
            { name: 'Gambón / Langostino', amountPerPerson: 2, unit: 'unidades', category: 'Comida' },
            { name: 'Cigalas', amountPerPerson: 1, unit: 'unidades', category: 'Comida' },
            { name: 'Sepia troceada', amountPerPerson: 0.100, unit: 'kg', category: 'Comida' },
            { name: 'Tomate triturado', amountPerPerson: 0.025, unit: 'L', category: 'Comida' },
            { name: 'Ajo', amountPerPerson: 0.25, unit: 'dientes', category: 'Comida' },
            { name: 'Pimentón dulce', amountPerPerson: 0.001, unit: 'kg', category: 'Comida' },
            { name: 'Aceite de oliva virgen', amountPerPerson: 0.025, unit: 'L', category: 'Comida' },
            { name: 'Sal', amountPerPerson: 0.005, unit: 'kg', category: 'Comida' },
            { name: 'Limones (para adornar)', amountPerPerson: 0.1, unit: 'unidades', category: 'Comida' },
        ]
    },
    {
        id: 'torra',
        name: 'Torrà de Embutido y Carne',
        description: 'Calculadora para las famosas cenas de sobaquillo y barbacoa.',
        icon: '🔥',
        ingredients: [
            { name: 'Longanizas', amountPerPerson: 2, unit: 'unidades', category: 'Comida' },
            { name: 'Chorizos', amountPerPerson: 1, unit: 'unidades', category: 'Comida' },
            { name: 'Morcillas de cebolla', amountPerPerson: 1, unit: 'unidades', category: 'Comida' },
            { name: 'Panceta troceada', amountPerPerson: 0.100, unit: 'kg', category: 'Comida' },
            { name: 'Chuletas de cerdo', amountPerPerson: 1, unit: 'unidades', category: 'Comida' },
            { name: 'Pan de pataqueta/barra', amountPerPerson: 0.5, unit: 'barras', category: 'Comida' },
            { name: 'Carbón', amountPerPerson: 0.3, unit: 'kg', category: 'Material' },
            { name: 'Pastillas de encendido', amountPerPerson: 0.1, unit: 'pastillas', category: 'Material' }
        ]
    },
    {
        id: 'agua-de-valencia',
        name: 'Agua de Valencia',
        description: 'El cóctel valenciano por excelencia para las fiestas.',
        icon: '🥂',
        ingredients: [
            { name: 'Zumo de naranja (natural)', amountPerPerson: 0.150, unit: 'L', category: 'Bebida' },
            { name: 'Cava (Semi-seco o Brut)', amountPerPerson: 0.150, unit: 'L', category: 'Bebida' },
            { name: 'Ginebra', amountPerPerson: 0.030, unit: 'L', category: 'Bebida' },
            { name: 'Vodka', amountPerPerson: 0.030, unit: 'L', category: 'Bebida' },
            { name: 'Azúcar', amountPerPerson: 0.020, unit: 'kg', category: 'Bebida' },
            { name: 'Hielo', amountPerPerson: 0.200, unit: 'kg', category: 'Bebida' },
        ]
    },
    {
        id: 'choco-churros',
        name: 'Chocolate con Churros',
        description: 'Imprescindible para las mañanas de despertà.',
        icon: '☕',
        ingredients: [
            { name: 'Chocolate a la taza (polvo/tableta)', amountPerPerson: 0.050, unit: 'kg', category: 'Comida' },
            { name: 'Leche entera', amountPerPerson: 0.250, unit: 'L', category: 'Comida' },
            { name: 'Churros / Buñuelos', amountPerPerson: 4, unit: 'unidades', category: 'Comida' },
            { name: 'Azúcar', amountPerPerson: 0.010, unit: 'kg', category: 'Comida' }
        ]
    }
];
