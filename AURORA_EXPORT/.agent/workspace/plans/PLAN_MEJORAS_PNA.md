# PLAN DE MEJORAS — PNA Legal

> **Estado:** RECOPILACIÓN
> **Regla:** NO implementar hasta orden "listo vamos a producción"
> **Creado:** 2026-04-01

---

## Mejoras Recopiladas

### #1 — REGINAVE: Parser PDFs + Buscador + Vinculación con Expedientes

**Descripción:**
Actualmente `data/reginave.ts` contiene datos parseados desde un HTML, pero los PDFs oficiales (`REGINAVE 2024.pdf` y `REGINAVE 2025.pdf`) no se están usando como fuente. Se necesita:

1. **Parsear ambos PDFs** para extraer TODO el articulado completo de cada versión (2024 y 2025)
2. **Estructurar las leyes** con: número de artículo, título, contenido, libro/título, capítulo, sección, versión (2024/2025)
3. **Crear buscador avanzado** en la página Reginave con:
   - Búsqueda por número de artículo (ej: "903.0202")
   - Búsqueda por palabras clave en contenido
   - Filtro por versión (2024, 2025, ambas)
   - Filtro por libro/capítulo
   - Highlights de coincidencias
4. **Vincular con expedientes** — regla de negocio:
   - Si el expediente/sumario se inició **antes de 2025** → corresponde **REGINAVE 2024**
   - Si el expediente/sumario se inició **en 2025 o después** → corresponde **REGINAVE 2025**
   - El sistema debe determinar automáticamente qué versión aplicar según la fecha de inicio del caso

**Archivos a tocar:**
- `REGINAVE 2024.pdf`, `REGINAVE 2025.pdf` — origen de datos
- `data/reginave.ts` — reestructurar con campo `version: "2024" | "2025"`
- `pages/Reginave.tsx` — rediseñar con filtros avanzados y highlights
- `parse_reginave.js` — reescribir para usar `pdfjs-dist` (ya instalado)
- `types.ts` — agregar campo `version` a `ReginaveArticle`
- `utils/reginaveSearch.ts` — NUEVO: motor de búsqueda con scoring
- `pages/CaseDetail.tsx` — agregar sección "Artículos aplicables"
- `context/CaseContext.tsx` — agregar función para vincular artículos a casos

**Dependencias:**
- `pdfjs-dist` ya está en `package.json` ✅
- No hay dependencias externas nuevas

**Criterio de aceptación:**
- [ ] Todos los artículos de REGINAVE 2024 y 2025 extraídos y estructurados
- [ ] Buscador funcional con filtros por versión, libro, capítulo
- [ ] Cada expediente muestra artículos REGINAVE aplicables
- [ ] Búsqueda retorna resultados en <100ms
- [ ] Highlights visuales en coincidencias

---

### #2 — OCR: Exportar a PDF/Word + Validación de Texto Ambiguo

**Descripción:**
Actualmente el OCR (`utils/ocr.ts`) extrae texto de imágenes y lo muestra en pantalla, pero no permite exportar el resultado a un archivo descargable ni valida texto de baja confianza. Se necesita:

1. **Exportación a PDF o Word** — después de uno o múltiples escaneos, el usuario elige el formato de salida:
   - **PDF**: documento con el texto extraído, formateado con encabezados, numeración de páginas y metadata del escaneo
   - **Word (.docx)**: documento editable con el texto extraído, usando la librería `docx` (ya instalada)
   - Si son múltiples escaneos, cada uno va como una sección/página separada

2. **Validación de texto ambiguo** — antes de generar el archivo final:
   - Tesseract retorna un `confidence` score por cada palabra reconocida
   - Las palabras con confianza baja (< 60%) se marcan como "sospechosas"
   - Se muestra al usuario un modal de revisión con las palabras dudosas resaltadas
   - El usuario puede corregir manualmente cada palabra antes de exportar
   - Opción "Aceptar todo" si confía en el resultado

3. **Cola de escaneos múltiples** — permitir acumular varios escaneos antes de exportar:
   - Botón "Agregar otro escaneo" en lugar de exportar inmediatamente
   - Preview de todos los escaneos acumulados con su texto extraído
   - Botón "Exportar todo" que genera un único archivo con todas las páginas

**Archivos a tocar:**
- `utils/ocr.ts` — agregar interfaz `OCRResult` con `confidence` por palabra, función `getLowConfidenceWords()`
- `utils/ocrExport.ts` — NUEVO: funciones `exportToPDF()` y `exportToWord()`
- `components/NewSummaryModal.tsx` — agregar flujo post-OCR: revisión de texto ambiguo + selector de formato
- `components/AuroraChatPopup.tsx` — agregar exportación en tab OCR
- `components/OCRReviewModal.tsx` — NUEVO: modal para revisar palabras de baja confianza
- `components/ScanQueue.tsx` — NUEVO: componente para gestionar cola de escaneos múltiples

**Dependencias:**
- `docx` ya está en `package.json` ✅ (para exportar Word)
- `pdfjs-dist` ya está en `package.json` ✅ (para leer PDFs existentes)
- No se necesitan dependencias nuevas para PDF (usar `window.print()` o `jsPDF` si se prefiere control)

**Criterio de aceptación:**
- [ ] OCR retorna confidence score por palabra
- [ ] Palabras con confianza < 60% se muestran para revisión
- [ ] Usuario puede corregir palabras antes de exportar
- [ ] Exportación a PDF funciona con múltiples escaneos
- [ ] Exportación a Word (.docx) funciona con múltiples escaneos
- [ ] Cola de escaneos permite acumular y exportar todo junto

---

### #3 — Identificación de Nombres: Personas vs Buques + Edición Inline Rápida

**Descripción:**
Actualmente el motor de extracción (`textAnalysis.ts`) tiene dificultades para distinguir nombres de personas de nombres de buques cuando coinciden, y la edición de datos extraídos requiere abrir un modal completo. Se necesita:

#### A. Identificación precisa de nombres (Personas vs Buques)
1. **Detección dual en carátula** — cuando la carátula menciona tanto una persona como un buque:
   - Ejemplo: `"CONTRA B/P JUAN CARLOS (MAT 1234) — CAP. MARÍA GARCÍA DNI 25.000.000"`
   - Debe extraer AMBOS: el buque "JUAN CARLOS" con matrícula Y la persona "MARÍA GARCÍA" con DNI
   - Actualmente solo detecta uno y pierde el otro

2. **Mejorar limpieza de nombres de personas**:
   - La lista `ranksAndTitles` es buena pero incompleta — agregar más rangos navales argentinos
   - Cuando un nombre aparece DESPUÉS de un prefijo de buque (B/P, M/V), NO confundirlo con el nombre del buque
   - Estrategia: primero extraer buques con su patrón estricto (nombre + matrícula), luego buscar personas en el texto RESTANTE

