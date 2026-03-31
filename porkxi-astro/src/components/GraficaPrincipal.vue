<template>
  <div class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">
      En millones de cabezas. 
      <span class="grafica-card__colombia">Colombia</span> · 
      <span class="grafica-card__usa">EE.UU.</span>
    </p>
    
    <div class="grafica-contenedor" ref="chartContainer">
      <svg class="grafica-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        <g class="grafica-grid">
          <line v-for="i in 5" :key="'g'+i" :x1="padding" :y1="padding + (height-padding*2)*(i-1)/4" :x2="width-padding" :y2="padding + (height-padding*2)*(i-1)/4" stroke="#EEC9C4" stroke-dasharray="3,3" />
        </g>
        
        <!-- Y axis labels -->
        <g class="grafica-y-axis">
          <text v-for="i in 5" :key="'y'+i" :x="padding-8" :y="padding + (height-padding*2)*(i-1)/4" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#7A4A44">{{ (80 - (i-1)*20) }}M</text>
        </g>
        
        <!-- X axis labels -->
        <g class="grafica-x-axis">
          <text v-for="(label, idx) in xLabels" :key="'x'+idx" :x="xPositions[idx]" :y="height-padding+15" text-anchor="end" dominant-baseline="middle" font-size="10" fill="#7A4A44" :transform="`rotate(-30, ${xPositions[idx]}, ${height-padding+15})`">{{ label }}</text>
        </g>
        
        <!-- Colombia line -->
        <polyline
          :points="colombiaPoints"
          fill="none"
          stroke="#F5A800"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- USA line -->
        <polyline
          :points="usaPoints"
          fill="none"
          stroke="#2563EB"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Colombia dots -->
        <g class="grafica-dots-colombia">
          <circle v-for="(point, idx) in colombiaCoords" :key="'c'+idx" :cx="point.x" :cy="point.y" r="3" fill="#F5A800" />
        </g>
        
        <!-- USA dots -->
        <g class="grafica-dots-usa">
          <circle v-for="(point, idx) in usaCoords" :key="'u'+idx" :cx="point.x" :cy="point.y" r="3" fill="#2563EB" />
        </g>
        
        <!-- Legend -->
        <g class="grafica-legend" :transform="`translate(${width-180}, ${padding-10})`">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
          <circle cx="10" cy="0" r="3" fill="#F5A800" />
          <text x="28" y="4" font-size="11" fill="#3B1F1C">Colombia</text>
          
          <line x1="90" y1="0" x2="110" y2="0" stroke="#2563EB" stroke-width="2.5" />
          <circle cx="100" cy="0" r="3" fill="#2563EB" />
          <text x="118" y="4" font-size="11" fill="#3B1F1C">EE.UU.</text>
        </g>
        
        <!-- Tooltip overlay -->
        <rect :x="padding" :y="padding" :width="width-padding*2" :height="height-padding*2" fill="transparent" @mousemove="handleMouseMove" @mouseleave="hideTooltip" />
        
        <!-- Tooltip -->
        <g v-if="tooltip.show" :transform="`translate(${tooltip.x + 10}, ${tooltip.y - 10})`" class="grafica-tooltip-group">
          <rect x="0" y="0" :width="tooltipWidth" :height="tooltipHeight" fill="white" stroke="#EEC9C4" rx="4" />
          <text x="10" y="18" font-weight="600" font-size="12" fill="#3B1F1C">{{ tooltip.label }}</text>
          <circle cx="16" cy="36" r="4" fill="#F5A800" />
          <text x="24" y="40" font-size="11" fill="#3B1F1C">{{ tooltip.colombia }}</text>
          <circle cx="16" cy="52" r="4" fill="#2563EB" />
          <text x="24" y="56" font-size="11" fill="#3B1F1C">{{ tooltip.usa }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { SERIE_COLOMBIA } from '../data/colombia';
import { SERIE_USA } from '../data/usa';

const width = 700;
const height = 380;
const padding = 45;

const tooltip = ref({ show: false, x: 0, y: 0, label: '', colombia: '', usa: '' });
const tooltipWidth = 120;
const tooltipHeight = 70;

const allData = computed(() => {
  const combined = [
    ...SERIE_COLOMBIA.map(d => ({ periodo: d.periodo, colombia: d.valor })),
    ...SERIE_USA.map(d => ({ periodo: d.periodo, usa: d.valor }))
  ];
  
  return combined.sort((a, b) => {
    const parsePeriod = (p) => {
      const parts = p.split(' ');
      const year = parseInt(parts[0]);
      const season = parts[1];
      const order = { 'Mar': 1, 'Jun': 2, 'Sep': 3, 'Dic': 4 };
      return year * 10 + (order[season] || 5);
    };
    return parsePeriod(a.periodo) - parsePeriod(b.periodo);
  });
});

const xLabels = computed(() => {
  const labels = allData.value.map(d => d.periodo);
  const seen = new Set();
  return labels.filter(l => !seen.has(l) && seen.add(l));
});

const maxValor = computed(() => 80000000);
const minValor = computed(() => 0);

const xPositions = computed(() => {
  const labels = xLabels.value;
  const chartWidth = width - padding * 2;
  const step = chartWidth / (labels.length - 1 || 1);
  return labels.map((_, i) => padding + i * step);
});

const colombiaCoords = computed(() => {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = chartWidth / (xLabels.value.length - 1 || 1);
  
  return SERIE_COLOMBIA.map((d, i) => {
    const xIdx = xLabels.value.findIndex(l => l === d.periodo);
    const x = xIdx >= 0 ? padding + xIdx * step : 0;
    const y = padding + chartHeight - ((d.valor - minValor.value) / (maxValor.value - minValor.value)) * chartHeight;
    return { x, y };
  }).filter(p => p.x > 0);
});

const usaCoords = computed(() => {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = chartWidth / (xLabels.value.length - 1 || 1);
  
  return SERIE_USA.map((d, i) => {
    const xIdx = xLabels.value.findIndex(l => l === d.periodo);
    const x = xIdx >= 0 ? padding + xIdx * step : 0;
    const y = padding + chartHeight - ((d.valor - minValor.value) / (maxValor.value - minValor.value)) * chartHeight;
    return { x, y };
  }).filter(p => p.x > 0);
});

const colombiaPoints = computed(() => {
  return colombiaCoords.value.map(p => `${p.x},${p.y}`).join(' ');
});

const usaPoints = computed(() => {
  return usaCoords.value.map(p => `${p.x},${p.y}`).join(' ');
});

const handleMouseMove = (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const chartWidth = width - padding * 2;
  const xRatio = (x - padding) / chartWidth;
  
  if (xRatio >= 0 && xRatio <= 1) {
    const idx = Math.round(xRatio * (xLabels.value.length - 1));
    const label = xLabels.value[idx];
    if (label) {
      const colD = SERIE_COLOMBIA.find(d => d.periodo === label);
      const usaD = SERIE_USA.find(d => d.periodo === label);
      
      tooltip.value = {
        show: true,
        x: Math.min(x, width - tooltipWidth - 20),
        y: Math.max(20, e.clientY - rect.top - 40),
        label,
        colombia: colD ? `Colombia: ${(colD.valor/1000000).toFixed(2)}M` : '—',
        usa: usaD ? `EE.UU.: ${(usaD.valor/1000000).toFixed(2)}M` : '—'
      };
    }
  }
};

const hideTooltip = () => {
  tooltip.value.show = false;
};
</script>

<style scoped>
.grafica-svg {
  width: 100%;
  height: 100%;
}

.grafica-tooltip-group {
  pointer-events: none;
}
</style>