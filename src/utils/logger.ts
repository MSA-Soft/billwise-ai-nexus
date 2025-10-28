// Logging utility for BillWise AI Nexus

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = this.getLogLevel();
    this.isDevelopment = import.meta.env.DEV;
  }

  private getLogLevel(): LogLevel {
    const envLevel = import.meta.env.VITE_LOG_LEVEL;
    switch (envLevel) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    try {
      const user = localStorage.getItem('billwise_user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('billwise_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('billwise_session_id', sessionId);
    }
    return sessionId;
  }

  private getRequestId(): string | undefined {
    // Generate request ID for tracking
    return this.generateId();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context);
    const formatted = this.formatLog(entry);

    // Console logging
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    // Send to external service in production
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      if (entry.level >= LogLevel.ERROR) {
        // Send errors to error tracking service
        await this.sendToErrorTracking(entry);
      }
      
      // Send all logs to analytics service
      await this.sendToAnalytics(entry);
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private async sendToErrorTracking(entry: LogEntry): Promise<void> {
    // Integration with Sentry or similar
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(entry.message), {
        extra: entry.context,
        tags: {
          userId: entry.userId,
          sessionId: entry.sessionId,
        },
      });
    }
  }

  private async sendToAnalytics(entry: LogEntry): Promise<void> {
    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'log_entry', {
        level: LogLevel[entry.level],
        message: entry.message,
        context: entry.context,
      });
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  // Performance logging
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // Group logging
  group(label: string): void {
    console.group(label);
  }

  groupEnd(): void {
    console.groupEnd();
  }

  // Table logging
  table(data: any[]): void {
    console.table(data);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, context?: Record<string, any>) => logger.error(message, context),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
  table: (data: any[]) => logger.table(data),
};
