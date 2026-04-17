import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputDir = path.join(__dirname, '../public/reportes')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const COLOMBIA = {
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
  enlace: "https://porcinews.com/colombia-el-censo-porcino-registra-mas-de-106-millones-de-animales-en-el-pais/",
}

const EUROPA = {
  fechaDato: "Nov-Dic 2024",
  dataset: "apro_mt_lspig",
  totalCabezas: 132135520,
  variacionAnualPct: -0.5,
  frecuencia: "Anual",
  cobertura: "EU27_2020",
  unidad: "THS_HD",
  fechaActualizacionApi: "09 abr 2026",
  fuente: "Eurostat",
  enlace: "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/apro_mt_lspig",
}

const USA = {
  fechaDato: "1 dic 2025",
  fechaPublicacion: "23 dic 2025",
  totalCabezas: 75500000,
  variacionAnualPct: 1,
  cerdosMercado: 69600000,
  reproductores: 5950000,
  cerdosDestetados: 35000000,
  promedioLechonesPorCamada: 11.93,
  proximoReporte: "26 mar 2026",
  fuente: "USDA NASS",
  enlace: "https://www.nass.usda.gov/Newsroom/2025/12-23-2025.php",
}

const serie = [
  { anio: 2024, colombia: 10668276, europa: 132135520, usa: 74700000 },
  { anio: 2023, colombia: 9658204, europa: 132845670, usa: 74100000 },
  { anio: 2022, colombia: 9658204, europa: 134410040, usa: null },
  { anio: 2021, colombia: 6500000, europa: 141681380, usa: null },
  { anio: 2020, colombia: 6200000, europa: 145918600, usa: null },
]

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radar Porcino Colombia | Reporte Ejecutivo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #3A2320; background: #F9F6F1; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 40px; }
    .logo { font-size: 36px; font-weight: 900; letter-spacing: -2px; }
    .logo span { color: #C4320A; }
    .fecha { font-size: 12px; color: #888; margin-top: 8px; }
    h1 { font-size: 28px; margin-bottom: 24px; color: #1a1a1a; }
    h2 { font-size: 18px; margin: 32px 0 16px; color: #C4320A; border-bottom: 2px solid #E8E4E0; padding-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi { background: #FFFFFF; border-radius: 12px; padding: 20px; border: 1px solid #E8E4E0; }
    .kpi-pais { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .kpi-valor { font-size: 32px; font-weight: 700; }
    .kpi-label { font-size: 12px; color: #888; }
    .colombia .kpi-valor { color: #C96A5B; }
    .europa .kpi-valor { color: #0F766E; }
    .usa .kpi-valor { color: #1D4ED8; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E8E4E0; }
    th { background: #F5F5F5; font-weight: 600; }
    .metricas { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
    .metrica { background: #FFFFFF; padding: 16px; border-radius: 8px; border: 1px solid #E8E4E0; }
    .metrica__label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .metrica__valor { font-size: 18px; font-weight: 600; margin-top: 4px; }
    .analisis { background: #FFFFFF; padding: 24px; border-radius: 12px; border-left: 4px solid #C4320A; margin: 24px 0; }
    .analisis p { font-size: 14px; color: #444; }
    .fuentes { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E4E0; }
    .fuente-item { font-size: 13px; color: #666; margin-bottom: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #AAA; text-align: center; }
    @media print { body { background: white; padding: 20px; } .kpi { box-shadow: none; } }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">pork<span>ξ</span> Radar</div>
      <div class="fecha">Reporte generado: 17 abril 2026</div>
    </div>

    <h1>Inventario Porcino: Colombia vs Mundo</h1>

    <div class="kpi-grid">
      <div class="kpi colombia">
        <div class="kpi-pais">🇨🇴 Colombia</div>
        <div class="kpi-valor">${(COLOMBIA.totalCabezas / 1000000).toFixed(1)}M</div>
        <div class="kpi-label">${COLOMBIA.fecha}</div>
      </div>
      <div class="kpi europa">
        <div class="kpi-pais">🇪🇺 UE-27</div>
        <div class="kpi-valor">${(EUROPA.totalCabezas / 1000000).toFixed(0)}M</div>
        <div class="kpi-label">${EUROPA.fechaDato}</div>
      </div>
      <div class="kpi usa">
        <div class="kpi-pais">🇺🇸 EE.UU.</div>
        <div class="kpi-valor">${(USA.totalCabezas / 1000000).toFixed(1)}M</div>
        <div class="kpi-label">${USA.fechaDato}</div>
      </div>
    </div>

    <h2>Detalle por País</h2>
    
    <h3>🇨🇴 Colombia (${COLOMBIA.fecha})</h3>
    <div class="metricas">
      <div class="metrica"><div class="metrica__label">Total inventario</div><div class="metrica__valor">${COLOMBIA.totalCabezas.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Total predios</div><div class="metrica__valor">${COLOMBIA.totalPredios.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Traspatio</div><div class="metrica__valor">${COLOMBIA.traspatio.cantidad.toLocaleString()} (${COLOMBIA.traspatio.porcentaje}%)</div></div>
      <div class="metrica"><div class="metrica__label">Comercial familiar</div><div class="metrica__valor">${COLOMBIA.comercialFamiliar.cantidad.toLocaleString()} (${COLOMBIA.comercialFamiliar.porcentaje}%)</div></div>
      <div class="metrica"><div class="metrica__label">Comercial industrial</div><div class="metrica__valor">${COLOMBIA.comercialIndustrial.cantidad.toLocaleString()} (${COLOMBIA.comercialIndustrial.porcentaje}%)</div></div>
      <div class="metrica"><div class="metrica__label">Granjas tecnificadas</div><div class="metrica__valor">${COLOMBIA.tecnificadas.cantidad.toLocaleString()} (${COLOMBIA.tecnificadas.porcentaje}%)</div></div>
      <div class="metrica"><div class="metrica__label"> Carne 2024</div><div class="metrica__valor">${COLOMBIA.carne2024Toneladas.toLocaleString()} t (+${COLOMBIA.carne2024Variacion}%)</div></div>
      <div class="metrica"><div class="metrica__label">Beneficio 2024</div><div class="metrica__valor">${COLOMBIA.beneficio2024Cabezas.toLocaleString()} (+${COLOMBIA.beneficio2024Variacion}%)</div></div>
    </div>

    <h3>🇪🇺 Europa (${EUROPA.fechaDato})</h3>
    <div class="metricas">
      <div class="metrica"><div class="metrica__label">Total inventario</div><div class="metrica__valor">${EUROPA.totalCabezas.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Variación anual</div><div class="metrica__valor">${EUROPA.variacionAnualPct}%</div></div>
      <div class="metrica"><div class="metrica__label">Frecuencia</div><div class="metrica__valor">${EUROPA.frecuencia}</div></div>
      <div class="metrica"><div class="metrica__label">Dataset</div><div class="metrica__valor">${EUROPA.dataset}</div></div>
    </div>

    <h3>🇺🇸 EE.UU. (${USA.fechaDato})</h3>
    <div class="metricas">
      <div class="metrica"><div class="metrica__label">Total inventario</div><div class="metrica__valor">${USA.totalCabezas.toLocaleString()} (+${USA.variacionAnualPct}%)</div></div>
      <div class="metrica"><div class="metrica__label">Cerdos mercado</div><div class="metrica__valor">${USA.cerdosMercado.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Reproductores</div><div class="metrica__valor">${USA.reproductores.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Lechones destetados</div><div class="metrica__valor">${USA.cerdosDestetados.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Promedio camada</div><div class="metrica__valor">${USA.promedioLechonesPorCamada}</div></div>
      <div class="metrica"><div class="metrica__label">Próximo reporte</div><div class="metrica__valor">${USA.proximoReporte}</div></div>
    </div>

    <h2>Serie Histórica</h2>
    <table>
      <thead><tr><th>Año</th><th>Colombia</th><th>UE-27</th><th>EE.UU.</th></tr></thead>
      <tbody>
        ${serie.map(s => `<tr><td>${s.anio}</td><td>${(s.colombia/1000000).toFixed(1)}M</td><td>${(s.europa/1000000).toFixed(0)}M</td><td>${s.usa ? (s.usa/1000000).toFixed(1)+'M' : '—'}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="analisis">
      <h2>Análisis del Mercado</h2>
      <p>Colombia registra ${COLOMBIA.totalCabezas.toLocaleString()} cabezas (${(COLOMBIA.totalCabezas/1000000).toFixed(1)}M), mientras Europa lidera con ${EUROPA.totalCabezas.toLocaleString()} (${(EUROPA.totalCabezas/1000000).toFixed(0)}M, ${(EUROPA.totalCabezas/COLOMBIA.totalCabezas).toFixed(0)}x Colombia) y Estados Unidos con ${USA.totalCabezas.toLocaleString()} (${(USA.totalCabezas/COLOMBIA.totalCabezas).toFixed(0)}x Colombia). La brecha más significativa no es de volumen: Europa y Estados Unidos publican sus datos mediante APIs públicas oficiales, mientras Colombia carece de una fuente consolidada. Este es el principal desafío para el análisis del sector porcino nacional.</p>
    </div>

    <div class="fuentes">
      <h2>Fuentes</h2>
      <div class="fuente-item">🇨🇴 Colombia: ${COLOMBIA.fuente} - <a href="${COLOMBIA.enlace}">Ver fuente</a></div>
      <div class="fuente-item">🇪🇺 Europa: ${EUROPA.fuente} (${EUROPA.dataset}) - <a href="${EUROPA.enlace}">Ver dataset</a></div>
      <div class="fuente-item">🇺🇸 EE.UU.: ${USA.fuente} - <a href="${USA.enlace}">Ver reporte</a></div>
    </div>

    <div class="footer">
      <p>porkξ | porkxi.com</p>
    </div>
  </div>
</body>
</html>`

fs.writeFileSync(path.join(outputDir, 'radar-porcino.html'), html, 'utf-8')
console.log('✅ Reporte generado: public/reportes/radar-porcino.html')