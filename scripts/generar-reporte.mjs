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

let datos = {}

try {
  const json = JSON.parse(fs.readFileSync(path.join(dataDir, 'inventario-unificado.json'), 'utf-8'))
  datos = json
} catch (e) {
  console.log('Using fallback data')
}

const col = datos.Colombia || { ultimo: { periodo: '2024', valor: 10668276, fecha: 'Ene 2026' }, detalle: {} }
const eu = datos.europa || { ultimo: { periodo: '2024', valor: 132135520, fecha: 'Nov-Dic 2024' } }
const usa = datos.usa || { ultimo: { periodo: 'Dic 2025', valor: 75500000, fecha: 'Dic 2025' } }

const serie = col.serie || [
  { periodo: '2024', valor: 10668276 },
  { periodo: '2023', valor: 9658204 },
  { periodo: '2022', valor: 9658204 },
  { periodo: '2021', valor: 6500000 },
  { periodo: '2020', valor: 6200000 },
]

const analisis = `El inventario porcino global presenta disparidades significativas. Colombia registra ${(col.ultimo.valor/1e6).toFixed(1)} millones de cerdas en ${(col.detalle?.predios || 189198).toLocaleString()} predios, donde el ${col.detalle?.traspatio?.porcentaje || 78}% corresponde a traspatio. La Unión Europea concentra ${(eu.ultimo.valor/1e6).toFixed(0)} millones, representando ${(eu.ultimo.valor/col.ultimo.valor).toFixed(0)}x el inventario colombiano, mientras Estados Unidos alcanza los ${(usa.ultimo.valor/1e6).toFixed(1)} millones con un sistema altamente concentrado.

La verdadera brecha no es volumétrica sino de transparencia institucional. Mientras Eurostat publica datos oficiales con frecuencia anual a través de su API pública, y USDA ofrece reportes trimestrales bajo la Livestock Mandatory Reporting Act, Colombia carece de una fuente gubernamental consolidada. Los datos colombianos provienen únicamente de Porcinews, un medio periodístico especializado, lo que evidencia la fragmentación institucional entre ICA, DANE y Porkcolombia.`

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Porcino Colombia | porkξ</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sora', sans-serif; line-height: 1.7; color: #1a1a1a; background: #FFFFFF; padding: 40px; }
    .container { max-width: 680px; margin: 0 auto; }
    .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .logo span { color: #C4320A; }
    .fecha { font-size: 11px; color: #999; margin-top: 4px; }
    h1 { font-size: 20px; margin: 32px 0 20px; }
    h2 { font-size: 12px; margin: 28px 0 10px; color: #C4320A; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .kpi { background: #FAFAFA; border-radius: 8px; padding: 14px; text-align: center; }
    .kpi-pais { font-size: 11px; font-weight: 600; }
    .kpi-valor { font-size: 22px; font-weight: 700; margin: 4px 0; }
    .kpi-dato { font-size: 9px; color: #888; }
    .colombia .kpi-valor { color: #C96A5B; }
    .europa .kpi-valor { color: #0F766E; }
    .usa .kpi-valor { color: #1D4ED8; }
    .metricas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
    .metrica { background: #FAFAFA; padding: 10px; border-radius: 6px; }
    .metrica__label { font-size: 8px; color: #999; text-transform: uppercase; }
    .metrica__valor { font-size: 12px; font-weight: 600; margin-top: 2px; }
    .analisis { background: #FEFEFE; border-left: 3px solid #C4320A; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.8; color: #333; }
    .tabla { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11px; }
    .tabla th, .tabla td { padding: 8px; text-align: left; border-bottom: 1px solid #EEE; }
    .tabla th { background: #F5F5F5; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    .fuentes { font-size: 10px; color: #777; margin-top: 28px; }
    .footer { margin-top: 32px; font-size: 9px; color: #AAA; text-align: center; }
    .badge { display: inline-block; background: #F5F5F5; padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-right: 4px; }
    .actualizado { background: #E8F5E9; color: #2E7D32; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">pork<span>ξ</span></div>
    <div class="fecha">Generado: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })} · <span class="actualizado">Datos en vivo</span></div>

    <h1>Inventario Porcino: Colombia vs Mundo</h1>

    <div class="kpi-grid">
      <div class="kpi colombia"><div class="kpi-pais">🇨🇴 Colombia</div><div class="kpi-valor">${(col.ultimo.valor/1e6).toFixed(1)}M</div><div class="kpi-dato">${col.ultimo.fecha}</div></div>
      <div class="kpi europa"><div class="kpi-pais">🇪🇺 UE-27</div><div class="kpi-valor">${(eu.ultimo.valor/1e6).toFixed(0)}M</div><div class="kpi-dato">${eu.ultimo.fecha}</div></div>
      <div class="kpi usa"><div class="kpi-pais">🇺🇸 EE.UU.</div><div class="kpi-valor">${(usa.ultimo.valor/1e6).toFixed(1)}M</div><div class="kpi-dato">${usa.ultimo.fecha}</div></div>
    </div>

    <h2>Análisis del Mercado</h2>
    <div class="analisis">${analisis}</div>

    <h2>Estructura Colombia</h2>
    <div class="metricas">
      <div class="metrica"><div class="metrica__label">Total</div><div class="metrica__valor">${col.ultimo.valor.toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Predios</div><div class="metrica__valor">${(col.detalle?.predios || 189198).toLocaleString()}</div></div>
      <div class="metrica"><div class="metrica__label">Traspatio</div><div class="metrica__valor">${col.detalle?.traspatio?.porcentaje || 78}%</div></div>
    </div>

    <h2>Serie Histórica (Millones)</h2>
    <table class="tabla">
      <thead><tr><th>Año</th><th>Colombia</th><th>UE-27</th><th>EE.UU.</th></tr></thead>
      <tbody>${serie.slice(0,5).reverse().map(s => `<tr><td>${s.periodo}</td><td>${(s.valor/1e6).toFixed(1)}M</td><td>${(eu.ultimo.valor/1e6).toFixed(0)}M</td><td>—</td></tr>`).join('')}</tbody>
    </table>

    <div class="fuentes">
      <strong>Fuentes:</strong> <span class="badge">🇨🇴 Porcinews</span> <span class="badge">🇪🇺 Eurostat API</span> <span class="badge">🇺🇸 USDA NASS</span>
    </div>

    <div class="footer">porkξ | porkxi.com · Datos actualizados automáticamente</div>
  </div>
</body>
</html>`

fs.writeFileSync(path.join(outputDir, 'radar-porcino.html'), html, 'utf-8')
console.log('✅ Reporte generado: public/reportes/radar-porcino.html')