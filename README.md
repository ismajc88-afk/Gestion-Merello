# 🎊 Merello Planner 2026 - Versión Mejorada

> Sistema ERP completo para la gestión profesional de Fallas Valencianas

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

Una Progressive Web App moderna y segura diseñada específicamente para la gestión integral de fallas valencianas, cubriendo finanzas, inventario, logística, planificación de eventos y mucho más.

## ✨ Características Principales

### 💰 Gestión Financiera
- Control de ingresos y gastos con categorización
- Presupuestos por categoría con seguimiento
- Análisis de rentabilidad de barra
- Informes y reportes automáticos
- Control de inversiones y ROI

### 📦 Gestión de Inventario
- Control de stock en tiempo real
- Alertas automáticas de stock mínimo
- Seguimiento por ubicación (Barra/Cocina/Almacén)
- Trazabilidad de consumos
- Sistema de incidencias

### 🍽️ Planificación de Comidas
- Calendario de eventos (comidas/cenas)
- Cálculo automático de ingredientes por persona
- Generación de listas de compra
- Gestión de asistentes y alergias
- Control de costes por evento

### 👥 Gestión de Miembros
- Base de datos de falleros
- Asignación de roles y permisos
- Control de asistencia
- Gestión de datos de emergencia

### 📋 Logística y Tareas
- Sistema de tareas con prioridades
- Asignación a responsables
- Seguimiento de estado
- Subtareas y deadlines
- Grupos de trabajo

### 🍺 Gestión de Barra
- TPV modo kiosko (venta)
- Control de consumos
- Gestión de sesiones de barra
- Sistema de tickets
- Análisis de rentabilidad

### 🔔 Sistema de Alertas Avanzado
- Notificaciones push (OneSignal)
- Alertas móviles (Ntfy.sh)
- Sincronización P2P (WebRTC)
- BroadcastChannel para tabs locales
- Vibración háptica y beeps

### 🤖 Asistente con IA
- Asistente "Chispas" con Gemini AI
- Respuestas contextuales
- Sugerencias inteligentes
- Análisis de datos

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.2
- **Build Tool**: Vite 5.1
- **Styling**: TailwindCSS 3.4 (build-time compilation)
- **State Management**: Zustand 4.5
- **Charts**: Recharts 2.12
- **Icons**: Lucide React
- **AI**: Google Gemini AI
- **P2P Sync**: Trystero (WebRTC)
- **Notifications**: OneSignal + Ntfy.sh
- **PWA**: Service Workers + Manifest

## 📦 Instalación

### Prerequisitos

- Node.js >= 18.0.0
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/merello-planner-2026.git
cd merello-planner-2026
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Edita `.env.local` y añade tus claves API:
```env
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
VITE_ONESIGNAL_APP_ID=tu_id_de_onesignal
VITE_NTFY_TOPIC=merello-planner-2026-global-alerts
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

5. **Build para producción**
```bash
npm run build
```

Los archivos de producción estarán en la carpeta `dist/`

## 🔐 Seguridad

### Mejoras de Seguridad Implementadas

✅ **API Keys seguras**
- Variables de entorno en lugar de hardcoding
- No se exponen en el código fuente
- Carga mediante Vite

✅ **Hashing de PINs**
- SHA-256 con Web Crypto API
- Soporte para salt
- Rate limiting de intentos de login

✅ **TypeScript Strict Mode**
- Tipos estrictos activados
- Null checks obligatorios
- Prevención de errores en tiempo de compilación

## 📱 PWA Features

- ✅ Instalable como app nativa
- ✅ Funciona offline (parcial)
- ✅ Service Worker para caching
- ✅ Manifest configurado
- ✅ Push notifications
- ✅ Safe area insets (iOS)
- ✅ Optimizado para móvil

## 🔑 Roles y Permisos

Por defecto, la aplicación soporta los siguientes roles:

- **ADMIN**: Acceso completo
- **TESORERIA**: Gestión financiera
- **LOGISTICA**: Tareas y coordinación
- **BARRA**: Gestión de barra
- **CAMARERO**: Dispensación de productos
- **CAJERO**: Punto de venta (TPV)
- **FALLERO**: Consulta básic a
- **KIOSKO_VENTA**: TPV especializado
- **KIOSKO_CASAL**: Control de consumo casal

Los PINs se configuran en el panel de administración.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecuta en modo desarrollo

# Build
npm run build        # Compila TypeScript + Vite build

# Preview
npm run preview      # Preview del build de producción
```

## 📖 Estructura del Proyecto

```
merello-planner-2026/
├── components/          # Componentes React (27 módulos)
│   ├── AdminControlPanel.tsx
│   ├── BarProfitManager.tsx
│   ├── Dashboard.tsx
│   └── ...
├── hooks/              # Custom hooks
│   └── useAppData.ts
├── services/           # Servicios externos
│   └── geminiService.ts
├── utils/              # Utilidades
│   ├── security.ts
│   └── hash.ts         # Hashing de PINs
├── types.ts            # Tipos TypeScript
├── App.tsx             # Componente principal
├── index.tsx           # Entry point
├── index.css           # Estilos globales + Tailwind
└── index.html          # HTML base
```

## 🔄 Sincronización

La app soporta múltiples métodos de sincronización:

1. **LocalStorage**: Persistencia local automática
2. **P2P (WebRTC)**: Sincronización entre dispositivos en la misma red
3. **BroadcastChannel**: Sincronización entre pestañas del navegador
4. **Ntfy.sh**: Alertas push móviles

## 📊 Performance

- ⚡ First Contentful Paint < 1.5s
- ⚡ Bundle size optimizado con tree-shaking
- ⚡ TailwindCSS compilado (no CDN)
- ⚡ Lazy loading de componentes
- ⚡ Memoization con React.memo

## 🌐 Deploy

### Netlify

1. Conecta tu repositorio
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel

1. Conecta tu repositorio
2. Framework preset: Vite
3. Configura las variables de entorno
4. Deploy

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👨‍💻 Autor

Desarrollado con ❤️ para la Falla Eduardo Merello

## 🙏 Agradecimientos

- Google Gemini AI
- TailwindCSS
- React Team
- Vite Team
- Comunidad Open Source

---

**¿Preguntas o sugerencias?** Abre un issue en GitHub.
