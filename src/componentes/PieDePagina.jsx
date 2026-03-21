import { DETALLE_COLOMBIA } from '../datos/colombia';
import { DETALLE_USA } from '../datos/usa';
import '../estilos/pieDepagina.css';

function PieDePagina() {
  return (
    <footer className="pie-pagina">
      <div className="pie-pagina__fuentes">
        <div className="pie-pagina__fuente">
          <div className="pie-pagina__fuente-titulo">🇨🇴 Colombia</div>
          <div className="pie-pagina__fuente-nota">
            Fuente periodística especializada. Los datos gubernamentales directos no están disponibles de forma actualizada.
          </div>
          <a 
            href={DETALLE_COLOMBIA.enlace} 
            target="_blank" 
            rel="noopener noreferrer"
            className="pie-pagina__enlace"
          >
            Porcinews — Colombia: el censo porcino registra más de 10,6 millones de animales en el país (enero 2026)
          </a>
        </div>
        <div className="pie-pagina__fuente">
          <div className="pie-pagina__fuente-titulo">🇺🇸 EE.UU.</div>
          <a 
            href={DETALLE_USA.enlace} 
            target="_blank" 
            rel="noopener noreferrer"
            className="pie-pagina__enlace"
          >
            USDA NASS — Quarterly Hogs and Pigs Report, 23 dic 2025
          </a>
        </div>
      </div>
      <hr className="pie-pagina__separador" />
      <div className="pie-pagina__creditos">
        Hecho por Juan Enríquez con ayuda de IA
      </div>
      <p className="pie-pagina__creditos-nota">
        Los datos fueron curados manualmente por el investigador. La inteligencia artificial fue utilizada para construir la interfaz, pero intentó inventar información en varias ocasiones — todos los datos aquí presentes fueron verificados contra fuentes oficiales.
      </p>
      <div className="pie-pagina__marca">
        pork<span className="pie-pagina__marca-xi">ξ</span> · 2026
      </div>
    </footer>
  );
}

export default PieDePagina;
