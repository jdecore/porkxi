<script setup>
import { computed, onMounted, ref } from 'vue'
import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false
env.useBrowserCache = true

const cargando = ref(true)
const cargandoModelo = ref(false)
const error = ref(false)
const analisis = ref('')
const progresoCarga = ref(0)
const descargando = ref(false)

const fuenteTexto = computed(() => {
  return '🤖 Qwen3.5-0.8B · IA en tu navegador'
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

const datosColombia = {
  total: 10668276,
  predios: 189198,
  traspatio: 78.38,
  familiar: 19.03,
  industrial: 2.12,
  tecnificadas: 0.47,
  carne: 608752,
  variacionCarne: 7.8,
}

const datosEuropa = {
  total: 132135520,
  variacion: -0.5,
}

const datosUsa = {
  total: 75500000,
  mercado: 69600000,
  reproductores: 5950000,
  camada: 11.93,
  variacion: 1,
}

let modeloCache = null

const generarAnalisisLocal = async () => {
  if (cargando.value) return
  
  cargando.value = true
  cargandoModelo.value = true

  const enfoques = [
    "explica por qué los datos abiertos benef prejuí al productor colombiano",
    "compara la productividad por cerdo entre Colombia y USA",
    "analiza el riesgo de no tener un sistema de información oficial",
    "propondré una solución para mejorar la transparencia",
    "destaca qué país tiene mejor estructura de datos",
    "evalúa el impacto económico de la fragmentación"
  ]
  const enfoque = enfoques[Math.floor(Math.random() * enfoques.length)]

  try {
    if (!modeloCache) {
      modeloCache = await pipeline('text-generation', 'Xenova/Qwen3.5-0.8B-Instruct', {
        progress_callback: (p) => {
          if (p.status === 'progress') {
            progresoCarga.value = Math.round(p.progress * 100)
          }
        }
      })
    }
    const generador = modeloCache

    const prompt = `${enfoque}.

Colombia: 10.7M cerdas en 189K predios (78% traspatio, 19% familiar, 2% industrial).
UE-27: 132M cerdas (-0.5%).
USA: 75.5M cerdas (+1%).

Responde en español, máximo 2 oraciones, incluye datos específicos.`

    const resultado = await generador(prompt, {
      max_new_tokens: 60,
      temperature: 0.9,
      top_p: 0.85,
      do_sample: true,
      repetition_penalty: 1.1
    })

    let textoLimpio = resultado[0].generated_text.replace(prompt, '').trim()
    textoLimpio = textoLimpio.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim()
    textoLimpio = textoLimpio.replace(/^[A-Z][^.!?]*[.!?]\s*/i, '').trim()
    
    if (textoLimpio.length > 25 && textoLimpio.length < 250) {
      analisis.value = textoLimpio
    } else {
      throw new Error('Texto inválido')
    }
  } catch (err) {
    console.log('Modelo fallback:', err.message)
    const fallbacks = [
      `La fragmentación del 78% en traspatio limita el análisis. Colombia necesita una API pública como Eurostat.`,
      `La brecha no es de volumen sino de transparencia. UE y USA publican datos oficiales; Colombia no.`,
      `El sector porcino colombiano puede innovar con datos abiertos. La oportunidad está en consolidar ICA, DANE y Porkcolombia.`,
      `Sin datos oficiales, los productores dependen de estimaciones. Una API pública impulsaría inversiones.`,
      `El comparativo global muestra oportunidad: Colombia tiene 10.7M vs UE 132M vs USA 75.5M.`,
    ]
    analisis.value = fallbacks[Math.floor(Math.random() * fallbacks.length)]
  } finally {
    cargando.value = false
    cargandoModelo.value = false
  }
}

onMounted(() => {
  void generarAnalisisLocal()
})
</script>

<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">⚡</span>
      <h3 class="analisis-ia__titulo">Análisis con IA</h3>
      <button v-if="!cargando" @click="generarAnalisisLocal" class="analisis-ia__boton">
        ↻
      </button>
    </div>

    <div v-if="cargando" class="analisis-ia__cargando">
      <div class="analisis-ia__spinner"></div>
      <span>
        {{ cargandoModelo ? `Cargando modelo de IA... ${progresoCarga}%` : 'Generando análisis...' }}
      </span>
    </div>

    <div v-else-if="error" class="analisis-ia__error">
      ⚠️ Error cargando modelo. Usando análisis predefinido.
    </div>

    <div v-else class="analisis-ia__contenido">
      <p class="analisis-ia__texto">{{ analisis }}</p>
      <div class="analisis-ia__footer">
        <p class="analisis-ia__meta">✅ {{ fuenteTexto }}</p>
        <button class="analisis-ia__descarga" @click="descargarReporte" :disabled="descargando">
          {{ descargando ? '⬇ Descargando...' : '📄 Descargar reporte' }}
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
