import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '../public')
const dataDir = path.join(publicDir, 'data')
const outputDir = path.join(publicDir, 'reportes')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function generarReporteHtml() {
  const inventario = JSON.parse(fs.readFileSync(path.join(dataDir, 'historico-inventario.json'), 'utf-8'))
  
  const ultimos = inventario.series.slice(-5)
  
  const col2024 = ultimos.find(s => s.anio === 2024)?.colombia || 0
  const eu2024 = ultimos.find(s => s.anio === 2024)?.europa || 0
  const usa2025 = inventario.series.find(s => s.anio === 2025)?.usa_dic || 0

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Radar Porcino Colombia | Reporte Abril 2026</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #c4320a; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
    .logo span { color: #c4320a; }
    .fecha { font-size: 12px; color: #666; margin-top: 8px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 30px 0 15px; color: #c4320a; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .kpi { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; }
    .kpi-valor { font-size: 28px; font-weight: 700; color: #c4320a; }
    .kpi-label { font-size: 13px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .Fuente { font-size: 11px; color: #999; margin-top: 40px; text-align: center; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .destacado { background: #fff8f5; padding: 20px; border-left: 4px solid #c4320a; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">pork<span>ξ</span> Radar</div>
    <div class="fecha">Reporte generado: 17 abril 2026</div>
  </div>

  <h1>Inventario Porcino: Colombia vs Mundo</h1>
  
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-valor">${(col2024 / 1000000).toFixed(1)}M</div>
      <div class="kpi-label">Colombia</div>
    </div>
    <div class="kpi">
      <div class="kpi-valor">${(eu2024 / 1000000).toFixed(0)}M</div>
      <div class="kpi-label">UE-27</div>
    </div>
    <div class="kpi">
      <div class="kpi-valor">${(usa2025 / 1000000).toFixed(1)}M</div>
      <div class="kpi-label">EE.UU.</div>
    </div>
  </div>

  <h2>Contexto del Mercado</h2>
  <div class="destacado">
    <strong>Breve análisis:</strong> Colombia registra ~10.7M de cabezas, mientras Europa lidera con 132M (12x Colombia) y Estados Unidos con 75.5M (7x Colombia). La brecha no es solo de volumen: Europa y EE.UU. publican datos oficiales vía API, mientras Colombia carece de una fuente consolidada. Este es el principal desafío para el análisis del sector.
  </div>

  <h2>Serie Histórica (Millones)</h2>
  <table>
    <thead>
      <tr><th>Año</th><th>Colombia</th><th>UE-27</th><th>EE.UU.</th></tr>
    </thead>
    <tbody>
      ${ultimos.reverse().map(s => `
      <tr>
        <td>${s.anio}</td>
        <td>${(s.colombia / 1000000).toFixed(1)}M</td>
        <td>${(s.europa / 1000000).toFixed(0)}M</td>
        <td>${s.usa_dic ? (s.usa_dic / 1000000).toFixed(1) + 'M' : '—'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Fuentes</h2>
  <table>
    <tr><td>🇨🇴 Colombia</td><td>Porcinews (medio especializado)</td></tr>
    <tr><td>🇪🇺 Europa</td><td>Eurostat API (oficial)</td></tr>
    <tr><td>🇺🇸 EE.UU.</td><td>USDA NASS (trimestral)</td></tr>
  </table>

  <div class="footer">
    <p>Este reporte fue generado automáticamente con datos de fuentes públicas.</p>
    <p>porkξ | porkxi.com</p>
  </div>
</body>
</html>`

  return html
}

const html = generarReporteHtml()
const outputPath = path.join(outputDir, 'radar-porcino.html')
fs.writeFileSync(outputPath, html, 'utf-8')

console.log(`✅ Reporte generado: ${outputPath}`)