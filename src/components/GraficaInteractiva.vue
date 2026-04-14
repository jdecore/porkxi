<template>
  <section class="grafica-card" aria-labelledby="grafica-titulo" role="region">
    <h2 id="grafica-titulo" class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo" id="grafica-subtitulo">En millones de cabezas.</p>

    <div class="grafica-botones" role="group" aria-label="Filtrar por país" aria-describedby="grafica-subtitulo">
      <button
        class="grafica-boton"
        :class="{ 'grafica-boton--activo': paisActivo === 'colombia' }"
        @click="paisActivo = 'colombia'"
        @keydown.enter="paisActivo = 'colombia'"
        @keydown.space.prevent="paisActivo = 'colombia'"
        :aria-pressed="paisActivo === 'colombia'"
        tabindex="0"
      >
        🟡 Colombia
      </button>
      <button
        class="grafica-boton"
        :class="{ 'grafica-boton--activo': paisActivo === 'usa' }"
        @click="paisActivo = 'usa'"
        @keydown.enter="paisActivo = 'usa'"
        @keydown.space.prevent="paisActivo = 'usa'"
        :aria-pressed="paisActivo === 'usa'"
        tabindex="0"
      >
        🔵 EE.UU.
      </button>
      <button
        class="grafica-boton"
        :class="{ 'grafica-boton--activo': paisActivo === 'ambos' }"
        @click="paisActivo = 'ambos'"
        @keydown.enter="paisActivo = 'ambos'"
        @keydown.space.prevent="paisActivo = 'ambos'"
        :aria-pressed="paisActivo === 'ambos'"
        tabindex="0"
      >
        ⚖️ Ambos
      </button>
    </div>

    <div class="grafica-contenedor" ref="contenedorRef" role="img" aria-label="Gráfico de líneas interactivo del inventario porcino. Use las flechas del teclado para navegar por los puntos de datos.">
      <svg
        :viewBox="svgViewBox"
        :width="svgWidth"
        :height="svgHeight"
        role="presentation"
        aria-hidden="true"
      >
        <title>Inventario histórico porcino: Colombia vs EE.UU.</title>
        <desc>Gráfica de líneas que compara el inventario porcino en Colombia (datos anuales) y EE.UU. (datos trimestrales) desde 2015 hasta 2025.</desc>

        <!-- Grid horizontal -->
        <g class="grafica-grid">
          <line
            v-for="i in 5"
            :key="'grid-' + i"
            x1="86"
            :y1="56 + 340 * (i - 1) / 4"
            x2="756"
            :y2="56 + 340 * (i - 1) / 4"
            stroke="#EEC9C4"
            stroke-dasharray="3,3"
          />
        </g>

        <!-- Eje Y -->
        <g class="grafica-y-axis">
          <text
            v-for="(valor, i) in etiquetasY"
            :key="'y-' + i"
            x="69"
            :y="56 + 340 * i / 4"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="13"
            fill="#7A4A44"
          >
            {{ valor }}
          </text>
        </g>

        <!-- Eje X -->
        <g class="grafica-x-axis">
          <line x1="86" y1="420" x2="756" y2="420" stroke="#EEC9C4" stroke-width="1" />
          <text
            v-for="(label, i) in etiquetasX"
            :key="'x-' + i"
            :x="86 + i * pasoX"
            y="455"
            text-anchor="middle"
            font-size="12"
            fill="#7A4A44"
            :transform="debeRotar ? `rotate(-40, ${86 + i * pasoX}, 455)` : ''"
          >
            {{ label }}
          </text>
        </g>

        <!-- Línea Colombia -->
        <template v-if="paisActivo !== 'usa' && (datosValidados?.colombia || []).length">
          <polyline
            :points="lineaColonia"
            fill="none"
            stroke="#F5A800"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="(p, i) in (datosValidados?.colombia || [])"
            :key="'c-' + i"
            :cx="86 + i * pasoXCol"
            :cy="escalaY(p.valor)"
            r="6"
            fill="#F5A800"
            class="grafica-punto"
            tabindex="0"
            @mouseenter="mostrarTooltip($event, 'Colombia', p)"
            @focus="mostrarTooltip($event, 'Colombia', p)"
            @mouseleave="ocultarTooltip"
            @blur="ocultarTooltip"
            @touchstart.prevent="mostrarTooltipTouch('Colombia', p, i)"
          />
        </template>

        <!-- Línea USA -->
        <template v-if="paisActivo !== 'colombia' && (datosValidados?.usa || []).length">
          <polyline
            :points="lineaUsa"
            fill="none"
            stroke="#2563EB"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="(p, i) in (datosValidados?.usa || [])"
            :key="'u-' + i"
            :cx="86 + i * pasoXUsa"
            :cy="escalaY(p.valor)"
            r="6"
            fill="#2563EB"
            class="grafica-punto"
            tabindex="0"
            @mouseenter="mostrarTooltipUSA($event, p, i)"
            @focus="mostrarTooltipUSA($event, p, i)"
            @mouseleave="ocultarTooltip"
            @blur="ocultarTooltip"
            @touchstart.prevent="mostrarTooltipTouchUSA(p, i)"
          />
        </template>

        <!-- Leyenda -->
        <g transform="translate(756, 28)">
          <template v-if="paisActivo !== 'usa'">
            <line x1="0" y1="0" x2="24" y2="0" stroke="#F5A800" stroke-width="3" />
            <circle cx="12" cy="0" r="4" fill="#F5A800" />
            <text x="32" y="4" font-size="12" fill="#3B1F1C" font-weight="500">Colombia</text>
          </template>
          <template v-if="paisActivo !== 'colombia'">
            <line
              :x1="paisActivo === 'ambos' ? 110 : 0"
              y1="0"
              :x2="paisActivo === 'ambos' ? 134 : 24"
              y2="0"
              stroke="#2563EB"
              stroke-width="3"
            />
            <circle
              :cx="paisActivo === 'ambos' ? 122 : 12"
              cy="0"
              r="4"
              fill="#2563EB"
            />
            <text
              :x="paisActivo === 'ambos' ? 142 : 32"
              y="4"
              font-size="12"
              fill="#3B1F1C"
              font-weight="500"
            >
              USA
            </text>
          </template>
        </g>
      </svg>

      <template v-if="tooltip.visible">
        <div
          class="grafica-tooltip"
          :class="{ 'grafica-tooltip--izquierda': tooltip.izquierda }"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
          role="tooltip"
          :aria-label="`Datos de ${tooltip.pais}: ${tooltip.valor.toLocaleString()} cabezas en ${tooltip.periodo}`"
        >
          <div class="grafica-tooltip__titulo">
            {{ tooltip.pais === 'Colombia' ? '🇨🇴 Colombia' : '🇺🇸 USA' }}
          </div>
          <div class="grafica-tooltip__valor">
            {{ tooltip.valor.toLocaleString() }} cabezas
          </div>
          <div class="grafica-tooltip__periodo">{{ tooltip.periodo }}</div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { useEstadoGrafica } from '../lib/useEstadoGrafica.js'
