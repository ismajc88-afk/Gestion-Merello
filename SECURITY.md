# Política de Seguridad

Merello Planner toma su seguridad muy en serio.

## Versiones Soportadas

| Versión | Soportada          |
| ------- | ------------------ |
| v1.x    | ✅                 |
| < v1.0  | ❌                 |

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad crítica, por favor NO abras un issue público.
Envía un correo electrónico a `security@merello-planner.com` o contacta directamente con el administrador del sistema.

## Medidas de Seguridad Implementadas

- **Hashing seguro**: PINs protegidos con SHA-256 y Salt.
- **Rate Limiting**: Bloqueo tras 5 intentos fallidos de login.
- **No exposición de claves**: Las claves API (Gemini, OneSignal) no se incluyen en el código fuente.
- **Validación de Datos**: Validación estricta en formularios y modelos TypeScript.
- **Auditoría**: Ejecutamos regularmente `npm audit` para detectar dependencias vulnerables.
- **CSP**: Content Security Policy estrictas (si aplica).

## Buenas Prácticas para Usuarios

- No compartas tu PIN con nadie.
- Usa contraseñas seguras para los servicios externos (OneSignal, Gemini).
- Mantén el navegador actualizado para garantizar la seguridad de la PWA.
