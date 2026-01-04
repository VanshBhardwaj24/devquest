/**
 * XP calculation utilities - Single source of truth for all XP-related calculations
 */

// Constants
export const XP_CONSTANTS = {
  BASE_XP: 1000,
  GROWTH_RATE: 1.1,
  MIN_XP: 0,
  MAX_XP: 999999999, // Prevent overflow
  MIN_LEVEL: 1,
  MAX_LEVEL: 100,
} as const;

// XP Reward amounts for different actions
export const XP_REWARDS = {
  TASK_EASY: 50,
  TASK_MEDIUM: 100,
  TASK_HARD: 200,
  TASK_ELITE: 500,
  PROBLEM_EASY: 30,
  PROBLEM_MEDIUM: 75,
  PROBLEM_HARD: 150,
  DAILY_LOGIN: 25,
  STREAK_BONUS: 10, // Per day
  CHALLENGE_COMPLETE: 300,
  ACHIEVEMENT_UNLOCK: 100,
} as const;

// Tier thresholds
export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 10,
  Gold: 25,
  Platinum: 50,
  Mythic: 75,
  Legend: 100,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

/**
 * Calculates the XP required for a given level
 * Formula: BASE_XP * GROWTH_RATE^(level-1)
 */
export const getXPForLevel = (level: number): number => {
  const validLevel = Math.max(XP_CONSTANTS.MIN_LEVEL, Math.min(level, XP_CONSTANTS.MAX_LEVEL));
  return Math.floor(XP_CONSTANTS.BASE_XP * Math.pow(XP_CONSTANTS.GROWTH_RATE, validLevel - 1));
};

/**
 * Calculates the level from total XP using iterative approach
 */
export const calculateLevelFromXP = (totalXP: number): number => {
  const validXP = validateXP(totalXP);
  let level = XP_CONSTANTS.MIN_LEVEL;
  let cumulativeXP = 0;

  while (level < XP_CONSTANTS.MAX_LEVEL) {
    const xpNeeded = getXPForLevel(level + 1);
    if (cumulativeXP + xpNeeded > validXP) break;
    cumulativeXP += xpNeeded;
    level++;
  }
  return level;
};

/**
 * Calculates comprehensive XP progress information
 */
export const calculateXPProgress = (currentXP: number, currentLevel: number): {
  levelXP: number;
  neededXP: number;
  progress: number;
  xpToNext: number;
} => {
  const validXP = validateXP(currentXP);
  const validLevel = Math.max(XP_CONSTANTS.MIN_LEVEL, Math.min(currentLevel, XP_CONSTANTS.MAX_LEVEL));

  const xpForCurrentLevel = getXPForLevel(validLevel);
  const xpForNextLevel = getXPForLevel(validLevel + 1);
  const levelXP = Math.max(0, validXP - xpForCurrentLevel);
  const neededXP = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min(Math.max((levelXP / neededXP) * 100, 0), 100);

  return {
    levelXP,
    neededXP,
    progress,
    xpToNext: Math.max(0, xpForNextLevel - validXP)
  };
};

/**
 * Validates XP values to prevent invalid states
 */
export const validateXP = (xp: number): number => {
  if (typeof xp !== 'number' || isNaN(xp)) {
    return XP_CONSTANTS.MIN_XP;
  }
  return Math.max(XP_CONSTANTS.MIN_XP, Math.min(Math.floor(xp), XP_CONSTANTS.MAX_XP));
};

/**
 * Calculates XP with multiplier applied
 */
export const applyXPMultiplier = (baseXP: number, multiplier: number): number => {
  const validMultiplier = Math.max(1, Math.min(multiplier, 10)); // Cap at 10x
  return validateXP(Math.floor(baseXP * validMultiplier));
};

/**
 * Calculates tier from level
 */
export const getTierFromLevel = (level: number): Tier => {
  if (level >= TIER_THRESHOLDS.Legend) return 'Legend';
  if (level >= TIER_THRESHOLDS.Mythic) return 'Mythic';
  if (level >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (level >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (level >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

/**
 * Calculates total XP needed to reach a specific level
 */
export const getTotalXPForLevel = (targetLevel: number): number => {
  let totalXP = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXP += getXPForLevel(level + 1);
  }
  return totalXP;
};

/**
 * Checks if user leveled up
 */
export const checkLevelUp = (oldXP: number, newXP: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
} => {
  const oldLevel = calculateLevelFromXP(oldXP);
  const newLevel = calculateLevelFromXP(newXP);

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    levelsGained: newLevel - oldLevel,
  };
};

/**
 * Calculates streak bonus XP
 */
export const calculateStreakBonus = (streakDays: number): number => {
  return Math.floor(XP_REWARDS.STREAK_BONUS * streakDays);
};
