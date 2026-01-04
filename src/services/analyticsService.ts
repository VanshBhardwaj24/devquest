import { User, Task } from '../types';
import { LifeService, LifeData } from './lifeService';

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

export interface PenaltyAnalytics {
  totalPenalties: number;
  overdueQuests: number;
  penaltyTrend: {
    trend: 'increasing' | 'stable' | 'decreasing';
    count: number;
    percentage: number;
  };
  penaltyRate: number;
  recoveryRate: number;
}

export interface PerformanceMetrics {
  taskCompletionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  streakAnalysis: {
    current: number;
    longest: number;
    consistency: 'high' | 'medium' | 'low';
    improvement: number;
  };
}

export interface AnalyticsData {
  performance: PerformanceDataPoint[];
  focusDistribution: FocusMetric[];
  completionRate: CompletionMetric[];
  lifeAnalytics: LifeAnalytics;
  penaltyAnalytics?: PenaltyAnalytics;
  performanceMetrics?: PerformanceMetrics;
  insights: string[];
  lastUpdated: Date;
}

export interface RetentionCohort {
  week: string;
  users: number;
  retained: number;
  rate: number;
}

export interface EngagementMetrics {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  avgSessionMinutes: number;
  interactionRate: number;
}

export interface AnomalyDetection {
  metric: string;
  value: number;
  baseline: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export interface PredictiveMetrics {
  nextWeekProductivity: number;
  expectedCompletedTasks: number;
  burnoutRisk: 'low' | 'medium' | 'high';
}

export interface ExtendedAnalyticsData extends AnalyticsData {
  retention?: RetentionCohort[];
  engagement?: EngagementMetrics;
  anomalies?: AnomalyDetection[];
  predictive?: PredictiveMetrics;
}

export class AnalyticsService {
  private static readonly STORAGE_KEY = 'analytics_v1';

  static async fetchAnalyticsData(user: User, tasks: Task[]): Promise<ExtendedAnalyticsData> {
    const cached = this.getCached();
    if (cached && Date.now() - new Date(cached.lastUpdated).getTime() < 2 * 60 * 1000) {
      return cached;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Math.random() < 0.05) {
      throw new Error('Failed to retrieve analytics data from server.');
    }

    let lifeData: LifeData;
    try {
      const fitness = await LifeService.getFitnessData();
      const finance = await LifeService.getFinanceData();
      lifeData = { fitness, finance };
    } catch {
      lifeData = { fitness: [], finance: { transactions: [], goals: [] } };
    }

    const performance = this.calculatePerformance(user, tasks);
    const focusDistribution = this.calculateFocus(tasks);
    const completionRate = this.calculateCompletion(tasks);
    const lifeAnalytics = this.calculateLifeAnalytics(lifeData);
    const penaltyAnalytics = this.calculatePenalties(tasks);
    const performanceMetrics = this.calculatePerformanceMetrics(user, tasks, performance);
    const insights = this.generateInsights(performance, focusDistribution, lifeData);

    const retention = this.calculateRetentionCohorts(tasks);
    const engagement = this.calculateEngagementMetrics(user, tasks);
    const anomalies = this.detectAnomalies(performance, focusDistribution);
    const predictive = this.predictNextWeekMetrics(user, performance, tasks);

    const data: ExtendedAnalyticsData = {
      performance,
      focusDistribution,
      completionRate,
      lifeAnalytics,
      penaltyAnalytics,
      performanceMetrics,
      insights,
      lastUpdated: new Date(),
      retention,
      engagement,
      anomalies,
      predictive,
    };
    this.setCached(data);
    return data;
  }

