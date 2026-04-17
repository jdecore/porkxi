export const SERIE_EUROPA = [
  { periodo: '2015', valor: 144324030 },
  { periodo: '2016', valor: 142649620 },
  { periodo: '2017', valor: 145543550 },
  { periodo: '2018', valor: 143518560 },
  { periodo: '2019', valor: 143146160 },
  { periodo: '2020', valor: 145918600 },
  { periodo: '2021', valor: 141681380 },
  { periodo: '2022', valor: 134410040 },
  { periodo: '2023', valor: 132845670 },
  { periodo: '2024', valor: 132135520, ultimoDato: true },
];

export const DETALLE_EUROPA = {
  fechaDato: 'Nov-Dic 2024',
  fechaActualizacionApi: '09 abr 2026',
  totalCabezas: 132135520,
  variacionAnualPct: -0.5,
  frecuencia: 'Anual',
  cobertura: 'EU27_2020',
  unidad: 'THS_HD (miles de cabezas)',
  fuente: 'Eurostat',
  dataset: 'apro_mt_lspig',
  enlace:
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/apro_mt_lspig?geo=EU27_2020&animals=A3100&unit=THS_HD&month=M11_M12&sinceTimePeriod=2015',
  notaFuente:
    'Serie anual oficial publicada por Eurostat y accesible mediante API pública.',
};
