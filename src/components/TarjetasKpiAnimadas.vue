<template>
  <div class="tarjetas-kpi">
    <div class="tarjeta-kpi tarjeta-kpi--colombia">
      <div class="tarjeta-kpi__etiqueta">Último dato Colombia</div>
      <div class="tarjeta-kpi__valor">2024</div>
      <div class="tarjeta-kpi__descripcion">
        {{ animatedColombia.toLocaleString() }} cabezas
      </div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--usa">
      <div class="tarjeta-kpi__etiqueta">Último dato EE.UU.</div>
      <div class="tarjeta-kpi__valor">Dic 2025</div>
      <div class="tarjeta-kpi__descripcion">
        {{ animatedUsa.toLocaleString() }} cabezas
      </div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--alerta">
      <div class="tarjeta-kpi__etiqueta">Frecuencia de reporte</div>
      <div class="tarjeta-kpi__valor">Anual vs Trimestral</div>
      <div class="tarjeta-kpi__descripcion">
        COL: 1 dato/año · USA: 4 datos/año
      </div>
    </div>
    <div class="tarjeta-kpi tarjeta-kpi--cerdo">
      <div class="tarjeta-kpi__etiqueta">Escala comparativa</div>
      <div class="tarjeta-kpi__valor">{{ animatedRatio.toFixed(1) }}x</div>
      <div class="tarjeta-kpi__descripcion">
        EE.UU. tiene {{ animatedRatio.toFixed(1) }} veces más cerdos
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SERIE_COLOMBIA } from '../data/colombia.js'
import { SERIE_USA } from '../data/usa.js'

const animatedColombia = ref(0)
const animatedUsa = ref(0)
const animatedRatio = ref(0)

// Obtener datos reales de las fuentes
const ultimoColombia =
  Array.isArray(SERIE_COLOMBIA) && SERIE_COLOMBIA.length
    ? SERIE_COLOMBIA[SERIE_COLOMBIA.length - 1].valor
    : 10668276

const ultimoUsa =
  Array.isArray(SERIE_USA) && SERIE_USA.length
    ? SERIE_USA[SERIE_USA.length - 1].valor
    : 75500000

const ratioReal = ultimoUsa / ultimoColombia

const DURATION = 1800
let animacionCompleta = false

onMounted(() => {
  if (animacionCompleta) return

  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / DURATION, 1)

    const t = 1 - Math.pow(1 - progress, 4)

    animatedColombia.value = Math.round(ultimoColombia * t)
    animatedUsa.value = Math.round(ultimoUsa * t)
    animatedRatio.value = ratioReal * t

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animacionCompleta = true
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
  background: var(--crema-oscuro, #F7E0DC);
  border-radius: var(--radio, 14px);
  padding: 20px;
  box-shadow: var(--sombra, 0 10px 28px rgba(59, 31, 28, 0.08));
  text-align: center;
}

.tarjeta-kpi--colombia {
  border-top: 4px solid var(--colombia, #F5A800);
}

.tarjeta-kpi--usa {
  border-top: 4px solid var(--usa, #2563EB);
}

.tarjeta-kpi--alerta {
  border-top: 4px solid var(--alerta, #C0392B);
}

.tarjeta-kpi--cerdo {
  border-top: 4px solid var(--cerdo, #D4736B);
}

.tarjeta-kpi__etiqueta {
  font-size: 12px;
  font-weight: 500;
  color: var(--tinta-claro, #7A4A44);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.tarjeta-kpi__valor {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--tinta, #3B1F1C);
  margin-bottom: 6px;
}

.tarjeta-kpi__descripcion {
  font-size: 13px;
  color: var(--tinta-claro, #7A4A44);
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
    gap: 12px;
  }

  .tarjeta-kpi {
    padding: 16px;
  }

  .tarjeta-kpi__valor {
    font-size: 24px;
  }
}
</style>
