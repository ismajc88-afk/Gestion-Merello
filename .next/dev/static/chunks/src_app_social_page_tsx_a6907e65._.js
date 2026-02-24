(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/social/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SocialPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const CHANNELS = [
    {
        id: 'general',
        name: '# general',
        unread: 3
    },
    {
        id: 'junta',
        name: '# junta-directiva',
        unread: 0
    },
    {
        id: 'infantil',
        name: '# infantil',
        unread: 1
    },
    {
        id: 'fiestas',
        name: '# comisión-fiestas',
        unread: 5
    },
    {
        id: 'random',
        name: '# off-topic',
        unread: 0
    }
];
const MESSAGES = [
    {
        id: 1,
        user: 'María G.',
        avatar: 'MG',
        color: 'var(--accent-blue)',
        text: '¡Buenos días! ¿Alguien sabe a qué hora es el ensayo del playback?',
        time: '10:32'
    },
    {
        id: 2,
        user: 'Pablo M.',
        avatar: 'PM',
        color: 'var(--accent-green)',
        text: 'Creo que a las 18:00 en el casal. Confirmo en un rato.',
        time: '10:35'
    },
    {
        id: 3,
        user: 'Lucía F.',
        avatar: 'LF',
        color: 'var(--accent-purple)',
        text: 'Sí, a las 18:00. Traed las guitarras y el karaoke 🎤',
        time: '10:38'
    },
    {
        id: 4,
        user: 'Andrés L.',
        avatar: 'AL',
        color: 'var(--accent-orange)',
        text: 'Perfecto, allí estaré. ¿Necesitamos el amplificador grande?',
        time: '10:42'
    },
    {
        id: 5,
        user: 'María G.',
        avatar: 'MG',
        color: 'var(--accent-blue)',
        text: 'Sí porfa, el pequeño no se oye nada. Y traed cables de sobra.',
        time: '10:45'
    }
];
const POSTS = [
    {
        id: 1,
        user: 'Comisión Fiestas',
        avatar: 'CF',
        color: 'var(--accent-orange)',
        time: 'Hace 2 horas',
        text: '🎆 ¡Ya tenemos fecha para la mascletà de la falla! Será el 16 de marzo a las 14:00. ¡No faltéis! Este año el pirotécnico es Caballer y promete ser espectacular.',
        likes: 42,
        comments: 8
    },
    {
        id: 2,
        user: 'Presidente',
        avatar: 'PR',
        color: 'var(--accent-blue)',
        time: 'Hace 5 horas',
        text: '📋 Recordad que este viernes es la reunión extraordinaria para aprobar los presupuestos del monumento. Asistencia obligatoria. Si no podéis venir, enviad justificación antes del jueves.',
        likes: 15,
        comments: 3
    },
    {
        id: 3,
        user: 'María García',
        avatar: 'MG',
        color: 'var(--accent-purple)',
        time: 'Ayer',
        text: '📸 ¡Aquí las fotos de la paella del domingo! Qué bien lo pasamos. La receta del arroz al horno de Paco fue un éxito rotundo 🥘',
        likes: 67,
        comments: 12
    }
];
const POLLS = [
    {
        id: 1,
        question: '🍽️ ¿Qué menú preferís para la cena de Navidad?',
        options: [
            {
                text: 'Marisco + Cordero',
                votes: 45,
                pct: 42
            },
            {
                text: 'Arroz al horno + Postres',
                votes: 38,
                pct: 35
            },
            {
                text: 'Buffet libre variado',
                votes: 25,
                pct: 23
            }
        ],
        total: 108,
        status: 'Activa'
    },
    {
        id: 2,
        question: '🎵 ¿Qué orquesta para la verbena?',
        options: [
            {
                text: 'La Ñ',
                votes: 72,
                pct: 55
            },
            {
                text: 'Grupo Maravilla',
                votes: 35,
                pct: 27
            },
            {
                text: 'DJ + Karaoke',
                votes: 23,
                pct: 18
            }
        ],
        total: 130,
        status: 'Cerrada'
    }
];
const GALLERY_ALBUMS = [
    {
        id: 1,
        name: 'Ofrenda 2025',
        count: 134,
        cover: '🌸'
    },
    {
        id: 2,
        name: 'Mascletà Marzo',
        count: 67,
        cover: '🎆'
    },
    {
        id: 3,
        name: 'Cena Falleros',
        count: 89,
        cover: '🍷'
    },
    {
        id: 4,
        name: 'Plantà 2025',
        count: 45,
        cover: '🔨'
    },
    {
        id: 5,
        name: 'Cremà',
        count: 112,
        cover: '🔥'
    },
    {
        id: 6,
        name: 'Niños & Infantil',
        count: 78,
        cover: '👧'
    }
];
const DIRECTORY = [
    {
        name: 'Carlos Ruiz',
        profession: 'Fontanero',
        phone: '612 345 678',
        emoji: '🔧'
    },
    {
        name: 'Ana Belén Torres',
        profession: 'Abogada',
        phone: '634 567 890',
        emoji: '⚖️'
    },
    {
        name: 'Miguel Ángel Sanz',
        profession: 'Electricista',
        phone: '645 678 901',
        emoji: '⚡'
    },
    {
        name: 'Laura Martínez',
        profession: 'Diseñadora Gráfica',
        phone: '656 789 012',
        emoji: '🎨'
    },
    {
        name: 'Francisco Pérez',
        profession: 'Carpintero',
        phone: '667 890 123',
        emoji: '🪚'
    },
    {
        name: 'Sandra López',
        profession: 'Fisioterapeuta',
        phone: '678 901 234',
        emoji: '💆'
    }
];
const CLASSIFIEDS = [
    {
        id: 1,
        type: 'Vendo',
        title: 'Traje regional mujer talla M',
        price: '250€',
        user: 'Carmen R.',
        emoji: '👗'
    },
    {
        id: 2,
        type: 'Cambio',
        title: 'Lotería de Navidad — 2 décimos',
        price: 'Intercambio',
        user: 'Paco V.',
        emoji: '🎰'
    },
    {
        id: 3,
        type: 'Vendo',
        title: 'Zapatos de fallera niña T.28',
        price: '40€',
        user: 'Ana M.',
        emoji: '👠'
    },
    {
        id: 4,
        type: 'Busco',
        title: 'Costurera para arreglo de traje',
        price: 'Presupuesto',
        user: 'Luis G.',
        emoji: '🧵'
    },
    {
        id: 5,
        type: 'Regalo',
        title: 'Adornos pelo fallera vintage',
        price: 'Gratis',
        user: 'María P.',
        emoji: '💐'
    }
];
function SocialPage() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('chat');
    const [chatMsg, setChatMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedChannel, setSelectedChannel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('general');
    const tabs = [
        {
            key: 'chat',
            label: 'Chat',
            icon: '💬'
        },
        {
            key: 'muro',
            label: 'Muro Social',
            icon: '📰'
        },
        {
            key: 'votaciones',
            label: 'Votaciones',
            icon: '🗳️'
        },
        {
            key: 'galeria',
            label: 'Galería',
            icon: '📸'
        },
        {
            key: 'directorio',
            label: 'Directorio',
            icon: '📇'
        },
        {
            key: 'tablon',
            label: 'Tablón',
            icon: '📌'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "page-header",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "page-title",
                        children: "📱 Zona Social"
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 108,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "page-subtitle",
                        children: "Comunicación, redes y comunidad fallera"
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 107,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tabs",
                children: tabs.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `tab ${activeTab === t.key ? 'active' : ''}`,
                        onClick: ()=>setActiveTab(t.key),
                        children: [
                            t.icon,
                            " ",
                            t.label
                        ]
                    }, t.key, true, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 114,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 112,
                columnNumber: 13
            }, this),
            activeTab === 'chat' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-2 animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            padding: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--border-subtle)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Canales"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 129,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 128,
                                columnNumber: 25
                            }, this),
                            CHANNELS.map((ch)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setSelectedChannel(ch.id),
                                    className: "nav-item",
                                    style: {
                                        margin: '2px 8px',
                                        background: selectedChannel === ch.id ? 'rgba(249,115,22,0.1)' : undefined,
                                        color: selectedChannel === ch.id ? 'var(--accent-orange)' : undefined
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: ch.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 142,
                                            columnNumber: 33
                                        }, this),
                                        ch.unread > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "badge danger",
                                            style: {
                                                marginLeft: 'auto',
                                                fontSize: 11
                                            },
                                            children: ch.unread
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 143,
                                            columnNumber: 51
                                        }, this)
                                    ]
                                }, ch.id, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 132,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 127,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            padding: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "chat-container",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "chat-messages",
                                    children: MESSAGES.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "chat-message",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "chat-avatar",
                                                    style: {
                                                        background: m.color
                                                    },
                                                    children: m.avatar
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 152,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "chat-bubble",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "chat-bubble-name",
                                                            children: m.user
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/social/page.tsx",
                                                            lineNumber: 154,
                                                            columnNumber: 45
                                                        }, this),
                                                        m.text,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "chat-bubble-time",
                                                            children: m.time
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/social/page.tsx",
                                                            lineNumber: 156,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, m.id, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 151,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 149,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "chat-input-bar",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "input",
                                            placeholder: "Escribe un mensaje...",
                                            value: chatMsg,
                                            onChange: (e)=>setChatMsg(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "btn btn-primary",
                                            children: "Enviar"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 168,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 161,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/social/page.tsx",
                            lineNumber: 148,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 147,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 126,
                columnNumber: 17
            }, this),
            activeTab === 'muro' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                style: {
                    maxWidth: 680
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            marginBottom: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                className: "input textarea",
                                placeholder: "¿Qué quieres compartir con la falla?"
                            }, void 0, false, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 179,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn btn-primary",
                                    children: "📝 Publicar"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 180,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 178,
                        columnNumber: 21
                    }, this),
                    POSTS.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "feed-post",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "feed-post-header",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "chat-avatar",
                                            style: {
                                                background: p.color
                                            },
                                            children: p.avatar
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 187,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 600,
                                                        fontSize: 14
                                                    },
                                                    children: p.user
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: 'var(--text-muted)'
                                                    },
                                                    children: p.time
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 188,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "feed-post-content",
                                    children: p.text
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 193,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "feed-post-actions",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "feed-action-btn",
                                            children: [
                                                "❤️ ",
                                                p.likes
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 195,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "feed-action-btn",
                                            children: [
                                                "💬 ",
                                                p.comments
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 196,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "feed-action-btn",
                                            children: "🔗 Compartir"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 197,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 194,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, p.id, true, {
                            fileName: "[project]/src/app/social/page.tsx",
                            lineNumber: 185,
                            columnNumber: 25
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 177,
                columnNumber: 17
            }, this),
            activeTab === 'votaciones' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                style: {
                    maxWidth: 680
                },
                children: POLLS.map((poll)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            marginBottom: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: 16
                                        },
                                        children: poll.question
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 210,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `badge ${poll.status === 'Activa' ? 'success' : 'info'}`,
                                        children: poll.status
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 209,
                                columnNumber: 29
                            }, this),
                            poll.options.map((opt, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "poll-option",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "poll-option-bar",
                                            style: {
                                                width: `${opt.pct}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 215,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "poll-option-content",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: opt.text
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: 600,
                                                        color: 'var(--accent-orange)'
                                                    },
                                                    children: [
                                                        opt.pct,
                                                        "% (",
                                                        opt.votes,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 216,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 214,
                                    columnNumber: 33
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 12,
                                    color: 'var(--text-muted)',
                                    marginTop: 12
                                },
                                children: [
                                    poll.total,
                                    " votos totales"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 222,
                                columnNumber: 29
                            }, this)
                        ]
                    }, poll.id, true, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 208,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 206,
                columnNumber: 17
            }, this),
            activeTab === 'galeria' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid-3",
                    children: GALLERY_ALBUMS.map((album)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "card-glass",
                            style: {
                                textAlign: 'center',
                                cursor: 'pointer'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 56,
                                        marginBottom: 12
                                    },
                                    children: album.cover
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 236,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontWeight: 600,
                                        fontSize: 15
                                    },
                                    children: album.name
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 237,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 13,
                                        color: 'var(--text-secondary)',
                                        marginTop: 4
                                    },
                                    children: [
                                        album.count,
                                        " fotos"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 238,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, album.id, true, {
                            fileName: "[project]/src/app/social/page.tsx",
                            lineNumber: 235,
                            columnNumber: 29
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/social/page.tsx",
                    lineNumber: 233,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 232,
                columnNumber: 17
            }, this),
            activeTab === 'directorio' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            marginBottom: 20
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            className: "input",
                            placeholder: "🔍 Buscar profesional..."
                        }, void 0, false, {
                            fileName: "[project]/src/app/social/page.tsx",
                            lineNumber: 249,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 248,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid-3",
                        children: DIRECTORY.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "feature-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature-item-icon",
                                        children: d.emoji
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 254,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature-item-title",
                                        children: d.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "feature-item-desc",
                                        children: d.profession
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 256,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 12,
                                            color: 'var(--accent-blue)',
                                            marginTop: 8
                                        },
                                        children: [
                                            "📞 ",
                                            d.phone
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 253,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 251,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 247,
                columnNumber: 17
            }, this),
            activeTab === 'tablon' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-in",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "section-title",
                                style: {
                                    margin: 0
                                },
                                children: "📌 Tablón de Anuncios"
                            }, void 0, false, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 268,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-primary",
                                children: "+ Nuevo Anuncio"
                            }, void 0, false, {
                                fileName: "[project]/src/app/social/page.tsx",
                                lineNumber: 269,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 267,
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Tipo"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/social/page.tsx",
                                                lineNumber: 275,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Artículo"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/social/page.tsx",
                                                lineNumber: 276,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Precio"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/social/page.tsx",
                                                lineNumber: 277,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Anunciante"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/social/page.tsx",
                                                lineNumber: 278,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/social/page.tsx",
                                        lineNumber: 274,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 273,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: CLASSIFIEDS.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `badge ${c.type === 'Vendo' ? 'success' : c.type === 'Busco' ? 'warning' : c.type === 'Regalo' ? 'purple' : 'info'}`,
                                                        children: [
                                                            c.emoji,
                                                            " ",
                                                            c.type
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/social/page.tsx",
                                                        lineNumber: 284,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: c.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 285,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        fontWeight: 600
                                                    },
                                                    children: c.price
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: c.user
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/social/page.tsx",
                                                    lineNumber: 287,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/src/app/social/page.tsx",
                                            lineNumber: 283,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/social/page.tsx",
                                    lineNumber: 281,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/social/page.tsx",
                            lineNumber: 272,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/social/page.tsx",
                        lineNumber: 271,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/social/page.tsx",
                lineNumber: 266,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/social/page.tsx",
        lineNumber: 106,
        columnNumber: 9
    }, this);
}
_s(SocialPage, "tTDSaIpKYbfohIZ0y6hN56d1WNc=");
_c = SocialPage;
var _c;
__turbopack_context__.k.register(_c, "SocialPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_social_page_tsx_a6907e65._.js.map