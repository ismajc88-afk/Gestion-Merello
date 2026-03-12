
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

export interface CustomPermission {
  userId: string;
  extraModules: string[];
}

export interface BarPrice {
  name: string;
  price: number;
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
  stockCategories: string[];
  units: string[];
  locations: string[];
  hapticPattern: number[];
  ntfyTopic?: string;
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
  isBarInvestment?: boolean;
}

export interface BudgetLine {
  category: string;
  estimated: number;
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
  category: string;
  location: string;
  lastUpdated: string;
  costPerUnit: number;
  expirationDate?: string;
  supplier?: string;
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
    stockCategories: ['BEBIDA', 'COMIDA', 'SUMINISTROS'],
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
  kioskStatus: {
    VENTA: 'NORMAL',
    CASAL: 'NORMAL'
  }
};

// Escudo Falla Eduardo Merello
export const ESCUDO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgNjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZkNzAwIi8+PHN0b3Agb2ZZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y1OWUwYiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0ZXh0IHg9IjQwIiB5PSI1MjAiIGZvbnQtc2l6ZT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiM5M2M1ZmQiIHN0cm9rZT0iIzFlNDBhZiIgc3Ryb2tlLXdpZHRoPSI0Ij5NPC90ZXh0Pjx0ZXh0IHg9IjM0MCIgeT0iNTIwIiBmb250LXNpemU9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXN0eWxlPSJub3JtYWwiIGZvbnQtd2VpZ2h0PSI5MDAiIGZpbGw9IiM5M2M1ZmQiIHN0cm9rZT0iIzFlNDBhZiIgc3Ryb2tlLXdpZHRoPSI0Ij5QPC90ZXh0Pjwvc3ZnPg==";

export interface PlanItem {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'CASAL' | 'BAR';
  items: PlanItem[];
  status: 'DRAFT' | 'READY';
  updatedAt: string;
}
