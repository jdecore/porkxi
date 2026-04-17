<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from '../lib/paths.js'

const emit = defineEmits(['actualizado', 'reload'])

const cargando = ref(false)
const sincronizando = ref(false)
const mensajeSincronizacion = ref('')
const fechaConsultaIso = ref('')
const fechaActualizacion = ref('sin datos')

const usaUltimoReporte = ref('sin dato')
const usaEstado = ref('Pendiente')
const usaProximoReporte = ref('Próximo reporte: por confirmar')
const usaError = ref('')
const usaEnlace = ref('')
const usaInventarioTexto = ref('sin dato')
const usaDiasTexto = ref('—')
const usaNivel = ref('warning')
const usaFuente = ref('USDA NASS RSS')
const usaTitulo = ref('')
const usaStatusTecnico = ref('—')

const europaUltimoReporte = ref('sin dato')
const europaEstado = ref('Pendiente')
const europaProximoReporte = ref('Próxima actualización: por confirmar')
const europaError = ref('')
const europaEnlace = ref('')
const europaInventarioTexto = ref('sin dato')
const europaDiasTexto = ref('—')
const europaNivel = ref('warning')
const europaFuente = ref('Eurostat API')
const europaDataset = ref('—')
const europaNota = ref('')
const europaStatusTecnico = ref('—')

const colombiaUltimoReporte = ref('ene 2026')
const colombiaEstado = ref('Desactualizado')
const colombiaProximoReporte = ref('Sin fecha programada')
const colombiaEnlace = ref('')
const colombiaDiasTexto = ref('—')
const colombiaFuente = ref('Porcinews')
const colombiaStatusTecnico = ref('warning')
const snapshotRemotoUrl = ref(
  import.meta.env.PUBLIC_REMOTE_SNAPSHOT_URL
  || 'https://raw.githubusercontent.com/jdecore/porkxi/main/public/estado-fuentes.json',
)

const textoBoton = computed(() => {
  if (sincronizando.value) return 'Sincronizando...'
  if (cargando.value) return 'Actualizando...'
  return '🔄 Sincronizar datos'
})

const botonBloqueado = computed(() => cargando.value || sincronizando.value)

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

const esperar = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

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

const obtenerSnapshot = async (forzarRecarga = false) => {
  if (forzarRecarga) {
    const separador = snapshotRemotoUrl.value.includes('?') ? '&' : '?'
    const urlRemota = `${snapshotRemotoUrl.value}${separador}v=${Date.now()}`
    const respuestaRemota = await fetch(urlRemota, { method: 'GET', cache: 'no-store' })
    if (respuestaRemota.ok) return respuestaRemota.json()
  }

  const url = forzarRecarga
    ? withBase(`estado-fuentes.json?v=${Date.now()}`)
    : withBase('estado-fuentes.json')
  const respuesta = await fetch(url, { method: 'GET', cache: 'no-store' })
  if (!respuesta.ok) throw new Error('No se pudo cargar el snapshot de fuentes')
  return respuesta.json()
}

const aplicarEstado = (datos) => {
  emit('reload')
  emit('actualizado', datos)
  const usa = datos?.usa ?? {}
  const europa = datos?.europa ?? {}
  const colombia = datos?.colombia ?? {}
  const usaDias = normalizarDias(usa?.dias_desde_reporte)
  const europaDias = normalizarDias(europa?.dias_desde_reporte)
  const colombiaDias = normalizarDias(colombia?.dias_desde_reporte)
  const estadoUsa = obtenerEstadoFuente(usa?.status, usaDias, 60, 120)
  const estadoEuropa = obtenerEstadoFuente(europa?.status, europaDias, 450, 700)

  fechaConsultaIso.value = typeof datos?.fecha_consulta === 'string' ? datos.fecha_consulta : ''
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
  usaFuente.value = usa?.fuente ?? 'USDA NASS RSS'
  usaTitulo.value = usa?.titulo ?? ''
  usaStatusTecnico.value = usa?.status ?? '—'

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
  europaFuente.value = europa?.fuente ?? 'Eurostat API'
  europaDataset.value = europa?.dataset ?? '—'
  europaNota.value = europa?.nota ?? ''
  europaStatusTecnico.value = europa?.status ?? '—'

  colombiaUltimoReporte.value = colombia?.ultimo_reporte ?? 'ene 2026'
  colombiaProximoReporte.value = colombia?.proximo_reporte ?? 'Sin fecha programada'
  colombiaEnlace.value = colombia?.enlace ?? ''
  colombiaDiasTexto.value = colombiaDias === null ? '—' : String(colombiaDias)
  colombiaEstado.value = colombiaDias !== null && colombiaDias > 120 ? 'Muy desactualizado' : 'Desactualizado'
  colombiaFuente.value = colombia?.fuente ?? 'Porcinews'
  colombiaStatusTecnico.value = colombia?.status ?? 'warning'
}

