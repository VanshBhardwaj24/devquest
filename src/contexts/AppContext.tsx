import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Task, Achievement, Milestone, CareerStats } from '../types';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { taskService } from '../services/taskService';
import { achievementService } from '../services/achievementService';
import { codingService } from '../services/codingService';

interface Notification {
  id: string;
  type: 'achievement' | 'level-up' | 'task-completed' | 'streak' | 'challenge' | 'badge' | 'reward' | 'social' | 'mission';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  category: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  xpReward: number;
  timeLimit: string;
  progress: number;
  maxProgress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  category: string;
  requirements: string[];
  rewards: string[];
  startedAt?: Date;
  completedAt?: Date;
  milestones: ChallengeMilestone[];
}

interface ChallengeMilestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  xpReward: number;
}

interface TimeBasedStreak {
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

interface DailyReset {
  lastResetDate: string; // ISO date string
  nextResetTime: Date;
  resetCountdown: number; // seconds until next reset
  hasResetToday: boolean;
}

interface ActivityTimer {
  sessionStartTime: Date | null;
  totalActiveTime: number; // milliseconds
  currentSessionTime: number; // milliseconds
  isActive: boolean;
  lastActivityTimestamp: Date | null;
}

interface AppState {
  user: User | null;
  tasks: Task[];
  achievements: Achievement[];
  milestones: Milestone[];
  careerStats: CareerStats;
  badges: Badge[];
  challenges: Challenge[];
  codingStats: {
    totalSolved: number;
    currentStreak: number;
    longestStreak: number;
    todaysSolved: number;
    weeklyTarget: number;
    weeklyProgress: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    platformStats: {
      leetcode: number;
      geeksforgeeks: number;
      codechef: number;
    };
    topicStats: {
      [key: string]: number;
    };
    lastProblemSolvedAt: Date | null;
    timeBasedStreak: TimeBasedStreak;
  };
  xpSystem: {
    currentXP: number;
    currentLevel: number;
    xpToNextLevel: number;
    totalXPEarned: number;
    xpMultiplier: number;
    bonusXPActive: boolean;
    bonusXPExpiry?: Date;
  };
  socialStats: {
    followers: number;
    following: number;
    profileViews: number;
    applauds: number;
    rank: number;
    totalUsers: number;
  };
  darkMode: boolean;
  isSetupComplete: boolean;
  loading: boolean;
  notifications: Notification[];
  showLevelUpAnimation: boolean;
  showBadgeUnlock: boolean;
  showConfetti: boolean;
  recentRewards: string[];
  activeTheme: string;
  unlockedThemes: string[];
  dailyReset: DailyReset;
  activityTimer: ActivityTimer;
  timeBasedStreak: TimeBasedStreak;
  globalStreak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    streakStartDate: string;
    streakType: 'daily' | 'coding' | 'task' | 'combined';
  };
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_STATS'; payload: Partial<CareerStats> }
  | { type: 'SET_CAREER_STATS'; payload: CareerStats }
  | { type: 'UPDATE_CODING_STATS'; payload: any }
  | { type: 'SET_CHALLENGES'; payload: Challenge[] }
  | { type: 'UPDATE_CHALLENGE'; payload: Challenge }
  | { type: 'START_CHALLENGE'; payload: string }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'COMPLETE_SETUP' }
  | { type: 'ADD_XP'; payload: { amount: number; source: string; multiplier?: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'LEVEL_UP'; payload: { newLevel: number; xpGained: number } }
  | { type: 'UPDATE_STREAK'; payload: number }
  | { type: 'SOLVE_PROBLEM'; payload: { xp: number; difficulty: string; platform: string; topic: string } }
  | { type: 'SHOW_LEVEL_UP_ANIMATION'; payload: boolean }
  | { type: 'SHOW_BADGE_UNLOCK'; payload: boolean }
  | { type: 'SHOW_CONFETTI'; payload: boolean }
  | { type: 'ADD_REWARD'; payload: string }
  | { type: 'UPDATE_SOCIAL_STATS'; payload: Partial<AppState['socialStats']> }
  | { type: 'ACTIVATE_BONUS_XP'; payload: { multiplier: number; duration: number } }
  | { type: 'CHANGE_THEME'; payload: string }
  | { type: 'UNLOCK_THEME'; payload: string }
  | { type: 'UPDATE_TIME_BASED_STREAK'; payload: { activityType: 'coding' | 'task' | 'general'; timestamp: Date } }
  | { type: 'CHECK_DAILY_RESET' }
  | { type: 'PERFORM_DAILY_RESET' }
  | { type: 'UPDATE_ACTIVITY_TIMER'; payload: { isActive: boolean; timestamp: Date } }
  | { type: 'UPDATE_COUNTDOWN'; payload: number }
  | { type: 'RECORD_DAILY_ACTIVITY'; payload: { date: string; activity: Partial<TimeBasedStreak['dailyActivity'][string]> } }
  | { type: 'INITIALIZE_XP_SYSTEM'; payload: { xp: number; level: number } };

// Dynamic XP calculation functions - Unified formula across app
const getXPForLevel = (level: number): number => {
  return Math.floor(1000 * Math.pow(1.1, level - 1));
};

const calculateLevelFromXP = (totalXP: number): number => {
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

const calculateXPToNextLevel = (currentXP: number, currentLevel: number): number => {
  return getXPForLevel(currentLevel + 1);
};

// Time-based streak calculation functions
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const calculateTimeBasedStreak = (
  currentStreak: number,
  lastActivityDate: string,
  todayDate: string = getTodayDateString()
): { newStreak: number; streakBroken: boolean; streakContinued: boolean } => {
  if (!lastActivityDate) {
    return { newStreak: 1, streakBroken: false, streakContinued: false };
  }

  const lastDate = new Date(lastActivityDate);
  const today = new Date(todayDate);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Normalize to just dates (remove time)
  const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  const daysDiff = Math.floor((todayOnly.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Activity today - streak continues
    return { newStreak: currentStreak, streakBroken: false, streakContinued: true };
  } else if (daysDiff === 1) {
    // Activity yesterday - increment streak
    return { newStreak: currentStreak + 1, streakBroken: false, streakContinued: true };
  } else {
    // More than 1 day gap - streak broken
    return { newStreak: 1, streakBroken: true, streakContinued: false };
  }
};

const getNextResetTime = (): Date => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const calculateCountdown = (nextReset: Date): number => {
  const now = new Date();
  const diff = nextReset.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / 1000));
};

const initializeTimeBasedStreak = (): TimeBasedStreak => {
  const today = getTodayDateString();
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: today,
    streakStartDate: today,
    dailyActivity: {},
  };
};

