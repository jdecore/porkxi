import '../estilos/encabezado.css';

function Encabezado() {
  return (
    <header className="encabezado">
      <h1 className="encabezado__logo">
        <span className="encabezado__logo-parte">pork</span>
        <span className="encabezado__logo-xi">ξ</span>
      </h1>
      <p className="encabezado__subtitulo">
        Inventario porcino Colombia vs EE.UU. — y la brecha invisible en sus datos oficiales.
      </p>
      <div className="encabezado__badges">
        <span className="encabezado__badge encabezamiento__badge--colombia">🇨🇴 Porcinews (enero 2026)</span>
        <span className="encabezado__badge encabezamiento__badge--usa">🇺🇸 USDA NASS (dic 2025)</span>
        <span className="encabezado__badge encabezamiento__badge--datos">📦 Datos verificados · Sin API</span>
      </div>
    </header>
  );
}

export default Encabezado;
