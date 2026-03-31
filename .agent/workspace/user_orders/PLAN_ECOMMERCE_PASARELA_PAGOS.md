# 🛒 PLAN DE IMPLEMENTACIÓN: Sistema E-Commerce Premium TradeShare
## Pasarela de Pagos Completa — Estilo MercadoLibre

> **Generado**: 2026-03-24 | **Por**: Antigravity Mente Maestra
> **Protocolo**: Ruflo v3.5 | Ejecutar con `inicio` antes de cada batch
> **Swarm Code**: 3 (Feature) + 9 (Security) | **Topología**: hierarchical | **Consenso**: raft

---

## ⚡ PROTOCOLO DE EJECUCIÓN — Estructura `inicio`

Cada batch de 3 tareas sigue los 8 pasos del protocolo inicio:
1. Hooks de sesión → 2. Contexto → 3. Routing (Code 3+9) → 4. Swarm Init → 5. AMM → 6. Batch 3 tareas → 7. SPARC → 8. Cierre + Loop

---

## 📊 DIAGNÓSTICO ACTUAL — Lo que existe y lo que falta

### ✅ Lo que YA existe
| Componente | Estado | Archivo |
|-----------|--------|---------|
| Tabla `products` en Convex | Completa | `convex/schema.ts:614-671` |
| Tabla `purchases` en Convex | Básica | `convex/schema.ts:673-695` |
| Tabla `payments` en Convex | Completa | `convex/schema.ts:370-389` |
| Tabla `wishlists` en Convex | Existe | `convex/schema.ts:719-724` |
| PaymentOrchestrator (MercadoPago + Zenobank) | Funcional | `src/services/paymentOrchestrator.ts` |
| usePayment hook (Stripe + MP + Zenobank) | Funcional | `src/hooks/usePayment.ts` |
| PaymentModal (subscription/course) | Básico | `src/components/PaymentModal.tsx` |
| ProductView con detalle y catálogo | Completo | `src/views/ProductView.tsx` |
| CheckoutSuccess/Cancel views | Mínimo | `src/views/Checkout*.tsx` |
| Server endpoints webhooks (MP + Zenobank) | Funcional | `server.ts:92-201` |

### 🔴 Lo que FALTA (Crítico)
| Brecha | Impacto | Descripción |
|-------|---------|-------------|
| **No hay carrito** | 🔴 BLOQUEANTE | No existe tabla `cart` ni componente Cart. No se pueden agregar múltiples items |
| **Compra sin pago real** | 🔴 BLOQUEANTE | `ProductView.handlePurchase()` llama `purchaseProduct` directo sin pasar por pasarela de pago |
| **PaymentModal no soporta productos** | 🔴 ALTO | Solo maneja `subscription` y `course`, no items del marketplace |
| **No hay checkout multi-step** | 🔴 ALTO | No existe flujo: carrito → resumen → método de pago → confirmación |
| **No hay order tracking** | 🟡 ALTO | Después de pagar no hay seguimiento del pedido |
| **Wishlist rota** | 🟡 MEDIO | Usa `userId: 'guest'` hardcodeado en ProductCard |
| **No hay cupones/descuentos** | 🟡 MEDIO | Sin sistema de promociones |
| **No hay reviews post-compra** | 🟡 MEDIO | Reviews existen pero no están ligadas a compras verificadas |
| **CheckoutSuccess genérico** | 🟡 BAJO | Solo muestra "Pago Exitoso" sin detalles del pedido |

---

## 🏗️ ARQUITECTURA PROPUESTA

