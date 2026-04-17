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
- IA con Transformers.js/Qwen3 en navegador
- Fondo unificado #F9F6F1

## Despliegue
- Vercel Free (recomendado)
- GitHub Pages (via Actions)