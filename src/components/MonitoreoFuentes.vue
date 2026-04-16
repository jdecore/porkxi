<template>
  <div class="monitoreo">
    <div class="monitoreo__encabezado">
      <span class="monitoreo__icono">📊</span>
      <h3 class="monitoreo__titulo">Estado de las fuentes</h3>
      <span class="monitoreo__actualizacion">Actualizado: {{ fechaActualizacion }}</span>
    </div>

    <div class="monitoreo__grid">
      <div class="monitoreo__fuente monitoreo__fuente--usa">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador monitoreo__indicador--ok"></span>
          <span class="monitoreo__nombre">🇺🇸 USDA NASS</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: 23 dic 2025</span>
          <span class="monitoreo__status">✅ Actualizado</span>
        </div>
        <div class="monitoreo__proximo">
          Próximo reporte: 26 mar 2026
        </div>
      </div>

      <div class="monitoreo__fuente monitoreo__fuente--colombia">
        <div class="monitoreo__estado">
          <span class="monitoreo__indicador monitoreo__indicador--warning"></span>
          <span class="monitoreo__nombre">🇨🇴 Porcinews</span>
        </div>
        <div class="monitoreo__detalle">
          <span class="monitoreo__fecha">Último: ene 2026</span>
          <span class="monitoreo__status">⚠️ Desactualizado</span>
        </div>
        <div class="monitoreo__proximo">
          Sin fecha programada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const fechaActualizacion = '16 abr 2026'
</script>

<style scoped>
.monitoreo {
  background: white;
  border-radius: var(--radio);
  padding: 24px;
  margin: 32px 0;
  border: 1px solid var(--crema-borde);
}

.monitoreo__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.monitoreo__icono {
  font-size: 20px;
}

.monitoreo__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--tinta);
  margin: 0;
}

.monitoreo__actualizacion {
  font-size: 12px;
  color: var(--tinta-claro);
}

.monitoreo__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.monitoreo__fuente {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--crema-borde);
}

.monitoreo__fuente--usa {
  border-left: 4px solid var(--usa);
}

.monitoreo__fuente--colombia {
  border-left: 4px solid var(--colombia);
}

.monitoreo__estado {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.monitoreo__indicador {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.monitoreo__indicador--ok {
  background: #10b981;
}

.monitoreo__indicador--warning {
  background: #f59e0b;
}

.monitoreo__nombre {
  font-weight: 600;
  font-size: 14px;
}

.monitoreo__detalle {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--tinta-claro);
  margin-bottom: 8px;
}

.monitoreo__proximo {
  font-size: 11px;
  color: var(--tinta-claro);
  font-style: italic;
}

@media (max-width: 600px) {
  .monitoreo__grid {
    grid-template-columns: 1fr;
  }
}
</style>