```
FLUJO COMPLETO DEL USUARIO:

┌─ DESCUBRIMIENTO ─────────────────────────────────────────────────┐
│  Marketplace → Producto → Detalle → "Agregar al Carrito" ✨     │
│  Comunidad → Señal Premium → "Comprar acceso" ✨                 │
│  Cursos → Curso → "Inscribirse" ✨                               │
│  Pricing → Plan → "Suscribirse" ✨                               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ CARRITO (Mini Cart + Full Cart) ───────────────────────────────┐
│  🛒 Badge en nav con count                                      │
│  Mini cart dropdown al hacer click                               │
│  Full cart page con edición de cantidades                        │
│  Cupón de descuento input                                        │
│  Subtotal → Descuento → Total                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ CHECKOUT (3 pasos) ────────────────────────────────────────────┐
│  PASO 1: Resumen del pedido                                      │
│    - Items con imagen, nombre, precio                            │
│    - Datos del comprador (auto-filled del perfil)                │
│    - Facturación (opcional)                                      │
│                                                                  │
│  PASO 2: Método de pago                                          │
│    - 💳 MercadoPago (tarjeta, RapiPago, etc.)                   │
│    - 🏦 Stripe (tarjeta internacional)                          │
│    - ₿ Zenobank (USDT, BTC, ETH)                                │
│    - 🪙 Saldo XP (si tiene suficiente)                          │
│    - Selección visual con logos reales                            │
│    - Trust badges + garantía                                     │
│                                                                  │
│  PASO 3: Confirmación                                            │
│    - Resumen final con desglose total                            │
│    - Botón "Confirmar y Pagar" con loading premium               │
│    - Redirect a pasarela externa ó pago inline                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ POST-COMPRA ───────────────────────────────────────────────────┐
│  ✅ Checkout Success con detalles reales del pedido              │
│  📧 Email de confirmación                                        │
│  📦 Mis Pedidos (tracking de estado)                             │
│  ⭐ Invitación a dejar review (solo compradores verificados)     │
│  📥 Acceso al contenido digital (archivo, curso, señal)         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📋 TAREAS DE IMPLEMENTACIÓN

### FASE 1 — Backend y Schema (Convex)

#### EC-001 — Tabla `cart` en Convex
**Swarm**: 11 (Convex/DB) | **Archivos**: `convex/schema.ts`, `convex/cart.ts` [NEW]

```typescript
// Nuevo en schema.ts
cart: defineTable({
  userId: v.string(),
  items: v.array(v.object({
    productId: v.id("products"),
    quantity: v.number(),
    priceAtAdd: v.number(),      // Precio al momento de agregar
    currencyAtAdd: v.string(),
    addedAt: v.number(),
  })),
  couponCode: v.optional(v.string()),
  couponDiscount: v.optional(v.number()),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
```

Mutations en `convex/cart.ts`:
- `addToCart({ userId, productId, quantity })`
- `removeFromCart({ userId, productId })`
- `updateQuantity({ userId, productId, quantity })`
- `clearCart({ userId })`
- `applyCoupon({ userId, code })` → valida y aplica
- `getCart({ userId })` → query con datos de producto expandidos

**Aceptación**: CRUD completo del carrito con validaciones. Tests unitarios pasan.

---

#### EC-002 — Tabla `orders` en Convex
**Swarm**: 11 | **Archivos**: `convex/schema.ts`, `convex/orders.ts` [NEW]

```typescript
orders: defineTable({
  userId: v.string(),
  orderNumber: v.string(),      // "TS-2026-001234"
  items: v.array(v.object({
    productId: v.id("products"),
    title: v.string(),
    price: v.number(),
    currency: v.string(),
    quantity: v.number(),
    authorId: v.string(),
    authorEarnings: v.number(),
    platformFee: v.number(),
  })),
  subtotal: v.number(),
  discount: v.optional(v.number()),
  couponCode: v.optional(v.string()),
  total: v.number(),
  currency: v.string(),
  paymentMethod: v.union(
    v.literal("mercadopago"),
    v.literal("stripe"),
    v.literal("zenobank"),
    v.literal("xp_balance")
  ),
  paymentId: v.optional(v.string()),
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("refunded"),
    v.literal("cancelled")
  ),
  deliveryStatus: v.union(
    v.literal("pending"),
    v.literal("delivered"),
    v.literal("accessed")
  ),
  billingInfo: v.optional(v.object({
    name: v.string(),
    email: v.string(),
    taxId: v.optional(v.string()),
    address: v.optional(v.string()),
  })),
  createdAt: v.number(),
  paidAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
}).index("by_user", ["userId"])
  .index("by_orderNumber", ["orderNumber"])
  .index("by_paymentId", ["paymentId"])
  .index("by_paymentStatus", ["paymentStatus"])
```

Mutations:
- `createOrder({ userId, items, paymentMethod, billingInfo, couponCode })`
- `updateOrderPayment({ orderId, paymentId, paymentStatus })`
- `markDelivered({ orderId })`
- `getUserOrders({ userId })` → query paginada
- `getOrderByNumber({ orderNumber })`

**Aceptación**: CRUD completo con número de orden auto-generado. Validaciones de stock y precio.

---

#### EC-003 — Tabla `coupons` en Convex
**Swarm**: 11 | **Archivos**: `convex/schema.ts`, `convex/coupons.ts` [NEW]

```typescript
coupons: defineTable({
  code: v.string(),
  type: v.union(v.literal("percentage"), v.literal("fixed")),
  value: v.number(),           // 10 = 10% o $10
  minPurchase: v.optional(v.number()),
  maxUses: v.optional(v.number()),
  currentUses: v.number(),
  validFrom: v.number(),
  validUntil: v.number(),
  applicableCategories: v.optional(v.array(v.string())),
  isActive: v.boolean(),
  createdBy: v.string(),
  createdAt: v.number(),
}).index("by_code", ["code"])
  .index("by_active", ["isActive"])
```

**Aceptación**: Admin puede crear cupones. Validación de vigencia, usos y monto mínimo.

---

#### EC-004 — Conectar purchaseProduct a pasarela real
**Swarm**: 9 (Security) | **Archivos**: `convex/products.ts`, `convex/orders.ts`

**Problema actual**: `purchaseProduct` mutation marca como comprado SIN cobrar dinero real.
**Solución**: Cambiar flujo → `createOrder` (pending) → redirect a pasarela → webhook confirma → `updateOrderPayment` + `completePurchase`.

**Aceptación**: Imposible obtener acceso a un producto sin pago confirmado por webhook.

---

#### EC-005 — Webhook handler para completar órdenes
**Swarm**: 9 | **Archivos**: `server.ts`, `convex/orders.ts`

Al recibir webhook de pago exitoso:
1. Buscar order por `paymentId`
2. Actualizar `paymentStatus: 'completed'`
3. Crear `purchases` records para cada item
4. Acreditar earnings al autor (commission split)
5. Enviar notificación al comprador
6. Enviar email de confirmación

**Aceptación**: Webhook idempotente. Doble webhook no duplica purchase.

---

### FASE 2 — Componentes Frontend

#### EC-010 — Componente `MiniCart` (dropdown)
**Swarm**: 3 (Feature) | **Archivos**: `src/components/commerce/MiniCart.tsx` [NEW]

- Badge en Navigation con count de items
- Dropdown al click con lista de items
- Thumbnail + nombre + precio
- Botón "Eliminar" por item
- Subtotal
- CTA "Ir al Checkout"
- Animación al agregar item (bounce + confetti subtle)

**Estilo**: Glassmorphism dark, borde neon cyan, sombra premium.

**Aceptación**: Visible en todas las páginas. Count se actualiza en real-time.

---

#### EC-011 — Componente `CartPage` (full cart)
**Swarm**: 3 | **Archivos**: `src/views/CartView.tsx` [NEW]

- Lista de items con imagen grande, título, author, precio
- Selector de cantidad (para productos que lo permitan)
- Botón "Eliminar" con animación
- Input de cupón con validación en vivo
- Desglose: Subtotal, Descuento, Total
- CTA grande "Proceder al Checkout"
- "Seguir Comprando" link
- Empty state atractivo si carrito vacío

**Aceptación**: Responsive. Actualización optimistic de cantidades.

---

#### EC-012 — Componente `CheckoutFlow` (3 pasos)
**Swarm**: 3 | **Archivos**: `src/components/commerce/CheckoutFlow.tsx` [NEW]

Multi-step checkout con progress bar visual:

**Paso 1 — Resumen y Datos**
- Items con thumb, nombre, precio
- Datos del comprador (pre-filled del profile)
- Campo de email para factura
- Tax ID opcional

**Paso 2 — Método de Pago**
- 4 opciones con logos reales y descripción:
  - 💳 MercadoPago → Tarjeta, RapiPago, PagoFácil
  - 🏦 Stripe → Visa, Mastercard, Amex internacional
  - ₿ Zenobank → USDT, Bitcoin, Ethereum
  - 🪙 Saldo XP → Si tiene suficiente balance
- Trust badges: "Pago Seguro", "Encriptación SSL", "Garantía 30 días"
- Logo de los métodos de pago aceptados

**Paso 3 — Confirmar**
- Resumen final con todo el desglose
- Checkbox de términos y condiciones
- Botón "Confirmar y Pagar $XXX"
- Premium loading animation al procesar

**Aceptación**: 3 pasos navegables. Cada paso valida antes de avanzar. Mobile responsive.

---

#### EC-013 — Componente `PaymentMethodSelector`
**Swarm**: 3 | **Archivos**: `src/components/commerce/PaymentMethodSelector.tsx` [NEW]

Componente reutilizable de selección de método de pago:
- Cards de selección con radio button visual
- Logo real de cada provider (MP, Stripe, crypto icons)
- Descripción de qué incluye cada método
- Highlight del seleccionado con glow neon
- Badge "Más Popular" en MercadoPago
- Badge "Crypto" en Zenobank

**Aceptación**: Reutilizable en CheckoutFlow, PaymentModal, PricingView.

---

#### EC-014 — Componente `OrderConfirmation` (reemplaza CheckoutSuccess)
**Swarm**: 3 | **Archivos**: `src/views/OrderConfirmationView.tsx` [NEW]

Post-compra premium:
- Número de orden grande y copiable
- Lista de items comprados con acceso directo
- Estado del pago con indicador visual
- Botón "Descargar" si es producto digital
- Botón "Acceder al Curso" si es curso
- Timeline de tracking: Pago → Procesando → Entregado
- CTA "Ver Mis Pedidos"
- Share social: "Acabo de comprar X en TradeShare"
- Animación de celebración (confetti)

**Aceptación**: Se muestra después del webhook de pago exitoso. Todos los datos reales.

---

#### EC-015 — Componente `MyOrdersView`
**Swarm**: 3 | **Archivos**: `src/views/MyOrdersView.tsx` [NEW]

Panel de pedidos del usuario:
- Lista paginada de órdenes con: fecha, #orden, items, total, estado
- Filtros: Todos, Completados, Pendientes, Reembolsados
- Detalle expandible por orden
- Botón "Descargar" por producto digital
- Botón "Solicitar Reembolso" (abre ticket)
- Badge de estado con color: verde=completado, amarillo=pendiente, rojo=fallido

**Aceptación**: Paginación cursor-based. Responsive. Estados actualizados en real-time via Convex.

---

#### EC-016 — Botón "Agregar al Carrito" universal
**Swarm**: 3 | **Archivos**: `src/components/commerce/AddToCartButton.tsx` [NEW]

Componente reutilizable para cualquier punto de compra:
- Animación al click (item vuela al carrito icon)
- Feedback háptico en mobile
- Toast de confirmación con "Ver Carrito"
- Si ya está en carrito: muestra "Ya en el Carrito ✓"
- Si ya comprado: muestra "Ya Comprado ✓"
- Si no logueado: abre AuthModal

Integrarse en:
- ProductView (detalle de producto)
- ProductCard (grid de marketplace)
- CursosView (comprar curso)
- PricingView (suscripciones)
- SignalsView (señales premium)
- CommunityDetailView (comunidades de pago)

**Aceptación**: Funciona en todos los 6 puntos de compra. Animación fluida.

---

#### EC-017 — Trust Badges y Social Proof
**Swarm**: 3 | **Archivos**: `src/components/commerce/TrustBar.tsx` [NEW]

Barra de confianza que aparece en checkout y producto:
- 🔒 Pago 100% Seguro
- 🔄 Garantía 30 días
- ⭐ +X usuarios compraron esto
- 🏅 Vendedor verificado
- 📧 Soporte 24/7

**Aceptación**: Aparece en CheckoutFlow, ProductDetailModal, CartView.

---

### FASE 3 — Integración de Pasarelas

#### EC-020 — Stripe Checkout Session para marketplace
**Swarm**: 9 | **Archivos**: `convex/payments.ts`, `server.ts`

Extender `createCheckoutSession` para soportar órdenes de marketplace:
- Line items con imagen, nombre, precio
- Metadata con orderId para vincular al webhook
- Success/Cancel URLs con orderId
- Support para cupones vía Stripe Coupons

**Aceptación**: Checkut session redirige a Stripe. Webhook completa la orden.

---

#### EC-021 — MercadoPago Preference para marketplace
**Swarm**: 9 | **Archivos**: `convex/lib/mercadopago.ts`, `server.ts`

Crear preference con:
- Multiple items (no solo uno)
- External reference = orderId
- Back URLs con orderId
- Notification URL apuntando a webhook
- Payer email pre-filled

**Aceptación**: Preference con múltiples items. Webhook IPN completa la orden.

---

#### EC-022 — Zenobank crypto payment para marketplace
**Swarm**: 9 | **Archivos**: `convex/lib/zenobank.ts`, `server.ts`

Crear payment con orderId como reference. Webhook confirma.

**Aceptación**: Flujo crypto end-to-end funcional.

---

#### EC-023 — Pago con saldo XP
**Swarm**: 3 | **Archivos**: `convex/orders.ts`, `convex/profiles.ts`

Para productos con precio en XP:
1. Verificar saldo suficiente
2. Debitar XP del perfil
3. Crear order con paymentMethod: "xp_balance" y status: "completed"
4. Completar purchase inmediatamente (sin redirect externo)

**Aceptación**: Pago con XP es instantáneo. No redirige a pasarela externa.

---

### FASE 4 — UX Premium y Conversión

#### EC-030 — Animación "Add to Cart" fly-to-icon
**Swarm**: 3 | **Archivos**: `src/components/commerce/FlyToCartAnimation.tsx` [NEW]

Al agregar un item:
- Miniatura del producto vuela hacia el ícono del carrito en la nav
- Badge counter hace bounce
- Toast discreto "Agregado al carrito"

**Aceptación**: Animación smooth 60fps. Funciona en mobile y desktop.

---

#### EC-031 — Productos relacionados ("También te puede interesar")
**Swarm**: 3 | **Archivos**: `convex/products.ts`, `src/components/commerce/RelatedProducts.tsx` [NEW]

En ProductDetailModal y OrderConfirmation:
- Query same category + same tags
- Slider horizontal con 4 productos
- "Otros clientes también compraron"

**Aceptación**: Productos relevantes. Cross-sell efectivo.

---

#### EC-032 — Urgency indicators
**Swarm**: 3 | **Archivos**: `src/components/commerce/UrgencyBadge.tsx` [NEW]

Indicadores de urgencia para impulsar conversión:
- "🔥 10 personas viendo este producto"
- "⏰ Oferta termina en 2h 30m"
- "📈 Precio sube mañana"
- "✅ X personas compraron hoy"

**Aceptación**: Badges visibles en ProductCard y ProductDetail.

---

#### EC-033 — Recently viewed y "Continuar comprando"
**Swarm**: 3 | **Archivos**: `src/hooks/useRecentlyViewed.ts` [NEW], componente

Guardar en localStorage los últimos 10 productos vistos:
- Strip en homepage "Vistos recientemente"
- "Continuar donde dejaste" en CartView

**Aceptación**: Últimos 10 productos. Se persiste across sessions.

---

#### EC-034 — Email de confirmación de compra
**Swarm**: 3 | **Archivos**: `src/services/emailService.ts`, `convex/orders.ts`

Email automático post-compra con:
- Número de orden
- Detalle de items comprados
- Total pagado
- Link de descarga (si es digital)
- Link a "Mis Pedidos"
- Diseño HTML premium con branding TradeShare

**Aceptación**: Email se envía automáticamente tras webhook de pago completado.

---

#### EC-035 — Reviews post-compra verificadas
**Swarm**: 3 | **Archivos**: `convex/products.ts`

Solo compradores verificados pueden dejar review:
- Badge "Comprador Verificado ✓" en la review
- Rating 1-5 estrellas
- Prompt automático 3 días después de la compra (notificación)

**Aceptación**: Review solo posible si exists purchase.status === 'completed'.

---

## 📊 TABLA DE TAREAS (Formato TASK_BOARD)

| TASK-ID | Estado | Código Swarm | Scope | Archivos | Objetivo |
|---------|--------|-------------|-------|----------|----------|
| EC-001 | pending | 11 | convex | convex/schema.ts, convex/cart.ts | Tabla y mutations del carrito |
| EC-002 | pending | 11 | convex | convex/schema.ts, convex/orders.ts | Tabla y mutations de órdenes |
| EC-003 | pending | 11 | convex | convex/schema.ts, convex/coupons.ts | Sistema de cupones |
| EC-004 | pending | 9 | security | convex/products.ts | Conectar compra a pasarela real |
| EC-005 | pending | 9 | security | server.ts, convex/orders.ts | Webhook handler para completar órdenes |
| EC-010 | pending | 3 | frontend | components/commerce/MiniCart.tsx | Mini carrito dropdown |
| EC-011 | pending | 3 | frontend | views/CartView.tsx | Página de carrito completo |
| EC-012 | pending | 3 | frontend | components/commerce/CheckoutFlow.tsx | Checkout 3 pasos |
| EC-013 | pending | 3 | frontend | components/commerce/PaymentMethodSelector.tsx | Selector de método de pago |
| EC-014 | pending | 3 | frontend | views/OrderConfirmationView.tsx | Confirmación post-compra |
| EC-015 | pending | 3 | frontend | views/MyOrdersView.tsx | Panel de pedidos |
| EC-016 | pending | 3 | frontend | components/commerce/AddToCartButton.tsx | Botón universal "Agregar" |
| EC-017 | pending | 3 | frontend | components/commerce/TrustBar.tsx | Trust badges |
| EC-020 | pending | 9 | payments | convex/payments.ts, server.ts | Stripe para marketplace |
| EC-021 | pending | 9 | payments | convex/lib/mercadopago.ts | MercadoPago multi-item |
| EC-022 | pending | 9 | payments | convex/lib/zenobank.ts | Zenobank crypto |
| EC-023 | pending | 3 | payments | convex/orders.ts, convex/profiles.ts | Pago con XP |
| EC-030 | pending | 3 | ux | components/commerce/FlyToCartAnimation.tsx | Animación fly-to-cart |
| EC-031 | pending | 3 | ux | components/commerce/RelatedProducts.tsx | Productos relacionados |
| EC-032 | pending | 3 | ux | components/commerce/UrgencyBadge.tsx | Urgency indicators |
| EC-033 | pending | 3 | ux | hooks/useRecentlyViewed.ts | Productos vistos recientes |
| EC-034 | pending | 3 | ux | services/emailService.ts | Email de confirmación |
| EC-035 | pending | 3 | ux | convex/products.ts | Reviews de compradores verificados |

---

## 🎯 ORDEN DE EJECUCIÓN — Protocolo `inicio` (8 Pasos)

```
SPRINT 1 (Backend) — Swarm Code 11+9
┌── inicio → Hooks + Contexto + Routing
├── Batch 1 [EC-001, EC-002, EC-003]   (Schema: cart, orders, coupons)
├── Batch 2 [EC-004, EC-005, EC-023]   (Pasarela real + webhooks + XP)
└── Paso 8: lint + test → loop

SPRINT 2 (Frontend Core) — Swarm Code 3
┌── inicio
├── Batch 3 [EC-016, EC-010, EC-011]   (AddToCart, MiniCart, CartPage)
├── Batch 4 [EC-013, EC-012, EC-017]   (PaymentSelector, Checkout, Trust)
└── Paso 8: lint + test → loop

SPRINT 3 (Pasarelas) — Swarm Code 9
┌── inicio
├── Batch 5 [EC-020, EC-021, EC-022]   (Stripe, MP, Zenobank integración)
└── Paso 8: lint + test → loop

SPRINT 4 (UX Premium) — Swarm Code 3
┌── inicio
├── Batch 6 [EC-014, EC-015, EC-030]   (OrderConfirm, MyOrders, Animation)
├── Batch 7 [EC-031, EC-032, EC-033]   (Related, Urgency, Recently)
├── Batch 8 [EC-034, EC-035]           (Email, Reviews verificadas)
└── Paso 8 final: session-end + ZERO LOSS
```

---

## 🔍 PLAN DE VERIFICACIÓN

### Tests Automatizados
```bash
# Unit tests del carrito
npx vitest run __tests__/unit/cart.test.ts

# Unit tests de órdenes
npx vitest run __tests__/unit/orders.test.ts

# Unit tests de cupones
npx vitest run __tests__/unit/coupons.test.ts

# Integration test de webhook flow
npx vitest run __tests__/integration/paymentWebhook.test.ts

# Lint completo
npm run lint

# Build debe pasar
npm run build
```

### Verificación Manual (solicitada al usuario)
1. **Crear producto** → Agregar al carrito → Verificar badge counter
2. **Agregar 3 productos** → Ir al carrito → Modificar cantidades → Aplicar cupón
3. **Checkout completo** → Paso 1 datos → Paso 2 seleccionar MP → Paso 3 confirmar → Redirect a MP sandbox
4. **Webhook simulado** → Verificar order status cambia y purchase se crea
5. **Mis Pedidos** → Verificar lista con estados correctos
6. **Mobile** → Todo el checkout funciona en 375px width

---

> [!CAUTION]
> **REGLAS DE ORO:**
> - `SEGURIDAD`: NUNCA otorgar acceso a producto sin pago confirmado por webhook
> - `IDEMPOTENCIA`: Doble webhook no duplica purchases ni charges
> - `PRECIO SNAPSHOTTING`: Guardar precio al momento de agregar al carrito, no al checkout
> - `ESTÉTICA`: Glassmorphism premium. Cada pantalla debe generar confianza de compra
> - `MOBILE FIRST`: Checkout debe ser perfecto en mobile (60%+ del tráfico)