3. **Prioridad de extracción**:
   - Si hay DNI → la persona está antes o después del DNI (ya funciona, mejorar falsos positivos)
   - Si NO hay DNI → buscar después de "CONTRA", "IMPUTADO", "CAUSANTE", "CAP.", "SR."
   - Nombres de buques SIEMPRE van con prefijo (B/P, M/V, G/C, L/C) o entre comillas

4. **Validación cruzada con carátula**:
   - La carátula contiene el nombre completo del causante y del buque
   - Usar la carátula como fuente de verdad para validar los nombres extraídos
   - Si el causante detectado coincide con un nombre de buque → marcar como "posible confusión" para revisión

#### B. Edición inline rápida en tabla de revisión
1. **Celdas editables directamente** en la tabla de review (sin abrir modal):
   - Click en cualquier celda → se convierte en input editable
   - Enter para confirmar, Escape para cancelar
   - Solo se modifica ese campo, no se abre ningún modal

2. **Edición selectiva por columna**:
   - Botón rápido "Editar Etapa" → solo las celdas de etapa se vuelven editables
   - Botón "Editar Causante" → solo celdas de causante editables
   - Botón "Editar Sumario" → solo celdas de sumario editables
   - Así el usuario puede hacer correcciones masivas de un solo campo rápidamente

3. **Indicadores visuales**:
   - Celdas con datos dudosos (baja confianza) con borde amarillo
   - Celdas editables con hover effect
   - Badge de "modificado" en celdas que fueron cambiadas

**Archivos a tocar:**
- `utils/textAnalysis.ts` — reescribir lógica de extracción de nombres, detección dual persona+buque
- `utils/textAnalysis.ts` — expandir `ranksAndTitles`, mejorar regex de buques
- `components/NewSummaryModal.tsx` — reemplazar modal de edición por tabla con celdas inline editables
- `components/InlineEditCell.tsx` — NUEVO: componente de celda editable inline
- `components/QuickEditToolbar.tsx` — NUEVO: barra de herramientas para edición selectiva por columna

**Dependencias:**
- No se necesitan dependencias nuevas

**Criterio de aceptación:**
- [ ] Extrae correctamente persona Y buque cuando ambos están en la carátula
- [ ] Nombres de buques con prefijo se extraen exactos (sin rangos ni títulos adjuntos)
- [ ] Nombres de personas limpios de rangos/títulos
- [ ] Tabla de review con celdas inline editables
- [ ] Toolbar para edición selectiva por columna
- [ ] Sin modales de edición para cambios simples

---

### #4 — Generador de Documentos: Auto-llenado + Múltiples Involucrados en Cédulas

**Descripción:**
Actualmente `DocumentGeneratorModal.tsx` pre-llena datos básicos del caso pero tiene limitaciones:
- Solo permite un destinatario por documento
- No usa los datos de `causantes` del caso (que ya tiene DNI, nombre, domicilio, teléfono, email)
- No permite generar cédulas para múltiples involucrados de una vez

Se necesita:

#### A. Auto-llenado completo desde datos del caso
1. **Pre-llenar TODOS los campos disponibles** del expediente seleccionado:
   - Nombre del causante principal → campo Destinatario
   - DNI del causante → campo DNI
   - Domicilio → campo Domicilio
   - Carátula → campo Hecho Imputado
   - Tipo de infracción → campo Infracción/Norma
   - Número de sumario → se usa automáticamente en el cuerpo del documento
   - Etapa procesal → se usa para determinar el tipo de documento sugerido

2. **Usar `causantes[]` como fuente de verdad** en lugar de campos legacy (`vessel`, `dni`):
   - Iterar sobre `caseData.causantes` para obtener datos completos
   - Mostrar tipo de causante (Persona/Buque/Empresa) en el documento
   - Si es Buque → incluir matrícula en el documento
   - Si es Empresa → incluir CUIT si está disponible

#### B. Múltiples involucrados en Cédulas
1. **Sección "Involucrados a citar"** dentro del modal Cédula:
   - Lista de todos los causantes del caso con checkbox
   - Todos seleccionados por defecto
   - Botón **+ Agregar involucrado** → input inline para agregar manualmente un destinatario que no esté en la lista (terceros, testigos, etc.)
   - Cada involucrado agregado manualmente tiene campos: Nombre, DNI, Domicilio

2. **Generación masiva**:
   - Opción A: Generar un Word por involucrado (descarga múltiple)
   - Opción B: Generar un Word único con todas las cédulas (una por página)
   - Selector de formato al confirmar

3. **Template de cédula mejorado**:
   - Si es Persona → "Señor/a: [nombre], DNI N° [dni]"
   - Si es Buque → "Señor Capitán del [nombre del buque], Matrícula N° [matrícula]"
   - Si es Empresa → "Señores representantes de [razón social], CUIT [cuit]"

**Archivos a tocar:**
- `components/DocumentGeneratorModal.tsx` — reescribir con auto-llenado completo, sección de múltiples involucrados, botón +, generación masiva
- `components/InvolucradoSelector.tsx` — NUEVO: componente para seleccionar/agregar involucrados
- `components/DocumentGeneratorModal.tsx` — mejorar templates de cédula para Persona/Buque/Empresa

**Dependencias:**
- `docx` ya instalada ✅
- No se necesitan dependencias nuevas

**Criterio de aceptación:**
- [ ] Al abrir el modal, TODOS los campos están pre-llenados con datos del caso
- [ ] Sección de involucrados con checkboxes y botón + para agregar manualmente
- [ ] Generación masiva: un Word por involucrado o todos en uno
- [ ] Templates diferenciados para Persona, Buque y Empresa
- [ ] Involucrados agregados manualmente se pueden editar antes de generar

---

### #5 — Documentos Base: Templates Reales como Origen de Documentos

**Descripción:**
Actualmente `DocumentGeneratorModal.tsx` genera documentos desde cero usando la librería `docx` con contenido hardcodeado. Esto produce documentos genéricos que no coinciden con los formatos oficiales de la PNA.

En la carpeta `DOCUMENTOS BASE/` existen **12 archivos reales** que son los templates oficiales:

| Archivo | Tipo | Formato |
|---------|------|---------|
| `CEDULA DE CITACION PRESENCIAL.doc` | Cédula | Word |
| `CEDULA DE CITACION PRESENCIAL.pdf` | Cédula | PDF (referencia) |
| `CEDULA_ARIEL_ADALBERTO_CORONEL_Y_OTRO.docx` | Cédula | Word |
| `INDAGATORIA modelo.doc` | Indagatoria | Word |
| `INDAGATORIA modelo.pdf` | Indagatoria | PDF (referencia) |
| `CARGOS_EL FARO.docx` | Formulación de cargos | Word |
| `FORMULACION DE CARGOS AMPLIATORIA 207-2021.docx` | Cargos ampliatoria | Word |
| `DISPOSICION RESOLUTORIA NAUTICO DEPORTIVO - EXTRANJERO.docx` | Disposición resolutoria | Word |
| `Ej jurisdiccion 234-22 abreviado.docx` | Ejercicio de jurisdicción | Word |
| `vistas e indice 400-21.docx` | Vistas e índice | Word |
| `REGINAVE 2025.pdf` | Normativa | PDF |
| `REGINAVE 2019 al 2024.pdf` | Normativa | PDF |

