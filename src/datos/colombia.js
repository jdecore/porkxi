export const SERIE_COLOMBIA = [
  { periodo: "2015", valor: 4400000 },
  { periodo: "2016", valor: 4700000 },
  { periodo: "2017", valor: 5100000 },
  { periodo: "2018", valor: 5500000 },
  { periodo: "2019", valor: 5900000 },
  { periodo: "2020", valor: 6200000 },
  { periodo: "2021", valor: 6500000 },
  { periodo: "2022", valor: 9658204 },
  { periodo: "2023", valor: 9658204, advertencia: true },
  { periodo: "2024", valor: 10668276, ultimoDato: true },
];

export const DETALLE_COLOMBIA = {
  fecha: "Enero 2026",
  totalCabezas: 10668276,
  totalPredios: 189198,
  traspatio: { cantidad: 148295, porcentaje: 78.38 },
  comercialFamiliar: { cantidad: 36004, porcentaje: 19.03 },
  comercialIndustrial: { cantidad: 4010, porcentaje: 2.12 },
  tecnificadas: { cantidad: 889, porcentaje: 0.47 },
  carne2024Toneladas: 608752,
  carne2024Variacion: 7.8,
  beneficio2024Cabezas: 6190195,
  beneficio2024Variacion: 7.2,
  fuente: "Porcinews",
  notaFuente: "Fuente periodística especializada. Se usa porque las entidades gubernamentales colombianas no publican datos actualizados ni tienen APIs funcionales.",
  enlace: "https://porcinews.com/colombia-el-censo-porcino-registra-mas-de-106-millones-de-animales-en-el-pais/",
};

export const PROBLEMA_DATOS_COLOMBIA = {
  descripcion: `En Colombia, acceder a información porcina oficial actualizada es prácticamente imposible por canales directos. Los datos están fragmentados entre varias entidades que no se comunican entre sí. Ninguna fuente gubernamental ofrece una API funcional. Por eso, los datos de esta visualización provienen de Porcinews, un medio periodístico especializado — no de fuentes gubernamentales directas. Eso en sí mismo es el problema.`,
  problemas: [
    {
      entidad: "ICA",
      dato: "Inventario porcino (censo)",
      problema: "Sin API. En 2023 publicó los mismos datos de 2022 sin aviso oficial.",
    },
    {
      entidad: "DANE",
      dato: "Sacrificio de ganado porcino",
      problema: "Solo disponible en PDF trimestral. Sin API.",
    },
    {
      entidad: "Porkcolombia",
      dato: "Precios y comercialización",
      problema: "Solo en informes y revistas. Sin API pública.",
    },
    {
      entidad: "INVIMA",
      dato: "Consumo por municipio",
      problema: "Solo en PDF anual. Sin API.",
    },
    {
      entidad: "datos.gov.co",
      dato: "Portal de datos abiertos",
      problema: "Requiere registro. La API no funciona de forma confiable.",
    },
  ],
};
