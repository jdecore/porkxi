<script setup>
import { computed, onMounted, ref } from 'vue'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false

const cargando = ref(true)
const modeloListo = ref(false)
const error = ref(false)
const analisis = ref('')
const descargando = ref(false)
const datosWeb = ref(null)
const generando = ref(false)
let generador = null

const cargarDatosWeb = async () => {
  try {
    const res = await fetch('/data/inventario-unificado.json')
    datosWeb.value = await res.json()
  } catch (err) {
    console.error('Error:', err)
  }
}

const fuenteTexto = computed(() => {
  if (!datosWeb.value) return 'Cargando...'
  const fecha = new Date(datosWeb.value.actualizado).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
  return `Datos actualizados: ${fecha}`
})

const descargarReporte = async () => {
  descargando.value = true
  try {
    const response = await fetch('/reportes/radar-porcino.html')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte-porcino-colombia.html'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    descargando.value = false
  }
}

const iniciarModelo = async () => {
  if (generador) return
  
  console.log('Iniciando modelo DistilGPT2...')
  
  try {
    console.log('Intentando con webgpu...')
    generador = await pipeline('text-generation', 'Xenova/distilgpt2', {
      dtype: 'q4',
      device: 'webgpu'
    })
    modeloListo.value = true
    console.log('Modelo cargado con webgpu')
  } catch (err) {
    console.error('Error webgpu:', err.message || err)
    try {
      console.log('Intentando con CPU...')
      generador = await pipeline('text-generation', 'Xenova/distilgpt2', {
        dtype: 'q4'
      })
      modeloListo.value = true
      console.log('Modelo cargado con CPU')
    } catch (err2) {
      console.error('Error CPU:', err2.message || err2)
      error.value = true
    }
  }
}

const generarAnalisisIA = async () => {
  if (generando.value) return
  generando.value = true
  
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

  const promptText = `Eres un analista de datos agricolas. Analiza el inventario porcino comparando tres regiones: Colombia 2024 tiene ${colUlt.valor.toLocaleString()} cerdas en ${col.detalle.predios.toLocaleString()} predios con crecimiento del +${crecimientoCol} por ciento. Estructura: ${col.detalle.traspatio.porcentaje} por ciento en traspatio, ${col.detalle.familiar.porcentaje} por ciento familiar, ${col.detalle.industrial.porcentaje} por ciento industrial. La UE-27 tiene ${euUlt.valor.toLocaleString()} cerdas con variacion del ${crecimientoEu} por ciento. USA tiene ${usaUlt.valor.toLocaleString()} cerdas con crecimiento del +${crecimientoUsa} por ciento. Escribe un analisis breve de maximo 80 palabras en espanol comparando los tres mercados.`

  try {
    if (!generador) {
      await iniciarModelo()
    }
    
    if (!generador) {
      throw new Error('Generador no disponible')
    }
    
    const resultado = await generador(promptText, {
      max_new_tokens: 120,
      temperature: 0.7,
      do_sample: true
    })
    
    const texto = resultado[0]?.generated_text || ''
    const inicio = promptText.length
    let analisisGenerado = texto.substring(inicio).trim()
    
    if (analisisGenerado.length < 20) {
      analisisGenerado = `Colombia crece +${crecimientoCol}% vs UE-27 ${crecimientoEu}% y USA +${crecimientoUsa}%. La UE lidera con ${ratioColEu}x mas cerdas que Colombia, seguida por USA con ${ratioColUsa}x. La estructura colombiana es mayoritariamente de traspatio.`
    }
    
    analisis.value = analisisGenerado.replace(/^[:\s]+/, '').substring(0, 300)
  } catch (err) {
    console.error('Error generacion:', err)
    error.value = true
    analisis.value = `Colombia crece +${crecimientoCol}% vs UE-27 ${crecimientoEu}% y USA +${crecimientoUsa}%. La UE lidera con ${ratioColEu}x mas cerdas que Colombia, seguida por USA con ${ratioColUsa}x. La estructura colombiana es mayoritariamente de traspatio (${col.detalle.traspatio.porcentaje}%).`
  }
  
  generando.value = false
}

onMounted(async () => {
  await cargarDatosWeb()
  analisis.value = 'Presiona ↻ para generar analisis con IA'
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

    <div v-else-if="error" class="analisis-ia__error">
      Error cargando modelo IA. Usando analisis basico.
    </div>

    <div v-else class="analisis-ia__contenido">
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
  background: var(--crema);
  border-radius: var(--radio);
  padding: 20px;
  margin: 24px 0;
  border: 1px solid var(--crema-borde);
}

.analisis-ia__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.analisis-ia__icono {
  font-size: 24px;
}

.analisis-ia__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--tinta);
  margin: 0;
}

.analisis-ia__boton {
  background: var(--cerdo);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__boton:hover {
  background: var(--cerdo-claro);
}

.analisis-ia__cargando {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--tinta-claro);
  font-size: 14px;
}

.analisis-ia__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--crema-borde);
  border-top-color: var(--cerdo);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.analisis-ia__error {
  color: var(--alerta);
  font-size: 14px;
  padding: 12px;
  background: var(--alerta-fondo);
  border-radius: 8px;
}

.analisis-ia__contenido {
  background: var(--crema);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--cerdo);
}

.analisis-ia__texto {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--tinta);
}

.analisis-ia__meta {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--tinta-claro);
}

.analisis-ia__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--crema-borde);
}

.analisis-ia__descarga {
  background: var(--cerdo);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__descarga:hover:not(:disabled) {
  background: var(--cerdo-claro);
}

.analisis-ia__descarga:disabled {
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 700px) {
  .analisis-ia__encabezado {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>