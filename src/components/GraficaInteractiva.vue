<template>
  <section class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">
      En millones de cabezas.
      <span class="grafica-card__colombia">🟡 Colombia (anual · fuente: Porcinews)</span> ·
      <span class="grafica-card__usa">🔵 EE.UU. (trimestral · fuente: USDA NASS)</span>
    </p>

    <div class="grafica-filtros">
      <label class="grafica-filtro__label">Rango:</label>
      <select v-model="rangoAnos" class="grafica-filtro__select" @change="actualizarRango">
        <option value="todos">Todos (2015-2025)</option>
        <option value="5">Últimos 5 años (2021-2025)</option>
        <option value="3">Últimos 3 años (2023-2025)</option>
        <option value="reciente">Solo 2024-2025</option>
      </select>
    </div>

    <div class="grafica-contenedor" @mouseleave="ocultarTooltip">
      <svg class="grafica-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet">
        <!-- Grid -->
        <g class="grafica-grid">
          <line v-for="i in 5" :key="'grid-'+i" 
            :x1="padding" :y1="padding + (height - padding * 2) * (i-1) / 4" 
            :x2="width - padding" :y2="padding + (height - padding * 2) * (i-1) / 4" 
            stroke="#EEC9C4" stroke-dasharray="3,3" />
        </g>

        <!-- Y axis -->
        <g class="grafica-y-axis">
          <text v-for="i in 5" :key="'y-'+i" 
            :x="padding - 8" :y="padding + (height - padding * 2) * (i-1) / 4" 
            text-anchor="end" dominant-baseline="middle" font-size="11" fill="#7A4A44">
            {{ 80 - (i-1) * 20 }}M
          </text>
        </g>

        <!-- X axis -->
        <g class="grafica-x-axis">
          <text v-for="(label, idx) in labelsVisibles" :key="'x-'+label"
            :x="getX(idx)" :y="height - padding + 20"
            text-anchor="end" dominant-baseline="middle" font-size="9" fill="#7A4A44"
            :transform="`rotate(-30, ${getX(idx)}, ${height - padding + 20})`">
            {{ label }}
          </text>
        </g>

        <!-- Area fills -->
        <polygon :points="colombiaArea" fill="#F5A800" opacity="0.08" />
        <polygon :points="usaArea" fill="#2563EB" opacity="0.08" />

        <!-- Lines with animation -->
        <polyline :points="colombiaPoly" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round"
          class="grafica-linea" />
        <polyline :points="usaPoly" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"
          class="grafica-linea" />

        <!-- Dots Colombia -->
        <circle v-for="(p, i) in colombiaPoints" :key="'c-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#F5A800" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'colombia', i)" />

        <!-- Dots USA -->
        <circle v-for="(p, i) in usaPoints" :key="'u-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#2563EB" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'usa', i)" />

        <!-- Legend -->
        <g :transform="`translate(${width - 220}, ${padding - 20})`">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
          <circle cx="10" cy="0" r="3" fill="#F5A800" />
          <text x="28" y="4" font-size="11" fill="#3B1F1C">🇨🇴 Colombia</text>

          <line x1="160" y1="0" x2="180" y2="0" stroke="#2563EB" stroke-width="2.5" />
          <circle cx="170" cy="0" r="3" fill="#2563EB" />
          <text x="188" y="4" font-size="11" fill="#3B1F1C">🇺🇸 EE.UU.</text>
        </g>
      </svg>

      <!-- Tooltip -->
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
import { ref, computed, onMounted } from 'vue'

const width = 700
const height = 450
const padding = 55
const maxValor = 80000000

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
  { periodo: "2024", valor: 10668276, ultimoDato: true },
]

const datosUsa = [
  { periodo: "Mar 2015", valor: 64936000 },
  { periodo: "Jun 2015", valor: 64936000 },
  { periodo: "Sep 2015", valor: 65899000 },
  { periodo: "Dic 2015", valor: 66933000 },
  { periodo: "Mar 2016", valor: 67756000 },
  { periodo: "Jun 2016", valor: 68095000 },
  { periodo: "Sep 2016", valor: 68928000 },
  { periodo: "Dic 2016", valor: 70132000 },
  { periodo: "Mar 2017", valor: 71140000 },
  { periodo: "Jun 2017", valor: 72350000 },
  { periodo: "Sep 2017", valor: 75070000 },
  { periodo: "Dic 2017", valor: 73170000 },
  { periodo: "Mar 2018", valor: 72800000 },
  { periodo: "Jun 2018", valor: 73300000 },
  { periodo: "Sep 2018", valor: 74900000 },
  { periodo: "Dic 2018", valor: 74900000 },
  { periodo: "Mar 2019", valor: 75000000 },
  { periodo: "Jun 2019", valor: 75500000 },
  { periodo: "Sep 2019", valor: 76700000 },
  { periodo: "Dic 2019", valor: 77500000 },
  { periodo: "Mar 2020", valor: 79800000 },
  { periodo: "Jun 2020", valor: 78700000 },
  { periodo: "Sep 2020", valor: 77600000 },
  { periodo: "Dic 2020", valor: 77000000 },
  { periodo: "Mar 2021", valor: 76400000 },
  { periodo: "Jun 2021", valor: 75300000 },
  { periodo: "Sep 2021", valor: 75100000 },
  { periodo: "Dic 2021", valor: 74200000 },
  { periodo: "Mar 2022", valor: 72800000 },
  { periodo: "Jun 2022", valor: 72500000 },
  { periodo: "Sep 2022", valor: 73400000 },
  { periodo: "Dic 2022", valor: 73500000 },
  { periodo: "Mar 2023", valor: 72300000 },
  { periodo: "Jun 2023", valor: 72500000 },
  { periodo: "Sep 2023", valor: 73800000 },
  { periodo: "Dic 2023", valor: 73500000 },
  { periodo: "Mar 2024", valor: 72100000 },
  { periodo: "Jun 2024", valor: 72700000 },
  { periodo: "Sep 2024", valor: 74100000 },
  { periodo: "Dic 2024", valor: 75100000 },
  { periodo: "Mar 2025", valor: 74100000 },
  { periodo: "Jun 2025", valor: 74300000 },
  { periodo: "Sep 2025", valor: 75400000 },
  { periodo: "Dic 2025", valor: 75500000, ultimoDato: true },
]

