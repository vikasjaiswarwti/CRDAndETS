// src/shared/lib/logging/logger.ts
export const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export class ConsoleLogger implements Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.context}] ${message}`, ...args);
  }
}
