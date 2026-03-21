import { DETALLE_COLOMBIA } from '../datos/colombia';
import { DETALLE_USA } from '../datos/usa';
import '../estilos/detalle.css';

function DetalleUltimoReporte() {
  return (
    <section className="detalle-seccion">
      <h2 className="detalle-seccion__titulo">Detalle del último reporte oficial</h2>
      <div className="detalle-grid">
        <div className="detalle-card detalle-card--colombia">
          <div className="detalle-card__aviso">
            ⚠️ Fuente: Porcinews (medio periodístico especializado). Se usa esta fuente porque las entidades gubernamentales colombianas no publican estos datos de forma actualizada ni accesible.
          </div>
          <div className="detalle-card__encabezado">
            <span className="detalle-card__icono">🇨🇴</span>
            <h3 className="detalle-card__titulo">Colombia — {DETALLE_COLOMBIA.fecha}</h3>
          </div>
          <div className="detalle-metricas">
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Total inventario</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.totalCabezas.toLocaleString()} cabezas</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Total predios</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.totalPredios.toLocaleString()}</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Predios traspatio</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.traspatio.cantidad.toLocaleString()} ({DETALLE_COLOMBIA.traspatio.porcentaje}%)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Comercial familiar</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.comercialFamiliar.cantidad.toLocaleString()} ({DETALLE_COLOMBIA.comercialFamiliar.porcentaje}%)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Comercial industrial</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.comercialIndustrial.cantidad.toLocaleString()} ({DETALLE_COLOMBIA.comercialIndustrial.porcentaje}%)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Granjas tecnificadas</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.tecnificadas.cantidad.toLocaleString()} ({DETALLE_COLOMBIA.tecnificadas.porcentaje}%)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Carne producida 2024</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.carne2024Toneladas.toLocaleString()} toneladas (+{DETALLE_COLOMBIA.carne2024Variacion}%)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Beneficio 2024</span>
              <span className="detalle-metrica__valor">{DETALLE_COLOMBIA.beneficio2024Cabezas.toLocaleString()} cabezas (+{DETALLE_COLOMBIA.beneficio2024Variacion}%)</span>
            </div>
          </div>
          <a 
            href={DETALLE_COLOMBIA.enlace} 
            target="_blank" 
            rel="noopener noreferrer"
            className="detalle-card__enlace"
          >
            Ver fuente: Porcinews
          </a>
        </div>

        <div className="detalle-card detalle-card--usa">
          <div className="detalle-card__encabezado">
            <span className="detalle-card__icono">🇺🇸</span>
            <h3 className="detalle-card__titulo">EE.UU. — 1 dic 2025</h3>
          </div>
          <p className="detalle-card__subtitulo">Publicado el {DETALLE_USA.fechaPublicacion} · USDA NASS</p>
          
          <div className="detalle-metricas">
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Total inventario</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.totalCabezas.toLocaleString()} cabezas (+{DETALLE_USA.variacionAnualPct}% vs dic 2024)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Cerdos de mercado</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.cerDosMercado.toLocaleString()}</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Reproductores</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.reproductores.toLocaleString()}</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Lechones destetados Sep-Nov</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.cerdosDestetados.toLocaleString()} (leve aumento)</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Promedio por camada</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.promedioLechonesPorCamada} lechones</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Partos previstos Dic-Feb</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.sowsFarroDicFeb.toLocaleString()} cerdas</span>
            </div>
            <div className="detalle-metrica">
              <span className="detalle-metrica__etiqueta">Partos previstos Mar-May</span>
              <span className="detalle-metrica__valor">{DETALLE_USA.sowsFarroMarMay.toLocaleString()} cerdas</span>
            </div>
          </div>

          <div className="detalle-subseccion">
            <h4 className="detalle-subseccion__titulo">Ranking de estados</h4>
            <div className="detalle-ranking">
              {DETALLE_USA.estados.map((estado, i) => (
                <div key={i} className="detalle-ranking__item">
                  <span className={`detalle-ranking__posicion detalle-ranking__posicion--${estado.posicion}`}>
                    {estado.posicion === 1 ? '🥇' : estado.posicion === 2 ? '🥈' : '🥉'}
                  </span>
                  <span className="detalle-ranking__nombre">{estado.nombre}</span>
                  <span className="detalle-ranking__cabezas">{estado.cabezas.toLocaleString()} cabezas</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detalle-subseccion">
            <h4 className="detalle-subseccion__titulo">Metodología</h4>
            <p className="detalle-metodologia">
              NASS preguntó a {DETALLE_USA.operadoresEncuestados.toLocaleString()} operadores a través de: {DETALLE_USA.metodosEncuesta.join(', ')}.
            </p>
          </div>

          <p className="detalle-proximo">Próximo reporte: {DETALLE_USA.proximoReporte}</p>

          <a 
            href={DETALLE_USA.enlace} 
            target="_blank" 
            rel="noopener noreferrer"
            className="detalle-card__enlace"
          >
            Ver reporte oficial
          </a>
        </div>
      </div>
    </section>
  );
}

export default DetalleUltimoReporte;
