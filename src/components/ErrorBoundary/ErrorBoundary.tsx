import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../../utils/logger';
import { getErrorMessage, sanitizeForLogging } from '../../utils/errorHandlingEnhanced';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    resetKeys?: unknown[];
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    errorCount: number;
}

/**
 * Enhanced Error Boundary with recovery options and logging
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const { onError, context = 'ErrorBoundary' } = this.props;

        // Log error
        logger.error(
            `Component error caught: ${error.message}`,
            context,
            sanitizeForLogging({
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
            })
        );

        // Update error count
        this.setState(prev => ({
            errorInfo,
            errorCount: prev.errorCount + 1,
        }));

        // Call custom error handler
        if (onError) {
            onError(error, errorInfo);
        }
    }

    componentDidUpdate(prevProps: Props): void {
        const { resetKeys } = this.props;
        const { hasError } = this.state;

        // Auto-reset if resetKeys changed
        if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
            this.reset();
        }
    }

    reset = (): void => {
        logger.info('Error boundary reset', this.props.context || 'ErrorBoundary');
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    reload = (): void => {
        logger.info('Page reload requested', this.props.context || 'ErrorBoundary');
        window.location.reload();
    };

    goHome = (): void => {
        logger.info('Navigate to home requested', this.props.context || 'ErrorBoundary');
        window.location.href = '/';
    };

    render(): ReactNode {
        const { hasError, error, errorCount } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            // Use custom fallback if provided
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border-4 border-red-500 brutal-shadow p-8 max-w-2xl w-full"
                    >
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <motion.div
                                animate={{
                                    rotate: [0, -10, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                                className="w-20 h-20 bg-red-500 border-4 border-black brutal-shadow flex items-center justify-center"
                            >
                                <AlertTriangle size={40} className="text-black" />
                            </motion.div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl font-black text-red-500 mb-4 font-mono text-center">
                            SYSTEM ERROR
                        </h1>

                        {/* Error Message */}
                        <div className="bg-gray-800 border-2 border-gray-700 p-4 mb-6">
                            <p className="text-gray-300 font-mono text-sm mb-2">
                                {getErrorMessage(error)}
                            </p>
                            {errorCount > 1 && (
                                <p className="text-yellow-500 font-mono text-xs">
                                    ⚠️ This error has occurred {errorCount} times
                                </p>
                            )}
                        </div>

                        {/* Error Details (Development only) */}
                        {import.meta.env.DEV && (
                            <details className="mb-6">
                                <summary className="text-gray-500 font-mono text-sm cursor-pointer hover:text-gray-400 mb-2">
                                    🔍 Technical Details (Dev Only)
                                </summary>
                                <div className="bg-black border-2 border-gray-700 p-4 overflow-auto max-h-60">
                                    <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                                        {error.stack}
                                    </pre>
                                </div>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={this.reset}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-lime-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-lime-400 transition-colors"
                            >
                                <RefreshCw size={16} />
                                TRY AGAIN
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={this.reload}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-cyan-400 transition-colors"
                            >
                                <RefreshCw size={16} />
                                RELOAD PAGE
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={this.goHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-purple-400 transition-colors"
                            >
                                <Home size={16} />
                                GO HOME
                            </motion.button>
                        </div>

                        {/* Help Text */}
                        <p className="text-gray-500 text-center text-sm font-mono mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </motion.div>
                </div>
            );
        }

        return children;
    }
}

/**
 * Lightweight error boundary for smaller components
 */
export function LightErrorBoundary({
    children,
    context = 'Component'
}: {
    children: ReactNode;
    context?: string;
}): JSX.Element {
    return (
        <ErrorBoundary
            context={context}
            fallback={
                <div className="p-4 bg-red-900/20 border-2 border-red-500 brutal-shadow">
                    <p className="text-red-400 font-mono text-sm">
                        ⚠️ {context} failed to load
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
