# porkxi-astro - Estado del Proyecto

## Descripción
Aplicación de visualización de inventario porcino Colombia vs EE.UU. con componentes interactivos Vue.

## Stack técnico
- **Framework**: Astro 6 + Vue 3 (hidratación selectiva con `client:idle`)
- **Build**: Vite
- **Output**: HTML estático + CSS + JS (solo para componentes interactivos)

## Métricas actuales
| Métrica | Valor |
|---------|-------|
| Total dist | ~90KB (más optimizado sin runtime de Vue en carga inicial) |
| HTML | ~40KB |
| CSS | ~16KB |
| JS (Vue runtime + componentes) | ~104KB (solo cuando el usuario está cerca de los componentes) |

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
│   │   ├── GraficaPrincipal.astro  # Gráfica estática (fallback, ahora usa datos compartidos)
│   │   └── TarjetasKpiAnimadas.vue # KPIs con count-up (no usado aún)
│   ├── data/
│   │   ├── colombia.js
│   │   └── usa.js
│   ├── lib/
│   │   └── datos-grafico.js        # **SINGLE SOURCE OF TRUTH** - datos normalizados para gráficos
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
├── dist/                           # Build output (optimizado con compresión)
├── astro.config.mjs
└── package.json
```

## Arquitectura
- HTML estático para SEO (encabezado, alerta, detalle, tabla, explicación, footer)
- Vue con `client:idle` para hidratación diferida (gráfica + tabs)
- CSS modular por componente
- **Datos centralizados**: `src/lib/datos-grafico.js` como única fuente de verdad para gráficos estáticos e interactivos

## Últimos cambios realizados
1. Migración completa de React → Astro puro (sin Vue)
2. Recharts reemplazado por SVG estático
3. Eliminación de todo JavaScript del output
4. Ajuste de altura del gráfico (380→450px) para evitar overlap de labels
5. Limpieza: eliminados 9 archivos .vue huérfanos y dependencias de Vue/Recharts
6. Re-integración de Vue con componentes interactivos:
   - Gráfica con tooltips, animaciones y filtros
   - Tabs comparativos con transiciones
7. **Creación de archivo de datos compartido** (`src/lib/datos-grafico.js`) con funciones helper para normalizar y calcular puntos de gráfica
8. **Refactor de GraficaPrincipal.astro** para usar datos compartidos y layout idéntico a la versión interactiva
9. **Actualización de GraficaInteractiva.vue** para consumir datos del archivo compartido
10. **Activación de compresión** (Brotli + Gzip) en `astro.config.mjs`
11. **Cambio de hidratación** de `client:visible` → `client:idle` en ambos componentes Vue

## Estado final
- Datos centralizados en `src/lib/datos-grafico.js` ✓
- Componentes Vue actualizados para usar datos compartidos ✓
- Compresión activada ✓
- Hydration en `client:idle` ✓

## Verificación completada
- Todos los cambios revisados y testeados ✓
- Build exitoso ✓
- Performance optimizada (eliminación de código duplicado) ✓

## Próximos pasos
- Ejecutar `npm run build` para generar artefactos de producción
- Ejecutar `npm run preview` para verificar despliegue
- `TarjetasKpiAnimadas.vue` puede integrarse en futuras iteraciones

## Checklist de revisión
- [x] Estructura del proyecto documentada
- [x] Componentes Vue descritos con funcionalidad
- [x] Datos centralizados identificados
- [x] Cambios recientes registrados
- [x] Estado final verificado
- [ ] Ejecutar build de producción
- [ ] Verificar desplieque con `npm run preview`
- [ ] Integrar `TarjetasKpiAnimadas.vue`
- [ ] Revisar métricas de performance post-build