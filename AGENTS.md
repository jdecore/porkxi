# AGENTS.md - Guía para el agente

## Estado actual del proyecto

**IMPORTANTE**: El proyecto original React fue migrado a Astro. El proyecto activo es `porkxi-astro/`.

### Proyectos

| Proyecto | Ubicación | Stack | Output |
|----------|-----------|-------|--------|
| porkxi (original) | `/home/juan/prueba/porkxi/` | React 18 + Recharts | ~~150KB~~ obsoleto |
| **porkxi-astro** | `/home/juan/prueba/porkxi/porkxi-astro/` | Astro puro (HTML+CSS) | **64KB** |

---

## porkxi-astro (proyecto activo)

### Stack técnico
- **Framework**: Astro 6 (sin integraciones)
- **JS en output**: 0KB (puro HTML estático)
- **Gráfico**: SVG calculado en build time

### Estructura
```
porkxi-astro/
├── src/
│   ├── components/GraficaPrincipal.astro  # SVG estático
│   ├── data/colombia.js, usa.js          # Datos
│   ├── styles/*.css                       # Estilos
│   └── pages/index.astro                  # Todo el contenido
├── dist/                                   # 64KB total
├── astro.config.mjs
└── package.json
```

### Métricas
- Total dist: 64KB
- JS en output: **0KB**
- HTML: 32KB
- CSS: 15KB

### Cómo ejecutar
```bash
cd porkxi-astro
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # previsualizar
```

---

## Notas importantes

- Todo el contenido está en `src/pages/index.astro`
- El gráfico es SVG puro - funciona sin JavaScript
- NO usar Vue ni React - mantener puro Astro
- Diseño responsive con breakpoint en 700px
- Fuentes: Playfair Display (títulos) + DM Sans (body)