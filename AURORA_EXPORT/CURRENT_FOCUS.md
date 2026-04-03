# CURRENT_FOCUS.md

## AGENT: Aurora Mente Maestra
- TASK: PNA Legal - 20 Mejoras (Wave 2)
- Fecha: 2026-04-02
- Voy a hacer: Implementar UI components pendientes (OCR, InlineEdit) + Dashboard widgets
- Archivos que tocaré: components/OCRReviewModal.tsx, components/ScanQueue.tsx, components/InlineEditCell.tsx, pages/Dashboard.tsx
- Archivos que no tocaré: App.tsx, utils/ocr.ts, utils/ocrExport.ts (backend ya completo)
- Señal de salida: Components funcionales, sin mocks, integrados con contexto existente

---

## 📋 TAREAS AUTO-ASIGNADAS (Protocolo 3x)

| Task | Estado | Descripción |
|------|--------|-------------|
| TSK-008-UI | `in_progress` | OCR Review Modal + Scan Queue components |
| TSK-003-UI | `claimed` | InlineEditCell + QuickEditToolbar components |
| TSK-019-20 | `claimed` | Dashboard widgets: Activos + Recientes |

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### TSK-008-UI (OCR Components):
- [ ] OCRReviewModal muestra palabras con <60% confidence
- [ ] Permite editar/corregir cada palabra
- [ ] ScanQueue muestra progreso de múltiples escaneos
- [ ] Integrado con useToast para feedback

### TSK-003-UI (Inline Edit):
- [ ] InlineEditCell permite editar nombres sin modal
- [ ] QuickEditToolbar aparece on hover
- [ ] Guarda cambios automáticamente en CaseContext
- [ ] Validación de conflictos persona/buque

### TSK-019-20 (Dashboard Widgets):
- [ ] Widget "Sumarios Activos" muestra máx 20 casos
- [ ] Widget "Últimos Trabajados" muestra 3 casos recientes
- [ ] Click en caso navega a CaseDetail
- [ ] Diseño consistente con Dashboard existente

---

## ⏰ TIMELINE

- **Inicio:** 2026-04-02
- **Estimado:** 2-3 horas
- **Doble Check:** Requerido antes de marcar `done`