import { serieColombia, serieUSA } from '../lib/datos-grafico.js'
import { ref, computed, onMounted, watch } from 'vue'

const { paisActivo, datosValidados, setPais, initDatos, maximo, dataByPais } = useEstadoGrafica()

const contenedorRef = ref(null)
const esMovil = ref(false)

// Dimensioni del'area di disegno (ridotte del 10%)
const areaAncho = 816
const areaAlto = 340
const svgAlto = 476

initDatos()

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  pais: '',
  valor: 0,
  periodo: '',
  izquierda: false,
})

const etiquetasY = computed(() => {
  if (paisActivo.value === 'colombia') return ['12M', '9M', '6M', '3M', '0']
  return ['80M', '60M', '40M', '20M', '0']
})

const pasoXCol = computed(() => {
  const len = (datosValidados.value?.colombia || []).length
  return len > 1 ? areaAncho / (len - 1) : 0
})

const pasoXUsa = computed(() => {
  const len = (datosValidados.value?.usa || []).length
  return len > 1 ? areaAncho / (len - 1) : 0
})

const pasoX = computed(() => {
  if (paisActivo.value === 'colombia') return pasoXCol.value
  return pasoXUsa.value
})

const escalaY = (valor) => 340 - (valor / maximo.value) * areaAlto

const lineaColonia = computed(() => {
  if (paisActivo.value === 'usa' || !(datosValidados.value?.colombia || []).length) return ''
  return (datosValidados.value?.colombia || [])
    .map(
      (p, i) =>
        `${86 + i * pasoXCol.value},${escalaY(p.valor)}`
    )
    .join(' ')
})

