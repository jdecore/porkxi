<template>
  <section class="explicacion">
    <h2 class="explicacion__titulo">¿Por qué existe esta brecha?</h2>
    <div class="explicacion__grid">
      <div class="explicacion-columna explicacion-columna--colombia">
        <h3 class="explicacion-columna__titulo">🇨🇴 Colombia — Cuando el gobierno no publica, se recurre a terceros</h3>
        <p class="explicacion-columna__texto">
          En Colombia, acceder a información porcina oficial actualizada es prácticamente imposible por canales directos. Los datos están fragmentados entre el ICA, el DANE, Porkcolombia y el INVIMA — entidades que no se comunican entre sí y ninguna de las cuales ofrece una API funcional.
        </p>
        <p class="explicacion-columna__texto">
          El portal de datos abiertos del gobierno (datos.gov.co) requiere registro y su API no responde. En 2023, el ICA publicó exactamente los mismos datos de 2022 sin ningún aviso oficial, por fallas en el SIVIP (Sistema de Identificación y Vacunación de Porcinos).
        </p>
        <div class="explicacion-destacado">
          Por eso, los datos de Colombia en esta visualización provienen de Porcinews, un medio periodístico especializado — no de fuentes gubernamentales. Que la fuente más actualizada disponible sea un medio de comunicación, y no una entidad del Estado, es en sí mismo el problema que esta página busca evidenciar.
        </div>
        <div class="explicacion-tabla">
          <table>
            <thead>
              <tr>
                <th>Entidad</th>
                <th>Qué publica</th>
                <th>Problema</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prob, i) in problemasColombia" :key="i">
                <td>{{ prob.entidad }}</td>
                <td>{{ prob.dato }}</td>
                <td>
                  <div class="explicacion-tabla__problema">
                    <span class="explicacion-tabla__problema-icono">⚠️</span>
                    <span>{{ prob.problema }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="explicacion-columna explicacion-columna--usa">
        <h3 class="explicacion-columna__titulo">🇺🇸 EE.UU. — Datos obligatorios por ley</h3>
        <p class="explicacion-columna__texto">
          La Livestock Mandatory Reporting Act obliga a todas las plantas procesadoras con más de 100,000 cerdos anuales a reportar datos al USDA. Esto genera datos trimestrales verificables y de cumplimiento obligatorio. El USDA NASS preguntó a 5,752 operadores en diciembre de 2025 usando múltiples canales: portal en línea, correo, teléfono y entrevistas presenciales. Todos los reportes son públicos, gratuitos y están disponibles en línea el mismo día de su publicación.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { PROBLEMA_DATOS_COLOMBIA } from '../data/colombia';

const problemasColombia = PROBLEMA_DATOS_COLOMBIA.problemas;
</script>

<style scoped>
</style>