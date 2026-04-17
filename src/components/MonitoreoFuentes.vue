<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from '../lib/paths.js'

const cargando = ref(false)
const fechaActualizacion = ref('sin datos')

const usaUltimoReporte = ref('sin dato')
const usaEstado = ref('Pendiente')
const usaProximoReporte = ref('Próximo reporte: por confirmar')
const usaError = ref('')
const usaEnlace = ref('')
const usaInventarioTexto = ref('sin dato')
const usaDiasTexto = ref('—')
const usaNivel = ref('warning')

const europaUltimoReporte = ref('sin dato')
const europaEstado = ref('Pendiente')
const europaProximoReporte = ref('Próxima actualización: por confirmar')
const europaError = ref('')
const europaEnlace = ref('')
const europaInventarioTexto = ref('sin dato')
const europaDiasTexto = ref('—')
const europaNivel = ref('warning')

const colombiaUltimoReporte = ref('ene 2026')
const colombiaEstado = ref('Desactualizado')
const colombiaProximoReporte = ref('Sin fecha programada')
const colombiaEnlace = ref('')
const colombiaDiasTexto = ref('—')

const claseIndicadorUsa = computed(() => {
  if (cargando.value) return 'monitoreo__indicador--warning'
  if (usaNivel.value === 'error') return 'monitoreo__indicador--error'
  if (usaNivel.value === 'warning') return 'monitoreo__indicador--warning'
  return 'monitoreo__indicador--ok'
})

const claseIndicadorEuropa = computed(() => {
  if (cargando.value) return 'monitoreo__indicador--warning'
  if (europaNivel.value === 'error') return 'monitoreo__indicador--error'
  if (europaNivel.value === 'warning') return 'monitoreo__indicador--warning'
  return 'monitoreo__indicador--ok'
})

const formatearFecha = (valor) => {
  if (!valor) return 'sin dato'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha
    .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
}

const formatearFechaHora = (valor) => {
  if (!valor) return 'sin dato'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const normalizarDias = (valor) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? Math.max(0, Math.floor(numero)) : null
}

const obtenerEstadoFuente = (
  status,
  dias,
  limiteRetraso,
  limiteDesactualizado,
) => {
  if (status !== 'ok') {
    return {
      nivel: 'error',
      texto: 'Error de consulta',
    }
  }
  if (dias !== null && dias > limiteDesactualizado) {
    return {
      nivel: 'warning',
      texto: 'Desactualizado',
    }
  }
  if (dias !== null && dias > limiteRetraso) {
    return {
      nivel: 'warning',
      texto: 'Con retraso',
    }
  }
  return {
    nivel: 'ok',
    texto: 'Actualizado',
  }
}

const cargarEstado = async (forzarRecarga = false) => {
  cargando.value = true
  usaError.value = ''
  europaError.value = ''

  try {
    const url = forzarRecarga
      ? withBase(`estado-fuentes.json?v=${Date.now()}`)
      : withBase('estado-fuentes.json')
    const respuesta = await fetch(url, { method: 'GET', cache: 'no-store' })
    if (!respuesta.ok) throw new Error('No se pudo cargar el snapshot de fuentes')

    const datos = await respuesta.json()
    const usa = datos?.usa ?? {}
    const europa = datos?.europa ?? {}
    const colombia = datos?.colombia ?? {}
    const usaDias = normalizarDias(usa?.dias_desde_reporte)
    const europaDias = normalizarDias(europa?.dias_desde_reporte)
    const colombiaDias = normalizarDias(colombia?.dias_desde_reporte)
    const estadoUsa = obtenerEstadoFuente(usa?.status, usaDias, 60, 120)
    const estadoEuropa = obtenerEstadoFuente(europa?.status, europaDias, 450, 700)

    fechaActualizacion.value = formatearFechaHora(datos?.fecha_consulta)

    usaUltimoReporte.value = formatearFecha(usa?.ultimo_reporte_iso || usa?.ultimo_reporte)
    usaProximoReporte.value = usa?.proximo_reporte ?? 'Próximo reporte: por confirmar'
    usaInventarioTexto.value = Number.isFinite(Number(usa?.inventario_millones))
      ? `${Number(usa.inventario_millones).toFixed(1)} millones`
      : 'sin dato'
    usaDiasTexto.value = usaDias === null ? '—' : String(usaDias)
    usaEstado.value = estadoUsa.texto
    usaNivel.value = estadoUsa.nivel
    usaEnlace.value = usa?.enlace ?? ''
    usaError.value = usa?.error ?? ''

    europaUltimoReporte.value = formatearFecha(europa?.ultimo_reporte_iso || europa?.ultimo_reporte)
    europaProximoReporte.value = europa?.proximo_reporte ?? 'Actualización anual'
    europaInventarioTexto.value = Number.isFinite(Number(europa?.inventario_millones))
      ? `${Number(europa.inventario_millones).toFixed(1)} millones`
      : 'sin dato'
    europaDiasTexto.value = europaDias === null ? '—' : String(europaDias)
    europaEstado.value = estadoEuropa.texto
    europaNivel.value = estadoEuropa.nivel
    europaEnlace.value = europa?.enlace ?? ''
    europaError.value = europa?.error ?? ''

    colombiaUltimoReporte.value = colombia?.ultimo_reporte ?? 'ene 2026'
    colombiaProximoReporte.value = colombia?.proximo_reporte ?? 'Sin fecha programada'
    colombiaEnlace.value = colombia?.enlace ?? ''
    colombiaDiasTexto.value = colombiaDias === null ? '—' : String(colombiaDias)
    colombiaEstado.value = colombiaDias !== null && colombiaDias > 120 ? 'Muy desactualizado' : 'Desactualizado'
  } catch (_error) {
    usaNivel.value = 'error'
    europaNivel.value = 'error'
    usaEstado.value = 'Error de consulta'
    europaEstado.value = 'Error de consulta'
    usaError.value = 'No se pudo cargar el snapshot de monitoreo'
    europaError.value = 'No se pudo cargar el snapshot de monitoreo'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  void cargarEstado(false)
})
</script>

