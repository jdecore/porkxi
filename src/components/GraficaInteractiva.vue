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
      <svg class="grafica-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet">
        <g class="grafica-grid">
          <line v-for="i in 5" :key="'grid-'+i" 
            :x1="padding" :y1="padding + (height - padding * 2) * (i-1) / 4" 
            :x2="width - padding" :y2="padding + (height - padding * 2) * (i-1) / 4" 
            stroke="#EEC9C4" stroke-dasharray="3,3" />
        </g>

        <g class="grafica-y-axis">
          <text v-for="i in 5" :key="'y-'+i" 
            :x="padding - 8" :y="padding + (height - padding * 2) * (i-1) / 4" 
            text-anchor="end" dominant-baseline="middle" font-size="11" fill="#7A4A44">
            {{ Math.round(maxValorY - (maxValorY / 4) * (i-1)) }}M
          </text>
        </g>

        <g class="grafica-x-axis">
          <text v-for="(label, i) in etiquetasX" :key="'x-'+i"
            :x="getX(i)" :y="height - padding + 20"
            text-anchor="end" dominant-baseline="middle" font-size="9" fill="#7A4A44"
            :transform="`rotate(-30, ${getX(i)}, ${height - padding + 20})`">
            {{ label }}
          </text>
        </g>

        <template v-if="paisActivo === 'colombia' || paisActivo === 'ambos'">
          <polyline :points="puntosColombia" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosColombiaFiltrados" :key="'c-'+i"
            :cx="getX(i)" :cy="getY(p.valor)" r="4" fill="#F5A800" class="grafica-punto"
            @mouseenter="mostrarTooltip($event, p)" />
        </template>

        <template v-if="paisActivo === 'usa' || paisActivo === 'ambos'">
          <polyline :points="puntosUsa" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosUsaFiltrados" :key="'u-'+i"
            :cx="getX(i + (paisActivo === 'ambos' ? datosColombiaFiltrados.length : 0))" :cy="getY(p.valor)" r="4" fill="#2563EB" class="grafica-punto"
            @mouseenter="mostrarTooltipUSA($event, p, i)" />
        </template>

        <g :transform="`translate(${width - 180}, ${padding - 20})`">
          <template v-if="paisActivo !== 'usa'">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
            <circle cx="10" cy="0" r="3" fill="#F5A800" />
            <text x="28" y="4" font-size="11" fill="#3B1F1C">🇨🇴 Colombia</text>
          </template>
          <template v-if="paisActivo !== 'colombia'">
            <line :x1="paisActivo === 'ambos' ? 110 : 0" y1="0" :x2="paisActivo === 'ambos' ? 130 : 20" y2="0" stroke="#2563EB" stroke-width="2.5" />
            <circle :cx="paisActivo === 'ambos' ? 120 : 10" cy="0" r="3" fill="#2563EB" />
            <text :x="paisActivo === 'ambos' ? 138 : 28" y="4" font-size="11" fill="#3B1F1C">🇺🇸 EE.UU.</text>
          </template>
        </g>
      </svg>

      <div v-if="tooltip.visible" class="grafica-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        <div class="grafica-tooltip__titulo">{{ tooltip.titulo }}</div>
        <div class="grafica-tooltip__valor">{{ tooltip.valor.toLocaleString() }} cabezas</div>
        <div class="grafica-tooltip__periodo">{{ tooltip.periodo }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const width = 700
const height = 450
const padding = 55

const paisActivo = ref('colombia')

const datosColombia = [
  { periodo: "2015", valor: 4400000 },
  { periodo: "2016", valor: 4700000 },
  { periodo: "2017", valor: 5100000 },
  { periodo: "2018", valor: 5500000 },
  { periodo: "2019", valor: 5900000 },
  { periodo: "2020", valor: 6200000 },
  { periodo: "2021", valor: 6500000 },
  { periodo: "2022", valor: 9658204 },
  { periodo: "2023", valor: 9658204 },
  { periodo: "2024", valor: 10668276 },
]

const datosUsa = [
  { periodo: "Mar 2023", valor: 72800000 },
  { periodo: "Jun 2023", valor: 73200000 },
  { periodo: "Sep 2023", valor: 73800000 },
  { periodo: "Dic 2023", valor: 74100000 },
  { periodo: "Mar 2024", valor: 73900000 },
  { periodo: "Jun 2024", valor: 74200000 },
  { periodo: "Sep 2024", valor: 74800000 },
  { periodo: "Dic 2024", valor: 74700000 },
  { periodo: "Mar 2025", valor: 74500000 },
  { periodo: "Jun 2025", valor: 75100000 },
  { periodo: "Sep 2025", valor: 74500000 },
  { periodo: "Dic 2025", valor: 75500000 },
]

const tooltip = ref({ visible: false, x: 0, y: 0, titulo: '', valor: 0, periodo: '' })

const datosColombiaFiltrados = computed(() => {
  if (paisActivo.value === 'usa') return []
  return datosColombia
})

const datosUsaFiltrados = computed(() => {
  if (paisActivo.value === 'colombia') return []
  return datosUsa
})

const maxValorY = computed(() => {
  if (paisActivo.value === 'colombia') return 12000000
  if (paisActivo.value === 'usa') return 80000000
  return 80000000
})

const totalPuntos = computed(() => {
  if (paisActivo.value === 'colombia') return datosColombiaFiltrados.value.length
  if (paisActivo.value === 'usa') return datosUsaFiltrados.value.length
  return datosColombiaFiltrados.value.length + datosUsaFiltrados.value.length
})

const etiquetasX = computed(() => {
  const etiquetas = []
  if (paisActivo.value !== 'usa') {
    datosColombiaFiltrados.value.forEach(d => etiquetas.push(d.periodo))
  }
  if (paisActivo.value !== 'colombia') {
    datosUsaFiltrados.value.forEach(d => etiquetas.push(d.periodo))
  }
  return etiquetas.filter((_, i) => i % 2 === 0 || i === etiquetas.length - 1)
})

const getX = (idx) => {
  const total = totalPuntos.value
  if (total <= 1) return width / 2
  return padding + idx * ((width - padding * 2) / (total - 1))
}

const getY = (valor) => {
  const rango = maxValorY.value
  const alturaUtil = height - padding * 2
  const normalizado = valor / rango
  return padding + alturaUtil - (normalizado * alturaUtil)
}

const puntosColombia = computed(() => {
  if (paisActivo.value === 'usa') return ''
  return datosColombiaFiltrados.value.map((d, i) => `${getX(i)},${getY(d.valor)}`).join(' ')
})

const puntosUsa = computed(() => {
  if (paisActivo.value === 'colombia') return ''
  const offset = datosColombiaFiltrados.value.length
  return datosUsaFiltrados.value.map((d, i) => `${getX(i + offset)},${getY(d.valor)}`).join(' ')
})

const mostrarTooltip = (event, dato) => {
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  tooltip.value = { 
    visible: true, 
    x: rect.left - container.left + 10, 
    y: rect.top - container.top - 60, 
    titulo: '🇨🇴 Colombia', 
    valor: dato.valor, 
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
    titulo: '🇺🇸 EE.UU.', 
    valor: dato.valor, 
    periodo: dato.periodo 
  }
}
</script>

<style scoped>
.grafica-card { background: #fff; border-radius: 14px; padding: 28px; box-shadow: 0 10px 28px rgba(59,31,28,0.08); margin: 32px 0; }
.grafica-card__titulo { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 600; color: #3B1F1C; margin: 0 0 8px; }
.grafica-card__subtitulo { font-size: 14px; color: #7A4A44; margin: 0 0 16px; }

.grafica-botones {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

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

.grafica-boton:hover {
  border-color: #3B1F1C;
  background: #F7E0DC;
}

.grafica-boton--activo {
  border-color: #3B1F1C;
  background: #3B1F1C;
  color: white;
}

.grafica-boton--activo:hover {
  background: #3B1F1C;
}

.grafica-contenedor { position: relative; }
.grafica-svg { width: 100%; height: auto; }
.grafica-punto { cursor: pointer; transition: r 0.2s ease; }
.grafica-punto:hover { r: 6; }
.grafica-tooltip { position: absolute; background: #3B1F1C; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; pointer-events: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.grafica-tooltip__titulo { font-weight: 600; margin-bottom: 4px; }
.grafica-tooltip__valor { font-size: 14px; font-weight: 700; }
.grafica-tooltip__periodo { opacity: 0.7; margin-top: 2px; }
</style>