const lineaUsa = computed(() => {
  if (paisActivo.value === 'colombia' || !(datosValidados.value?.usa || []).length) return ''
  return (datosValidados.value?.usa || [])
    .map(
      (p, i) =>
        `${86 + i * pasoXUsa.value},${escalaY(p.valor)}`
    )
    .join(' ')
})

const debeRotar = computed(() => {
  return etiquetasX.value.length > 10
})

const etiquetasX = computed(() => {
  if (paisActivo.value === 'colombia') {
    return (datosValidados.value?.colombia || []).map((d) => d.periodo)
  }
  // USA: mostrar label abreviado solo en puntos clave para evitar overlap
  const allLabels = (datosValidados.value?.usa || []).map((d) => d.periodo)
  if (esMovil.value && allLabels.length > 8) {
    return allLabels.map((label, i) =>
      i % 3 === 0 || i === allLabels.length - 1 ? label : ''
    )
  }
  return allLabels
}) 

// Responsive SVG
const svgWidth = computed(() => (esMovil.value ? '100%' : 756))
const svgHeight = computed(() => svgAlto)
const svgViewBox = computed(() => `0 0 756 ${svgAlto}`)

const mostrarTooltip = (event, pais, dato) => {
  if (!contenedorRef.value) return
  const rect = event.target.getBoundingClientRect()
  const container = contenedorRef.value.getBoundingClientRect()
  const x = rect.left - container.left + 12
  const y = rect.top - container.top - 70

  const tooltipWidth = 180
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

const mostrarTooltipUSA = (event, dato, idx) => {
  if (!contenedorRef.value) return
  const rect = event.target.getBoundingClientRect()
  const container = contenedorRef.value.getBoundingClientRect()
  const x = rect.left - container.left + 12
  const y = rect.top - container.top - 70

  const tooltipWidth = 180
  const izquierda = x + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? x - tooltipWidth - 10 : x,
    y: Math.max(0, y),
    pais: 'USA',
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const mostrarTooltipTouch = (pais, dato, idx) => {
  if (!contenedorRef.value) return
  const container = contenedorRef.value.getBoundingClientRect()
  const xSvg = 98 + idx * pasoXCol.value
  const ySvg = escalaY(dato.valor)
  const xPx = (xSvg / 1176) * container.width
  const yPx = (ySvg / svgAlto) * container.height

  const tooltipWidth = 180
  const izquierda = xPx + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? xPx - tooltipWidth - 10 : xPx + 10,
    y: Math.max(0, yPx - 70),
    pais,
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const mostrarTooltipTouchUSA = (dato, idx) => {
  if (!contenedorRef.value) return
  const container = contenedorRef.value.getBoundingClientRect()
  const xSvg = 98 + idx * pasoXUsa.value
  const ySvg = escalaY(dato.valor)
  const xPx = (xSvg / 1176) * container.width
  const yPx = (ySvg / svgAlto) * container.height

  const tooltipWidth = 180
  const izquierda = xPx + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? xPx - tooltipWidth - 10 : xPx + 10,
    y: Math.max(0, yPx - 70),
    pais: 'USA',
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const ocultarTooltip = () => {
  tooltip.value.visible = false
}

onMounted(() => {
  esMovil.value = window.innerWidth < 700
  const handleResize = () => {
    esMovil.value = window.innerWidth < 700
  }
  window.addEventListener('resize', handleResize)

  document.addEventListener('touchstart', (e) => {
    if (contenedorRef.value && !contenedorRef.value.contains(e.target)) {
      ocultarTooltip()
    }
  })
})
</script>

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
  border: 2px solid var(--crema-borde, #EEC9C4);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: var(--tinta-claro, #7A4A44);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.grafica-boton:hover {
  border-color: var(--tinta, #3B1F1C);
  background: var(--crema-oscuro, #F7E0DC);
}

.grafica-boton--activo {
  border-color: var(--tinta, #3B1F1C);
  background: var(--tinta, #3B1F1C);
  color: white;
}

.grafica-boton--activo:hover {
  background: var(--tinta, #3B1F1C);
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
  background: var(--tinta, #3B1F1C);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  max-width: 200px;
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