# MT5 Automation Platform

## Objetivo

Definir como crear una plataforma profesional para:

- EAs de MetaTrader 5
- gestores de riesgo
- generador de estrategias
- motor de backtesting y validacion
- panel operativo para traders, research y portfolio

## Aviso importante

Esto es una guia de producto e ingenieria.
No es consejo financiero ni promesa de rentabilidad.

Un sistema serio debe optimizar:

- disciplina
- control del riesgo
- trazabilidad
- validacion

No "ganar siempre".

## Base oficial de MT5/MQL5

La plataforma debe apoyarse en conceptos oficiales de MQL5:

- eventos `OnTick`, `OnTradeTransaction`, `OnInit`, `OnDeinit`, `OnTester`
- envio de ordenes con `OrderSend` o `CTrade`
- chequeo previo con `OrderCheck`
- calculo de margen con `OrderCalcMargin`
- testing y optimizacion con Strategy Tester y forward testing

## Modulos que debe tener

### 1. Strategy Engine

Responsable de:

- leer condiciones
- generar señales
- aplicar filtros
- producir intencion de trade

Capas:

- data adapters
- indicators
- signal rules
- regime filters
- entry rules
- exit rules

### 2. Risk Manager

Responsable de:

- sizing
- max risk por trade
- max loss diaria
- max drawdown
- max posiciones abiertas
- correlacion entre simbolos
- bloqueo por eventos de alta volatilidad si aplica

Sin risk manager, no hay EA profesional.

### 3. Execution Engine

Responsable de:

- construir request
- validar request
- enviar orden
- manejar rechazo
- reconciliar estado
- actualizar stops o targets

Debe usar:

- validacion previa
- control de slippage
- llenado por simbolo
- manejo de retcodes
- seguimiento de transacciones

### 4. Portfolio Manager

Responsable de:

- agrupar estrategias
- controlar exposicion total
- limitar correlacion
- repartir capital
- priorizar señales

### 5. Strategy Registry

Base interna de estrategias con:

- nombre
- tipo
- mercado
- timeframe
- parametros
- reglas
- version
- resultados historicos
- status

### 6. Backtest and Validation Engine

Responsable de:

- backtest historico
- forward testing
- walk-forward
- sensibilidad de parametros
- stress tests
- control de overfitting

### 7. Research Workbench

Responsable de:

- generar ideas
- convertir ideas en reglas
- comparar variantes
- registrar resultados
- promover solo estrategias validas

## Arquitectura sugerida

### Capa terminal MT5

- EA principal
- modulos de señal
- modulos de riesgo
- modulos de ejecucion
- logs

### Capa research externa

- catalogo de estrategias
- datasets
- panel de resultados
- comparador de pruebas
- export/import de parametros

### Capa operativa

- dashboard
- alertas
- health checks
- control de versiones

## Flujo profesional de creacion de un EA

1. definir hipotesis de estrategia
2. declarar mercado, activo y timeframe
3. definir reglas de entrada
4. definir reglas de salida
5. definir riesgo y sizing
6. definir condiciones de invalidez
7. implementar modulo
8. backtestear
9. forward testear
10. hacer stress tests
11. registrar resultados
12. aprobar o descartar

## Gestor de riesgo profesional

Debe incluir:

- riesgo porcentual maximo por trade
- limite diario y semanal
- stop obligatorio
- limite de spread y slippage
- bloqueo por perdida consecutiva
- limite de correlacion
- capital allocation por estrategia
- freno de emergencia

## Generador automatico de estrategias

No debe "inventar" estrategias y lanzarlas.
Debe funcionar como laboratorio controlado.

### Pipeline correcto

1. recibe idea o clase de estrategia
2. genera variantes parametrizadas
3. corre backtests
4. filtra resultados invalidos
5. corre forward test
6. puntua robustez
7. registra solo candidatas serias

### Criterios minimos

- muestra suficiente
- costos y spread incluidos
- drawdown dentro de limites
- estabilidad entre periodos
- no dependencia extrema de un parametro

## Paneles que debe tener la app futura

- strategies
- runs
- results
- risk controls
- portfolio
- deployment
- alerts
- logs

## Monetizacion de esta app futura

- SaaS para traders
- plan pro con research
- plan team
- signals infra
- strategy marketplace con revenue share
- managed accounts tooling
- risk and analytics premium

## Plan de integracion

### Fase 1

- research workbench
- strategy registry
- templates de EAs

### Fase 2

- risk manager
- validation engine
- dashboard de resultados

### Fase 3

- deployment control
- portfolio manager
- monetizacion

## Referencias oficiales

- MQL5 OnTradeTransaction: https://www.mql5.com/en/docs/event_handlers/ontradetransaction
- MQL5 OrderSend: https://www.mql5.com/en/docs/trading/ordersend
- MQL5 OrderCheck: https://www.mql5.com/en/docs/trading/ordercheck
- MQL5 OrderCalcMargin: https://www.mql5.com/en/docs/trading/OrderCalcMargin
- MQL5 CTrade: https://www.mql5.com/en/docs/standardlibrary/tradeclasses/ctrade
- MQL5 OnTester: https://www.mql5.com/en/docs/event_handlers/ontester
- MQL5 testing: https://www.mql5.com/en/docs/runtime/testing
