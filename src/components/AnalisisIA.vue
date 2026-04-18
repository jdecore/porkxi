<script setup>
import { computed, onMounted, ref } from 'vue'
import { pipeline, env } from '@huggingface/transformers'
import { withBase } from '../lib/paths.js'

env.allowLocalModels = false

// Modelos optimizados para navegador
const MODELOS = {
  pequeno: {
    id: 'onnx-community/SmolLM2-135M-ONNX',
    nombre: 'Pequeño (rápido)',
    descripcion: 'Ideal para dispositivos limitados. Carga en ~30s.',
    tamaño: '~85MB'
  },
  mediano: {
    id: 'onnx-community/LFM2.5-350M-ONNX',
    nombre: 'Mediano (equilibrado)',
    descripcion: 'Mejor calidad. Carga en ~90s.',
    tamaño: '~240MB'
  }
}

const MODELO_RESPALDO_FINAL = 'onnx-community/gpt2-medium-ONNX'
const MODELOS_COMPATIBILIDAD = [
  'onnx-community/Qwen3-0.6B-DQ-ONNX',
  'onnx-community/Qwen3-0.6B-ONNX',
  MODELO_RESPALDO_FINAL,
]
const OPCIONES_CARGA_MODELO = [
  { device: 'webgpu', dtype: 'q4f16' },
  { device: 'webgpu', dtype: 'q4' },
  { dtype: 'q4' },
  { dtype: 'q8' },
]

const cargando = ref(false)
const modeloListo = ref(false)
const error = ref(false)
const analisis = ref('')
const descargando = ref(false)
const datosWeb = ref(null)
const generando = ref(false)
let generador = null
const modeloSeleccionado = ref(null)
const mostrarSelector = ref(true)

const quitarThink = (texto) => texto.replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/\s+/g, ' ').trim()

const tieneRepeticionLarga = (texto) => /(\b[\p{L}]{3,}\b)(?:\s+\1){2,}/iu.test(texto)

const esAnalisisValido = (texto) => {
  if (!texto || texto.length < 60) return false
  if (/^\s*eres analista de datos agropecuarios/i.test(texto)) return false
  if (/usa únicamente estos datos|escribe exactamente 3 frases|debes mencionar explícitamente|\/no_think/i.test(texto)) return false
  if (!/\d/.test(texto)) return false
  if (!/%/.test(texto)) return false
  if (!/\dx\b/i.test(texto)) return false
  if (/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]/u.test(texto)) return false
  if (tieneRepeticionLarga(texto)) return false

  const menciones = [
    /\bcolombia\b/i,
    /\b(ue-27|ue|europa)\b/i,
    /\b(usa|ee\.?uu\.?|estados unidos)\b/i,
  ]
  const regiones = menciones.reduce((total, regex) => total + (regex.test(texto) ? 1 : 0), 0)
  const frases = texto.split(/[.!?]+/).filter((parte) => parte.trim().length > 12).length
  return regiones === 3 && frases >= 2
}

const construirFallback = (crecimientoCol, crecimientoEu, crecimientoUsa, ratioColEu, ratioColUsa, colPorcent) =>
  `Colombia crece ${crecimientoCol >= 0 ? '+' : ''}${crecimientoCol}% frente a UE-27 (${crecimientoEu}%) y USA (${crecimientoUsa >= 0 ? '+' : ''}${crecimientoUsa}%). La escala sigue muy concentrada: UE-27 tiene ${ratioColEu}x y USA ${ratioColUsa}x más cerdas que Colombia. Para cerrar brecha, Colombia necesita formalizar datos oficiales periódicos, hoy dominados por producción de traspatio (${colPorcent}%).`

const limpiarEcoPrompt = (texto, promptPlano) => {
  if (!texto) return ''

  const limpio = texto.trim()
  if (limpio.startsWith(promptPlano)) return limpio.slice(promptPlano.length).trim()

  const marcadorFinal = 'Debes mencionar explícitamente Colombia, UE-27 y USA, e incluir porcentajes y relaciones en x.'
  const indiceMarcador = limpio.lastIndexOf(marcadorFinal)
  if (indiceMarcador >= 0) {
    return limpio.slice(indiceMarcador + marcadorFinal.length).trim()
  }

  return limpio
}

