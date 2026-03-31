<template>
  <div class="comparativa-frecuencia">
    <div class="frecuencia-card frecuencia-card--colombia">
      <div class="frecuencia-card__encabezado">
        <span class="frecuencia-card__icono">🇨🇴</span>
        <h3 class="frecuencia-card__titulo">Colombia</h3>
      </div>
      <span class="frecuencia-card__pildora">Anual · con retraso</span>
      <p class="frecuencia-card__descripcion">
        Los datos más recientes disponibles provienen de Porcinews, un medio especializado, porque las fuentes gubernamentales directas no están disponibles de forma actualizada ni accesible.
      </p>
      <div class="frecuencia-timeline">
        <div 
          v-for="(d, i) in colombiaRecientes" 
          :key="i" 
          class="frecuencia-timeline__item"
        >
          <span 
            class="frecuencia-timeline__punto"
            :class="d.advertencia ? 'frecuencia-timeline__punto--alerta' : 'frecuencia-timeline__punto--colombia'"
          ></span>
          <div class="frecuencia-timeline__periodo">{{ d.periodo }}</div>
          <div 
            class="frecuencia-timeline__valor"
            :class="d.advertencia ? 'frecuencia-timeline__valor--alerta' : ''"
          >
            {{ d.valor.toLocaleString() }} cabezas 
            <template v-if="d.advertencia">⚠️ mismo dato de 2022</template>
            <template v-else-if="d.ultimoDato">(Porcinews, ene 2026)</template>
            <template v-else>✅</template>
          </div>
        </div>
      </div>
      <p class="frecuencia-card__fuente">Fuente: Porcinews (enero 2026)</p>
    </div>

    <div class="frecuencia-card frecuencia-card--usa">
      <div class="frecuencia-card__encabezado">
        <span class="frecuencia-card__icono">🇺🇸</span>
        <h3 class="frecuencia-card__titulo">Estados Unidos</h3>
      </div>
      <span class="frecuencia-card__pildora">Trimestral · obligatorio por ley</span>
      <p class="frecuencia-card__descripcion">
        Reporte obligatorio bajo la Livestock Mandatory Reporting Act. Datos publicados directamente por el gobierno federal el mismo día de su publicación, con API pública y gratuita.
      </p>
      <div class="frecuencia-timeline">
        <div 
          v-for="(d, i) in usaRecientes" 
          :key="i" 
          class="frecuencia-timeline__item"
        >
          <span class="frecuencia-timeline__punto frecuencia-timeline__punto--usa"></span>
          <div class="frecuencia-timeline__periodo">{{ d.periodo }}</div>
          <div class="frecuencia-timeline__valor">
            {{ d.valor.toLocaleString() }} cabezas ✅ 
            <template v-if="d.ultimoDato">(23 dic 2025)</template>
          </div>
        </div>
        <div class="frecuencia-timeline__item">
          <span class="frecuencia-timeline__punto frecuencia-timeline__punto--futuro"></span>
          <div class="frecuencia-timeline__periodo">Mar 2026</div>
          <div class="frecuencia-timeline__valor">🔜 Sale el 26 mar 2026</div>
        </div>
      </div>
      <p class="frecuencia-card__fuente">Fuente: USDA NASS · Livestock Mandatory Reporting Act</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { SERIE_COLOMBIA } from '../data/colombia';
import { SERIE_USA } from '../data/usa';

const colombiaRecientes = computed(() => SERIE_COLOMBIA.filter(d => d.periodo >= "2020"));
const usaRecientes = computed(() => SERIE_USA.filter(d => d.periodo >= "Mar 2025"));
</script>

<style scoped>
</style>