<template>
  <div class="monitoreo">
    <div class="monitoreo__encabezado">
      <span class="monitoreo__icono">📊</span>
      <h3 class="monitoreo__titulo">Estado de las fuentes</h3>
      <div class="monitoreo__acciones">
        <span class="monitoreo__actualizacion">Snapshot: {{ fechaActualizacion }}</span>
        <button class="monitoreo__boton" :disabled="cargando" @click="cargarEstado(true)">
          {{ cargando ? 'Recargando...' : 'Recargar snapshot' }}
        </button>
      </div>
    </div>

    <div class="monitoreo__grid">
      <div class="monitoreo__fuente monitoreo__fuente--colombia">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador monitoreo__indicador--warning"></span>
          <span class="monitoreo__nombre">🇨🇴 Porcinews</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: {{ colombiaUltimoReporte }}</span>
          <span class="monitoreo__status">⚠️ {{ colombiaEstado }}</span>
        </div>
        <div class="monitoreo__meta">Hace {{ colombiaDiasTexto }} días</div>
        <div class="monitoreo__proximo">{{ colombiaProximoReporte }}</div>
        <a v-if="colombiaEnlace" :href="colombiaEnlace" target="_blank" rel="noopener noreferrer" class="monitoreo__enlace">
          Ver fuente consultada
        </a>
      </div>

      <div class="monitoreo__fuente monitoreo__fuente--europa">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador" :class="claseIndicadorEuropa"></span>
          <span class="monitoreo__nombre">🇪🇺 Eurostat</span>
          <span class="monitoreo__badge">API oficial</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: {{ europaUltimoReporte }}</span>
          <span class="monitoreo__status">{{ europaEstado }}</span>
        </div>
        <div class="monitoreo__meta">Hace {{ europaDiasTexto }} días</div>
        <div class="monitoreo__meta">Inventario: {{ europaInventarioTexto }}</div>
        <div class="monitoreo__proximo">{{ europaProximoReporte }}</div>
        <a v-if="europaEnlace" :href="europaEnlace" target="_blank" rel="noopener noreferrer" class="monitoreo__enlace">
          Ver dataset oficial
        </a>
        <div v-if="europaError" class="monitoreo__error">{{ europaError }}</div>
      </div>

      <div class="monitoreo__fuente monitoreo__fuente--usa">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador" :class="claseIndicadorUsa"></span>
          <span class="monitoreo__nombre">🇺🇸 USDA NASS</span>
          <span class="monitoreo__badge">Snapshot diario</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: {{ usaUltimoReporte }}</span>
          <span class="monitoreo__status">{{ usaEstado }}</span>
        </div>
        <div class="monitoreo__meta">Hace {{ usaDiasTexto }} días</div>
        <div class="monitoreo__meta">Inventario: {{ usaInventarioTexto }}</div>
        <div class="monitoreo__proximo">{{ usaProximoReporte }}</div>
        <a v-if="usaEnlace" :href="usaEnlace" target="_blank" rel="noopener noreferrer" class="monitoreo__enlace">
          Ver comunicado oficial
        </a>
        <div v-if="usaError" class="monitoreo__error">{{ usaError }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitoreo {
  background: white;
  border-radius: var(--radio);
  padding: 24px;
  margin: 32px 0;
  border: 1px solid var(--crema-borde);
}

.monitoreo__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.monitoreo__acciones {
  display: flex;
  align-items: center;
  gap: 10px;
}

.monitoreo__icono {
  font-size: 20px;
}

.monitoreo__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--tinta);
  margin: 0;
}

.monitoreo__actualizacion {
  font-size: 12px;
  color: var(--tinta-claro);
}

.monitoreo__boton {
  background: var(--crema);
  border: 1px solid var(--crema-borde);
  color: var(--tinta);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
}

.monitoreo__boton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.monitoreo__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.monitoreo__fuente {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--crema-borde);
}

.monitoreo__fuente--usa {
  border-left: 4px solid var(--usa);
}

.monitoreo__fuente--colombia {
  border-left: 4px solid var(--colombia);
}

.monitoreo__fuente--europa {
  border-left: 4px solid var(--europa, #0EA5A4);
}

.monitoreo__estado {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.monitoreo__indicador {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.monitoreo__indicador--ok {
  background: #10b981;
}

.monitoreo__indicador--warning {
  background: #f59e0b;
}

.monitoreo__indicador--error {
  background: var(--alerta);
}

.monitoreo__nombre {
  font-weight: 600;
  font-size: 14px;
}

.monitoreo__badge {
  margin-left: auto;
  font-size: 10px;
  border: 1px solid var(--crema-borde);
  border-radius: 999px;
  padding: 2px 7px;
  color: var(--tinta-claro);
}

.monitoreo__detalle {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--tinta-claro);
  margin-bottom: 8px;
}

.monitoreo__proximo {
  font-size: 11px;
  color: var(--tinta-claro);
  font-style: italic;
}

.monitoreo__meta {
  font-size: 11px;
  color: var(--tinta-claro);
  margin-bottom: 4px;
}

.monitoreo__enlace {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--tinta-claro);
  text-decoration: none;
}

.monitoreo__enlace:hover {
  color: var(--tinta);
  text-decoration: underline;
}

.monitoreo__error {
  margin-top: 8px;
  font-size: 11px;
  color: var(--alerta);
}

@media (max-width: 900px) {
  .monitoreo__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .monitoreo__encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .monitoreo__acciones {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