const extraerTextoGenerado = (resultado) => {
  const raw = resultado?.[0]?.generated_text
  if (Array.isArray(raw)) {
    const ultimoMensaje = [...raw].reverse().find((m) => m?.role === 'assistant')
    return ultimoMensaje?.content || ''
  }
  return typeof raw === 'string' ? raw : ''
}

const cargarDatosWeb = async () => {
  try {
    const res = await fetch(withBase('data/inventario-unificado.json'), { cache: 'no-store' })
    datosWeb.value = await res.json()
  } catch (err) {
    console.error('Error cargando datos:', err)
  }
}

const fuenteTexto = computed(() => {
  if (!datosWeb.value) return 'Cargando...'
  const fecha = new Date(datosWeb.value.actualizado).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return `Datos actualizados: ${fecha}`
})

const descargarReporte = async () => {
  descargando.value = true
  try {
    const response = await fetch(withBase('reportes/radar-porcino.html'))
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte-porcino-colombia.html'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error descargando reporte:', err)
  } finally {
    descargando.value = false
  }
}

const etiquetaOpcionesModelo = (opciones) => `${opciones.device ?? 'cpu'}/${opciones.dtype ?? 'default'}`

const cargarPipelineConFallback = async (modelId) => {
  let ultimoError = null

  for (const opciones of OPCIONES_CARGA_MODELO) {
    try {
      return await pipeline('text-generation', modelId, opciones)
    } catch (errorCarga) {
      ultimoError = errorCarga
      console.error(`Error cargando ${modelId} con ${etiquetaOpcionesModelo(opciones)}:`, errorCarga)
    }
  }

  throw ultimoError ?? new Error(`No se pudo cargar el modelo ${modelId}`)
}

const iniciarModelo = async () => {
  if (generador) return

  const candidatos = [
    modeloSeleccionado.value,
    ...MODELOS_COMPATIBILIDAD.filter((id) => id !== modeloSeleccionado.value),
  ].filter(Boolean)

  let ultimoError = null
  for (const modelId of candidatos) {
    try {
      generador = await cargarPipelineConFallback(modelId)
      modeloListo.value = true
      return
    } catch (errorModelo) {
      ultimoError = errorModelo
      console.error(`No se pudo cargar el modelo candidato ${modelId}:`, errorModelo)
    }
  }

  throw ultimoError ?? new Error('No se pudo cargar ningún modelo IA')
}

