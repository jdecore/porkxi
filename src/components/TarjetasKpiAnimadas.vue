<template>
  <div class="tarjetas-kpi">
    <div class="tarjeta-kpi tarjeta-kpi--colombia">
      <div class="tarjeta-kpi__etiqueta">Último dato Colombia</div>
      <div class="tarjeta-kpi__valor">2024</div>
      <div class="tarjeta-kpi__descripcion">{{ animatedColombia.toLocaleString() }} cabezas</div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--usa">
      <div class="tarjeta-kpi__etiqueta">Último dato EE.UU.</div>
      <div class="tarjeta-kpi__valor">Dic 2025</div>
      <div class="tarjeta-kpi__descripcion">{{ animatedUsa.toLocaleString() }} cabezas</div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--alerta">
      <div class="tarjeta-kpi__etiqueta">Frecuencia de reporte</div>
      <div class="tarjeta-kpi__valor">Anual vs Trimestral</div>
      <div class="tarjeta-kpi__descripcion">COL: 1 dato/año · USA: 4 datos/año</div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--cerdo">
      <div class="tarjeta-kpi__etiqueta">Escala comparativa</div>
      <div class="tarjeta-kpi__valor">{{ animatedRatio.toFixed(1) }}x</div>
      <div class="tarjeta-kpi__descripcion">EE.UU. tiene {{ animatedRatio.toFixed(1) }} veces más cerdos</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const animatedColombia = ref(0)
const animatedUsa = ref(0)
const animatedRatio = ref(0)

const COLOMBIA_FINAL = 10668276
const USA_FINAL = 75500000
const DURATION = 1800

onMounted(() => {
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / DURATION, 1)
    
    // easeOutQuart easing
    const t = 1 - Math.pow(1 - progress, 4)
    
    animatedColombia.value = Math.round(COLOMBIA_FINAL * t)
    animatedUsa.value = Math.round(USA_FINAL * t)
    animatedRatio.value = 7.1 * t
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
})
</script>
