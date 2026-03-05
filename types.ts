
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum ShiftTime {
  MORNING = 'Mañana (10:00 - 15:00)',
  AFTERNOON = 'Tarde (15:00 - 20:00)',
  NIGHT = 'Noche (20:00 - 02:00)'
}

export type UserRole = 'ADMIN' | 'PRESIDENTE' | 'TESORERIA' | 'LOGISTICA' | 'BARRA' | 'CAMARERO' | 'CAJERO' | 'FALLERO' | 'KIOSKO_VENTA' | 'KIOSKO_CASAL';

export interface BarPriceRecipeItem {
  stockItemId: string;
  stockItemName: string;
  quantity: number;
}

export interface BarPrice {
  name: string;
  price: number;
  recipe?: BarPriceRecipeItem[];
}

export interface ModuleDefinition {
  id: string;
  label: string;
  section: string;
}

export const ALL_MODULES: ModuleDefinition[] = [
  // Economía
  { id: 'dashboard', label: 'Inicio / Panel', section: 'General' },
  { id: 'help', label: 'Ayuda', section: 'General' },
  { id: 'ai', label: 'Asistente Merello AI', section: 'General' },
  { id: 'inventory', label: 'Presupuesto', section: 'Economía' },
  { id: 'cash', label: 'Tesorería', section: 'Economía' },
  { id: 'reports', label: 'Informes', section: 'Economía' },
  { id: 'bar-profit', label: 'Cierre de Caja', section: 'Economía' },
  // Logística
  { id: 'purchase', label: 'Pedidos', section: 'Logística' },
  { id: 'shopping', label: 'Lista Compra', section: 'Logística' },
  { id: 'stock', label: 'Stock', section: 'Logística' },
  { id: 'suppliers', label: 'Proveedores', section: 'Logística' },
  // Operativa
  { id: 'work-groups', label: 'Grupos Trabajo', section: 'Operativa' },
  { id: 'logistics', label: 'Tareas', section: 'Operativa' },
  { id: 'bar', label: 'Turnos Barra', section: 'Operativa' },
  { id: 'meals', label: 'Cocina / Menús', section: 'Operativa' },
  { id: 'hr', label: 'Censo Falleros', section: 'Operativa' },
  // Utilidades
  { id: 'tools', label: 'Calculadoras', section: 'Utilidades' },
  { id: 'kiosk', label: 'Modo Kiosko', section: 'Utilidades' },
  { id: 'settings-master', label: 'Ajustes Admin', section: 'Utilidades' },
];

export interface ModulePermissions {
  canView: boolean;
  canEdit: boolean;
  canViewSensitive: boolean;
}

export const createPerm = (canView = true, canEdit = true, canViewSensitive = true): ModulePermissions => ({
  canView, canEdit, canViewSensitive
});

export const generatePermsMap = (allowedIds: string[], readOnlyIds: string[] = [], noSensitiveIds: string[] = []): Record<string, ModulePermissions> => {
  const map: Record<string, ModulePermissions> = {};
  ALL_MODULES.forEach(m => {
    // If list of allowed is exactly ALL_IDS, then `canView` is true for everything.
    // Otherwise, check if it's in the allowed list.
    const isAllowed = allowedIds.length === ALL_MODULES.length || allowedIds.includes(m.id);
    map[m.id] = {
      canView: isAllowed,
      canEdit: isAllowed && !readOnlyIds.includes(m.id),
      canViewSensitive: isAllowed && !noSensitiveIds.includes(m.id)
    };
  });
  return map;
}

const ALL_IDS = ALL_MODULES.map(m => m.id);

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Record<string, ModulePermissions>> = {
  ADMIN: generatePermsMap(ALL_IDS),
  PRESIDENTE: generatePermsMap(ALL_IDS.filter(id => id !== 'kiosk')),
  TESORERIA: generatePermsMap(['dashboard', 'help', 'inventory', 'cash', 'reports', 'bar-profit', 'ai']),
  LOGISTICA: generatePermsMap(['dashboard', 'help', 'stock', 'purchase', 'shopping', 'suppliers', 'logistics', 'work-groups', 'kiosk', 'ai']),
  BARRA: generatePermsMap(['dashboard', 'help', 'bar', 'stock', 'bar-profit', 'logistics']),
  CAMARERO: generatePermsMap(['kiosk']),
  CAJERO: generatePermsMap(['kiosk']),
  FALLERO: generatePermsMap(['dashboard', 'help', 'bar', 'work-groups', 'logistics', 'meals']),
  KIOSKO_VENTA: generatePermsMap(['kiosk']),
  KIOSKO_CASAL: generatePermsMap(['kiosk']),
};