const marcarErrorCarga = () => {
  usaNivel.value = 'error'
  europaNivel.value = 'error'
  usaEstado.value = 'Error de consulta'
  europaEstado.value = 'Error de consulta'
  usaError.value = 'No se pudo cargar el snapshot de monitoreo'
  europaError.value = 'No se pudo cargar el snapshot de monitoreo'
}

const cargarEstado = async (forzarRecarga = false, limpiarMensaje = true) => {
  cargando.value = true
  usaError.value = ''
  europaError.value = ''

  try {
    const datos = await obtenerSnapshot(forzarRecarga)
    aplicarEstado(datos)
    if (limpiarMensaje) mensajeSincronizacion.value = ''
  } catch (_error) {
    marcarErrorCarga()
  } finally {
    cargando.value = false
  }
}

const esperarSnapshotNuevo = async (fechaAnteriorMs, timeoutMs = 180000, intervaloMs = 5000) => {
  const inicio = Date.now()
  while (Date.now() - inicio < timeoutMs) {
    await esperar(intervaloMs)
    const datos = await obtenerSnapshot(true)
    const fechaNuevaMs = Date.parse(datos?.fecha_consulta ?? '')
    if (Number.isFinite(fechaNuevaMs) && (!Number.isFinite(fechaAnteriorMs) || fechaNuevaMs > fechaAnteriorMs)) {
      return datos
    }
  }
  throw new Error('La actualización tardó más de lo esperado')
}

const sincronizarDatos = async () => {
  if (botonBloqueado.value) return
  sincronizando.value = true
  mensajeSincronizacion.value = 'Lanzando actualización de fuentes...'

  const fechaAnteriorMs = Date.parse(fechaConsultaIso.value)

  try {
    const respuesta = await fetch('/api/sincronizar-fuentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({}),
    })

    if (!respuesta.ok) {
      const payload = await respuesta.json().catch(() => null)
      throw new Error(payload?.error || 'No se pudo iniciar la sincronización')
    }

    const payload = await respuesta.json().catch(() => null)
    if (typeof payload?.snapshot_url === 'string' && payload.snapshot_url) {
      snapshotRemotoUrl.value = payload.snapshot_url
    }

    mensajeSincronizacion.value = 'Sincronización iniciada. Esperando snapshot actualizado...'
    const datosActualizados = await esperarSnapshotNuevo(fechaAnteriorMs)
    aplicarEstado(datosActualizados)
    mensajeSincronizacion.value = 'Datos sincronizados correctamente.'
  } catch (errorSync) {
    console.error('Error sincronizando datos:', errorSync)
    const detalle = errorSync instanceof Error ? errorSync.message : 'Error desconocido'
    mensajeSincronizacion.value = `No se pudo completar la sincronización: ${detalle}`
    await cargarEstado(true, false)
  } finally {
    sincronizando.value = false
  }
}

onMounted(() => {
  void cargarEstado(false)
})
</script>

