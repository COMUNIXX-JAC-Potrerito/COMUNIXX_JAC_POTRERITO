# COMUNIX — Frontend (Angular)

Interfaz web del Sistema de Gestión y Comunicación Comunitaria para la **Junta de Acción
Comunal (JAC) de la Vereda Potrerito**. La API REST está en
[Backend-FastApi](https://github.com/COMUNIXX-JAC-Potrerito/Backend-FastApi).

Proyecto formativo — SENA, Tecnología en Análisis y Desarrollo de Software (ADSO), ficha 3223873.

**Producción:** <https://comunix.vercel.app>

## Qué incluye

- **Portal público:** inicio, radicar PQRS (pública o anónima, con adjunto), consultar el
  estado por código, publicaciones, encuestas y censos, registro e inicio de sesión.
- **Panel JAC** (administradores y superadministradores): bandejas de PQRS tipo correo
  (entrantes, mis asignadas, mis PQRS, historial), publicaciones, comunicaciones y envío
  masivo, encuestas, chat entre dignatarios, **información y estadísticas**, y gestión de
  usuarios y roles.
- Diseño responsive, cierre de sesión por inactividad (15 minutos) y por vencimiento del token.

## Tecnologías

Angular 20 (componentes standalone y signals) · TypeScript · RxJS · SCSS ·
Jasmine + Karma · Vercel.

## Estructura

```
src/app/
  pages/          # una carpeta por pantalla (portal público y panel JAC)
  services/       # llamadas a la API, sesión e inactividad
  guards/         # authGuard: solo dignatarios entran al panel
  interceptors/   # agrega el token JWT y maneja la sesión vencida (401)
  models/         # tipos de datos y catálogos (estados, tipos, comités)
  shared/         # formato de fechas y etiquetas, pipes reutilizables
src/environments/ # URL de la API para desarrollo y producción
```

## Instalación y ejecución local

Requisitos: Node.js 22 o superior y el backend corriendo en local (ver su README).

```bash
npm ci        # instala las dependencias exactas de package-lock.json
npm start     # servidor de desarrollo en http://localhost:4200
```

En desarrollo la app usa la API de `src/environments/environment.ts`
(`http://127.0.0.1:8000/api`); el build de producción usa `environment.prod.ts`.

## Pruebas y build

```bash
npx ng test --watch=false --browsers=ChromeHeadless   # pruebas unitarias
npm run build                                         # build de producción en dist/
```

## Despliegue

Vercel construye y publica automáticamente: `master` va a producción
(<https://comunix.vercel.app>) y cada rama o pull request genera una vista previa.
`vercel.json` define la reescritura de rutas de la SPA y las cabeceras de seguridad.

## Flujo de trabajo

Git Flow (`master`, `develop`, `feature/*`, `release/*`, `hotfix/*`): ver
[CONTRIBUTING.md](CONTRIBUTING.md). Los cambios de cada versión están en
[CHANGELOG.md](CHANGELOG.md).

## Equipo

| Integrante | Rol |
|---|---|
| Juan Camilo Montes Velásquez | Líder del proyecto y desarrollador backend |
| Simón Carmona Toro | Administrador de base de datos, documentación y soporte full-stack |
| David Alejandro Orozco | Desarrollador frontend y diseñador UX/UI |

## Uso de inteligencia artificial

En el desarrollo se usó asistencia de IA (Claude Code) para auditorías, pruebas
automatizadas, documentación y parte de la implementación. El equipo revisó los cambios y es
responsable del código entregado.

## Licencia

[MIT](LICENSE) © 2026 equipo COMUNIX.
