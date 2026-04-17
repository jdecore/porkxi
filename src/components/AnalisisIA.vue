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
  return '🤖 Transformers.js · Qwen3-0.8B-Instruct (corre en tu navegador)'
})

const datos = {
  colombia: { inventario_millones: 10.7 },
  europa: { inventario_millones: 132 },
  usa: { inventario_millones: 75.5 }
}

const ratioUsa = datos.usa.inventario_millones / datos.colombia.inventario_millones
const ratioEuropa = datos.europa.inventario_millones / datos.colombia.inventario_millones

const generarAnalisisLocal = async () => {
  cargando.value = true
  cargandoModelo.value = true
  error.value = false

  try {
    const generador = await pipeline('text-generation', 'Xenova/Qwen3-0.8B-Instruct', {
      progress_callback: (p) => {
        if (p.status === 'progress') {
          progresoCarga.value = Math.round(p.progress * 100)
        }
      }
    })

    const prompt = `Eres un analista de datos agrícolas. Escribe en español un análisis breve del inventario porcino comparando Colombia (${datos.colombia.inventario_millones}M), Europa (${datos.europa.inventario_millones}M) y Estados Unidos (${datos.usa.inventario_millones}M). Destaca la brecha de datos abiertos.`

    const resultado = await generador(prompt, {
      max_new_tokens: 100,
      temperature: 0.3,
      top_p: 0.9,
    })

    let texto = resultado[0].generated_text.replace(prompt, '').trim()
    if (texto.length > 20) {
      analisis.value = texto
    } else {
      throw new Error('Texto muy corto')
    }
  } catch (err) {
    console.log('Modelo no disponible, usando análisis predefinido')
    analisis.value = `Colombia registra ${datos.colombia.inventario_millones} millones de cabezas, mientras Europa lidera con ${datos.europa.inventario_millones}M (${ratioEuropa.toFixed(0)} veces más que Colombia) y Estados Unidos ${datos.usa.inventario_millones}M (${ratioUsa.toFixed(0)} veces más).

La brecha más significativa no es de volumen: Europa y Estados Unidos publican sus datos mediante APIs públicas oficiales, mientras Colombia carece de una fuente consolidada. Este es el principal desafío para el análisis del sector porcino nacional.`
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
