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

    <div class="grafica-filtros">
      <label class="grafica-filtro__label">Rango:</label>
      <select v-model="rangoAnos" class="grafica-filtro__select">
        <option value="todos">Todos</option>
        <option value="5">Últimos 5 años</option>
        <option value="3">Últimos 3 años</option>
      </select>
    </div>

    <div class="grafica-contenedor" @mouseleave="ocultarTooltip">
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
            {{ etiquetaEjeY(i) }}
          </text>
        </g>

        <g class="grafica-x-axis">
          <text v-for="(label, idx) in labelsVisibles" :key="'x-'+label"
            :x="getX(idx)" :y="height - padding + 20"
            text-anchor="end" dominant-baseline="middle" font-size="9" fill="#7A4A44"
            :transform="`rotate(-30, ${getX(idx)}, ${height - padding + 20})`">
            {{ label }}
          </text>
        </g>

        <polygon v-if="paisActivo === 'colombia'" :points="colombiaArea" fill="#F5A800" opacity="0.1" />
        <polygon v-if="paisActivo === 'usa'" :points="usaArea" fill="#2563EB" opacity="0.1" />
        <polygon v-if="paisActivo === 'ambos'" :points="colombiaArea" fill="#F5A800" opacity="0.1" />
        <polygon v-if="paisActivo === 'ambos'" :points="usaArea" fill="#2563EB" opacity="0.1" />

        <polyline v-if="paisActivo === 'colombia'" :points="colombiaPoly" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round" />
        <polyline v-if="paisActivo === 'usa'" :points="usaPoly" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />
        <polyline v-if="paisActivo === 'ambos'" :points="colombiaPoly" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round" />
        <polyline v-if="paisActivo === 'ambos'" :points="usaPoly" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />

        <circle v-if="paisActivo === 'colombia'" v-for="(p, i) in colombiaPoints" :key="'c-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#F5A800" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'colombia', i)" />

        <circle v-if="paisActivo === 'usa'" v-for="(p, i) in usaPoints" :key="'u-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#2563EB" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'usa', i)" />

        <circle v-if="paisActivo === 'ambos'" v-for="(p, i) in colombiaPoints" :key="'ca-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#F5A800" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'colombia', i)" />

        <circle v-if="paisActivo === 'ambos'" v-for="(p, i) in usaPoints" :key="'ua-'+i"
          :cx="p.x" :cy="p.y" r="4" fill="#2563EB" class="grafica-punto"
          @mouseenter="mostrarTooltip($event, 'usa', i)" />

        <g :transform="`translate(${width - 200}, ${padding - 20})`">
          <g v-if="paisActivo !== 'usa'">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
            <circle cx="10" cy="0" r="3" fill="#F5A800" />
            <text x="28" y="4" font-size="11" fill="#3B1F1C">🇨🇴 Colombia</text>
          </g>
          <g v-if="paisActivo !== 'colombia'">
            <line :x1="paisActivo === 'ambos' ? 130 : 0" y1="0" :x2="paisActivo === 'ambos' ? 150 : 20" y2="0" stroke="#2563EB" stroke-width="2.5" />
            <circle :cx="paisActivo === 'ambos' ? 140 : 10" cy="0" r="3" fill="#2563EB" />
            <text :x="paisActivo === 'ambos' ? 158 : 28" y="4" font-size="11" fill="#3B1F1C">🇺🇸 EE.UU.</text>
          </g>
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
  { periodo: "2024", valor: 10668276, ultimoDato: true },
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
  { periodo: "Dic 2025", valor: 75500000, ultimoDato: true },
]

const rangoAnos = ref('todos')
const tooltip = ref({ visible: false, x: 0, y: 0, titulo: '', valor: 0, periodo: '' })

const maxValor = computed(() => {
  if (paisActivo.value === 'colombia') return 12000000
  if (paisActivo.value === 'usa') return 80000000
  return 80000000
})

const datosActivos = computed(() => {
  if (paisActivo.value === 'colombia') return datosColombia
  if (paisActivo.value === 'usa') return datosUsa
  return [...datosColombia, ...datosUsa]
})

const filteredDatos = computed(() => {
  const years = { 'todos': 0, '5': 2020, '3': 2022 }
  const minYear = years[rangoAnos.value]
  if (minYear === 0) return datosActivos.value
  return datosActivos.value.filter(d => {
    const year = parseInt(d.periodo.split(' ').pop())
    return year >= minYear
  })
})

const labelsVisibles = computed(() => {
  const labels = filteredDatos.value.map(d => d.periodo)
  return labels.filter((_, i) => i % 2 === 0 || i === labels.length - 1)
})

