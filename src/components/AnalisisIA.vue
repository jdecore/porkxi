<script setup>
import { computed, onMounted, ref } from 'vue'
import { pipeline, env } from '@huggingface/transformers'
import { withBase } from '../lib/paths.js'

env.allowLocalModels = false

const MODELO_ID = 'onnx-community/Qwen3-0.6B-ONNX'

const cargando = ref(true)
const modeloListo = ref(false)
const error = ref(false)
const analisis = ref('')
const descargando = ref(false)
const datosWeb = ref(null)
const generando = ref(false)
let generador = null

const quitarThink = (texto) => texto.replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/\s+/g, ' ').trim()

const tieneRepeticionLarga = (texto) => /(\b[\p{L}]{3,}\b)(?:\s+\1){2,}/iu.test(texto)

const esAnalisisValido = (texto) => {
  if (!texto || texto.length < 60) return false
  if (!/\d/.test(texto)) return false
  if (/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]/u.test(texto)) return false
  if (tieneRepeticionLarga(texto)) return false

  const menciones = [
    /\bcolombia\b/i,
    /\b(ue-27|ue|europa)\b/i,
    /\b(usa|ee\.?uu\.?|estados unidos)\b/i,
  ]
  const regiones = menciones.reduce((total, regex) => total + (regex.test(texto) ? 1 : 0), 0)
  return regiones >= 2
}

const construirFallback = (crecimientoCol, crecimientoEu, crecimientoUsa, ratioColEu, ratioColUsa, colPorcent) =>
  `Colombia crece ${crecimientoCol >= 0 ? '+' : ''}${crecimientoCol}% frente a UE-27 (${crecimientoEu}%) y USA (${crecimientoUsa >= 0 ? '+' : ''}${crecimientoUsa}%). La escala sigue muy concentrada: UE-27 tiene ${ratioColEu}x y USA ${ratioColUsa}x más cerdas que Colombia. Para cerrar brecha, Colombia necesita formalizar datos oficiales periódicos, hoy dominados por producción de traspatio (${colPorcent}%).`

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

const iniciarModelo = async () => {
  if (generador) return

  try {
    generador = await pipeline('text-generation', MODELO_ID, {
      device: 'webgpu',
      dtype: 'q4f16',
    })
    modeloListo.value = true
  } catch (err) {
    console.error('Error WebGPU, usando CPU:', err)
    generador = await pipeline('text-generation', MODELO_ID, { dtype: 'q4' })
    modeloListo.value = true
  }
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
          `Escribe 3 frases: comparación de escala, dinámica reciente y una implicación para Colombia.`,
      },
    ]

    const resultado = await generador(mensajes, {
      max_new_tokens: 140,
      do_sample: true,
      temperature: 0.45,
      top_p: 0.9,
      repetition_penalty: 1.2,
      no_repeat_ngram_size: 3,
    })

    let texto = quitarThink(extraerTextoGenerado(resultado))
      .replace(/^assistant[:\s-]*/i, '')
      .replace(/\s+/g, ' ')
      .trim()

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

onMounted(async () => {
  await cargarDatosWeb()
  analisis.value = 'Presiona ↻ para generar análisis con IA'
  cargando.value = false
})
</script>

<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">⚡</span>
      <h3 class="analisis-ia__titulo">Analisis con IA</h3>
      <button v-if="!cargando && !generando" @click="generarAnalisisIA" class="analisis-ia__boton">
        ↻
      </button>
    </div>

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
        <button class="analisis-ia__descarga" @click="descargarReporte" :disabled="descargando">
          {{ descargando ? 'Descargando...' : 'Descargar reporte' }}
        </button>
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
}
</style>
