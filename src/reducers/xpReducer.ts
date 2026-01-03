/**
 * XP system reducer - Handles all XP-related state changes
 */

import { getXPForLevel, calculateLevelFromXP, validateXP } from '../utils/xpCalculations';
import { getTodayDateString } from '../utils/streakCalculations';
import type { XPSystem, AppAction } from '../types/enhanced';

export const xpReducer = (xpSystem: XPSystem, action: AppAction): XPSystem => {
  switch (action.type) {
    case 'INITIALIZE_XP_SYSTEM': {
      const { xp, level } = action.payload;
      const xpToNext = getXPForLevel(level + 1);
      return {
        ...xpSystem,
        currentXP: validateXP(xp),
        currentLevel: level,
        xpToNextLevel: xpToNext,
        totalXPEarned: validateXP(xp),
      };
    }
    
    case 'ADD_XP': {
      const { amount, source, multiplier = 1 } = action.payload;
      const isSpending = amount < 0;
      const finalAmount = isSpending 
        ? amount 
        : Math.floor(amount * multiplier * xpSystem.xpMultiplier);
      
      const newTotalXP = validateXP(xpSystem.currentXP + finalAmount);
      const newLevel = calculateLevelFromXP(newTotalXP);
      const newXPToNext = getXPForLevel(newLevel + 1);
      
      return {
        ...xpSystem,
        currentXP: newTotalXP,
        currentLevel: newLevel,
        xpToNextLevel: newXPToNext,
        totalXPEarned: isSpending ? xpSystem.totalXPEarned : xpSystem.totalXPEarned + finalAmount,
      };
    }
    
    case 'ACTIVATE_BONUS_XP': {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + action.payload.duration);
      return {
        ...xpSystem,
        xpMultiplier: action.payload.multiplier,
        bonusXPActive: true,
        bonusXPExpiry: expiryTime,
      };
    }
    
    default:
      return xpSystem;
  }
};