<template>
  <div class="monitoreo">
    <div class="monitoreo__encabezado">
      <span class="monitoreo__icono">📡</span>
      <div class="monitoreo__titulo-wrap">
        <h3 class="monitoreo__titulo">Monitoreo de fuentes</h3>
        <span class="monitoreo__auto">Snapshot diario: {{ fechaActualizacion || 'cargando...' }}</span>
      </div>
      <div class="monitoreo__acciones">
        <button class="monitoreo__boton" :disabled="botonBloqueado" @click="sincronizarDatos">
          {{ textoBoton }}
        </button>
      </div>
    </div>
    <p v-if="mensajeSincronizacion" class="monitoreo__sync">{{ mensajeSincronizacion }}</p>

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
        <div class="monitoreo__meta">Fuente técnica: {{ colombiaFuente }}</div>
        <div class="monitoreo__meta">Estado técnico: {{ colombiaStatusTecnico }}</div>
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
        <div class="monitoreo__meta">Fuente técnica: {{ europaFuente }}</div>
        <div class="monitoreo__meta">Dataset: {{ europaDataset }}</div>
        <div class="monitoreo__meta">Estado técnico: {{ europaStatusTecnico }}</div>
        <div v-if="europaNota" class="monitoreo__meta">Nota: {{ europaNota }}</div>
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
        <div class="monitoreo__meta">Fuente técnica: {{ usaFuente }}</div>
        <div class="monitoreo__meta">Estado técnico: {{ usaStatusTecnico }}</div>
        <div v-if="usaTitulo" class="monitoreo__meta">Comunicado: {{ usaTitulo }}</div>
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
  background: #FDF6F4;
  border: 1.5px solid #E8C4BC;
  border-radius: 14px;
  padding: 16px 20px;
  margin: 0 0 24px;
}

.monitoreo__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.monitoreo__acciones {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitoreo__icono {
  font-size: 18px;
}

.monitoreo__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #B8482D;
}

.monitoreo__auto {
  font-size: 12px;
  color: #6B3A2C;
  display: block;
  margin-top: 4px;
}

.monitoreo__actualizacion {
  font-size: 12px;
  color: var(--tinta-claro);
}

.monitoreo__boton {
  background: #FEF0EB;
  border: 1px solid #E8C4BC;
  color: #A64028;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 10px;
  cursor: pointer;
}

.monitoreo__boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.monitoreo__sync {
  margin: -2px 0 12px;
  font-size: 11px;
  color: #6B3A2C;
}

.monitoreo__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.monitoreo__fuente {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #E8C4BC;
  background: #FEF0EB;
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
  gap: 6px;
  margin-bottom: 6px;
}

.monitoreo__indicador {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.monitoreo__indicador--ok {
  background: #10b981;
}

.monitoreo__indicador--warning {
  background: #f59e0b;
}

.monitoreo__indicador--error {
  background: #C0392B;
}

.monitoreo__nombre {
  font-weight: 600;
  font-size: 12px;
  color: #A64028;
}

.monitoreo__badge {
  margin-left: auto;
  font-size: 9px;
  border: 1px solid #E8C4BC;
  border-radius: 999px;
  padding: 2px 6px;
  color: #6B3A2C;
}

.monitoreo__detalle {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6B3A2C;
  margin-bottom: 6px;
}

.monitoreo__proximo {
  font-size: 10px;
  color: #6B3A2C;
  font-style: italic;
}

.monitoreo__meta {
  font-size: 10px;
  color: #6B3A2C;
  margin-bottom: 3px;
}

.monitoreo__enlace {
  display: inline-block;
  margin-top: 4px;
  font-size: 10px;
  color: #6B3A2C;
  text-decoration: none;
}

.monitoreo__enlace:hover {
  color: #A64028;
  text-decoration: underline;
}

.monitoreo__error {
  margin-top: 6px;
  font-size: 10px;
  color: #C0392B;
}

@media (max-width: 900px) {
  .monitoreo {
    padding: 12px 14px;
  }
  .monitoreo__grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 600px) {
  .monitoreo__encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .monitoreo__titulo {
    font-size: 14px;
  }

  .monitoreo__acciones {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
