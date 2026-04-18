# porkxi-astro

Visualización comparativa de inventario porcino entre **Colombia**, **UE-27** y **EE.UU.** con Astro + Vue, datos públicos y análisis IA en navegador.

## Stack y ejecución

- Astro 6 (`output: static`)
- Vue 3 (`client:idle` y `client:load`)
- Python 3.12 (actualización de snapshot)
- Node.js 22.12+

| Comando | Acción |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run check` | Diagnóstico Astro |
| `npm run build` | Build de producción (`dist/`) |
| `npm run update:fuentes` | Regenera `public/estado-fuentes.json` y `public/data/*` |
| `npm run update:datasets` | Regenera datasets públicos desde `src/data/*` |

## Arquitectura actual

- Sitio estático con SEO (meta tags + JSON-LD en `src/pages/index.astro`)
- Componentes Vue:
  - `MonitoreoFuentes.vue` (`client:idle`): lee snapshot diario (`public/estado-fuentes.json`)
  - `AnalisisIA.vue` (`client:load`): selector de modelo + generación local en navegador
  - `GraficaInteractiva.vue` (`client:idle`): serie histórica y tooltips
- Base path centralizado en `src/lib/paths.js` para compatibilidad con Vercel / GitHub Pages

## Flujo de IA en frontend (`AnalisisIA.vue`)

- El usuario selecciona tamaño de modelo (no hay carga automática al abrir):
  - **Pequeño**: `onnx-community/SmolLM2-135M-ONNX`
  - **Mediano**: `onnx-community/LFM2.5-350M-ONNX`
- Fallback de compatibilidad de carga:
  - `onnx-community/Qwen3-0.6B-DQ-ONNX`
  - `onnx-community/Qwen3-0.6B-ONNX`
  - `onnx-community/gpt2-medium-ONNX`
- Carga con variantes WebGPU/CPU (`q4f16`, `q4`, `q8`) según soporte.
- Validación y limpieza de salida:
  - remueve `<think>`
  - evita eco del prompt
  - si la salida no cumple calidad mínima, usa análisis local de respaldo.
- Incluye descarga de `public/reportes/radar-porcino.html`.

## Datos y fuentes

- Fuente visual principal: `src/data/colombia.js`, `src/data/europa.js`, `src/data/usa.js`
- Snapshot de monitoreo: `public/estado-fuentes.json`
- Datasets públicos generados: `public/data/*.json` y `public/data/serie-completa.csv`

Fuentes utilizadas:
- Colombia: Porcinews (sin API pública gubernamental equivalente)
- UE-27: Eurostat API (`apro_mt_lspig`)
- EE.UU.: USDA NASS RSS / reportes trimestrales

## Workflows

- `deploy-pages.yml`: despliegue a GitHub Pages en push a `master`
- `actualizar-fuentes.yml`: actualización diaria del snapshot/datasets (`cron`) + ejecución manual
- `ci.yml`: build de integración continua

## Configuración de despliegue

`astro.config.mjs` usa:
- `DEPLOY_TARGET` (`vercel` o `pages`)
- `ASTRO_BASE`
- `SITE_URL`

Para GitHub Pages, el workflow define automáticamente base y site URL.
