<template>
  <section class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">En millones de cabezas.</p>

    <div class="grafica-botones" role="group" aria-label="Filtrar por país">
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

    <div class="grafica-contenedor" ref="contenedorRef">
      <svg
        :viewBox="svgViewBox"
        :width="svgWidth"
        :height="svgHeight"
        role="img"
        aria-label="Gráfica de inventario porcino Colombia vs EE.UU."
      >
        <title>Inventario histórico porcino: Colombia vs EE.UU.</title>
        <desc>Gráfica de líneas que compara el inventario porcino en Colombia (datos anuales) y EE.UU. (datos trimestrales) desde 2015 hasta 2025.</desc>

        <g class="grafica-grid">
          <line
            v-for="i in 5"
            :key="'grid-' + i"
            x1="50"
            :y1="50 + 200 * (i - 1) / 4"
            x2="650"
            :y2="50 + 200 * (i - 1) / 4"
            stroke="#EEC9C4"
            stroke-dasharray="3,3"
          />
        </g>

        <g class="grafica-y-axis">
          <text
            v-for="(valor, i) in etiquetasY"
            :key="'y-' + i"
            x="40"
            :y="50 + 200 * i / 4"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="11"
            fill="#7A4A44"
          >
            {{ valor }}
          </text>
        </g>

        <g class="grafica-x-axis">
          <text
            v-for="(label, i) in etiquetasX"
            :key="'x-' + i"
            :x="50 + i * pasoX"
            y="320"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="9"
            fill="#7A4A44"
            :transform="etiquetasX.length > 10 ? `rotate(-45, ${50 + i * pasoX}, 320)` : ''"
          >
            {{ label }}
          </text>
        </g>

        <!-- Línea Colombia -->
        <template v-if="paisActivo !== 'usa' && datosColombia.length">
          <polyline
            :points="lineaColombia"
            fill="none"
            stroke="#F5A800"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <circle
            v-for="(p, i) in datosColombia"
            :key="'c-' + i"
            :cx="50 + i * pasoXCol"
            :cy="escalaY(p.valor)"
            r="4"
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
        <template v-if="paisActivo !== 'colombia' && datosUsa.length">
          <polyline
            :points="lineaUsa"
            fill="none"
            stroke="#2563EB"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <circle
            v-for="(p, i) in datosUsa"
            :key="'u-' + i"
            :cx="50 + i * pasoXUsa"
            :cy="escalaY(p.valor)"
            r="4"
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
        <g transform="translate(480, 25)">
          <template v-if="paisActivo !== 'usa'">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
            <circle cx="10" cy="0" r="3" fill="#F5A800" />
            <text x="28" y="4" font-size="11" fill="#3B1F1C">Colombia</text>
          </template>
          <template v-if="paisActivo !== 'colombia'">
            <line
              :x1="paisActivo === 'ambos' ? 100 : 0"
              y1="0"
              :x2="paisActivo === 'ambos' ? 120 : 20"
              y2="0"
              stroke="#2563EB"
              stroke-width="2.5"
            />
            <circle
              :cx="paisActivo === 'ambos' ? 110 : 10"
              cy="0"
              r="3"
              fill="#2563EB"
            />
            <text
              :x="paisActivo === 'ambos' ? 128 : 28"
              y="4"
              font-size="11"
              fill="#3B1F1C"
            >
              USA
            </text>
          </template>
        </g>
      </svg>

      <div
        v-if="tooltip.visible"
        class="grafica-tooltip"
        :class="{ 'grafica-tooltip--izquierda': tooltip.izquierda }"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="grafica-tooltip__titulo">
          {{ tooltip.pais === 'Colombia' ? '🇨🇴 Colombia' : '🇺🇸 USA' }}
        </div>
        <div class="grafica-tooltip__valor">
          {{ tooltip.valor.toLocaleString() }} cabezas
        </div>
        <div class="grafica-tooltip__periodo">{{ tooltip.periodo }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SERIE_COLOMBIA } from '../data/colombia.js'
import { SERIE_USA } from '../data/usa.js'

const paisActivo = ref('colombia')
const contenedorRef = ref(null)
const esMovil = ref(false)

// Transformar datos: Colombia está en unidades, convertir a millones para la gráfica
const datosColombia = computed(() => {
  if (!Array.isArray(SERIE_COLOMBIA) || !SERIE_COLOMBIA.length) return []
  return SERIE_COLOMBIA.map((d) => ({
    periodo: d.periodo,
    valor: d.valor / 1e6,
    valorReal: d.valor,
    advertencia: d.advertencia || false,
  }))
})

