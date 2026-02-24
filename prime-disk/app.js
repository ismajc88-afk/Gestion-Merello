/**
 * MoneyMaster Pro - Enterprise Application
 * Main Application Controller
 */

// ===================================
// GLOBAL STATE
// ===================================
const AppState = {
    currentPage: 'dashboard',
    transactions: [],
    accounts: [],
    categories: {
        income: [
            { id: 'salary', name: 'Salario', icon: '💼' },
            { id: 'freelance', name: 'Freelance', icon: '💻' },
            { id: 'investments', name: 'Inversiones', icon: '📈' },
            { id: 'business', name: 'Negocio', icon: '🏢' },
            { id: 'other-income', name: 'Otros Ingresos', icon: '💰' }
        ],
        expense: [
            { id: 'housing', name: 'Vivienda', icon: '🏠' },
            { id: 'food', name: 'Alimentación', icon: '🍔' },
            { id: 'transport', name: 'Transporte', icon: '🚗' },
            { id: 'entertainment', name: 'Entretenimiento', icon: '🎬' },
            { id: 'shopping', name: 'Compras', icon: '🛍️' },
            { id: 'health', name: 'Salud', icon: '⚕️' },
            { id: 'education', name: 'Educación', icon: '📚' },
            { id: 'utilities', name: 'Servicios', icon: '💡' },
            { id: 'subscriptions', name: 'Suscripciones', icon: '📱' },
            { id: 'insurance', name: 'Seguros', icon: '🛡️' },
            { id: 'other-expense', name: 'Otros Gastos', icon: '📦' }
        ]
    },
    budgets: {},
    goals: [],
    settings: {
        currency: 'EUR',
        theme: 'dark',
        language: 'es'
    },
    filters: {
        search: '',
        category: 'all',
        type: 'all',
        account: 'all',
        dateFrom: null,
        dateTo: null
    }
};

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 MoneyMaster Pro iniciando...');

    loadDataFromStorage();
    initializeSidebar();
    initializeNavigation();
    initializeEventListeners();
    initializeHeader();
    updateAllViews();

    console.log('✅ MoneyMaster Pro listo');
});

// ===================================
// DATA MANAGEMENT
// ===================================
function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem('moneymaster_pro_data');
        if (stored) {
            const data = JSON.parse(stored);
            AppState.transactions = data.transactions || [];
            AppState.accounts = data.accounts || [];
            AppState.budgets = data.budgets || {};
            AppState.goals = data.goals || [];
            AppState.settings = data.settings || AppState.settings;
            console.log(`📦 Cargados ${AppState.transactions.length} transacciones`);
        } else {
            initializeDemoData();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        initializeDemoData();
    }
}

function saveDataToStorage() {
    try {
        const data = {
            transactions: AppState.transactions,
            accounts: AppState.accounts,
            budgets: AppState.budgets,
            goals: AppState.goals,
            settings: AppState.settings
        };
        localStorage.setItem('moneymaster_pro_data', JSON.stringify(data));
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
}

function initializeDemoData() {
    console.log('📝 Inicializando datos de demostración...');

    // Cuentas
    AppState.accounts = [
        { id: 'checking', name: 'Cuenta Corriente', type: 'checking', balance: 5420, currency: 'EUR', icon: '🏦' },
        { id: 'savings', name: 'Cuenta Ahorro', type: 'savings', balance: 12500, currency: 'EUR', icon: '💰' },
        { id: 'credit', name: 'Tarjeta Crédito', type: 'credit', balance: -1250, currency: 'EUR', icon: '💳' },
        { id: 'investment', name: 'Inversiones', type: 'investment', balance: 25800, currency: 'EUR', icon: '📈' }
    ];

    // Transacciones (últimos 60 días)
    const today = new Date();
    AppState.transactions = [];

    for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Ingresos (2 veces al mes)
        if (i % 15 === 0 || i % 15 === 1) {
            AppState.transactions.push({
                id: generateId(),
                type: 'income',
                amount: 2500 + Math.random() * 500,
                category: i % 30 === 0 ? 'salary' : 'freelance',
                account: 'checking',
                description: i % 30 === 0 ? 'Salario mensual' : 'Proyecto freelance',
                date: dateStr,
                currency: 'EUR',
                notes: ''
            });
        }

        // Gastos (varios al día)
        const numExpenses = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < numExpenses; j++) {
            const expenseCategories = ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'subscriptions'];
            const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
            const accounts = ['checking', 'credit'];

            AppState.transactions.push({
                id: generateId(),
                type: 'expense',
                amount: Math.random() * 150 + 10,
                category,
                account: accounts[Math.floor(Math.random() * accounts.length)],
                description: getRandomExpenseDescription(category),
                date: dateStr,
                currency: 'EUR',
                notes: ''
            });
        }
    }

    // Ordenar por fecha descendente
    AppState.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Presupuestos
    AppState.budgets = {
        food: 600,
        transport: 250,
        entertainment: 200,
        shopping: 350,
        utilities: 180,
        subscriptions: 100,
        health: 150
    };

    // Metas
    AppState.goals = [
        { id: 'vacation', name: 'Vacaciones 2026', target: 3000, current: 1850, deadline: '2026-07-01', category: 'travel', icon: '✈️' },
        { id: 'emergency', name: 'Fondo de Emergencia', target: 10000, current: 7200, deadline: '2026-12-31', category: 'savings', icon: '🛡️' },
        { id: 'car', name: 'Coche Nuevo', target: 15000, current: 4500, deadline: '2027-06-01', category: 'purchase', icon: '🚗' },
        { id: 'course', name: 'Curso Profesional', target: 1500, current: 950, deadline: '2026-09-01', category: 'education', icon: '📚' }
    ];

    saveDataToStorage();
}

