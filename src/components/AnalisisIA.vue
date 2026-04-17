<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from '../lib/paths.js'

const cargando = ref(true)
const error = ref(false)
const analisis = ref('')
const fuente = ref('snapshot')
const actualizadoEn = ref('')

const fuenteTexto = computed(() => {
  if (fuente.value === 'gemini-2.0-flash') return 'Gemini (snapshot diario)'
  return 'Resumen automático (snapshot diario)'
})

const actualizadoTexto = computed(() => {
  if (!actualizadoEn.value) return ''
  const fecha = new Date(actualizadoEn.value)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const crearFallbackDesdeSnapshot = (snapshot) => {
  const usa = snapshot?.usa ?? {}
  const europa = snapshot?.europa ?? {}
  const colombia = snapshot?.colombia ?? {}
  const inventarioUsa = Number(usa?.inventario_millones)
  const inventarioEuropa = Number(europa?.inventario_millones)
  const inventarioColombia = Number(colombia?.inventario_millones)
  const ratioUsa = inventarioUsa > 0 && inventarioColombia > 0 ? inventarioUsa / inventarioColombia : null
  const ratioEuropa = inventarioEuropa > 0 && inventarioColombia > 0 ? inventarioEuropa / inventarioColombia : null

  const escala = Number.isFinite(ratioEuropa) && Number.isFinite(ratioUsa)
    ? `Europa registra ${inventarioEuropa.toFixed(1)} millones y EE.UU. ${inventarioUsa.toFixed(1)} millones frente a ${inventarioColombia.toFixed(1)} millones de Colombia (${ratioEuropa.toFixed(1)}x y ${ratioUsa.toFixed(1)}x, respectivamente).`
    : 'Europa y EE.UU. mantienen una escala de inventario claramente superior a Colombia.'
  const transparencia = 'Europa (Eurostat) y EE.UU. (USDA) publican series oficiales con metodologías trazables, mientras Colombia sigue dependiendo de fuentes no gubernamentales para su dato consolidado.'
  const conclusion = 'Cerrar esa brecha exige institucionalizar una API pública nacional con actualización periódica y trazabilidad histórica.'
  return `${escala} ${transparencia} ${conclusion}`
}

const cargarAnalisis = async (forzarRecarga = false) => {
  cargando.value = true
  error.value = false

  try {
    const url = forzarRecarga
      ? withBase(`estado-fuentes.json?v=${Date.now()}`)
      : withBase('estado-fuentes.json')
    const respuesta = await fetch(url, { method: 'GET', cache: 'no-store' })
    if (!respuesta.ok) throw new Error('No se pudo cargar snapshot')
    const datos = await respuesta.json()

    const texto = datos?.analisis_ia?.texto?.trim()
    analisis.value = texto || crearFallbackDesdeSnapshot(datos)
    fuente.value = datos?.analisis_ia?.fuente || 'fallback'
    actualizadoEn.value = datos?.analisis_ia?.actualizado_en || datos?.fecha_consulta || ''
  } catch (_err) {
    error.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  void cargarAnalisis(false)
})
</script>

<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">🤖</span>
      <h3 class="analisis-ia__titulo">Análisis automático con IA</h3>
      <button v-if="!cargando" @click="cargarAnalisis(true)" class="analisis-ia__boton">
        Actualizar snapshot
      </button>
    </div>

    <div v-if="cargando" class="analisis-ia__cargando">
      <div class="analisis-ia__spinner"></div>
      <span>Cargando análisis...</span>
    </div>

    <div v-else-if="error" class="analisis-ia__error">
      ⚠️ No se pudo cargar el análisis.
    </div>

    <div v-else class="analisis-ia__contenido">
      <p class="analisis-ia__texto">{{ analisis }}</p>
      <p class="analisis-ia__meta">
        Fuente: {{ fuenteTexto }}<span v-if="actualizadoTexto"> · {{ actualizadoTexto }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.analisis-ia {
  background: white;
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
