/**
 * XP calculation utilities - Single source of truth for all XP-related calculations
 */

/**
 * Calculates the XP required for a given level
 * Formula: 1000 * 1.1^(level-1)
 */
export const getXPForLevel = (level: number): number => {
  return Math.floor(1000 * Math.pow(1.1, level - 1));
};

/**
 * Calculates the level from total XP using iterative approach
 */
export const calculateLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let cumulativeXP = 0;
  
  while (true) {
    const xpNeeded = getXPForLevel(level + 1);
    if (cumulativeXP + xpNeeded > totalXP) break;
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
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const levelXP = Math.max(0, currentXP - xpForCurrentLevel);
  const neededXP = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min(Math.max((levelXP / neededXP) * 100, 0), 100);
  
  return {
    levelXP,
    neededXP,
    progress,
    xpToNext: xpForNextLevel - currentXP
  };
};

/**
 * Validates XP values to prevent invalid states
 */
export const validateXP = (xp: number): number => {
  return Math.max(0, Math.floor(xp));
};