function getRandomExpenseDescription(category) {
    const descriptions = {
        food: ['Supermercado Carrefour', 'Restaurante La Tasca', 'Mercadona', 'Deliveroo', 'Cafetería', 'Comida rápida'],
        transport: ['Gasolina BP', 'Metro mensual', 'Uber', 'Parking centro', 'Peaje autopista'],
        entertainment: ['Netflix', 'Spotify', 'Cine', 'Teatro', 'Concierto', 'Videojuegos Steam'],
        shopping: ['Zara', 'Amazon', 'El Corte Inglés', 'IKEA', 'Fnac'],
        utilities: ['Electricidad Endesa', 'Agua', 'Internet Movistar', 'Teléfono móvil'],
        subscriptions: ['Netflix', 'Spotify Premium', 'Amazon Prime', 'HBO Max', 'Gym'],
        health: ['Farmacia', 'Dentista', 'Seguro médico', 'Óptica']
    };

    const options = descriptions[category] || ['Gasto varios'];
    return options[Math.floor(Math.random() * options.length)];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ===================================
// NAVIGATION
// ===================================
function initializeSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobileMenuBtn');

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

function navigateToPage(pageName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`)?.classList.add('active');

    // Update header title
    updatePageTitle(pageName);

    // Update content
    AppState.currentPage = pageName;
    updateCurrentPageContent();

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('active');
}

function updatePageTitle(pageName) {
    const titles = {
        dashboard: { title: 'Dashboard Ejecutivo', subtitle: 'Resumen financiero en tiempo real' },
        transactions: { title: 'Transacciones', subtitle: 'Gestión completa de movimientos' },
        accounts: { title: 'Cuentas', subtitle: 'Administración de cuentas bancarias' },
        budgets: { title: 'Presupuestos', subtitle: 'Control de gastos por categoría' },
        goals: { title: 'Metas Financieras', subtitle: 'Objetivos de ahorro y planificación' },
        reports: { title: 'Reportes', subtitle: 'Informes financieros profesionales' },
        analytics: { title: 'Análisis', subtitle: 'Visualizaciones y métricas avanzadas' },
        settings: { title: 'Configuración', subtitle: 'Preferencias y ajustes' }
    };

    const pageTitle = document.getElementById('pageTitle');
    const subtitle = document.querySelector('.header-subtitle');

    if (pageTitle && titles[pageName]) {
        pageTitle.textContent = titles[pageName].title;
    }
    if (subtitle && titles[pageName]) {
        subtitle.textContent = titles[pageName].subtitle;
    }
}

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    // Transaction modal
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const closeModal = document.getElementById('closeTransactionModal');
    const overlay = document.getElementById('transactionModalOverlay');
    const cancelBtn = document.getElementById('cancelTransaction');
    const saveBtn = document.getElementById('saveTransaction');

    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', openTransactionModal);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeTransactionModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeTransactionModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeTransactionModal);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveTransaction);
    }

    // Transaction type change
    const transactionType = document.getElementById('transactionType');
    if (transactionType) {
        transactionType.addEventListener('change', updateCategoryOptions);
    }

    // Theme toggle
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // Filters
    setupFilters();
}

function setupFilters() {
    const searchInput = document.getElementById('searchTransactions');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const filterAccount = document.getElementById('filterAccount');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.filters.search = e.target.value;
            updateTransactionsTable();
        });
    }

    [filterType, filterCategory, filterAccount, filterDateFrom, filterDateTo].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                AppState.filters.type = filterType?.value || 'all';
                AppState.filters.category = filterCategory?.value || 'all';
                App State.filters.account = filterAccount?.value || 'all';
                AppState.filters.dateFrom = filterDateFrom?.value || null;
                AppState.filters.dateTo = filterDateTo?.value || null;
                updateTransactionsTable();
            });
        }
    });
}

// ===================================
// HEADER
// ===================================
function initializeHeader() {
    updateHeaderQuickStats();
}

function updateHeaderQuickStats() {
    const balance = MetricsEngine.calculateTotalBalance(AppState.transactions);
    const { income, expenses } = MetricsEngine.calculateMonthlyTotals(AppState.transactions);

    const headerBalance = document.getElementById('headerBalance');
    const headerMonthly = document.getElementById('headerMonthly');

    if (headerBalance) {
        headerBalance.textContent = MetricsEngine.formatCurrency(balance);
        headerBalance.className = 'quick-stat-value ' + (balance >= 0 ? 'positive' : 'negative');
    }

    if (headerMonthly) {
        const monthly = income - expenses;
        headerMonthly.textContent = MetricsEngine.formatCurrency(monthly);
    }
}

// ===================================
// TRANSACTION MODAL
// ===================================
function openTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.classList.add('active');

        // Set today's date
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Populate selects
        updateCategoryOptions();
        populateAccountSelect();
    }
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('transactionForm')?.reset();
    }
}

function updateCategoryOptions() {
    const typeSelect = document.getElementById('transactionType');
    const categorySelect = document.getElementById('transactionCategory');

    if (!typeSelect || !categorySelect) return;

    const type = typeSelect.value;
    const categories = AppState.categories[type] || [];

    categorySelect.innerHTML = categories.map(cat =>
        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');
}

function populateAccountSelect() {
    const accountSelect = document.getElementById('transactionAccount');
    if (!accountSelect) return;

    accountSelect.innerHTML = AppState.accounts.map(acc =>
        `<option value="${acc.id}">${acc.icon} ${acc.name}</option>`
    ).join('');
}

function saveTransaction() {
    const form = document.getElementById('transactionForm');
    if (!form || !form.checkValidity()) {
        form?.reportValidity();
        return;
    }

    const transaction = {
        id: generateId(),
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        account: document.getElementById('transactionAccount').value,
        date: document.getElementById('transactionDate').value,
        currency: document.getElementById('transactionCurrency').value,
        description: document.getElementById('transactionDescription').value,
        notes: document.getElementById('transactionNotes')?.value || ''
    };

    AppState.transactions.unshift(transaction);
    saveDataToStorage();
    closeTransactionModal();
    updateAllViews();
    showNotification('✅ Transacción agregada correctamente', 'success');
}

// ===================================
// UPDATE VIEWS
// ===================================
function updateAllViews() {
    updateHeaderQuickStats();
    updateCurrentPageContent();
}

function updateCurrentPageContent() {
    switch (AppState.currentPage) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            updateTransactionsTable();
            break;
        case 'accounts':
            updateAccountsGrid();
            break;
        case 'budgets':
            updateBudgetsGrid();
            break;
        case 'goals':
            updateGoalsGrid();
            break;
    }
}

// ===================================
// DASHBOARD
// ===================================
function updateDashboard() {
    updateKPICards();
    updateDashboardCharts();
    updateRecentTransactions();
    updateGoalsList();
    updateTopCategories();
    updateSavingsProgress();
    updateInsights();
}

function updateKPICards() {
    const balance = MetricsEngine.calculateTotalBalance(AppState.transactions);
    const { income, expenses } = MetricsEngine.calculateMonthlyTotals(AppState.transactions);
    const healthScore = MetricsEngine.calculateHealthScore(AppState.transactions);

    // Update KPI values
    const kpiBalance = document.getElementById('kpiBalance');
    const kpiIncome = document.getElementById('kpiIncome');
    const kpiExpenses = document.getElementById('kpiExpenses');
    const kpiHealth = document.getElementById('kpiHealth');

    if (kpiBalance) kpiBalance.textContent = MetricsEngine.formatCurrency(balance);
    if (kpiIncome) kpiIncome.textContent = MetricsEngine.formatCurrency(income);
    if (kpiExpenses) kpiExpenses.textContent = MetricsEngine.formatCurrency(expenses);
    if (kpiHealth) kpiHealth.textContent = `${healthScore}/100`;
}

function updateDashboardCharts() {
    // Cash Flow Chart
    const period = document.getElementById('cashflowPeriod')?.value || '30';
    const trendsData = MetricsEngine.analyzeTrends(AppState.transactions, parseInt(period));
    ChartsEngine.renderCashFlowChart('cashFlowChart', trendsData);

    // Category Chart
    const categoryData = MetricsEngine.calculateCategoryDistribution(AppState.transactions, 'expense');
    ChartsEngine.renderCategoryChart('categoryChart', categoryData, 'categoryLegend');
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const recent = AppState.transactions.slice(0, 5);

    container.innerHTML = recent.map(t => {
        const category = [...AppState.categories.income, ...AppState.categories.expense]
            .find(c => c.id === t.category);
        const icon = category?.icon || '💰';

        const date = new Date(t.date);
        const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

        return `
            <div class="transaction-mini">
                <div class="transaction-mini-icon">${icon}</div>
                <div class="transaction-mini-details">
                    <div class="transaction-mini-desc">${t.description}</div>
                    <div class="transaction-mini-meta">${dateStr}</div>
                </div>
                <div class="transaction-mini-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${MetricsEngine.formatCurrency(t.amount)}
                </div>
            </div>
        `;
    }).join('');
}

function updateGoalsList() {
    const container = document.getElementById('goalsList');
    if (!container) return;

    const activeGoals = AppState.goals.slice(0, 3);

    container.innerHTML = activeGoals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        return `
            <div class="goal-mini">
                <div class="goal-mini-header">
                    <div class="goal-mini-title">${goal.icon} ${goal.name}</div>
                    <div class="goal-mini-amount">${MetricsEngine.formatCurrency(goal.current)} / ${MetricsEngine.formatCurrency(goal.target)}</div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="goal-progress-text">
                    <span>${progress.toFixed(0)}% completado</span>
                    <span>${goal.deadline}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateTopCategories() {
    const container = document.getElementById('topCategories');
    if (!container) return;

    const distribution = MetricsEngine.calculateCategoryDistribution(AppState.transactions, 'expense');
    const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);

    container.innerHTML = sorted.map(([categoryId, amount]) => {
        const category = AppState.categories.expense.find(c => c.id === categoryId);
        const percentage = (amount / total) * 100;

        return `
            <div class="category-item">
                <div class="category-icon">${category?.icon || '📦'}</div>
                <div class="category-info">
                    <div class="category-name">${category?.name || categoryId}</div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="category-amount">${MetricsEngine.formatCurrency(amount)}</div>
            </div>
        `;
    }).join('');
}

function updateSavingsProgress() {
    const { income, expenses } = MetricsEngine.calculateMonthlyTotals(AppState.transactions);
    const savingsRate = MetricsEngine.calculateSavingsRate(income, expenses);

    const circle = document.querySelector('#savingsProgress .progress-bar');
    const number = document.querySelector('#savingsProgress .progress-number');

    if (circle && number) {
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (savingsRate / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        number.textContent = savingsRate.toFixed(1);
    }
}

function updateInsights() {
    const container = document.getElementById('insightsGrid');
    if (!container) return;

    const insights = MetricsEngine.generateInsights(AppState.transactions);

    // Add some predefined insights
    const allInsights = [
        ...insights,
        {
            type: 'info',
            icon: '💡',
            title: 'Proyección Positiva',
            message: `A este ritmo, en 6 meses tendrás ${MetricsEngine.formatCurrency(MetricsEngine.calculateProjection(AppState.transactions))}`
        },
        {
            type: 'success',
            icon: '🎯',
            title: 'Metas en Progreso',
            message: `Tienes ${AppState.goals.length} metas activas. ¡Continúa así!`
        }
    ];

    container.innerHTML = allInsights.slice(0, 4).map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-header">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-title">${insight.title || 'Insight'}</div>
            </div>
            <div class="insight-message">${insight.message}</div>
        </div>
    `).join('');
}

// ===================================
// TRANSACTIONS TABLE
// ===================================
function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    // Apply filters
    let filtered = AppState.transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(AppState.filters.search.toLowerCase());
        const matchesType = AppState.filters.type === 'all' || t.type === AppState.filters.type;
        const matchesCategory = AppState.filters.category === 'all' || t.category === AppState.filters.category;
        const matchesAccount = AppState.filters.account === 'all' || t.account === AppState.filters.account;

        return matchesSearch && matchesType && matchesCategory && matchesAccount;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
                    No se encontraron transacciones
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.slice(0, 50).map(t => {
        const category = [...AppState.categories.income, ...AppState.categories.expense]
            .find(c => c.id === t.category);
        const account = AppState.accounts.find(a => a.id === t.account);

        const date = new Date(t.date).toLocaleDateString('es-ES');
        const typeLabel = t.type === 'income' ? 'Ingreso' : 'Gasto';
        const amountClass = t.type === 'income' ? 'text-success' : 'text-danger';

        return `
            <tr>
                <td>${date}</td>
                <td>${t.description}</td>
                <td>${category?.icon || ''} ${category?.name || t.category}</td>
                <td>${account?.icon || ''} ${account?.name || t.account}</td>
                <td>
                    <span class="${amountClass}">${typeLabel}</span>
                </td>
                <td class="text-right ${amountClass}">
                    ${t.type === 'income' ? '+' : '-'}${MetricsEngine.formatCurrency(t.amount)}
                </td>
                <td class="text-center">
                    <button class="btn-secondary" style="padding: 0.5rem;" onclick="deleteTransaction('${t.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================================
// ACCOUNTS, BUDGETS, GOALS
// ===================================
function updateAccountsGrid() {
    const container = document.getElementById('accountsGrid');
    if (!container) return;

    const totalBalance = AppState.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    container.innerHTML = AppState.accounts.map(acc => `
        <div class="kpi-card ${acc.balance >= 0 ? 'success' : 'danger'}">
            <div class="kpi-header">
                <span class="kpi-icon">${acc.icon}</span>
                <span class="kpi-trend">${acc.type}</span>
            </div>
            <div class="kpi-body">
                <p class="kpi-label">${acc.name}</p>
                <h3 class="kpi-value">${MetricsEngine.formatCurrency(acc.balance)}</h3>
                <p class="kpi-subtitle">${((acc.balance / totalBalance) * 100).toFixed(1)}% del total</p>
            </div>
        </div>
    `).join('');
}

function updateBudgetsGrid() {
    const container = document.getElementById('budgetsGrid');
    if (!container) return;

    const categoryExpenses = MetricsEngine.calculateCategoryDistribution(AppState.transactions, 'expense');

    container.innerHTML = Object.entries(AppState.budgets).map(([categoryId, budget]) => {
        const spent = categoryExpenses[categoryId] || 0;
        const percentage = (spent / budget) * 100;
        const category = AppState.categories.expense.find(c => c.id === categoryId);

        let progressClass = '';
        if (percentage > 100) progressClass = 'danger';
        else if (percentage > 80) progressClass = 'warning';
        else progressClass = 'success';

        return `
            <div class="kpi-card ${progressClass}">
                <div class="kpi-header">
                    <span class="kpi-icon">${category?.icon || '📦'}</span>
                    <span class="kpi-score">${percentage.toFixed(0)}%</span>
                </div>
                <div class="kpi-body">
                    <p class="kpi-label">${category?.name || categoryId}</p>
                    <h3 class="kpi-value">${MetricsEngine.formatCurrency(spent)}</h3>
                    <p class="kpi-subtitle">de ${MetricsEngine.formatCurrency(budget)} presupuesto</p>
                    <div class="mini-progress">
                        <div class="mini-progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateGoalsGrid() {
    const container = document.getElementById('goalsGrid');
    if (!container) return;

    container.innerHTML = AppState.goals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        const remaining = goal.target - goal.current;

        return `
            <div class="kpi-card info">
                <div class="kpi-header">
                    <span class="kpi-icon">${goal.icon}</span>
                    <span class="kpi-score">${progress.toFixed(0)}%</span>
                </div>
                <div class="kpi-body">
                    <p class="kpi-label">${goal.name}</p>
                    <h3 class="kpi-value">${MetricsEngine.formatCurrency(goal.current)}</h3>
                    <p class="kpi-subtitle">de ${MetricsEngine.formatCurrency(goal.target)}</p>
                    <div class="mini-progress">
                        <div class="mini-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <p class="kpi-subtitle" style="margin-top: 0.5rem;">Faltan ${MetricsEngine.formatCurrency(remaining)} • ${goal.deadline}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// UTILITIES
// ===================================
function deleteTransaction(id) {
    if (confirm('¿Seguro que quieres eliminar esta transacción?')) {
        AppState.transactions = AppState.transactions.filter(t => t.id !== id);
        saveDataToStorage();
        updateAllViews();
        showNotification('🗑️ Transacción eliminada', 'info');
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.classList.remove(`theme-${currentTheme}`);
    body.classList.add(`theme-${newTheme}`);

    AppState.settings.theme = newTheme;
    saveDataToStorage();

    showNotification(`🎨 Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 350px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('💎 MoneyMaster Pro - Enterprise Edition');
