
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

// Modelos de respaldo: si uno está saturado, prueba el siguiente
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const getApiKey = (): string => {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  try {
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      return (window as any).process.env.API_KEY;
    }
  } catch (e) { }
  console.warn('Gemini API Key not found. Please set VITE_GEMINI_API_KEY in .env.local');
  return '';
}

const getAiInstance = () => {
  if (!aiInstance) {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("Gemini Service: API Key no encontrada en el entorno.");
      throw new Error("API Key missing");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const SYSTEM_PROMPT = `Eres 'Chispas', el Asistente de Gestión de la Falla Merello 2026.

REGLAS DE RESPUESTA (OBLIGATORIAS):
1.  **IDIOMA:** Responde ÚNICA Y EXCLUSIVAMENTE en **ESPAÑOL**.
2.  **ESTRUCTURA:**
    *   Usa **párrafos cortos** (máximo 2-3 líneas).
    *   Usa **listas con guiones (-)** para enumerar datos o pasos.
    *   Usa MAYÚSCULAS para resaltar palabras clave o cifras importantes (ej: "PRESUPUESTO: 500€").
    *   Evita bloques de texto densos. La legibilidad en móvil es prioridad.
3.  **VERACIDAD Y DATOS:**
    *   Basa tus respuestas estrictamente en el JSON de 'DATOS ACTUALES'.
    *   Si te preguntan un dato (dinero, stock, nombres) que NO está en el JSON, di: "No tengo ese dato registrado". **NO INVENTES CIFRAS**.
4.  **CONSEJOS EXPERTOS:**
    *   Si piden ideas (menús, organización), actúa como un gestor fallero veterano: práctico, ahorrador y eficiente.
    *   Usa jerga fallera con moderación (Casal, Mascletà, "Fer Falla") para dar contexto, pero mantén la profesionalidad.

TU OBJETIVO: Dar una respuesta útil, rápida y fácil de leer para un directivo ocupado.`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateFallasAdvice = async (prompt: string, contextData: string): Promise<string> => {
  const ai = getAiInstance();

  // Intentar con cada modelo disponible (fallback automático si hay 429)
  for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
    const model = MODELS[modelIdx];

    // Hasta 2 reintentos por modelo
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Chispas AI] Intentando modelo: ${model} (intento ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model,
          contents: `DATOS ACTUALES DE LA FALLA (JSON): ${contextData}\n\nPREGUNTA DEL USUARIO: ${prompt}`,
          config: {
            temperature: 0.4,
            systemInstruction: SYSTEM_PROMPT,
          }
        });
        return response.text || "No he podido generar una respuesta coherente.";
      } catch (error: any) {
        const msg = error.message || error.toString();
        console.warn(`[Chispas AI] Error con ${model}: ${msg.substring(0, 120)}`);

        // Si es error de cuota (429), esperar e intentar con el siguiente modelo
        if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
          if (attempt === 0) {
            // Primer intento: esperar 3 segundos y reintentar mismo modelo
            await sleep(3000);
            continue;
          }
          // Segundo intento fallido: pasar al siguiente modelo
          console.log(`[Chispas AI] Modelo ${model} saturado, probando siguiente...`);
          break;
        }

        // Errores no recuperables: devolver mensaje claro
        if (msg.includes("API Key") || msg.includes("API key")) {
          return "🔑 Error de Configuración: No se detecta una Clave API válida. Verifica el archivo .env.local";
        }
        if (msg.includes("403")) return "🔒 Clave API inválida o sin permisos para Gemini (error 403). Verifica la clave en .env.local";
        if (msg.includes("404")) return "❌ El modelo configurado no está disponible. Contacta al administrador.";
        if (msg.includes("fetch failed")) return "📡 Error de Conexión: No se pudo contactar con Google Gemini. Revisa tu internet.";

        return `Lo siento, ocurrió un error técnico: ${msg.substring(0, 100)}...`;
      }
    }
  }

  // Si todos los modelos están saturados
  return "⏳ Los servidores de IA están saturados en este momento. Todos los modelos disponibles han alcanzado su límite. Inténtalo en unos minutos.";
};
