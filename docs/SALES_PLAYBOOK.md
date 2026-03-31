# Sales Playbook - TradePortal

## Overview

Sistema de captación y cierre de comunidades para TradePortal. El objetivo es convertir comunidades de trading en clientes de la plataforma.

## Flujo de Ventas

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   OUTREACH  │────▶│ QUALIFICATION │────▶│    DEMO     │────▶│  CLOSE  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
     100 msgs           40 leads            10 demos             3 closes
```

## 1. Outreach

### Canales
- Telegram (prioridad)
- Discord
- WhatsApp
- Email
- Twitter/X DM

### Templates

**Cold Telegram:**
```
Hola {name}! 👋

Vi que tu comunidad se enfoca en {audience}. Me gustaría mostrarte TradePortal.

¿Qué te parece si agendemos una demo rápida de 15 min?

El link: tradeportal.app/demo
```

**Follow-up sequence:**
- Día 3: "¿Pudiste ver el mensaje?"
- Día 7: "Te paso más info"
- Día 14: "Último intento"

### Métricas objetivo
- Response rate: 15-20%
- Demo rate: 25% de respuestas

## 2. Qualification

### Criterios BANT++
- **Budget**: Comunidad con capacidad de pago ($29-199/mes)
- **Authority**: Hablar con dueño/admin
- **Need**: Necesidad clara de herramientas
- **Timing**: Dispuestos a evaluar ahora
- **Plus**: Engagement activo, +50 miembros

### Lead Scoring

```typescript
const score = (
  audienceMatch * 25 +   // Trading, forex, crypto
  sizeOK * 20 +           // 50-10000 miembros
  engagementOK * 15 +     // >10% engagement
  redFlags * -50          // Scam, mlm, etc
);
```

### Clasificación
- 🔥 Hot (60+): Agendar demo ASAP
- ☀️ Warm (40-59): Enviar info, nurture
- ❄️ Cold (0-39): Contenido
- 🚫 Not fit (0-): Descartar

## 3. Demo

### Agenda típica (15 min)
1. **Intro** (2 min): Quién soy, TradePortal
2. **Pain** (3 min): ¿Qué problemas tienen?
3. **Solution** (5 min): Demo live
4. **ROI** (3 min): Casos de éxito, números
5. **Close** (2 min): Agendar siguiente paso

### Talking Points
- Señales en tiempo real
- AI insights para miembros
- Analytics de engagement
- Monetización para owners

### Pricing
| Plan | Precio | Miembros | Features |
|------|--------|----------|----------|
| Starter | $29/mes | 100 | Basic |
| Growth | $79/mes | 500 | Advanced + AI |
| Scale | $199/mes | Unlimited | API + Priority |

## 4. Objections

### Manejo de objeciones comunes

**"Está caro"**
> Entiendo. ¿Han evaluado el ROI de tener que moderar manualmente? TradePortal se paga solo con una comunidad de 50+ miembros.

**"No tengo tiempo"**
> Totalmente. La demo es de 15 min y te ahorro horas de investigación. ¿Cuándo te viene mejor, mañana o la próxima semana?

**"Ya usamos otra herramienta"**
> Genial. ¿Qué les gusta de lo actual? A veces complementamos mejor que reemplazamos.

**"Tengo que consultarlo"**
> Entiendo. ¿Quién más está involucrado? Le envío la info directamente.

## 5. Closing

### Técnicas

**Assumptive:**
> "¿La demo el jueves a las 10am? Te envío el link."

**Urgency:**
> "Esta semana tenemos disponibilidad. Después se llena por el launch."

**Alternative:**
> "¿Zoom, Meet o Telegram para la demo?"

### ROI Calculator

```typescript
calculateROI(communitySize: 200, monthlyRevenue: 500)
// → Revenue: $500, Fee: $100, Net: $400, Yearly: $4,800
```

## Scripts Disponibles

```bash
# Outreach
node scripts/sales/outreach.ts

# Qualification
node scripts/sales/qualification.ts

# Objections
node scripts/sales/objections.ts

# Closing
node scripts/sales/close.ts
```

## Métricas a Rastrear

- Messages sent
- Response rate
- Qualified leads
- Demos scheduled
- Demos completed
- Conversion rate
- Average deal size
- Time to close

## Casos de Éxito

### Comunidad: Forex Argentina
- Miembros: 800
- Revenue: $150/mes
- Resultado: Scale plan

### Comunidad: Crypto Signals VIP
- Miembros: 200
- Revenue: $80/mes
- Resultado: Growth plan

## Tools

- Apollo.io (lead research)
- Telegram/Discord (outreach)
- Calendly (scheduling)
- HubSpot (CRM)
- Slack (alerts)
