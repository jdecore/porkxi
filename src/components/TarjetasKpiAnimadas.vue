<template>
  <div class="tarjetas-kpi">
    <div
      class="tarjeta-kpi tarjeta-kpi--colombia"
      v-for="(kpi, i) in kpis"
      :key="kpi.etiqueta"
      :style="{ animationDelay: `${i * 0.12}s` }"
    >
      <div class="tarjeta-kpi__etiqueta">{{ kpi.etiqueta }}</div>
      <div class="tarjeta-kpi__valor" :class="`tarjeta-kpi__valor--${kpi.color}`">
        <span ref="valorRefs" :data-target="kpi.valorNumerico" :data-sufijo="kpi.sufijo || ''">
          {{ kpi.sufijo ? kpi.valor : kpi.valor.toLocaleString() }}
        </span>
      </div>
      <div class="tarjeta-kpi__descripcion">{{ kpi.descripcion }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const kpis = [
  { etiqueta: 'Último dato Colombia', valor: '10,668,276', valorNumerico: 10668276, sufijo: ' cabezas', color: 'colombia', descripcion: '10,668,276 cabezas' },
  { etiqueta: 'Último dato EE.UU.', valor: '75,500,000', valorNumerico: 75500000, sufijo: ' cabezas', color: 'usa', descripcion: '75,500,000 cabezas' },
  { etiqueta: 'Frecuencia de reporte', valor: '4x', valorNumerico: 4, sufijo: 'x', color: 'alerta', descripcion: 'COL: 1 dato/año · USA: 4 datos/año' },
  { etiqueta: 'Escala comparativa', valor: '7.1x', valorNumerico: 7.1, sufijo: 'x', color: 'cerdo', descripcion: 'EE.UU. tiene 7.1 veces más cerdos' },
];

const valorRefs = ref([]);
const animated = ref(false);

function animateValue(el, start, end, duration, sufijo) {
  const startTime = performance.now();
  const isFloat = !Number.isInteger(end);
  const isSmall = end < 100;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    if (isSmall) {
      el.textContent = (isFloat ? current.toFixed(1) : Math.round(current).toLocaleString()) + sufijo;
    } else {
      el.textContent = Math.round(current).toLocaleString() + sufijo;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

onMounted(() => {
  if (animated.value) return;
  animated.value = true;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const sufijo = el.dataset.sufijo || '';
        animateValue(el, 0, target, 1500, sufijo);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  valorRefs.value.forEach((el) => {
    if (el) observer.observe(el);
  });
});
</script>
