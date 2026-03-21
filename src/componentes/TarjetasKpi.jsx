import TarjetaKpi from './TarjetaKpi';

function TarjetasKpi() {
  return (
    <div className="tarjetas-kpi">
      <TarjetaKpi 
        color="colombia"
        etiqueta="🇨🇴 Último dato Colombia"
        valor="2024"
        descripcion="10,668,276 cabezas · Fuente: Porcinews"
      />
      <TarjetaKpi 
        color="usa"
        etiqueta="🇺🇸 Último dato EE.UU."
        valor="Dic 2025"
        descripcion="75,500,000 cabezas · Fuente: USDA NASS"
      />
      <TarjetaKpi 
        color="alerta"
        etiqueta="📅 Frecuencia de reporte"
        valor="Anual vs Trimestral"
        descripcion="COL: 1 dato/año · USA: 4 datos/año"
      />
      <TarjetaKpi 
        color="cerdo"
        etiqueta="Escala comparativa"
        valor="7.1x"
        descripcion="EE.UU. tiene 7.1 veces más cerdos que Colombia"
      />
    </div>
  );
}

export default TarjetasKpi;
