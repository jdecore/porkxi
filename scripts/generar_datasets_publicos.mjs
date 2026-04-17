import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SERIE_COLOMBIA, DETALLE_COLOMBIA } from '../src/data/colombia.js'
import { SERIE_EUROPA, DETALLE_EUROPA } from '../src/data/europa.js'
import { SERIE_USA, DETALLE_USA } from '../src/data/usa.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../public/data')

const nowIso = new Date().toISOString()

const getUsaValueByYear = (year) => {
  const item = SERIE_USA.find((entry) => entry.periodo === `Dic ${year}`)
  return item ? item.valor : null
}

const historicoInventario = {
  generated_at: nowIso,
  fuente: ['Porcinews', 'Eurostat', 'USDA NASS'],
  series: SERIE_COLOMBIA.map((item) => {
    const year = Number(item.periodo)
    return {
      anio: year,
      colombia: item.valor,
      europa: SERIE_EUROPA.find((eu) => Number(eu.periodo) === year)?.valor ?? null,
      usa_dic: getUsaValueByYear(year),
    }
  }),
}

const transparencia = {
  generated_at: nowIso,
  series: [
    {
      region: 'EE.UU.',
      dias_publicacion: 90,
      frecuencia: 'Trimestral',
      formato: 'API + comunicado',
      fuente: 'USDA NASS',
      api_publica: true,
    },
    {
      region: 'UE-27',
      dias_publicacion: 180,
      frecuencia: 'Anual',
      formato: 'JSON-stat',
      fuente: 'Eurostat',
      api_publica: true,
    },
    {
      region: 'Colombia',
      dias_publicacion: 400,
      frecuencia: 'Irregular',
      formato: 'Artículo periodístico',
      fuente: 'Porcinews',
      api_publica: false,
    },
  ],
}

const sacrificioAnualUe = {
  generated_at: nowIso,
  unidad: 'millones de cabezas (ene-ago)',
  fuente: 'Eurostat apro_mt_pann',
  nota: 'Serie parcial usada para mostrar ritmo reciente de sacrificio en UE.',
  series: [
    { anio: 2023, valor_millones: 145.0 },
    { anio: 2024, valor_millones: 146.0 },
  ],
}

const cicloReproductivoUe = {
  generated_at: nowIso,
  unidad: 'millones de cabezas',
  fuente: 'Eurostat',
  series: [
    {
      indicador: 'Cerdas reproductoras',
      valor_millones: 10.15,
      variacion_pct: -3.5,
    },
    {
      indicador: 'Lechones <20kg',
      valor_millones: 39.95,
      variacion_pct: -1.6,
    },
  ],
}

const preciosComercio = {
  generated_at: nowIso,
  fuente: 'DG AGRI + Porcinews (compilado)',
  ue_precio_canal_eur_100kg: 205.2,
  ue_precio_variacion_pct: -4.5,
  ue_lechon_eur: 79.8,
  ue_lechon_variacion_pct: -5.2,
  espana_import_vivo_t1_2025_pct: 76.0,
  colombia_importaciones_desde_norteamerica_pct: 95.7,
}

const csvRows = [
  ['anio', 'pais', 'cabezas', 'fuente', 'url'],
  ...SERIE_COLOMBIA.map((item) => [
    item.periodo,
    'Colombia',
    String(item.valor),
    'Porcinews',
    DETALLE_COLOMBIA.enlace,
  ]),
  ...SERIE_EUROPA.map((item) => [
    item.periodo,
    'UE-27',
    String(item.valor),
    'Eurostat',
    DETALLE_EUROPA.enlace,
  ]),
  ...SERIE_USA.map((item) => [
    item.periodo,
    'EE.UU.',
    String(item.valor),
    'USDA NASS',
    DETALLE_USA.enlace,
  ]),
]
const serieCompletaCsv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n'

const writeJson = async (name, payload) => {
  await writeFile(path.join(DATA_DIR, name), `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

const main = async () => {
  await mkdir(DATA_DIR, { recursive: true })
  await Promise.all([
    writeJson('historico-inventario.json', historicoInventario),
    writeJson('transparencia.json', transparencia),
    writeJson('sacrificio-anual-ue.json', sacrificioAnualUe),
    writeJson('ciclo-reproductivo-ue.json', cicloReproductivoUe),
    writeJson('precios-comercio.json', preciosComercio),
    writeFile(path.join(DATA_DIR, 'serie-completa.csv'), serieCompletaCsv, 'utf8'),
  ])
  console.log('Datasets públicos actualizados en public/data')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
