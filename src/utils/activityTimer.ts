/**
 * Activity timer utilities - Tracks user activity sessions
 */

export interface ActivityTimer {
  sessionStartTime: Date | null;
  totalActiveTime: number; // milliseconds
  currentSessionTime: number; // milliseconds
  isActive: boolean;
  lastActivityTimestamp: Date | null;
}

/**
 * Initializes activity timer state
 */
export const initializeActivityTimer = (): ActivityTimer => {
  return {
    sessionStartTime: null,
    totalActiveTime: 0,
    currentSessionTime: 0,
    isActive: false,
    lastActivityTimestamp: null,
  };
};

/**
 * Calculates session duration in milliseconds
 */
export const calculateSessionDuration = (startTime: Date | null, endTime: Date): number => {
  if (!startTime) return 0;
  return endTime.getTime() - startTime.getTime();
};

/**
 * Formats milliseconds into human-readable time
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};
