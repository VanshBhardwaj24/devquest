/**
 * Root reducer that combines all specialized reducers
 * Production-ready with error handling and performance optimization
 */

import type { AppState, AppAction } from '../types/enhanced';
import { userReducer } from './userReducer';
import { taskReducer } from './taskReducer';
import { codingReducer } from './codingReducer';
import { xpReducer } from './xpReducer';
import { vitalityReducer } from './vitalityReducer';
import { notificationReducer } from './notificationReducer';
import { powerUpReducer } from './powerUpReducer';

/**
 * Root reducer that delegates to specialized reducers
 * Uses performance optimizations to minimize unnecessary re-renders
 */
export const rootReducer = (state: AppState, action: AppAction): AppState => {
  try {
    // Early return for performance-critical actions that don't need full state processing
    if (action.type === 'SET_LOADING' || action.type === 'TOGGLE_DARK_MODE') {
      return {
        ...state,
        loading: action.type === 'SET_LOADING' ? action.payload : state.loading,
        darkMode: action.type === 'TOGGLE_DARK_MODE' ? action.payload ?? !state.darkMode : state.darkMode,
      };
    }

    // Process state updates through specialized reducers
    const newState = {
      ...state,
      user: userReducer(state.user, action),
      tasks: taskReducer(state.tasks, action),
      codingStats: codingReducer(state.codingStats, action),
      xpSystem: xpReducer(state.xpSystem, action),
      vitality: vitalityReducer(state.vitality, action),
      notifications: notificationReducer(state.notifications, action),
    };

    // Handle power-up state
    const powerUpState = powerUpReducer(
      { activePowerUps: state.activePowerUps, ownedPowerUps: state.ownedPowerUps },
      action
    );
    newState.activePowerUps = powerUpState.activePowerUps;
    newState.ownedPowerUps = powerUpState.ownedPowerUps;

    // Handle simple state updates
    switch (action.type) {
      case 'SET_ACHIEVEMENTS':
        return { ...newState, achievements: action.payload };
      
      case 'UPDATE_MILESTONE':
        return {
          ...newState,
          milestones: newState.milestones.map(milestone =>
            milestone.id === action.payload.id ? action.payload : milestone
          ),
        };
      
      case 'UNLOCK_ACHIEVEMENT':
        return {
          ...newState,
          achievements: newState.achievements.map(achievement =>
            achievement.id === action.payload
              ? { ...achievement, unlocked: true, unlockedAt: new Date() }
              : achievement
          ),
        };
      
      case 'SET_CAREER_STATS':
        return { ...newState, careerStats: action.payload };
      
      case 'SET_CHALLENGES':
        return { ...newState, challenges: action.payload };
      
      case 'UPDATE_CHALLENGE':
        return {
          ...newState,
          challenges: newState.challenges.map(challenge =>
            challenge.id === action.payload.id ? action.payload : challenge
          ),
        };
      
      case 'START_CHALLENGE':
        return {
          ...newState,
          challenges: newState.challenges.map(challenge =>
            challenge.id === action.payload
              ? { ...challenge, status: 'in-progress', startedAt: new Date() }
              : challenge
          ),
        };
      
      case 'COMPLETE_CHALLENGE':
        return {
          ...newState,
          challenges: newState.challenges.map(challenge =>
            challenge.id === action.payload
              ? { ...challenge, status: 'completed', completedAt: new Date(), progress: challenge.maxProgress }
              : challenge
          ),
        };
      
      case 'COMPLETE_SETUP':
        return { ...newState, isSetupComplete: true };
      
      case 'LEVEL_UP':
        return { ...newState, showLevelUpAnimation: true };
      
      case 'UPDATE_STREAK':
        return { ...newState, globalStreak: { ...newState.globalStreak, currentStreak: action.payload } };
      
      case 'SHOW_LEVEL_UP_ANIMATION':
        return { ...newState, showLevelUpAnimation: action.payload };
      
      case 'SHOW_BADGE_UNLOCK':
        return { ...newState, showBadgeUnlock: action.payload };
      
      case 'SHOW_CONFETTI':
        return { ...newState, showConfetti: action.payload };
      
      case 'ADD_REWARD':
        return {
          ...newState,
          recentRewards: [action.payload, ...newState.recentRewards.slice(0, 4)],
        };
      
      case 'UPDATE_SOCIAL_STATS':
        return {
          ...newState,
          socialStats: { ...newState.socialStats, ...action.payload },
        };
      
      case 'CHANGE_THEME':
        return { ...newState, activeTheme: action.payload };
      
      case 'UNLOCK_THEME':
        return {
          ...newState,
          unlockedThemes: [...newState.unlockedThemes, action.payload],
        };
      
      case 'UPDATE_COUNTDOWN':
        return {
          ...newState,
          dailyReset: { ...newState.dailyReset, resetCountdown: action.payload },
        };
      
      case 'ADD_SYSTEM_LOG':
        return {
          ...newState,
          systemLogs: [action.payload, ...newState.systemLogs].slice(0, 50),
        };
      
      case 'SET_OVERDUE_PENALTIES':
        return { ...newState, overduePenaltiesEnabled: action.payload };
      
      case 'BUY_SHOP_ITEM':
        return {
          ...newState,
          shopItems: newState.shopItems.map(item =>
            item.id === action.payload.itemId
              ? { ...item, purchased: true, timesRedeemed: (item.timesRedeemed || 0) + 1, lastRedeemed: new Date() }
              : item
          ),
        };
      
      default:
        return newState;
    }
  } catch (error) {
    console.error('Error in rootReducer:', error);
    return state; // Return original state on error
  }
};