const initializeDailyReset = (): DailyReset => {
  const today = getTodayDateString();
  let lastReset = today;
  
  if (typeof window !== 'undefined') {
    try {
      lastReset = localStorage.getItem('lastDailyReset') || today;
    } catch (error: any) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error reading from localStorage:', error?.message || JSON.stringify(error));
    }
  }
  
  const nextReset = getNextResetTime();
  
  return {
    lastResetDate: lastReset,
    nextResetTime: nextReset,
    resetCountdown: calculateCountdown(nextReset),
    hasResetToday: lastReset === today,
  };
};

const initializeActivityTimer = (): ActivityTimer => {
  return {
    sessionStartTime: null,
    totalActiveTime: 0,
    currentSessionTime: 0,
    isActive: false,
    lastActivityTimestamp: null,
  };
};

// Generate badges
const generateBadges = (): Badge[] => {
  const badges: Badge[] = [];
  
  // XP Milestone badges
  [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].forEach((xp, index) => {
    badges.push({
      id: `xp-${xp}`,
      name: `${xp} XP Master`,
      description: `Earned ${xp.toLocaleString()} total XP`,
      icon: '⚡',
      xpRequired: xp,
      unlocked: false,
      rarity: index < 2 ? 'bronze' : index < 4 ? 'silver' : index < 6 ? 'gold' : 'platinum',
      category: 'XP Milestones'
    });
  });

  // Coding badges
  [10, 25, 50, 100, 250, 500, 1000].forEach((count, index) => {
    badges.push({
      id: `coding-${count}`,
      name: `${count} Problems Solved`,
      description: `Solved ${count} coding problems`,
      icon: '💻',
      xpRequired: count * 50,
      unlocked: false,
      rarity: index < 2 ? 'bronze' : index < 4 ? 'silver' : index < 6 ? 'gold' : 'platinum',
      category: 'Coding'
    });
  });

  return badges;
};

// Generate challenges
const generateChallenges = (): Challenge[] => {
  return [
    {
      id: 'dsa-sprint',
      title: 'DSA Sprint Challenge',
      description: 'Master data structures and algorithms by solving problems across different difficulty levels',
      difficulty: 'Medium',
      xpReward: 500,
      timeLimit: '7 days',
      progress: 0,
      maxProgress: 25,
      status: 'not-started',
      category: 'Programming',
      requirements: ['Basic programming knowledge', 'Problem-solving skills'],
      rewards: ['DSA Master badge', '500 XP', 'Algorithm expertise'],
      milestones: [
        { id: 'dsa-1', title: 'Array Basics', description: 'Solve 5 array problems', progress: 0, target: 5, completed: false, xpReward: 100 },
        { id: 'dsa-2', title: 'String Manipulation', description: 'Solve 5 string problems', progress: 0, target: 5, completed: false, xpReward: 100 },
        { id: 'dsa-3', title: 'Tree Traversal', description: 'Solve 5 tree problems', progress: 0, target: 5, completed: false, xpReward: 150 },
        { id: 'dsa-4', title: 'Dynamic Programming', description: 'Solve 5 DP problems', progress: 0, target: 5, completed: false, xpReward: 200 },
        { id: 'dsa-5', title: 'Graph Algorithms', description: 'Solve 5 graph problems', progress: 0, target: 5, completed: false, xpReward: 250 },
      ],
    },
    {
      id: 'portfolio-boost',
      title: 'Portfolio Powerhouse',
      description: 'Build an impressive portfolio with multiple projects showcasing different technologies',
      difficulty: 'Hard',
      xpReward: 750,
      timeLimit: '14 days',
      progress: 0,
      maxProgress: 5,
      status: 'not-started',
      category: 'Portfolio',
      requirements: ['Web development skills', 'Design sense', 'Project planning'],
      rewards: ['Portfolio Master badge', '750 XP', 'Professional portfolio'],
      milestones: [
        { id: 'port-1', title: 'Frontend Project', description: 'Build a React/Vue application', progress: 0, target: 1, completed: false, xpReward: 150 },
        { id: 'port-2', title: 'Backend API', description: 'Create a REST API', progress: 0, target: 1, completed: false, xpReward: 150 },
        { id: 'port-3', title: 'Full-Stack App', description: 'Complete full-stack application', progress: 0, target: 1, completed: false, xpReward: 200 },
        { id: 'port-4', title: 'Mobile App', description: 'Build a mobile application', progress: 0, target: 1, completed: false, xpReward: 175 },
        { id: 'port-5', title: 'Documentation', description: 'Write comprehensive documentation', progress: 0, target: 1, completed: false, xpReward: 75 },
      ],
    },
  ];
};

