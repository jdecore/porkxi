import { SERIE_COLOMBIA } from '../datos/colombia';
import { SERIE_USA } from '../datos/usa';
import '../estilos/tabla.css';

function TablaHistorica() {
  const usaData = {
    2024: 74700000,
    2023: 74100000,
  };

  const anos = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

  return (
    <section className="tabla-historica">
      <h2 className="tabla-historica__titulo">Histórico año a año</h2>
      <p className="tabla-historica__subtitulo">Filas marcadas: dato duplicado o faltante.</p>
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead className="tabla__encabezado">
            <tr>
              <th>Año</th>
              <th>Colombia (cabezas)</th>
              <th>EE.UU. Dic (cabezas)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody className="tabla__cuerpo">
            {anos.map(ano => {
              const datoColombia = SERIE_COLOMBIA.find(d => d.periodo === String(ano));
              const datoUsa = usaData[ano];
              const es2023 = ano === 2023;
              const es2024 = ano === 2024;

              return (
                <tr key={ano} className={es2023 ? 'tabla__fila--alerta' : es2024 ? 'tabla__fila--reciente' : ''}>
                  <td>{ano}</td>
                  <td className="tabla__cabezas">
                    {datoColombia ? datoColombia.valor.toLocaleString() : '—'}
                  </td>
                  <td className="tabla__cabezas">
                    {datoUsa ? datoUsa.toLocaleString() : '—'}
                  </td>
                  <td>
                    {es2023 && <span className="tabla__estado tabla__estado--alerta">⚠️ Dato duplicado de 2022</span>}
                    {es2024 && <span className="tabla__estado tabla__estado--reciente">✅ Más reciente</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="tabla__pie">
        <span>Colombia: Fuente: Porcinews (enero 2026)</span>
        <span>EE.UU.: Fuente: USDA NASS</span>
      </div>
    </section>
  );
}

export default TablaHistorica;
