/**
 * Action creators for the AppContext
 * Production-ready with type safety and validation
 */

import type { AppAction, Notification } from '../types/enhanced';
import { validateXP } from '../utils/xpCalculations';

// User actions
export const setUser = (user: any): AppAction => ({
  type: 'SET_USER',
  payload: user,
});

// Task actions
export const setTasks = (tasks: any[]): AppAction => ({
  type: 'SET_TASKS',
  payload: tasks,
});

export const addTask = (task: any): AppAction => ({
  type: 'ADD_TASK',
  payload: task,
});

export const updateTask = (task: any): AppAction => ({
  type: 'UPDATE_TASK',
  payload: task,
});

export const deleteTask = (taskId: string): AppAction => ({
  type: 'DELETE_TASK',
  payload: taskId,
});

// Achievement actions
export const setAchievements = (achievements: any[]): AppAction => ({
  type: 'SET_ACHIEVEMENTS',
  payload: achievements,
});

export const updateMilestone = (milestone: any): AppAction => ({
  type: 'UPDATE_MILESTONE',
  payload: milestone,
});

export const unlockAchievement = (achievementId: string): AppAction => ({
  type: 'UNLOCK_ACHIEVEMENT',
  payload: achievementId,
});

// Stats actions
export const updateStats = (stats: Partial<any>): AppAction => ({
  type: 'UPDATE_STATS',
  payload: stats,
});

export const setCareerStats = (stats: any): AppAction => ({
  type: 'SET_CAREER_STATS',
  payload: stats,
});

export const updateCodingStats = (stats: Partial<any>): AppAction => ({
  type: 'UPDATE_CODING_STATS',
  payload: stats,
});

// Challenge actions
export const setChallenges = (challenges: any[]): AppAction => ({
  type: 'SET_CHALLENGES',
  payload: challenges,
});

export const updateChallenge = (challenge: any): AppAction => ({
  type: 'UPDATE_CHALLENGE',
  payload: challenge,
});

export const startChallenge = (challengeId: string): AppAction => ({
  type: 'START_CHALLENGE',
  payload: challengeId,
});

export const completeChallenge = (challengeId: string): AppAction => ({
  type: 'COMPLETE_CHALLENGE',
  payload: challengeId,
});

// UI actions
export const toggleDarkMode = (enabled?: boolean): AppAction => ({
  type: 'TOGGLE_DARK_MODE',
  payload: enabled,
});

export const completeSetup = (): AppAction => ({
  type: 'COMPLETE_SETUP',
});

export const setLoading = (loading: boolean): AppAction => ({
  type: 'SET_LOADING',
  payload: loading,
});

// XP actions with validation
export const addXP = (amount: number, source: string, multiplier?: number): AppAction => {
  const validatedAmount = validateXP(amount);
  return {
    type: 'ADD_XP',
    payload: { amount: validatedAmount, source, multiplier },
  };
};

export const initializeXPSystem = (xp: number, level: number): AppAction => ({
  type: 'INITIALIZE_XP_SYSTEM',
  payload: { xp: validateXP(xp), level },
});

export const levelUp = (newLevel: number, xpGained: number): AppAction => ({
  type: 'LEVEL_UP',
  payload: { newLevel, xpGained: validateXP(xpGained) },
});

export const updateStreak = (streak: number): AppAction => ({
  type: 'UPDATE_STREAK',
  payload: Math.max(0, streak),
});

export const solveProblem = (xp: number, difficulty: string, platform: string, topic: string): AppAction => ({
  type: 'SOLVE_PROBLEM',
  payload: { xp: validateXP(xp), difficulty, platform, topic },
});

// Notification actions
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): AppAction => ({
  type: 'ADD_NOTIFICATION',
  payload: {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
  },
});

export const removeNotification = (notificationId: string): AppAction => ({
  type: 'REMOVE_NOTIFICATION',
  payload: notificationId,
});

export const markNotificationRead = (notificationId: string): AppAction => ({
  type: 'MARK_NOTIFICATION_READ',
  payload: notificationId,
});

// Animation actions
export const showLevelUpAnimation = (show: boolean): AppAction => ({
  type: 'SHOW_LEVEL_UP_ANIMATION',
  payload: show,
});

export const showBadgeUnlock = (show: boolean): AppAction => ({
  type: 'SHOW_BADGE_UNLOCK',
  payload: show,
});

export const showConfetti = (show: boolean): AppAction => ({
  type: 'SHOW_CONFETTI',
  payload: show,
});

