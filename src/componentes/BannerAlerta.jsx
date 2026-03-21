import '../estilos/alerta.css';

function BannerAlerta() {
  return (
    <div className="banner-alerta">
      <span className="banner-alerta__icono">⚠️</span>
      <p className="banner-alerta__texto">
        En EE.UU., el USDA NASS publica datos de inventario porcino cada trimestre desde fuentes gubernamentales directas — el último salió el 23 de diciembre de 2025. En Colombia, los datos oficiales no son fáciles de acceder: están fragmentados, desactualizados o sin API funcional. El último dato disponible proviene de Porcinews, un medio especializado, porque las entidades del gobierno colombiano no lo publican de forma accesible.
      </p>
    </div>
  );
}

export default BannerAlerta;
