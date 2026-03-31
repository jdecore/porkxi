<template>
  <footer class="pie-pagina">
    <div class="pie-pagina__fuentes">
      <div class="pie-pagina__fuente">
        <div class="pie-pagina__fuente-titulo">🇨🇴 Colombia</div>
        <div class="pie-pagina__fuente-nota">
          Fuente periodística especializada. Los datos gubernamentales directos no están disponibles de forma actualizada.
        </div>
        <a 
          :href="detalleColombia.enlace" 
          target="_blank" 
          rel="noopener noreferrer"
          class="pie-pagina__enlace"
        >
          Porcinews — Colombia: el censo porcino registra más de 10,6 millones de animales en el país (enero 2026)
        </a>
      </div>
      <div class="pie-pagina__fuente">
        <div class="pie-pagina__fuente-titulo">🇺🇸 EE.UU.</div>
        <a 
          :href="detalleUsa.enlace" 
          target="_blank" 
          rel="noopener noreferrer"
          class="pie-pagina__enlace"
        >
          USDA NASS — Quarterly Hogs and Pigs Report, 23 dic 2025
        </a>
      </div>
    </div>
    <hr class="pie-pagina__separador" />
    <div class="pie-pagina__creditos">
      Hecho por Juan Enríquez con ayuda de IA
    </div>
    <p class="pie-pagina__creditos-nota">
      Los datos fueron curados manualmente por el investigador. La inteligencia artificial fue utilizada para construir la interfaz, pero intentó inventar información en varias ocasiones — todos los datos aquí presentes fueron verificados contra fuentes oficiales.
    </p>
    <div class="pie-pagina__marca">
      pork<span class="pie-pagina__marca-xi">ξ</span> · 2026
    </div>
  </footer>
</template>

<script setup>
import { DETALLE_COLOMBIA } from '../data/colombia';
import { DETALLE_USA } from '../data/usa';

const detalleColombia = DETALLE_COLOMBIA;
const detalleUsa = DETALLE_USA;
</script>

<style scoped>
</style>