// Extendemos la interfaz NodeJS global para añadir nuestra API_KEY
// sin redeclarar la variable
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_ONESIGNAL_APP_ID: string
  readonly VITE_NTFY_TOPIC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}