/**
 * Comprehensive error handling utilities for production-ready app
 * Ensures stability for 50k users with proper error boundaries and logging
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorReport {
  error: AppError;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
}

/**
 * Error class for application-specific errors
 */
export class AppException extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly context?: string;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppException';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.details = details;
  }
}

/**
 * Error codes for different types of errors
 */
export const ErrorCodes = {
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_DATA_CORRUPTED: 'USER_DATA_CORRUPTED',
  USER_PERMISSION_DENIED: 'USER_PERMISSION_DENIED',
  
  // Data errors
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
  DATA_PARSING_ERROR: 'DATA_PARSING_ERROR',
  DATA_SYNC_FAILED: 'DATA_SYNC_FAILED',
  
  // Network errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  
  // State errors
  STATE_INVALID: 'STATE_INVALID',
  STATE_CORRUPTED: 'STATE_CORRUPTED',
  STATE_MIGRATION_FAILED: 'STATE_MIGRATION_FAILED',
  
  // Performance errors
  PERFORMANCE_SLOW_RENDER: 'PERFORMANCE_SLOW_RENDER',
  PERFORMANCE_MEMORY_LEAK: 'PERFORMANCE_MEMORY_LEAK',
  PERFORMANCE_CPU_HIGH: 'PERFORMANCE_CPU_HIGH',
  
  // System errors
  SYSTEM_STORAGE_FULL: 'SYSTEM_STORAGE_FULL',
  SYSTEM_QUOTA_EXCEEDED: 'SYSTEM_QUOTA_EXCEEDED',
  SYSTEM_BROWSER_INCOMPATIBLE: 'SYSTEM_BROWSER_INCOMPATIBLE',
} as const;

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

/**
 * Error handler utility class
 */
export class ErrorHandler {
  private static sessionId: string = this.generateSessionId();
  private static errorQueue: AppError[] = [];
  private static maxQueueSize = 100;
  
  /**
   * Generate a unique session ID for error tracking
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Handle and log an error
   */
  static handleError(
    error: Error | AppException,
    context?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): AppError {
    const appError: AppError = {
      code: error instanceof AppException ? error.code : 'UNKNOWN_ERROR',
      message: error.message,
      details: error instanceof AppException ? error.details : undefined,
      timestamp: new Date(),
      stack: error.stack,
      context: context || error instanceof AppException ? error.context : undefined,
      severity: severity || (error instanceof AppException ? error.severity : 'medium'),
    };
    
    // Add to error queue
    this.errorQueue.push(appError);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', appError);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(appError);
    }
    
    // Show user notification for high/critical errors
    if (appError.severity === 'high' || appError.severity === 'critical') {
      this.showUserNotification(appError);
    }
    
    return appError;
  }
  
  /**
   * Log error to external monitoring service
   */
  private static async logToExternalService(error: AppError): Promise<void> {
    try {
      const errorReport: ErrorReport = {
        error,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
      };
      
      // Send to monitoring service (implement actual service call)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      }).catch(() => {
        // Silently fail to avoid infinite error loops
      });
    } catch (e) {
      // Silently fail to avoid infinite error loops
    }
  }
  
  /**
   * Show user-friendly error notification
   */
  private static showUserNotification(error: AppError): void {
    // Create user-friendly message based on error code
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    switch (error.code) {
      case ErrorCodes.NETWORK_OFFLINE:
        userMessage = 'You appear to be offline. Please check your internet connection.';
        break;
      case ErrorCodes.NETWORK_TIMEOUT:
        userMessage = 'Request timed out. Please try again.';
        break;
      case ErrorCodes.USER_DATA_CORRUPTED:
        userMessage = 'Your data may be corrupted. Please refresh the page.';
        break;
      case ErrorCodes.SYSTEM_STORAGE_FULL:
        userMessage = 'Your browser storage is full. Please clear some data.';
        break;
      default:
        if (error.severity === 'critical') {
          userMessage = 'A critical error occurred. Please refresh the page.';
        }
    }
    
    // Dispatch notification to app state
    if (typeof window !== 'undefined' && (window as any).appDispatch) {
      (window as any).appDispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'system',
          title: 'Error',
          message: userMessage,
          priority: error.severity === 'critical' ? 'high' : 'medium',
          timestamp: new Date(),
        },
      });
    }
  }
  
  /**
   * Get recent errors for debugging
   */
  static getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }
  
  /**
   * Clear error queue
   */
  static clearErrorQueue(): void {
    this.errorQueue = [];
  }
  
  /**
   * Get session ID for debugging
   */
  static getSessionId(): string {
    return this.sessionId;
  }
}

