<script setup>
import { ref } from 'vue'

const generando = ref(false)

const descargarReporte = async () => {
  generando.value = true
  try {
    const response = await fetch('/reportes/radar-porcino.html')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'radar-porcino-colombia.html'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error descargando:', err)
  } finally {
    generando.value = false
  }
}
</script>

<template>
  <div class="descargar-reporte">
    <div class="descargar-reporte__header">
      <span class="descargar-reporte__icono">📄</span>
      <div class="descargar-reporte__info">
        <h3 class="descargar-reporte__titulo">Reporte descargable</h3>
        <p class="descargar-reporte__descripcion">Resumen ejecutivo del inventario porcino con análisis del mercado.</p>
      </div>
    </div>
    <button 
      class="descargar-reporte__boton" 
      @click="descargarReporte"
      :disabled="generando"
    >
      {{ generando ? 'Generando...' : 'Descargar reporte HTML' }}
    </button>
  </div>
</template>

<style scoped>
.descargar-reporte {
  background: #f5f5f5;
  border-radius: var(--radio);
  padding: 20px;
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  border: 1px solid #e0e0e0;
}

.descargar-reporte__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.descargar-reporte__icono {
  font-size: 32px;
}

.descargar-reporte__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--tinta);
}

.descargar-reporte__descripcion {
  font-size: 14px;
  color: var(--tinta-claro);
  margin: 0;
}

.descargar-reporte__boton {
  background: var(--cerdo);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.descargar-reporte__boton:hover:not(:disabled) {
  background: var(--cerdo-claro);
}

.descargar-reporte__boton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .descargar-reporte {
    flex-direction: column;
    align-items: flex-start;
  }
  .descargar-reporte__boton {
    width: 100%;
  }
}
</style>