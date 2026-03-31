<template>
  <div class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">
      En millones de cuerpos. 
      <span class="grafica-card__colombia">Colombia</span> · 
      <span class="grafica-card__usa">EE.UU.</span>
    </p>
    
    <div v-if="!chartLoaded" class="grafica-skeleton">
      <div class="grafica-skeleton__axis">
        <div class="grafica-skeleton__bar" style="height: 20%"></div>
        <div class="grafica-skeleton__bar" style="height: 35%"></div>
        <div class="grafica-skeleton__bar" style="height: 50%"></div>
        <div class="grafica-skeleton__bar" style="height: 65%"></div>
        <div class="grafica-skeleton__bar" style="height: 80%"></div>
        <div class="grafica-skeleton__bar" style="height: 95%"></div>
      </div>
      <div class="grafica-skeleton__lines">
        <div class="grafica-skeleton__line"></div>
        <div class="grafica-skeleton__line"></div>
        <div class="grafica-skeleton__line"></div>
      </div>
    </div>
    
    <div v-else class="grafica-contenedor">
      <ResponsiveContainer width="100%" height="100%" :debounce="200">
        <LineChart :data="datosCombinados" :margin="{ top: 20, right: 30, left: 20, bottom: 20 }">
          <CartesianGrid stroke-dasharray="3 3" stroke="#EEC9C4" />
          <XAxis 
            data-key="periodo" 
            :interval="0" 
            :tick="{ fontSize: 11 }" 
            :angle="-30" 
            text-anchor="end"
            :tick-line="false"
            :minTickGap="30"
          />
          <YAxis 
            :tick-formatter="(v) => (v/1000000).toFixed(1) + 'M'"
            :tick="{ fontSize: 11 }"
            :tick-line="false"
            :axis-line="{ stroke: '#EEC9C4' }"
            :width="45"
          />
          <Tooltip :content="CustomTooltip" />
          <Legend :formatter="legendFormatter" />
          <Line 
            type="monotone" 
            data-key="colombia" 
            stroke="#F5A800" 
            :stroke-width="2.5" 
            :connect-nulls="true"
            :dot="{ r: 2.5 }"
            :isAnimationActive="true"
            :animationDuration="800"
            name="colombia"
          />
          <Line 
            type="monotone" 
            data-key="usa" 
            stroke="#2563EB" 
            :stroke-width="2.5" 
            :connect-nulls="true"
            :dot="{ r: 2.5 }"
            :isAnimationActive="true"
            :animationDuration="800"
            name="usa"
          />
          <ReferenceDot 
            v-if="ultimoColombia"
            :x="ultimoColombia.periodo" 
            :y="ultimoColombia.valor" 
            :r="8" 
            fill="#C0392B" 
            stroke="white" 
            :stroke-width="2"
            :label="{ value: 'Último', position: 'top', fill: '#C0392B', fontSize: 10 }"
          />
          <ReferenceDot 
            v-if="ultimoUsa"
            :x="ultimoUsa.periodo" 
            :y="ultimoUsa.valor" 
            :r="8" 
            fill="#2563EB" 
            stroke="white" 
            :stroke-width="2"
            :label="{ value: 'Último', position: 'top', fill: '#2563EB', fontSize: 10 }"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h, defineAsyncComponent } from 'vue';
import { SERIE_COLOMBIA } from '../data/colombia';
import { SERIE_USA } from '../data/usa';

const chartLoaded = ref(false);

const datosCombinados = computed(() => {
  const combined = [
    ...SERIE_COLOMBIA.map(d => ({ periodo: d.periodo, colombia: d.valor, ultimoColombia: d.ultimoDato })),
    ...SERIE_USA.map(d => ({ periodo: d.periodo, usa: d.valor, ultimoUsa: d.ultimoDato }))
  ];
  
  return combined.sort((a, b) => {
    const yearA = parseInt(a.periodo.split(' ')[0]);
    const yearB = parseInt(b.periodo.split(' ')[0]);
    if (yearA !== yearB) return yearA - yearB;
    const seasonOrder = { 'Mar': 1, 'Jun': 2, 'Sep': 3, 'Dic': 4 };
    const seasonA = a.periodo.includes(' ') ? seasonOrder[a.periodo.split(' ')[0]] : 5;
    const seasonB = b.periodo.includes(' ') ? seasonOrder[b.periodo.split(' ')[0]] : 5;
    return seasonA - seasonB;
  });
});

const ultimoColombia = computed(() => SERIE_COLOMBIA.find(d => d.ultimoDato));
const ultimoUsa = computed(() => SERIE_USA.find(d => d.ultimoDato));

const legendFormatter = (value) => value === 'colombia' ? 'Colombia' : 'EE.UU.';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return h('div', { class: 'grafica-tooltip' }, [
      h('p', { class: 'grafica-tooltip__label' }, label),
      ...payload.map((entry, index) => 
        h('div', { class: 'grafica-tooltip__item', key: index }, [
          h('span', { class: `grafica-tooltip__color grafica-tooltip__${entry.dataKey}` }),
          h('span', null, `${entry.dataKey === 'colombia' ? 'Colombia' : 'EE.UU.'}: ${(entry.value / 1000000).toFixed(2)}M`)
        ])
      )
    ]);
  }
  return null;
};

onMounted(async () => {
  const [{ LineChart }, { Line }, { XAxis }, { YAxis }, { CartesianGrid }, { Tooltip }, { Legend }, { ResponsiveContainer }, { ReferenceDot }] = await Promise.all([
    import('recharts').then(m => ({ LineChart: m.LineChart })),
    import('recharts').then(m => ({ Line: m.Line })),
    import('recharts').then(m => ({ XAxis: m.XAxis })),
    import('recharts').then(m => ({ YAxis: m.YAxis })),
    import('recharts').then(m => ({ CartesianGrid: m.CartesianGrid })),
    import('recharts').then(m => ({ Tooltip: m.Tooltip })),
    import('recharts').then(m => ({ Legend: m.Legend })),
    import('recharts').then(m => ({ ResponsiveContainer: m.ResponsiveContainer })),
    import('recharts').then(m => ({ ReferenceDot: m.ReferenceDot }))
  ]);
  chartLoaded.value = true;
});
</script>

<style scoped>
.grafica-skeleton {
  width: 100%;
  height: 380px;
  background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.grafica-skeleton__axis {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 30px;
}

.grafica-skeleton__bar {
  width: 8%;
  background: var(--crema-borde);
  border-radius: 4px;
  opacity: 0.4;
}

.grafica-skeleton__lines {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
}

.grafica-skeleton__line {
  height: 2px;
  background: var(--crema-borde);
  opacity: 0.3;
}
</style>