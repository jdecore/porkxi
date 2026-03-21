import { SERIE_COLOMBIA } from '../datos/colombia';
import { SERIE_USA } from '../datos/usa';
import '../estilos/frecuencia.css';

function ComparativaFrecuencia() {
  return (
    <div className="comparativa-frecuencia">
      <div className="frecuencia-card frecuencia-card--colombia">
        <div className="frecuencia-card__encabezado">
          <span className="frecuencia-card__icono">🇨🇴</span>
          <h3 className="frecuencia-card__titulo">Colombia</h3>
        </div>
        <span className="frecuencia-card__pildora">Anual · con retraso</span>
        <p className="frecuencia-card__descripcion">
          Los datos más recientes disponibles provienen de Porcinews, un medio especializado, porque las fuentes gubernamentales directas no están disponibles de forma actualizada ni accesible.
        </p>
        <div className="frecuencia-timeline">
          {SERIE_COLOMBIA.filter(d => d.periodo >= "2020").map((d, i) => (
            <div key={i} className="frecuencia-timeline__item">
              <span className={`frecuencia-timeline__punto frecuencia-timeline__punto--${d.advertencia ? 'alerta' : 'colombia'}`}></span>
              <div className="frecuencia-timeline__periodo">{d.periodo}</div>
              <div className={`frecuencia-timeline__valor ${d.advertencia ? 'frecuencia-timeline__valor--alerta' : ''}`}>
                {d.valor.toLocaleString()} cabezas {d.advertencia ? '⚠️ mismo dato de 2022' : d.ultimoDato ? '(Porcinews, ene 2026)' : '✅'}
              </div>
            </div>
          ))}
        </div>
        <p className="frecuencia-card__fuente">Fuente: Porcinews (enero 2026)</p>
      </div>

      <div className="frecuencia-card frecuencia-card--usa">
        <div className="frecuencia-card__encabezado">
          <span className="frecuencia-card__icono">🇺🇸</span>
          <h3 className="frecuencia-card__titulo">Estados Unidos</h3>
        </div>
        <span className="frecuencia-card__pildora">Trimestral · obligatorio por ley</span>
        <p className="frecuencia-card__descripcion">
          Reporte obligatorio bajo la Livestock Mandatory Reporting Act. Datos publicados directamente por el gobierno federal el mismo día de su publicación, con API pública y gratuita.
        </p>
        <div className="frecuencia-timeline">
          {SERIE_USA.filter(d => d.periodo >= "Mar 2025").map((d, i) => (
            <div key={i} className="frecuencia-timeline__item">
              <span className="frecuencia-timeline__punto frecuencia-timeline__punto--usa"></span>
              <div className="frecuencia-timeline__periodo">{d.periodo}</div>
              <div className="frecuencia-timeline__valor">
                {d.valor.toLocaleString()} cabezas ✅ {d.ultimoDato ? '(23 dic 2025)' : ''}
              </div>
            </div>
          ))}
          <div className="frecuencia-timeline__item">
            <span className="frecuencia-timeline__punto frecuencia-timeline__punto--futuro"></span>
            <div className="frecuencia-timeline__periodo">Mar 2026</div>
            <div className="frecuencia-timeline__valor">🔜 Sale el 26 mar 2026</div>
          </div>
        </div>
        <p className="frecuencia-card__fuente">Fuente: USDA NASS · Livestock Mandatory Reporting Act</p>
      </div>
    </div>
  );
}

export default ComparativaFrecuencia;