export const addReward = (reward: string): AppAction => ({
  type: 'ADD_REWARD',
  payload: reward,
});

// Social actions
export const updateSocialStats = (stats: Partial<any>): AppAction => ({
  type: 'UPDATE_SOCIAL_STATS',
  payload: stats,
});

export const activateBonusXP = (multiplier: number, duration: number): AppAction => ({
  type: 'ACTIVATE_BONUS_XP',
  payload: { multiplier: Math.max(1, multiplier), duration: Math.max(0, duration) },
});

// Theme actions
export const changeTheme = (theme: string): AppAction => ({
  type: 'CHANGE_THEME',
  payload: theme,
});

export const unlockTheme = (theme: string): AppAction => ({
  type: 'UNLOCK_THEME',
  payload: theme,
});

// Time-based actions
export const updateTimeBasedStreak = (activityType: 'coding' | 'task' | 'general', timestamp: Date): AppAction => ({
  type: 'UPDATE_TIME_BASED_STREAK',
  payload: { activityType, timestamp },
});

export const checkDailyReset = (): AppAction => ({
  type: 'CHECK_DAILY_RESET',
});

export const performDailyReset = (): AppAction => ({
  type: 'PERFORM_DAILY_RESET',
});

export const updateActivityTimer = (isActive: boolean, timestamp: Date): AppAction => ({
  type: 'UPDATE_ACTIVITY_TIMER',
  payload: { isActive, timestamp },
});

export const updateCountdown = (countdown: number): AppAction => ({
  type: 'UPDATE_COUNTDOWN',
  payload: Math.max(0, countdown),
});

export const recordDailyActivity = (date: string, activity: Partial<any>): AppAction => ({
  type: 'RECORD_DAILY_ACTIVITY',
  payload: { date, activity },
});

// System actions
export const addSystemLog = (log: any): AppAction => ({
  type: 'ADD_SYSTEM_LOG',
  payload: {
    ...log,
    id: Date.now().toString(),
    timestamp: new Date(),
  },
});

// Economic actions
export const spendGold = (amount: number, item: string): AppAction => ({
  type: 'SPEND_GOLD',
  payload: { amount: Math.max(0, amount), item },
});

export const convertXPToGold = (amount: number): AppAction => ({
  type: 'CONVERT_XP_TO_GOLD',
  payload: { amount: Math.max(0, amount) },
});

export const buyPowerUp = (powerUpId: string, cost: number): AppAction => ({
  type: 'BUY_POWERUP',
  payload: { powerUpId, cost: Math.max(0, cost) },
});

export const activatePowerUp = (powerUpId: string, duration: number): AppAction => ({
  type: 'ACTIVATE_POWERUP',
  payload: { powerUpId, duration: Math.max(0, duration) },
});

export const expirePowerUp = (powerUpId: string): AppAction => ({
  type: 'EXPIRE_POWERUP',
  payload: powerUpId,
});

// Vitality actions
export const updateEnergy = (amount: number): AppAction => ({
  type: 'UPDATE_ENERGY',
  payload: { amount },
});

export const restoreEnergy = (amount: number): AppAction => ({
  type: 'RESTORE_ENERGY',
  payload: Math.max(0, amount),
});

// Project actions
export const addProject = (project: any): AppAction => ({
  type: 'ADD_PROJECT',
  payload: project,
});

export const updateProject = (project: any): AppAction => ({
  type: 'UPDATE_PROJECT',
  payload: project,
});

// Shop actions
export const buyShopItem = (itemId: string, cost: number): AppAction => ({
  type: 'BUY_SHOP_ITEM',
  payload: { itemId, cost: Math.max(0, cost) },
});

// Settings actions
export const setOverduePenalties = (enabled: boolean): AppAction => ({
  type: 'SET_OVERDUE_PENALTIES',
  payload: enabled,
});

// Skill actions
export const addSkillXP = (skillId: string, amount: number, source: string): AppAction => ({
  type: 'ADD_SKILL_XP',
  payload: { skillId, amount: validateXP(amount), source },
});

// Mindfulness actions
export const completeMindfulnessSession = (durationMinutes: number, timestamp: Date, moodScore?: number): AppAction => ({
  type: 'COMPLETE_MINDFULNESS_SESSION',
  payload: { 
    durationMinutes: Math.max(0, durationMinutes), 
    timestamp, 
    moodScore: moodScore !== undefined ? Math.max(1, Math.min(10, moodScore)) : undefined 
  },
});
