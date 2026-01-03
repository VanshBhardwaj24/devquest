/**
 * Daily reset utilities - Handles daily countdown and reset logic
 */

export interface DailyReset {
  lastResetDate: string; // ISO date string
  nextResetTime: Date;
  resetCountdown: number; // seconds until next reset
  hasResetToday: boolean;
}

/**
 * Gets the next reset time (midnight tomorrow)
 */
export const getNextResetTime = (): Date => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

/**
 * Calculates countdown in seconds until next reset
 */
export const calculateCountdown = (nextReset: Date): number => {
  const now = new Date();
  const diff = nextReset.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / 1000));
};

/**
 * Initializes daily reset state
 */
export const initializeDailyReset = (): DailyReset => {
  const today = new Date().toLocaleDateString('en-CA');
  let lastReset = today;
  
  if (typeof window !== 'undefined') {
    try {
      lastReset = localStorage.getItem('lastDailyReset') || today;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }
  
  const nextReset = getNextResetTime();
  
  return {
    lastResetDate: lastReset,
    nextResetTime: nextReset,
    resetCountdown: calculateCountdown(nextReset),
    hasResetToday: lastReset === today,
  };
};
