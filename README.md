# porkxi-astro

Visualización de inventario porcino Colombia vs Europa (UE-27) vs EE.UU.

## Stack
- Astro 6 (output estático)
- Vue 3 (`client:idle`)
- Python 3.12

## Scripts
| Comando | Acción |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build producción |
| `npm run update:fuentes` | Genera snapshot |

## Frontend optimizado
- 100% estático (sin API serverless)
- IA en navegador con `@huggingface/transformers` + `onnx-community/Qwen3-0.6B-ONNX`
- Fallback local para evitar respuestas repetitivas o de baja calidad
- Fondo unificado #F9F6F1

## Monitoreo de fuentes
- El bloque de monitoreo consume `public/estado-fuentes.json` (snapshot diario, no streaming en tiempo real)
- El snapshot se regenera con `npm run update:fuentes` y por GitHub Actions diaria

## Despliegue
- Vercel Free (recomendado)
- GitHub Pages (via Actions)
