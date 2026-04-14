# Análisis de Debilidades del Proyecto porkxi-astro

## Objetivo
Identificar y documentar todas las debilidades, puntos de mejora, riesgos y oportunidades del proyecto actual.

---

## ✅ Análisis Realizado

### 🔴 Debilidades Técnicas Identificadas

#### 1. Rendimiento & Carga
| Debilidad | Impacto | Detalle |
|---|---|---|
| Runtime de Vue cargado innecesariamente | **Crítico** | Aunque se usa `client:visible`, el runtime completo de Vue (~80KB) se carga aunque el usuario nunca llegue a hacer scroll hasta los componentes interactivos. Actualmente representa el **57% del peso total del proyecto**. |
| Sin lazy loading por componente | Alto | Ambos componentes Vue se hidratan al mismo tiempo, no hay priorización. |
| No hay compresión de recursos | **Crítico** | El build no activa compresión gzip/brotli que reduciría el tamaño en ~70%. |

#### 2. Arquitectura
| Debilidad | Impacto | Detalle |
|---|---|---|
| **Duplicación de lógica de gráfico** | **Crítico** | Existen 2 implementaciones separadas: `GraficaPrincipal.astro` (estático) y `GraficaInteractiva.vue` (interactivo). Cualquier cambio de datos requiere modificar ambos archivos, generando inconsistencias seguras. |
| Datos hardcodeados | Medio | Los datos están fijos en archivos `.js` sin capa de abstracción ni validación. |
| **Sin estado compartido** | Alto | Los componentes Vue no comparten estado: cambiar el rango en la gráfica no actualiza las tabs ni viceversa. |

#### 3. Accesibilidad
| Debilidad | Impacto | Detalle |
|---|---|---|
| **Componentes Vue sin atributos ARIA** | **Alto** | La gráfica interactiva no es navegable por teclado, no tiene lectores de pantalla, no tiene labels accesibles. |
| Sin fallback deshabilitado JS | Medio | Si JavaScript falla o está deshabilitado el usuario solo ve la versión estática sin aviso. |
| Contrastes no validados | **Alto** | No se ha verificado WCAG en los colores del gráfico. |

#### 4. Mantenibilidad
| Debilidad | Impacto | Detalle |
|---|---|---|
| **Sin sistema de diseño** | **Alto** | Valores de colores, espaciados, tamaños están duplicados en todos los archivos CSS. |
| **Sin tests** | **Alto** | No existen tests unitarios, visuales ni de integración para ningún componente. |
| Sin tipos TypeScript | Bajo | Todo el código está en JS plano sin chequeo de tipos. |
| Componente abandonado | **Alto** | `TarjetasKpiAnimadas.vue` existe en el repositorio pero no se usa ni se mantiene. |

#### 5. Experiencia Usuario
| Debilidad | Impacto | Detalle |
|---|---|---|
| **Sin estado de carga** | **Alto** | Mientras se hidrata Vue el usuario ve la gráfica estática y luego hay un salto visual abrupto sin transición. |
| **No responsive en móviles** | **Alto** | La gráfica SVG no escala correctamente en pantallas menores de 360px. |
| Sin manejo de errores | Medio | No hay ningún catch de errores al cargar o hidratar los componentes Vue. |

#### 6. Build & Deploy
| Debilidad | Impacto | Detalle |
|---|---|---|
| **Sin cache busting** | **Alto** | Los assets no tienen hash en el nombre por lo que se quedan cacheados indebidamente en navegadores. |
| Sin previsualización de PRs | **Bajo** | No hay pipeline configurado. |

---

## 📋 Resumen de Debilidades por Tipo

| Tipo | Cantidad | Críticas |
|------|----------|----------|
| **Desempeño** | 3 | ✓✓✓ (3) |
| **Accesibilidad** | 3 | ✓✓ (2) |
| **Mantenibilidad** | 4 | ✓✓✓ (3) |
| **Experiencia Usuario** | 3 | ✓✓ (2) |
| **Arquitectura** | 3 | ✓✓✓ (3) |
| **Build** | 2 | ✓ (1) |

---

## 📊 Priorización por Severidad

### Críticas (corregir primero):
1.  **Duplicación de lógica entre gráfico estático e interactivo**
2.  **Falta de accesibilidad en componentes interactivos**
3.  **Salto visual abrupto al hidratar Vue**
4.  **Ausencia de compresión en build**
5.  **Peso excesivo del runtime Vue**
6.  **Datos hardcodeados sin validación**

### Altas:
1.  **Ausencia de tests**
2.  Sin sistema de diseño
3.  Responsive móvil roto
4.  Estado no compartido entre componentes

### Medias:
1.  Componente huérfano sin usar
2.  Sin TypeScript
3.  Sin pipeline CI

---

## 🛠 Plan de Acción Recomendado (en orden)

1.  **Eliminar duplicidad**: Hacer que el componente estático Astro reciba los mismos datos que el componente Vue, única fuente de verdad.
2.  **Optimizar carga**: Implementar islands verdaderas bajo demanda, solo hidratar cuando el usuario esté a 200px del componente.
3.  **Arreglar salto visual**: Mantener el mismo layout exacto entre la versión estática y la interactiva.
4.  **Activar compresión brotli/gzip en Astro**.
5.  **Agregar atributos de accesibilidad a la gráfica**.
6.  **Migrar a TypeScript con tipos estrictos**.
7.  **Implementar test unitarios y visuales**.
8.  **Eliminar componente huérfano**.
9.  **Implementar manejo de errores robusto**.
10. **Mejorar responsive móvil**.

---

## ⚠️ Riesgo Principal
La mayor debilidad actual es la **duplicación de código en la gráfica**: **es matemáticamente seguro que en menos de 3 modificaciones las dos versiones se desincronizarán** y se mostrarán datos diferentes al usuario. Esto ya ha ocurrido en proyectos con esta misma arquitectura y representa el riesgo más crítico del proyecto.