Se necesita:

#### A. Sistema de templates basados en archivos reales
1. **Cargar el template .doc/.docx correspondiente** al tipo de documento seleccionado
2. **Identificar placeholders** en los templates (ej: `[NOMBRE]`, `[DNI]`, `[SUMARIO]`, `[FECHA]`, `[DOMICILIO]`, `[CARATULA]`, `[INFRACCION]`)
3. **Reemplazar placeholders** con datos reales del expediente seleccionado
4. **Generar el documento final** con el formato oficial intacto (márgenes, fuentes, logos, sellos)

> ⚠️ **REGLA CRÍTICA:** Los documentos generados deben ser **INDISTINGUIBLES** de los templates originales. Solo cambian los datos variables. NO se modifica estructura, formato, tipografía, espaciado, márgenes, ni ningún elemento visual del template original. El documento resultante debe pasar como el documento oficial.

#### B. Mapeo de templates a tipos de documento
| Tipo en App | Template Base | Placeholders esperados |
|-------------|---------------|----------------------|
| CÉDULA | `CEDULA DE CITACION PRESENCIAL.doc` | `[DESTINATARIO]`, `[DNI]`, `[DOMICILIO]`, `[FECHA_COMPARECENCIA]`, `[HORA]`, `[NUMERO_SUMARIO]`, `[CARATULA]` |
| INDAGATORIA | `INDAGATORIA modelo.doc` | `[NOMBRE]`, `[DNI]`, `[DOMICILIO]`, `[NUMERO_SUMARIO]`, `[CARATULA]`, `[FECHA]` |
| CARGOS | `CARGOS_EL FARO.docx` | `[NOMBRE]`, `[DNI]`, `[DOMICILIO]`, `[NUMERO_SUMARIO]`, `[CARATULA]`, `[INFRACCION]`, `[ARTICULOS]` |
| CARGOS AMPLIATORIA | `FORMULACION DE CARGOS AMPLIATORIA 207-2021.docx` | Mismos placeholders + `[CARGOS_PREVIOS]` |
| DISPOSICION RESOLUTORIA | `DISPOSICION RESOLUTORIA NAUTICO DEPORTIVO - EXTRANJERO.docx` | `[NOMBRE]`, `[DNI]`, `[NUMERO_SUMARIO]`, `[CARATULA]`, `[RESOLUCION]` |
| EJERCICIO JURISDICCION | `Ej jurisdiccion 234-22 abreviado.docx` | `[NUMERO_SUMARIO]`, `[CARATULA]`, `[FECHA]`, `[INSTRUCTOR]` |
| VISTAS E INDICE | `vistas e indice 400-21.docx` | `[NUMERO_SUMARIO]`, `[CARATULA]`, `[CAUSANTES]`, `[ETAPAS]` |

#### C. Parser de templates
1. **Leer archivos .doc/.docx** con `mammoth` (ya instalado) o `docx` library
2. **Extraer estructura** del documento (párrafos, tablas, formato)
3. **Buscar y reemplazar** placeholders manteniendo formato original
4. **Guardar documento procesado** con nombre descriptivo: `{TIPO}_{CAUSANTE}_{NUMERO_SUMARIO}.docx`

**Archivos a tocar:**
- `components/DocumentGeneratorModal.tsx` — reescribir para usar templates en vez de hardcodear
- `utils/templateEngine.ts` — NUEVO: motor de carga y reemplazo de templates
- `utils/templateMapper.ts` — NUEVO: mapeo de tipos de documento a archivos template
- `DOCUMENTOS BASE/` — directorio de templates (no modificar, solo leer)
- `pages/CaseDetail.tsx` — actualizar botón "Generar Doc" para usar nuevo sistema

**Dependencias:**
- `mammoth` ya instalado ✅ (para leer .docx)
- `docx` ya instalada ✅ (para manipular y generar .docx)
- `pdfjs-dist` ya instalado ✅ (para leer PDFs de referencia)

**Criterio de aceptación:**
- [ ] Cada tipo de documento carga su template real de `DOCUMENTOS BASE/`
- [ ] Placeholders se reemplazan con datos del expediente
- [ ] **Formato 100% idéntico al original** — márgenes, fuentes, espaciado, logos, sellos intactos
- [ ] **Documento generado indistinguible del template** — solo cambian los datos variables
- [ ] Soporte para los 7+ tipos de documento existentes
- [ ] Si un template no existe, fallback al generador actual (no romper)
- [ ] Verificación visual: comparar lado a lado con el template original, no debe haber diferencias de formato

---

### #6 — Post-Generación: Preguntar Cambio de Etapa del Expediente

**Descripción:**
Cada vez que se genera un documento desde `DocumentGeneratorModal`, el sistema debe preguntar automáticamente si la etapa procesal del expediente cambió, ya que la generación de ciertos documentos implica un avance en el proceso.

#### A. Detección automática de etapa sugerida
| Documento generado | Etapa sugerida |
|-------------------|----------------|
| CÉDULA DE CITACIÓN | `CITACION TESTIMONIAL` |
| INDAGATORIA | `PRIMERA CITACION INDAGATORIA` o `DECLARACION INDAGATORIA` |
| FORMULACIÓN DE CARGOS | `DISPOSICION CON FORMULACION DE CARGOS` |
| NOTIFICACIÓN DE CARGOS | `NOTIFICACION DISP. FORMULACION DE CARGOS` |
| DISPOSICIÓN RESOLUTORIA | `DISPOSICION RESOLUTORIA` |
| RECURSO/DESCARGOS | `RECURSO O DESCARGOS` |
| ELEVACIÓN A CAMARA | `GIRADO A CAMARA` |
| VISTAS E ÍNDICE | `ELEVACION VISTA E INDICE` |

#### B. Flujo post-generación
1. **Después de generar y descargar** el documento → mostrar modal breve:
   - "¿El expediente avanzó de etapa?"
   - Mostrar etapa actual vs etapa sugerida
   - Opciones:
     - ✅ "Sí, actualizar a [etapa sugerida]"
     - 🔄 "Sí, pero seleccionar otra etapa" → abre selector de etapas
     - ❌ "No, la etapa sigue igual"
2. **Si confirma** → actualiza `case.stage` inmediatamente
3. **Si selecciona otra** → modal con lista de etapas disponibles
4. **Si rechaza** → no hace nada, solo cierra

**Archivos a tocar:**
- `components/DocumentGeneratorModal.tsx` — agregar flujo post-generación con modal de confirmación de etapa
- `components/StageUpdatePrompt.tsx` — NUEVO: componente de prompt de actualización de etapa
- `context/CaseContext.tsx` — asegurar que `updateCase` actualiza etapa correctamente

**Dependencias:**
- No se necesitan dependencias nuevas

