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
| `npm run update:datasets` | Genera `public/data/*.json` y `public/data/serie-completa.csv` |

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

## Datasets enriquecidos (sin costo serverless)

Además de `estado-fuentes.json`, el pipeline genera:

- `public/data/historico-inventario.json`
- `public/data/transparencia.json`
- `public/data/sacrificio-anual-ue.json`
- `public/data/ciclo-reproductivo-ue.json`
- `public/data/precios-comercio.json`
- `public/data/serie-completa.csv`

`InsightsComparativas.vue` consume estos archivos desde frontend estático, por lo que no suma invocaciones en Vercel Free.

## Variables de entorno

- `GEMINI_API_KEY` (opcional para generación IA del snapshot)
- `DEPLOY_TARGET` (`vercel` o `pages`)
- `ASTRO_BASE` (ejemplo: `/porkxi/` para GitHub Pages de proyecto)
- `SITE_URL` (URL pública del despliegue)

Para GitHub Actions, configúrala como secret del repositorio.

## Qué debes hacer para GitHub Pages

1. En GitHub: **Settings → Pages → Source = GitHub Actions**.
2. Asegura que la rama principal sea `main`.
3. Deja activo `.github/workflows/deploy-pages.yml` (ya incluido).
4. Si tu repo no se llama `porkxi`, el workflow usa automáticamente el nombre real para `ASTRO_BASE`.
5. Al terminar el workflow, abre la URL publicada en el environment **github-pages**.