const getX = (idx) => {
  const len = filteredDatos.value.length
  if (len <= 1) return padding
  return padding + idx * ((width - padding * 2) / (len - 1))
}

const getY = (valor) => padding + (height - padding * 2) - ((valor / maxValor.value) * (height - padding * 2))

const colombiaPoints = computed(() => {
  if (paisActivo.value === 'usa') return []
  const datos = filteredDatos.value.filter(d => !d.periodo.includes(' '))
  return datos.map((d, i) => {
    const origIdx = datosColombia.findIndex(x => x.periodo === d.periodo)
    return { x: getX(origIdx), y: getY(d.valor), ...d }
  })
})

const usaPoints = computed(() => {
  if (paisActivo.value === 'colombia') return []
  const datos = filteredDatos.value.filter(d => d.periodo.includes(' '))
  return datos.map(d => {
    const origIdx = datosUsa.findIndex(x => x.periodo === d.periodo)
    return { x: getX(origIdx), y: getY(d.valor), ...d }
  })
})

const colombiaPoly = computed(() => {
  if (paisActivo.value === 'usa') return ''
  const pts = datosColombia.filter(d => filteredDatos.value.some(f => f.periodo === d.periodo))
  if (!pts.length) return ''
  return pts.map((d, i) => {
    const idx = datosColombia.findIndex(x => x.periodo === d.periodo)
    return `${getX(idx)},${getY(d.valor)}`
  }).join(' ')
})

const usaPoly = computed(() => {
  if (paisActivo.value === 'colombia') return ''
  const pts = datosUsa.filter(d => filteredDatos.value.some(f => f.periodo === d.periodo))
  if (!pts.length) return ''
  return pts.map((d, i) => {
    const idx = datosUsa.findIndex(x => x.periodo === d.periodo)
    return `${getX(idx)},${getY(d.valor)}`
  }).join(' ')
})

const colombiaArea = computed(() => {
  if (paisActivo.value === 'usa') return ''
  const pts = datosColombia.filter(d => filteredDatos.value.some(f => f.periodo === d.periodo))
  if (!pts.length) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  const firstIdx = datosColombia.findIndex(x => x.periodo === first.periodo)
  const lastIdx = datosColombia.findIndex(x => x.periodo === last.periodo)
  return `${colombiaPoly.value} ${getX(lastIdx)},${height - padding} ${getX(firstIdx)},${height - padding}`
})

const usaArea = computed(() => {
  if (paisActivo.value === 'colombia') return ''
  const pts = datosUsa.filter(d => filteredDatos.value.some(f => f.periodo === d.periodo))
  if (!pts.length) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  const firstIdx = datosUsa.findIndex(x => x.periodo === first.periodo)
  const lastIdx = datosUsa.findIndex(x => x.periodo === last.periodo)
  return `${usaPoly.value} ${getX(lastIdx)},${height - padding} ${getX(firstIdx)},${height - padding}`
})

const etiquetaEjeY = (i) => {
  if (paisActivo.value === 'colombia') return `${(12 - (i-1) * 2.4).toFixed(1)}M`
  if (paisActivo.value === 'usa') return `${(80 - (i-1) * 16)}M`
  return `${(80 - (i-1) * 16)}M`
}

const mostrarTooltip = (event, tipo, idx) => {
  const datos = tipo === 'colombia' ? colombiaPoints.value : usaPoints.value
  const d = datos[idx]
  if (!d) return
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.grafica-contenedor').getBoundingClientRect()
  tooltip.value = { visible: true, x: rect.left - container.left + 10, y: rect.top - container.top - 60, titulo: tipo === 'colombia' ? '🇨🇴 Colombia' : '🇺🇸 EE.UU.', valor: d.valor, periodo: d.periodo }
}

const ocultarTooltip = () => { tooltip.value.visible = false }
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

.grafica-filtros { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.grafica-filtro__label { font-size: 13px; color: #7A4A44; }
.grafica-filtro__select { padding: 6px 12px; border: 1px solid #EEC9C4; border-radius: 6px; font-size: 13px; background: white; color: #3B1F1C; cursor: pointer; }
.grafica-contenedor { position: relative; }
.grafica-svg { width: 100%; height: auto; }
.grafica-punto { cursor: pointer; transition: r 0.2s ease; }
.grafica-punto:hover { r: 6; }
.grafica-tooltip { position: absolute; background: #3B1F1C; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; pointer-events: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.grafica-tooltip__titulo { font-weight: 600; margin-bottom: 4px; }
.grafica-tooltip__valor { font-size: 14px; font-weight: 700; }
.grafica-tooltip__periodo { opacity: 0.7; margin-top: 2px; }
</style>