/**
 * Safe execution wrapper with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): T {
  try {
    return fn();
  } catch (error) {
    ErrorHandler.handleError(error as Error, context, severity);
    return fallback;
  }
}

/**
 * Async safe execution wrapper with error handling
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    ErrorHandler.handleError(error as Error, context, severity);
    return fallback;
  }
}

/**
 * Validation utility for data integrity
 */
export class DataValidator {
  /**
   * Validate user data structure
   */
  static validateUserData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = ['id', 'name', 'email'];
    return requiredFields.every(field => data[field] !== undefined);
  }
  
  /**
   * Validate XP value
   */
  static validateXP(xp: any): number {
    if (typeof xp !== 'number' || isNaN(xp) || xp < 0) {
      throw new AppException(
        ErrorCodes.DATA_VALIDATION_FAILED,
        'Invalid XP value',
        'medium',
        'xp_validation',
        { received: xp }
      );
    }
    return Math.floor(xp);
  }
  
  /**
   * Validate level value
   */
  static validateLevel(level: any): number {
    if (typeof level !== 'number' || isNaN(level) || level < 1 || level > 1000) {
      throw new AppException(
        ErrorCodes.DATA_VALIDATION_FAILED,
        'Invalid level value',
        'medium',
        'level_validation',
        { received: level }
      );
    }
    return Math.floor(level);
  }
  
  /**
   * Validate timestamp
   */
  static validateTimestamp(timestamp: any): Date {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new AppException(
        ErrorCodes.DATA_VALIDATION_FAILED,
        'Invalid timestamp',
        'medium',
        'timestamp_validation',
        { received: timestamp }
      );
    }
    return date;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  /**
   * Record performance metric
   */
  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
    
    // Check for performance issues
    if (name === 'render_time' && value > 100) {
      ErrorHandler.handleError(
        new AppException(
          ErrorCodes.PERFORMANCE_SLOW_RENDER,
          `Slow render detected: ${value}ms`,
          'medium',
          'performance_monitoring'
        )
      );
    }
  }
  
  /**
   * Get metric statistics
   */
  static getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }
  
  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Global error boundary setup
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled JavaScript errors
  window.addEventListener('error', (event) => {
    ErrorHandler.handleError(
      new AppException(
        ErrorCodes.SYSTEM_BROWSER_INCOMPATIBLE,
        event.message,
        'high',
        'global_error_handler',
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      )
    );
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handleError(
      new AppException(
        ErrorCodes.SYSTEM_BROWSER_INCOMPATIBLE,
        'Unhandled promise rejection',
        'medium',
        'promise_rejection_handler',
        { reason: event.reason }
      )
    );
  });
}

export class ErrorRateLimiter {
  private static counts: Map<string, { count: number; windowStart: number }> = new Map();
  private static windowMs = 60000;
  private static maxPerWindow = 50;
  static allow(key: string): boolean {
    const now = Date.now();
    const entry = this.counts.get(key);
    if (!entry) {
      this.counts.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (now - entry.windowStart > this.windowMs) {
      entry.count = 1;
      entry.windowStart = now;
      return true;
    }
    if (entry.count >= this.maxPerWindow) {
      return false;
    }
    entry.count++;
    return true;
  }
  static setWindow(ms: number): void {
    this.windowMs = ms;
  }
  static setMax(n: number): void {
    this.maxPerWindow = n;
  }
}

export class ErrorStore {
  private static key = 'error_store_v1';
  static save(error: AppError): void {
    try {
      const raw = localStorage.getItem(this.key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ ...error, timestamp: new Date(error.timestamp).toISOString() });
      if (arr.length > 500) arr.shift();
      localStorage.setItem(this.key, JSON.stringify(arr));
    } catch {
    }
  }
  static load(limit: number = 100): AppError[] {
    try {
      const raw = localStorage.getItem(this.key);
      const arr = raw ? JSON.parse(raw) : [];
      return arr.slice(-limit).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) }));
    } catch {
      return [];
    }
  }
  static clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
    }
  }
}

export class DiagnosticsCollector {
  private static data: Record<string, any> = {};
  static set(key: string, value: any): void {
    this.data[key] = value;
  }
  static get(key: string): any {
    return this.data[key];
  }
  static snapshot(): Record<string, any> {
    return { ...this.data, capturedAt: new Date().toISOString() };
  }
  static merge(payload: Record<string, any>): void {
    Object.assign(this.data, payload);
  }
  static clear(): void {
    this.data = {};
  }
}
