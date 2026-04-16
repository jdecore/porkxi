<template>
  <div class="analisis-ia">
    <div class="analisis-ia__encabezado">
      <span class="analisis-ia__icono">🤖</span>
      <h3 class="analisis-ia__titulo">Análisis automático con IA</h3>
      <button 
        v-if="!cargando && !error" 
        @click="generarAnalisis"
        class="analisis-ia__boton"
      >
        {{ analisis ? 'Regenerar' : 'Generar análisis' }}
      </button>
    </div>

    <div v-if="cargando" class="analisis-ia__cargando">
      <div class="analisis-ia__spinner"></div>
      <span>Generando análisis de tendencias...</span>
    </div>

    <div v-if="error" class="analisis-ia__error">
      ⚠️ No se pudo generar el análisis. Inténtalo de nuevo.
    </div>

    <div v-if="analisis" class="analisis-ia__contenido">
      <p class="analisis-ia__texto">{{ analisis }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { serieColombia, serieUSA } from '../lib/datos-grafico.js'

const cargando = ref(false)
const error = ref(false)
const analisis = ref('')

const generarAnalisis = async () => {
  cargando.value = true
  error.value = false

  // Datos resumidos para el prompt
  const ultimoColombia = serieColombia[serieColombia.length - 1]
  const ultimoUsa = serieUSA[serieUSA.length - 1]
  const ratio = (ultimoUsa.valor / ultimoColombia.valor).toFixed(1)

  const prompt = `
Analiza estos datos de inventario porcino y da un resumen objetivo en español de 3 frases:

- Colombia: ${ultimoColombia.valor.toLocaleString()} cabezas, actualizado ${ultimoColombia.periodo}
- EE.UU.: ${ultimoUsa.valor.toLocaleString()} cabezas, actualizado ${ultimoUsa.periodo}
- Relación: EE.UU. tiene ${ratio} veces más cerdos que Colombia
- Frecuencia: Colombia reporta anualmente, EE.UU. trimestralmente

Menciona 1) la diferencia de escala, 2) la diferencia de transparencia, 3) una conclusión breve.
Sé conciso y profesional.
  `

  try {
    const respuesta = await fetch('/api/analisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    if (!respuesta.ok) throw new Error('No se pudo generar análisis')

    const datos = await respuesta.json()
    if (!datos?.text) throw new Error('Respuesta inválida de IA')
    analisis.value = datos.text.trim()
  } catch (e) {
    error.value = true
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.analisis-ia {
  background: white;
  border-radius: var(--radio);
  padding: 24px;
  margin: 32px 0;
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
