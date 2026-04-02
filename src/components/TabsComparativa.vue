<template>
  <div class="comparativa-frecuencia">
    <div class="comparativa-tabs">
      <button
        class="comparativa-tab"
        :class="{ 'comparativa-tab--activo': tabActiva === 'colombia' }"
        @click="tabActiva = 'colombia'"
      >🇨🇴 Colombia</button>
      <button
        class="comparativa-tab"
        :class="{ 'comparativa-tab--activo': tabActiva === 'usa' }"
        @click="tabActiva = 'usa'"
      >🇺🇸 EE.UU.</button>
      <button
        class="comparativa-tab"
        :class="{ 'comparativa-tab--activo': tabActiva === 'ambos' }"
        @click="tabActiva = 'ambos'"
      >📊 Ambos</button>
    </div>

    <Transition name="fade" mode="out-in">
      <div class="frecuencia-card frecuencia-card--colombia" v-if="tabActiva === 'colombia' || tabActiva === 'ambos'" :key="'col'">
        <div class="frecuencia-card__encabezado">
          <span class="frecuencia-card__icono">🇨🇴</span>
          <h3 class="frecuencia-card__titulo">Colombia</h3>
        </div>
        <span class="frecuencia-card__pildora">Anual · con retraso</span>
        <p class="frecuencia-card__descripcion">Los datos más recientes provienen de Porcinews, un medio especializado.</p>
        <div class="frecuencia-timeline">
          <div
            class="frecuencia-timeline__item"
            v-for="(d, i) in colombia"
            :key="d.periodo"
            :style="{ animationDelay: `${i * 0.08}s` }"
          >
            <span
              class="frecuencia-timeline__punto"
              :class="d.advertencia ? 'frecuencia-timeline__punto--alerta' : 'frecuencia-timeline__punto--colombia'"
            ></span>
            <div class="frecuencia-timeline__periodo">{{ d.periodo }}</div>
            <div
              class="frecuencia-timeline__valor"
              :class="{ 'frecuencia-timeline__valor--alerta': d.advertencia }"
            >
              {{ d.valor.toLocaleString() }} cabezas
              <template v-if="d.advertencia">⚠️ mismo dato de 2022</template>
              <template v-else-if="d.ultimoDato">(Porcinews, ene 2026)</template>
              <template v-else>✓</template>
            </div>
          </div>
        </div>
        <p class="frecuencia-card__fuente">Fuente: Porcinews (enero 2026)</p>
      </div>
    </Transition>

    <Transition name="fade" mode="out-in">
      <div class="frecuencia-card frecuencia-card--usa" v-if="tabActiva === 'usa' || tabActiva === 'ambos'" :key="'usa'">
        <div class="frecuencia-card__encabezado">
          <span class="frecuencia-card__icono">🇺🇸</span>
          <h3 class="frecuencia-card__titulo">Estados Unidos</h3>
        </div>
        <span class="frecuencia-card__pildora">Trimestral · obligatorio por ley</span>
        <p class="frecuencia-card__descripcion">Reporte obligatorio bajo la Livestock Mandatory Reporting Act.</p>
        <div class="frecuencia-timeline">
          <div
            class="frecuencia-timeline__item"
            v-for="(d, i) in usa"
            :key="d.periodo"
            :style="{ animationDelay: `${i * 0.08}s` }"
          >
            <span class="frecuencia-timeline__punto frecuencia-timeline__punto--usa"></span>
            <div class="frecuencia-timeline__periodo">{{ d.periodo }}</div>
            <div class="frecuencia-timeline__valor">
              {{ d.valor.toLocaleString() }} cabezas ✓
              <template v-if="d.ultimoDato">(23 dic 2025)</template>
            </div>
          </div>
          <div class="frecuencia-timeline__item">
            <span class="frecuencia-timeline__punto frecuencia-timeline__punto--futuro"></span>
            <div class="frecuencia-timeline__periodo">Mar 2026</div>
            <div class="frecuencia-timeline__valor">🔜 Sale el 26 mar 2026</div>
          </div>
        </div>
        <p class="frecuencia-card__fuente">Fuente: USDA NASS</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  colombia: { type: Array, required: true },
  usa: { type: Array, required: true },
});

const tabActiva = ref('ambos');
</script>