export interface BasicItem {
  name: string;
  quantity: number;
  unit: string;
  location: string;
}

export interface AppConfig {
  eventName: string;
  year: number;
  startDate: string;
  endDate: string;
  pins: Record<UserRole, string>;
  budgetCategories: string[];
  barPrices: BarPrice[];
  shiftLabels: Record<string, string>;
  supplierCategories: string[];
  stockCategories: string[]; // List of active category IDs
  stockCategoryDefs?: StockCategoryDef[]; // List of all category definitions (predefined + custom)
  units: string[];
  locations: string[];
  hapticPattern: number[];
  ntfyTopic?: string;
  rolePermissions?: Record<UserRole, Record<string, ModulePermissions>>;
  dashboardKpis?: string[];
  basicItems?: BasicItem[];
}

export interface Member {
  id: string;
  name: string;
  paid: boolean;
  role: string;
  accessRole: UserRole;
  allergies: string[];
  skills?: string[];
  emergencyContact?: string;
  notes?: string;
  isPresent?: boolean;
  qrCodeValue?: string;
  preferences?: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
}

export interface WorkGroupTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface WorkGroup {
  id: string;
  date: string;
  name: string;
  responsibleId: string;
  memberIds: string[];
  tasks: WorkGroupTask[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  subCategory?: string;
  isBarInvestment?: boolean;
}

export interface SubBudgetLine {
  name: string;
  estimated: number;
}

export interface BudgetLine {
  category: string;
  estimated: number;
  subLines?: SubBudgetLine[];
}

export type AuditActionType =
  | 'GASTO_AÑADIDO' | 'INGRESO_AÑADIDO'
  | 'PARTIDA_CREADA' | 'PARTIDA_EDITADA' | 'PARTIDA_ELIMINADA'
  | 'PRESUPUESTO_MODIFICADO'
  | 'SUBPARTIDA_CREADA' | 'SUBPARTIDA_ELIMINADA'
  | 'STOCK_ACTUALIZADO'
  | 'PRODUCTO_AÑADIDO' | 'PRODUCTO_EDITADO' | 'PRODUCTO_ELIMINADO' | 'PEDIDO_MÍNIMO'
  | 'CONFIG_CAMBIADA'
  | 'LOGÍSTICA_ENVÍO' | 'LOGÍSTICA_ENTREGA';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  action: AuditActionType;
  module: string;
  detail: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  location: string;
  isBought?: boolean;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  budgetCategory?: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
  category: string; // The ID of the primary category
  subCategory?: string; // The ID of the subcategory
  location: string;
  lastUpdated: string;
  costPerUnit: number;
  expirationDate?: string;
  supplier?: string;
  usageType: 'CASAL' | 'VENTA';
  dailyLimit?: number;
  imageUrl?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  assigneeId?: string;
  status: TaskStatus;
  isCompleted: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: string;
  tags?: string[];
  subtasks?: SubTask[];
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  contactPerson?: string;
  cif?: string;
}

export interface StockSubCategory {
  id: string;
  name: string;
}

export interface StockCategoryDef {
  id: string;
  name: string;
  icon?: string;
  subcategories: StockSubCategory[];
}

