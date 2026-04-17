<script setup>
import { computed, onMounted, ref } from 'vue'

const cargando = ref(true)
const error = ref(false)
const analisis = ref('')
const descargando = ref(false)
const datosWeb = ref(null)

const cargarDatosWeb = async () => {
  try {
    const res = await fetch('/data/inventario-unificado.json')
    datosWeb.value = await res.json()
  } catch (err) {
    console.error('Error:', err)
  }
}

const fuenteTexto = computed(() => {
  return '📊 Datos oficiales en tiempo real'
})

const descargarReporte = async () => {
  descargando.value = true
  try {
    const response = await fetch('/reportes/radar-porcino.html')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reporte-porcino-colombia.html'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    descargando.value = false
  }
}

const datosColombia = {
  total: 10668276,
  predios: 189198,
  traspatio: 78.38,
  familiar: 19.03,
  industrial: 2.12,
  tecnificadas: 0.47,
  carne: 608752,
  variacionCarne: 7.8,
}

const datosEuropa = {
  total: 132135520,
  variacion: -0.5,
}

const datosUsa = {
  total: 75500000,
  mercado: 69600000,
  reproductores: 5950000,
  camada: 11.93,
  variacion: 1,
}

const generarAnalisisLocal = async () => {
  if (cargando.value) return
  
  cargando.value = true

  await cargarDatosWeb()
  
  const d = datosWeb.value
  if (!d) {
    analisis.value = 'Error cargando datos'
    cargando.value = false
    return
  }

  const col = d.Colombia
  const eu = d.europa
  const usa = d.usa

  const colUlt = col.serie[col.serie.length - 1]
  const colAnt = col.serie[col.serie.length - 2]
  const euUlt = eu.serie[eu.serie.length - 1]
  const usaUlt = usa.serie[usa.serie.length - 1]
  
  const crecimientoCol = ((colUlt.valor - colAnt.valor) / colAnt.valor * 100).toFixed(1)
  const ratioColEu = (euUlt.valor / colUlt.valor).toFixed(1)
  const ratioColUsa = (usaUlt.valor / colUlt.valor).toFixed(1)

  const analisisBase = `Colombia registra ${(colUlt.valor/1e6).toFixed(1)} millones de cerdas en ${col.detalle.predios.toLocaleString()} predios, con un crecimiento del +${crecimientoCol}% respecto a 2023. La estructura muestra ${col.detalle.traspatio.porcentaje}% en traspatio, ${col.detalle.familiar.porcentaje}% en explotaciones familiares y solo ${col.detalle.industrial.porcentaje}% en industria.`

  const analisisOpciones = [
    ` La UE-27 lidera con ${(euUlt.valor/1e6).toFixed(0)} millones (${ratioColEu}x Colombia) mientras EE.UU. alcanza ${(usaUlt.valor/1e6).toFixed(1)} millones (${ratioColUsa}x). La brecha real está en la transparencia: Europa y USA publican datos oficiales vía API, mientras Colombia carece de fuente gubernamental consolidada.`,
    ` El contraste con ${(euUlt.valor/1e6).toFixed(0)}M de la UE-27 y ${(usaUlt.valor/1e6).toFixed(1)}M de USA evidencia la oportunidad de crecimiento. Sin datos abiertos, los productores colombianostrabajan sin información oficial actualizada.`,
    ` Mientras Europa y Estados Unidos publican series históricas verificables, Colombia depende de medios especializados. Esta fragmentación limita la capacidad de análisis estratégico del sector porcino nacional.`
  ]

  analisis.value = analisisBase + analisisOpciones[Math.floor(Math.random() * analisisOpciones.length)]
  cargando.value = false
}

onMounted(async () => {
  await cargarDatosWeb()
  void generarAnalisisLocal()
})
</script>

<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">⚡</span>
      <h3 class="analisis-ia__titulo">Análisis con IA</h3>
      <button v-if="!cargando" @click="generarAnalisisLocal" class="analisis-ia__boton">
        ↻
      </button>
    </div>

    <div v-if="cargando" class="analisis-ia__cargando">
      <div class="analisis-ia__spinner"></div>
      <span>Cargando datos...</span>
    </div>

    <div v-else-if="error" class="analisis-ia__error">
      ⚠️ Error cargando modelo. Usando análisis predefinido.
    </div>

    <div v-else class="analisis-ia__contenido">
      <p class="analisis-ia__texto">{{ analisis }}</p>
      <div class="analisis-ia__footer">
        <p class="analisis-ia__meta">✅ {{ fuenteTexto }}</p>
        <button class="analisis-ia__descarga" @click="descargarReporte" :disabled="descargando">
          {{ descargando ? '⬇ Descargando...' : '📄 Descargar reporte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analisis-ia {
  background: var(--crema);
  border-radius: var(--radio);
  padding: 20px;
  margin: 24px 0;
  border: 1px solid var(--crema-borde);
}

.analisis-ia__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.analisis-ia__icono {
  font-size: 24px;
}

.analisis-ia__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--tinta);
  margin: 0;
}

.analisis-ia__boton {
  background: var(--cerdo);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__boton:hover {
  background: var(--cerdo-claro);
}

.analisis-ia__cargando {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--tinta-claro);
  font-size: 14px;
}

.analisis-ia__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--crema-borde);
  border-top-color: var(--cerdo);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.analisis-ia__error {
  color: var(--alerta);
  font-size: 14px;
  padding: 12px;
  background: var(--alerta-fondo);
  border-radius: 8px;
}

.analisis-ia__contenido {
  background: var(--crema);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--cerdo);
}

.analisis-ia__texto {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--tinta);
}

.analisis-ia__meta {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--tinta-claro);
}

.analisis-ia__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--crema-borde);
}

.analisis-ia__descarga {
  background: var(--cerdo);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.analisis-ia__descarga:hover:not(:disabled) {
  background: var(--cerdo-claro);
}

.analisis-ia__descarga:disabled {
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 700px) {
  .analisis-ia__encabezado {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
