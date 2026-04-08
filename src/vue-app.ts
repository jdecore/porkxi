import { createApp } from 'vue'
import TarjetasKpiAnimadas from './components/TarjetasKpiAnimadas.vue'

// Manual lazy hydration on viewport intersection, no Astro runtime
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target
        observer.unobserve(container)
        
        const app = createApp(TarjetasKpiAnimadas)
        app.mount(container)
      }
    })
  }, { rootMargin: '150px' })

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById('kpi-animadas')
    if (target) {
      observer.observe(target)
    }
  })
}
