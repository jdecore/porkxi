<template>
  <section class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">En millones de cabezas.</p>

    <div class="grafica-botones">
      <button 
        class="grafica-boton" 
        :class="{ 'grafica-boton--activo': paisActivo === 'colombia' }"
        @click="paisActivo = 'colombia'"
      >
        🟡 Colombia
      </button>
      <button 
        class="grafica-boton" 
        :class="{ 'grafica-boton--activo': paisActivo === 'usa' }"
        @click="paisActivo = 'usa'"
      >
        🔵 EE.UU.
      </button>
      <button 
        class="grafica-boton" 
        :class="{ 'grafica-boton--activo': paisActivo === 'ambos' }"
        @click="paisActivo = 'ambos'"
      >
        ⚖️ Ambos
      </button>
    </div>

    <div class="grafica-contenedor">
      <svg class="grafica-svg" viewBox="0 0 700 360" preserveAspectRatio="xMidYMid meet">
        <g class="grafica-grid">
          <line v-for="i in 5" :key="'grid-'+i" 
            x1="60" :y1="60 + 220 * (i - 1) / 4" 
            x2="640" :y2="60 + 220 * (i - 1) / 4" 
            stroke="#EEC9C4" stroke-dasharray="3,3" />
        </g>

        <g class="grafica-y-axis">
          <text v-for="i in 5" :key="'y-'+i" 
            x="52" :y="60 + 220 * (i - 1) / 4" 
            text-anchor="end" dominant-baseline="middle" font-size="11" fill="#7A4A44">
            {{ obtenerEtiquetaY(i) }}
          </text>
        </g>

        <g class="grafica-x-axis">
          <text v-for="(label, i) in etiquetasX" :key="'x-'+i"
            :x="obtenerX(i)"
            y="340"
            text-anchor="end" dominant-baseline="middle" font-size="9" fill="#7A4A44"
            :transform="`rotate(-35, ${obtenerX(i)}, 340)`">
            {{ label }}
          </text>
        </g>

        <template v-if="paisActivo !== 'usa'">
          <polyline :points="lineaColombia" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosColombia" :key="'c-'+i"
            :cx="obtenerX(i)"
            :cy="obtenerY(p.valor)"
            r="4" fill="#F5A800" class="grafica-punto"
            @mouseenter="mostrarTooltip($event, 'Colombia', p)" />
        </template>

        <template v-if="paisActivo !== 'colombia'">
          <polyline :points="lineaUsa" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosUsa" :key="'u-'+i"
            :cx="obtenerX(i + (paisActivo === 'ambos' ? datosColombia.length : 0))"
            :cy="obtenerY(p.valor)"
            r="4" fill="#2563EB" class="grafica-punto"
            @mouseenter="mostrarTooltipUSA($event, p, i)" />
        </template>

        <g transform="translate(480, 30)">
          <template v-if="paisActivo !== 'usa'">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
            <circle cx="10" cy="0" r="3" fill="#F5A800" />
            <text x="28" y="4" font-size="11" fill="#3B1F1C">Colombia</text>
          </template>
          <template v-if="paisActivo !== 'colombia'">
            <line :x1="paisActivo === 'ambos' ? 100 : 0" y1="0" :x2="paisActivo === 'ambos' ? 120 : 20" y2="0" stroke="#2563EB" stroke-width="2.5" />
            <circle :cx="paisActivo === 'ambos' ? 110 : 10" cy="0" r="3" fill="#2563EB" />
            <text :x="paisActivo === 'ambos' ? 128 : 28" y="4" font-size="11" fill="#3B1F1C">USA</text>
          </template>
        </g>
      </svg>

      <div v-if="tooltip.visible" class="grafica-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        <div class="grafica-tooltip__titulo">{{ tooltip.pais === 'Colombia' ? '🇨🇴 Colombia' : '🇺🇸 USA' }}</div>
        <div class="grafica-tooltip__valor">{{ tooltip.valor.toLocaleString() }} cabezas</div>
        <div class="grafica-tooltip__periodo">{{ tooltip.periodo }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const paisActivo = ref('colombia')

const datosColombia = [
  { periodo: "2015", valor: 4.4 },
  { periodo: "2016", valor: 4.7 },
  { periodo: "2017", valor: 5.1 },
  { periodo: "2018", valor: 5.5 },
  { periodo: "2019", valor: 5.9 },
  { periodo: "2020", valor: 6.2 },
  { periodo: "2021", valor: 6.5 },
  { periodo: "2022", valor: 9.66 },
  { periodo: "2023", valor: 9.66 },
  { periodo: "2024", valor: 10.67 },
]

const datosUsa = [
  { periodo: "Mar 23", valor: 72.8 },
  { periodo: "Jun 23", valor: 73.2 },
  { periodo: "Sep 23", valor: 73.8 },
  { periodo: "Dic 23", valor: 74.1 },
  { periodo: "Mar 24", valor: 73.9 },
  { periodo: "Jun 24", valor: 74.2 },
  { periodo: "Sep 24", valor: 74.8 },
  { periodo: "Dic 24", valor: 74.7 },
  { periodo: "Mar 25", valor: 74.5 },
  { periodo: "Jun 25", valor: 75.1 },
  { periodo: "Sep 25", valor: 74.5 },
  { periodo: "Dic 25", valor: 75.5 },
]

const tooltip = ref({ visible: false, x: 0, y: 0, pais: '', valor: 0, periodo: '' })

const maximo = computed(() => {
  if (paisActivo.value === 'colombia') return 12
  return 80
})

const obtenerEtiquetaY = (i) => {
  const valores = paisActivo.value === 'colombia' 
    ? [12, 9, 6, 3, 0] 
    : [80, 60, 40, 20, 0]
  return valores[i - 1] + 'M'
}

const obtenerX = (i) => {
  const total = paisActivo.value === 'ambos' 
    ? datosColombia.length + datosUsa.length 
    : (paisActivo.value === 'colombia' ? datosColombia.length : datosUsa.length)
  return 60 + i * (580 / Math.max(total - 1, 1))
}

const obtenerY = (valor) => {
  return 280 - (valor / maximo.value * 220)
}

const lineaColombia = computed(() => {
  if (paisActivo.value === 'usa') return ''
  return datosColombia.map((p, i) => `${obtenerX(i)},${obtenerY(p.valor)}`).join(' ')
})

const lineaUsa = computed(() => {
  if (paisActivo.value === 'colombia') return ''
  const offset = datosColombia.length
  return datosUsa.map((p, i) => `${obtenerX(i + offset)},${obtenerY(p.valor)}`).join(' ')
})

const etiquetasX = computed(() => {
  if (paisActivo.value === 'colombia') return datosColombia.map(d => d.periodo)
  if (paisActivo.value === 'usa') return datosUsa.map(d => d.periodo)
  return [...datosColombia.map(d => d.periodo), ...datosUsa.map(d => d.periodo)]
})

const mostrarTooltip = (event, pais, dato) => {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  tooltip.value = { 
    visible: true, 
    x: rect.left - container.left + 10, 
    y: rect.top - container.top - 60, 
    pais, 
    valor: dato.valor * 1000000, 
    periodo: dato.periodo 
  }
}

const mostrarTooltipUSA = (event, dato, idx) => {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  tooltip.value = { 
    visible: true, 
    x: rect.left - container.left + 10, 
    y: rect.top - container.top - 60, 
    pais: 'USA', 
    valor: dato.valor * 1000000, 
    periodo: dato.periodo 
  }
}
</script>

<style scoped>
.grafica-card { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 10px 28px rgba(59,31,28,0.08); margin: 32px 0; }
.grafica-card__titulo { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 600; color: #3B1F1C; margin: 0 0 8px; }
.grafica-card__subtitulo { font-size: 14px; color: #7A4A44; margin: 0 0 16px; }

.grafica-botones { display: flex; gap: 12px; margin-bottom: 16px; }

.grafica-boton {
  padding: 10px 20px;
  border: 2px solid #EEC9C4;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #7A4A44;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.grafica-boton:hover { border-color: #3B1F1C; background: #F7E0DC; }
.grafica-boton--activo { border-color: #3B1F1C; background: #3B1F1C; color: white; }
.grafica-boton--activo:hover { background: #3B1F1C; }

.grafica-contenedor { position: relative; }
.grafica-svg { width: 100%; height: auto; }
.grafica-punto { cursor: pointer; transition: r 0.2s ease; }
.grafica-punto:hover { r: 6; }
.grafica-tooltip { position: absolute; background: #3B1F1C; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; pointer-events: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.grafica-tooltip__titulo { font-weight: 600; margin-bottom: 4px; }
.grafica-tooltip__valor { font-size: 14px; font-weight: 700; }
.grafica-tooltip__periodo { opacity: 0.7; margin-top: 2px; }
</style>