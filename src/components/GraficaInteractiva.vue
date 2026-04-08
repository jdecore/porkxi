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
      <svg width="700" height="330" viewBox="0 0 700 330">
        <g class="grafica-grid">
          <line v-for="i in 5" :key="'grid-'+i" 
            x1="50" :y1="40 + 180 * (i - 1) / 4" 
            x2="650" :y2="40 + 180 * (i - 1) / 4" 
            stroke="#EEC9C4" stroke-dasharray="3,3" />
        </g>

        <g class="grafica-y-axis">
          <text v-for="(valor, i) in etiquetasY" :key="'y-'+i" 
            x="40" :y="40 + 180 * i / 4" 
            text-anchor="end" dominant-baseline="middle" font-size="11" fill="#7A4A44">
            {{ valor }}
          </text>
        </g>

        <g class="grafica-x-axis">
          <text v-for="(label, i) in etiquetasX" :key="'x-'+i"
            x="50 + i * (600 / (etiquetasX.length - 1 || 1))"
            y="300"
            text-anchor="end" dominant-baseline="middle" font-size="9" fill="#7A4A44">
            {{ label }}
          </text>
        </g>

        <template v-if="paisActivo !== 'usa'">
          <polyline :points="lineaColombia" fill="none" stroke="#F5A800" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosColombia" :key="'c-'+i"
            :cx="50 + i * (600 / (datosColombia.length - 1 || 1))"
            :cy="220 - (p.valor / maximo * 180)"
            r="4" fill="#F5A800" class="grafica-punto"
            @mouseenter="mostrarTooltip($event, 'Colombia', p)" />
        </template>

        <template v-if="paisActivo !== 'colombia'">
          <polyline :points="lineaUsa" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" />
          <circle v-for="(p, i) in datosUsa" :key="'u-'+i"
            :cx="50 + i * (600 / (datosUsa.length - 1 || 1))"
            :cy="220 - (p.valor / maximo * 180)"
            r="4" fill="#2563EB" class="grafica-punto"
            @mouseenter="mostrarTooltipUSA($event, p, i)" />
        </template>

        <g transform="translate(480, 25)">
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
  { periodo: "Mar", valor: 72.8 },
  { periodo: "Jun", valor: 73.2 },
  { periodo: "Sep", valor: 73.8 },
  { periodo: "Dic", valor: 74.1 },
  { periodo: "Mar", valor: 73.9 },
  { periodo: "Jun", valor: 74.2 },
  { periodo: "Sep", valor: 74.8 },
  { periodo: "Dic", valor: 74.7 },
  { periodo: "Mar", valor: 74.5 },
  { periodo: "Jun", valor: 75.1 },
  { periodo: "Sep", valor: 74.5 },
  { periodo: "Dic", valor: 75.5 },
]

const tooltip = ref({ visible: false, x: 0, y: 0, pais: '', valor: 0, periodo: '' })

const maximo = computed(() => {
  if (paisActivo.value === 'colombia') return 12
  return 80
})

const etiquetasY = computed(() => {
  if (paisActivo.value === 'colombia') return ['12M', '9M', '6M', '3M', '0']
  return ['80M', '60M', '40M', '20M', '0']
})

const lineaColombia = computed(() => {
  if (paisActivo.value === 'usa') return ''
  return datosColombia.map((p, i) => 
    `${50 + i * (600 / (datosColombia.length - 1 || 1))},${220 - (p.valor / maximo.value * 180)}`
  ).join(' ')
})

const lineaUsa = computed(() => {
  if (paisActivo.value === 'colombia') return ''
  return datosUsa.map((p, i) => 
    `${50 + i * (600 / (datosUsa.length - 1 || 1))},${220 - (p.valor / maximo.value * 180)}`
  ).join(' ')
})

const etiquetasX = computed(() => {
  if (paisActivo.value === 'colombia') return datosColombia.map(d => d.periodo)
  if (paisActivo.value === 'usa') return datosUsa.map(d => d.periodo)
  return datosUsa.map(d => d.periodo)
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

.grafica-contenedor { position: relative; overflow: hidden; }
.grafica-svg { width: 100%; height: auto; display: block; }
.grafica-punto { cursor: pointer; transition: r 0.2s ease; }
.grafica-punto:hover { r: 6; }
.grafica-tooltip { position: absolute; background: #3B1F1C; color: white; padding: 10px 14px; border-radius: 8px; font-size: 12px; pointer-events: none; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.grafica-tooltip__titulo { font-weight: 600; margin-bottom: 4px; }
.grafica-tooltip__valor { font-size: 14px; font-weight: 700; }
.grafica-tooltip__periodo { opacity: 0.7; margin-top: 2px; }
</style>