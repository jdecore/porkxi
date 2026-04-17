# porkxi-astro - Estado actual

## Descripción
Aplicación web para visualizar y comparar inventario porcino entre Colombia, Europa (UE-27) y EE.UU. con Astro + Vue.

## Stack
- Astro 6 (sitio estático)
- Vue 3 para interactividad puntual (`client:idle`)
- Python 3.12 para actualización de snapshot de fuentes

## Arquitectura relevante
- Render principal estático para SEO y bajo costo.
- Componentes interactivos en Vue:
  - `GraficaInteractiva.vue`
  - `TarjetasKpiAnimadas.vue`
  - `MonitoreoFuentes.vue`
  - `AnalisisIA.vue`
  - `InsightsComparativas.vue`
- Fuente única de datos de gráfica: `src/lib/datos-grafico.js`.
- Snapshot público diario: `public/estado-fuentes.json`.
- Datasets públicos enriquecidos: `public/data/*.json` + `public/data/serie-completa.csv`.

## Optimización para Vercel Free
- Sin rutas `/api` activas en producción.
- Sin invocaciones serverless por visita.
- Monitoreo y análisis IA se leen desde snapshot estático.
- Insights de mercado se leen desde archivos estáticos en `public/data`.
- Actualización diaria con GitHub Actions (`.github/workflows/actualizar-fuentes.yml`).

## Compatibilidad GitHub Pages
- Configuración Astro preparada para despliegue dual:
  - `DEPLOY_TARGET=vercel` (con adapter Vercel)
  - `DEPLOY_TARGET=pages` (sin adapter, con `ASTRO_BASE`)
- Workflow dedicado: `.github/workflows/deploy-pages.yml`.

## Estado de IA en frontend
- `AnalisisIA.vue` muestra análisis automáticamente al cargar.
- El texto viene de `estado-fuentes.json -> analisis_ia`.
- IA generativa local (Transformers.js en cliente)

- Análisis con Qwen3-0.8B-Instruct en navegador
- Automatización (workflow diario)
- Monitoreo (estado de fuentes y recencia de reportes)
- Backend con Python (pipeline de snapshot)

Pendiente para alineación completa:
- incorporar una capa de base de datos (ej. SQLite/PostgreSQL) para historial de snapshots y consultas.
