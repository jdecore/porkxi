import { jsPDF } from 'jspdf'
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

function generarReportePdf() {
  const inventario = JSON.parse(fs.readFileSync(path.join(dataDir, 'historico-inventario.json'), 'utf-8'))
  const ultimos = inventario.series.slice(-5).reverse()
  
  const col2024 = ultimos.find(s => s.anio === 2024)?.colombia || 0
  const eu2024 = ultimos.find(s => s.anio === 2024)?.europa || 0
  const usa2025 = inventario.series.find(s => s.anio === 2025)?.usa_dic || 0

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(196, 50, 10)
  doc.text('porkξ Radar', margin, y)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Reporte de Inventario Porcino', margin, y + 8)
  y += 15

  doc.setFontSize(16)
  doc.setTextColor(0)
  doc.text('Inventario Porcino: Colombia vs Mundo', margin, y)
  y += 12

  doc.setFillColor(249, 246, 241)
  doc.rect(margin, y, pageWidth - 2 * margin, 45, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Colombia', margin + 10, y + 12)
  doc.setFontSize(14)
  doc.setTextColor(196, 50, 10)
  doc.text((col2024 / 1000000).toFixed(1) + 'M', margin + 10, y + 24)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('UE-27', margin + 55, y + 12)
  doc.setFontSize(14)
  doc.setTextColor(15, 118, 110)
  doc.text((eu2024 / 1000000).toFixed(0) + 'M', margin + 55, y + 24)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('EE.UU.', margin + 100, y + 12)
  doc.setFontSize(14)
  doc.setTextColor(29, 78, 216)
  doc.text(usa2025 ? (usa2025 / 1000000).toFixed(1) + 'M' : '—', margin + 100, y + 24)
  
  y += 50

  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Serie Histórica', margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Año', margin + 4, y + 5.5)
  doc.text('Colombia', margin + 30, y + 5.5)
  doc.text('UE-27', margin + 65, y + 5.5)
  doc.text('EE.UU.', margin + 100, y + 5.5)
  y += 8

  doc.setFont('helvetica', 'normal')
  ultimos.forEach(s => {
    doc.text(String(s.anio), margin + 4, y + 5)
    doc.text((s.colombia / 1000000).toFixed(1) + 'M', margin + 30, y + 5)
    doc.text((s.europa / 1000000).toFixed(0) + 'M', margin + 65, y + 5)
    doc.text(s.usa_dic ? (s.usa_dic / 1000000).toFixed(1) + 'M' : '—', margin + 100, y + 5)
    y += 7
  })
  
  y += 10

  doc.setFontSize(14)
  doc.text('Análisis del Mercado', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setTextColor(60)
  const analisisTexto = `Colombia registra ${(col2024 / 1000000).toFixed(1)} millones de cabezas, mientras Europa lidera con ${(eu2024 / 1000000).toFixed(0)} millones (12 veces más que Colombia) y Estados Unidos con ${usa2025 ? (usa2025 / 1000000).toFixed(1) : '—'} millones (7 veces más). La brecha no es solo de volumen: Europa y EE.UU. publican datos oficiales mediante APIs públicas, mientras Colombia carece de una fuente consolidada. Este es el principal desafío para el análisis del sector porcino nacional.`
  const lineas = doc.splitTextToSize(analisisTexto, pageWidth - 2 * margin)
  doc.text(lineas, margin, y)
  y += lineas.length * 5 + 15

  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Fuentes', margin, y)
  y += 8

  doc.setFontSize(9)
  doc.setTextColor(60)
  doc.text('🇨🇴 Colombia: Porcinews (medio especializado)', margin, y)
  y += 6
  doc.text('🇪🇺 Europa: Eurostat API (oficial)', margin, y)
  y += 6
  doc.text('🇺🇸 EE.UU.: USDA NASS (trimestral)', margin, y)
  y += 12

  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Generado: ' + new Date().toLocaleDateString('es-CO'), margin, y)
  doc.text('porkξ | porkxi.com', pageWidth - margin - 25, y)

  const outputPath = path.join(outputDir, 'radar-porcino.pdf')
  doc.save(outputPath)

  console.log(`✅ PDF generado: ${outputPath}`)
}

generarReportePdf()