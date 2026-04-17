<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useEstadoGrafica } from '../lib/useEstadoGrafica.js'

const {
  paisActivo,
  datosValidados,
  initDatos,
  maximo,
} = useEstadoGrafica()

const contenedorRef = ref(null)
const esMovil = ref(false)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  pais: '',
  valor: 0,
  periodo: '',
  izquierda: false,
})

const xInicio = 56
const xFin = 716
const yInicio = 40
const yFin = 400
const chartWidth = xFin - xInicio
const chartHeight = yFin - yInicio
const svgAlto = 440
const svgAncho = 760

const catalogoSeries = {
  colombia: { key: 'colombia', label: 'Colombia', icono: '🇨🇴', color: '#A0522D' },
  europa: { key: 'europa', label: 'Europa (UE-27)', icono: '🇪🇺', color: '#2E7D32' },
  usa: { key: 'usa', label: 'EE.UU.', icono: '🇺🇸', color: '#1565C0' },
}

const botones = [
  { value: 'colombia', label: '🟤 Colombia' },
  { value: 'europa', label: '🟢 Europa' },
  { value: 'usa', label: '🔵 EE.UU.' },
  { value: 'todos', label: '⚖️ Todos' },
]

initDatos()

const seriesActivas = computed(() => {
  if (paisActivo.value === 'colombia') return [{ ...catalogoSeries.colombia, data: datosValidados.value.colombia || [] }]
  if (paisActivo.value === 'europa') return [{ ...catalogoSeries.europa, data: datosValidados.value.europa || [] }]
  if (paisActivo.value === 'usa') return [{ ...catalogoSeries.usa, data: datosValidados.value.usa || [] }]
  return [
    { ...catalogoSeries.colombia, data: datosValidados.value.colombia || [] },
    { ...catalogoSeries.europa, data: datosValidados.value.europa || [] },
    { ...catalogoSeries.usa, data: datosValidados.value.usa || [] },
  ]
})

const etiquetasY = computed(() => {
  const max = maximo.value || 20
  const valores = [max, (max * 3) / 4, max / 2, max / 4, 0]
  return valores.map((valor) => `${Math.round(valor)}M`)
})

const obtenerPasoX = (serie) => {
  if (!serie || serie.length <= 1) return 0
  return chartWidth / (serie.length - 1)
}

const escalarY = (valorEnMillones) => yFin - (valorEnMillones / maximo.value) * chartHeight

const polylineSerie = (serie) => {
  const paso = obtenerPasoX(serie)
  return serie
    .map((p, i) => `${xInicio + i * paso},${escalarY(p.valor)}`)
    .join(' ')
}

const serieEjeX = computed(() => {
  if (paisActivo.value === 'usa') return datosValidados.value.usa || []
  if (paisActivo.value === 'colombia') return datosValidados.value.colombia || []
  return datosValidados.value.europa || []
})

const etiquetasX = computed(() => {
  const labels = serieEjeX.value.map((d) => d.periodo)
  if (esMovil.value && labels.length > 10) {
    return labels.map((label, i) => (i % 2 === 0 || i === labels.length - 1 ? label : ''))
  }
  return labels
})

const pasoXEtiquetas = computed(() => {
  const len = etiquetasX.value.length
  if (len <= 1) return 0
  return chartWidth / (len - 1)
})

const debeRotar = computed(() => etiquetasX.value.length > 10)

const svgWidth = computed(() => (esMovil.value ? '100%' : svgAncho))
const svgViewBox = computed(() => `0 0 ${svgAncho} ${svgAlto}`)