// USA: datos trimestrales con año completo
const datosUsa = computed(() => {
  if (!Array.isArray(SERIE_USA) || !SERIE_USA.length) return []
  return SERIE_USA.map((d) => ({
    periodo: d.periodo,
    valor: d.valor / 1e6,
    valorReal: d.valor,
    ultimoDato: d.ultimoDato || false,
  }))
})

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  pais: '',
  valor: 0,
  periodo: '',
  izquierda: false,
})

const maximo = computed(() => {
  if (paisActivo.value === 'colombia') return 12
  return 80
})

const etiquetasY = computed(() => {
  if (paisActivo.value === 'colombia') return ['12M', '9M', '6M', '3M', '0']
  return ['80M', '60M', '40M', '20M', '0']
})

const pasoXCol = computed(() => {
  const len = datosColombia.value.length
  return len > 1 ? 600 / (len - 1) : 0
})

const pasoXUsa = computed(() => {
  const len = datosUsa.value.length
  return len > 1 ? 600 / (len - 1) : 0
})

const pasoX = computed(() => {
  if (paisActivo.value === 'colombia') return pasoXCol.value
  return pasoXUsa.value
})

const escalaY = (valor) => 250 - (valor / maximo.value) * 200

const lineaColombia = computed(() => {
  if (paisActivo.value === 'usa' || !datosColombia.value.length) return ''
  return datosColombia.value
    .map(
      (p, i) =>
        `${50 + i * pasoXCol.value},${escalaY(p.valor)}`
    )
    .join(' ')
})

const lineaUsa = computed(() => {
  if (paisActivo.value === 'colombia' || !datosUsa.value.length) return ''
  return datosUsa.value
    .map(
      (p, i) =>
        `${50 + i * pasoXUsa.value},${escalaY(p.valor)}`
    )
    .join(' ')
})

const etiquetasX = computed(() => {
  if (paisActivo.value === 'colombia') {
    return datosColombia.value.map((d) => d.periodo)
  }
  // USA: mostrar label abreviado solo en puntos clave para evitar overlap
  const allLabels = datosUsa.value.map((d) => d.periodo)
  if (esMovil.value && allLabels.length > 8) {
    return allLabels.map((label, i) =>
      i % 3 === 0 || i === allLabels.length - 1 ? label : ''
    )
  }
  return allLabels
})

// Responsive SVG
const svgWidth = computed(() => (esMovil.value ? '100%' : 700))
const svgHeight = computed(() => (esMovil.value ? 350 : 350))
const svgViewBox = computed(() => '0 0 700 350')

const mostrarTooltip = (event, pais, dato) => {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  const x = rect.left - container.left + 10
  const y = rect.top - container.top - 60

  // Verificar si se sale por la derecha
  const tooltipWidth = 160
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
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  const x = rect.left - container.left + 10
  const y = rect.top - container.top - 60

  const tooltipWidth = 160
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
  const x = 50 + idx * pasoXCol.value
  const xPx = (x / 700) * container.width
  const yPx = (escalaY(dato.valor) / 350) * container.height

  const tooltipWidth = 160
  const izquierda = xPx + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? xPx - tooltipWidth - 10 : xPx + 10,
    y: Math.max(0, yPx - 60),
    pais,
    valor: dato.valorReal,
    periodo: dato.periodo,
    izquierda,
  }
}

const mostrarTooltipTouchUSA = (dato, idx) => {
  if (!contenedorRef.value) return
  const container = contenedorRef.value.getBoundingClientRect()
  const x = 50 + idx * pasoXUsa.value
  const xPx = (x / 700) * container.width
  const yPx = (escalaY(dato.valor) / 350) * container.height

  const tooltipWidth = 160
  const izquierda = xPx + tooltipWidth > container.width

  tooltip.value = {
    visible: true,
    x: izquierda ? xPx - tooltipWidth - 10 : xPx + 10,
    y: Math.max(0, yPx - 60),
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

  // Cerrar tooltip al tocar fuera
  document.addEventListener('touchstart', (e) => {
    if (
      contenedorRef.value &&
      !contenedorRef.value.contains(e.target)
    ) {
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

.grafica-svg {
  width: 100%;
  height: auto;
  display: block;
}

.grafica-punto {
  cursor: pointer;
  transition: r 0.2s ease;
}

.grafica-punto:hover {
  r: 6;
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
    min-width: 600px;
  }
}
</style>
