import { User, Task, ActivityLog } from '../types';
import { LifeService } from './lifeService';
import { LifeService, LifeData } from './lifeService';
=======
import { User, Task, ActivityLog } from '../types';
import { LifeService } from './lifeService';
>>>>>>> origin/main

export interface PerformanceDataPoint {
  date: string;
  xp: number;
  tasks: number;
  streak: number;
  productivity: number;
}

export interface FocusMetric {
  name: string;
  value: number;
  color: string;
}

export interface CompletionMetric {
    name: string;
    completed: number;
    pending: number;
}

export interface LifeAnalytics {
    workoutTrend: { date: string; duration: number }[];
    spendingTrend: { date: string; amount: number }[];
}

export interface AnalyticsData {
  performance: PerformanceDataPoint[];
  focusDistribution: FocusMetric[];
  completionRate: CompletionMetric[];
  lifeAnalytics: LifeAnalytics;
  insights: string[];
  lastUpdated: Date;
}

export class AnalyticsService {
  private static readonly STORAGE_KEY = 'analytics_v1';

  static async fetchAnalyticsData(user: User, tasks: Task[]): Promise<AnalyticsData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate random error (5% chance)
    if (Math.random() < 0.05) {
        throw new Error("Failed to retrieve analytics data from server.");
    }

    // Fetch Life Data
    } catch (e) {
    try {
        const fitness = await LifeService.getFitnessData();
        const finance = await LifeService.getFinanceData();
        lifeData = { fitness, finance };
<<<<<<< HEAD
    } catch {
=======
    } catch (e) {
>>>>>>> origin/main
        lifeData = { fitness: [], finance: { transactions: [], goals: [] } };
    }

    // Calculate real data
    const performance = this.calculatePerformance(user, tasks);
    const focusDistribution = this.calculateFocus(tasks);
    const completionRate = this.calculateCompletion(tasks);
    const lifeAnalytics = this.calculateLifeAnalytics(lifeData);
    const insights = this.generateInsights(performance, focusDistribution, lifeData);

    return {
  private static calculateLifeAnalytics(lifeData: any): LifeAnalytics {
        focusDistribution,
        completionRate,
        lifeAnalytics,
        insights,
        lastUpdated: new Date()
    };
  }
              .filter((s: any) => s.date.startsWith(dateStr))
              .reduce((acc: number, s: any) => acc + s.duration, 0);
  private static calculateLifeAnalytics(lifeData: LifeData): LifeAnalytics {
=======
  private static calculateLifeAnalytics(lifeData: any): LifeAnalytics {
>>>>>>> origin/main
      // Workout Trend (Last 7 days)
      const workoutTrend = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          
          const duration = lifeData.fitness
            .filter((t: any) => t.type === 'expense' && t.date.startsWith(dateStr))
            .reduce((acc: number, t: any) => acc + t.amount, 0);
              .reduce((acc, s) => acc + s.duration, 0);
=======
              .filter((s: any) => s.date.startsWith(dateStr))
              .reduce((acc: number, s: any) => acc + s.duration, 0);
>>>>>>> origin/main
          
          return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), duration };
      });

      // Spending Trend (Last 7 days) - Expense only
      const spendingTrend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        
        const amount = lifeData.finance.transactions
<<<<<<< HEAD
            .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
            .reduce((acc, t) => acc + t.amount, 0);
=======
            .filter((t: any) => t.type === 'expense' && t.date.startsWith(dateStr))
            .reduce((acc: number, t: any) => acc + t.amount, 0);
