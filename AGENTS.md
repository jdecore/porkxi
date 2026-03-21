# AGENTS.md - Guía para el agente

## Estado actual del proyecto

La aplicación React "porkξ" ha sido creada desde cero con la siguiente estructura:

### Archivos existentes (ya creados)
- `package.json` - Configuración de dependencias (React 18, Recharts, Vite)
- `vite.config.js` - Configuración de Vite
- `index.html` - HTML base
- `.gitignore` - Ignora node_modules, dist, .env
- `src/datos/colombia.js` - Datos de Colombia (serie histórica, detalle, problemas)
- `src/datos/usa.js` - Datos de USA (serie histórica, detalle)
- `src/index.css` - Estilos globales con variables CSS
- `src/estilos/variables.css` - Variables de diseño
- `src/estilos/encabezado.css` - Estilos del componente Encabezado
- `src/estilos/alerta.css` - Estilos del componente BannerAlerta
- `src/estilos/tarjetas.css` - Estilos de tarjetas KPI
- `src/estilos/grafica.css` - Estilos de la gráfica principal
- `src/estilos/frecuencia.css` - Estilos de comparativa de frecuencia
- `src/estilos/detalle.css` - Estilos de detalle del reporte
- `src/estilos/tabla.css` - Estilos de tabla histórica
- `src/estilos/explicacion.css` - Estilos de sección explicativa
- `src/estilos/pieDepagina.css` - Estilos del pie de página
- `src/main.jsx` - Punto de entrada de React
- `src/App.jsx` - Componente principal
- `src/componentes/Encabezado.jsx`
- `src/componentes/BannerAlerta.jsx`
- `src/componentes/TarjetaKpi.jsx`
- `src/componentes/TarjetasKpi.jsx`
- `src/componentes/GraficaPrincipal.jsx`
- `src/componentes/ComparativaFrecuencia.jsx`
- `src/componentes/DetalleUltimoReporte.jsx`
- `src/componentes/TablaHistorica.jsx`
- `src/componentes/Explicacion.jsx`
- `src/componentes/PieDePagina.jsx`
- `README.md` - Documentación del proyecto

## Cómo continuar desde aquí

Si hay un error o necesitas hacer modificaciones:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

3. **Verificar que todo funciona:**
   - Abrir http://localhost:5173
   - Verificar que aparecen:
     - Logo "porkξ" con la letra xi
     - Banner de alerta
     - 4 tarjetas KPI
     - Gráfica comparativa
     - Comparativa de frecuencia
     - Detalle de reportes
     - Tabla histórica
     - Sección explicativa
     - Pie de página

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## Notas importantes

- Todos los datos están hardcodeados en `src/datos/colombia.js` y `src/datos/usa.js`
- No hay llamadas a APIs externas
- Los colores y variables de diseño están en `src/estilos/variables.css`
- La aplicación usa Recharts para las gráficas
- El diseño es responsive con breakpoint en 700px
- No usar emojis de cerdo (🐷) en ningún lugar
- La fuente es Playfair Display para títulos y DM Sans para texto
