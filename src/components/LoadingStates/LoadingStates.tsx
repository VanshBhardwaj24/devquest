/**
 * Loading States Components
 * Provides consistent loading UI across the application
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

/**
 * Animated loading spinner
 */
export function LoadingSpinner({
    size = 'md',
    color = 'text-lime-500',
    className = ''
}: LoadingSpinnerProps) {
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
    };

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={className}
        >
            <Loader2 size={sizes[size]} className={color} />
        </motion.div>
    );
}

/**
 * Skeleton loader for content
 */
export function Skeleton({
    width = '100%',
    height = '20px',
    className = ''
}: {
    width?: string;
    height?: string;
    className?: string;
}) {
    return (
        <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`bg-gray-700 rounded ${className}`}
            style={{ width, height }}
        />
    );
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="brutal-card bg-gray-900 border-gray-700 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton width="48px" height="48px" className="rounded-full" />
                        <div className="flex-1">
                            <Skeleton width="60%" height="20px" className="mb-2" />
                            <Skeleton width="40%" height="16px" />
                        </div>
                    </div>
                    <Skeleton width="100%" height="100px" className="mb-4" />
                    <div className="flex gap-2">
                        <Skeleton width="80px" height="32px" />
                        <Skeleton width="80px" height="32px" />
                    </div>
                </div>
            ))}
        </>
    );
}

/**
 * Full page loading screen
 */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 mx-auto mb-6 bg-lime-500 border-4 border-black brutal-shadow flex items-center justify-center"
                >
                    <span className="text-4xl">🚀</span>
                </motion.div>
                <motion.h2
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl font-black text-white mb-2 font-mono"
                >
                    {message}
                </motion.h2>

                <motion.div
                    className="mt-8 flex justify-center space-x-2"
                >
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scaleY: [1, 2, 1],
                                backgroundColor: ['#84cc16', '#22d3ee', '#84cc16']
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                            className="w-2 h-6 bg-lime-500"
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}

/**
 * Inline loader for buttons
 */
export function ButtonLoader() {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
        >
            <Loader2 size={16} />
        </motion.div>
    );
}

/**
 * Empty state component
 */
export function EmptyState({
    icon,
    title,
    description,
    action
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
        >
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-black text-white mb-2 font-mono">{title}</h3>
            {description && (
                <p className="text-gray-500 font-mono text-sm mb-6">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </motion.div>
    );
}

/**
 * Progress bar
 */
export function ProgressBar({
    progress,
    color = 'bg-lime-500',
    showPercentage = true,
    className = ''
}: {
    progress: number;
    color?: string;
    showPercentage?: boolean;
    className?: string;
}) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={className}>
            {showPercentage && (
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-mono">Progress</span>
                    <span className="text-white font-mono font-bold">{Math.round(clampedProgress)}%</span>
                </div>
            )}
            <div className="h-4 bg-gray-800 border-2 border-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}

/**
 * Offline indicator
 */
export function OfflineIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
            <div className="bg-orange-500 border-4 border-black brutal-shadow px-6 py-3">
                <p className="text-black font-black font-mono flex items-center gap-2">
                    <span className="text-xl">📡</span>
                    OFFLINE MODE
                </p>
            </div>
        </motion.div>
    );
}
