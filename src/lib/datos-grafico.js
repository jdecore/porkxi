import {
  SERIE_COLOMBIA,
  DETALLE_COLOMBIA,
  PROBLEMA_DATOS_COLOMBIA,
} from '../data/colombia.js';
import { SERIE_USA, DETALLE_USA } from '../data/usa.js';
import { SERIE_EUROPA, DETALLE_EUROPA } from '../data/europa.js';

export const serieColombia = SERIE_COLOMBIA;
export const serieUSA = SERIE_USA;
export const serieEuropa = SERIE_EUROPA;

export const DETALLE_COLOMBIA_DATA = DETALLE_COLOMBIA;
export const DETALLE_USA_DATA = DETALLE_USA;
export const DETALLE_EUROPA_DATA = DETALLE_EUROPA;
export const PROBLEMA_DATOS_COLOMBIA_DATA = PROBLEMA_DATOS_COLOMBIA;

const processData = (serie) =>
  serie.map((d) => ({
    periodo: d.periodo,
    valor: d.valor,
    valorReal: d.valor,
    ...(d.advertencia && { advertencia: d.advertencia }),
    ...(d.ultimoDato && { ultimoDato: d.ultimoDato }),
  }));

export const formatPoints = (data) => processData(data);

export const validarDatos = (datos) => {
  if (!datos || typeof datos !== 'object') {
    throw new Error('Datos inválidos: se esperaba un objeto');
  }
  return true;
};

export const getColombiaPoints = () => processData(SERIE_COLOMBIA);
export const getUsaPoints = () => processData(SERIE_USA);
export const getEuropaPoints = () => processData(SERIE_EUROPA);

export const getMaxValor = (serie) => Math.max(...serie.map((d) => d.valor), 0);

export const calculatePoints = (data, areaWidth, areaHeight, maxValue) => {
  if (!data || data.length === 0) return [];

  const padding = 42;
  const chartWidth = areaWidth - padding * 2;
  const chartHeight = areaHeight - padding * 2;

  return data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * chartWidth + padding;
    const y = areaHeight - (d.valor / maxValue) * chartHeight - padding / 2;
    return { x, y };
  });
};

export const datosGrafico = {
  serieColombia: processData(SERIE_COLOMBIA),
  serieUSA: processData(SERIE_USA),
  serieEuropa: processData(SERIE_EUROPA),
  formatPoints,
  validarDatos,
  getColombiaPoints,
  getUsaPoints,
  getEuropaPoints,
  getMaxValor,
  calculatePoints,
};

export default datosGrafico;
