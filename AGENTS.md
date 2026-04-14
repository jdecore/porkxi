# porkxi-astro - Estado del Proyecto

## Descripción
Aplicación de visualización de inventario porcino Colombia vs EE.UU. con componentes interactivos Vue.

## Stack técnico
- **Framework**: Astro 6 + Vue 3 (hidratación selectiva con `client:visible`)
- **Build**: Vite
- **Output**: HTML estático + CSS + JS (solo para componentes interactivos)

## Métricas actuales
| Métrica | Valor |
|---------|-------|
| Total dist | **180KB** |
| HTML | 40KB |
| CSS | 16KB |
| JS (Vue runtime + componentes) | 104KB |

## Componentes Vue interactivos
| Componente | Funcionalidad |
|------------|--------------|
| `GraficaInteractiva.vue` | Gráfica SVG con tooltips hover, animación de líneas, filtros de rango, soporte touch |
| `TabsComparativa.vue` | Tabs Colombia/USA/Ambos con transiciones fade y timeline animado |

## Estructura del proyecto
```
porkxi-astro/
├── src/
│   ├── components/
│   │   ├── GraficaInteractiva.vue  # Gráfica SVG interactiva
│   │   ├── TabsComparativa.vue     # Tabs con transiciones
│   │   ├── GraficaPrincipal.astro  # Gráfica estática (fallback)
│   │   └── TarjetasKpiAnimadas.vue # KPIs con count-up (no usado aún)
│   ├── data/
│   │   ├── colombia.js
│   │   └── usa.js
│   ├── styles/
│   │   ├── encabezado.css
│   │   ├── alerta.css
│   │   ├── tarjetas.css
│   │   ├── grafica.css
│   │   ├── frecuencia.css
│   │   ├── detalle.css
│   │   ├── tabla.css
│   │   ├── explicacion.css
│   │   └── pieDepagina.css
│   ├── pages/
│   │   └── index.astro
│   └── vue-app.ts
├── dist/                           # Build output (180KB)
├── astro.config.mjs
└── package.json
```

## Arquitectura
- HTML estático para SEO (encabezado, alerta, detalle, tabla, explicación, footer)
- Vue con `client:visible` para hidratación diferida (gráfica + tabs)
- CSS modular por componente

## Últimos cambios realizados
1. Migración completa de React → Astro puro (sin Vue)
2. Recharts reemplazado por SVG estático
3. Eliminación de todo JavaScript del output
4. Ajuste de altura del gráfico (380→450px) para evitar overlap de labels
5. Limpieza: eliminados 9 archivos .vue huérfanos y dependencias de Vue/Recharts
6. Re-integración de Vue con componentes interactivos:
   - Gráfica con tooltips, animaciones y filtros
   - Tabs comparativos con transiciones

## Cambios verificados
- Shared data file created
- Static graph refactored
- Interactive graph updated
- Compression enabled
- Hydration mode changed to idle

## Cómo ejecutar
```bash
cd porkxi-astro
npm run dev       # Desarrollo en http://localhost:4321
npm run build     # Build a dist/
npm run preview   # Previsualizar producción
```

## Notas para continuar
- `TarjetasKpiAnimadas.vue` existe pero no está integrado aún
- Se puede agregar más interactividad con Vue según necesidad
- El runtime de Vue (~80KB) se carga solo cuando el usuario hace scroll a los componentes
