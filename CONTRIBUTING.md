# Modelo de ramas — Git Flow

Este proyecto sigue el flujo de trabajo **Git Flow**.

## Ramas permanentes

- **master**: código en producción. Cada entrega se etiqueta (ej. `v1.0.0`) y
  se despliega automáticamente (Vercel para el frontend, Render para el backend).
- **develop**: rama de integración. Todo el trabajo nuevo se integra aquí antes
  de pasar a producción.

## Ramas temporales

- **feature/&lt;nombre&gt;**: una funcionalidad nueva. Nace de `develop` y se
  mezcla de vuelta en `develop`.
- **release/&lt;version&gt;**: preparación de una entrega. Nace de `develop`; al
  terminar se mezcla en `master` (con etiqueta de versión) y de vuelta en `develop`.
- **hotfix/&lt;nombre&gt;**: corrección urgente de producción. Nace de `master`;
  se mezcla en `master` (con etiqueta) y en `develop`.

## Ciclo de una funcionalidad

1. `git checkout develop && git pull`
2. `git checkout -b feature/mi-funcionalidad`
3. Commits descriptivos.
4. Pull request de `feature/...` hacia **`develop`**.
5. Revisión y merge a `develop`.

## Entrega (release)

1. `git checkout -b release/x.y.z develop`
2. Ajustes finales y número de versión.
3. Merge a `master` + etiqueta `vX.Y.Z` (despliega a producción).
4. Merge de vuelta a `develop`.

## Corrección urgente (hotfix)

1. `git checkout -b hotfix/descripcion master`
2. Arreglo + etiqueta `vX.Y.Z+1`.
3. Merge a `master` y a `develop`.

## Convención de commits

`tipo: descripción corta` — tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

> Para usar los comandos `git flow` (opcional), instala la extensión git-flow y
> ejecuta `git flow init -d` (master = producción, develop = develop).
