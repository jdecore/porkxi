import { SERIE_COLOMBIA, DETALLE_COLOMBIA, PROBLEMA_DATOS_COLOMBIA } from '../data/colombia.js';
import { SERIE_USA } from '../data/usa.js';

export const serieColombia = SERIE_COLOMBIA;
export const serieUSA = SERIE_USA;

export const DETALLE_COLOMBIA_DATA = DETALLE_COLOMBIA;
export const PROBLEMA_DATOS_COLOMBIA_DATA = PROBLEMA_DATOS_COLOMBIA;

export const etiquetasMeses = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Función para normalizar y calcular puntos de gráfica
export const formatPoints = (data) => {
  return data.map(d => ({
    periodo: d.periodo,
    valor: d.valor,
    valorReal: d.valor,
    ...(d.advertencia && { advertencia: d.advertencia })
  }));
};

// Validación de datos
export const validarDatos = (datos) => {
  if (!datos || typeof datos !== 'object') {
    throw new Error('Datos inválidos: se esperaba un objeto');
  }
  return true;
};

// Procesamiento de datos para gráfica
const processData = (serie) => {
  return serie.map((d, i) => ({
    periodo: d.periodo,
    valor: d.valor,
    valorReal: d.valor,
    ...(d.advertencia && { advertencia: d.advertencia })
  }));
};

export const getColombiaPoints = () => processData(SERIE_COLOMBIA);
export const getUsaPoints = () => processData(SERIE_USA);

// Obtener etiquetas de periodos
export const getPeriodos = () => {
  return SERIE_COLOMBIA.map(d => d.periodo);
};

// Obtener valor máximo para el eje Y
export const getMaxValor = (serie) => {
  return Math.max(...serie.map(d => d.valor), 0);
};

// Calcular puntos SVG para la gráfica
export const calculatePoints = (data, areaWidth, areaHeight, maxValue) => {
  if (!data || data.length === 0) return [];
  
  const padding = 42;
  const chartWidth = areaWidth - (padding * 2);
  const chartHeight = areaHeight - (padding * 2);
  
  return data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding;
    const y = areaHeight - ((d.valor / maxValue) * chartHeight + padding / 2);
    return { x, y };
  });
};

// Datos normalizados para gráficos - SINGLE SOURCE OF TRUTH
export const datosGrafico = {
  serieColombia: processData(SERIE_COLOMBIA),
  serieUSA: processData(SERIE_USA),
  formatPoints,
  validarDatos,
  getColombiaPoints,
  getUsaPoints,
  getPeriodos,
  getMaxValor,
  calculatePoints,
};

export default datosGrafico;