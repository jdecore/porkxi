import { ref } from 'vue'

const datosGlobales = ref({})
const cargando = ref(false)
const error = ref(null)
const ultimaActualizacion = ref(null)

export function useDatosInventario() {
  const cargarDatos = async () => {
    cargando.value = true
    error.value = null
    
    try {
      const res = await fetch('/data/inventario-unificado.json', { cache: 'no-store' })
      if (!res.ok) throw new Error('No se pudieron cargar los datos')
      
      const json = await res.json()
      datosGlobales.value = json
      ultimaActualizacion.value = json.actualizado ? new Date(json.actualizado).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'sin fecha'
      
      return json
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      cargando.value = false
    }
  }

  const getColombia = () => datosGlobales.value.Colombia || {}
  const getEuropa = () => datosGlobales.value.europa || {}
  const getUsa = () => datosGlobales.value.usa || {}
  
  const getSerieColombia = () => getColombia().serie || []
  const getSerieEuropa = () => getEuropa().serie || []
  const getSerieUsa = () => getUsa().serie || []

  return {
    datos: datosGlobales,
    cargando,
    error,
    ultimaActualizacion,
    cargarDatos,
    getColombia,
    getEuropa,
    getUsa,
    getSerieColombia,
    getSerieEuropa,
    getSerieUsa,
  }
}

export default useDatosInventario