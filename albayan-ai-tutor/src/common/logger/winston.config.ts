import * as path from 'node:path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format, transports, type LoggerOptions } from 'winston';

export interface WinstonConfigOptions {
  nodeEnv?: string;
  logDir?: string;
  logLevel?: string;
}

/** يبني تطبيق تحكم Winston (levels + formats + console + ملفات دوّارة). */
export const getWinstonConfig = (
  options: WinstonConfigOptions = {},
): LoggerOptions => {
  const isDev = (options.nodeEnv ?? process.env.NODE_ENV) !== 'production';
  const logDir = path.resolve(options.logDir ?? process.env.LOG_DIR ?? 'logs');
  const level =
    options.logLevel ?? process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');

  const fileTransports = [
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: format.json(),
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: format.json(),
    }),
  ];

  const consoleTransport = isDev
    ? new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf((info) => {
            return consoleLine(info);
          }),
        ),
      })
    : new transports.Console({
        format: format.json(),
      });

  return {
    level,
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
    ),
    defaultMeta: { service: 'ai-tutor' },
    transports: [consoleTransport, ...fileTransports],
  };
};

/** صيغة نصية ملونة للاستهلاك البشري أثناء التطوير. */
function consoleLine(info: {
  level: string;
  message: unknown;
  timestamp?: string;
  [key: string]: unknown;
}): string {
  const rest: Record<string, unknown> = { ...info };
  delete rest.level;
  delete rest.message;
  delete rest.timestamp;
  if (rest.service === 'ai-tutor') delete rest.service;
  const message = Array.from(String(info.message))
    .map((ch) =>
      (ch.codePointAt(0) ?? 0) <= 0x1f || ch === '\u007f' ? ' ' : ch,
    )
    .join('');
  const tail = Object.keys(rest).length
    ? ` ${JSON.stringify(rest, null, 2)}`
    : '';
  return `${info.timestamp ?? ''} [${info.level}] ${message}${tail}`;
}