**Criterio de aceptación:**
- [ ] Después de generar cualquier documento, se pregunta por cambio de etapa
- [ ] Etapa sugerida es correcta según el tipo de documento
- [ ] Usuario puede confirmar, cambiar a otra etapa, o rechazar
- [ ] Si confirma, la etapa se actualiza inmediatamente en el expediente
- [ ] No bloquea la descarga del documento (pregunta después de descargar)

---

### #7 — Flujos de Documentos por Tipo de Sumario (Investigativo vs Abreviado)

**Descripción:**
Existen dos tipos de sumarios con flujos documentales distintos. El sistema debe respetar el orden correcto de generación de documentos según el tipo y la etapa actual del expediente.

#### A. Sumario Investigativo (Administrativo)
Orden obligatorio de documentos:

| # | Etapa | Documento a generar |
|---|-------|-------------------|
| 1 | INICIO DE ACTUACIONES | — |
| 2 | CITACION TESTIMONIAL | Cédula de citación testimonial |
| 3 | DECLARACION TESTIMONIAL | Acta de declaración testimonial |
| 4 | CITACION INDAGATORIA | Cédula de citación indagatoria |
| 5 | DECLARACION INDAGATORIA | Acta de declaración indagatoria |
| 6 | FORMULACION DE CARGOS | Disposición con formulación de cargos |
| 7 | EJERCICIO JURISDICCION | Disposición de ejercicio de jurisdicción |
| 8 | ELEVACION VISTA E INDICE | Vistas e índice |
| 9 | DISPOSICION RESOLUTORIA | Disposición resolutoria |

**Flujo alternativo — Rebeldía:**
Si el imputado NO se presenta a la Citación Indagatoria (etapa 4):
- Se genera **Disposición de Rebeldía**
- Se genera **Notificación de Rebeldía** (template por agregar a `DOCUMENTOS BASE/`)
- Después de notificada la rebeldía → se continúa con Formulación de Cargos (etapa 6)

#### B. Sumario Abreviado
Orden de documentos:

| # | Etapa | Documento a generar |
|---|-------|-------------------|
| 1 | INICIO DE ACTUACIONES | — |
| 2 | EMPLAZAMIENTO | Cédula de emplazamiento (al Capitán, Empresa o Taller) |
| 3a | Si NO se presenta → REBELDIA | Disposición de Rebeldía + Notificación de Rebeldía |
| 3b | Si se presenta → DERECHO DE DEFENSA | Acta de Derecho de Defensa (template pendiente de subir a `DOCUMENTOS BASE/`) |
| 4 | SOLICITAR ANTECEDENTES | — (recordatorio: solicitar antecedentes de Empresa y Taller) |
| 5 | EJERCICIO JURISDICCION | Disposición de ejercicio de jurisdicción |
| 6 | VISTA E INDICE | Vistas e índice |
| 7 | DISPOSICION RESOLUTORIA | Disposición resolutoria |

#### C. Recordatorios de archivos pendientes
Algunos templates aún no están en `DOCUMENTOS BASE/`. El sistema debe mostrar recordatorios visuales:

| Archivo pendiente | Ubicación | Estado |
|------------------|-----------|--------|
| Acta de Derecho de Defensa | `DOCUMENTOS BASE/` | ⏳ Pendiente de subir |
| Disposición de Rebeldía | `DOCUMENTOS BASE/` | ⏳ Pendiente de subir |
| Notificación de Rebeldía | `DOCUMENTOS BASE/` | ⏳ Pendiente de subir |

**Implementación de recordatorios:**
- Banner en `CaseDetail.tsx` cuando el expediente esté en una etapa que requiere un template pendiente
- Botón "Subir Template" que abre selector de archivos para agregar a `DOCUMENTOS BASE/`
- Lista de templates faltantes visible en la sección de documentos del expediente

#### D. Implementación en el sistema
1. **Validar orden de documentos** — al generar un documento, verificar que las etapas anteriores estén completas
2. **Mostrar documentos disponibles** — según la etapa actual, solo mostrar los documentos que corresponden generar
3. **Alertar saltos de etapa** — si el usuario intenta generar un documento fuera de orden, advertir pero permitir (puede haber excepciones)
4. **Rebeldía como sub-ruta** — agregar opción "Imputado no se presentó → Generar Rebeldía" dentro del flujo de Citación Indagatoria
5. **Template de Rebeldía pendiente** —预留 espacio para cuando se agregue el template de Disposición de Rebeldía y Notificación de Rebeldía a `DOCUMENTOS BASE/`

**Archivos a tocar:**
- `components/DocumentGeneratorModal.tsx` — filtrar documentos disponibles según tipo de sumario y etapa actual
- `utils/documentFlow.ts` — NUEVO: definición de flujos por tipo, validación de orden, detección de saltos
- `components/DocumentGeneratorModal.tsx` — agregar sub-ruta de rebeldía en flujo investigativo Y abreviado
- `pages/CaseDetail.tsx` — mostrar documentos disponibles vs ya generados + recordatorios de templates pendientes
- `types.ts` — agregar campo `documentsGenerated: string[]` a SummaryCase
- `components/MissingTemplateBanner.tsx` — NUEVO: banner de recordatorio para templates faltantes
- `components/TemplateUploader.tsx` — NUEVO: componente para subir templates faltantes

**Dependencias:**
- Template de Disposición de Rebeldía (pendiente de agregar a `DOCUMENTOS BASE/`)
- Template de Notificación de Rebeldía (pendiente de agregar a `DOCUMENTOS BASE/`)

**Criterio de aceptación:**
- [ ] Sumario investigativo solo muestra documentos en orden correcto
- [ ] Sumario abreviado solo muestra documentos de su flujo corregido
- [ ] Alerta si se intenta generar documento fuera de orden
- [ ] Sub-ruta de rebeldía disponible en AMBOS tipos si el involucrado no se presenta
- [ ] Acta de Derecho de Defensa como paso obligatorio en abreviado cuando se presenta
- [ ] Recordatorio de solicitar antecedentes de Empresa y Taller en abreviado
- [ ] Banner de templates pendientes visible en expedientes que los necesiten
- [ ] Botón "Subir Template" funcional para agregar archivos faltantes
- [ ] Historial de documentos generados visible en el expediente

---

## Plan de Tareas (se genera al decir "listo")