export const PREDEFINED_STOCK_CATEGORIES: StockCategoryDef[] = [
  {
    id: 'BEBIDAS',
    name: 'Bebidas',
    icon: 'Beer',
    subcategories: [
      { id: 'REFRESCOS', name: 'Refrescos' },
      { id: 'CERVEZAS', name: 'Cervezas' },
      { id: 'LICORES', name: 'Licores y Alcoholes' },
      { id: 'AGUA', name: 'Agua' },
      { id: 'ZUMOS', name: 'Zumos' },
    ]
  },
  {
    id: 'CAFETERIA',
    name: 'Cafetería',
    icon: 'Coffee',
    subcategories: [
      { id: 'CAFE', name: 'Café (Grano/Molido/Cápsulas)' },
      { id: 'LECHE', name: 'Leche y Bebidas Vegetales' },
      { id: 'AZUCAR', name: 'Azúcar y Edulcorantes' },
      { id: 'INFUSIONES', name: 'Infusiones y Tés' },
      { id: 'CACAO', name: 'Cacao en Polvo' },
    ]
  },
  {
    id: 'ALIMENTACION',
    name: 'Alimentación y Snacks',
    icon: 'Utensils',
    subcategories: [
      { id: 'SNACKS', name: 'Snacks Salados (Patatas, Cacaos, Olivas)' },
      { id: 'PAN', name: 'Pan y Picatostes' },
      { id: 'EMBUTIDO', name: 'Embutidos y Quesos' },
      { id: 'SALSAS', name: 'Salsas y Condimentos' },
      { id: 'CONSERVAS', name: 'Conservas' },
    ]
  },
  {
    id: 'CARNES_GUISOS',
    name: 'Carnes y Guisos',
    icon: 'Drumstick',
    subcategories: [
      { id: 'CARNE_TORRA', name: 'Carne para Torraes' },
      { id: 'INGREDIENTES_PAELLA', name: 'Ingredientes Paella' },
      { id: 'VERDURAS', name: 'Verduras Frescas' },
      { id: 'ACEITE_SAL', name: 'Aceite, Sal y Especias' },
    ]
  },
  {
    id: 'DULCES',
    name: 'Dulces y Meriendas',
    icon: 'Cake',
    subcategories: [
      { id: 'BOLLERIA', name: 'Bollería y Fartons' },
      { id: 'CHOCOLATE', name: 'Chocolate a la Taza' },
      { id: 'HORCHATA', name: 'Horchata' },
      { id: 'GOMINOLAS', name: 'Gominolas / Infantil' },
    ]
  },
  {
    id: 'LIMPIEZA',
    name: 'Limpieza e Higiene',
    icon: 'Sparkles',
    subcategories: [
      { id: 'PRODUCTOS_QUIMICOS', name: 'Lejía, Friegasuelos, Multiusos' },
      { id: 'BOLSAS_BASURA', name: 'Bolsas de Basura' },
      { id: 'UTILES_LIMPIEZA', name: 'Estropajos, Bayetas, Fregonas' },
      { id: 'PAPEL_HIGIENICO', name: 'Papel Higiénico y Toallas Mano' },
      { id: 'JABON', name: 'Jabón de Manos / Lavavajillas' },
    ]
  },
  {
    id: 'MENAJE',
    name: 'Menaje y Desechables',
    icon: 'CupSoda',
    subcategories: [
      { id: 'VASOS_PLASTICO', name: 'Vasos Plástico / Cartón' },
      { id: 'PLATOS_CUBIERTOS', name: 'Platos y Cubiertos' },
      { id: 'SERVILLETAS', name: 'Servilletas y Manteles' },
      { id: 'RECIPIENTES', name: 'Tupper y Bandejas Alumino' },
    ]
  },
  {
    id: 'PAPELERIA_EVENTOS',
    name: 'Papelería y Eventos',
    icon: 'Ticket',
    subcategories: [
      { id: 'TICKETS', name: 'Tickets Dúplex y Matrices' },
      { id: 'PULSERAS', name: 'Pulseras Acceso' },
      { id: 'OFICINA', name: 'Bolígrafos, Folios, Rotuladores' },
      { id: 'CINTAS', name: 'Cinta Aislante / Americana' },
    ]
  },
  {
    id: 'PIROTECNIA',
    name: 'Pirotecnia',
    icon: 'Flame',
    subcategories: [
      { id: 'TRACAS', name: 'Tracas' },
      { id: 'PETARDOS', name: 'Cajas de Petardos' },
      { id: 'MECHAS', name: 'Mechas' },
    ]
  },
  {
    id: 'DECORACION',
    name: 'Decoración e Infraestructura',
    icon: 'Palette',
    subcategories: [
      { id: 'BANDERINES', name: 'Banderines y Guirnaldas' },
      { id: 'GLOBOS', name: 'Globos' },
      { id: 'TELAS', name: 'Telas y Corcho' },
      { id: 'ILUMINACION', name: 'Bombillas, Regletas, Alargadores' },
    ]
  },
  {
    id: 'BOTIQUIN',
    name: 'Botiquín',
    icon: 'Cross',
    subcategories: [
      { id: 'CURAS', name: 'Tiritas, Vendas, Agua Oxigenada' },
      { id: 'ANALGESICOS', name: 'Analgésicos Básicos' },
      { id: 'QUEMADURAS', name: 'Cremas Quemaduras' },
    ]
  },
  {
    id: 'OTROS',
    name: 'Otros',
    icon: 'Box',
    subcategories: [
      { id: 'HIELO', name: 'Hielo' },
      { id: 'COMBUSTIBLE', name: 'Butano, Leña, Carbón' },
      { id: 'INDUMENTARIA', name: 'Merchandising, Polares, Pañuelos' },
      { id: 'VARIO', name: 'Varios' },
    ]
  }
];

