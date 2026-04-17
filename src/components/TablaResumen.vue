<script setup>
const datos = [
  { ano: 2024, col: '10.7M', eu: '132M', usa: '74.7M' },
  { ano: 2023, col: '9.7M', eu: '133M', usa: '74.1M' },
  { ano: 2022, col: '9.7M', eu: '134M', usa: '' },
  { ano: 2021, col: '6.5M', eu: '142M', usa: '' },
  { ano: 2020, col: '6.2M', eu: '146M', usa: '' },
]
</script>

<template>
  <section class="tabla-resumen">
    <h2 class="tabla-resumen__titulo">Inventario por año</h2>
    <div class="tabla-resumen__wrapper">
      <table class="tabla-resumen__tabla">
        <thead>
          <tr>
            <th>Año</th>
            <th>Colombia</th>
            <th>UE-27</th>
            <th>EE.UU.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in datos" :key="d.ano">
            <td class="tabla-resumen__ano">{{ d.ano }}</td>
            <td>{{ d.col }}</td>
            <td>{{ d.eu }}</td>
            <td>{{ d.usa || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="tabla-resumen__fuentes">
      Colombia: Porcinews · UE-27: Eurostat · EE.UU.: USDA NASS
    </p>
  </section>
</template>

<style scoped>
.tabla-resumen {
  margin: 32px 0;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e4e0;
}

.tabla-resumen__titulo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--tinta);
}

.tabla-resumen__wrapper {
  overflow-x: auto;
}

.tabla-resumen__tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla-resumen__tabla th,
.tabla-resumen__tabla td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.tabla-resumen__tabla th {
  background: #f5f0ec;
  font-weight: 600;
  color: var(--tinta);
}

.tabla-resumen__ano {
  font-weight: 600;
}

.tabla-resumen__tabla tbody tr:hover {
  background: #fafafa;
}

.tabla-resumen__fuentes {
  margin: 12px 0 0;
  font-size: 11px;
  color: #888;
  text-align: center;
}
</style>