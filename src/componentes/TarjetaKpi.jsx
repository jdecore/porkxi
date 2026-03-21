import '../estilos/tarjetas.css';

function TarjetaKpi({ etiqueta, valor, descripcion, color }) {
  return (
    <div className={`tarjeta-kpi tarjeta-kpi--${color}`}>
      <div className="tarjeta-kpi__etiqueta">{etiqueta}</div>
      <div className="tarjeta-kpi__valor">{valor}</div>
      <div className="tarjeta-kpi__descripcion">{descripcion}</div>
    </div>
  );
}

export default TarjetaKpi;
