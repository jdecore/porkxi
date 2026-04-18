# 🐖 porkξ | Inventario Porcino Global

> 🌍 **Colombia vs UE-27 vs EE.UU.** — Todo en un solo lugar, con fuentes oficiales verificadas y **análisis con IA** ejecutado 100% en tu navegador.

---

## 📊 Stack Tecnológico

| Herramienta | Versión | Uso |
|---|---|---|
| ⚡ **Astro** | 6.x | Framework estático (SSG) |
| 🖥️ **Vue 3** | 3.5.x | Componentes interactivos |
| 🐍 **Python** | 3.12 | Pipeline de actualización de datos |
| 🤖 **Transformers.js** | 4.x | Inferencia IA en navegador |
| 📦 **ONNX Runtime** | — | Ejecución de modelos ligeros |

**Requisitos:** Node.js ≥ 22.12

---

## 🚀 Comandos Rápidos

```bash
# Desarrollo local (hot reload)
npm run dev

# Verificación de tipos Astro
npm run check

# Build de producción
npm run build

# Actualizar fuentes de datos (snapshot diario)
npm run update:fuentes

# Regenerar datasets públicos (CSV/JSON)
npm run update:datasets

# Vista previa del build
npm run preview
```

---

## 🎯 Componentes Principales

### 📈 **GraficaInteractiva.vue** (`client:idle`)
- Serie histórica comparada Colombia 🇨🇴 / UE-27 🇪🇺 / EE.UU. 🇺🇸
- Tooltips interactivos con datos exactos
- Toggle para mostrar/ocultar series individuales

### 📡 **MonitoreoFuentes.vue** (`client:idle`)
- Estado en tiempo real de cada fuente oficial
- Última actualización detectada
- Indicadores visuales: ✅ al día / ⚠️ retraso / ❌ sin datos

### 🧠 **AnalisisIA.vue** (`client:load`)
- **Selector de modelo** (elige tamaño):
  - 🟢 **Pequeño** → SmolLM2-135M (~85MB, ~30s)
  - 🔵 **Mediano** → LFM2.5-350M (~240MB, ~90s, mejor calidad)
- Todo se ejecuta **localmente** en tu navegador (WebGPU/CPU)
- Fallback automático a GPT-2 Medium si los modelos principales fallan
- Genera análisis comparativo: crecimientos %, ratios de escala, estructura productiva
- Descarga de reporte HTML enriquecido

---

## 🗂️ Estructura de Datos

```
public/
├── estado-fuentes.json          ← Snapshot diario de disponibilidad
└── data/
    ├── inventario-unificado.json  ← Datos unificados para IA
    └── serie-completa.csv          ← Descargable por usuarios

src/data/
├── colombia.js                  ← Serie histórica + detalle Colombia
├── europa.js                    ← Serie UE-27 + metadata Eurostat
└── usa.js                       ← Serie EE.UU. + detalle USDA
```

---

## 🔧 Pipeline de Actualización

**Script Python** (`scripts/generar_estado_fuentes.py`):
1. Consulta fuentes oficiales (Eurostat API, USDA RSS, Porcinews)
2. Verifica disponibilidad y fechas de actualización
3. Genera `public/estado-fuentes.json`
4. Ejecuta `generar_datasets_publicos.mjs` para crear CSV/JSON públicos

**Workflow GitHub Actions** (`.github/workflows/actualizar-fuentes.yml`):
- ⏰ **Diario a las 6:00 AM** (cron)
- Actualiza snapshot y datasets automáticamente
- Push directo a `master` si hay cambios

---

## 🌐 Workflows CI/CD

| Workflow | Disparador | Acción |
|---|---|---|
| `deploy-pages.yml` | Push a `master` | Despliegue automático a GitHub Pages |
| `actualizar-fuentes.yml` | Cron diario + manual | Actualiza datos de fuentes oficiales |
| `ci.yml` | Push/PR | Build de verificación (tipos + compilación) |

---

## 🔍 Modelos de IA Disponibles

### Opción 1: 🟢 **Pequeño** — `SmolLM2-135M-ONNX`
- **Tamaño:** ~85 MB (descarga rápida)
- **Velocidad:** ~30 segundos en cargar
- **Calidad:** Adecuado para análisis simples
- **Ideal:** Conexiones lentas, dispositivos móviles

### Opción 2: 🔵 **Mediano** — `LFM2.5-350M-ONNX`
- **Tamaño:** ~240 MB
- **Velocidad:** ~90 segundos en cargar
- **Calidad:** Mejor razonamiento numérico, más preciso
- **Ideal:** Escritorio, conexiones buenas

### Fallback automático: 🟡 **GPT-2 Medium**
- Si los modelos anteriores no se pueden descargar o corrompen
- Funciona siempre, pero menos especializado

---

## 📂 Decisiones de Diseño

### ¿Por qué dos implementaciones de gráfico?
- `GraficaPrincipal.astro` → **SVG estático** ( SEO-friendly, carga instantánea )
- `GraficaInteractiva.vue` → **Canvas interactivo** ( tooltips, filtros, zoom )
- Ambas comparten datos desde `src/lib/datos-grafico.js` para mantener consistencia.

### ¿Por qué IA en el navegador?
- ✅ **Privacidad:** Los datos **nunca** salen del navegador
- ✅ **Cero costo:** No hay API de pago (HuggingFace gratis)
- ✅ **Offline-first:** Una vez cacheado el modelo, funciona sin internet
- ⚠️ **Primera carga lenta:** Se descargan ~85–240 MB la primera vez

### ¿Por qué `client:load` en AnalisisIA?
- El modelo debe cargarse **inmediatamente** al hacer scroll, no después.
- `client:idle` haría que la IA apareciera con retraso.

---

## 🐛 Solución de Problemas

### "Modelo IA no disponible temporalmente"
**Causas comunes:**
1. 🌐 **WebGPU no habilitado** — Chrome/Edge necesitan flag experimental o versión reciente
2. 📡 **Bloqueo de descarga** — Navegadores pueden bloquear archivos >100MB
3. 💾 **Caché corrupto** — Limpiar IndexedDB del sitio resuelve
4. 📶 **Rate-limit de HuggingFace** — Esperar unos minutos y reintentar

**Solución:** El sistema usa automáticamente el modelo de respaldo GPT-2 Medium. Si persiste, verifica la consola del navegador (F12) para ver el error exacto.
### El mayor problema que tiene usar un modelo en el navegador. es que los más ligeros son muy malos y los mejores pesan mucho matando PCs normales.
---

## 📄 Licencia

MIT © 2026 · Hecho por [Juan Enríquez](https://github.com/juancano) con ayuda de IA.

---

## 🙏 Agradecimientos

- **Fuentes de datos:**
  - 🇨🇴 Porcinews (periodismo especializado)
  - 🇪🇺 Eurostat (API abierta `apro_mt_lspig`)
  - 🇺🇸 USDA NASS (Livestock Mandatory Reporting)

- **Modelos ONNX cortesía de:**
  - Hugging Face 🤗
  - Liquid AI (LFM2.5)
  - Microsoft (Phi-3, vía comunidad ONNX)

---