const initialState: AppState = {
  user: null,
  tasks: [],
  achievements: [],
  milestones: [],
  careerStats: { knowledge: 0, mindset: 0, communication: 0, portfolio: 0 },
  badges: generateBadges(),
  challenges: generateChallenges(),
  codingStats: {
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
  },
  dailyReset: initializeDailyReset(),
  activityTimer: initializeActivityTimer(),
  timeBasedStreak: initializeTimeBasedStreak(),
  globalStreak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: getTodayDateString(),
    streakStartDate: getTodayDateString(),
    streakType: 'combined',
  },
  xpSystem: {
    currentXP: 0,
    currentLevel: 1,
    xpToNextLevel: 1000,
    totalXPEarned: 0,
    xpMultiplier: 1,
    bonusXPActive: false,
  },
  socialStats: {
    followers: Math.floor(Math.random() * 50) + 10,
    following: Math.floor(Math.random() * 100) + 20,
    profileViews: Math.floor(Math.random() * 200) + 50,
    applauds: Math.floor(Math.random() * 30) + 5,
    rank: Math.floor(Math.random() * 1000) + 100,
    totalUsers: 10000,
  },
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false,
  isSetupComplete: false,
  loading: true,
  notifications: [],
  showLevelUpAnimation: false,
  showBadgeUnlock: false,
  showConfetti: false,
  recentRewards: [],
  activeTheme: 'default',
  unlockedThemes: ['default'],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => {} });

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isSetupComplete: true };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    
    case 'UPDATE_TASK': {
      const updatedTask = action.payload;
      const wasCompleted = state.tasks.find(t => t.id === updatedTask.id)?.completed || false;
      const isNowCompleted = updatedTask.completed;
      
      // If task was just completed, update time-based streak
      if (!wasCompleted && isNowCompleted) {
        const taskCompleteTime = new Date();
        const todayStr = getTodayDateString();
        
        // Update daily activity for tasks
        const existingTaskActivity = state.timeBasedStreak.dailyActivity[todayStr] || {
          problemsSolved: 0,
          tasksCompleted: 0,
          xpEarned: 0,
          activeMinutes: 0,
          lastActivityTime: taskCompleteTime.toISOString(),
        };
        
        const updatedTaskDailyActivity = {
          ...state.timeBasedStreak.dailyActivity,
          [todayStr]: {
            problemsSolved: existingTaskActivity.problemsSolved,
            tasksCompleted: existingTaskActivity.tasksCompleted + 1,
            xpEarned: existingTaskActivity.xpEarned,
            activeMinutes: existingTaskActivity.activeMinutes + 1,
            lastActivityTime: taskCompleteTime.toISOString(),
          },
        };
        
        // Calculate streak for task completion
        const taskStreakResult = calculateTimeBasedStreak(
          state.timeBasedStreak.currentStreak,
          state.timeBasedStreak.lastActivityDate,
          todayStr
        );
        
        const newTaskStreak = taskStreakResult.newStreak;
        const newLongestTaskStreak = Math.max(state.timeBasedStreak.longestStreak, newTaskStreak);
        
        // Update global streak
        const globalTaskStreakResult = calculateTimeBasedStreak(
          state.globalStreak.currentStreak,
          state.globalStreak.lastActivityDate,
          todayStr
        );
        
        return {
          ...state,
          tasks: state.tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          ),
          timeBasedStreak: {
            ...state.timeBasedStreak,
            currentStreak: newTaskStreak,
            longestStreak: newLongestTaskStreak,
            lastActivityDate: todayStr,
            streakStartDate: taskStreakResult.streakBroken ? todayStr : state.timeBasedStreak.streakStartDate,
            dailyActivity: updatedTaskDailyActivity,
          },
          globalStreak: {
            ...state.globalStreak,
            currentStreak: globalTaskStreakResult.newStreak,
            longestStreak: Math.max(state.globalStreak.longestStreak, globalTaskStreakResult.newStreak),
            lastActivityDate: todayStr,
            streakStartDate: globalTaskStreakResult.streakBroken ? todayStr : state.globalStreak.streakStartDate,
          },
        };
      }
      
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      };
    }
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map(milestone =>
          milestone.id === action.payload.id ? action.payload : milestone
        ),
      };
    
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload
            ? { ...achievement, unlocked: true, unlockedAt: new Date() }
            : achievement
        ),
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        careerStats: { ...state.careerStats, ...action.payload },
      };
    
    case 'SET_CAREER_STATS':
      return { ...state, careerStats: action.payload };
    
    case 'UPDATE_CODING_STATS':
      return {
        ...state,
        codingStats: { ...state.codingStats, ...action.payload },
      };
    
    case 'SET_CHALLENGES':
      return { ...state, challenges: action.payload };
    
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload.id ? action.payload : challenge
        ),
      };
    
    case 'START_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload
            ? { ...challenge, status: 'in-progress', startedAt: new Date() }
            : challenge
        ),
      };
    
    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload
            ? { ...challenge, status: 'completed', completedAt: new Date(), progress: challenge.maxProgress }
            : challenge
        ),
      };
    
    case 'TOGGLE_DARK_MODE':
      const newDarkMode = action.payload !== undefined ? action.payload : !state.darkMode;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('darkMode', newDarkMode.toString());
        } catch (error: any) {
          // Log error safely (stringify to avoid React conversion issues)
          console.error('Error saving to localStorage:', error?.message || JSON.stringify(error));
        }
      }
      return { ...state, darkMode: newDarkMode };

    case 'INITIALIZE_XP_SYSTEM':
      const { xp, level } = action.payload;
      const xpToNext = getXPForLevel(level + 1);
      return {
        ...state,
        xpSystem: {
          ...state.xpSystem,
          currentXP: xp,
          currentLevel: level,
          xpToNextLevel: xpToNext,
          totalXPEarned: xp, // Initialize total earned with current XP
        },
        user: state.user ? {
          ...state.user,
          xp: xp,
          level: level,
        } : null,
      };
    
    case 'COMPLETE_SETUP':
      return { ...state, isSetupComplete: true };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_XP':
      const { amount, source, multiplier = 1 } = action.payload;
      // Only apply multiplier for earning, not spending
      const isSpending = amount < 0;
      const finalAmount = isSpending 
        ? amount // No multiplier for spending
        : Math.floor(amount * multiplier * state.xpSystem.xpMultiplier);
      const newTotalXP = Math.max(0, state.xpSystem.currentXP + finalAmount); // Prevent negative XP
      const newLevel = calculateLevelFromXP(newTotalXP);
      const leveledUp = newLevel > state.xpSystem.currentLevel;
      const newXPToNext = getXPForLevel(newLevel + 1);
      
      // Update user XP as well
      const updatedUser = state.user ? { 
        ...state.user, 
        xp: newTotalXP,
        level: newLevel,
        totalXpSpent: isSpending ? (state.user.totalXpSpent || 0) + Math.abs(finalAmount) : (state.user.totalXpSpent || 0),
      } : null;
      
      return {
        ...state,
        user: updatedUser,
        xpSystem: {
          ...state.xpSystem,
          currentXP: newTotalXP,
          currentLevel: newLevel,
          xpToNextLevel: newXPToNext,
          totalXPEarned: isSpending ? state.xpSystem.totalXPEarned : state.xpSystem.totalXPEarned + finalAmount,
        },
        notifications: [
          {
            id: Date.now().toString(),
            type: isSpending ? 'reward' : 'achievement',
            title: isSpending ? `${Math.abs(finalAmount)} XP Spent 🎁` : `+${finalAmount} XP Earned! ⚡`,
            message: `${isSpending ? 'On' : 'From'}: ${source}`,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
          },
          ...state.notifications.slice(0, 9)
        ],
        showLevelUpAnimation: leveledUp,
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 9)],
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'SOLVE_PROBLEM': {
      const { xp, difficulty, platform, topic } = action.payload;
      const solveTimestamp = new Date();
      const difficultyMultiplier = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1;
      
      // Update time-based streak for coding activity
      const todayStr = getTodayDateString();
      const streakResult = calculateTimeBasedStreak(
        state.codingStats.timeBasedStreak.currentStreak,
        state.codingStats.timeBasedStreak.lastActivityDate,
        todayStr
      );
      
      const newCodingStreak = streakResult.newStreak;
      const newLongestCodingStreak = Math.max(state.codingStats.longestStreak, newCodingStreak);
      
      // Update daily activity
      const existingCodingActivity = state.codingStats.timeBasedStreak.dailyActivity[todayStr] || {
        problemsSolved: 0,
        tasksCompleted: 0,
        xpEarned: 0,
        activeMinutes: 0,
        lastActivityTime: solveTimestamp.toISOString(),
      };
      
      const updatedCodingDailyActivity = {
        ...state.codingStats.timeBasedStreak.dailyActivity,
        [todayStr]: {
          problemsSolved: existingCodingActivity.problemsSolved + 1,
          tasksCompleted: existingCodingActivity.tasksCompleted,
          xpEarned: existingCodingActivity.xpEarned + xp,
          activeMinutes: existingCodingActivity.activeMinutes + 1,
          lastActivityTime: solveTimestamp.toISOString(),
        },
      };
      
      const newCodingStats = {
        ...state.codingStats,
        totalSolved: state.codingStats.totalSolved + 1,
        todaysSolved: state.codingStats.todaysSolved + 1,
        weeklyProgress: state.codingStats.weeklyProgress + 1,
        currentStreak: newCodingStreak,
        longestStreak: newLongestCodingStreak,
        lastProblemSolvedAt: solveTimestamp,
        [`${difficulty.toLowerCase()}Count`]: (state.codingStats[`${difficulty.toLowerCase()}Count` as keyof typeof state.codingStats] as number) + 1,
        platformStats: {
          ...state.codingStats.platformStats,
          [platform.toLowerCase()]: (state.codingStats.platformStats[platform.toLowerCase() as keyof typeof state.codingStats.platformStats] as number || 0) + 1,
        },
        topicStats: {
          ...state.codingStats.topicStats,
          [topic]: (state.codingStats.topicStats[topic] || 0) + 1,
        },
        timeBasedStreak: {
          ...state.codingStats.timeBasedStreak,
          currentStreak: newCodingStreak,
          longestStreak: newLongestCodingStreak,
          lastActivityDate: todayStr,
          streakStartDate: streakResult.streakBroken ? todayStr : state.codingStats.timeBasedStreak.streakStartDate,
          dailyActivity: updatedCodingDailyActivity,
        },
      };
      
      // Update global streak
      const globalStreakResult = calculateTimeBasedStreak(
        state.globalStreak.currentStreak,
        state.globalStreak.lastActivityDate,
        todayStr
      );
      
      const updatedGlobalStreak = {
        ...state.globalStreak,
        currentStreak: globalStreakResult.newStreak,
        longestStreak: Math.max(state.globalStreak.longestStreak, globalStreakResult.newStreak),
        lastActivityDate: todayStr,
        streakStartDate: globalStreakResult.streakBroken ? todayStr : state.globalStreak.streakStartDate,
      };
      
      const statBoost = difficultyMultiplier * 2;
      const newCareerStats = {
        ...state.careerStats,
        knowledge: Math.min(100, state.careerStats.knowledge + statBoost),
      };

      // Notify about streak milestones
      const notifications = [];
      if (newCodingStreak > state.codingStats.currentStreak && newCodingStreak % 7 === 0) {
        notifications.push({
          id: Date.now().toString(),
          type: 'streak' as const,
          title: `${newCodingStreak}-Day Coding Streak! 🔥`,
          message: `Amazing! You've coded for ${newCodingStreak} consecutive days!`,
          timestamp: new Date(),
          read: false,
          priority: 'high' as const,
        });
      }

      return {
        ...state,
        codingStats: newCodingStats,
        careerStats: newCareerStats,
        globalStreak: updatedGlobalStreak,
        notifications: notifications.length > 0 ? [...notifications, ...state.notifications.slice(0, 9 - notifications.length)] : state.notifications,
      };
    }
    
    case 'SHOW_LEVEL_UP_ANIMATION':
      return { ...state, showLevelUpAnimation: action.payload };
    
    case 'SHOW_BADGE_UNLOCK':
      return { ...state, showBadgeUnlock: action.payload };
    
    case 'SHOW_CONFETTI':
      return { ...state, showConfetti: action.payload };
    
    case 'ADD_REWARD':
      return {
        ...state,
        recentRewards: [action.payload, ...state.recentRewards.slice(0, 4)],
      };
    
    case 'UPDATE_SOCIAL_STATS':
      return {
        ...state,
        socialStats: { ...state.socialStats, ...action.payload },
      };
    
    case 'ACTIVATE_BONUS_XP':
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + action.payload.duration);
      return {
        ...state,
        xpSystem: {
          ...state.xpSystem,
          xpMultiplier: action.payload.multiplier,
          bonusXPActive: true,
          bonusXPExpiry: expiryTime,
        },
      };
    
    case 'CHANGE_THEME':
      return { ...state, activeTheme: action.payload };
    
    case 'UNLOCK_THEME':
      return {
        ...state,
        unlockedThemes: [...state.unlockedThemes, action.payload],
      };
    
    case 'UPDATE_TIME_BASED_STREAK': {
      const { activityType, timestamp } = action.payload;
      const todayStr = getTodayDateString();
      const currentTimeStr = timestamp.toISOString();
      
      // Update daily activity
      const existingActivity = state.timeBasedStreak.dailyActivity[todayStr] || {
        problemsSolved: 0,
        tasksCompleted: 0,
        xpEarned: 0,
        activeMinutes: 0,
        lastActivityTime: currentTimeStr,
      };
      
      const updatedDailyActivity = {
        ...state.timeBasedStreak.dailyActivity,
        [todayStr]: {
          problemsSolved: existingActivity.problemsSolved + (activityType === 'coding' ? 1 : 0),
          tasksCompleted: existingActivity.tasksCompleted + (activityType === 'task' ? 1 : 0),
          xpEarned: existingActivity.xpEarned,
          activeMinutes: existingActivity.activeMinutes + 1,
          lastActivityTime: currentTimeStr,
        },
      };
      
      // Calculate streak
      const streakResult = calculateTimeBasedStreak(
        state.timeBasedStreak.currentStreak,
        state.timeBasedStreak.lastActivityDate,
        todayStr
      );
      
      const newStreak = streakResult.newStreak;
      const newLongestStreak = Math.max(state.timeBasedStreak.longestStreak, newStreak);
      const streakStartDate = streakResult.streakBroken ? todayStr : state.timeBasedStreak.streakStartDate;
      
      // Update global streak
      const globalStreakResult = calculateTimeBasedStreak(
        state.globalStreak.currentStreak,
        state.globalStreak.lastActivityDate,
        todayStr
      );
      
      const updatedTimeBasedStreak: TimeBasedStreak = {
        ...state.timeBasedStreak,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: todayStr,
        streakStartDate,
        dailyActivity: updatedDailyActivity,
      };
      
      const updatedGlobalStreak = {
        ...state.globalStreak,
        currentStreak: globalStreakResult.newStreak,
        longestStreak: Math.max(state.globalStreak.longestStreak, globalStreakResult.newStreak),
        lastActivityDate: todayStr,
        streakStartDate: globalStreakResult.streakBroken ? todayStr : state.globalStreak.streakStartDate,
      };
      
      // Update coding stats streak
      const updatedCodingStats = {
        ...state.codingStats,
        timeBasedStreak: updatedTimeBasedStreak,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastProblemSolvedAt: activityType === 'coding' ? timestamp : state.codingStats.lastProblemSolvedAt,
      };
      
      // Notify if streak broken
      if (streakResult.streakBroken) {
        return {
          ...state,
          codingStats: updatedCodingStats,
          timeBasedStreak: updatedTimeBasedStreak,
          globalStreak: updatedGlobalStreak,
          notifications: [
            {
              id: Date.now().toString(),
              type: 'streak',
              title: 'Streak Broken! 💔',
              message: `Your ${state.timeBasedStreak.currentStreak}-day streak has been broken. Start a new one!`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
            },
            ...state.notifications.slice(0, 9),
          ],
        };
      }
      
      // Notify if milestone reached
      if (newStreak > state.timeBasedStreak.currentStreak && newStreak % 7 === 0) {
        return {
          ...state,
          codingStats: updatedCodingStats,
          timeBasedStreak: updatedTimeBasedStreak,
          globalStreak: updatedGlobalStreak,
          notifications: [
            {
              id: Date.now().toString(),
              type: 'streak',
              title: `${newStreak}-Day Streak! 🔥`,
              message: `Amazing! You've maintained a ${newStreak}-day streak!`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
            },
            ...state.notifications.slice(0, 9),
          ],
        };
      }
      
      return {
        ...state,
        codingStats: updatedCodingStats,
        timeBasedStreak: updatedTimeBasedStreak,
        globalStreak: updatedGlobalStreak,
      };
    }
    
    case 'CHECK_DAILY_RESET':
      const today = getTodayDateString();
      const lastReset = state.dailyReset.lastResetDate;
      
      if (lastReset !== today) {
        // Need to perform reset
        return {
          ...state,
          dailyReset: {
            ...state.dailyReset,
            hasResetToday: false,
          },
        };
      }
      
      // Update countdown
      const nextReset = state.dailyReset.nextResetTime;
      const countdown = calculateCountdown(nextReset);
      
      return {
        ...state,
        dailyReset: {
          ...state.dailyReset,
          resetCountdown: countdown,
        },
      };
    
    case 'PERFORM_DAILY_RESET':
      const resetToday = getTodayDateString();
      const nextResetTime = getNextResetTime();
      
      // Reset daily counters
      const resetCodingStats = {
        ...state.codingStats,
        todaysSolved: 0,
        weeklyProgress: state.codingStats.weeklyProgress, // Keep weekly progress
      };
      
      // Check if weekly reset needed (every 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      let lastWeekReset = weekStartStr;
      if (typeof window !== 'undefined') {
        try {
          lastWeekReset = localStorage.getItem('lastWeeklyReset') || weekStartStr;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
        }
      }
      
      let finalCodingStats = resetCodingStats;
      if (lastWeekReset !== weekStartStr) {
        finalCodingStats = {
          ...resetCodingStats,
          weeklyProgress: 0,
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('lastWeeklyReset', weekStartStr);
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }
        }
      }
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('lastDailyReset', resetToday);
        } catch (error: any) {
          // Log error safely (stringify to avoid React conversion issues)
          console.error('Error saving to localStorage:', error?.message || JSON.stringify(error));
        }
      }
      
      return {
        ...state,
        codingStats: finalCodingStats,
        dailyReset: {
          lastResetDate: resetToday,
          nextResetTime,
          resetCountdown: calculateCountdown(nextResetTime),
          hasResetToday: true,
        },
        notifications: [
          {
            id: Date.now().toString(),
            type: 'mission',
            title: 'Daily Reset Complete! 🌅',
            message: 'New day, new opportunities! Your daily counters have been reset.',
            timestamp: new Date(),
            read: false,
            priority: 'medium',
          },
          ...state.notifications.slice(0, 9),
        ],
      };
    
    case 'UPDATE_ACTIVITY_TIMER':
      const { isActive: timerActive, timestamp: timerTimestamp } = action.payload;
      
      if (timerActive && !state.activityTimer.isActive) {
        // Starting new session
        return {
          ...state,
          activityTimer: {
            ...state.activityTimer,
            isActive: true,
            sessionStartTime: timerTimestamp,
            lastActivityTimestamp: timerTimestamp,
          },
        };
      } else if (!timerActive && state.activityTimer.isActive) {
        // Ending session
        const sessionDuration = state.activityTimer.sessionStartTime
          ? timerTimestamp.getTime() - state.activityTimer.sessionStartTime.getTime()
          : 0;
        
        return {
          ...state,
          activityTimer: {
            ...state.activityTimer,
            isActive: false,
            totalActiveTime: state.activityTimer.totalActiveTime + sessionDuration,
            currentSessionTime: 0,
            sessionStartTime: null,
            lastActivityTimestamp: timerTimestamp,
          },
        };
      } else if (timerActive && state.activityTimer.isActive) {
        // Update current session time
        const sessionDuration = state.activityTimer.sessionStartTime
          ? timerTimestamp.getTime() - state.activityTimer.sessionStartTime.getTime()
          : 0;
        
        return {
          ...state,
          activityTimer: {
            ...state.activityTimer,
            currentSessionTime: sessionDuration,
            lastActivityTimestamp: timerTimestamp,
          },
        };
      }
      
      return state;
    
    case 'UPDATE_COUNTDOWN':
      return {
        ...state,
        dailyReset: {
          ...state.dailyReset,
          resetCountdown: action.payload,
        },
      };
    
    case 'RECORD_DAILY_ACTIVITY':
      const { date: activityDate, activity: activityData } = action.payload;
      const existingActivity = state.timeBasedStreak.dailyActivity[activityDate] || {
        problemsSolved: 0,
        tasksCompleted: 0,
        xpEarned: 0,
        activeMinutes: 0,
        lastActivityTime: new Date().toISOString(),
      };
      
      return {
        ...state,
        timeBasedStreak: {
          ...state.timeBasedStreak,
          dailyActivity: {
            ...state.timeBasedStreak.dailyActivity,
            [activityDate]: {
              ...existingActivity,
              ...activityData,
            },
          },
        },
      };
    
    default:
      return state;
  }
}

