/**
 * Streak calculation utilities - Handles time-based streak logic with proper timezone handling
 */

export interface TimeBasedStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date string
  streakStartDate: string; // ISO date string
  dailyActivity: {
    [date: string]: {
      problemsSolved: number;
      tasksCompleted: number;
      xpEarned: number;
      activeMinutes: number;
      lastActivityTime: string; // ISO timestamp
    };
  };
}

export interface StreakResult {
  newStreak: number;
  streakBroken: boolean;
  streakContinued: boolean;
  daysInactive: number;
}

export interface InactivityPunishment {
  shouldPunish: boolean;
  xpPenalty: number;
  streakReset: boolean;
  description: string;
}

/**
 * Gets today's date string in YYYY-MM-DD format using consistent timezone
 */
export const getTodayDateString = (): string => {
  return new Date().toLocaleDateString('en-CA');
};

/**
 * Calculates time-based streak with proper date handling
 */
export const calculateTimeBasedStreak = (
  currentStreak: number,
  lastActivityDate: string,
  todayDate: string = getTodayDateString()
): StreakResult => {
  if (!lastActivityDate) {
    return { newStreak: 1, streakBroken: false, streakContinued: false, daysInactive: 0 };
  }

  const lastDate = new Date(lastActivityDate + 'T00:00:00');
  const today = new Date(todayDate + 'T00:00:00');

  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return { newStreak: currentStreak, streakBroken: false, streakContinued: true, daysInactive: 0 };
  } else if (daysDiff === 1) {
    return { newStreak: currentStreak + 1, streakBroken: false, streakContinued: true, daysInactive: 0 };
  } else {
    return { newStreak: 1, streakBroken: true, streakContinued: false, daysInactive: daysDiff };
  }
};

/**
 * Calculates punishment based on inactivity duration
 */
export const calculateInactivityPunishment = (daysInactive: number, currentXP: number): InactivityPunishment => {
  if (daysInactive === 0) {
    return { shouldPunish: false, xpPenalty: 0, streakReset: false, description: '' };
  }

  let xpPenalty = 0;
  let streakReset = false;
  let description = '';

  if (daysInactive >= 14) {
    xpPenalty = Math.floor(currentXP * 0.5);
    streakReset = true;
    description = 'Major inactivity: 50% XP loss and streak reset';
  } else if (daysInactive >= 7) {
    xpPenalty = Math.floor(currentXP * 0.25);
    description = 'Extended inactivity: 25% XP loss';
  } else if (daysInactive >= 3) {
    xpPenalty = Math.floor(currentXP * 0.1);
    description = 'Moderate inactivity: 10% XP loss';
  } else if (daysInactive >= 1) {
    xpPenalty = Math.floor(currentXP * 0.05);
    description = 'Minor inactivity: 5% XP loss';
  }

  return {
    shouldPunish: xpPenalty > 0,
    xpPenalty,
    streakReset,
    description
  };
};

/**
 * Initializes a new time-based streak object
 */
export const initializeTimeBasedStreak = (): TimeBasedStreak => {
  const today = getTodayDateString();
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    streakStartDate: today,
    dailyActivity: {},
  };
};
