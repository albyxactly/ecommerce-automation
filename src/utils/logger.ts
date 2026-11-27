import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.resolve(__dirname, '../../reports/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    return stack ? `${base}\n${stack}` : base;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'test-run.log'),
      maxsize: 5_000_000,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      maxsize: 5_000_000,
      maxFiles: 3,
    }),
  ],
});

export function step(description: string): void {
  logger.info(`STEP → ${description}`);
}

export function assertion(description: string): void {
  logger.info(`ASSERT → ${description}`);
}