// Demo user profile data
const DEMO_PROFILE: User = {
  id: 'demo-profile-id',
  name: 'Demo User',
  email: 'demo@careerquest.com',
  degree: 'B.Tech',
  branch: 'Computer Science',
  year: 3,
  interests: ['Full Stack Development', 'Data Science', 'Machine Learning'],
  careerGoal: 'SDE Intern at FAANG',
  avatar: '🚀',
  level: 5,
  xp: 4500,
  tier: 'Silver',
  streak: 7,
  lastActivity: new Date(),
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser, loading: authLoading, isDemoMode } = useAuth();

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!authUser) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Handle demo mode - use demo profile data instead of fetching from Supabase
      if (isDemoMode) {
        dispatch({ type: 'SET_USER', payload: DEMO_PROFILE });
        // Initialize XP system with demo user's XP
        dispatch({ 
          type: 'INITIALIZE_XP_SYSTEM', 
          payload: { 
            xp: DEMO_PROFILE.xp,
            level: DEMO_PROFILE.level,
          } 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        // Load profile
        const profile = await profileService.getProfile(authUser.id);
        
        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            degree: profile.degree,
            branch: profile.branch,
            year: profile.year,
            interests: profile.interests,
            careerGoal: profile.career_goal,
            avatar: profile.avatar,
            level: profile.level,
            xp: profile.xp,
            tier: profile.tier as 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic',
            streak: profile.streak,
            lastActivity: new Date(profile.last_activity),
          };
          dispatch({ type: 'SET_USER', payload: user });
          
          // Initialize XP system with user's actual XP from backend
          dispatch({ 
            type: 'INITIALIZE_XP_SYSTEM', 
            payload: { 
              xp: user.xp,
              level: user.level,
            } 
          });
          
          console.log('✅ XP system initialized from backend:', { xp: user.xp, level: user.level });

          // Load tasks
          const tasks = await taskService.getTasks(authUser.id);
          dispatch({ type: 'SET_TASKS', payload: tasks });

          // Load achievements
          const achievements = await achievementService.getUserAchievements(authUser.id);
          dispatch({ type: 'SET_ACHIEVEMENTS', payload: achievements });

          // Load career stats
          const careerStats = await profileService.getCareerStats(authUser.id);
          dispatch({ type: 'SET_CAREER_STATS', payload: careerStats });

          // Load coding stats
          const codingStreak = await codingService.getCodingStreak(authUser.id);
          dispatch({ type: 'UPDATE_CODING_STATS', payload: {
            currentStreak: codingStreak.currentStreak,
            longestStreak: codingStreak.longestStreak,
            totalSolved: codingStreak.totalProblemsSolved,
          }});

          // App data is managed locally via state and localStorage
          // No backend sync needed for app state

          // Initialize XP system with user data
          dispatch({ type: 'ADD_XP', payload: { amount: 0, source: 'initialization' } });
        }
      } catch (error: any) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error loading user data:', error?.message || JSON.stringify(error));
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    if (!authLoading) {
      loadUserData();
    }
  }, [authUser, authLoading, isDemoMode]);

  // Check for daily reset on mount and periodically
  useEffect(() => {
    // Check immediately
    dispatch({ type: 'CHECK_DAILY_RESET' });
    
    // Check every minute
    const checkInterval = setInterval(() => {
      dispatch({ type: 'CHECK_DAILY_RESET' });
    }, 60000); // Every minute
    
    return () => clearInterval(checkInterval);
  }, []);

  // Perform daily reset when needed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const today = getTodayDateString();
    let lastReset = today;
    
    try {
      lastReset = localStorage.getItem('lastDailyReset') || today;
    } catch (error: any) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error reading from localStorage:', error?.message || JSON.stringify(error));
    }
    
    if (lastReset !== today) {
      dispatch({ type: 'PERFORM_DAILY_RESET' });
    }
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const nextReset = getNextResetTime();
      const countdown = calculateCountdown(nextReset);
      dispatch({ type: 'UPDATE_COUNTDOWN', payload: countdown });
      
      // If countdown reaches 0, perform reset
      if (countdown === 0) {
        dispatch({ type: 'PERFORM_DAILY_RESET' });
      }
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, []);

  // Track activity timer
  useEffect(() => {
    let activityInterval: NodeJS.Timeout | null = null;
    
    if (state.activityTimer.isActive && state.activityTimer.sessionStartTime) {
      activityInterval = setInterval(() => {
        const now = new Date();
        dispatch({ 
          type: 'UPDATE_ACTIVITY_TIMER', 
          payload: { isActive: true, timestamp: now } 
        });
      }, 60000); // Update every minute
    }
    
    return () => {
      if (activityInterval) clearInterval(activityInterval);
    };
  }, [state.activityTimer.isActive, state.activityTimer.sessionStartTime]);

  // App state is managed locally - no backend sync needed

  // Auto-save XP and user data to backend whenever XP changes
  useEffect(() => {
    if (!authUser || isDemoMode || !state.user) return;

    const saveXPToBackend = async () => {
      try {
        // Save XP and level to profile
        await profileService.updateProfile(authUser.id, {
          xp: state.user.xp,
          level: state.user.level,
          tier: state.user.tier,
          streak: state.user.streak,
          lastActivity: new Date(),
        });
      } catch (error) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error saving XP to backend:', error?.message || JSON.stringify(error));
      }
    };

    // Save immediately when XP changes (no debounce for XP to ensure it's saved)
    saveXPToBackend();
  }, [state.user?.xp, state.user?.level, state.user?.tier, authUser, isDemoMode]);

  // Also save when xpSystem changes (double check)
  useEffect(() => {
    if (!authUser || isDemoMode || !state.user) return;

    const saveXPToBackend = async () => {
      try {
        // Ensure XP in user matches xpSystem
        const currentXP = state.xpSystem.currentXP;
        if (state.user.xp !== currentXP) {
          await profileService.updateProfile(authUser.id, {
            xp: currentXP,
            level: state.xpSystem.currentLevel,
            tier: state.user.tier,
            streak: state.user.streak || state.globalStreak.currentStreak,
            lastActivity: new Date(),
          });
          console.log('✅ XP synced to backend from xpSystem:', { xp: currentXP, level: state.xpSystem.currentLevel });
        }
      } catch (error) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('❌ Error syncing XP to backend:', error?.message || JSON.stringify(error));
      }
    };

    // Debounce slightly to avoid too many calls
    const timeoutId = setTimeout(saveXPToBackend, 500);
    return () => clearTimeout(timeoutId);
  }, [state.xpSystem.currentXP, state.xpSystem.currentLevel, authUser, isDemoMode]);

  // Auto-save career stats to backend
  useEffect(() => {
    if (!authUser || isDemoMode) return;

    const saveCareerStats = async () => {
      try {
        await profileService.updateCareerStats(authUser.id, state.careerStats);
        console.log('✅ Career stats saved to backend:', state.careerStats);
      } catch (error) {
        console.error('❌ Error saving career stats to backend:', error);
      }
    };

    // Debounce career stats saves
    const timeoutId = setTimeout(saveCareerStats, 2000);
    return () => clearTimeout(timeoutId);
  }, [state.careerStats, authUser, isDemoMode]);

  // Update activity timer when user interacts
  useEffect(() => {
    const handleActivity = () => {
      if (!state.activityTimer.isActive) {
        dispatch({ 
          type: 'UPDATE_ACTIVITY_TIMER', 
          payload: { isActive: true, timestamp: new Date() } 
        });
      } else {
        dispatch({ 
          type: 'UPDATE_ACTIVITY_TIMER', 
          payload: { isActive: true, timestamp: new Date() } 
        });
      }
    };

    // Track various user activities
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [state.activityTimer.isActive]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};