import { ref, computed } from 'vue';
import { serieColombia, serieUSA } from '../lib/datos-grafico.js';

const paisActivo = ref('colombia');
const datosValidados = ref({ colombia: [], usa: [] });
const isHydrated = ref(false);

const paisOptions = [
  { value: 'colombia', label: 'Colombia' },
  { value: 'usa', label: 'EE.UU.' },
  { value: 'ambos', label: 'Ambos' }
];

export function useEstadoGrafica() {
  const setPais = (pais) => {
    paisActivo.value = pais;
  };

  const initDatos = () => {
    datosValidados.value = {
      colombia: serieColombia.map((d) => ({
        periodo: d.periodo,
        valor: d.valor / 1e6,
        valorReal: d.valor,
        advertencia: d.advertencia || false,
      })),
      usa: serieUSA.map((d) => ({
        periodo: d.periodo,
        valor: d.valor / 1e6,
        valorReal: d.valor,
        ultimoDato: d.ultimoDato || false,
      })),
    };
    isHydrated.value = true;
  };

  const maximo = computed(() => {
    if (paisActivo.value === 'colombia') return 12;
    return 80;
  });

  const dataByPais = computed(() => {
    if (paisActivo.value === 'colombia') return datosValidados.value.colombia;
    if (paisActivo.value === 'usa') return datosValidados.value.usa;
    return [...datosValidados.value.colombia, ...datosValidados.value.usa];
  });

  return {
    paisActivo,
    datosValidados,
    paisOptions,
    paisActivoComputed: paisActivo,
    isHydrated,
    setPais,
    initDatos,
    maximo,
    dataByPais,
  };
}

export default useEstadoGrafica;