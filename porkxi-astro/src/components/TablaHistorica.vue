<template>
  <section class="tabla-historica">
    <h2 class="tabla-historica__titulo">Histórico año a año</h2>
    <p class="tabla-historica__subtitulo">Filas marcadas: dato duplicado o faltante.</p>
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead class="tabla__encabezado">
          <tr>
            <th>Año</th>
            <th>Colombia (cabezas)</th>
            <th>EE.UU. Dic (cabezas)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody class="tabla__cuerpo">
          <tr 
            v-for="ano in anos" 
            :key="ano"
            :class="getRowClass(ano)"
          >
            <td>{{ ano }}</td>
            <td class="tabla__cabezas">
              {{ getColombiaData(ano) }}
            </td>
            <td class="tabla__cabezas">
              {{ getUsaData(ano) }}
            </td>
            <td>
              <span v-if="ano === 2023" class="tabla__estado tabla__estado--alerta">⚠️ Dato duplicado de 2022</span>
              <span v-else-if="ano === 2024" class="tabla__estado tabla__estado--reciente">✅ Más reciente</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="tabla__pie">
      <span>Colombia: Fuente: Porcinews (enero 2026)</span>
      <span>EE.UU.: Fuente: USDA NASS</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { SERIE_COLOMBIA } from '../data/colombia';

const usaData = {
  2024: 74700000,
  2023: 74100000,
};

const anos = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

const getRowClass = (ano) => {
  if (ano === 2023) return 'tabla__fila--alerta';
  if (ano === 2024) return 'tabla__fila--reciente';
  return '';
};

const getColombiaData = (ano) => {
  const dato = SERIE_COLOMBIA.find(d => d.periodo === String(ano));
  return dato ? dato.valor.toLocaleString() : '—';
};

const getUsaData = (ano) => {
  return usaData[ano] ? usaData[ano].toLocaleString() : '—';
};
</script>

<style scoped>
</style>