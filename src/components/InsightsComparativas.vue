<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from '../lib/paths.js'

const cargando = ref(true)
const error = ref('')
const transparencia = ref([])
const sacrificio = ref([])
const ciclo = ref([])
const preciosComercio = ref(null)
const historico = ref([])
const meta = ref({
  transparencia: { generatedAt: '', fuente: '' },
  sacrificio: { generatedAt: '', fuente: '', unidad: '', nota: '' },
  ciclo: { generatedAt: '', fuente: '', unidad: '' },
  precios: { generatedAt: '', fuente: '' },
  historico: { generatedAt: '', fuente: '' },
})

const maxSacrificio = computed(() =>
  sacrificio.value.reduce((max, item) => Math.max(max, Number(item.valor_millones) || 0), 0),
)

const filasTransparencia = computed(() => transparencia.value.slice().sort((a, b) => a.dias_publicacion - b.dias_publicacion))
const historicoReciente = computed(() => historico.value.slice(-5).reverse())

const formatearFecha = (valor) => {
  if (!valor) return 'sin dato'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fecha.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const cargarDatasets = async () => {
  cargando.value = true
  error.value = ''
  try {
    const [transparenciaRes, sacrificioRes, cicloRes, preciosRes, historicoRes] = await Promise.all([
      fetch(withBase('data/transparencia.json'), { cache: 'no-store' }),
      fetch(withBase('data/sacrificio-anual-ue.json'), { cache: 'no-store' }),
      fetch(withBase('data/ciclo-reproductivo-ue.json'), { cache: 'no-store' }),
      fetch(withBase('data/precios-comercio.json'), { cache: 'no-store' }),
      fetch(withBase('data/historico-inventario.json'), { cache: 'no-store' }),
    ])
    if (!transparenciaRes.ok || !sacrificioRes.ok || !cicloRes.ok || !preciosRes.ok || !historicoRes.ok) {
      throw new Error('No se pudieron cargar los datasets enriquecidos')
    }
    const [transparenciaData, sacrificioData, cicloData, preciosData, historicoData] = await Promise.all([
      transparenciaRes.json(),
      sacrificioRes.json(),
      cicloRes.json(),
      preciosRes.json(),
      historicoRes.json(),
    ])
    transparencia.value = Array.isArray(transparenciaData?.series) ? transparenciaData.series : []
    sacrificio.value = Array.isArray(sacrificioData?.series) ? sacrificioData.series : []
    ciclo.value = Array.isArray(cicloData?.series) ? cicloData.series : []
    historico.value = Array.isArray(historicoData?.series) ? historicoData.series : []
    preciosComercio.value = preciosData ?? null
    meta.value = {
      transparencia: {
        generatedAt: transparenciaData?.generated_at || '',
        fuente: 'USDA NASS + Eurostat + Porcinews',
      },
      sacrificio: {
        generatedAt: sacrificioData?.generated_at || '',
        fuente: sacrificioData?.fuente || '',
        unidad: sacrificioData?.unidad || '',
        nota: sacrificioData?.nota || '',
      },
      ciclo: {
        generatedAt: cicloData?.generated_at || '',
        fuente: cicloData?.fuente || '',
        unidad: cicloData?.unidad || '',
      },
      precios: {
        generatedAt: preciosData?.generated_at || '',
        fuente: preciosData?.fuente || '',
      },
      historico: {
        generatedAt: historicoData?.generated_at || '',
        fuente: Array.isArray(historicoData?.fuente) ? historicoData.fuente.join(', ') : '',
      },
    }
  } catch (_err) {
    error.value = 'No se pudieron cargar los insights enriquecidos'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  void cargarDatasets()
})
</script>

<template>
  <section class="insights">
    <div class="insights__header">
      <h2 class="insights__title">Insights de actualización y mercado</h2>
      <a class="insights__download" :href="withBase('data/serie-completa.csv')" download>Descargar serie completa (CSV)</a>
    </div>

    <p v-if="cargando" class="insights__status">Cargando datasets enriquecidos...</p>
    <p v-else-if="error" class="insights__status insights__status--error">{{ error }}</p>

    <div v-else class="insights__grid">
      <article class="insights__card">
        <h3 class="insights__card-title">Transparencia por fuente</h3>
        <div class="insights__table">
          <div v-for="item in filasTransparencia" :key="item.region" class="insights__row">
            <span>{{ item.region }}</span>
            <strong>{{ item.dias_publicacion }} días</strong>
            <span>{{ item.formato }} · {{ item.frecuencia }}</span>
          </div>
        </div>
        <p class="insights__meta">Dataset: {{ meta.transparencia.fuente }} · {{ formatearFecha(meta.transparencia.generatedAt) }}</p>
      </article>

      <article class="insights__card">
        <h3 class="insights__card-title">UE: sacrificio anual</h3>
        <div class="insights__bars">
          <div v-for="item in sacrificio" :key="item.anio" class="insights__bar-row">
            <span class="insights__bar-label">{{ item.anio }}</span>
            <div class="insights__bar-track">
              <div
                class="insights__bar"
                :style="{ width: `${maxSacrificio ? (item.valor_millones / maxSacrificio) * 100 : 0}%` }"
              ></div>
            </div>
            <span class="insights__bar-value">{{ item.valor_millones.toFixed(1) }}M</span>
          </div>
        </div>
        <p class="insights__meta">{{ meta.sacrificio.fuente }} · {{ meta.sacrificio.unidad }}</p>
        <p v-if="meta.sacrificio.nota" class="insights__meta">{{ meta.sacrificio.nota }}</p>
      </article>

      <article class="insights__card">
        <h3 class="insights__card-title">UE: ciclo reproductivo</h3>
        <div class="insights__metrics">
          <div v-for="item in ciclo" :key="item.indicador" class="insights__metric">
            <span class="insights__metric-label">{{ item.indicador }}</span>
            <strong>{{ item.valor_millones.toFixed(2) }}M</strong>
            <span>{{ item.variacion_pct }}% interanual</span>
          </div>
        </div>
        <p class="insights__meta">{{ meta.ciclo.fuente }} · {{ meta.ciclo.unidad }}</p>
      </article>

      <article class="insights__card">
        <h3 class="insights__card-title">Precios y comercio (UE vs Colombia)</h3>
        <div v-if="preciosComercio" class="insights__bullets">
          <p><strong>UE canal:</strong> {{ preciosComercio.ue_precio_canal_eur_100kg }} €/100kg ({{ preciosComercio.ue_precio_variacion_pct }}%)</p>
          <p><strong>UE lechón:</strong> {{ preciosComercio.ue_lechon_eur }} € ({{ preciosComercio.ue_lechon_variacion_pct }}%)</p>
          <p><strong>COL importaciones:</strong> {{ preciosComercio.colombia_importaciones_desde_norteamerica_pct }}% desde EE.UU./Canadá/Chile</p>
          <p><strong>UE comercio vivo:</strong> España +{{ preciosComercio.espana_import_vivo_t1_2025_pct }}% T1 2025 desde Países Bajos</p>
        </div>
        <p class="insights__meta">{{ meta.precios.fuente }} · {{ formatearFecha(meta.precios.generatedAt) }}</p>
      </article>

      <article class="insights__card insights__card--full">
        <h3 class="insights__card-title">Histórico consolidado (Action)</h3>
        <div class="insights__historico">
          <div class="insights__historico-head">
            <span>Año</span>
            <span>COL</span>
            <span>UE</span>
            <span>USA dic</span>
          </div>
          <div v-for="item in historicoReciente" :key="item.anio" class="insights__historico-row">
            <span>{{ item.anio }}</span>
            <span>{{ Number(item.colombia).toLocaleString() }}</span>
            <span>{{ Number(item.europa).toLocaleString() }}</span>
            <span>{{ item.usa_dic ? Number(item.usa_dic).toLocaleString() : '—' }}</span>
          </div>
        </div>
        <p class="insights__meta">Fuentes: {{ meta.historico.fuente }} · {{ formatearFecha(meta.historico.generatedAt) }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.insights {
  background: #fff;
  border: 1px solid var(--crema-borde);
  border-radius: 14px;
  margin: 32px 0;
  padding: 22px;
}

.insights__header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.insights__title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  margin: 0;
}

.insights__download {
  color: var(--tinta);
  font-size: 12px;
  text-decoration: underline;
}

.insights__status {
  color: var(--tinta-claro);
  margin: 0;
}

.insights__status--error {
  color: var(--alerta);
}

.insights__grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.insights__card {
  background: var(--crema);
  border-radius: 10px;
  padding: 14px;
}

.insights__card--full {
  grid-column: 1 / -1;
}

.insights__card-title {
  font-size: 15px;
  margin: 0 0 10px;
}

.insights__table {
  display: grid;
  gap: 8px;
}

.insights__row {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr auto auto;
  font-size: 12px;
}

.insights__bars {
  display: grid;
  gap: 8px;
}

.insights__bar-row {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: 34px 1fr 40px;
}

.insights__bar-label,
.insights__bar-value {
  font-size: 11px;
}

.insights__bar-track {
  background: #f3dfda;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.insights__bar {
  background: var(--europa);
  border-radius: 999px;
  height: 100%;
}

.insights__metrics {
  display: grid;
  gap: 10px;
}

.insights__metric {
  background: #fff;
  border: 1px solid var(--crema-borde);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
}

.insights__metric-label {
  color: var(--tinta-claro);
  font-size: 12px;
}

.insights__bullets p {
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 8px;
}

.insights__bullets p:last-child {
  margin-bottom: 0;
}

.insights__meta {
  color: var(--tinta-claro);
  font-size: 11px;
  margin: 8px 0 0;
}

.insights__historico {
  border: 1px solid var(--crema-borde);
  border-radius: 8px;
  overflow: hidden;
}

.insights__historico-head,
.insights__historico-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 60px 1fr 1fr 1fr;
  padding: 8px 10px;
}

.insights__historico-head {
  background: #fff;
  font-size: 11px;
  font-weight: 700;
}

.insights__historico-row {
  border-top: 1px solid var(--crema-borde);
  font-size: 11px;
}

@media (max-width: 900px) {
  .insights__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .insights__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .insights__title {
    font-size: 20px;
  }
}
</style>
