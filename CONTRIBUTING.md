# Contribuir a Merello Planner

¡Gracias por tu interés en contribuir a Merello Planner!

## Cómo empezar

1.  Asegúrate de tener Node.js >= 18.0.0 instalado.
2.  Clona el repositorio.
3.  Instala las dependencias con `npm install`.
4.  Configura las variables de entorno en `.env.local` (ver `.env.example`).

## Flujo de Trabajo

1.  Crea una rama para tu feature o fix: `git checkout -b feature/nueva-funcionalidad`
2.  Realiza tus cambios siguiendo los estándares de código.
3.  Ejecuta los tests para asegurar que no hay regresiones: `npm test`
4.  Haz commit de tus cambios: `git commit -m 'feat: descripción breve'`
5.  Haz push a tu rama y abre un Pull Request.

## Estándares de Código

- **TypeScript**: Usamos modo estricto (`strict: true`). Evita el uso de `any` siempre que sea posible.
- **Estilos**: Usamos **TailwindCSS**. Evita estilos inline o archivos CSS separados salvo excepciones.
- **Estado**: Usamos **Zustand** para el estado global (`useStore.ts`).
- **Componentes**: React Functional Components con Hooks. Intenta mantenerlos pequeños y reutilizables.
- **Testing**: Escribe tests unitarios para lógica crítica (utils, hooks complejos) usando Vitest.

## Reportar Bugs

Si encuentras un bug, por favor abre un issue en GitHub describiendo:
1.  El comportamiento esperado.
2.  El comportamiento actual.
3.  Pasos para reproducirlo.
4.  Capturas de pantalla (si aplica).
