import { askKimiWithContext } from './aurora-kimi-agent.mjs';

const task = `AUDIT-004: Analizar y corregir useSignalWebSocket.ts

PROBLEMA:
- WebSocket no se cierra correctamente al desmontar
- Reconexión exponencial sin backoff máximo definido
- Múltiples instancias de WebSocket creadas

CRITERIOS:
1. Agregar cleanup function: ws?.close() + clearTimeout(reconnectTimer)
2. Backoff exponencial con máximo: Math.min(1000 * 2**attempts, 30000)
3. useRef para tracking de attempts (evitar stale closures)
4. Solo UNA instancia activa de WebSocket a la vez

CÓDIGO ACTUAL: src/hooks/useSignalWebSocket.ts

VERIFICAR: El código actual ya tiene algunas correcciones. Analizar si están completas o falta algo.`;

const result = await askKimiWithContext(task, {
  currentTask: 'AUDIT-004 WebSocket cleanup',
  filesToEdit: ['src/hooks/useSignalWebSocket.ts'],
  forbidden: ['App.tsx']
});

console.log(result.answer);
