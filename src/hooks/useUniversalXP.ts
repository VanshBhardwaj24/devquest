/**
 * Universal XP Hook - Ensures every component has access to XP logic
 * This is the main hook that should be used by most components
 */

import { useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext.refactored';
import { getXPForLevel, calculateLevelFromXP, calculateXPProgress } from '../utils/xpCalculations';
import { getTodayDateString, calculateTimeBasedStreak } from '../utils/streakCalculations';

export interface UniversalXPData {
  // XP Data
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPEarned: number;
  xpMultiplier: number;
  bonusXPActive: boolean;
  progress: {
    levelXP: number;
    neededXP: number;
    progress: number;
    xpToNext: number;
    percentage: number;
  };
  
  // Streak Data
  currentStreak: number;
  longestStreak: number;
  isStreakActive: boolean;
  streakType: 'daily' | 'coding' | 'task' | 'combined';
  daysInactive: number;
  nextMilestone: number;
  streakBonus: number;
  
  // User Stats
  userLevel: number;
  userRank: string;
  userXP: number;
  userStreak: number;
  
  // Calculated Stats
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  totalXPForCurrentLevel: number;
  hoursToNextLevel: number;
  problemsToNextLevel: number;
  tasksToNextLevel: number;
}

export interface UniversalXPActions {
  // XP Actions
  addXP: (amount: number, source: string, options?: {
    multiplier?: number;
    showNotification?: boolean;
    trackActivity?: boolean;
  }) => void;
  
  // Streak Actions
  updateStreak: (type: 'coding' | 'task' | 'general') => void;
  checkStreakStatus: () => void;
  
  // Utility Actions
  calculateXPForAction: (action: string, difficulty?: string, context?: string) => number;
  calculateStreakBonus: (baseAmount: number) => number;
  getLevelProgress: () => number;
  getTimeToNextLevel: () => string;
  
  // Achievement Actions
  checkLevelUp: () => boolean;
  checkMilestone: (milestone: number) => boolean;
  
  // Conversion Actions
  convertXPToGold: (amount?: number) => boolean;
  spendXP: (amount: number, reason: string) => boolean;
}

export const useUniversalXP = (): UniversalXPData & UniversalXPActions => {
  const { state, dispatch, actions } = useApp();

  // Memoized XP calculations
  const progress = useMemo(() => {
    return calculateXPProgress(state.xpSystem.currentXP, state.xpSystem.currentLevel);
  }, [state.xpSystem.currentXP, state.xpSystem.currentLevel]);

  const streakBonus = useMemo(() => {
    const baseAmount = 100;
    const streak = state.globalStreak.currentStreak;
    
    if (streak >= 365) return baseAmount * 2.0; // 200% bonus
    if (streak >= 100) return baseAmount * 1.5; // 150% bonus
    if (streak >= 50) return baseAmount * 1.25; // 125% bonus
    if (streak >= 30) return baseAmount * 1.15; // 115% bonus
    if (streak >= 14) return baseAmount * 1.1; // 110% bonus
    if (streak >= 7) return baseAmount * 1.05; // 105% bonus
    if (streak >= 3) return baseAmount * 1.02; // 102% bonus
    return baseAmount; // 100% (no bonus)
  }, [state.globalStreak.currentStreak]);

  // Calculate derived stats
  const xpForCurrentLevel = useMemo(() => getXPForLevel(state.xpSystem.currentLevel), [state.xpSystem.currentLevel]);
  const xpForNextLevel = useMemo(() => getXPForLevel(state.xpSystem.currentLevel + 1), [state.xpSystem.currentLevel]);
  const totalXPForCurrentLevel = useMemo(() => xpForCurrentLevel, [xpForCurrentLevel]);
  const hoursToNextLevel = useMemo(() => {
    const xpNeeded = xpForNextLevel - state.xpSystem.currentXP;
    const avgXPHour = 50; // Estimate: 50 XP per hour
    return Math.ceil(xpNeeded / avgXPHour);
  }, [xpForNextLevel, state.xpSystem.currentXP]);
  const problemsToNextLevel = useMemo(() => {
    const xpNeeded = xpForNextLevel - state.xpSystem.currentXP;
    const avgXPPerProblem = 75; // Estimate: 75 XP per problem
    return Math.ceil(xpNeeded / avgXPPerProblem);
  }, [xpForNextLevel, state.xpSystem.currentXP]);
  const tasksToNextLevel = useMemo(() => {
    const xpNeeded = xpForNextLevel - state.xpSystem.currentXP;
    const avgXPerTask = 50; // Estimate: 50 XP per task
    return Math.ceil(xpNeeded / avgXPerTask);
  }, [xpForNextLevel, state.xpSystem.currentXP]);

  // User data
  const userLevel = state.user?.level || state.xpSystem.currentLevel;
  const userRank = useMemo(() => {
    if (userLevel < 5) return 'Beginner';
    if (userLevel < 10) return 'Novice';
    if (userLevel < 20) return 'Apprentice';
    if (userLevel < 30) return 'Journeyman';
    if (userLevel < 50) return 'Expert';
    if (userLevel < 75) return 'Master';
    if (userLevel < 100) return 'Grandmaster';
    return 'Legendary';
  }, [userLevel]);
  const userXP = state.user?.xp || state.xpSystem.currentXP;
  const userStreak = state.user?.streak || state.globalStreak.currentStreak;

  // Calculate days inactive
  const daysInactive = useMemo(() => {
    const today = getTodayDateString();
    const lastActivity = state.globalStreak.lastActivityDate;
    
    if (!lastActivity) return 0;
    
    const lastDate = new Date(lastActivity + 'T00:00:00');
    const today = new Date(today + 'T00:00:00');
    
    return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [state.globalStreak.lastActivityDate]);

  // Calculate next milestone
  const nextMilestone = useMemo(() => {
    const current = state.globalStreak.currentStreak;
    const milestones = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];
    return milestones.find(m => m > current) || 2000;
  }, [state.globalStreak.currentStreak]);

  // Check if streak is active
  const isStreakActive = daysInactive === 0;

  // Add XP with comprehensive options
  const addXP = useCallback((
    amount: number, 
    source: string, 
    options: {
      multiplier?: number,
      showNotification?: boolean,
      trackActivity?: boolean
    } = {}
  ) => {
    const {
      multiplier = state.xpSystem.xpMultiplier,
      showNotification = true,
      trackActivity = true
    } = options;

    // Validate amount
    const validatedAmount = Math.max(0, Math.floor(amount));
    
    if (validatedAmount === 0) return;

    // Apply multipliers
    const finalAmount = Math.floor(validatedAmount * multiplier * (options.multiplier || 1));
    
    // Add XP through context
    dispatch(actions.addXP(finalAmount, source, options.multiplier));
    
    // Track activity if requested
    if (trackActivity) {
      dispatch(actions.updateTimeBasedStreak('general', new Date()));
    }
    
    // Show notification if requested
    if (showNotification) {
      dispatch(actions.addNotification({
        type: 'achievement',
        title: `+${finalAmount} XP Earned! ⚡`,
        message: `From: ${source}`,
        priority: finalAmount >= 100 ? 'high' : finalAmount >= 50 ? 'medium' : 'low',
      }));
    }
    
    // Check for level up
    checkLevelUp();
    
    // Check for milestones
    checkMilestone(nextMilestone);
    
    console.log(`XP added: +${finalAmount} from ${source}`);
  }, [dispatch, actions, state.xpSystem.xpMultiplier, nextMilestone]);

  // Update streak
  const updateStreak = useCallback((type: 'coding' | 'task' | 'general') => {
    dispatch(actions.updateTimeBasedStreak(type, new Date()));
    
    // Award streak bonus XP
    const bonusXP = Math.floor(streakBonus - 100); // Subtract base 100 to get just the bonus
    if (bonusXP > 0) {
      addXP(bonusXP, `streak_bonus_${type}`, {
        showNotification: true,
        trackActivity: false
      });
    }
    
    console.log(`Streak updated: ${type} - Current: ${state.globalStreak.currentStreak} days`);
  }, [dispatch, actions, state.globalStreak.currentStreak, streakBonus, addXP]);

  // Check streak status
  const checkStreakStatus = useCallback(() => {
    const today = getTodayDateString();
    const lastActivity = state.globalStreak.lastActivityDate;
    
    if (!lastActivity || lastActivity !== today) {
      // Check for streak break
      const daysInactive = daysInactive;
      
      if (daysInactive > 1) {
        // Streak broken logic would go here
        console.warn(`Streak at risk: ${daysInactive} days inactive`);
      }
    }
  }, [daysInactive, state.globalStreak.lastActivityDate]);

  // Calculate XP for different actions
  const calculateXPForAction = useCallback((
    action: string, 
    difficulty?: string, 
    context?: string
  ): number => {
    const baseXPMap: Record<string, number> = {
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
      'bug_fix': 40,
      'code_review': 35,
      'documentation': 25,
      'helping_others': 15,
      'perfect_day': 50,
      'weekly_goal': 100,
      'monthly_goal': 500,
    };
    
    const difficultyMultipliers: Record<string, number> = {
      'Easy': 1,
      'Medium': 1.5,
      'Hard': 2,
      'Elite': 3,
      'Legendary': 5,
    };
    
    const baseXP = baseXPMap[action] || 25;
    const difficultyMultiplier = difficultyMultipliers[difficulty || 'Easy'] || 1;
    const contextMultiplier = context ? 1.1 : 1; // 10% bonus for context
    
    return Math.floor(baseXP * difficultyMultiplier * contextMultiplier);
  }, []);

  // Calculate streak bonus
  const calculateStreakBonus = useCallback((baseAmount: number): number => {
    return Math.floor(baseAmount * (streakBonus / 100));
  }, [streakBonus]);

  // Get level progress percentage
  const getLevelProgress = useCallback((): number => {
    return progress.progress;
  }, [progress]);

  // Get time to next level
  const getTimeToNextLevel = useCallback((): string => {
    return `${hoursToNextLevel} hours`;
  }, [hoursToNextLevel]);

  // Check for level up
  const checkLevelUp = useCallback((): boolean => {
    const newLevel = calculateLevelFromXP(state.xpSystem.currentXP);
    const currentLevel = state.xpSystem.currentLevel;
    
    if (newLevel > currentLevel) {
      // Level up logic would go here
      dispatch(actions.showLevelUpAnimation(true));
      
      dispatch(actions.addNotification({
        type: 'level-up',
        title: 'Level Up! 🎉',
        message: `You've reached Level ${newLevel}!`,
        priority: 'high',
      }));
      
      console.log(`LEVEL UP! ${currentLevel} → ${newLevel}`);
      return true;
    }
    
    return false;
  }, [dispatch, actions, state.xpSystem.currentXP, state.xpSystem.currentLevel]);

  // Check for milestone
  const checkMilestone = useCallback((milestone: number): boolean => {
    const current = state.globalStreak.currentStreak;
    
    if (current >= milestone && current < milestone + 1) {
      // Milestone reached logic would go here
      const rewards = getMilestoneRewards(milestone);
      
      rewards.forEach(reward => {
        if (reward.xp > 0) {
          addXP(reward.xp, `milestone_${milestone}`, {
            showNotification: true,
            trackActivity: false
          });
        }
      });
      
      dispatch(actions.showBadgeUnlock(true));
      
      dispatch(actions.addNotification({
        type: 'achievement',
        title: 'Milestone Reached! 🏆',
        message: `${milestone} Day Streak Achieved!`,
        priority: 'high',
      }));
      
      console.log(`MILESTONE: ${milestone} days streak reached!`);
      return true;
    }
    
    return false;
  }, [dispatch, actions, state.globalStreak.currentStreak, addXP]);

  // Convert XP to Gold
  const convertXPToGold = useCallback((amount: number = 100): boolean => {
    const goldAmount = Math.floor(amount / 10); // 1 Gold = 10 XP
    return dispatch(actions.convertXPToGold(goldAmount));
  }, [dispatch, actions]);

  // Spend XP
  const spendXP = useCallback((amount: number, reason: string): boolean => {
    if (state.xpSystem.currentXP >= amount) {
      dispatch(actions.addXP(-amount, reason));
      return true;
    }
    return false;
  }, [dispatch, actions, state.xpSystem.currentXP]);

  // Get milestone rewards
  const getMilestoneRewards = useCallback((milestone: number): Array<{xp: number; badgeReward?: string; titleReward?: string}> => {
    const rewards: Array<{xp: number; badgeReward?: string; titleReward?: string}> = [];
    
    if (milestone === 1) rewards.push({ xp: 50, badgeReward: 'first_step' });
    if (milestone === 3) rewards.push({ xp: 150, badgeReward: 'getting_started' });
    if (milestone === 7) rewards.push({ xp: 350, badgeReward: 'week_warrior' });
    if (milestone === 14) rewards.push({ xp: 700, badgeReward: 'fortnight_fighter' });
    if (milestone === 21) rewards.push({ xp: 1050, badgeReward: 'three_week_champion' });
    if (milestone === 30) rewards.push({ xp: 1500, badgeReward: 'monthly_master' });
    if (milestone === 50) rewards.push({ xp: 2500, badgeReward: 'fifty_day_legend' });
    if (milestone === 75) rewards.push({ xp: 3750, badgeReward: 'seasoned_veteran' });
    if (milestone === 100) rewards.push({ xp: 5000, badgeReward: 'century_club', titleReward: 'Century Master' });
    if (milestone === 150) rewards.push({ xp: 7500, badgeReward: 'elite_streaker' });
    if (milestone === 200) rewards.push({ xp: 10000, badgeReward: 'double_century', titleReward: 'Streak Legend' });
    if (milestone === 365) rewards.push({ xp: 20000, badgeReward: 'year_warrior', titleReward: 'Annual Champion' });
    if (milestone === 500) rewards.push({ xp: 30000, badgeReward: 'five_hundred_hero', titleReward: 'Half Millennium Master' });
    if (milestone === 1000) rewards.push({ xp: 100000, badgeReward: 'thousand_day_titan', titleReward: 'Millennium Legend' });
    
    return rewards;
  }, []);

  return {
    // XP Data
    currentXP: state.xpSystem.currentXP,
    currentLevel: state.xpSystem.currentLevel,
    xpToNextLevel: state.xpSystem.xpToNextLevel,
    totalXPEarned: state.xpSystem.totalXPEarned,
    xpMultiplier: state.xpSystem.xpMultiplier,
    bonusXPActive: state.xpSystem.bonusXPActive,
    progress: {
      ...progress,
      percentage: progress.progress,
    },
    
    // Streak Data
    currentStreak: state.globalStreak.currentStreak,
    longestStreak: state.globalStreak.longestStreak,
    isStreakActive,
    streakType: state.globalStreak.streakType,
    daysInactive,
    nextMilestone,
    streakBonus,
    
    // User Stats
    userLevel,
    userRank,
    userXP,
    userStreak,
    
    // Calculated Stats
    xpForCurrentLevel,
    xpForNextLevel,
    totalXPForCurrentLevel,
    hoursToNextLevel,
    problemsToNextLevel,
    tasksToNextLevel,
    
    // Actions
    addXP,
    updateStreak,
    checkStreakStatus,
    calculateXPForAction,
    calculateStreakBonus,
    getLevelProgress,
    getTimeToNextLevel,
    checkLevelUp,
    checkMilestone,
    convertXPToGold,
    spendXP,
  };
};
