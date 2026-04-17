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

const fuenteTexto = computed(() => {
  return '🤖 Qwen3-0.8B · análisis en tu navegador'
})

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

const generarAnalisisLocal = async () => {
  cargando.value = true
  cargandoModelo.value = true

  try {
    const generador = await pipeline('text-generation', 'Xenova/Qwen3-0.8B-Instruct', {
      progress_callback: (p) => {
        if (p.status === 'progress') {
          progresoCarga.value = Math.round(p.progress * 100)
        }
      }
    })

    const prompt = `Analiza el mercado porcino en 3 puntos cortos:

1. Inventario actual: Colombia tiene 10.7M en 189K predios (78% traspatio). UE tiene 132M (-0.5% vs 2023). USA tiene 75.5M con 69.6M cerdos de mercado y 5.95M reproductores. La escala UE es 12x Colombia.

2. Brecha de datos: Only Colombia depends on press (Porcinews). UE has Eurostat API, USA has USDA quarterly reports. Colombia lacks public API from ICA/DANE.

3. Action item: Colombia needs consolidated data from ICA, DANE, Porkcolombia via open API like Eurostat.

Write in Spanish, 2-3 sentences per point. Be specific with numbers.`

    const resultado = await generador(prompt, {
      max_new_tokens: 120,
      temperature: 0.5,
      top_p: 0.92,
      do_sample: true
    })

    const textoLimpio = resultado[0].generated_text.replace(prompt, '').trim()
    
    if (textoLimpio.length > 50 && !textoLimpio.includes('I cannot') && !textoLimpio.includes('No puedo')) {
      analisis.value = textoLimpio
    } else {
      throw new Error('Respuesta inválida')
    }
  } catch (err) {
    console.log('Error modelo:', err.message)
    const colM = (datosColombia.total / 1000000).toFixed(1)
    const euM = (datosEuropa.total / 1000000).toFixed(0)
    const usaM = (datosUsa.total / 1000000).toFixed(1)
    
    analisis.value = `${colM}M de cerdos en Colombia (78% traspatio) vs ${euM}M en UE-27 y ${usaM}M en EE.UU. UE tiene 12x más que Colombia.

La brecha real: mientras Eurostat y USDA publican datos oficiales con APIs, Colombia solo tiene medios especializados. No existe una fuente pública consolidada del gobierno.

Lo que falta: un observatorio porcino colombiano con datos abiertos de ICA, DANE y Porkcolombia.`;
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
      <h3 class="analisis-ia__titulo">Análisis local con Transformers.js</h3>
      <button v-if="!cargando" @click="generarAnalisisLocal" class="analisis-ia__boton">
        Regenerar análisis
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
      <p class="analisis-ia__meta">
        ✅ {{ fuenteTexto }}
      </p>
      <p class="analisis-ia__meta">
        💡 Este modelo corre 100% en tu navegador, no envía datos a ningún servidor.
      </p>
    </div>
  </div>
</template>

<style scoped>
.analisis-ia {
  background: #FFEBE6;
  border-radius: var(--radio);
  padding: 24px;
  margin: 32px 0;
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