export interface Order {
  id: string;
  title: string;
  supplierName: string;
  estimatedCost: number;
  status: 'PENDING' | 'RECEIVED';
  items: { name: string; quantity: number }[];
  date: string;
  orderType?: 'CASAL' | 'BAR';
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  unit: string;
}

export interface Ingredient {
  id: string;
  name: string;
  qtyPerPerson: number;
  unit: string;
  pricePerUnit: number;
  auditResult?: string;
  auditLevel?: number;
}

export interface MealEvent {
  id: string;
  date: string;
  type: 'LUNCH' | 'DINNER' | 'SNACK';
  name: string;
  attendeeIds: string[];
  title: string;
  ingredients: Ingredient[];
}

export interface Incident {
  id: string;
  title: string;
  status: 'OPEN' | 'RESOLVED' | 'ARCHIVED' | 'PENDING_DELIVERY' | 'DELIVERED' | 'CONFIRMED' | 'PENDING_APPROVAL';
  priority: 'URGENT' | 'NORMAL';
  timestamp: string;
  stockItemId?: string;
  quantity?: number;
  terminal?: 'VENTA' | 'CASAL';
  requestedBy?: UserRole; // Quién lo solicitó
  deliveredBy?: UserRole; // Quién lo entregó
  deliveredAt?: string; // Cuándo se marcó como entregado
  confirmedBy?: UserRole; // Quién confirmó la recepción
  confirmedAt?: string; // Cuándo se confirmó
  justification?: string; // Motivo si excede cupo
  requiresAuthorization?: boolean; // Si necesita aprobación especial
  authorizedBy?: UserRole; // Quién autorizó (PRESIDENTE/ADMIN)
  authorizedAt?: string; // Cuándo se autorizó
}

export interface KioskConfig {
  alcoholItems: string[];
  mixerItems: string[];
  cupItems: string[];
}

export interface BarConsumption {
  stockItemId: string;
  name: string;
  quantity: number;
  costAtMoment: number;
}

// Nueva interfaz para ticket individual en cola
export interface TicketItem {
  id: string;
  name: string; // "Copa", "Cerveza", etc.
  price: number;
  timestamp: string;
  status: 'PENDING' | 'SERVED';
}

export interface BarSession {
  id: string;
  date: string;
  revenue: number;
  consumptions: BarConsumption[];
  staffExpenses: number;
  otherExpenses: number;
  isClosed: boolean;
  notes?: string;
  ticketCounts?: Record<string, number>; // Contabilización de tickets vendidos/servidos
  ticketQueue?: TicketItem[];
  dispensedCounts?: Record<string, number>; // NUEVO: Contabilización de lo servido por camareros (para cuadrar con tickets vendidos)
}

export interface Shift {
  id: string;
  date: string;
  time: string;
  assignedMembers: string[];
}

export type KioskWorkload = 'BAJA' | 'NORMAL' | 'ALTA';

export interface AppData {
  [key: string]: any;
  appConfig: AppConfig;
  members: Member[];
  transactions: Transaction[];
  tasks: Task[];
  shoppingList: ShoppingItem[];
  orders: Order[];
  shifts: Shift[];
  suppliers: Supplier[];
  budgetLimit: number;
  budgetLines: BudgetLine[];
  mealEvents: MealEvent[];
  incidents: Incident[];
  stock: StockItem[];
  kioskConfig: KioskConfig;
  barSessions: BarSession[];
  catalog: CatalogItem[];
  workGroups: WorkGroup[];
  auditLog: AuditLogEntry[];
  kioskStatus: {
    VENTA: KioskWorkload;
    CASAL: KioskWorkload;
  };
  lastModified?: number;
}

