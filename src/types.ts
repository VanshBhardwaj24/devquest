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
  skills: Skill[];
  hp: number;
  maxHp: number;
  gold: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  category: 'technical' | 'soft' | 'life';
  icon: string;
}

export interface SystemLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: Date;
  source: string;
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
  priority: 'high' | 'medium' | 'low' | 'Elite' | 'Core' | 'Bonus'; // Merged priorities
  completed: boolean;
  xp: number;
  completedAt?: Date;
  category: 'career' | 'personal' | 'learning' | 'health' | 'finance';
  dueDate: Date;
  createdAt: Date;
  streak: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  relatedSkillId?: string;
  xpReward?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: string;
}

export interface CareerStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  skillsMastered: number;
  projectsCompleted: number;
}
