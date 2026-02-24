/**
 * geminiService.ts
 * Llama directamente a la REST API de Gemini — 100% compatible con navegadores.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent';

const SYSTEM_INSTRUCTION = `Eres el asistente inteligente de gestión de la Falla Eduardo Merello 2026, llamado "Merello AI".

REGLAS OBLIGATORIAS:
1. Responde ÚNICA Y EXCLUSIVAMENTE en ESPAÑOL.
2. Usa párrafos cortos (máximo 2-3 líneas).
3. Usa listas con guiones (-) para enumerar datos o pasos.
4. Usa MAYÚSCULAS para resaltar cifras importantes.
5. Basa tus respuestas en los DATOS ACTUALES JSON proporcionados.
6. Si el dato no está en el JSON, di "no tengo ese dato registrado". NO INVENTES CIFRAS.
7. Sé práctico, concreto y directo. Eres un gestor fallero veterano.
8. Respuestas breves para lectura cómoda en móvil.`;

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (key) return key;
  console.warn('[Merello AI] VITE_GEMINI_API_KEY no encontrada en .env.local');
  return '';
};

export const generateFallasAdvice = async (
  prompt: string,
  contextData: string
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return '⚠️ Sin clave API configurada. Verifica que VITE_GEMINI_API_KEY está en el archivo .env.local y reinicia el servidor.';
  }

  const fullPrompt = `DATOS ACTUALES DE LA FALLA (JSON):\n${contextData}\n\nPREGUNTA: ${prompt}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        }
      })
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || res.statusText;
      console.error('[Merello AI] Error HTTP', res.status, errMsg);

      if (res.status === 400) return `Error de configuración (400): ${errMsg}`;
      if (res.status === 403) return '🔒 Clave API inválida o sin permisos para Gemini (error 403). Verifica la clave en .env.local';
      if (res.status === 429) return '⏳ Demasiadas peticiones a la IA (error 429). Espera unos segundos e inténtalo de nuevo.';
      return `Error ${res.status}: ${errMsg}`;
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('[Merello AI] Respuesta vacía:', JSON.stringify(json));
      return 'La IA no generó una respuesta. Inténtalo de nuevo.';
    }

    return text;
  } catch (err: any) {
    console.error('[Merello AI] Error de red:', err);
    if (err?.message?.includes('fetch')) {
      return '📡 Error de conexión. Comprueba tu internet e inténtalo de nuevo.';
    }
    return `Error inesperado: ${err?.message || 'desconocido'}`;
  }
};
