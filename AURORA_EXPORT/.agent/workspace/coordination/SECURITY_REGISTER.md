# Security Register

## Uso

Registrar riesgos abiertos, mitigación y ownership.

| ID | Riesgo | Severidad | Owner | Estado | Mitigación | Evidencia |
|---|---|---|---|---|---|---|
| SEC-R001 | Webhooks sin validación fuerte | critical | CODEX | done | Raw body + timingSafeEqual + idempotencia | server.ts (SEC-007) usa `parseWebhookBody`, firmas timingSafeEqual y deduplicación, la tarea está reflejada en el board |
| SEC-R002 | Variables `VITE_*` usadas server-side | critical | AGENT-CONFIG | open | separar env browser/server | pendiente |
| SEC-R003 | Hardcoded Convex URLs en servicios | high | AGENT-CONFIG | open | config única y fail-fast | pendiente |
| SEC-R004 | Endpoints sensibles dependen de `userId` del cliente | critical | AGENT-AUTH | open | auth server-side y autorización | pendiente |
| SEC-R005 | Relay de IA externa sin rate limiting aún | high | AGENT-AI-INFRA | open | rate limiting + request id + auditoría | pendiente |
| SEC-R006 | Falta ledger/event log de pagos | critical | AGENT-PAYMENTS | open | payment log y reconciliación | pendiente |
