<template>
  <div class="monitoreo">
    <div class="monitoreo__encabezado">
      <span class="monitoreo__icono">📊</span>
      <h3 class="monitoreo__titulo">Estado de las fuentes</h3>
      <div class="monitoreo__acciones">
        <span class="monitoreo__actualizacion">Actualizado: {{ fechaActualizacion }}</span>
        <button class="monitoreo__boton" :disabled="cargando" @click="cargarEstado">
          {{ cargando ? 'Actualizando...' : 'Actualizar ahora' }}
        </button>
      </div>
    </div>

    <div class="monitoreo__grid">
      <div class="monitoreo__fuente monitoreo__fuente--usa">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador" :class="claseIndicadorUsa"></span>
          <span class="monitoreo__nombre">🇺🇸 USDA NASS</span>
          <span class="monitoreo__badge">En vivo</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: {{ usaUltimoReporte }}</span>
          <span class="monitoreo__status">{{ usaEstado }}</span>
        </div>
        <div class="monitoreo__proximo">
          {{ usaProximoReporte }}
        </div>
        <div v-if="usaError" class="monitoreo__error">
          {{ usaError }}
        </div>
      </div>

      <div class="monitoreo__fuente monitoreo__fuente--colombia">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador monitoreo__indicador--warning"></span>
          <span class="monitoreo__nombre">🇨🇴 Porcinews</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: {{ colombiaUltimoReporte }}</span>
          <span class="monitoreo__status">⚠️ Desactualizado</span>
        </div>
        <div class="monitoreo__proximo">
          {{ colombiaProximoReporte }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const cargando = ref(false)
const fechaActualizacion = ref('sin consulta')
const usaUltimoReporte = ref('sin dato')
const usaEstado = ref('⏳ Sin consultar')
const usaProximoReporte = ref('Próximo reporte: por confirmar')
const usaError = ref('')
const colombiaUltimoReporte = ref('ene 2026')
const colombiaProximoReporte = ref('Sin fecha programada')

const claseIndicadorUsa = computed(() => {
  if (cargando.value) return 'monitoreo__indicador--warning'
  if (usaError.value) return 'monitoreo__indicador--error'
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
    minute: '2-digit'
  })
}

const cargarEstado = async () => {
  cargando.value = true
  usaError.value = ''

  try {
    const respuesta = await fetch('/api/estado-fuentes', {
      method: 'GET',
      cache: 'no-store'
    })

    if (!respuesta.ok) {
      throw new Error('No se pudo consultar el estado de fuentes')
    }

    const datos = await respuesta.json()
    const usa = datos?.usa ?? {}
    const colombia = datos?.colombia ?? {}

    fechaActualizacion.value = formatearFechaHora(datos?.fecha_consulta)
    usaUltimoReporte.value = formatearFecha(usa?.ultimo_reporte)
    usaProximoReporte.value = usa?.proximo_reporte ?? 'Próximo reporte: por confirmar'

    if (usa?.status === 'ok') {
      usaEstado.value = '✅ Actualizado en vivo'
    } else {
      usaEstado.value = '⚠️ Error de consulta'
      usaError.value = usa?.error ?? 'No fue posible validar USDA en este momento'
    }

    colombiaUltimoReporte.value = colombia?.ultimo_reporte ?? 'ene 2026'
    colombiaProximoReporte.value = colombia?.proximo_reporte ?? 'Sin fecha programada'
  } catch (error) {
    usaEstado.value = '⚠️ Error de consulta'
    usaError.value = 'No se pudo conectar con el monitoreo en vivo'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  void cargarEstado()
})
</script>

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
  grid-template-columns: repeat(2, 1fr);
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

.monitoreo__error {
  margin-top: 8px;
  font-size: 11px;
  color: var(--alerta);
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

  .monitoreo__grid {
    grid-template-columns: 1fr;
  }
}
</style>
