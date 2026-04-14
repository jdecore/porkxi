import { SERIE_COLOMBIA, SERIE_USA } from '../lib/datos-grafico.js';
import datosGrafico, { validarDatos } from '../lib/datos-grafico.js';

export { SERIE_COLOMBIA, SERIE_USA };

export const etiquetasMeses = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Validación de datos
export const validarDatosExport = (datos) => {
  if (!datos || typeof datos !== 'object') {
    throw new Error('Datos inválidos: se esperaba un objeto');
  }
  return true;
};

export default datosGrafico;