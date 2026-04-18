# porkxi-astro - Estado actual

## Descripción
Sitio estático para comparar inventario porcino entre Colombia, UE-27 y EE.UU., con monitoreo de fuentes y análisis IA ejecutado en el navegador.

## Stack
- Astro 6 (`output: static`)
- Vue 3 (`client:idle` y `client:load`)
- Python 3.12 (pipeline snapshot)
- Node 22+

## Componentes activos
- `GraficaInteractiva.vue`: serie histórica por país + vista comparada.
- `MonitoreoFuentes.vue`: snapshot diario desde `public/estado-fuentes.json` (sin botón de sincronización manual).
- `AnalisisIA.vue`: selector de modelo y análisis local.

## IA frontend (estado real)
- Selección manual de modelo al inicio (no autoload inicial).
- Modelos de selección:
  - `onnx-community/SmolLM2-135M-ONNX` (pequeño)
  - `onnx-community/LFM2.5-350M-ONNX` (mediano)
- Fallback de carga: `Qwen3-0.6B-DQ-ONNX` -> `Qwen3-0.6B-ONNX` -> `gpt2-medium-ONNX`.
- Carga con variantes WebGPU/CPU (`q4f16`, `q4`, `q8`) para compatibilidad.
- Limpieza de eco de prompt + validación mínima de salida; fallback textual local si no cumple.

## Datos
- Fuentes base en `src/data/{colombia,europa,usa}.js`.
- Snapshot de monitoreo: `public/estado-fuentes.json`.
- Datasets públicos: `public/data/*.json` y `public/data/serie-completa.csv`.
- Script de actualización: `scripts/generar_estado_fuentes.py` (también ejecuta `scripts/generar_datasets_publicos.mjs`).

## Deploy y workflows
- GitHub Pages: `.github/workflows/deploy-pages.yml` (push a `master`).
- Actualización diaria de snapshot/datasets: `.github/workflows/actualizar-fuentes.yml`.
- CI de build: `.github/workflows/ci.yml`.

## Diseño
- Fondo unificado crema y tarjetas en misma línea visual.
- Enfoque en lectura editorial + visualización interactiva ligera.
