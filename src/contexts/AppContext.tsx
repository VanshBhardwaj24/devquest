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
  | { type: 'UNLOCK_THEME'; payload: string };

// Dynamic XP calculation functions
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

const calculateLevelFromXP = (xp: number): number => {
  let level = 1;
  let totalXP = 0;
  while (totalXP <= xp) {
    totalXP += calculateXPForLevel(level);
    if (totalXP > xp) break;
    level++;
  }
  return level;
};

const calculateXPToNextLevel = (currentXP: number, currentLevel: number): number => {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpEarnedInCurrentLevel = currentXP % xpForCurrentLevel;
  return xpForCurrentLevel - xpEarnedInCurrentLevel;
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
  },
  xpSystem: {
    currentXP: 0,
    currentLevel: 1,
    xpToNextLevel: 100,
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
  darkMode: localStorage.getItem('darkMode') === 'true',
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
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
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
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', newDarkMode.toString());
      return { ...state, darkMode: newDarkMode };
    
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
      const newXPToNext = calculateXPToNextLevel(newTotalXP, newLevel);
      
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
            title: isSpending ? `${finalAmount} XP Spent 🎁` : `+${finalAmount} XP Earned! ⚡`,
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
    
    case 'SOLVE_PROBLEM':
      const { xp, difficulty, platform, topic } = action.payload;
      const difficultyMultiplier = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1;
      const newCodingStats = {
        ...state.codingStats,
        totalSolved: state.codingStats.totalSolved + 1,
        todaysSolved: state.codingStats.todaysSolved + 1,
        weeklyProgress: state.codingStats.weeklyProgress + 1,
        [`${difficulty.toLowerCase()}Count`]: state.codingStats[`${difficulty.toLowerCase()}Count` as keyof typeof state.codingStats] + 1,
        platformStats: {
          ...state.codingStats.platformStats,
          [platform.toLowerCase()]: (state.codingStats.platformStats[platform.toLowerCase() as keyof typeof state.codingStats.platformStats] || 0) + 1,
        },
        topicStats: {
          ...state.codingStats.topicStats,
          [topic]: (state.codingStats.topicStats[topic] || 0) + 1,
        },
      };
      
      const statBoost = difficultyMultiplier * 2;
      const newCareerStats = {
        ...state.careerStats,
        knowledge: Math.min(100, state.careerStats.knowledge + statBoost),
      };

      return {
        ...state,
        codingStats: newCodingStats,
        careerStats: newCareerStats,
      };
    
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

  useEffect(() => {
    async function loadUserData() {
      if (!authUser) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Handle demo mode - use demo profile data instead of fetching from Supabase
      if (isDemoMode) {
        dispatch({ type: 'SET_USER', payload: DEMO_PROFILE });
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

          // Initialize XP system with user data
          dispatch({ type: 'ADD_XP', payload: { amount: 0, source: 'initialization' } });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    if (!authLoading) {
      loadUserData();
    }
  }, [authUser, authLoading, isDemoMode]);

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