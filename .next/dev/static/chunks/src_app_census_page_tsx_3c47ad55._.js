(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/census/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CensusPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const FALLEROS = [
    {
        id: 1,
        name: 'María García Torres',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'maria@email.com',
        phone: '612 345 678',
        joinYear: 2010
    },
    {
        id: 2,
        name: 'Pablo Martínez López',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false
        ],
        email: 'pablo@email.com',
        phone: '623 456 789',
        joinYear: 2015
    },
    {
        id: 3,
        name: 'Carlos Ruiz Sánchez',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false
        ],
        email: 'carlos@email.com',
        phone: '634 567 890',
        joinYear: 2018
    },
    {
        id: 4,
        name: 'Lucía Fernández Gil',
        category: 'Infantil',
        cuota: 45,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'lucia@email.com',
        phone: '645 678 901',
        joinYear: 2020
    },
    {
        id: 5,
        name: 'Ana Torres Pérez',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'ana@email.com',
        phone: '656 789 012',
        joinYear: 2008
    },
    {
        id: 6,
        name: 'Eva Moreno Díaz',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false
        ],
        email: 'eva@email.com',
        phone: '667 890 123',
        joinYear: 2019
    },
    {
        id: 7,
        name: 'Andrés López Vidal',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false
        ],
        email: 'andres@email.com',
        phone: '678 901 234',
        joinYear: 2016
    },
    {
        id: 8,
        name: 'Sara Vidal Ruiz',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false
        ],
        email: 'sara@email.com',
        phone: '689 012 345',
        joinYear: 2017
    },
    {
        id: 9,
        name: 'Miguel Ángel Sanz',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false
        ],
        email: 'miguel@email.com',
        phone: '690 123 456',
        joinYear: 2012
    },
    {
        id: 10,
        name: 'Laura Martínez Roca',
        category: 'Jubilado',
        cuota: 40,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'laura@email.com',
        phone: '601 234 567',
        joinYear: 1995
    },
    {
        id: 11,
        name: 'Francisco Pérez Gil',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'fran@email.com',
        phone: '612 345 001',
        joinYear: 2005
    },
    {
        id: 12,
        name: 'Carmen Ruiz Torres',
        category: 'Infantil',
        cuota: 45,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'carmen@email.com',
        phone: '623 456 002',
        joinYear: 2021
    },
    {
        id: 13,
        name: 'Luis García Mora',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false
        ],
        email: 'luis@email.com',
        phone: '634 567 003',
        joinYear: 2014
    },
    {
        id: 14,
        name: 'Sandra López Díaz',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'sandra@email.com',
        phone: '645 678 004',
        joinYear: 2011
    },
    {
        id: 15,
        name: 'Roberto Sanz Pérez',
        category: 'Adulto',
        cuota: 85,
        paid: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true
        ],
        email: 'roberto@email.com',
        phone: '656 789 005',
        joinYear: 2009
    }
];
const MONTHS_SHORT = [
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
    'Ene',
    'Feb'
];
function getStatus(paid) {
    const unpaid = paid.filter((p)=>!p).length;
    if (unpaid === 0) return 'pagado';
    if (unpaid >= 3) return 'moroso';
    return 'pendiente';
}
function getDebt(cuota, paid) {
    return paid.filter((p)=>!p).length * cuota;
}
function CensusPage() {
    _s();
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('todos');
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const filtered = FALLEROS.filter((f)=>{
        const status = getStatus(f.paid);
        if (filter !== 'todos' && status !== filter) return false;
        if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });
    const totalFalleros = FALLEROS.length;
    const totalAdultos = FALLEROS.filter((f)=>f.category === 'Adulto').length;
    const totalInfantil = FALLEROS.filter((f)=>f.category === 'Infantil').length;
    const totalJubilados = FALLEROS.filter((f)=>f.category === 'Jubilado').length;
    const totalDebt = FALLEROS.reduce((s, f)=>s + getDebt(f.cuota, f.paid), 0);
    const totalCollected = FALLEROS.reduce((s, f)=>s + f.paid.filter(Boolean).length * f.cuota, 0);
    const totalExpected = FALLEROS.reduce((s, f)=>s + f.cuota * 12, 0);
    const pctCollected = Math.round(totalCollected / totalExpected * 100);
    const morosos = FALLEROS.filter((f)=>getStatus(f.paid) === 'moroso').length;
    const pendientes = FALLEROS.filter((f)=>getStatus(f.paid) === 'pendiente').length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "page-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "page-title",
                        children: "👥 Censo & Cuotas"
                    }, void 0, false, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 63,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "page-subtitle",
                        children: "Control de falleros y estado de cobro de cuotas"
                    }, void 0, false, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/census/page.tsx",
                lineNumber: 62,
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
                                children: "👥"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: totalFalleros
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 71,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Total Censados"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 72,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                    marginTop: 4
                                },
                                children: [
                                    totalAdultos,
                                    " adultos · ",
                                    totalInfantil,
                                    " infantil · ",
                                    totalJubilados,
                                    " jubilados"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 73,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon green",
                                children: "💶"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 76,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalCollected.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 77,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Cuotas Cobradas"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 78,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-change positive",
                                children: [
                                    pctCollected,
                                    "% del total anual"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 79,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 75,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon orange",
                                children: "⏳"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 82,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    totalDebt.toLocaleString('es-ES'),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 83,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Pendiente de Cobro"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 84,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-change negative",
                                children: [
                                    pendientes,
                                    " pendientes · ",
                                    morosos,
                                    " morosos"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 85,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 81,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "stat-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-icon purple",
                                children: "📊"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 88,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-value",
                                children: [
                                    pctCollected,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 89,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "stat-label",
                                children: "Tasa de Cobro"
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 90,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "progress-bar",
                                style: {
                                    marginTop: 8
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "progress-fill",
                                    style: {
                                        width: `${pctCollected}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/census/page.tsx",
                                    lineNumber: 92,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 91,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 87,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/census/page.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    marginBottom: 20,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: "input",
                        placeholder: "🔍 Buscar fallero...",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value),
                        style: {
                            maxWidth: 280
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 99,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tabs",
                        style: {
                            marginBottom: 0
                        },
                        children: [
                            {
                                key: 'todos',
                                label: `Todos (${totalFalleros})`
                            },
                            {
                                key: 'pagado',
                                label: `Al día (${FALLEROS.filter((f)=>getStatus(f.paid) === 'pagado').length})`
                            },
                            {
                                key: 'pendiente',
                                label: `Pendientes (${pendientes})`
                            },
                            {
                                key: 'moroso',
                                label: `Morosos (${morosos})`
                            }
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `tab ${filter === t.key ? 'active' : ''}`,
                                onClick: ()=>setFilter(t.key),
                                children: t.label
                            }, t.key, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 107,
                                columnNumber: 25
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 100,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn btn-primary",
                        style: {
                            marginLeft: 'auto'
                        },
                        children: "📤 Exportar CSV"
                    }, void 0, false, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 110,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/census/page.tsx",
                lineNumber: 98,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        overflowX: 'auto'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "data-table",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Fallero/a"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/census/page.tsx",
                                            lineNumber: 119,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Cat."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/census/page.tsx",
                                            lineNumber: 120,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Cuota"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/census/page.tsx",
                                            lineNumber: 121,
                                            columnNumber: 33
                                        }, this),
                                        MONTHS_SHORT.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'center',
                                                    fontSize: 11,
                                                    padding: '8px 4px'
                                                },
                                                children: m
                                            }, m, false, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 122,
                                                columnNumber: 58
                                            }, this)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Deuda"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/census/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Estado"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/census/page.tsx",
                                            lineNumber: 124,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/census/page.tsx",
                                    lineNumber: 118,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 117,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: filtered.map((f)=>{
                                    const status = getStatus(f.paid);
                                    const debt = getDebt(f.cuota, f.paid);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: f.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `badge ${f.category === 'Adulto' ? 'info' : f.category === 'Infantil' ? 'purple' : 'success'}`,
                                                    children: f.category
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/census/page.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 134,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: [
                                                    f.cuota,
                                                    "€"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 135,
                                                columnNumber: 41
                                            }, this),
                                            f.paid.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '8px 4px'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 14
                                                        },
                                                        children: p ? '✅' : '❌'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/census/page.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 49
                                                    }, this)
                                                }, i, false, {
                                                    fileName: "[project]/src/app/census/page.tsx",
                                                    lineNumber: 137,
                                                    columnNumber: 45
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right',
                                                    fontWeight: 700,
                                                    color: debt > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
                                                    fontFamily: "'Outfit', sans-serif"
                                                },
                                                children: debt > 0 ? `${debt}€` : '—'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 141,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `badge ${status === 'pagado' ? 'success' : status === 'pendiente' ? 'warning' : 'danger'}`,
                                                    children: status === 'pagado' ? '✓ Al día' : status === 'pendiente' ? '⏳ Pendiente' : '🔴 Moroso'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/census/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/census/page.tsx",
                                                lineNumber: 144,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, f.id, true, {
                                        fileName: "[project]/src/app/census/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/census/page.tsx",
                                lineNumber: 127,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/census/page.tsx",
                        lineNumber: 116,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/census/page.tsx",
                    lineNumber: 115,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/census/page.tsx",
                lineNumber: 114,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/census/page.tsx",
        lineNumber: 61,
        columnNumber: 9
    }, this);
}
_s(CensusPage, "xpF1VftWdNZeqosjtW2ar0Un7yc=");
_c = CensusPage;
var _c;
__turbopack_context__.k.register(_c, "CensusPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_census_page_tsx_3c47ad55._.js.map