| # | Tarea | Prioridad | Archivos | Detalle |
|---|-------|-----------|----------|---------|
| 1 | Parser PDFs REGINAVE | ALTA | `parse_reginave.js`, `data/reginave.ts` | Extraer articulado completo de ambos PDFs usando pdfjs-dist |
| 2 | Motor de búsqueda | ALTA | `utils/reginaveSearch.ts` (nuevo) | Búsqueda por artículo, keywords, filtros con scoring |
| 3 | UI Reginave mejorada | MEDIA | `pages/Reginave.tsx` | Filtros por versión/libro/capítulo, highlights, breadcrumbs |
| 4 | Vinculación expedientes | ALTA | `pages/CaseDetail.tsx`, `context/CaseContext.tsx` | Sección "Artículos aplicables" en cada expediente |
| 5 | Tipos y estructura | BAJA | `types.ts` | Agregar campo `version` y campos de metadata |
| 6 | OCR confidence scoring | ALTA | `utils/ocr.ts` | Retornar confidence por palabra, detectar palabras ambiguas |
| 7 | Modal revisión OCR | ALTA | `components/OCRReviewModal.tsx` (nuevo) | UI para corregir palabras de baja confianza |
| 8 | Exportar a PDF | MEDIA | `utils/ocrExport.ts` (nuevo) | Generar PDF con texto extraído y metadata |
| 9 | Exportar a Word | MEDIA | `utils/ocrExport.ts` (nuevo) | Generar .docx editable con librería docx |
| 10 | Cola de escaneos | MEDIA | `components/ScanQueue.tsx` (nuevo) | Acumular múltiples escaneos antes de exportar |
| 11 | Integrar en UI | BAJA | `NewSummaryModal.tsx`, `AuroraChatPopup.tsx` | Conectar nuevo flujo OCR con exportación y revisión |
| 12 | Detección dual persona+buque | ALTA | `utils/textAnalysis.ts` | Extraer ambos cuando están en la misma carátula |
| 13 | Mejorar ranksAndTitles | MEDIA | `utils/textAnalysis.ts` | Expandir lista de rangos navales argentinos |
| 14 | Celdas inline editables | ALTA | `components/InlineEditCell.tsx` (nuevo), `NewSummaryModal.tsx` | Tabla con edición directa sin modales |
| 15 | Toolbar edición selectiva | MEDIA | `components/QuickEditToolbar.tsx` (nuevo) | Botones para editar solo una columna a la vez |
| 16 | Auto-llenado documentos | ALTA | `DocumentGeneratorModal.tsx` | Pre-llenar todos los campos desde causantes del caso |
| 17 | Múltiples involucrados | ALTA | `DocumentGeneratorModal.tsx`, `InvolucradoSelector.tsx` (nuevo) | Selector con checkboxes, botón +, generación masiva |
| 18 | Templates por tipo | MEDIA | `DocumentGeneratorModal.tsx` | Templates diferenciados Persona/Buque/Empresa |
| 19 | Motor de templates | ALTA | `utils/templateEngine.ts` (nuevo), `utils/templateMapper.ts` (nuevo) | Cargar templates reales, reemplazar placeholders, mantener formato |
| 20 | Integrar templates en modal | ALTA | `DocumentGeneratorModal.tsx` | Reemplazar generador hardcodeado por sistema de templates |
| 21 | Agregar nuevos tipos | MEDIA | `DocumentGeneratorModal.tsx` | Soporte para Disposición Resolutoria, Ej. Jurisdicción, Vistas e Índice |
| 22 | Prompt post-generación | MEDIA | `DocumentGeneratorModal.tsx`, `StageUpdatePrompt.tsx` (nuevo) | Preguntar cambio de etapa después de generar documento |
| 23 | Flujos por tipo sumario | ALTA | `utils/documentFlow.ts` (nuevo), `DocumentGeneratorModal.tsx` | Definir flujo investigativo y abreviado con orden obligatorio |
| 24 | Validación de orden | ALTA | `utils/documentFlow.ts`, `DocumentGeneratorModal.tsx` | Alertar saltos de etapa, mostrar solo documentos disponibles |
| 25 | Sub-ruta rebeldía | ALTA | `DocumentGeneratorModal.tsx` | Flujo alternativo si involucrado no se presenta (ambos tipos) |
| 26 | Acta Derecho Defensa | ALTA | `DocumentGeneratorModal.tsx` | Agregar paso obligatorio en abreviado cuando se presenta |
| 27 | Recordatorio antecedentes | MEDIA | `pages/CaseDetail.tsx` | Recordatorio de solicitar antecedentes Empresa/Taller |
| 28 | Banner templates faltantes | MEDIA | `components/MissingTemplateBanner.tsx` (nuevo) | Alertar templates pendientes de subir |
| 29 | Subir templates | MEDIA | `components/TemplateUploader.tsx` (nuevo) | Componente para agregar templates faltantes a DOCUMENTOS BASE |

---

### #8 — Acta de Comprobación: OCR → Inicio Automático de Sumario + Cámara Móvil

**Descripción:**
El Acta de Comprobación es el documento que inicia TODO el proceso. Actualmente se sube como archivo genérico. Se necesita un flujo dedicado que:

1. **Escanee el Acta de Comprobación** (2 hojas) y extraiga TODOS los campos automáticamente
2. **Cree el sumario** con los datos extraídos
3. **Permita escaneo directo desde cámara del móvil**

#### A. Estructura del Acta de Comprobación (ya analizada con Tesseract)

**HOJA 1 — Campos a extraer:**
| Campo | Ubicación en el formulario |
|-------|--------------------------|
| Nro DAS / Letra / Carátula | Encabezado |
| Dependencia | "PREFECTURA MAR DEL PLATA" |
| Lugar | Puerto, Muelle |
| Fecha del hecho | Campo fecha |
| Hora del hecho | Campo hora |
| Nombre del presunto infractor | Persona Física |
| Profesión/Habilitación profesional | Campo profesión |
| DNI | Documento Nacional de Identidad |
| Documento habilitante | Licencia, matrícula |
| Domicilio real | Dirección |
| Domicilio constituido | Para actuaciones |
| Teléfono / Email | Contacto |
| Nombre del buque/emprendimiento | Buque |
| Matrícula | Del buque |
| Eslora / Manga / Puntal | Dimensiones |
| Calados (proa/popa) | Calados |
| Propietario/Armador | Propietario |
| Domicilio del propietario | Dirección |
| Relación circunstanciada del hecho | Narrativa completa |

**HOJA 2 — Campos a extraer:**
| Campo | Ubicación en el formulario |
|-------|--------------------------|
| Fotografías/Video | Evidencia |
| Disposiciones legales infringidas | Artículos REGINAVE |
| Testigo 1 (nombre, domicilio, profesión, tel) | Sección testigos |
| Testigo 2 (nombre, domicilio, profesión, tel) | Sección testigos |
| Sumario interviniente | Instructor |
| Emplazamiento y notificación | Texto legal (72hs hábiles, Art. 903.0107) |
| Firmas | Instructor, testigos, infractor |

#### B. Flujo de inicio de sumario desde Acta
1. **Botón "Iniciar desde Acta"** en el Dashboard y en Expedientes
2. **Opciones de ingreso:**
   - 📷 **Cámara del móvil** — acceso directo a cámara con botón dedicado
   - 📁 **Subir foto** — seleccionar imágenes de galería
   - 📄 **Subir PDF escaneado** — PDF con las 2 hojas
3. **OCR automático** de ambas hojas con Tesseract
4. **Revisión de datos extraídos** — tabla con todos los campos pre-llenados, editables
5. **Confirmación** → crea el expediente automáticamente con:
   - Tipo: Sumario Abreviado (por defecto, editable)
   - Etapa: INICIO DE ACTUACIONES
   - Todos los campos del Acta mapeados al caso
   - Causante: presunto infractor
   - Buque: si aplica
   - Artículos infringidos: extraídos de la hoja 2

