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

<style scoped>
.tarjetas-kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 32px 0;
}

.tarjeta-kpi {
  background: #fff;
  border-radius: var(--radio);
  padding: 20px;
  box-shadow: var(--sombra);
  text-align: center;
}

.tarjeta-kpi--colombia { border-top: 4px solid var(--colombia); }
.tarjeta-kpi--usa { border-top: 4px solid var(--usa); }
.tarjeta-kpi--alerta { border-top: 4px solid var(--alerta); }
.tarjeta-kpi--cerdo { border-top: 4px solid var(--cerdo); }

.tarjeta-kpi__etiqueta {
  font-size: 12px;
  font-weight: 500;
  color: var(--tinta-claro);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.tarjeta-kpi__valor {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--tinta);
  margin-bottom: 6px;
}

.tarjeta-kpi__descripcion {
  font-size: 13px;
  color: var(--tinta-claro);
  line-height: 1.4;
}

@media (max-width: 900px) {
  .tarjetas-kpi {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .tarjetas-kpi {
    grid-template-columns: 1fr;
  }
}
</style>