<template>
  <section class="grafica-card">
    <h2 class="grafica-card__titulo">Inventario histórico comparado</h2>
    <p class="grafica-card__subtitulo">
      En millones de cabezas.
      <span class="grafica-card__colombia">🟡 Colombia (anual · fuente: Porcinews)</span> ·
      <span class="grafica-card__usa">🔵 EE.UU. (trimestral · fuente: USDA NASS)</span>
    </p>

    <div class="grafica-filtros">
      <label class="grafica-filtros__label">Rango:</label>
      <select v-model="rangoSeleccionado" class="grafica-filtros__select">
        <option value="todo">Todo</option>
        <option value="reciente">Últimos 5 años</option>
        <option value="usa">Solo EE.UU.</option>
        <option value="colombia">Solo Colombia</option>
      </select>
    </div>

    <div class="grafica-contenedor" ref="contenedorRef">
      <svg
        class="grafica-svg"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="xMidYMid meet"
        @mousemove="onMouseMove"
        @mouseleave="tooltip = null"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="tooltip = null"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#3B1F1C" flood-opacity="0.12" />
          </filter>
        </defs>

        <g class="grafica-grid">
          <line
            v-for="i in 5"
            :key="'g' + i"
            :x1="padding"
            :y1="padding + (height - padding * 2) * (i - 1) / 4"
            :x2="width - padding"
            :y2="padding + (height - padding * 2) * (i - 1) / 4"
            stroke="#EEC9C4"
            stroke-dasharray="3,3"
          />
        </g>

        <g class="grafica-y-axis">
          <text
            v-for="i in 5"
            :key="'y' + i"
            :x="padding - 8"
            :y="padding + (height - padding * 2) * (i - 1) / 4"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="11"
            fill="#7A4A44"
          >{{ 80 - (i - 1) * 20 }}M</text>
        </g>

        <g class="grafica-x-axis">
          <text
            v-for="(label, i) in xLabels"
            :key="'x' + i"
            :x="label.x"
            :y="height - padding + 20"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="9"
            fill="#7A4A44"
            :transform="`rotate(-30, ${label.x}, ${height - padding + 20})`"
          >{{ label.text }}</text>
        </g>

        <polyline
          v-if="mostrarColombia"
          :points="colombiaPoly"
          fill="none"
          stroke="#F5A800"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="grafica-linea"
          :style="{
            strokeDasharray: colombiaLength,
            strokeDashoffset: animando ? colombiaLength : 0,
            transition: animando ? 'none' : `stroke-dashoffset ${duracionLinea}ms ease-out`,
          }"
        />
        <polyline
          v-if="mostrarUsa"
          :points="usaPoly"
          fill="none"
          stroke="#2563EB"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="grafica-linea"
          :style="{
            strokeDasharray: usaLength,
            strokeDashoffset: animando ? usaLength : 0,
            transition: animando ? 'none' : `stroke-dashoffset ${duracionLinea}ms ease-out`,
          }"
        />

        <g v-if="mostrarColombia">
          <circle
            v-for="(p, i) in colombiaPoints"
            :key="'cd' + i"
            :cx="p.x"
            :cy="p.y"
            :r="tooltip?.tipo === 'colombia' && tooltip?.index === i ? 6 : 3"
            fill="#F5A800"
            class="grafica-punto"
            @mouseenter="tooltip = { tipo: 'colombia', index: i, x: p.x, y: p.y }"
          >
            <animate
              attributeName="r"
              :from="animando ? '0' : '3'"
              to="3"
              :dur="`${0.3 + i * 0.05}s`"
              :begin="animando ? `${duracionLinea / 1000 + i * 0.05}s` : '0s'"
              fill="freeze"
            />
          </circle>
        </g>

        <g v-if="mostrarUsa">
          <circle
            v-for="(p, i) in usaPoints"
            :key="'ud' + i"
            :cx="p.x"
            :cy="p.y"
            :r="tooltip?.tipo === 'usa' && tooltip?.index === i ? 6 : 3"
            fill="#2563EB"
            class="grafica-punto"
            @mouseenter="tooltip = { tipo: 'usa', index: i, x: p.x, y: p.y }"
          >
            <animate
              attributeName="r"
              :from="animando ? '0' : '3'"
              to="3"
              :dur="`${0.3 + i * 0.05}s`"
              :begin="animando ? `${duracionLinea / 1000 + i * 0.05}s` : '0s'"
              fill="freeze"
            />
          </circle>
        </g>

        <g v-if="tooltip" class="grafica-tooltip">
          <rect
            :x="tooltip.x - 75"
            :y="tooltip.y - 52"
            width="150"
            height="44"
            rx="8"
            fill="white"
            stroke="#EEC9C4"
            stroke-width="1.5"
            filter="url(#shadow)"
          />
          <text :x="tooltip.x" :y="tooltip.y - 34" text-anchor="middle" font-size="10" font-weight="700" fill="#3B1F1C">
            {{ tooltipData?.periodo }}
          </text>
          <text :x="tooltip.x" :y="tooltip.y - 18" text-anchor="middle" font-size="11" :fill="tooltipColor">
            {{ tooltipData?.valorFormateado }}
          </text>
        </g>

        <g :transform="`translate(${width - 220}, ${padding - 20})`">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#F5A800" stroke-width="2.5" />
          <circle cx="10" cy="0" r="3" fill="#F5A800" />
          <text x="28" y="4" font-size="11" fill="#3B1F1C">🇨🇴 Colombia (Porcinews)</text>
          <line x1="160" y1="0" x2="180" y2="0" stroke="#2563EB" stroke-width="2.5" />
          <circle cx="170" cy="0" r="3" fill="#2563EB" />
          <text x="188" y="4" font-size="11" fill="#3B1F1C">🇺🇸 EE.UU. (USDA NASS)</text>
        </g>
      </svg>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  colombia: { type: Array, required: true },
  usa: { type: Array, required: true },
});