#### C. Acceso a cámara del móvil
1. **Botón de cámara** visible y prominente en la UI
2. **Usar `navigator.mediaDevices.getUserMedia`** para acceso a cámara
3. **Captura directa** → procesa con Tesseract sin guardar archivo intermedio
4. **Guía de encuadre** — overlay visual para alinear el documento
5. **Multi-captura** — permite tomar foto de hoja 1 y luego hoja 2
6. **El documento digitalizado se incorpora a la causa** como evidencia

#### D. Modelo del Acta — Template inmutable
> ⚠️ **REGLA CRÍTICA:** El Acta generada debe ser **IDÉNTICA** al modelo oficial. NO se reconstruye desde cero. Se carga el template original y se **rellenan los campos** con los datos extraídos. El resultado es el mismo formulario visual, misma estructura, tipografía, logos — solo cambian los datos.

**Archivos a tocar:**
- `pages/ActaScanner.tsx` — NUEVO: página completa de escaneo de Acta
- `components/CameraCapture.tsx` — NUEVO: componente de cámara con getUserMedia
- `components/ActaFieldsReview.tsx` — NUEVO: tabla de revisión de campos extraídos
- `utils/actaParser.ts` — NUEVO: parser específico para estructura del Acta de Comprobación
- `utils/ocr.ts` — agregar soporte para múltiples imágenes en secuencia
- `pages/Dashboard.tsx` — agregar botón "Iniciar desde Acta"
- `pages/Cases.tsx` — agregar botón "Iniciar desde Acta"
- `context/CaseContext.tsx` — agregar función `createCaseFromActa()`

**Dependencias:**
- `tesseract.js` ya instalada ✅
- No se necesitan dependencias nuevas (cámara usa API nativa del navegador)

**Criterio de aceptación:**
- [ ] Botón de cámara funcional en móvil y desktop
- [ ] OCR de ambas hojas del Acta extrae todos los campos listados
- [ ] Tabla de revisión con campos editables antes de confirmar
- [ ] Al confirmar, se crea el expediente completo con todos los datos
- [ ] Las imágenes escaneadas se guardan como evidencia en la causa
- [ ] Funciona con fotos de galería, cámara directa y PDF escaneado

---

## Plan de Tareas (se genera al decir "listo")

| # | Tarea | Prioridad | Archivos | Detalle |
|---|-------|-----------|----------|---------|
| 1 | Parser PDFs REGINAVE | ALTA | `parse_reginave.js`, `data/reginave.ts` | Extraer articulado completo de ambos PDFs usando pdfjs-dist |
| 2 | Motor de búsqueda | ALTA | `utils/reginaveSearch.ts` (nuevo) | Búsqueda por artículo, keywords, filtros con scoring |
| 3 | UI Reginave mejorada | MEDIA | `pages/Reginave.tsx` | Filtros por versión/libro/capítulo, highlights, breadcrumbs |
| 4 | Vinculación expedientes | ALTA | `pages/CaseDetail.tsx`, `context/CaseContext.tsx` | Sección "Artículos aplicables" en cada expediente |
| 5 | Tipos y estructura | BAJA | `types.ts` | Agregar campo `version` y campos de metadata |
| 6 | OCR confidence scoring | ALTA | `utils/ocr.ts` | Retornar confidence por palabra, detectar palabras ambiguas |
| 7 | Modal revisión OCR | ALTA | `components/OCRReviewModal.tsx` (nuevo) | UI para corregir palabras de baja confianza |
| 8 | Exportar a PDF | MEDIA | `utils/ocrExport.ts` (nuevo) | Generar PDF con texto extraído y metadata |
| 9 | Exportar a Word | MEDIA | `utils/ocrExport.ts` (nuevo) | Generar .docx editable con librería docx |
| 10 | Cola de escaneos | MEDIA | `components/ScanQueue.tsx` (nuevo) | Acumular múltiples escaneos antes de exportar |
| 11 | Integrar en UI | BAJA | `NewSummaryModal.tsx`, `AuroraChatPopup.tsx` | Conectar nuevo flujo OCR con exportación y revisión |
| 12 | Detección dual persona+buque | ALTA | `utils/textAnalysis.ts` | Extraer ambos cuando están en la misma carátula |
| 13 | Mejorar ranksAndTitles | MEDIA | `utils/textAnalysis.ts` | Expandir lista de rangos navales argentinos |
| 14 | Celdas inline editables | ALTA | `components/InlineEditCell.tsx` (nuevo), `NewSummaryModal.tsx` | Tabla con edición directa sin modales |
| 15 | Toolbar edición selectiva | MEDIA | `components/QuickEditToolbar.tsx` (nuevo) | Botones para editar solo una columna a la vez |
| 16 | Auto-llenado documentos | ALTA | `DocumentGeneratorModal.tsx` | Pre-llenar todos los campos desde causantes del caso |
| 17 | Múltiples involucrados | ALTA | `DocumentGeneratorModal.tsx`, `InvolucradoSelector.tsx` (nuevo) | Selector con checkboxes, botón +, generación masiva |
| 18 | Templates por tipo | MEDIA | `DocumentGeneratorModal.tsx` | Templates diferenciados Persona/Buque/Empresa |
| 19 | Motor de templates | ALTA | `utils/templateEngine.ts` (nuevo), `utils/templateMapper.ts` (nuevo) | Cargar templates reales, reemplazar placeholders, mantener formato |
| 20 | Integrar templates en modal | ALTA | `DocumentGeneratorModal.tsx` | Reemplazar generador hardcodeado por sistema de templates |
| 21 | Agregar nuevos tipos | MEDIA | `DocumentGeneratorModal.tsx` | Soporte para Disposición Resolutoria, Ej. Jurisdicción, Vistas e Índice |
| 22 | Prompt post-generación | MEDIA | `DocumentGeneratorModal.tsx`, `StageUpdatePrompt.tsx` (nuevo) | Preguntar cambio de etapa después de generar documento |
| 23 | Flujos por tipo sumario | ALTA | `utils/documentFlow.ts` (nuevo), `DocumentGeneratorModal.tsx` | Definir flujo investigativo y abreviado con orden obligatorio |
| 24 | Validación de orden | ALTA | `utils/documentFlow.ts`, `DocumentGeneratorModal.tsx` | Alertar saltos de etapa, mostrar solo documentos disponibles |
| 25 | Sub-ruta rebeldía | ALTA | `DocumentGeneratorModal.tsx` | Flujo alternativo si involucrado no se presenta (ambos tipos) |
| 26 | Acta Derecho Defensa | ALTA | `DocumentGeneratorModal.tsx` | Agregar paso obligatorio en abreviado cuando se presenta |
| 27 | Recordatorio antecedentes | MEDIA | `pages/CaseDetail.tsx` | Recordatorio de solicitar antecedentes Empresa/Taller |
| 28 | Banner templates faltantes | MEDIA | `components/MissingTemplateBanner.tsx` (nuevo) | Alertar templates pendientes de subir |
| 29 | Subir templates | MEDIA | `components/TemplateUploader.tsx` (nuevo) | Componente para agregar templates faltantes a DOCUMENTOS BASE |
| 30 | Parser Acta Comprobación | ALTA | `utils/actaParser.ts` (nuevo) | Extraer todos los campos de las 2 hojas del Acta |
| 31 | Cámara móvil | ALTA | `components/CameraCapture.tsx` (nuevo) | Acceso a cámara con getUserMedia, guía de encuadre |
| 32 | Página escaneo Acta | ALTA | `pages/ActaScanner.tsx` (nuevo) | Flujo completo: escanear → revisar → crear caso |
| 33 | Revisión campos Acta | ALTA | `components/ActaFieldsReview.tsx` (nuevo) | Tabla editable con todos los campos extraídos |
| 34 | Botones inicio Acta | MEDIA | `pages/Dashboard.tsx`, `pages/Cases.tsx` | Agregar botón "Iniciar desde Acta" |
| 35 | Etapa manual | MEDIA | `pages/CaseDetail.tsx` | Permitir escribir manualmente la etapa además de seleccionar de la lista |

