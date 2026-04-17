# porkxi-astro

Visualización de inventario porcino Colombia vs Europa (UE-27) vs EE.UU. construida con Astro + Vue.

## Stack

- Astro 6 (output estático)
- Vue 3 (`client:idle` en componentes interactivos)
- Python 3.12 para generación de snapshots de datos

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run check` | Validación Astro |
| `npm run build` | Build de producción |
| `npm run preview` | Preview local |
| `npm run update:fuentes` | Genera `public/estado-fuentes.json` |

## Frontend y cuota Vercel Free

El sitio está optimizado para plan Hobby:

- No usa funciones `/api` en producción.
- `MonitoreoFuentes.vue` y `AnalisisIA.vue` leen `public/estado-fuentes.json`.
- El snapshot se actualiza diariamente con GitHub Actions (`.github/workflows/actualizar-fuentes.yml`).

Esto evita consumo por invocaciones serverless en cada visita.

## Snapshot diario con análisis IA

`scripts/scraper_usda.py` genera:

- estado de fuentes (USDA + Eurostat + Porcinews)
- bloque `analisis_ia` consumido por el frontend

Si existe `GEMINI_API_KEY`, usa Gemini para redactar el análisis.
Si no existe, usa un fallback automático para mantener el contenido visible.

## Variables de entorno

- `GEMINI_API_KEY` (opcional para generación IA del snapshot)

Para GitHub Actions, configúrala como secret del repositorio.