>>>>>>> origin/main
        
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), amount };
    });

    return { workoutTrend, spendingTrend };
  }

  private static calculatePerformance(user: User, tasks: Task[]): PerformanceDataPoint[] {
    const today = new Date();
    const daysBack = 30; // 30 days history
    const dates = Array.from({ length: daysBack }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (daysBack - 1 - i));
      return d;
    });

    const toIso = (date: Date) => date.toISOString().split('T')[0];

    return dates.map(d => {
      const label = `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}`;
      const iso = toIso(d);
      
      // Try to find in activity log
      const fromLog = (user?.activityLog || []).find(entry => entry.date === iso);
      
      // Fallback calculation from tasks if no log entry
      let xp = fromLog ? fromLog.xpEarned : 0;
      let tasksCompleted = fromLog ? fromLog.tasksCompleted : 0;
      
      if (!fromLog) {
          const dayTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === iso);
          tasksCompleted = dayTasks.length;
          // XP estimation if not tracked explicitly in tasks
          xp = dayTasks.length * 50; 
      }

      const productivity = fromLog?.productivityScore || Math.floor(Math.random() * 40 + 60); // Mock if missing
      
      return {
        date: label,
        xp,
        tasks: tasksCompleted,
        streak: user.streak, // Simplified, ideally historical streak
        productivity,
      };
    });
        .filter(([_, value]) => value > 0)

  private static calculateFocus(tasks: Task[]): FocusMetric[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const counts: Record<string, number> = { career: 0, learning: 0, personal: 0, health: 0, finance: 0 };
    
    tasks.forEach(t => {
      const d = t.completedAt ? new Date(t.completedAt) : (t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt));
      if (d >= cutoff && t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });

    const colorMap: Record<string, string> = {
      career: '#84cc16',   // lime
      learning: '#22d3ee', // cyan
      personal: '#d946ef', // fuchsia
      health: '#f97316',   // orange
      finance: '#f59e0b',  // amber
    };

    return Object.entries(counts)
<<<<<<< HEAD
        .filter(([, value]) => value > 0)
=======
        .filter(([_, value]) => value > 0)
>>>>>>> origin/main
        .map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value,
            color: colorMap[key] || '#94a3b8',
    }));
  }

  private static calculateCompletion(tasks: Task[]): CompletionMetric[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
  private static generateInsights(performance: PerformanceDataPoint[], focus: FocusMetric[], lifeData: any): string[] {
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    return last7Days.map(date => {
        const dayName = days[date.getDay()];
        const dateStr = date.toDateString();

        const completedCount = tasks.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            return new Date(t.completedAt).toDateString() === dateStr;
        }).length;

        const pendingCount = tasks.filter(t => {
            if (t.completed || !t.dueDate) return false;
            return new Date(t.dueDate).toDateString() === dateStr;
        }).length;
        
        return {
            name: dayName,
            completed: completedCount,
            pending: pendingCount
        };
    });
  }

<<<<<<< HEAD
  private static generateInsights(performance: PerformanceDataPoint[], focus: FocusMetric[], lifeData: LifeData): string[] {
=======
  private static generateInsights(performance: PerformanceDataPoint[], focus: FocusMetric[], lifeData: any): string[] {
>>>>>>> origin/main
            .filter((t: any) => t.type === 'expense' && new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      // Analyze trends
      const recentPerformance = performance.slice(-7);
      const avgProductivity = recentPerformance.reduce((acc, p) => acc + p.productivity, 0) / recentPerformance.length;
      
      if (avgProductivity > 80) {
          insights.push("High productivity maintained over the last week! Keep it up.");
      } else if (avgProductivity < 50) {
          insights.push("Productivity seems lower recently. Consider shorter work sessions.");
      }

      // Analyze focus
      const topFocus = focus.sort((a, b) => b.value - a.value)[0];
      if (topFocus) {
          insights.push(`Your main focus has been ${topFocus.name}. Ensure balance with other areas.`);
      }

      // Analyze Life Data
      if (lifeData.fitness.length > 0) {
          const lastWorkout = new Date(lifeData.fitness[0].date);
          const daysSince = Math.floor((new Date().getTime() - lastWorkout.getTime()) / (1000 * 3600 * 24));
          if (daysSince > 3) {
              insights.push("It's been over 3 days since your last workout. Time to move!");
          } else {
              insights.push("Great job keeping up with your fitness routine!");
          }
      }

      if (lifeData.finance.transactions.length > 0) {
          const recentExpenses = lifeData.finance.transactions
<<<<<<< HEAD
            .filter(t => t.type === 'expense' && new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
=======
            .filter((t: any) => t.type === 'expense' && new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
>>>>>>> origin/main
          if (recentExpenses.length > 10) {
              insights.push("High number of transactions this week. Review your spending.");
          }
      }

      return insights;
  }
}
