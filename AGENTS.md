# porkxi-astro - Estado actual

## Descripción
Aplicación web para visualizar y comparar inventario porcino entre Colombia, Europa (UE-27) y EE.UU. con Astro + Vue.

## Stack
- Astro 6 (sitio estático)
- Vue 3 para interactividad (`client:idle`)
- Python 3.12 para actualización de snapshot

## Arquitectura
- Render estático para SEO y bajo costo (Vercel Free / GitHub Pages)
- Componentes Vue:
  - GraficaInteractiva.vue (gráfica histórica)
  - AnalisisIA.vue (análisis con Qwen3)
  - DescargarReporte.vue (reporte HTML)
  - MonitoreoFuentes.vue (estado de fuentes)
- Datos en: `public/estado-fuentes.json`, `public/data/inventario-unificado.json`

## IA Generativa (Frontend)
- Modelo principal: `onnx-community/Qwen3-0.6B-DQ-ONNX` via `@huggingface/transformers`
- Modelo de respaldo: `onnx-community/Qwen3-0.6B-ONNX`
- 100% ejecutándose en el navegador del usuario
- Sin costos de API externa
- Análisis varía con cada click en "↻"

## Monitoreo de fuentes
- `MonitoreoFuentes.vue` consume `public/estado-fuentes.json` como snapshot diario
- El snapshot se actualiza por script (`scripts/generar_estado_fuentes.py`) y workflow diario
- El botón "Sincronizar datos" dispara `/api/sincronizar-fuentes` para lanzar actualización manual

## Fondos y Diseño
- Fondo unificado: #F9F6F1 (blanco hueso)
- Sin separadores visuales
- Tarjetas y gráfica con mismo fondo

## Limpieza
- Se mantiene endpoint puntual `/api/sincronizar-fuentes` para sincronización manual
- JSONs no utilizados eliminados
- InsightsComparativas eliminado
- Sin referencias a Gemini