const mostrarTooltip = (event, pais, dato) => {
  if (!contenedorRef.value) return
  const rect = event.target.getBoundingClientRect()
  const container = contenedorRef.value.getBoundingClientRect()
  const x = rect.left - container.left + 12
  const y = rect.top - container.top - 70
  const tooltipWidth = 190
  const izquierda = x + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? x - tooltipWidth - 10 : x,
    y: Math.max(0, y),
    pais,
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const mostrarTooltipTouch = (serie, dato, idx) => {
  if (!contenedorRef.value) return
  const paso = obtenerPasoX(serie.data)
  const container = contenedorRef.value.getBoundingClientRect()
  const xSvg = xInicio + idx * paso
  const ySvg = escalarY(dato.valor)
  const xPx = (xSvg / svgAncho) * container.width
  const yPx = (ySvg / svgAlto) * container.height
  const tooltipWidth = 190
  const izquierda = xPx + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? xPx - tooltipWidth - 10 : xPx + 10,
    y: Math.max(0, yPx - 70),
    pais: serie.label,
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const ocultarTooltip = () => {
  tooltip.value.visible = false
}

const actualizarViewport = () => {
  esMovil.value = window.innerWidth < 700
}

const handleTouchOutside = (event) => {
  if (contenedorRef.value && !contenedorRef.value.contains(event.target)) {
    ocultarTooltip()
  }
}

onMounted(() => {
  actualizarViewport()
  window.addEventListener('resize', actualizarViewport)
  document.addEventListener('touchstart', handleTouchOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', actualizarViewport)
  document.removeEventListener('touchstart', handleTouchOutside)
})
</script>

<template>
  <section class="grafica-card" aria-labelledby="grafica-titulo" role="region">
    <h2 id="grafica-titulo" class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo" id="grafica-subtitulo">En millones de cabezas (Colombia, Europa y EE.UU.).</p>

    <div class="grafica-botones" role="group" aria-label="Filtrar por región" aria-describedby="grafica-subtitulo">
      <button
        v-for="opcion in botones"
        :key="opcion.value"
        class="grafica-boton"
        :class="{ 'grafica-boton--activo': paisActivo === opcion.value }"
        @click="paisActivo = opcion.value"
        :aria-pressed="paisActivo === opcion.value"
        tabindex="0"
      >
        {{ opcion.label }}
      </button>
    </div>

    <div
      class="grafica-contenedor"
      ref="contenedorRef"
      role="img"
      aria-label="Gráfico interactivo del inventario porcino para Colombia, Europa y Estados Unidos."
    >
      <svg :viewBox="svgViewBox" :width="svgWidth" :height="svgAlto" role="presentation" aria-hidden="true">
        <title>Inventario histórico porcino: Colombia, Europa y EE.UU.</title>
        <desc>Comparación de series históricas de inventario porcino entre Colombia, la UE-27 y EE.UU.</desc>

        <g class="grafica-grid">
          <line
            v-for="i in 5"
            :key="`grid-${i}`"
            :x1="xInicio"
            :y1="yInicio + (chartHeight * (i - 1)) / 4"
            :x2="xFin"
            :y2="yInicio + (chartHeight * (i - 1)) / 4"
            stroke="#D4C5C5"
            stroke-dasharray="4 4"
          />
        </g>

        <g class="grafica-y-axis">
          <text
            v-for="(valor, i) in etiquetasY"
            :key="`y-${i}`"
            x="60"
            :y="yInicio + (chartHeight * i) / 4"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="12"
            font-weight="500"
            fill="#4A2E2E"
          >
            {{ valor }}
          </text>
        </g>

        <g class="grafica-x-axis">
          <line :x1="xInicio" :y1="yFin" :x2="xFin" :y2="yFin" stroke="#D4C5C5" stroke-width="1" />
          <text
            v-for="(label, i) in etiquetasX"
            :key="`x-${i}`"
            :x="xInicio + i * pasoXEtiquetas"
            y="425"
            text-anchor="middle"
            font-size="12"
            font-weight="500"
            fill="#4A2E2E"
            :transform="debeRotar ? `rotate(-40, ${xInicio + i * pasoXEtiquetas}, 452)` : ''"
          >
            {{ label }}
          </text>
        </g>

        <template v-for="serie in seriesActivas" :key="`linea-${serie.key}`">
          <polyline
            :points="polylineSerie(serie.data)"
            fill="none"
            :stroke="serie.color"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="(punto, idx) in serie.data"
            :key="`${serie.key}-${idx}`"
            :cx="xInicio + idx * obtenerPasoX(serie.data)"
            :cy="escalarY(punto.valor)"
            r="4"
            :fill="serie.color"
            class="grafica-punto"
            tabindex="0"
            @mouseenter="mostrarTooltip($event, serie.label, punto)"
            @focus="mostrarTooltip($event, serie.label, punto)"
            @mouseleave="ocultarTooltip"
            @blur="ocultarTooltip"
            @touchstart.prevent="mostrarTooltipTouch(serie, punto, idx)"
          />
        </template>

        <g transform="translate(88, 24)">
          <g v-for="(serie, idx) in seriesActivas" :key="`legend-${serie.key}`" :transform="`translate(${idx * 180}, 0)`">
            <line x1="0" y1="0" x2="24" y2="0" :stroke="serie.color" stroke-width="3" />
            <circle cx="12" cy="0" r="4" :fill="serie.color" />
            <text x="32" y="4" font-size="12" font-weight="500" fill="#4A2E2E">{{ serie.label }}</text>
          </g>
        </g>
      </svg>

      <div
        v-if="tooltip.visible"
        class="grafica-tooltip"
        :class="{ 'grafica-tooltip--izquierda': tooltip.izquierda }"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
        role="tooltip"
      >
        <div class="grafica-tooltip__titulo">{{ tooltip.pais }}</div>
        <div class="grafica-tooltip__valor">{{ tooltip.valor.toLocaleString() }} cabezas</div>
        <div class="grafica-tooltip__periodo">{{ tooltip.periodo }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grafica-card {
  background: var(--crema-oscuro, #F7E0DC);
  border: 1.5px solid var(--crema-borde, #EEC9C4);
  border-radius: var(--radio, 14px);
  padding: 28px 32px;
  margin-bottom: 36px;
  box-shadow: var(--sombra, 0 10px 28px rgba(59, 31, 28, 0.08));
}

.grafica-card__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--tinta, #3B1F1C);
}

.grafica-card__subtitulo {
  font-size: 13px;
  color: var(--tinta-claro, #7A4A44);
  margin: 0 0 24px;
  line-height: 1.5;
}

.grafica-botones {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.grafica-boton {
  padding: 10px 20px;
  border: 2px solid #E8D6CF;
  border-radius: 8px;
  background: #F7ECE6;
  font-size: 14px;
  font-weight: 500;
  color: #5A3A3A;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: 'DM Sans', sans-serif;
}

.grafica-boton:hover {
  background: #A12D2D !important;
  border-color: #A12D2D !important;
  color: white !important;
  opacity: 1 !important;
}

.grafica-boton--activo {
  background: #7A1F1F !important;
  border-color: #7A1F1F !important;
  color: white !important;
}

.grafica-boton--activo:hover {
  background: #7A1F1F !important;
  border-color: #7A1F1F !important;
  color: white !important;
  opacity: 1 !important;
}

.grafica-contenedor {
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.grafica-contenedor svg {
  display: block;
  width: 100%;
  height: auto;
}

.grafica-punto {
  cursor: pointer;
  transition: r 0.2s ease;
}

.grafica-punto:hover {
  r: 7;
}

.grafica-tooltip {
  position: absolute;
  background: #FFFFFF;
  color: #3A2424;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: none;
  border: 1px solid #E0D0C0;
  white-space: nowrap;
  max-width: 220px;
}

.grafica-tooltip--izquierda {
  transform: translateX(-100%);
}

.grafica-tooltip__titulo {
  font-weight: 600;
  margin-bottom: 4px;
}

.grafica-tooltip__valor {
  font-size: 14px;
  font-weight: 700;
}

.grafica-tooltip__periodo {
  opacity: 0.7;
  margin-top: 2px;
}

@media (max-width: 700px) {
  .grafica-card {
    padding: 20px 16px;
  }

  .grafica-card__titulo {
    font-size: 22px;
  }

  .grafica-botones {
    gap: 8px;
  }

  .grafica-boton {
    padding: 8px 14px;
    font-size: 13px;
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .grafica-contenedor {
    min-width: 700px;
  }
}

@media (max-width: 500px) {
  .grafica-card {
    padding: 16px 12px;
  }

  .grafica-card__titulo {
    font-size: 20px;
  }

  .grafica-card__subtitulo {
    font-size: 12px;
    margin-bottom: 16px;
  }
}
</style>