const rangoAnos = ref('todos')
const tooltip = ref({ visible: false, x: 0, y: 0, titulo: '', valor: 0, periodo: '' })

const allPeriodos = computed(() => {
  let periodos = [...new Set([
    ...datosColombia.map(d => d.periodo),
    ...datosUsa.map(d => d.periodo)
  ])]
  return periodos.sort((a, b) => {
    const parseP = p => {
      const parts = p.split(' ')
      const year = parseInt(parts[parts.length - 1])
      const month = { 'Mar': 1, 'Jun': 2, 'Sep': 3, 'Dic': 4 }[parts[0]] || 5
      return year * 10 + month
    }
    return parseP(a) - parseP(b)
  })
})

const filteredPeriodos = computed(() => {
  const years = { 'todos': 2015, '5': 2021, '3': 2023, 'reciente': 2024 }
  const minYear = years[rangoAnos.value]
  return allPeriodos.value.filter(p => {
    const year = parseInt(p.split(' ').pop())
    return year >= minYear
  })
})

const labelsVisibles = computed(() => {
  return filteredPeriodos.value.filter((_, i) => 
    i % 2 === 0 || i === filteredPeriodos.value.length - 1
  )
})

const getX = (idx) => padding + idx * ((width - padding * 2) / (filteredPeriodos.value.length - 1 || 1))
const getY = (valor) => padding + (height - padding * 2) - ((valor / maxValor) * (height - padding * 2))

const colombiaPoints = computed(() => {
  return datosColombia
    .filter(d => filteredPeriodos.value.includes(d.periodo))
    .map(d => ({ x: getX(filteredPeriodos.value.indexOf(d.periodo)), y: getY(d.valor), ...d }))
})

const usaPoints = computed(() => {
  return datosUsa
    .filter(d => filteredPeriodos.value.includes(d.periodo))
    .map(d => ({ x: getX(filteredPeriodos.value.indexOf(d.periodo)), y: getY(d.valor), ...d }))
})

const colombiaPoly = computed(() => colombiaPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const usaPoly = computed(() => usaPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const colombiaArea = computed(() => {
  const pts = colombiaPoints.value
  if (!pts.length) return ''
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${colombiaPoly.value} ${last.x},${height - padding} ${first.x},${height - padding}`
})

const usaArea = computed(() => {
  const pts = usaPoints.value
  if (!pts.length) return ''
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${usaPoly.value} ${last.x},${height - padding} ${first.x},${height - padding}`
})

const actualizarRango = () => {}

const mostrarTooltip = (event, tipo, idx) => {
  const datos = tipo === 'colombia' ? colombiaPoints.value : usaPoints.value
  const d = datos[idx]
  if (!d) return
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left - container.left + 10,
    y: rect.top - container.top - 60,
    titulo: tipo === 'colombia' ? '🇨🇴 Colombia' : '🇺🇸 EE.UU.',
    valor: d.valor,
    periodo: d.periodo
  }
}

const ocultarTooltip = () => {
  tooltip.value.visible = false
}
</script>

<style scoped>
.grafica-card {
  background: #fff;
  border-radius: var(--radio);
  padding: 28px;
  box-shadow: var(--sombra);
  margin: 32px 0;
}

.grafica-card__titulo {
  font-family: 'DM Sans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--tinta);
  margin: 0 0 8px;
}

.grafica-card__subtitulo {
  font-size: 14px;
  color: var(--tinta-claro);
  margin: 0 0 16px;
}

.grafica-card__colombia { color: #F5A800; }
.grafica-card__usa { color: #2563EB; }

.grafica-filtros {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.grafica-filtro__label {
  font-size: 13px;
  color: var(--tinta-claro);
}

.grafica-filtro__select {
  padding: 6px 12px;
  border: 1px solid var(--crema-borde);
  border-radius: 6px;
  font-size: 13px;
  background: white;
  color: var(--tinta);
  cursor: pointer;
}

.grafica-contenedor {
  position: relative;
}

.grafica-svg {
  width: 100%;
  height: auto;
}

.grafica-linea {
  animation: drawLine 1.5s ease-out forwards;
}

@keyframes drawLine {
  from { stroke-dasharray: 2000; stroke-dashoffset: 2000; }
  to { stroke-dasharray: 2000; stroke-dashoffset: 0; }
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
  background: var(--tinta);
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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
</style>