export interface User {
  id: string;
  name: string;
  email: string;
  degree: string;
  branch: string;
  year: number;
  interests: string[];
  careerGoal: string;
  avatar: string;
  level: number;
  xp: number;
  totalXpSpent: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic' | 'Legend';
  streak: number;
  lastActivity: Date;
  rank: number;
  comboMultiplier: number;
  dailyLoginStreak: number;
  lastLoginDate: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'break' | 'entertainment' | 'food' | 'gaming' | 'social' | 'custom';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  timesRedeemed: number;
  maxRedemptions?: number;
  cooldown?: number; // hours
  lastRedeemed?: Date;
  unlockLevel?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  bonusXp: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: Date;
  type: 'problems' | 'tasks' | 'streak' | 'time' | 'combo';
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  startsAt: Date;
  endsAt: Date;
  milestones: { target: number; reward: number; claimed: boolean }[];
}

export interface XPTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: string;
  timestamp: Date;
  multiplier?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  xp: number;
  estimatedHours: number;
  dependencies: string[];
  category: 'knowledge' | 'mindset' | 'communication' | 'portfolio';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Elite' | 'Core' | 'Bonus';
  completed: boolean;
  xp: number;
  category: string;
  dueDate: Date;
  createdAt: Date;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  xp: number;
}

export interface CareerStats {
  knowledge: number;
  mindset: number;
  communication: number;
  portfolio: number;
}

// Time-based tracking interfaces
export interface TimeBasedActivity {
  date: string; // ISO date string
  problemsSolved: number;
  tasksCompleted: number;
  xpEarned: number;
  activeMinutes: number;
  lastActivityTime: string; // ISO timestamp
  codingTime?: number; // minutes spent coding
  learningTime?: number; // minutes spent learning
  networkingTime?: number; // minutes spent networking
  businessTime?: number; // minutes spent on business
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date string
  streakStartDate: string; // ISO date string
  streakType: 'daily' | 'coding' | 'task' | 'learning' | 'combined';
  dailyActivity: {
    [date: string]: TimeBasedActivity;
  };
  milestones: {
    date: string;
    streak: number;
    achievement?: string;
  }[];
}

export interface DailyResetData {
  lastResetDate: string; // ISO date string
  nextResetTime: Date;
  resetCountdown: number; // seconds until next reset
  hasResetToday: boolean;
  weeklyResetDate?: string;
  monthlyResetDate?: string;
  resetHistory: {
    date: string;
    type: 'daily' | 'weekly' | 'monthly';
    stats: {
      tasksCompleted: number;
      problemsSolved: number;
      xpEarned: number;
    };
  }[];
}

export interface ActivitySession {
  id: string;
  type: 'coding' | 'learning' | 'task' | 'networking' | 'business' | 'general';
  startTime: Date;
  endTime?: Date;
  duration: number; // milliseconds
  xpEarned: number;
  activities: string[]; // What was done in this session
  focusLevel: number; // 1-10
  distractions: number;
}

export interface TimeTracking {
  totalActiveTime: number; // milliseconds
  todayActiveTime: number; // milliseconds
  weekActiveTime: number; // milliseconds
  monthActiveTime: number; // milliseconds
  currentSession: ActivitySession | null;
  sessionHistory: ActivitySession[];
  averageSessionDuration: number; // milliseconds
  longestSession: number; // milliseconds
  productivityScore: number; // 0-100
}

// Business and career interfaces
export interface BusinessMilestone {
  id: string;
  title: string;
  description: string;
  category: 'startup' | 'revenue' | 'customer' | 'product' | 'marketing' | 'team';
  targetValue: number;
  currentValue: number;
  targetDate: Date;
  completed: boolean;
  xpReward: number;
  revenue?: number;
  customers?: number;
  metrics?: {
    [key: string]: number;
  };
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface InternshipApplication {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  applicationDate: Date;
  interviewDate?: Date;
  offerDate?: Date;
  rejectionDate?: Date;
  location?: string;
  salary?: string;
  portal?: string;
  referral?: boolean;
  referralSource?: string;
  notes?: string;
  followUpDate?: Date;
  xpEarned: number;
  tags?: string[];
}

export interface NetworkingContact {
  id: string;
  name: string;
  company?: string;
  position?: string;
  email?: string;
  linkedin?: string;
  phone?: string;
  metAt: string; // Event name or location
  metDate: Date;
  notes?: string;
  followUpDate?: Date;
  relationship: 'acquaintance' | 'colleague' | 'mentor' | 'mentee' | 'friend' | 'professional';
  tags?: string[];
}

export interface NetworkingEvent {
  id: string;
  name: string;
  type: 'meetup' | 'conference' | 'online' | 'coffee' | 'workshop' | 'hackathon';
  date: Date;
  location?: string;
  connections: NetworkingContact[];
  xpEarned: number;
  notes?: string;
  followUp?: boolean;
  resources?: string[]; // Links, slides, etc.
}

export interface PublicCommitment {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  completed: boolean;
  xpReward: number;
  public: boolean;
  createdAt: Date;
  progress: number;
  target: number;
  accountabilityPartner?: string;
  partnerId?: string;
  notes?: string;
  reminders: {
    date: Date;
    sent: boolean;
    message?: string;
  }[];
  milestones: {
    id: string;
    title: string;
    targetDate: Date;
    completed: boolean;
    xpReward: number;
  }[];
  proof?: {
    type: 'image' | 'link' | 'text';
    content: string;
    date: Date;
  }[];
}

// Learning and skill interfaces
export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: 'programming' | 'design' | 'business' | 'soft-skills' | 'certification' | 'degree';
  targetDate: Date;
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
  resources: {
    type: 'course' | 'book' | 'video' | 'article' | 'practice';
    title: string;
    url?: string;
    completed: boolean;
  }[];
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    xpReward: number;
  }[];
  notes?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'language' | 'concept' | 'soft-skill';
  level: number; // 1-10
  xp: number;
  lastPracticed?: Date;
  practiceCount: number;
  certifications?: {
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
    credentialId?: string;
  }[];
  projects: string[]; // Project IDs where this skill was used
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  category: 'programming' | 'cloud' | 'security' | 'data' | 'design' | 'business';
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  xpReward: number;
  skills: string[]; // Skill IDs
  verified: boolean;
}

