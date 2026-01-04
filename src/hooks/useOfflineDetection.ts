/**
 * Offline Detection Hook
 * Detects and handles offline/online state changes
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

interface UseOfflineDetectionResult {
    isOnline: boolean;
    isOffline: boolean;
    wasOffline: boolean;
    checkConnection: () => Promise<boolean>;
}

/**
 * Hook to detect and handle offline/online state
 */
export function useOfflineDetection(): UseOfflineDetectionResult {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    /**
     * Check actual network connectivity (not just navigator.onLine)
     */
    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            // Try to fetch a small resource
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
            });
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    /**
     * Handle online event
     */
    const handleOnline = useCallback(async () => {
        logger.info('Browser reports online', 'NETWORK');

        // Verify actual connectivity
        const actuallyOnline = await checkConnection();

        if (actuallyOnline) {
            setIsOnline(true);
            if (wasOffline) {
                logger.info('Connection restored', 'NETWORK');
                setWasOffline(false);

                // Dispatch custom event for app to handle
                window.dispatchEvent(new CustomEvent('connection-restored'));
            }
        } else {
            logger.warn('Browser reports online but connection check failed', 'NETWORK');
        }
    }, [checkConnection, wasOffline]);

    /**
     * Handle offline event
     */
    const handleOffline = useCallback(() => {
        logger.warn('Connection lost', 'NETWORK');
        setIsOnline(false);
        setWasOffline(true);

        // Dispatch custom event for app to handle
        window.dispatchEvent(new CustomEvent('connection-lost'));
    }, []);

    /**
     * Set up event listeners
     */
    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial connection check
        checkConnection().then(online => {
            if (!online && navigator.onLine) {
                // Browser thinks we're online but we're not
                handleOffline();
            }
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline, checkConnection]);

    /**
     * Periodic connection check (every 30 seconds)
     */
    useEffect(() => {
        const interval = setInterval(async () => {
            const online = await checkConnection();

            if (online !== isOnline) {
                if (online) {
                    handleOnline();
                } else {
                    handleOffline();
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isOnline, checkConnection, handleOnline, handleOffline]);

    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline,
        checkConnection,
    };
}

/**
 * Hook to queue actions when offline and execute when back online
 */
export function useOfflineQueue<T extends (...args: never[]) => Promise<unknown>>() {
    const { isOnline } = useOfflineDetection();
    const [queue, setQueue] = useState<Array<{ fn: T; args: Parameters<T> }>>([]);

    /**
     * Add action to queue or execute immediately if online
     */
    const enqueue = useCallback((fn: T, ...args: Parameters<T>) => {
        if (isOnline) {
            // Execute immediately
            return fn(...args);
        } else {
            // Add to queue
            setQueue(prev => [...prev, { fn, args }]);
            logger.info('Action queued for when online', 'OFFLINE_QUEUE');
            return Promise.resolve();
        }
    }, [isOnline]);

    /**
     * Process queue when coming back online
     */
    useEffect(() => {
        if (isOnline && queue.length > 0) {
            logger.info(`Processing ${queue.length} queued actions`, 'OFFLINE_QUEUE');

            // Execute all queued actions
            queue.forEach(({ fn, args }) => {
                fn(...args).catch(error => {
                    logger.error('Failed to execute queued action', 'OFFLINE_QUEUE', error);
                });
            });

            // Clear queue
            setQueue([]);
        }
    }, [isOnline, queue]);

    return {
        enqueue,
        queueLength: queue.length,
        clearQueue: () => setQueue([]),
    };
}
