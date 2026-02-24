(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/budget/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BudgetPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const BUDGET_LINES = [
    {
        id: 1,
        partida: 'Monumento Mayor',
        category: 'Monumentos',
        presupuesto: 45000,
        ejecutado: 38000,
        comprometido: 5000,
        icon: '🏛️'
    },
    {
        id: 2,
        partida: 'Monumento Infantil',
        category: 'Monumentos',
        presupuesto: 12000,
        ejecutado: 9500,
        comprometido: 1500,
        icon: '👧'
    },
    {
        id: 3,
        partida: 'Pirotecnia',
        category: 'Fiestas',
        presupuesto: 8500,
        ejecutado: 8000,
        comprometido: 0,
        icon: '🎆'
    },
    {
        id: 4,
        partida: 'Música y Bandas',
        category: 'Fiestas',
        presupuesto: 6000,
        ejecutado: 3200,
        comprometido: 2800,
        icon: '🎵'
    },
    {
        id: 5,
        partida: 'Catering y Comidas',
        category: 'Comidas',
        presupuesto: 12000,
        ejecutado: 4800,
        comprometido: 3000,
        icon: '🍽️'
    },
    {
        id: 6,
        partida: 'Iluminación',
        category: 'Fiestas',
        presupuesto: 4500,
        ejecutado: 4500,
        comprometido: 0,
        icon: '💡'
    },
    {
        id: 7,
        partida: 'Flores Ofrenda',
        category: 'Ofrenda',
        presupuesto: 2200,
        ejecutado: 1800,
        comprometido: 400,
        icon: '🌸'
    },
    {
        id: 8,
        partida: 'Indumentaria',
        category: 'Vestuario',
        presupuesto: 3500,
        ejecutado: 1200,
        comprometido: 800,
        icon: '👗'
    },
    {
        id: 9,
        partida: 'Seguros',
        category: 'Admin',
        presupuesto: 2800,
        ejecutado: 2800,
        comprometido: 0,
        icon: '🛡️'
    },
    {
        id: 10,
        partida: 'Alquiler local',
        category: 'Admin',
        presupuesto: 9600,
        ejecutado: 8000,
        comprometido: 1600,
        icon: '🏠'
    },
    {
        id: 11,
        partida: 'Suministros (luz, agua)',
        category: 'Admin',
        presupuesto: 3200,
        ejecutado: 2600,
        comprometido: 600,
        icon: '⚡'
    },
    {
        id: 12,
        partida: 'Material oficina',
        category: 'Admin',
        presupuesto: 500,
        ejecutado: 320,
        comprometido: 0,
        icon: '📎'
    },
    {
        id: 13,
        partida: 'Publicidad y cartelería',
        category: 'Comunicación',
        presupuesto: 1500,
        ejecutado: 900,
        comprometido: 300,
        icon: '📢'
    },
    {
        id: 14,
        partida: 'Actividades infantiles',
        category: 'Infantil',
        presupuesto: 2000,
        ejecutado: 800,
        comprometido: 500,
        icon: '🎠'
    },
    {
        id: 15,
        partida: 'Excursiones y viajes',
        category: 'Ocio',
        presupuesto: 3000,
        ejecutado: 1500,
        comprometido: 0,
        icon: '🚌'
    },
    {
        id: 16,
        partida: 'Imprevistos',
        category: 'Admin',
        presupuesto: 2500,
        ejecutado: 400,
        comprometido: 0,
        icon: '❓'
    }
];
const INCOME_LINES = [
    {
        partida: 'Cuotas Adultos',
        presupuesto: 69360,
        cobrado: 61710,
        icon: '👥'
    },
    {
        partida: 'Cuotas Infantil',
        presupuesto: 5400,
        cobrado: 5400,
        icon: '👧'
    },
    {
        partida: 'Cuotas Jubilados',
        presupuesto: 2400,
        cobrado: 2400,
        icon: '🧓'
    },
    {
        partida: 'Lotería',
        presupuesto: 8000,
        cobrado: 7200,
        icon: '🎰'
    },
    {
        partida: 'Subvención JCF',
        presupuesto: 5000,
        cobrado: 5000,
        icon: '🏛️'
    },
    {
        partida: 'Subvención Ayto.',
        presupuesto: 12000,
        cobrado: 6000,
        icon: '🏛️'
    },
    {
        partida: 'Barra / Bar',
        presupuesto: 15000,
        cobrado: 12500,
        icon: '🍺'
    },
    {
        partida: 'Rifas y sorteos',
        presupuesto: 3000,
        cobrado: 1800,
        icon: '🎟️'
    },
    {
        partida: 'Patrocinadores',
        presupuesto: 4000,
        cobrado: 2500,
        icon: '🤝'
    }
];
function BudgetPage() {
    _s();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('gastos');
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Todas');
    const totalPresupuesto = BUDGET_LINES.reduce((s, b)=>s + b.presupuesto, 0);
    const totalEjecutado = BUDGET_LINES.reduce((s, b)=>s + b.ejecutado, 0);
    const totalComprometido = BUDGET_LINES.reduce((s, b)=>s + b.comprometido, 0);
    const totalDisponible = totalPresupuesto - totalEjecutado - totalComprometido;
    const pctGlobal = Math.round(totalEjecutado / totalPresupuesto * 100);
    const alertLines = BUDGET_LINES.filter((b)=>(b.ejecutado + b.comprometido) / b.presupuesto >= 0.9);
    const totalIngresoPres = INCOME_LINES.reduce((s, l)=>s + l.presupuesto, 0);
    const totalIngresoCob = INCOME_LINES.reduce((s, l)=>s + l.cobrado, 0);
    const categories = [
        'Todas',
        ...Array.from(new Set(BUDGET_LINES.map((b)=>b.category)))
    ];
    const filteredLines = category === 'Todas' ? BUDGET_LINES : BUDGET_LINES.filter((b)=>b.category === category);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "page-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "page-title",
                        children: "📋 Presupuesto"
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 68,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "page-subtitle",
                        children: "Control presupuestario del ejercicio 2025-2026"
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 67,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "stats-grid animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon blue",
                                children: "📋"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 75,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalPresupuesto.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Presupuesto Total Gastos"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 77,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon orange",
                                children: "📤"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 80,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalEjecutado.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 81,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Ejecutado"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 82,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-change negative",
                                children: [
                                    pctGlobal,
                                    "% del presupuesto"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 83,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 79,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon purple",
                                children: "📝"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 86,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalComprometido.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 87,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Comprometido"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 88,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                    marginTop: 4
                                },
                                children: "Facturas pendientes"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 89,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 85,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon green",
                                children: "✅"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 92,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalDisponible.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 93,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Disponible"
                            }, void 0, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 94,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-change positive",
                                children: [
                                    Math.round(totalDisponible / totalPresupuesto * 100),
                                    "% libre"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 95,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 91,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 73,
                columnNumber: 13
            }, this),
            alertLines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card animate-fade-in",
                style: {
                    marginBottom: 20,
                    borderColor: 'rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.03)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: {
                            color: 'var(--accent-red)',
                            marginBottom: 12
                        },
                        children: "🚨 Partidas en riesgo (≥90% ejecutado)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 102,
                        columnNumber: 21
                    }, this),
                    alertLines.map((b)=>{
                        const totalUsed = b.ejecutado + b.comprometido;
                        const pct = Math.round(totalUsed / b.presupuesto * 100);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "alert-item alert-danger",
                            style: {
                                marginBottom: 6
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    b.icon,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: b.partida
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 108,
                                        columnNumber: 48
                                    }, this),
                                    " — ",
                                    pct,
                                    "% (",
                                    totalUsed.toLocaleString('es-ES'),
                                    "€ de ",
                                    b.presupuesto.toLocaleString('es-ES'),
                                    "€)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 108,
                                columnNumber: 33
                            }, this)
                        }, b.id, false, {
                            fileName: "[project]/src/app/budget/page.tsx",
                            lineNumber: 107,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 101,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tabs",
                style: {
                    marginBottom: 20
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `tab ${view === 'gastos' ? 'active' : ''}`,
                        onClick: ()=>setView('gastos'),
                        children: "📤 Presupuesto de Gastos"
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 117,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `tab ${view === 'ingresos' ? 'active' : ''}`,
                        onClick: ()=>setView('ingresos'),
                        children: "📥 Presupuesto de Ingresos"
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 116,
                columnNumber: 13
            }, this),
            view === 'gastos' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: 6,
                            marginBottom: 20,
                            flexWrap: 'wrap'
                        },
                        children: categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `tab ${category === c ? 'active' : ''}`,
                                onClick: ()=>setCategory(c),
                                style: {
                                    padding: '6px 14px',
                                    fontSize: 12
                                },
                                children: c
                            }, c, false, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 126,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 124,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "data-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 136,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Partida"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 137,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Categoría"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 138,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Presupuesto"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 139,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Ejecutado"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 140,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Comprometido"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 141,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Disponible"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 142,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    width: 140
                                                },
                                                children: "% Ejecución"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 143,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Desviación"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 144,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 135,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 134,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: filteredLines.map((b)=>{
                                        const totalUsed = b.ejecutado + b.comprometido;
                                        const disp = b.presupuesto - totalUsed;
                                        const pct = Math.round(b.ejecutado / b.presupuesto * 100);
                                        const pctTotal = Math.round(totalUsed / b.presupuesto * 100);
                                        const deviation = totalUsed - b.presupuesto;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontSize: 20
                                                    },
                                                    children: b.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontWeight: 600
                                                    },
                                                    children: b.partida
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge info",
                                                        style: {
                                                            fontSize: 11
                                                        },
                                                        children: b.category
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/budget/page.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif"
                                                    },
                                                    children: [
                                                        b.presupuesto.toLocaleString('es-ES'),
                                                        "€"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif",
                                                        fontWeight: 600
                                                    },
                                                    children: [
                                                        b.ejecutado.toLocaleString('es-ES'),
                                                        "€"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif",
                                                        color: 'var(--accent-yellow)'
                                                    },
                                                    children: b.comprometido > 0 ? `${b.comprometido.toLocaleString('es-ES')}€` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif",
                                                        color: disp <= 0 ? 'var(--accent-red)' : 'var(--accent-green)'
                                                    },
                                                    children: [
                                                        disp.toLocaleString('es-ES'),
                                                        "€"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 162,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "progress-bar",
                                                                style: {
                                                                    flex: 1
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "progress-fill",
                                                                    style: {
                                                                        width: `${Math.min(pct, 100)}%`,
                                                                        background: pctTotal >= 100 ? 'var(--accent-red)' : pctTotal >= 90 ? 'linear-gradient(90deg, var(--accent-orange), var(--accent-red))' : undefined
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                                    lineNumber: 166,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/budget/page.tsx",
                                                                lineNumber: 165,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    minWidth: 32,
                                                                    color: pctTotal >= 90 ? 'var(--accent-red)' : undefined
                                                                },
                                                                children: [
                                                                    pct,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/budget/page.tsx",
                                                                lineNumber: 171,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/budget/page.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: deviation >= 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge danger",
                                                        children: [
                                                            "+",
                                                            deviation.toLocaleString('es-ES'),
                                                            "€"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/budget/page.tsx",
                                                        lineNumber: 176,
                                                        columnNumber: 53
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge success",
                                                        children: [
                                                            deviation.toLocaleString('es-ES'),
                                                            "€"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/budget/page.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, b.id, true, {
                                            fileName: "[project]/src/app/budget/page.tsx",
                                            lineNumber: 155,
                                            columnNumber: 41
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 147,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderTop: '2px solid var(--border-hover)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 187,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 800
                                                },
                                                children: "TOTAL"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 188,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 189,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800
                                                },
                                                children: [
                                                    totalPresupuesto.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 190,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800
                                                },
                                                children: [
                                                    totalEjecutado.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800,
                                                    color: 'var(--accent-yellow)'
                                                },
                                                children: [
                                                    totalComprometido.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 192,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800,
                                                    color: 'var(--accent-green)'
                                                },
                                                children: [
                                                    totalDisponible.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 193,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "progress-bar",
                                                            style: {
                                                                flex: 1
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "progress-fill",
                                                                style: {
                                                                    width: `${pctGlobal}%`
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/budget/page.tsx",
                                                                lineNumber: 197,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/budget/page.tsx",
                                                            lineNumber: 196,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: 12,
                                                                fontWeight: 800
                                                            },
                                                            children: [
                                                                pctGlobal,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/budget/page.tsx",
                                                            lineNumber: 199,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 195,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 194,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 202,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 186,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 185,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/budget/page.tsx",
                            lineNumber: 133,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 132,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 122,
                columnNumber: 17
            }, this),
            view === 'ingresos' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stats-grid",
                        style: {
                            marginBottom: 20,
                            gridTemplateColumns: '1fr 1fr'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-icon blue",
                                        children: "📥"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 214,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-value",
                                        children: [
                                            totalIngresoPres.toLocaleString('es-ES'),
                                            "€"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-label",
                                        children: "Ingresos Presupuestados"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 216,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 213,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-icon green",
                                        children: "✅"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 219,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-value",
                                        children: [
                                            totalIngresoCob.toLocaleString('es-ES'),
                                            "€"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 220,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-label",
                                        children: "Ingresos Cobrados"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 221,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "stat-change positive",
                                        children: [
                                            Math.round(totalIngresoCob / totalIngresoPres * 100),
                                            "% cobrado"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 222,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/budget/page.tsx",
                                lineNumber: 218,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 212,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "data-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 229,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Concepto"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 230,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Presupuestado"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 231,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Cobrado"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 232,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Pendiente"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 233,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    width: 140
                                                },
                                                children: "% Cobro"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 234,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 228,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 227,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: INCOME_LINES.map((l, i)=>{
                                        const pct = Math.round(l.cobrado / l.presupuesto * 100);
                                        const pendiente = l.presupuesto - l.cobrado;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontSize: 20
                                                    },
                                                    children: l.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontWeight: 600
                                                    },
                                                    children: l.partida
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 244,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif"
                                                    },
                                                    children: [
                                                        l.presupuesto.toLocaleString('es-ES'),
                                                        "€"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif",
                                                        fontWeight: 600,
                                                        color: 'var(--accent-green)'
                                                    },
                                                    children: [
                                                        l.cobrado.toLocaleString('es-ES'),
                                                        "€"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 246,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontFamily: "'Outfit', sans-serif",
                                                        color: pendiente > 0 ? 'var(--accent-orange)' : 'var(--text-muted)'
                                                    },
                                                    children: pendiente > 0 ? `${pendiente.toLocaleString('es-ES')}€` : '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 247,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "progress-bar",
                                                                style: {
                                                                    flex: 1
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "progress-fill",
                                                                    style: {
                                                                        width: `${pct}%`,
                                                                        background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                                    lineNumber: 253,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/budget/page.tsx",
                                                                lineNumber: 252,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    fontWeight: 600
                                                                },
                                                                children: [
                                                                    pct,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/budget/page.tsx",
                                                                lineNumber: 255,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/budget/page.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/app/budget/page.tsx",
                                            lineNumber: 242,
                                            columnNumber: 41
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 237,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderTop: '2px solid var(--border-hover)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {}, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 800
                                                },
                                                children: "TOTAL"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 265,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800
                                                },
                                                children: [
                                                    totalIngresoPres.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 266,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800,
                                                    color: 'var(--accent-green)'
                                                },
                                                children: [
                                                    totalIngresoCob.toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 267,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    fontWeight: 800,
                                                    color: 'var(--accent-orange)'
                                                },
                                                children: [
                                                    (totalIngresoPres - totalIngresoCob).toLocaleString('es-ES'),
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 268,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        fontWeight: 800
                                                    },
                                                    children: [
                                                        Math.round(totalIngresoCob / totalIngresoPres * 100),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/budget/page.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/budget/page.tsx",
                                                lineNumber: 269,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/budget/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/budget/page.tsx",
                                    lineNumber: 262,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/budget/page.tsx",
                            lineNumber: 226,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/budget/page.tsx",
                        lineNumber: 225,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/budget/page.tsx",
                lineNumber: 211,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/budget/page.tsx",
        lineNumber: 66,
        columnNumber: 9
    }, this);
}
_s(BudgetPage, "QxTpzgdiT5MdgXiYPz9eaSeXiZ4=");
_c = BudgetPage;
var _c;
__turbopack_context__.k.register(_c, "BudgetPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_budget_page_tsx_6b5ec190._.js.map