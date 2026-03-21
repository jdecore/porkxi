import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { SERIE_COLOMBIA } from '../datos/colombia';
import { SERIE_USA } from '../datos/usa';
import '../estilos/grafica.css';

function GraficaPrincipal() {
  const datosCombinados = [
    ...SERIE_COLOMBIA.map(d => ({ periodo: d.periodo, colombia: d.valor, ultimoColombia: d.ultimoDato })),
    ...SERIE_USA.map(d => ({ periodo: d.periodo, usa: d.valor, ultimoUsa: d.ultimoDato }))
  ].sort((a, b) => {
    const yearA = parseInt(a.periodo.split(' ')[0]);
    const yearB = parseInt(b.periodo.split(' ')[0]);
    if (yearA !== yearB) return yearA - yearB;
    const seasonOrder = { 'Mar': 1, 'Jun': 2, 'Sep': 3, 'Dic': 4 };
    const seasonA = a.periodo.includes(' ') ? seasonOrder[a.periodo.split(' ')[0]] : 5;
    const seasonB = b.periodo.includes(' ') ? seasonOrder[b.periodo.split(' ')[0]] : 5;
    return seasonA - seasonB;
  });

  const ultimoColombia = SERIE_COLOMBIA.find(d => d.ultimoDato);
  const ultimoUsa = SERIE_USA.find(d => d.ultimoDato);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="grafica-tooltip">
          <p className="grafica-tooltip__label">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="grafica-tooltip__item">
              <span className={`grafica-tooltip__color grafica-tooltip__${entry.dataKey}`}></span>
              <span>{entry.dataKey === 'colombia' ? '🇨🇴 Colombia' : '🇺🇸 EE.UU.'}: {(entry.value / 1000000).toFixed(2)}M</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grafica-card">
      <h2 className="grafica-card__titulo">Inventario histórico comparado</h2>
      <p className="grafica-card__subtitulo">
        En millones de cabezas. 
        <span className="grafica-card__colombia">🟡 Colombia (anual · fuente: Porcinews)</span> · 
        <span className="grafica-card__usa">🔵 EE.UU. (trimestral · fuente: USDA NASS)</span>
      </p>
      <div className="grafica-contenedor">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEC9C4" />
            <XAxis 
              dataKey="periodo" 
              interval="preserveStartEnd" 
              tick={{ fontSize: 11 }} 
              angle={-30} 
              textAnchor="end"
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(v) => (v/1000000).toFixed(1) + "M"}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#EEC9C4' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => value === 'colombia' ? '🇨🇴 Colombia (Porcinews)' : '🇺🇸 EE.UU. (USDA NASS)'}
            />
            <Line 
              type="monotone" 
              dataKey="colombia" 
              stroke="#F5A800" 
              strokeWidth={2.5} 
              connectNulls 
              dot={{ r: 2.5 }}
              name="colombia"
            />
            <Line 
              type="monotone" 
              dataKey="usa" 
              stroke="#2563EB" 
              strokeWidth={2.5} 
              connectNulls 
              dot={{ r: 2.5 }}
              name="usa"
            />
            {ultimoColombia && (
              <ReferenceDot 
                x={ultimoColombia.periodo} 
                y={ultimoColombia.valor} 
                r={8} 
                fill="#C0392B" 
                stroke="white" 
                strokeWidth={2}
                label={{ value: 'Último COL', position: 'top', fill: '#C0392B', fontSize: 10 }}
              />
            )}
            {ultimoUsa && (
              <ReferenceDot 
                x={ultimoUsa.periodo} 
                y={ultimoUsa.valor} 
                r={8} 
                fill="#2563EB" 
                stroke="white" 
                strokeWidth={2}
                label={{ value: 'Último USA', position: 'top', fill: '#2563EB', fontSize: 10 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GraficaPrincipal;
