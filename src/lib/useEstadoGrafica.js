import { ref, computed } from 'vue';
import { serieColombia, serieUSA, serieEuropa } from '../lib/datos-grafico.js';

const paisActivo = ref('todos');
const datosValidados = ref({ colombia: [], usa: [], europa: [] });
const isHydrated = ref(false);

const paisOptions = [
  { value: 'colombia', label: 'Colombia' },
  { value: 'europa', label: 'Europa (UE-27)' },
  { value: 'usa', label: 'EE.UU.' },
  { value: 'todos', label: 'Todos' }
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
      europa: serieEuropa.map((d) => ({
        periodo: d.periodo,
        valor: d.valor / 1e6,
        valorReal: d.valor,
        ultimoDato: d.ultimoDato || false,
      })),
    };
    isHydrated.value = true;
  };

  const seriesActivas = computed(() => {
    if (paisActivo.value === 'colombia') return [datosValidados.value.colombia];
    if (paisActivo.value === 'usa') return [datosValidados.value.usa];
    if (paisActivo.value === 'europa') return [datosValidados.value.europa];
    return [
      datosValidados.value.colombia,
      datosValidados.value.usa,
      datosValidados.value.europa,
    ];
  });

  const maximo = computed(() => {
    const valores = seriesActivas.value.flatMap((serie) => serie.map((p) => p.valor));
    const maxValor = Math.max(...valores, 1);
    return Math.ceil(maxValor / 20) * 20;
  });

  const dataByPais = computed(() => {
    if (paisActivo.value === 'colombia') return datosValidados.value.colombia;
    if (paisActivo.value === 'usa') return datosValidados.value.usa;
    if (paisActivo.value === 'europa') return datosValidados.value.europa;
    return [
      ...datosValidados.value.colombia,
      ...datosValidados.value.usa,
      ...datosValidados.value.europa,
    ];
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
    seriesActivas,
  };
}

export default useEstadoGrafica;
