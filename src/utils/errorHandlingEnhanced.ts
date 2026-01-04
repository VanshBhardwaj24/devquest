/**
 * Enhanced Error Handling Utilities
 * Provides comprehensive error handling with proper typing and recovery strategies
 */

import { logger } from './logger';

/**
 * Custom error types for better error handling
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: string,
        public recoverable: boolean = true
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, context?: string) {
        super(message, 'VALIDATION_ERROR', context, true);
        this.name = 'ValidationError';
    }
}

export class NetworkError extends AppError {
    constructor(message: string, context?: string) {
        super(message, 'NETWORK_ERROR', context, true);
        this.name = 'NetworkError';
    }
}

export class AuthError extends AppError {
    constructor(message: string, context?: string) {
        super(message, 'AUTH_ERROR', context, true);
        this.name = 'AuthError';
    }
}

export class DataError extends AppError {
    constructor(message: string, context?: string) {
        super(message, 'DATA_ERROR', context, true);
        this.name = 'DataError';
    }
}

/**
 * Error handler with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        delay?: number;
        backoff?: boolean;
        context?: string;
    } = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, backoff = true, context = 'unknown' } = options;

    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
                logger.warn(
                    `Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`,
                    context,
                    error
                );
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    logger.error(`All retry attempts failed`, context, lastError);
    throw lastError;
}

/**
 * Safe execution wrapper with error handling
 */
export function tryCatch<T>(
    fn: () => T,
    fallback: T,
    context?: string
): T {
    try {
        return fn();
    } catch (error) {
        logger.error('Error in tryCatch', context, error);
        return fallback;
    }
}

/**
 * Async safe execution wrapper
 */
export async function tryCatchAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: string
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        logger.error('Error in tryCatchAsync', context, error);
        return fallback;
    }
}

/**
 * Validate and sanitize user input
 */
export function validateInput(
    value: unknown,
    type: 'string' | 'number' | 'boolean' | 'email',
    options: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: RegExp;
    } = {}
): { valid: boolean; error?: string; value?: unknown } {
    const { required = false, min, max, pattern } = options;

    // Check required
    if (required && (value === null || value === undefined || value === '')) {
        return { valid: false, error: 'This field is required' };
    }

    // If not required and empty, return valid
    if (!required && (value === null || value === undefined || value === '')) {
        return { valid: true, value };
    }

    // Type-specific validation
    switch (type) {
        case 'string':
            if (typeof value !== 'string') {
                return { valid: false, error: 'Must be a string' };
            }
            if (min !== undefined && value.length < min) {
                return { valid: false, error: `Must be at least ${min} characters` };
            }
            if (max !== undefined && value.length > max) {
                return { valid: false, error: `Must be at most ${max} characters` };
            }
            if (pattern && !pattern.test(value)) {
                return { valid: false, error: 'Invalid format' };
            }
            return { valid: true, value: value.trim() };

        case 'number':
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof num !== 'number' || isNaN(num)) {
                return { valid: false, error: 'Must be a number' };
            }
            if (min !== undefined && num < min) {
                return { valid: false, error: `Must be at least ${min}` };
            }
            if (max !== undefined && num > max) {
                return { valid: false, error: `Must be at most ${max}` };
            }
            return { valid: true, value: num };

        case 'boolean':
            if (typeof value !== 'boolean') {
                return { valid: false, error: 'Must be true or false' };
            }
            return { valid: true, value };

        case 'email':
            if (typeof value !== 'string') {
                return { valid: false, error: 'Must be a string' };
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                return { valid: false, error: 'Invalid email address' };
            }
            return { valid: true, value: value.trim().toLowerCase() };

        default:
            return { valid: false, error: 'Unknown validation type' };
    }
}

/**
 * Parse error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred';
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
    if (error instanceof AppError) {
        return error.recoverable;
    }

    // Network errors are usually recoverable
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return true;
    }

    return false;
}

/**
 * Sanitize data for logging (remove sensitive information)
 */
export function sanitizeForLogging(data: unknown): unknown {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data !== 'object') {
        return data;
    }

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];

    if (Array.isArray(data)) {
        return data.map(item => sanitizeForLogging(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeForLogging(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Create a debounced error reporter
 */
export function createErrorReporter(delay = 5000) {
    let timeoutId: NodeJS.Timeout | null = null;
    const errors: Array<{ error: unknown; context: string; timestamp: Date }> = [];

    return {
        report: (error: unknown, context: string) => {
            errors.push({ error, context, timestamp: new Date() });

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                if (errors.length > 0) {
                    logger.error(
                        `Batch error report: ${errors.length} errors`,
                        'ERROR_REPORTER',
                        sanitizeForLogging(errors)
                    );
                    errors.length = 0;
                }
            }, delay);
        },
        flush: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (errors.length > 0) {
                logger.error(
                    `Flushed error report: ${errors.length} errors`,
                    'ERROR_REPORTER',
                    sanitizeForLogging(errors)
                );
                errors.length = 0;
            }
        }
    };
}

export const globalErrorReporter = createErrorReporter();
