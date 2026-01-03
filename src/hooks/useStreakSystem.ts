/**
 * Comprehensive Streak System Hook
 * Provides streak management, calculations, and utilities for all components
 */

import { useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  calculateTimeBasedStreak, 
  getTodayDateString,
  calculateInactivityPunishment 
} from '../utils/streakCalculations';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakStartDate: string;
  streakType: 'daily' | 'coding' | 'task' | 'combined';
  daysInactive: number;
  isStreakActive: boolean;
  streakBroken: boolean;
  nextMilestone: number;
  daysToMilestone: number;
  protection: {
    hasShield: boolean;
    shieldType: string;
    expiresAt?: Date;
  };
}

export interface StreakActions {
  updateStreak: (activityType: 'coding' | 'task' | 'general') => void;
  checkStreakStatus: () => void;
  protectStreak: (type: string, duration: number) => void;
  resetStreak: (reason: string) => void;
  calculateStreakBonus: (baseAmount: number) => number;
  getStreakRewards: () => StreakReward[];
}

export interface StreakReward {
  milestone: number;
  xpReward: number;
  goldReward: number;
  badgeReward?: string;
  titleReward?: string;
}

export const useStreakSystem = (): StreakData & StreakActions => {
  const { state, dispatch } = useApp();

  // Calculate streak data
  const streakData = useMemo((): StreakData => {
    const today = getTodayDateString();
    const globalStreak = state.globalStreak;
    
    // Calculate days inactive
    const daysInactive = globalStreak.lastActivityDate 
      ? Math.floor((new Date(today).getTime() - new Date(globalStreak.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check if streak is active
    const isStreakActive = daysInactive === 0;
    const streakBroken = daysInactive > 1;

    // Calculate next milestone
    const nextMilestone = getNextStreakMilestone(globalStreak.currentStreak);
    const daysToMilestone = nextMilestone - globalStreak.currentStreak;

    // Check for streak protection
    const hasShield = checkStreakProtection(state.activePowerUps);
    const shieldType = getShieldType(state.activePowerUps);

    return {
      currentStreak: globalStreak.currentStreak,
      longestStreak: globalStreak.longestStreak,
      lastActivityDate: globalStreak.lastActivityDate,
      streakStartDate: globalStreak.streakStartDate,
      streakType: globalStreak.streakType,
      daysInactive,
      isStreakActive,
      streakBroken,
      nextMilestone,
      daysToMilestone,
      protection: {
        hasShield,
        shieldType,
        expiresAt: getShieldExpiry(state.activePowerUps),
      },
    };
  }, [state.globalStreak, state.activePowerUps]);

  // Update streak for activity
  const updateStreak = useCallback((activityType: 'coding' | 'task' | 'general') => {
    const timestamp = new Date();
    dispatch({ type: 'UPDATE_TIME_BASED_STREAK', payload: { activityType, timestamp } });
    const rewards = getStreakRewardsForMilestone(streakData.currentStreak);
    rewards.forEach(reward => {
      if (reward.xpReward > 0) {
        dispatch({ type: 'ADD_XP', payload: { amount: reward.xpReward, source: `streak_milestone_${reward.milestone}` } });
      }
    });
  }, [dispatch, streakData.currentStreak]);

  // Check streak status and apply penalties if needed
  const checkStreakStatus = useCallback(() => {
    if (streakData.streakBroken && !streakData.protection.hasShield) {
      const punishment = calculateInactivityPunishment(streakData.daysInactive, state.xpSystem.currentXP);
      if (punishment.shouldPunish) {
        dispatch({ type: 'ADD_XP', payload: { amount: -punishment.xpPenalty, source: 'streak_penalty' } });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'streak',
            title: 'Streak Broken 💔',
            message: `Your ${streakData.currentStreak}-day streak has been broken. ${punishment.description}`,
            timestamp: new Date(),
            read: false,
            priority: 'high',
          },
        });
      }
    }
  }, [dispatch, streakData, state.xpSystem.currentXP]);

  // Protect streak with power-up
  const protectStreak = useCallback((type: string, duration: number) => {
    dispatch({ type: 'ACTIVATE_POWER_UP', payload: { id: type, expiresAt: Date.now() + duration * 60_000 } });
  }, [dispatch]);

  // Reset streak manually
  const resetStreak = useCallback((reason: string) => {
    dispatch({ type: 'UPDATE_STREAK', payload: 0 });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'system',
        title: 'Streak Reset',
        message: `Streak has been reset: ${reason}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
      },
    });
  }, [dispatch]);

  // Calculate streak bonus multiplier
  const calculateStreakBonus = useCallback((baseAmount: number): number => {
    const streakMultiplier = getStreakMultiplier(streakData.currentStreak);
    return Math.floor(baseAmount * streakMultiplier);
  }, [streakData.currentStreak]);

  // Get available streak rewards
  const getStreakRewards = useCallback((): StreakReward[] => {
    return getStreakRewardsForMilestone(streakData.currentStreak);
  }, [streakData.currentStreak]);

  return {
    ...streakData,
    updateStreak,
    checkStreakStatus,
    protectStreak,
    resetStreak,
    calculateStreakBonus,
    getStreakRewards,
  };
};

// Helper functions
function getNextStreakMilestone(currentStreak: number): number {
  const milestones = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];
  return milestones.find(m => m > currentStreak) || 2000;
}

function checkStreakProtection(activePowerUps: any[]): boolean {
  return activePowerUps.some(pu => {
    // Check for streak protection power-ups
    return pu.id.includes('shield') || pu.id.includes('protection');
  });
}

function getShieldType(activePowerUps: any[]): string {
  const shield = activePowerUps.find(pu => 
    pu.id.includes('shield') || pu.id.includes('protection')
  );
  return shield ? shield.id : 'none';
}

function getShieldExpiry(activePowerUps: any[]): Date | undefined {
  const shield = activePowerUps.find(pu => 
    pu.id.includes('shield') || pu.id.includes('protection')
  );
  return shield ? new Date(shield.expiresAt) : undefined;
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 365) return 3.0; // Legendary streak
  if (streak >= 100) return 2.5; // Epic streak
  if (streak >= 50) return 2.0; // Master streak
  if (streak >= 30) return 1.5; // Expert streak
  if (streak >= 14) return 1.3; // Dedicated streak
  if (streak >= 7) return 1.2; // Weekly streak
  if (streak >= 3) return 1.1; // Getting started
  return 1.0;
}

function getStreakRewardsForMilestone(streak: number): StreakReward[] {
  const rewards: StreakReward[] = [];
  
  // Define milestone rewards
  const milestoneRewards: Record<number, StreakReward> = {
    1: { milestone: 1, xpReward: 50, goldReward: 10, badgeReward: 'first_step' },
    3: { milestone: 3, xpReward: 150, goldReward: 25, badgeReward: 'getting_started' },
    7: { milestone: 7, xpReward: 350, goldReward: 50, badgeReward: 'week_warrior' },
    14: { milestone: 14, xpReward: 700, goldReward: 100, badgeReward: 'fortnight_fighter' },
    21: { milestone: 21, xpReward: 1050, goldReward: 150, badgeReward: 'three_week_champion' },
    30: { milestone: 30, xpReward: 1500, goldReward: 200, badgeReward: 'monthly_master' },
    50: { milestone: 50, xpReward: 2500, goldReward: 350, badgeReward: 'fifty_day_legend' },
    75: { milestone: 75, xpReward: 3750, goldReward: 500, badgeReward: 'seasoned_veteran' },
    100: { milestone: 100, xpReward: 5000, goldReward: 750, badgeReward: 'century_club', titleReward: 'Century Master' },
    150: { milestone: 150, xpReward: 7500, goldReward: 1000, badgeReward: 'elite_streaker' },
    200: { milestone: 200, xpReward: 10000, goldReward: 1500, badgeReward: 'double_century', titleReward: 'Streak Legend' },
    365: { milestone: 365, xpReward: 20000, goldReward: 5000, badgeReward: 'year_warrior', titleReward: 'Annual Champion' },
    500: { milestone: 500, xpReward: 30000, goldReward: 10000, badgeReward: 'five_hundred_hero', titleReward: 'Half Millennium Master' },
    1000: { milestone: 1000, xpReward: 100000, goldReward: 50000, badgeReward: 'thousand_day_titan', titleReward: 'Millennium Legend' },
  };
  
  // Find all milestones that have been reached
  Object.entries(milestoneRewards).forEach(([milestoneStr, reward]) => {
    const milestone = parseInt(milestoneStr);
    if (streak >= milestone && streak < parseInt(milestoneStr) + 1) {
      rewards.push(reward);
    }
  });
  
  return rewards;
}
