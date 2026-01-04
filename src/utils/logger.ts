/**
 * Centralized logging utility for DevQuest
 * Provides environment-aware logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: Date;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.log('debug', message, context, data);
      console.debug(`[DEBUG]${context ? ` [${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
    if (this.isDevelopment) {
      console.info(`[INFO]${context ? ` [${context}]` : ''} ${message}`, data || '');
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
    console.warn(`[WARN]${context ? ` [${context}]` : ''} ${message}`, data || '');
  }

  /**
   * Log errors
   */
  error(message: string, context?: string, error?: unknown): void {
    this.log('error', message, context, error);
    console.error(`[ERROR]${context ? ` [${context}]` : ''} ${message}`, error || '');
    
    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get recent logs (useful for debugging)
   */
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Log XP-related events
   */
  xp(action: string, amount: number, source: string, data?: unknown): void {
    this.info(`XP ${action}: ${amount >= 0 ? '+' : ''}${amount} from ${source}`, 'XP', data);
  }

  /**
   * Log streak-related events
   */
  streak(action: string, streakData: unknown): void {
    this.info(`Streak ${action}`, 'STREAK', streakData);
  }

  /**
   * Log level-up events
   */
  levelUp(oldLevel: number, newLevel: number, totalXP: number): void {
    this.info(`LEVEL UP! ${oldLevel} → ${newLevel}`, 'LEVEL', { oldLevel, newLevel, totalXP });
  }

  /**
   * Log achievement unlocks
   */
  achievement(achievementName: string, data?: unknown): void {
    this.info(`Achievement unlocked: ${achievementName}`, 'ACHIEVEMENT', data);
  }

  /**
   * Log task completions
   */
  taskComplete(taskId: string, taskTitle: string, xpReward: number): void {
    this.info(`Task completed: ${taskTitle} (+${xpReward} XP)`, 'TASK', { taskId, xpReward });
  }

  /**
   * Log auth events
   */
  auth(event: string, userEmail?: string): void {
    this.info(`Auth: ${event}`, 'AUTH', { userEmail });
  }

  /**
   * Log API calls
   */
  api(method: string, endpoint: string, status?: number, error?: unknown): void {
    if (error) {
      this.error(`API ${method} ${endpoint} failed`, 'API', error);
    } else {
      this.debug(`API ${method} ${endpoint} ${status ? `(${status})` : ''}`, 'API');
    }
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit = 'ms'): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`, 'PERF');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger, LogLevel, LogEntry };