const width = 700;
const height = 450;
const padding = 55;
const maxValor = 80000000;
const duracionLinea = 1200;

const rangoSeleccionado = ref('todo');
const tooltip = ref(null);
const animando = ref(true);
const contenedorRef = ref(null);

const colombiaFiltrada = computed(() => {
  if (rangoSeleccionado.value === 'usa') return [];
  if (rangoSeleccionado.value === 'reciente') return props.colombia.slice(-5);
  return props.colombia;
});

const usaFiltrada = computed(() => {
  if (rangoSeleccionado.value === 'colombia') return [];
  if (rangoSeleccionado.value === 'reciente') return props.usa.slice(-5);
  return props.usa;
});

const mostrarColombia = computed(() => rangoSeleccionado.value !== 'usa');
const mostrarUsa = computed(() => rangoSeleccionado.value !== 'colombia');

const allPeriodos = computed(() => {
  const periodos = new Set();
  if (mostrarColombia.value) colombiaFiltrada.value.forEach(d => periodos.add(d.periodo));
  if (mostrarUsa.value) usaFiltrada.value.forEach(d => periodos.add(d.periodo));
  return [...periodos].sort((a, b) => {
    const parseP = p => {
      const parts = p.split(' ');
      return parseInt(parts[0]) * 10 + ({ Mar: 1, Jun: 2, Sep: 3, Dic: 4 }[parts[1]] || 5);
    };
    return parseP(a) - parseP(b);
  });
});

const getX = (idx) => padding + idx * ((width - padding * 2) / Math.max(allPeriodos.value.length - 1, 1));
const getY = (valor) => padding + (height - padding * 2) - ((valor / maxValor) * (height - padding * 2));

const colombiaPoints = computed(() =>
  colombiaFiltrada.value.map(d => ({ x: getX(allPeriodos.value.indexOf(d.periodo)), y: getY(d.valor), ...d })).filter(p => p.x >= padding)
);

const usaPoints = computed(() =>
  usaFiltrada.value.map(d => ({ x: getX(allPeriodos.value.indexOf(d.periodo)), y: getY(d.valor), ...d })).filter(p => p.x >= padding)
);

const colombiaPoly = computed(() => colombiaPoints.value.map(p => `${p.x},${p.y}`).join(' '));
const usaPoly = computed(() => usaPoints.value.map(p => `${p.x},${p.y}`).join(' '));

const colombiaLength = computed(() => {
  let len = 0;
  for (let i = 1; i < colombiaPoints.value.length; i++) {
    const dx = colombiaPoints.value[i].x - colombiaPoints.value[i - 1].x;
    const dy = colombiaPoints.value[i].y - colombiaPoints.value[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len || 1;
});

const usaLength = computed(() => {
  let len = 0;
  for (let i = 1; i < usaPoints.value.length; i++) {
    const dx = usaPoints.value[i].x - usaPoints.value[i - 1].x;
    const dy = usaPoints.value[i].y - usaPoints.value[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len || 1;
});

const xLabels = computed(() =>
  allPeriodos.value
    .filter((_, i) => i % 2 === 0 || i === allPeriodos.value.length - 1)
    .map(label => ({ text: label, x: getX(allPeriodos.value.indexOf(label)) }))
);

const tooltipData = computed(() => {
  if (!tooltip.value) return null;
  const data = tooltip.value.tipo === 'colombia' ? colombiaFiltrada.value : usaFiltrada.value;
  const item = data[tooltip.value.index];
  if (!item) return null;
  return {
    periodo: item.periodo,
    valorFormateado: `${(item.valor / 1000000).toFixed(2)}M cabezas`,
  };
});

const tooltipColor = computed(() =>
  tooltip.value?.tipo === 'colombia' ? '#F5A800' : '#2563EB'
);

function onMouseMove(e) {
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  const allPoints = [
    ...colombiaPoints.value.map((p, i) => ({ ...p, tipo: 'colombia', index: i })),
    ...usaPoints.value.map((p, i) => ({ ...p, tipo: 'usa', index: i })),
  ];

  let closest = null;
  let minDist = 25;
  for (const p of allPoints) {
    const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }
  tooltip.value = closest;
}

function onTouchStart(e) {
  handleTouch(e.touches[0], e.currentTarget);
}

function onTouchMove(e) {
  handleTouch(e.touches[0], e.currentTarget);
}

function handleTouch(touch, svg) {
  const rect = svg.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const mx = (touch.clientX - rect.left) * scaleX;
  const my = (touch.clientY - rect.top) * scaleY;

  const allPoints = [
    ...colombiaPoints.value.map((p, i) => ({ ...p, tipo: 'colombia', index: i })),
    ...usaPoints.value.map((p, i) => ({ ...p, tipo: 'usa', index: i })),
  ];

  let closest = null;
  let minDist = 35;
  for (const p of allPoints) {
    const dist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }
  tooltip.value = closest;
}

onMounted(() => {
  setTimeout(() => { animando.value = false; }, 50);
});

watch(rangoSeleccionado, () => {
  animando.value = true;
  tooltip.value = null;
  setTimeout(() => { animando.value = false; }, 50);
});
</script>