export interface AppState {
  items: { forecastAmount: number; actualAmount: number }[];
  settings: { year: number; eventName: string; totalGlobalBudget: number };
  cashTransactions: { type: 'IN' | 'OUT'; amount: number; date: string; description: string }[];
  mealEvents: MealEvent[];
  shoppingList: (ShoppingItem & { isBought: boolean })[];
  tasks: (Task & { isCompleted: boolean; dueDate?: string })[];
  deliveries: { id: string; expectedDate: string; received: boolean; description: string }[];
  suppliers: Supplier[];
  attendees: Member[];
  shifts: Shift[];
  incidents: Incident[];
}

export const DEFAULT_DATA: AppData = {
  appConfig: {
    eventName: 'Fallas 2026',
    year: 2026,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    pins: {
      ADMIN: '1234',
      PRESIDENTE: '1234',
      TESORERIA: '1234',
      LOGISTICA: '1234',
      BARRA: '1234',
      CAMARERO: '1234',
      CAJERO: '1234',
      FALLERO: '0000',
      KIOSKO_VENTA: '2026',
      KIOSKO_CASAL: '1111'
    },
    budgetCategories: ['Infraestructura', 'Comida', 'Bebida', 'Música', 'Varios'],
    barPrices: [
      { name: 'Cerveza', price: 1.5 },
      { name: 'Refresco', price: 1.5 },
      { name: 'Copa', price: 5.0 },
      { name: 'Agua', price: 1.0 },
      { name: 'Chupito', price: 1.0 }
    ],
    shiftLabels: {
      [ShiftTime.MORNING]: 'Mañana',
      [ShiftTime.AFTERNOON]: 'Tarde',
      [ShiftTime.NIGHT]: 'Noche'
    },
    supplierCategories: ['Bebida', 'Comida', 'Servicios'],
    stockCategories: ['BEBIDAS', 'CAFETERIA', 'ALIMENTACION', 'LIMPIEZA', 'MENAJE', 'PAPELERIA_EVENTOS', 'PIROTECNIA'],
    stockCategoryDefs: PREDEFINED_STOCK_CATEGORIES,
    units: ['u', 'kg', 'L', 'cajas'],
    locations: ['Barra', 'Cocina', 'Almacén'],
    hapticPattern: [200, 100, 200],
    ntfyTopic: 'merello-planner-2026-global-alerts'
  },
  members: [],
  transactions: [],
  tasks: [],
  shoppingList: [],
  orders: [],
  shifts: [],
  suppliers: [],
  budgetLimit: 10000,
  budgetLines: [],
  mealEvents: [],
  incidents: [],
  stock: [],
  kioskConfig: {
    alcoholItems: ['Ginebra', 'Ron', 'Whisky', 'Vodka'],
    mixerItems: ['Cola', 'Limón', 'Naranja', 'Tónica'],
    cupItems: ['Vaso Tubo', 'Vaso Sidra', 'Vaso Chupito']
  },
  barSessions: [],
  catalog: [],
  workGroups: [],
  auditLog: [],
  kioskStatus: {
    VENTA: 'NORMAL',
    CASAL: 'NORMAL'
  }
};

// Escudo Falla Eduardo Merello
export const ESCUDO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZkNzAwIi8+PHN0b3Agb2ZZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y1OWUwYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0ZXh0IHg9IjQwIiB5PSI1MjAiIGZvbnQtc2l6ZT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiM5M2M1ZmQiIHN0cm9rZT0iIzFlNDBhZiIgc3Ryb2tlLXdpZHRoPSI0Ij5NPC90ZXh0Pjx0ZXh0IHg9IjM0MCIgeT0iNTIwIiBmb250LXNpemU9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXN0eWxlPSJub3JtYWwiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiM5M2M1ZmQiIHN0cm9rZT0iIzFlNDBhZiIgc3Ryb2tlLXdpZHRoPSI0Ij5QPC90ZXh0Pjwvc3ZnPg==";
