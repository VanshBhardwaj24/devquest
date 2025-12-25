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
  // New dynamic fields
  bucketList: BucketItem[];
  contacts: Contact[];
  mindfulness: MindfulnessStats;
  internships: InternshipApplication[];
  projects: Project[];
  activityLog: ActivityLog[];
}

export interface ActivityLog {
  date: string;
  xpEarned: number;
  tasksCompleted: number;
  minutesActive: number;
  productivityScore?: number;
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
export interface BucketItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'travel' | 'skill' | 'experience' | 'creation';
  targetDate?: Date;
  description?: string;
  image?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  lastContactedDate: Date;
  relationshipScore: number; // 0-100
  notes?: string;
  avatar?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
}

export interface MindfulnessStats {
  currentStreak: number;
  totalMinutes: number;
  averageMood: number; // 1-10
  totalSessions: number;
  lastSessionDate?: Date;
}

export interface InternshipApplication {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Rejected' | 'Accepted';
  dateApplied: Date;
  salary?: string;
  location?: string;
  notes?: string;
  link?: string;
  logo?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  progress: number;
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  likes?: number;
  views?: number;
  featured?: boolean;
  createdAt: Date;
  lastUpdated?: Date;
  branch?: string;
  stars?: number;
}

export interface ShopItem extends Reward {
  stock?: number; // Unlimited if undefined
  purchased: boolean;
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