---

### #9 — Parte Preventivo + MOI desde Acta → Generar documentos y carátula

**Descripción:**
Después de escanear el Acta de Comprobación, el sistema debe generar dos documentos intermedios antes de iniciar el emplazamiento:

1. **Parte Preventivo** — documento que se genera con los datos del Acta
2. **Mensaje Oficial Interno (MOI)** — comunicación interna con los datos del caso

Ambos documentos se generan desde los datos del Acta, se pueden revisar/editar, y al confirmar:
- Se genera la **carátula del expediente** automáticamente
- Se inicia el flujo de **emplazamiento** (ya programado en mejora #7)

**Archivos a tocar:**
- `utils/templateEngine.ts` — agregar templates de Parte Preventivo y MOI
- `components/DocumentGeneratorModal.tsx` — agregar tipos Parte Preventivo y MOI
- `pages/ActaScanner.tsx` — después de OCR, flujo: Acta → Parte Preventivo → MOI → Carátula → Emplazamiento
- `DOCUMENTOS BASE/` — agregar templates de Parte Preventivo y MOI (pendientes de subir)

**Criterio de aceptación:**
- [ ] Parte Preventivo se genera con datos del Acta
- [ ] MOI se genera con datos del Acta
- [ ] Al confirmar ambos, se crea la carátula del expediente
- [ ] Flujo continuo hacia emplazamiento

---

### #10 — Prioridad: Vuelta a estado normal + Pregunta de etapa

**Descripción:**
Cuando un expediente en estado **Prioridad** es resuelto o se completa lo solicitado:

1. **Vuelve automáticamente a estado normal** (Active)
2. **Se mantiene en su etapa actual** — no avanza ni retrocede
3. **Se quita de la lista de Prioridad**
4. **Al actualizar** → preguntar:
   - "¿El expediente cambió de etapa o se mantiene?"
   - Opciones: "Se mantiene en [etapa actual]" / "Avanzó a [siguiente etapa]" / "Seleccionar otra"

**Archivos a tocar:**
- `pages/CaseDetail.tsx` — modal de resolución de prioridad con pregunta de etapa
- `context/CaseContext.tsx` — función `resolvePriority(caseId, stageChange?)`
- `components/PriorityResolutionModal.tsx` — NUEVO: modal para resolver prioridad

**Criterio de aceptación:**
- [ ] Al resolver prioridad, expediente vuelve a estado Active
- [ ] Se pregunta si cambió de etapa o se mantiene
- [ ] Si se mantiene, etapa no cambia
- [ ] Si avanzó, se actualiza la etapa
- [ ] Se quita de la lista de prioridad

---

### #11 — Selector de Etapa: Input manual libre

**Descripción:**
El selector de etapa procesal debe permitir **escribir manualmente** cualquier estado, no solo seleccionar de la lista predefinida. Esto es necesario porque pueden existir motivos o etapas no contempladas en la lista estándar.

**Implementación:**
- El campo de etapa es un **combobox** (input + dropdown)
- Se puede seleccionar de la lista O escribir cualquier texto libre
- Las opciones predefinidas se muestran como sugerencias al escribir (autocomplete)
- Se guarda el valor exacto que el usuario ingrese

**Archivos a tocar:**
- `pages/CaseDetail.tsx` — cambiar selector de etapa a input editable con autocomplete
- `components/StageSelector.tsx` — NUEVO: componente combobox etapa (input + dropdown)

**Criterio de aceptación:**
- [ ] Se puede escribir cualquier texto en el campo de etapa
- [ ] La lista de etapas estándar aparece como sugerencias
- [ ] Se guarda el valor exacto ingresado
- [ ] Funciona en CaseDetail y en cualquier otro lugar donde se seleccione etapa

---

### #13 — Anotador: Checklist + Pizarra de Tareas + Tareas Resueltas

**Descripción:**
El anotador del expediente debe evolucionar a un sistema de gestión de tareas:

1. **Checklist dentro de cada anotador** — items que al marcarlos se tachan pero quedan visibles
2. **Pizarra de tareas pendientes** — sector centralizado que agrupa TODOS los anotadores de TODOS los sumarios
3. **Origen visible** — cada tarea muestra de qué sumario proviene con acceso directo al expediente
4. **Tareas completadas** — al marcar todos los items de un checklist:
   - Se mueve a "Tareas Resueltas"
   - Deja de aparecer en pendientes
   - Se archiva dentro del expediente correspondiente
5. **Historial de tareas resueltas** — dentro de cada expediente, sección visible con todas las tareas manuales completadas

**Archivos a tocar:**
- `pages/CaseDetail.tsx` — reemplazar anotador simple por sistema de checklist
- `components/TaskBoard.tsx` — NUEVO: pizarra centralizada de tareas pendientes
- `components/ChecklistItem.tsx` — NUEVO: item de checklist con tachado visual
- `components/ResolvedTasks.tsx` — NUEVO: historial de tareas resueltas por expediente
- `context/CaseContext.tsx` — agregar estado de tareas/checklists
- `types.ts` — agregar `checklist: {id, text, done, createdAt}[]` y `resolvedTasks` a SummaryCase

**Criterio de aceptación:**
- [ ] Checklist funcional con items tachados pero visibles
- [ ] Pizarra centralizada con tareas de todos los sumarios
- [ ] Cada tarea muestra origen con link al expediente
- [ ] Checklist completo → se mueve a resueltas
- [ ] Tareas resueltas visibles dentro de cada expediente
- [ ] Historial organizado de tareas manuales realizadas

---

### #14 — Base de Causantes: Perfil Popup + Historial de Causas

**Descripción:**
La base de causantes debe permitir ver el perfil completo de cada persona/empresa/buque:

1. **Click en causante** → abre popup estilo perfil
2. **Datos del causante** — nombre, DNI, domicilio, teléfono, email, tipo
3. **Causas asociadas** — lista de todos los expedientes donde figura
4. **Acceso directo** — click en cualquier causa abre ese expediente
5. **Historial** — todas las infracciones, etapas, resoluciones

**Archivos a tocar:**
- `pages/CausantesDB.tsx` — agregar popup de perfil
- `components/CausanteProfileModal.tsx` — NUEVO: popup estilo perfil
- `context/CaseContext.tsx` — función `getCasesByCausante(name)`

**Criterio de aceptación:**
- [ ] Click en causante abre popup de perfil
- [ ] Muestra datos completos del causante
- [ ] Lista todas las causas asociadas
- [ ] Click en causa navega al expediente

---

### #15 — Base de Causantes: Vista Compacta 2 Columnas

**Descripción:**
La lista de causantes debe ser más compacta y visual:

1. **Layout de 2 columnas** para identificar visualmente más rápido
2. **Cards compactas** con nombre, tipo, DNI, cantidad de causas
3. **Iconos por tipo** — Persona, Buque, Empresa con colores distintos
4. **Búsqueda rápida** visible siempre

**Archivos a tocar:**
- `pages/CausantesDB.tsx` — rediseñar layout a 2 columnas compactas

**Criterio de aceptación:**
- [ ] Lista en 2 columnas
- [ ] Cards compactas con info esencial
- [ ] Iconos diferenciados por tipo
- [ ] Búsqueda siempre visible

---

### #16 — Audiencias: Calendario + Conteo de Tareas

**Descripción:**
El sector de Audiencias debe incluir:

1. **Calendario visual** con tareas/citaciones marcadas por día
2. **Todo lo que tenga fecha** aparece en el día correspondiente
3. **Agregar días adicionales** — botón para agregar recargos de servicio
4. **Conteo mensual** — cantidad de tareas, adicionales y recargos del mes
5. **Ubicación en adicionales** — campo para indicar dónde se realiza el adicional

**Archivos a tocar:**
- `pages/Audiencias.tsx` — agregar calendario, conteo, adicionales
- `components/AudienciaCalendar.tsx` — NUEVO: calendario de audiencias
- `components/MonthlyStats.tsx` — NUEVO: contador mensual de tareas
- `types.ts` — agregar `additionalDays: {date, location, type}[]` a SummaryCase

**Criterio de aceptación:**
- [ ] Calendario visual con tareas marcadas por día
- [ ] Citaciones y eventos con fecha aparecen en el día
- [ ] Botón para agregar adicionales/recargos
- [ ] Conteo mensual de tareas, adicionales, recargos
- [ ] Campo de ubicación en adicionales

---

### #17 — Sector Documentos: Plantillas Base Descargables

**Descripción:**
El sector de documentos debe mostrar TODAS las plantillas base disponibles para descargar directamente:

1. **Lista de templates** de `DOCUMENTOS BASE/` visibles en la UI
2. **Descarga directa** de cada template sin procesar
3. **Vista previa** del contenido de cada template
4. **Categorizados** por tipo (Cédulas, Indagatorias, Cargos, Disposiciones, etc.)

**Archivos a tocar:**
- `pages/Documents.tsx` — agregar sección de plantillas descargables
- `components/TemplateLibrary.tsx` — NUEVO: biblioteca de plantillas

**Criterio de aceptación:**
- [ ] Todas las plantillas de DOCUMENTOS BASE visibles
- [ ] Descarga directa con un click
- [ ] Categorizadas por tipo
- [ ] Vista previa del contenido

---

### #18 — Reportes: Auditoría Mensual/Trimestral/Semestral/Anual

**Descripción:**
El sector de Reportes debe mostrar auditoría completa del trabajo realizado:

1. **Filtros de período** — Mensual, Trimestral, Semestral, Anual
2. **Gráficos** — barras, líneas, torta con métricas clave
3. **Métricas** — sumarios iniciados, cerrados, en curso, documentos generados, etapas completadas
4. **Detalles claros** — tabla con desglose por expediente, fecha, responsable

**Archivos a tocar:**
- `pages/Reports.tsx` — rediseñar con gráficos y auditoría
- `components/ReportCharts.tsx` — NUEVO: gráficos de auditoría
- `components/PeriodSelector.tsx` — NUEVO: selector de período
- `utils/reportGenerator.ts` — NUEVO: generar datos de auditoría

**Criterio de aceptación:**
- [ ] Filtros: mensual, trimestral, semestral, anual
- [ ] Gráficos visuales claros
- [ ] Métricas de trabajo realizado
- [ ] Tabla de detalle por expediente

---

### #19 — Tablero: Alerta Martes Nota Náuticos Deportivos

**Descripción:**
El tablero debe alertar cada martes que se debe generar la nota de sumarios náuticos deportivos:

1. **Alerta automática** cada martes en el dashboard
2. **Nota con listado** de sumarios náuticos deportivos activos
3. **Exportar a PDF** — la nota se genera como PDF adjunto
4. **Templates pendientes** — se agregarán a `DOCUMENTOS BASE/` la nota y el PDF de referencia

**Archivos a tocar:**
- `pages/Dashboard.tsx` — agregar alerta semanal
- `components/WeeklyNoteAlert.tsx` — NUEVO: alerta de nota semanal
- `utils/weeklyNoteGenerator.ts` — NUEVO: generar nota náuticos deportivos
- `DOCUMENTOS BASE/` — agregar template de nota (pendiente)

**Criterio de aceptación:**
- [ ] Alerta visible cada martes
- [ ] Lista de sumarios náuticos deportivos
- [ ] Generar nota como PDF
- [ ] Template configurable

---

### #20 — Tablero: Sumarios Activos (máx 20) + Ver Todos

**Descripción:**
El sector "Sumarios Activos Recientes" del tablero:

1. **Mostrar máximo 20** sumarios activos recientes
2. **Botón "Ver todos"** — lleva a la página completa de expedientes
3. **Ordenados por** — más recientes primero

**Archivos a tocar:**
- `pages/Dashboard.tsx` — limitar a 20, agregar botón "Ver todos"

**Criterio de aceptación:**
- [ ] Máximo 20 sumarios en el dashboard
- [ ] Botón "Ver todos" funcional
- [ ] Ordenados por más recientes

---

### #21 — Tablero: Últimos 3 Sumarios Trabajados

**Descripción:**
Agregar un sector en el tablero con los últimos 3 sumarios que se trabajaron:

1. **Basado en** — última modificación o último documento generado
2. **Acceso directo** — click navega al expediente
3. **Info visible** — número, causante, etapa, última acción

**Archivos a tocar:**
- `pages/Dashboard.tsx` — agregar sección "Últimos trabajados"
- `types.ts` — agregar `lastWorkedAt` a SummaryCase
- `context/CaseContext.tsx` — actualizar `lastWorkedAt` en cada modificación

**Criterio de aceptación:**
- [ ] Sector con últimos 3 sumarios trabajados
- [ ] Muestra número, causante, etapa, última acción
- [ ] Click navega al expediente
- [ ] Se actualiza automáticamente con cada modificación
