const githubOwner = process.env.GITHUB_REPO_OWNER || 'jdecore'
const githubRepo = process.env.GITHUB_REPO_NAME || 'porkxi'
const githubRef = process.env.GITHUB_SYNC_REF || 'main'
const githubWorkflow = process.env.GITHUB_SYNC_WORKFLOW || 'actualizar-fuentes.yml'

const snapshotRemotoDefault = `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${githubRef}/public/estado-fuentes.json`

const obtenerErrorGithub = async (respuesta) => {
  try {
    const data = await respuesta.json()
    return typeof data?.message === 'string' ? data.message : 'Error desconocido de GitHub'
  } catch (_error) {
    return 'No se pudo leer la respuesta de GitHub'
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método no permitido' })
  }

  const token = process.env.GITHUB_SYNC_TOKEN
  if (!token) {
    return response.status(500).json({
      error: 'Falta la variable GITHUB_SYNC_TOKEN en el servidor',
    })
  }

  const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${githubWorkflow}/dispatches`
  const body = JSON.stringify({ ref: githubRef })

  let respuestaGithub
  try {
    respuestaGithub = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body,
    })
  } catch (_error) {
    return response.status(502).json({
      error: 'No se pudo contactar la API de GitHub',
    })
  }

  if (!respuestaGithub.ok) {
    const detalle = await obtenerErrorGithub(respuestaGithub)
    return response.status(502).json({
      error: `GitHub rechazó la sincronización: ${detalle}`,
    })
  }

  return response.status(202).json({
    ok: true,
    message: 'Sincronización disparada. Esperando actualización del snapshot.',
    snapshot_url: process.env.PUBLIC_REMOTE_SNAPSHOT_URL || snapshotRemotoDefault,
  })
}
