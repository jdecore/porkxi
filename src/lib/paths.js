export const withBase = (path) => {
  const base = import.meta.env.BASE_URL || '/'
  const cleanPath = String(path || '').replace(/^\/+/, '')
  return `${base}${cleanPath}`
}
