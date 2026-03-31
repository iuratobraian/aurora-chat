# MT5 Trading Platform — Master Spec

Spec ejecutable para la plataforma profesional de trading automatizado con MetaTrader 5. Derivado de `MT5_AUTOMATION_PLATFORM.md`.

## Concepto

**"Tu laboratorio de trading automatizado. Diseña estrategias, valídalas con datos reales y ejecútalas sin emociones."**

### Disclaimer Obligatorio

> Esta plataforma es una **herramienta de análisis y ejecución**. No garantiza rentabilidad. El trading automatizado implica riesgos significativos. Responsible trading practices son requeridos.

---

## Producto

### Job-to-be-done

> "Quiero crear, testar y ejecutar estrategias de trading automatizadas sin escribir código MQL5, con riesgo controlado y sin emociones."

### Propuesta de valor

| Para quién | Quiere | Damos | Sin |
|---|---|---|---|
| Trader activo | Automatizar estrategias | Builder visual + backtesting | Código |
| Gestor | Control de riesgo unificado | Risk manager centralizado | Overexposición |
| Researcher | Lab para ideas | Research workbench | Sesgo emocional |
| Prop firm trader | Operar con disciplina | Execution engine | Impulsividad |

---

## Módulos

### 1. Strategy Builder

Interfaz visual para crear estrategias sin código:

```typescript
interface Strategy {
  id: string;
  name: string;
  market: 'forex' | 'crypto' | 'indices' | 'commodities';
  timeframe: 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1';
  
  entry: {
    indicators: Indicator[];
    conditions: Condition[];
    operator: 'AND' | 'OR';
  };
  
  exit: {
    indicators: Indicator[];
    conditions: Condition[];
  };
  
  risk: RiskConfig;
  version: number;
  status: 'draft' | 'testing' | 'live' | 'archived';
}

interface Indicator {
  type: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'ATR' | 'BOLLINGER' | 'CUSTOM';
  params: Record<string, number>;
  shift: number;
}

interface Condition {
  indicator: string;
  field: 'value' | 'cross' | 'above' | 'below';
  comparator: '>' | '<' | '==' | 'CROSS_UP' | 'CROSS_DOWN';
  value: number | string;
}
```

**UI:** Drag-and-drop de indicadores, configuración visual de parámetros, preview del setup en chart.

### 2. Risk Manager

Centro de control de riesgo para todas las estrategias:

```typescript
interface RiskConfig {
  // Per trade
  riskPercent: number;          // % del capital por trade (default: 1-2%)
  maxSpread: number;            // Max spread para entry (pips)
  maxSlippage: number;         // Max slippage aceptable
  
  // Daily limits
  maxDailyLoss: number;         // Max pérdida diaria (%)
  maxDailyTrades: number;      // Max trades por día
  
  // Portfolio
  maxOpenPositions: number;     // Max posiciones abiertas
  maxCorrelation: number;       // Max correlación entre trades (0-1)
  maxExposurePerMarket: number; // Max exposición por mercado (%)
  
  // Emergency
  emergencyStopLoss: number;    // Stop global (% equity)
  drawdownLimit: number;       // Max drawdown antes de pausa
  
  // Time filters
  noTradeBefore: string;       // HH:MM
  noTradeAfter: string;
  noTradeOnFriday: boolean;
}
```

**UI:** Dashboard con métricas de riesgo en tiempo real, alertas cuando se acerca a límites, brake pedal para pausar todo.

### 3. Execution Engine

Envío y gestión de órdenes:

```typescript
interface ExecutionConfig {
  strategyId: string;
  account: MT5Account;
  
  // Order management
  useMarketOrders: boolean;
  pendingOrderOffset: number;   // Pips de offset para pending
  
  // Confirmation
  requireManualConfirm: boolean;
  autoConfirmAbove: number;     // Auto-confirm si risk < X
  
  // Fill handling
  maxRetryOnRejection: number;
  retryDelayMs: number;
}

interface OrderResult {
  retcode: number;             // MQL5 retcode
  deal: string;
  order: string;
  volume: number;
  price: number;
  filledAt: number;
  error?: string;
}
```

**UI:** Log de órdenes, status en tiempo real, reconnects automáticos.

### 4. Backtest Engine

Validación de estrategias con datos históricos:

```typescript
interface BacktestConfig {
  strategyId: string;
  
  // Period
  startDate: string;
  endDate: string;
  
  // Settings
  initialCapital: number;
  leverage: number;
  spread: 'current' | number;
  commission: number;
  slippage: number;
  
  // Optimization
  optimizeParams?: OptimizationParam[];
  walkForward?: WalkForwardConfig;
}

interface BacktestResult {
  strategyId: string;
  runId: string;
  
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    maxDrawdownDuration: number;
    winRate: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    avgTradeDuration: number;
  };
  
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
  
  passes: boolean;
  failReasons?: string[];
}
```

**UI:** Report completo con equity curve, métricas, monthly breakdown. Export a PDF.

### 5. Research Workbench

Laboratorio para generar y validar ideas:

