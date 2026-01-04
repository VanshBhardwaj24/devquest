/**
 * Base Service Class
 * Provides standardized error handling, retry logic, and caching for all services
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logger } from '../utils/logger';
import { withRetry, NetworkError, DataError } from '../utils/errorHandlingEnhanced';

export interface ServiceConfig {
    enableCache?: boolean;
    cacheTimeout?: number; // milliseconds
    retryAttempts?: number;
    retryDelay?: number;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Base service class with common functionality
 */
export class BaseService {
    protected serviceName: string;
    protected cache: Map<string, CacheEntry<unknown>>;
    protected config: ServiceConfig;

    constructor(serviceName: string, config: ServiceConfig = {}) {
        this.serviceName = serviceName;
        this.cache = new Map();
        this.config = {
            enableCache: config.enableCache ?? true,
            cacheTimeout: config.cacheTimeout ?? 300000, // 5 minutes default
            retryAttempts: config.retryAttempts ?? 3,
            retryDelay: config.retryDelay ?? 1000,
        };
    }

    /**
     * Check if Supabase is configured
     */
    protected isConfigured(): boolean {
        return isSupabaseConfigured();
    }

    /**
     * Execute a database query with retry logic and error handling
     */
    protected async executeQuery<T>(
        queryFn: () => Promise<{ data: T | null; error: unknown }>,
        context: string
    ): Promise<T | null> {
        if (!this.isConfigured()) {
            logger.warn('Supabase not configured, skipping query', this.serviceName);
            return null;
        }

        try {
            const result = await withRetry(
                async () => {
                    const { data, error } = await queryFn();

                    if (error) {
                        logger.error(`Query failed: ${context}`, this.serviceName, error);
                        throw new DataError(`Failed to ${context}`, this.serviceName);
                    }

                    return data;
                },
                {
                    maxRetries: this.config.retryAttempts,
                    delay: this.config.retryDelay,
                    backoff: true,
                    context: `${this.serviceName}.${context}`,
                }
            );

            logger.debug(`Query successful: ${context}`, this.serviceName);
            return result;
        } catch (error) {
            logger.error(`Query failed after retries: ${context}`, this.serviceName, error);
            throw error;
        }
    }

    /**
     * Get data from cache if available and not expired
     */
    protected getFromCache<T>(key: string): T | null {
        if (!this.config.enableCache) return null;

        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > (this.config.cacheTimeout ?? 0);
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        logger.debug(`Cache hit: ${key}`, this.serviceName);
        return entry.data;
    }

    /**
     * Store data in cache
     */
    protected setCache<T>(key: string, data: T): void {
        if (!this.config.enableCache) return;

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });

        logger.debug(`Cache set: ${key}`, this.serviceName);
    }

    /**
     * Clear cache entry or entire cache
     */
    protected clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
            logger.debug(`Cache cleared: ${key}`, this.serviceName);
        } else {
            this.cache.clear();
            logger.debug('Cache cleared: all', this.serviceName);
        }
    }

    /**
     * Execute with caching
     */
    protected async executeWithCache<T>(
        cacheKey: string,
        fetchFn: () => Promise<T>,
        context: string
    ): Promise<T> {
        // Check cache first
        const cached = this.getFromCache<T>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // Fetch data
        try {
            const data = await fetchFn();

            // Store in cache
            if (data !== null && data !== undefined) {
                this.setCache(cacheKey, data);
            }

            return data;
        } catch (error) {
            logger.error(`Failed to fetch: ${context}`, this.serviceName, error);
            throw error;
        }
    }

    /**
     * Validate required fields
     */
    protected validateRequired<T extends Record<string, unknown>>(
        data: T,
        fields: (keyof T)[],
        context: string
    ): void {
        const missing = fields.filter(field => !data[field]);

        if (missing.length > 0) {
            const error = new DataError(
                `Missing required fields: ${missing.join(', ')}`,
                `${this.serviceName}.${context}`
            );
            logger.error(error.message, this.serviceName);
            throw error;
        }
    }

    /**
     * Safe JSON parse
     */
    protected safeJsonParse<T>(json: string, fallback: T): T {
        try {
            return JSON.parse(json) as T;
        } catch (error) {
            logger.warn('JSON parse failed, using fallback', this.serviceName, error);
            return fallback;
        }
    }

    /**
     * Get Supabase client
     */
    protected getClient() {
        return supabase;
    }

    /**
     * Log service action
     */
    protected log(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info', data?: unknown): void {
        logger[level](message, this.serviceName, data);
    }
}

/**
 * Create a service instance with configuration
 */
export function createService(serviceName: string, config?: ServiceConfig): BaseService {
    return new BaseService(serviceName, config);
}
