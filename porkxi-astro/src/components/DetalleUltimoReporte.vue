<template>
  <section class="detalle-seccion">
    <h2 class="detalle-seccion__titulo">Detalle del último reporte oficial</h2>
    <div class="detalle-grid">
      <div class="detalle-card detalle-card--colombia">
        <div class="detalle-card__aviso">
          ⚠️ Fuente: Porcinews (medio periodístico especializado). Se usa esta fuente porque las entidades gubernamentales colombianas no publican estos datos de forma actualizada ni accesible.
        </div>
        <div class="detalle-card__encabezado">
          <span class="detalle-card__icono">🇨🇴</span>
          <h3 class="detalle-card__titulo">Colombia — {{ detalleColombia.fecha }}</h3>
        </div>
        <div class="detalle-metricas">
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Total inventario</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.totalCabezas.toLocaleString() }} cabezas</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Total predios</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.totalPredios.toLocaleString() }}</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Predios traspatio</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.traspatio.cantidad.toLocaleString() }} ({{ detalleColombia.traspatio.porcentaje }}%)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Comercial familiar</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.comercialFamiliar.cantidad.toLocaleString() }} ({{ detalleColombia.comercialFamiliar.porcentaje }}%)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Comercial industrial</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.comercialIndustrial.cantidad.toLocaleString() }} ({{ detalleColombia.comercialIndustrial.porcentaje }}%)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Granjas tecnificadas</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.tecnificadas.cantidad.toLocaleString() }} ({{ detalleColombia.tecnificadas.porcentaje }}%)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Carne producida 2024</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.carne2024Toneladas.toLocaleString() }} toneladas (+{{ detalleColombia.carne2024Variacion }}%)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Beneficio 2024</span>
            <span class="detalle-metrica__valor">{{ detalleColombia.beneficio2024Cabezas.toLocaleString() }} cabezas (+{{ detalleColombia.beneficio2024Variacion }}%)</span>
          </div>
        </div>
        <a 
          :href="detalleColombia.enlace" 
          target="_blank" 
          rel="noopener noreferrer"
          class="detalle-card__enlace"
        >
          Ver fuente: Porcinews
        </a>
      </div>

      <div class="detalle-card detalle-card--usa">
        <div class="detalle-card__encabezado">
          <span class="detalle-card__icono">🇺🇸</span>
          <h3 class="detalle-card__titulo">EE.UU. — 1 dic 2025</h3>
        </div>
        <p class="detalle-card__subtitulo">Publicado el {{ detalleUsa.fechaPublicacion }} · USDA NASS</p>
        
        <div class="detalle-metricas">
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Total inventario</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.totalCabezas.toLocaleString() }} cabezas (+{{ detalleUsa.variacionAnualPct }}% vs dic 2024)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Cerdos de mercado</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.cerDosMercado.toLocaleString() }}</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Reproductores</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.reproductores.toLocaleString() }}</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Lechones destetados Sep-Nov</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.cerdosDestetados.toLocaleString() }} (leve aumento)</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Promedio por camada</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.promedioLechonesPorCamada }} lechones</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Partos previstos Dic-Feb</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.sowsFarroDicFeb.toLocaleString() }} cerdas</span>
          </div>
          <div class="detalle-metrica">
            <span class="detalle-metrica__etiqueta">Partos previstos Mar-May</span>
            <span class="detalle-metrica__valor">{{ detalleUsa.sowsFarroMarMay.toLocaleString() }} cerdas</span>
          </div>
        </div>

        <div class="detalle-subseccion">
          <h4 class="detalle-subseccion__titulo">Ranking de estados</h4>
          <div class="detalle-ranking">
            <div 
              v-for="(estado, i) in detalleUsa.estados" 
              :key="i" 
              class="detalle-ranking__item"
            >
              <span 
                class="detalle-ranking__posicion"
                :class="`detalle-ranking__posicion--${estado.posicion}`"
              >
                {{ estado.posicion === 1 ? '🥇' : estado.posicion === 2 ? '🥈' : '🥉' }}
              </span>
              <span class="detalle-ranking__nombre">{{ estado.nombre }}</span>
              <span class="detalle-ranking__cabezas">{{ estado.cabezas.toLocaleString() }} cabezas</span>
            </div>
          </div>
        </div>

        <div class="detalle-subseccion">
          <h4 class="detalle-subseccion__titulo">Metodología</h4>
          <p class="detalle-metodologia">
            NASS preguntó a {{ detalleUsa.operadoresEncuestados.toLocaleString() }} operadores a través de: {{ metodosUsa }}.
          </p>
        </div>

        <p class="detalle-proximo">Próximo reporte: {{ detalleUsa.proximoReporte }}</p>

        <a 
          :href="detalleUsa.enlace" 
          target="_blank" 
          rel="noopener noreferrer"
          class="detalle-card__enlace"
        >
          Ver reporte oficial
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { DETALLE_COLOMBIA } from '../data/colombia';
import { DETALLE_USA } from '../data/usa';

const detalleColombia = DETALLE_COLOMBIA;
const detalleUsa = DETALLE_USA;
const metodosUsa = computed(() => detalleUsa.metodosEncuesta.join(', '));
</script>

<style scoped>
</style>