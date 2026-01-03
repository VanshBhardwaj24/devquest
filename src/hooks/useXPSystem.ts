/**
 * Comprehensive XP System Hook
 * Provides XP management, calculations, and utilities for all components
 */

import { useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext.refactored';
import { getXPForLevel, calculateLevelFromXP, calculateXPProgress } from '../utils/xpCalculations';
import { validateXP } from '../utils/xpCalculations';

export interface XPSystemData {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  xpMultiplier: number;
  bonusXPActive: boolean;
  bonusXPExpiry?: Date;
  progress: {
    levelXP: number;
    neededXP: number;
    progress: number;
    xpToNext: number;
  };
  stats: {
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    totalXPForLevel: number;
    rank: string;
  };
}

export interface XPSystemActions {
  addXP: (amount: number, source: string, multiplier?: number) => void;
  spendXP: (amount: number, reason: string) => boolean;
  convertXPToGold: (amount: number) => boolean;
  activateBonusXP: (multiplier: number, duration: number) => void;
  calculateXPForAction: (action: string, difficulty?: string) => number;
  getXPGained: (source: string) => number;
}

export const useXPSystem = (): XPSystemData & XPSystemActions => {
  const { state, dispatch, actions } = useApp();

  // Memoized XP calculations
  const progress = useMemo(() => {
    return calculateXPProgress(state.xpSystem.currentXP, state.xpSystem.currentLevel);
  }, [state.xpSystem.currentXP, state.xpSystem.currentLevel]);

  const stats = useMemo(() => {
    const xpForCurrentLevel = getXPForLevel(state.xpSystem.currentLevel);
    const xpForNextLevel = getXPForLevel(state.xpSystem.currentLevel + 1);
    const totalXPForLevel = xpForCurrentLevel;
    
    // Calculate rank based on level
    const rank = calculateRank(state.xpSystem.currentLevel);
    
    return {
      xpForCurrentLevel,
      xpForNextLevel,
      totalXPForLevel,
      rank,
    };
  }, [state.xpSystem.currentLevel]);

  // Add XP with validation and logging
  const addXP = useCallback((amount: number, source: string, multiplier?: number) => {
    const validatedAmount = validateXP(amount);
    if (validatedAmount <= 0) return;
    
    dispatch(actions.addXP(validatedAmount, source, multiplier));
    
    // Log XP gain for analytics
    console.log(`XP Gained: +${validatedAmount} from ${source}`);
  }, [dispatch, actions]);

  // Spend XP with validation
  const spendXP = useCallback((amount: number, reason: string): boolean => {
    const validatedAmount = validateXP(amount);
    if (validatedAmount <= 0) return false;
    
    if (state.xpSystem.currentXP >= validatedAmount) {
      dispatch(actions.addXP(-validatedAmount, reason));
      console.log(`XP Spent: -${validatedAmount} for ${reason}`);
      return true;
    }
    
    console.warn(`Insufficient XP: Need ${validatedAmount}, have ${state.xpSystem.currentXP}`);
    return false;
  }, [dispatch, actions, state.xpSystem.currentXP]);

  // Convert XP to Gold
  const convertXPToGold = useCallback((amount: number): boolean => {
    const goldAmount = Math.floor(amount / 10); // 1 Gold = 10 XP
    if (goldAmount <= 0) return false;
    
    dispatch(actions.convertXPToGold(goldAmount));
    console.log(`Converted ${amount} XP to ${goldAmount} Gold`);
    return true;
  }, [dispatch, actions]);

  // Activate bonus XP
  const activateBonusXP = useCallback((multiplier: number, duration: number) => {
    dispatch(actions.activateBonusXP(multiplier, duration));
    console.log(`Bonus XP activated: ${multiplier}x for ${duration} minutes`);
  }, [dispatch, actions]);

  // Calculate XP for different actions
  const calculateXPForAction = useCallback((action: string, difficulty?: string): number => {
    const baseXP = getBaseXPForAction(action);
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const bonusMultiplier = state.xpSystem.xpMultiplier;
    
    return Math.floor(baseXP * difficultyMultiplier * bonusMultiplier);
  }, [state.xpSystem.xpMultiplier]);

  // Get total XP gained from a source
  const getXPGained = useCallback((source: string): number => {
    // This would typically come from analytics or tracking
    // For now, return a calculated estimate
    return calculateXPForAction(source);
  }, [calculateXPForAction]);

  return {
    // Data
    currentXP: state.xpSystem.currentXP,
    currentLevel: state.xpSystem.currentLevel,
    xpToNextLevel: state.xpSystem.xpToNextLevel,
    totalXPEarned: state.xpSystem.totalXPEarned,
    xpMultiplier: state.xpSystem.xpMultiplier,
    bonusXPActive: state.xpSystem.bonusXPActive,
    bonusXPExpiry: state.xpSystem.bonusXPExpiry,
    progress,
    stats,
    
    // Actions
    addXP,
    spendXP,
    convertXPToGold,
    activateBonusXP,
    calculateXPForAction,
    getXPGained,
  };
};

// Helper functions
function getBaseXPForAction(action: string): number {
  const xpMap: Record<string, number> = {
    'task_completion': 50,
    'daily_login': 25,
    'streak_milestone': 100,
    'achievement_unlock': 150,
    'challenge_complete': 200,
    'coding_problem': 75,
    'project_completion': 300,
    'skill_level_up': 125,
    'mindfulness_session': 30,
    'social_interaction': 20,
    'learning_complete': 80,
  };
  
  return xpMap[action] || 25;
}

function getDifficultyMultiplier(difficulty?: string): number {
  const multipliers: Record<string, number> = {
    'Easy': 1,
    'Medium': 1.5,
    'Hard': 2,
    'Elite': 3,
    'Legendary': 5,
  };
  
  return multipliers[difficulty || 'Easy'] || 1;
}

function calculateRank(level: number): string {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Novice';
  if (level < 20) return 'Apprentice';
  if (level < 30) return 'Journeyman';
  if (level < 50) return 'Expert';
  if (level < 75) return 'Master';
  if (level < 100) return 'Grandmaster';
  return 'Legendary';
}