// Portfolio and project interfaces
export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'data' | 'ai' | 'game' | 'other';
  technologies: string[];
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  startDate: Date;
  completionDate?: Date;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  xpReward: number;
  xpEarned: number;
  features: string[];
  challenges: string[];
  learnings: string[];
  images: string[];
  tags: string[];
  collaborators?: string[];
  stars?: number;
  forks?: number;
  views?: number;
}

export interface PortfolioItem {
  id: string;
  projectId: string;
  featured: boolean;
  showcaseOrder: number;
  description: string;
  highlights: string[];
  metrics: {
    [key: string]: number;
  };
}

// Social and community interfaces
export interface Community {
  id: string;
  name: string;
  type: 'discord' | 'slack' | 'reddit' | 'forum' | 'local' | 'online';
  url?: string;
  joinedDate: Date;
  role: 'member' | 'moderator' | 'admin' | 'founder';
  contributions: number;
  xpEarned: number;
  active: boolean;
}

export interface MentorRelationship {
  id: string;
  type: 'mentor' | 'mentee';
  personId: string;
  personName: string;
  startDate: Date;
  status: 'active' | 'paused' | 'ended';
  sessions: {
    id: string;
    date: Date;
    duration: number; // minutes
    topics: string[];
    notes?: string;
    xpEarned: number;
  }[];
  goals: string[];
  achievements: string[];
}

// Finance and rewards interfaces
export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  category: 'savings' | 'investment' | 'debt' | 'income' | 'expense';
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  completed: boolean;
  xpReward: number;
  milestones: {
    id: string;
    amount: number;
    completed: boolean;
    xpReward: number;
  }[];
  notes?: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  redeemedAt: Date;
  xpCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

// Analytics and insights interfaces
export interface DailyAnalytics {
  date: string; // ISO date string
  tasksCompleted: number;
  problemsSolved: number;
  xpEarned: number;
  activeMinutes: number;
  productivityScore: number;
  focusTime: number;
  distractions: number;
  mood?: number; // 1-10
  energy?: number; // 1-10
  notes?: string;
}

export interface WeeklyAnalytics {
  weekStart: string; // ISO date string
  tasksCompleted: number;
  problemsSolved: number;
  xpEarned: number;
  activeHours: number;
  averageProductivity: number;
  streakDays: number;
  goalsAchieved: number;
  challenges: string[];
  wins: string[];
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM
  tasksCompleted: number;
  problemsSolved: number;
  xpEarned: number;
  activeHours: number;
  averageProductivity: number;
  longestStreak: number;
  goalsAchieved: number;
  skillsLearned: number;
  certificationsEarned: number;
  projectsCompleted: number;
  applicationsSubmitted: number;
  interviewsCompleted: number;
  offersReceived: number;
  topCategories: {
    category: string;
    count: number;
    xp: number;
  }[];
  insights: string[];
}

// Challenge and competition interfaces
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special' | 'community';
  difficulty: 'easy' | 'medium' | 'hard' | 'elite';
  xpReward: number;
  startDate: Date;
  endDate: Date;
  progress: number;
  target: number;
  completed: boolean;
  milestones: {
    id: string;
    title: string;
    progress: number;
    target: number;
    completed: boolean;
    xpReward: number;
  }[];
  participants?: number;
  rank?: number;
  rewards: string[];
}

export interface Competition {
  id: string;
  name: string;
  type: 'coding' | 'design' | 'business' | 'general';
  startDate: Date;
  endDate: Date;
  participants: number;
  rank: number;
  score: number;
  xpEarned: number;
  prizes?: string[];
  achievements: string[];
}

// Notification and communication interfaces
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  streakReminders: boolean;
  dailyGoals: boolean;
  achievements: boolean;
  social: boolean;
  reminders: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'goal' | 'commitment' | 'event' | 'custom';
  scheduledTime: Date;
  completed: boolean;
  recurring: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    dayOfMonth?: number;
  };
  notificationSent: boolean;
}

// Settings and preferences interfaces
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showStreak: boolean;
    showXP: boolean;
    showLevel: boolean;
    showAchievements: boolean;
  };
  productivity: {
    focusMode: boolean;
    pomodoroEnabled: boolean;
    pomodoroDuration: number; // minutes
    breakDuration: number; // minutes
    dailyGoalXP: number;
    weeklyGoalXP: number;
  };
  gamification: {
    soundEffects: boolean;
    animations: boolean;
    confetti: boolean;
    celebrations: boolean;
  };
}

export interface AppSettings {
  version: string;
  lastUpdate: Date;
  features: {
    [key: string]: boolean;
  };
  experiments: {
    [key: string]: boolean;
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      connected: boolean;
      lastSync?: Date;
    };
  };
}

// Export all types
export type Priority = 'Elite' | 'Core' | 'Bonus';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Elite';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic' | 'Legend';
export type ActivityType = 'coding' | 'task' | 'learning' | 'networking' | 'business' | 'general';
export type StreakType = 'daily' | 'coding' | 'task' | 'learning' | 'combined';
export type NotificationType = 'achievement' | 'level-up' | 'task-completed' | 'streak' | 'challenge' | 'badge' | 'reward' | 'social' | 'mission';
export type NotificationPriority = 'low' | 'medium' | 'high';