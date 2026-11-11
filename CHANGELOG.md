# Historial de cambios — COMUNIX Frontend (Angular)

Todos los cambios relevantes del frontend se registran aquí. Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); las versiones siguen
[Versionado Semántico](https://semver.org/lang/es/) y cada una tiene su etiqueta en Git.

## [Sin publicar]

### Agregado
- El superadministrador puede corregir el comité de una PQRS desde el Historial
  (RN-012; el administrador sigue sin poder reasignarlo, y ahora lo impide también el backend).
- Licencia MIT (`LICENSE`) y este historial de cambios.

## [1.1.0] — 2026-11-10

### Agregado
- Tablero de **Información y estadísticas**: indicadores, gráficos por estado, tipo, mes y
  carga por comité, filtro de periodo y tabla de datos.
- 22 pruebas unitarias (formato, sesión y estadísticas).
- Cabeceras de seguridad en Vercel (`vercel.json`).

### Corregido
- Ortografía en pantalla: "Petición", "En proceso", "En espera"; página en español.
- Fechas en hora de Colombia y en español; la fecha de una actividad ya no se corre un día.
- Sesión: el token vencido y los errores 401 llevan al login; sincroniza entre pestañas.
- Confirmación antes de borrar y del envío masivo; errores visibles en bitácora y chat.

### Cambiado
- Producción ahora en **https://comunix.vercel.app** (proyecto `comunix` en Vercel).

## [1.0.0] — 2026-11-09

Primera entrega en producción (Vercel). Portal público (radicar y consultar PQRS,
publicaciones, encuestas, registro) y Panel JAC (bandejas de PQRS tipo correo, chat entre
dignatarios, comunicaciones, envío masivo, encuestas, reportes y gestión de usuarios),
diseño responsive y cierre de sesión por inactividad (15 minutos).

[Sin publicar]: https://github.com/COMUNIXX-JAC-Potrerito/COMUNIXX_JAC_POTRERITO/compare/v1.1.0...develop
[1.1.0]: https://github.com/COMUNIXX-JAC-Potrerito/COMUNIXX_JAC_POTRERITO/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/COMUNIXX-JAC-Potrerito/COMUNIXX_JAC_POTRERITO/releases/tag/v1.0.0
