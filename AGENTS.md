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
- Fuente única de datos de gráfica: `src/lib/datos-grafico.js`.
- Snapshot público diario: `public/estado-fuentes.json`.

## Optimización para Vercel Free
- Sin rutas `/api` activas en producción.
- Sin invocaciones serverless por visita.
- Monitoreo y análisis IA se leen desde snapshot estático.
- Actualización diaria con GitHub Actions (`.github/workflows/actualizar-fuentes.yml`).

## Estado de IA en frontend
- `AnalisisIA.vue` muestra análisis automáticamente al cargar.
- El texto viene de `estado-fuentes.json -> analisis_ia`.
- Si hay `GEMINI_API_KEY`, el snapshot usa Gemini.
- Si no hay clave, se genera fallback automático para no dejar el bloque vacío.

## Estado de Europa en frontend
- Datos históricos de Europa en `src/data/europa.js` (fuente Eurostat).
- Filtros y visualización integrados en `GraficaInteractiva.vue`.
- Monitoreo de fuente europea integrado en `MonitoreoFuentes.vue`.

## Adaptación para portafolio junior (Glovar)
El proyecto ya evidencia:
- IA generativa (Gemini en generación de snapshot)
- Automatización (workflow diario)
- Monitoreo (estado de fuentes y recencia de reportes)
- Backend con Python (pipeline de snapshot)

Pendiente para alineación completa:
- incorporar una capa de base de datos (ej. SQLite/PostgreSQL) para historial de snapshots y consultas.
