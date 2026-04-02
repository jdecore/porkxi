# porkxi-astro - Estado del Proyecto

## Descripción
Aplicación de visualización de inventario porcino Colombia vs EE.UU. Migrada desde React a **Astro puro** (sin JavaScript runtime).

## Stack técnico
- **Framework**: Astro 6 (sin integraciones, puro HTML/CSS)
- **Build**: Vite + Terser
- **Output**: Static HTML + CSS (0KB JavaScript)

## Métricas actuales
| Métrica | Valor |
|---------|-------|
| Total dist | **64KB** |
| JS en output | **0KB** |
| HTML | 32KB |
| CSS | 15KB |

## Estructura del proyecto
```
porkxi-astro/
├── src/
│   ├── components/
│   │   ├── GraficaPrincipal.astro  # Gráfico SVG estático
│   │   └── (otros componentes ya no se usan - todo en index.astro)
│   ├── data/
│   │   ├── colombia.js
│   │   └── usa.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── encabezado.css
│   │   ├── alerta.css
│   │   ├── tarjetas.css
│   │   ├── grafica.css
│   │   ├── frecuencia.css
│   │   ├── detalle.css
│   │   ├── tabla.css
│   │   ├── explicacion.css
│   │   └── pieDepagina.css
│   └── pages/
│       └── index.astro            # Todo el contenido here
├── dist/                           # Build output (64KB)
├── astro.config.mjs
└── package.json
```

## Arquitectura actual
- Todo el contenido está en `src/pages/index.astro`
- El gráfico es SVG puro calculado en build time (no hay JS runtime)
- No hay hydration de ningún tipo - 100% HTML estático

## Últimos cambios realizados
1. Migración completa de React → Astro puro (sin Vue)
2. Recharts reemplazado por SVG estático
3. Eliminación de todo JavaScript del output
4. Ajuste de altura del gráfico (380→450px) para evitar overlap de labels

## Cómo ejecutar
```bash
cd porkxi-astro
npm run dev       # Desarrollo en http://localhost:4321
npm run build     # Build a dist/
npm run preview   # Previsualizar producción
```

## Notas para continuar
- El archivo `GraficaPrincipal.astro` contiene el SVG del gráfico
- El gráfico puede mejorarse con tooltips interactivos (pero requeriría JS)
- La página es 100% SEO-friendly y funciona sin JavaScript