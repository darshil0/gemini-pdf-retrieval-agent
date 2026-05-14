/* eslint-disable no-console */
/**
 * Structured Logging Service
 *
 * Provides consistent, structured logging across the application.
 * Supports log levels, contextual metadata, and can be extended
 * to integrate with external logging services (e.g., Sentry, Datadog).
 *
 * @module logger
 * @since v1.4.0
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
};

/**
 * Determines the minimum log level from the environment.
 * Defaults to WARN in production and DEBUG in development.
 */
function getMinLevel(): LogLevel {
  const env = import.meta.env.VITE_DEBUG;
  if (env === "true") return LogLevel.DEBUG;
  return import.meta.env.PROD ? LogLevel.WARN : LogLevel.DEBUG;
}

const minLevel = getMinLevel();

/**
 * Formats and outputs a structured log entry.
 *
 * @param entry - The log entry to output
 */
function emit(entry: LogEntry): void {
  if (entry.level < minLevel) return;

  const label = LOG_LEVEL_LABELS[entry.level];
  const prefix = entry.context ? `[${label}][${entry.context}]` : `[${label}]`;
  const msg = `${prefix} ${entry.timestamp} — ${entry.message}`;

  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(msg, entry.data ?? "");
      break;
    case LogLevel.INFO:
      console.info(msg, entry.data ?? "");
      break;
    case LogLevel.WARN:
      console.warn(msg, entry.data ?? "");
      break;
    case LogLevel.ERROR:
      console.error(msg, entry.data ?? "", entry.error ?? "");
      break;
  }
}

/**
 * Creates a logger instance scoped to a specific context (module/component).
 *
 * @param context - The name of the module or component using this logger
 * @returns A logger object with debug, info, warn, and error methods
 *
 * @example
 * ```ts
 * const log = createLogger("GeminiService");
 * log.info("Search started", { keyword: "revenue", fileCount: 3 });
 * log.error("API call failed", { keyword }, error);
 * ```
 */
export function createLogger(context: string) {
  const timestamp = () => new Date().toISOString();

  return {
    /**
     * Logs a debug-level message. Only emitted in development or when VITE_DEBUG=true.
     */
    debug(message: string, data?: Record<string, unknown>) {
      emit({ level: LogLevel.DEBUG, message, timestamp: timestamp(), context, data });
    },

    /**
     * Logs an informational message.
     */
    info(message: string, data?: Record<string, unknown>) {
      emit({ level: LogLevel.INFO, message, timestamp: timestamp(), context, data });
    },

    /**
     * Logs a warning message.
     */
    warn(message: string, data?: Record<string, unknown>) {
      emit({ level: LogLevel.WARN, message, timestamp: timestamp(), context, data });
    },

    /**
     * Logs an error message with an optional Error object.
     */
    error(message: string, data?: Record<string, unknown>, error?: Error) {
      emit({ level: LogLevel.ERROR, message, timestamp: timestamp(), context, data, error });
    },
  };
}