```typescript
interface ResearchProject {
  id: string;
  name: string;
  hypothesis: string;
  
  market: string;
  timeframe: string;
  
  observations: Observation[];
  conclusion?: string;
  promotedToStrategy?: string;
}

interface Observation {
  date: string;
  description: string;
  chart?: string;
  taggedIndicators: string[];
}

interface StrategyCandidate {
  projectId: string;
  parameters: Record<string, number>;
  backtestResult: BacktestResult;
  robustnessScore: number;   // 0-100
  
  status: 'candidate' | 'approved' | 'rejected';
  notes: string;
}
```

### 6. Portfolio Manager

Gestión de múltiples estrategias:

```typescript
interface PortfolioConfig {
  strategies: Array<{
    strategyId: string;
    weight: number;            // 0-1
    maxPositions: number;
    enabled: boolean;
  }>;
  
  // Correlation management
  correlationThreshold: number;  // Max correlación entre estrategias
  
  // Capital allocation
  autoAllocate: boolean;
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
}

interface PortfolioMetrics {
  totalEquity: number;
  dailyPnL: number;
  openPositions: number;
  exposure: number;
  portfolioCorrelation: number;
  portfolioSharpe: number;
  portfolioDrawdown: number;
}
```

---

## Pantallas

### P0 — MVP

1. **Dashboard** (`/`) — Overview: equity, open positions, risk metrics
2. **Strategy Builder** (`/strategies`) — Lista + creación
3. **Strategy Editor** (`/strategies/[id]`) — Config visual
4. **Backtest** (`/backtest/[id]`) — Correr y ver resultados
5. **Risk Manager** (`/risk`) — Config global + dashboard
6. **Portfolio** (`/portfolio`) — Vista consolidada
7. **Logs** (`/logs`) — Órdenes y errores

### P1

- Research Workbench
- Alerts configuration
- Forward testing

### P2

- Strategy marketplace
- Managed accounts
- Mobile alerts

---

## Modelo de Negocio

| Tier | Precio | Features |
|---|---|---|
| **Trader** | $29/mes | 3 estrategias, backtest básico, risk manager |
| **Pro** | $79/mes | 10 estrategias, backtest avanzado, forward testing |
| **Team** | $199/mes | 50 estrategias, portfolio manager, API |
| **Enterprise** | $499/mes | Todo + custom integrations + SLA |

### Revenue adicional

- Strategy marketplace: 20% revenue share sobre estrategias vendidas
- Data feeds premium: $20-50/mes
- Managed accounts tooling: $99/mes por gestor

---

## Arquitectura

### Stack

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Vite + React)                                 │
│  - Dashboard, Strategy Builder, Backtest UI              │
│  - Vercel deployment                                      │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  CONVEX (Backend)                                        │
│  - Strategy storage & registry                           │
│  - Backtest results                                      │
│  - Portfolio metrics                                     │
│  - User accounts & subscriptions                         │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  EXECUTION RELAY (Express)                                │
│  - MT5 gateway (MQL5 WebRequest)                       │
│  - Order execution & reconciliation                     │
│  - Alert notifications                                   │
│  - Railway deployment                                    │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│  MT5 TERMINAL (User's machine)                           │
│  - EA installed                                          │
│  - Connected to broker                                   │
│  - Receives commands via HTTP                          │
└─────────────────────────────────────────────────────────┘
```

### MT5 Integration

```
TradePortal App → Express Relay → MT5 WebRequest → Broker
                      ↑                  ↓
              Backtest Results      Order Confirm
                      ↑                  ↓
              Convex Storage ← History ← Trade Result
```

**Importante:** MT5 requiere que el EA esté corriendo en el terminal del usuario. No hay acceso directo al broker desde la nube.

---

## Roadmap

### Fase 1 — Core (4-6 semanas)
- [ ] Strategy Builder visual
- [ ] Risk Manager config
- [ ] Convex storage (strategies, results)
- [ ] MT5 EA template
- [ ] Basic backtest

### Fase 2 — Validation (3-4 semanas)
- [ ] Backtest engine completo
- [ ] Forward testing
- [ ] Strategy registry
- [ ] Dashboard

### Fase 3 — Portfolio (3-4 semanas)
- [ ] Portfolio Manager
- [ ] Correlation management
- [ ] Alerts system

### Fase 4 — Scale (4-6 semanas)
- [ ] Strategy marketplace
- [ ] Managed accounts
- [ ] Mobile app
- [ ] API access

---

## Métricas de Producto

| Métrica | Target | Descripción |
|---|---|---|
| Strategies created | 100/month | EAs diseñados |
| Backtests run | 500/month | Validaciones |
| Strategies deployed | 20/month | EAs en live |
| Retention (Pro+) | >80% | Suscriptores que pagan |

---

## Riesgo y Compliance

- **Disclaimer obligatorio** en toda la app
- No hay "guaranteed returns" messaging
- Risk disclosure en cada resultado de backtest
- Compliance con regulaciones de trading de cada jurisdicción
- No storage de fondos — solo execution layer

---

## Metadata

- **Creado:** 2026-03-22
- **Basado en:** `.agent/skills/technical/MT5_AUTOMATION_PLATFORM.md`
- **Stack:** Vite + React + Convex + Express + MT5
- **Revisión:** Pre-alpha