const generarAnalisisIA = async () => {
  if (generando.value) return
  generando.value = true
  error.value = false

  await cargarDatosWeb()
  const d = datosWeb.value
  if (!d) {
    analisis.value = 'Error cargando datos'
    generando.value = false
    return
  }

  const col = d.Colombia
  const eu = d.europa
  const usa = d.usa

  const colUlt = col.serie[col.serie.length - 1]
  const colAnt = col.serie[col.serie.length - 2]
  const euUlt = eu.serie[eu.serie.length - 1]
  const euAnt = eu.serie[eu.serie.length - 2]
  const usaUlt = usa.serie[usa.serie.length - 1]
  const usaAnt = usa.serie[usa.serie.length - 2]

  const crecimientoCol = Number(((colUlt.valor - colAnt.valor) / colAnt.valor * 100).toFixed(1))
  const crecimientoEu = Number(((euUlt.valor - euAnt.valor) / euAnt.valor * 100).toFixed(1))
  const crecimientoUsa = Number(((usaUlt.valor - usaAnt.valor) / usaAnt.valor * 100).toFixed(1))
  const ratioColEu = Number((euUlt.valor / colUlt.valor).toFixed(1))
  const ratioColUsa = Number((usaUlt.valor / colUlt.valor).toFixed(1))
  const colPorcent = col.detalle.traspatio.porcentaje

  const fallback = construirFallback(
    crecimientoCol,
    crecimientoEu,
    crecimientoUsa,
    ratioColEu,
    ratioColUsa,
    colPorcent,
  )

  try {
    if (!generador) await iniciarModelo()
    if (!generador) throw new Error('Generador no disponible')

    const usaFormatoChat = Boolean(
      typeof generador?.tokenizer?.chat_template === 'string'
      && generador.tokenizer.chat_template.trim(),
    )
    const promptPlano =
      `Eres analista de datos agropecuarios. Responde en español claro y profesional, máximo 80 palabras, sin listas y en 3 frases.\n` +
      `Usa únicamente estos datos:\n` +
      `Colombia: ${colUlt.valor.toLocaleString()} cerdas, variación ${crecimientoCol}%.\n` +
      `UE-27: ${euUlt.valor.toLocaleString()} cerdas, variación ${crecimientoEu}%.\n` +
      `USA: ${usaUlt.valor.toLocaleString()} cerdas, variación ${crecimientoUsa}%.\n` +
      `Relación de escala: UE-27/Colombia ${ratioColEu}x, USA/Colombia ${ratioColUsa}x.\n` +
      `Estructura Colombia: traspatio ${col.detalle.traspatio.porcentaje}%, familiar ${col.detalle.familiar.porcentaje}%, industrial ${col.detalle.industrial.porcentaje}%.\n` +
      `Debes mencionar explícitamente Colombia, UE-27 y USA, e incluir porcentajes y relaciones en x.`

    const mensajes = [
      {
        role: 'system',
        content:
          'Eres analista de datos agropecuarios. Responde solo en español claro, profesional y factual. Máximo 80 palabras, sin listas.',
      },
      {
        role: 'user',
        content:
          `/no_think Usa únicamente estos datos:\n` +
          `Colombia: ${colUlt.valor.toLocaleString()} cerdas, variación ${crecimientoCol}%.\n` +
          `UE-27: ${euUlt.valor.toLocaleString()} cerdas, variación ${crecimientoEu}%.\n` +
          `USA: ${usaUlt.valor.toLocaleString()} cerdas, variación ${crecimientoUsa}%.\n` +
          `Relación de escala: UE-27/Colombia ${ratioColEu}x, USA/Colombia ${ratioColUsa}x.\n` +
          `Estructura Colombia: traspatio ${col.detalle.traspatio.porcentaje}%, familiar ${col.detalle.familiar.porcentaje}%, industrial ${col.detalle.industrial.porcentaje}%.\n` +
          `Escribe exactamente 3 frases. Debes mencionar explícitamente Colombia, UE-27 y USA, e incluir porcentajes y relaciones en x.`,
      },
    ]

    let texto = ''
    for (let intento = 0; intento < 2; intento += 1) {
      const entrada = usaFormatoChat ? mensajes : promptPlano
      const resultado = await generador(entrada, {
        max_new_tokens: 140,
        do_sample: intento === 0,
        temperature: 0.35,
        top_p: 0.9,
        repetition_penalty: 1.2,
        no_repeat_ngram_size: 3,
        return_full_text: false,
      })
      texto = quitarThink(extraerTextoGenerado(resultado))
      if (!usaFormatoChat) {
        texto = limpiarEcoPrompt(texto, promptPlano)
      }
      texto = texto
        .replace(/^assistant[:\s-]*/i, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (esAnalisisValido(texto)) break
    }

    if (!esAnalisisValido(texto)) {
      texto = fallback
    }

    analisis.value = texto.slice(0, 380)
  } catch (err) {
    console.error('Error generando análisis:', err)
    error.value = true
    analisis.value = fallback
  } finally {
    generando.value = false
  }
}

const seleccionarModelo = async (tamaño) => {
  const modeloConfig = MODELOS[tamaño]
  modeloSeleccionado.value = modeloConfig.id
  localStorage.setItem('modeloIA', tamaño)
  mostrarSelector.value = false
  generador = null
  modeloListo.value = false
  analisis.value = ''
  error.value = false
  await generarAnalisisIA()
}

onMounted(() => {
  const guardado = localStorage.getItem('modeloIA')
  if (guardado && MODELOS[guardado]) {
    modeloSeleccionado.value = MODELOS[guardado].id
  }
})
</script>

<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">⚡</span>
      <h3 class="analisis-ia__titulo">Analisis con IA</h3>
    </div>

    <!-- Selector de modelo -->
    <div v-if="mostrarSelector" class="analisis-ia__selector">
      <p class="analisis-ia__selector-texto">
        Elige el tamaño del modelo. Más pequeño = más rápido, más grande = mejor calidad.
      </p>
      <div class="analisis-ia__opciones">
        <button
          v-for="(modelo, key) in MODELOS"
          :key="key"
          @click="seleccionarModelo(key)"
          class="analisis-ia__opcion"
          :class="`analisis-ia__opcion--${key}`"
          :disabled="generando"
        >
          <span class="analisis-ia__opcion-nombre">{{ modelo.nombre }}</span>
          <span class="analisis-ia__opcion-desc">{{ modelo.descripcion }}</span>
          <span class="analisis-ia__opcion-tamaño">{{ modelo.tamaño }}</span>
        </button>
      </div>
    </div>

    <!-- Contenido normal (cuando no se muestra selector) -->
    <div v-else>
      <div v-if="cargando || generando" class="analisis-ia__cargando">
        <div class="analisis-ia__spinner"></div>
        <span>{{ modeloListo ? 'Generando analisis...' : 'Cargando modelo IA...' }}</span>
      </div>

      <div v-else class="analisis-ia__contenido">
        <p v-if="error" class="analisis-ia__error">
          Modelo IA no disponible temporalmente. Mostrando análisis de respaldo.
        </p>
        <p class="analisis-ia__texto">{{ analisis }}</p>
        <div class="analisis-ia__footer">
          <p class="analisis-ia__meta">{{ fuenteTexto }}</p>
          <div class="analisis-ia__acciones">
            <button class="analisis-ia__descarga" @click="descargarReporte" :disabled="descargando">
              {{ descargando ? 'Descargando...' : 'Descargar reporte' }}
            </button>
            <button class="analisis-ia__cambiar" @click="mostrarSelector = true">
              Cambiar modelo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analisis-ia {
  background: #FDF6F4;
  border: 1.5px solid #E8C4BC;
  border-radius: 14px;
  padding: 16px 20px;
  margin: 0 0 24px;
}

.analisis-ia__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.analisis-ia__icono {
  font-size: 18px;
}

.analisis-ia__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: #B8482D;
  margin: 0;
}

