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
- IA en navegador con `@huggingface/transformers`
- Modelo principal (ligero): `onnx-community/Qwen3-0.6B-DQ-ONNX` (text-generation)
- Respaldo automático: `onnx-community/Qwen3-0.6B-ONNX`
- Fallback local para evitar respuestas repetitivas o de baja calidad
- Fondo unificado #F9F6F1

## Monitoreo de fuentes
- El bloque de monitoreo consume `public/estado-fuentes.json` (snapshot diario, no streaming en tiempo real)
- El snapshot se regenera con `npm run update:fuentes` y por GitHub Actions diaria

## Uso recomendado de Transformers.js

1. Carga el modelo una sola vez y reutiliza la instancia:
```js
import { pipeline, env } from '@huggingface/transformers'
env.allowLocalModels = false

const generator = await pipeline('text-generation', 'onnx-community/Qwen3-0.6B-DQ-ONNX', {
  device: 'webgpu',
  dtype: 'q4f16',
})
```

2. Usa formato de mensajes (`system` + `user`) en lugar de un prompt plano:
```js
const messages = [
  { role: 'system', content: 'Responde en español claro y factual.' },
  { role: 'user', content: '/no_think ...datos...' },
]
```

3. Ajusta decodificación para reducir repetición:
```js
const result = await generator(messages, {
  max_new_tokens: 140,
  do_sample: true,
  temperature: 0.35,
  top_p: 0.9,
  repetition_penalty: 1.2,
  no_repeat_ngram_size: 3,
})
```

4. Agrega validación de calidad y fallback local para respuestas incoherentes.

## Dónde buscar modelos para navegador

- Catálogo HF filtrado por Transformers.js + text generation:  
  `https://huggingface.co/models?library=transformers.js&pipeline_tag=text-generation`
- Para priorizar modelos ligeros, revisa `usedStorage` vía API del modelo:  
  `https://huggingface.co/api/models/<owner>/<model>`
- Verifica siempre:
  - `library_name: "transformers.js"`
  - `pipeline_tag: "text-generation"`
  - presencia de pesos ONNX (`onnx/model_*.onnx`)
  - plantilla de chat en `tokenizer_config.chat_template`

## Despliegue
- Vercel Free (recomendado)
- GitHub Pages (via Actions)
