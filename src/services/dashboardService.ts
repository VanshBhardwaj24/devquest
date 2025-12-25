import { User } from '../types';
import { LifeService, WorkoutSession, Transaction, SavingsGoal } from './lifeService';

export interface DashboardStats {
  level: number;
  xp: number;
  progress: number;
  streak: number;
  taskRate: number;
  nextLevelXP: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface LifeSummary {
    workoutsThisWeek: number;
    financeBalance: number;
    pendingGoals: number;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'milestone' | 'achievement' | 'system' | 'life';
  title: string;
  time: string; // ISO string or relative time
  icon?: string; // string identifier for icon
  xp?: number;
  metadata?: Record<string, any>;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  source: string;
}

export interface DashboardData {
  stats: DashboardStats;
  lifeSummary: LifeSummary;
  activities: ActivityItem[];
  systemLogs: SystemLog[];
  widgets: {
    weather: { temp: number; condition: string; location: string };
    market: { trend: 'up' | 'down' | 'neutral'; value: number };
  };
}

class DashboardService {
  private static readonly STORAGE_KEY = 'dashboard_v1';
  
  static async fetchDashboardData(user: User): Promise<DashboardData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate random error (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network fluctuation detected. Dashboard sync failed.');
    }

    // Fetch Life Data for integration
    let lifeData: { fitness: WorkoutSession[]; finance: { transactions: Transaction[]; goals: SavingsGoal[] } };
    try {
        const fitness = await LifeService.getFitnessData();
        const finance = await LifeService.getFinanceData();
        lifeData = { fitness, finance };
    } catch (e) {
        console.warn('Failed to fetch life data for dashboard integration', e);
        // Fallback to empty if life service fails
        lifeData = { fitness: [], finance: { transactions: [], goals: [] } };
    }

    const now = new Date();
    const day = now.getDay();
    const mondayOffset = (day + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    const workoutsThisWeek = lifeData.fitness.filter((w: WorkoutSession) => {
        const d = new Date(w.date);
        return d >= weekStart;
    }).length;
    const financeBalance = lifeData.finance.transactions.reduce((acc: number, t: Transaction) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
    const pendingGoals = lifeData.finance.goals.filter((g: SavingsGoal) => g.current < g.target).length;

    const lifeSummary: LifeSummary = {
        workoutsThisWeek,
        financeBalance,
        pendingGoals
    };

    const localData = this.getLocalData();
    if (localData) {
      // Merge with live user data if needed
      return {
        ...localData,
        lifeSummary, // Update with fresh life summary
        stats: this.calculateStats(user), // Always recalculate stats based on latest user object
      };
    }

    // Generate initial mock data
    const initialData: DashboardData = {
      stats: this.calculateStats(user),
      lifeSummary,
      activities: [
        {
          id: '1',
          type: 'task',
          title: 'System Initialization Complete',
          time: new Date().toISOString(),
          xp: 10,
          metadata: { system: 'core' }
        },
        {
          id: '2',
          type: 'achievement',
          title: 'First Login of the Day',
          time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          xp: 50,
        }
      ],
      systemLogs: [
        {
          id: 'log-1',
          timestamp: new Date(),
          message: 'Dashboard module loaded successfully',
          type: 'success',
          source: 'System'
        }
      ],
      widgets: {
        weather: { temp: 22, condition: 'Clear', location: 'Cyber City' },
        market: { trend: 'up', value: 1245.50 }
      }
    };

    this.saveLocalData(initialData);
    return initialData;
  }

  static async refreshSystemLogs(): Promise<SystemLog[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const logs: SystemLog[] = [
        {
            id: Date.now().toString(),
            timestamp: new Date(),
            message: `System check at ${new Date().toLocaleTimeString()}`,
            type: 'info',
            source: 'Monitor'
        },
        {
            id: (Date.now() + 1).toString(),
            timestamp: new Date(),
            message: 'Memory usage within optimal limits',
            type: 'success',
            source: 'Kernel'
        }
    ];
    return logs;
  }

  private static calculateStats(user: User): DashboardStats {
     // Mock calculation logic mirroring component logic
    const currentLevel = user?.level || 1;
    const currentXP = user?.xp || 0;
    const getXPForLevel = (level: number) => Math.floor(1000 * Math.pow(1.1, level - 1));
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const needed = xpForNextLevel - xpForCurrentLevel;
    const currentLevelXP = Math.max(0, currentXP - xpForCurrentLevel);
    const progress = Math.min(Math.max((currentLevelXP / needed) * 100, 0), 100);

    return {
      level: currentLevel,
      xp: currentXP,
      progress: progress,
      streak: user?.streak || 0,
      taskRate: 0, // Needs task data context, mocking 0 for now
      nextLevelXP: needed - currentLevelXP,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0
    };
  }

  private static getLocalData(): DashboardData | null {
    try {
      const item = localStorage.getItem(this.STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to read dashboard data', e);
      return null;
    }
  }

  private static saveLocalData(data: DashboardData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save dashboard data', e);
    }
  }
}

export default DashboardService;