.analisis-ia__boton {
  background: #C96A5B;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__boton:hover {
  background: #D4736B;
}

.analisis-ia__cargando {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6B3A2C;
  font-size: 12px;
}

.analisis-ia__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E8C4BC;
  border-top-color: #C96A5B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.analisis-ia__error {
  color: #C0392B;
  font-size: 12px;
  padding: 10px;
  background: #FEF0EB;
  border-radius: 6px;
}

.analisis-ia__contenido {
  background: #FEF0EB;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #C96A5B;
}

.analisis-ia__texto {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #5C3026;
}

.analisis-ia__meta {
  margin: 8px 0 0;
  font-size: 11px;
  color: #6B3A2C;
}

.analisis-ia__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #E8C4BC;
}

.analisis-ia__descarga {
  background: #C96A5B;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__descarga:hover:not(:disabled) {
  background: #D4736B;
}

.analisis-ia__descarga:disabled {
  opacity: 0.6;
}

.analisis-ia__acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.analisis-ia__cambiar {
  background: transparent;
  color: #6B3A2C;
  border: none;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
}

.analisis-ia__cambiar:hover {
  color: #B8482D;
}

/* Selector de modelo */
.analisis-ia__selector {
  background: #FEF0EB;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #E8C4BC;
}

.analisis-ia__selector-texto {
  font-size: 12px;
  color: #6B3A2C;
  margin: 0 0 12px;
  line-height: 1.5;
}

.analisis-ia__opciones {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.analisis-ia__opcion {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border: 2px solid #E8C4BC;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.analisis-ia__opcion:hover {
  border-color: #C96A5B;
  background: #FDF6F4;
}

.analisis-ia__opcion--pequeno {
  border-left: 4px solid #10B981;
}

.analisis-ia__opcion--mediano {
  border-left: 4px solid #3B82F6;
}

.analisis-ia__opcion-nombre {
  font-weight: 600;
  font-size: 13px;
  color: #5C3026;
}

.analisis-ia__opcion-desc {
  font-size: 11px;
  color: #6B3A2C;
}

.analisis-ia__opcion-tamaño {
  font-size: 10px;
  color: #B8482D;
  font-weight: 600;
}

.analisis-ia__opcion:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 700px) {
  .analisis-ia {
    padding: 12px 14px;
  }
  .analisis-ia__encabezado {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .analisis-ia__opciones {
    grid-template-columns: 1fr;
  }
}
</style>
