/**
 * 日志工具类
 * 格式：{timestamp} [{level}] [{traceId}] {caller} - {message}
 */

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

const LOG_LEVELS: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

/**
 * 格式化时间戳
 * 输出格式：2025-12-19 10:49:34.494
 */
function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.` +
         `${pad(now.getMilliseconds(), 3)}`;
}

/**
 * 记录日志
 */
function log(
  level: LogLevel,
  traceId: string,
  caller: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (LOG_LEVELS[level] > LOG_LEVELS[currentLevel]) return;

  const timestamp = formatTimestamp();
  const levelPadded = level.padEnd(5);
  const logLine = `${timestamp} [${levelPadded}] [${traceId}] ${caller} - ${message}`;

  if (data) {
    console.log(logLine, JSON.stringify(data));
  } else {
    console.log(logLine);
  }
}

export const logger = {
  error: (traceId: string, caller: string, msg: string, data?: Record<string, unknown>) =>
    log('ERROR', traceId, caller, msg, data),
  warn: (traceId: string, caller: string, msg: string, data?: Record<string, unknown>) =>
    log('WARN', traceId, caller, msg, data),
  info: (traceId: string, caller: string, msg: string, data?: Record<string, unknown>) =>
    log('INFO', traceId, caller, msg, data),
  debug: (traceId: string, caller: string, msg: string, data?: Record<string, unknown>) =>
    log('DEBUG', traceId, caller, msg, data),
};