  private static calculateLifeAnalytics(lifeData: LifeData): LifeAnalytics {
    const workoutTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const duration = lifeData.fitness
        .filter(s => s.date.startsWith(dateStr))
        .reduce((acc, s) => acc + s.duration, 0);
      return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), duration };
    });

    const spendingTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const amount = lifeData.finance.transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
        .reduce((acc, t) => acc + t.amount, 0);
      return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), amount };
    });

    return { workoutTrend, spendingTrend };
  }

  private static calculatePerformance(user: User, tasks: Task[]): PerformanceDataPoint[] {
    const today = new Date();
    const daysBack = 30;
    const dates = Array.from({ length: daysBack }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (daysBack - 1 - i));
      return d;
    });
    const toIso = (date: Date) => date.toISOString().split('T')[0];

    return dates.map(d => {
      const label = `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}`;
      const iso = toIso(d);
      const fromLog = (user?.activityLog || []).find(entry => entry.date === iso);
      let xp = fromLog ? fromLog.xpEarned : 0;
      let tasksCompleted = fromLog ? fromLog.tasksCompleted : 0;
      if (!fromLog) {
        const dayTasks = tasks.filter(
          t => t.completed && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === iso
        );
        tasksCompleted = dayTasks.length;
        xp = dayTasks.length * 50;
      }
      const productivity = fromLog?.productivityScore || Math.floor(Math.random() * 40 + 60);
      return { date: label, xp, tasks: tasksCompleted, streak: user.streak, productivity };
    });
  }

  private static calculateFocus(tasks: Task[]): FocusMetric[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const counts: Record<string, number> = { career: 0, learning: 0, personal: 0, health: 0, finance: 0 };
    tasks.forEach(t => {
      const d = t.completedAt ? new Date(t.completedAt) : t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
      if (d >= cutoff && t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    const colorMap: Record<string, string> = {
      career: '#84cc16',
      learning: '#22d3ee',
      personal: '#d946ef',
      health: '#f97316',
      finance: '#f59e0b',
    };
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
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
      const d = new Date(today);
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
      return { name: dayName, completed: completedCount, pending: pendingCount };
    });
  }

  private static calculatePenalties(tasks: Task[]): PenaltyAnalytics {
    const now = new Date();
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    const overdueByDay = last14.map(d => {
      const dateStr = d.toDateString();
      return tasks.filter(t => {
        if (t.completed) return false;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due.toDateString() === dateStr && due < now;
      }).length;
    });
    const first7 = overdueByDay.slice(0, 7).reduce((a, b) => a + b, 0);
    const last7 = overdueByDay.slice(7).reduce((a, b) => a + b, 0);
    const trend = last7 > first7 ? 'increasing' : last7 < first7 ? 'decreasing' : 'stable';
    const totalOverdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length;
    const total = tasks.length || 1;
    const penaltyRate = Math.round((totalOverdue / total) * 100);
    const recoveryRate = Math.max(0, Math.min(100, 100 - penaltyRate));
    return {
      totalPenalties: totalOverdue,
      overdueQuests: totalOverdue,
      penaltyTrend: { trend, count: last7, percentage: total > 0 ? Math.round((last7 / total) * 100) : 0 },
      penaltyRate,
      recoveryRate,
    };
  }

  private static calculatePerformanceMetrics(user: User, tasks: Task[], perf: PerformanceDataPoint[]): PerformanceMetrics {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= cutoff);
    const completedRecent = recentTasks.filter(t => t.completed).length;
    const taskCompletionRate = recentTasks.length > 0 ? Math.round((completedRecent / recentTasks.length) * 100) : 0;
    const completedWithTimes = tasks.filter(t => t.completed && t.completedAt);
    const times = completedWithTimes.map(t => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.completedAt as Date).getTime();
      return Math.max(0, end - start);
    });
    const avgMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const averageCompletionTime = Math.round(avgMs / (1000 * 60 * 60));
    const recentPerf = perf.slice(-7);
    const avgXP = recentPerf.length > 0 ? Math.round(recentPerf.reduce((a, p) => a + p.xp, 0) / recentPerf.length) : 0;
    const productivityScore = Math.min(100, Math.round((taskCompletionRate * 0.6) + (Math.min(100, avgXP / 10) * 0.4)));
    const daysActive = recentPerf.filter(p => p.tasks > 0).length;
    const consistency = daysActive >= 6 ? 'high' : daysActive >= 4 ? 'medium' : 'low';
    const improvement = recentPerf.length >= 7 ? Math.max(0, recentPerf[6].tasks - recentPerf[0].tasks) : 0;
    return {
      taskCompletionRate,
      averageCompletionTime,
      productivityScore,
      streakAnalysis: {
        current: user.streak,
        longest: user.dailyLoginStreak,
        consistency,
        improvement,
      },
    };
  }

  private static generateInsights(
    performance: PerformanceDataPoint[],
    focus: FocusMetric[],
    lifeData: LifeData
  ): string[] {
    const insights: string[] = [];
    const recentPerformance = performance.slice(-7);
    const avgProductivity = recentPerformance.reduce((acc, p) => acc + p.productivity, 0) / recentPerformance.length;
    if (avgProductivity > 80) {
      insights.push('High productivity maintained over the last week! Keep it up.');
    } else if (avgProductivity < 50) {
      insights.push('Productivity seems lower recently. Consider shorter work sessions.');
    }
    const topFocus = [...focus].sort((a, b) => b.value - a.value)[0];
    if (topFocus) {
      insights.push(`Your main focus has been ${topFocus.name}. Ensure balance with other areas.`);
    }
    if (lifeData.fitness.length > 0) {
      const lastWorkout = new Date(lifeData.fitness[0].date);
      const daysSince = Math.floor((new Date().getTime() - lastWorkout.getTime()) / (1000 * 3600 * 24));
      if (daysSince > 3) {
        insights.push("It's been over 3 days since your last workout. Time to move!");
      } else {
        insights.push('Great job keeping up with your fitness routine!');
      }
    }
    if (lifeData.finance.transactions.length > 0) {
      const recentExpenses = lifeData.finance.transactions.filter(
        t => t.type === 'expense' && new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      if (recentExpenses.length > 10) {
        insights.push('High number of transactions this week. Review your spending.');
      }
    }
    return insights;
  }

  private static getCached(): AnalyticsData | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ExtendedAnalyticsData;
      return parsed;
    } catch {
      return null;
    }
  }

  private static setCached(data: AnalyticsData) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {
    }
  }

  private static calculateRetentionCohorts(tasks: Task[]): RetentionCohort[] {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (7 * (7 - i)));
      return d;
    });
    return weeks.map((d, i) => {
      const week = `W${i + 1}`;
      const users = Math.max(10, 100 - i * 5);
      const retained = Math.max(5, users - i * 7);
      const rate = Math.round((retained / users) * 100);
      return { week, users, retained, rate };
    });
  }

  private static calculateEngagementMetrics(user: User, tasks: Task[]): EngagementMetrics {
    const now = new Date();
    const recentTasks = tasks.filter(t => (t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt)) > new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const weeklyTasks = tasks.filter(t => (t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt)) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const monthlyTasks = tasks.filter(t => (t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt)) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    const avgSessionMinutes = Math.round(((user as any)?.sessionMinutes || 45) * 10) / 10;
    const interactionRate = Math.min(100, Math.round((weeklyTasks.length / Math.max(1, tasks.length)) * 100));
    return {
      dailyActive: recentTasks.length,
      weeklyActive: weeklyTasks.length,
      monthlyActive: monthlyTasks.length,
      avgSessionMinutes,
      interactionRate,
    };
  }

  private static detectAnomalies(perf: PerformanceDataPoint[], focus: FocusMetric[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const last = perf.slice(-1)[0];
    const baselineXP = Math.max(1, Math.round(perf.slice(0, -1).reduce((a, p) => a + p.xp, 0) / Math.max(1, perf.length - 1)));
    const deviationXP = last ? Math.round(((last.xp - baselineXP) / baselineXP) * 100) : 0;
    const severityXP = Math.abs(deviationXP) > 50 ? 'high' : Math.abs(deviationXP) > 25 ? 'medium' : 'low';
    anomalies.push({ metric: 'xp', value: last?.xp || 0, baseline: baselineXP, deviation: deviationXP, severity: severityXP });
    const topFocus = [...focus].sort((a, b) => b.value - a.value)[0];
    if (topFocus && topFocus.value > Math.max(1, focus.reduce((a, f) => a + f.value, 0) * 0.7)) {
      anomalies.push({ metric: 'focus_skew', value: topFocus.value, baseline: Math.round(focus.reduce((a, f) => a + f.value, 0) / Math.max(1, focus.length)), deviation: 50, severity: 'medium' });
    }
    return anomalies;
  }

  private static predictNextWeekMetrics(user: User, performance: PerformanceDataPoint[], tasks: Task[]): PredictiveMetrics {
    const recent = performance.slice(-7);
    const avgProd = recent.length > 0 ? Math.round(recent.reduce((a, p) => a + p.productivity, 0) / recent.length) : 0;
    const avgTasks = recent.length > 0 ? Math.round(recent.reduce((a, p) => a + p.tasks, 0) / recent.length) : 0;
    const nextWeekProductivity = Math.min(100, Math.round(avgProd * 1.05));
    const expectedCompletedTasks = Math.max(0, Math.round(avgTasks * 1.1));
    const burnoutRisk = avgProd > 85 && avgTasks > 6 ? 'high' : avgProd > 75 ? 'medium' : 'low';
    return { nextWeekProductivity, expectedCompletedTasks, burnoutRisk };
  }
}
