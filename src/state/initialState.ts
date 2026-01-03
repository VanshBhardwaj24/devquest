/**
 * Initial state configuration for the AppContext
 * Production-ready with proper defaults and validation
 */

import type { AppState } from '../types/enhanced';
import { generateBadges, generateChallenges } from '../utils/gameContent';
import { initializeTimeBasedStreak } from '../utils/streakCalculations';
import { initializeDailyReset } from '../utils/dailyReset';
import { initializeActivityTimer } from '../utils/activityTimer';

// Safe localStorage access with error handling
const getLocalStorageItem = (key: string, defaultValue: any): any => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Generate random social stats for demo purposes
const generateSocialStats = () => ({
  followers: Math.floor(Math.random() * 50) + 10,
  following: Math.floor(Math.random() * 100) + 20,
  profileViews: Math.floor(Math.random() * 200) + 50,
  applauds: Math.floor(Math.random() * 30) + 5,
  rank: Math.floor(Math.random() * 1000) + 100,
  totalUsers: 10000,
});

// Generate initial coding stats
const generateInitialCodingStats = () => ({
  totalSolved: 0,
  currentStreak: 0,
  longestStreak: 0,
  todaysSolved: 0,
  weeklyTarget: 10,
  weeklyProgress: 0,
  easyCount: 0,
  mediumCount: 0,
  hardCount: 0,
  platformStats: {
    leetcode: 0,
    geeksforgeeks: 0,
    codechef: 0,
  },
  topicStats: {},
  lastProblemSolvedAt: null,
  timeBasedStreak: initializeTimeBasedStreak(),
});

// Generate initial XP system
const generateInitialXPSystem = () => ({
  currentXP: 0,
  currentLevel: 1,
  xpToNextLevel: 1000,
  totalXPEarned: 0,
  xpMultiplier: 1,
  bonusXPActive: false,
});

// Generate initial vitality
const generateInitialVitality = () => ({
  energy: {
    current: 100,
    max: 100,
    lastUpdated: new Date().toISOString(),
  },
  mood: {
    value: 100,
    label: 'Energized',
  },
});

// Generate initial global streak
const generateInitialGlobalStreak = () => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: '',
  streakStartDate: new Date().toLocaleDateString('en-CA'),
  streakType: 'combined' as const,
});

export const initialState: AppState = {
  user: null,
  tasks: [],
  achievements: [],
  milestones: [],
  careerStats: { 
    totalApplications: 0, 
    interviews: 0, 
    offers: 0, 
    rejections: 0, 
    skillsMastered: 0, 
    projectsCompleted: 0 
  },
  badges: generateBadges(),
  challenges: generateChallenges(),
  shopItems: [],
  vitality: generateInitialVitality(),
  codingStats: generateInitialCodingStats(),
  xpSystem: generateInitialXPSystem(),
  socialStats: generateSocialStats(),
  darkMode: getLocalStorageItem('darkMode', false),
  overduePenaltiesEnabled: getLocalStorageItem('overduePenaltiesEnabled', true),
  isSetupComplete: false,
  loading: true,
  notifications: [],
  showLevelUpAnimation: false,
  showBadgeUnlock: false,
  showConfetti: false,
  recentRewards: [],
  activeTheme: 'default',
  unlockedThemes: ['default'],
  dailyReset: initializeDailyReset(),
  activityTimer: initializeActivityTimer(),
  timeBasedStreak: initializeTimeBasedStreak(),
  globalStreak: generateInitialGlobalStreak(),
  systemLogs: [],
  activePowerUps: [],
  ownedPowerUps: {},
};
