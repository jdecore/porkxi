## Resumen de correcciones realizadas

### Archivo: `src/lib/datos-grafico.js`
1. **Corregido import circular**: El archivo estaba importando de sí mismo (`import { ... } from './datos-grafico.js'`), creando un bucle infinito
2. **Reestructurado el módulo**: Se organizaron las importaciones de los archivos de datos externos (`../data/colombia.js` y `../data/usa.js`)
3. **Expuestas funciones necesarias**: Se exportan `SERIE_COLOMBIA`, `SERIE_USA` y otras funciones auxiliares para que sean usadas por el componente Vue
4. **Datos normalizados**: Se mantiene `datosGrafico` como objeto con todas las funciones helper centralizadas

### Archivo: `src/components/GraficaInteractiva.vue`
1. **Importaciones corregidas**: Se importan los datos correctamente desde `../lib/datos-grafico.js`
2. **Uso de datos normalizados**: Toda la lógica de la gráfica ahora usa `datosValidados.value.colombia` y `datosValidados.value.usa` en lugar de referencias directas a `SERIE_COLOMBIA`/`SERIE_USA`
3. **Dimensiones ajustadas**: Se redujo el 10% el tamaño del contenedor (de 907×378 a 816×340 px) como solicitó el usuario
4. **Coordenadas actualizadas**: Todas las posiciones de puntos, líneas y ejes se recalcularon para las nuevas dimensiones:
   - Punto inicial: 86 (antes 98)
   - Ancho de área de gráfica: 756 (antes 1176)
   - ViewBox: `0 0 756 476` (antes `0 0 1176 529`)
5. **Lógica de etiquetas X**: Se corrigió para usar `datosValidados.value` en lugar de `datosColonia`/`datosUsa`

### Resultado final
- ✅ Build exitoso sin errores de módulos
- ✅ Datos centralizados correctamente en `src/lib/datos-grafico.js`
- ✅ Componente Vue interactivo funcionando con los datos compartidos
- ✄ Compresión activada (Brotli + Gzip)
- ✅ Hydration configurada en `client:idle`
- ✅ Tamaño reducido en 10% como solicitado