# Payment Hardening — Pagos y Webhooks

## Estado actual

| Provider | Webhook | Firma verificada | Idempotencia | Event log |
|---|---|---|---|---|
| MercadoPago | `/webhooks/mercadopago` | ❌ No | ❌ No | ❌ No |
| Zenobank | `/webhooks/zenobank` | ❌ No | ❌ No | ❌ No |
| Stripe | No configurado | — | — | — |

## Problema

Los webhooks actuales aceptan cualquier POST sin verificar firma. Esto permite:
- Spoofing de pagos (enviar webhook falso de "pago completado")
- Replay attacks (reenviar webhook legítimo múltiples veces)
- Pérgida de auditoría (no hay log de eventos de pago)

## Mitigaciones por provider

### MercadoPago

```typescript
// Verificación de firma (x-signature header)
import crypto from 'crypto';

function verifyMercadoPagoSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(',')[0].split('=')[1]};`;
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const expected = `v1=${hmac}`;
  return xSignature.split(',')[1]?.split('=')[1] === hmac;
}
```

**Headers de MercadoPago a verificar:**
- `x-signature` — HMAC-SHA256 del payload
- `x-request-id` — ID único del request
- `x-trace` — trazabilidad

### Zenobank

Verificar `x-webhook-signature` header con HMAC-SHA256 usando `ZENOBANK_WEBHOOK_SECRET`.

### Stripe

Verificar `stripe-signature` header usando `stripe.webhooks.constructEvent()`.

## Idempotencia

### Problema
Si un webhook se reenvía (retry), el procesamiento se ejecuta dos veces.

### Solución
Usar `x-request-id` o `data.id` del webhook como idempotency key:

```typescript
const processedWebhooks = new Map<string, number>(); // key → timestamp

function isDuplicate(webhookId: string): boolean {
  if (processedWebhooks.has(webhookId)) {
    return true;
  }
  processedWebhooks.set(webhookId, Date.now());
  // Limpiar keys viejos (> 24h)
  return false;
}
```

**En producción:** usar Redis o Convex table en vez de Map en memoria.

## Payment Event Log

Cada evento de pago debe registrarse:

```typescript
interface PaymentEvent {
  id: string;
  provider: 'mercadopago' | 'zenobank' | 'stripe';
  eventType: string; // 'payment.created', 'payment.approved', etc.
  externalId: string; // ID del provider
  userId?: string;
  amount?: number;
  currency?: string;
  rawPayload: any;
  processedAt: number;
  status: 'received' | 'processed' | 'failed' | 'duplicate';
}
```

**Storage:** Convex table `payment_events` o, temporalmente, log file.

## Flujo de webhook seguro

```
1. Recibir POST /webhooks/{provider}
2. Verificar firma → 401 si falla
3. Extraer idempotency key
4. Verificar duplicado → 200 (skip) si ya procesado
5. Registrar evento en payment_events
6. Procesar evento (actualizar subscription, etc.)
7. Marcar como procesado
8. Responder 200
```

## Variables de entorno requeridas

| Variable | Provider | Dónde obtener |
|---|---|---|
| `MERCADOPAGO_WEBHOOK_SECRET` | MercadoPago | Dashboard → Webhooks → Secret |
| `ZENOBANK_WEBHOOK_SECRET` | Zenobank | Merchant dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Dashboard → Webhooks → Signing secret |

## Checklist

- [ ] Verificar firma MercadoPago en `/webhooks/mercadopago`
- [ ] Verificar firma Zenobank en `/webhooks/zenobank`
- [ ] Implementar idempotencia con data.id
- [ ] Crear payment event log
- [ ] Test: enviar webhook duplicado → procesar solo una vez
- [ ] Test: enviar webhook con firma inválida → rechazar
