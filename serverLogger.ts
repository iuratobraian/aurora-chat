const isDev = process.env.NODE_ENV !== 'production';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  meta?: unknown;
  requestId?: string;
}

function formatEntry(entry: LogEntry): string {
  const { ts, level, msg, requestId, meta } = entry;
  const prefix = `[${ts}] [${level.toUpperCase()}]${requestId ? ` [${requestId}]` : ''}`;
  if (meta !== undefined) {
    return `${prefix} ${msg} ${typeof meta === 'string' ? meta : JSON.stringify(meta)}`;
  }
  return `${prefix} ${msg}`;
}

function writeLog(level: LogLevel, ...args: unknown[]) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    msg: String(args[0] ?? ''),
    meta: args.length > 1 ? (args.length === 2 ? args[1] : args.slice(1)) : undefined,
  };

  const line = formatEntry(entry);

  // error y warn siempre activos
  if (level === 'error' || level === 'warn') {
    if (level === 'error') console.error(line);
    else console.warn(line);
    return;
  }

  // debug e info solo en dev
  if (!isDev) return;
  if (level === 'debug') console.debug(line);
  else console.info(line);
}

const logger = {
  debug: (...args: unknown[]) => writeLog('debug', ...args),
  info: (...args: unknown[]) => writeLog('info', ...args),
  warn: (...args: unknown[]) => writeLog('warn', ...args),
  error: (...args: unknown[]) => writeLog('error', ...args),
};

export default logger;
