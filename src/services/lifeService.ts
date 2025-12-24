
export interface WorkoutSession {
  id: string;
  type: string;
  duration: number; // minutes
  xpEarned: number;
  date: string; // ISO string
  intensity: 'Light' | 'Moderate' | 'Intense';
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings' | 'investment';
  category: string;
  amount: number;
  description: string;
  date: string; // ISO string
  xpEarned: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  icon: string;
}

export interface LifeData {
  fitness: WorkoutSession[];
  finance: {
    transactions: Transaction[];
    goals: SavingsGoal[];
  };
}

export class LifeService {
  private static readonly STORAGE_KEY = 'life_data_v1';

  static async getFitnessData(): Promise<WorkoutSession[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    return data.fitness;
  }

  static async saveWorkout(workout: WorkoutSession): Promise<WorkoutSession[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    data.fitness.unshift(workout);
    this.saveLocalData(data);
    return data.fitness;
  }

  static async deleteWorkout(id: string): Promise<WorkoutSession[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    data.fitness = data.fitness.filter(w => w.id !== id);
    this.saveLocalData(data);
    return data.fitness;
  }

  static async getFinanceData(): Promise<{ transactions: Transaction[]; goals: SavingsGoal[] }> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    return data.finance;
  }

  static async saveTransaction(transaction: Transaction): Promise<Transaction[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    data.finance.transactions.unshift(transaction);
    this.saveLocalData(data);
    return data.finance.transactions;
  }

  static async saveGoal(goal: SavingsGoal): Promise<SavingsGoal[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    data.finance.goals.push(goal);
    this.saveLocalData(data);
    return data.finance.goals;
  }
  
  static async updateGoal(updatedGoal: SavingsGoal): Promise<SavingsGoal[]> {
    await this.simulateNetwork();
    const data = this.getLocalData();
    data.finance.goals = data.finance.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    this.saveLocalData(data);
    return data.finance.goals;
  }

  private static getLocalData(): LifeData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default / Initial Data
    return {
      fitness: [],
      finance: {
        transactions: [],
        goals: [
            { id: '1', name: 'Emergency Fund', target: 100000, current: 25000, icon: '🆘' },
            { id: '2', name: 'Investment Portfolio', target: 500000, current: 75000, icon: '📊' },
            { id: '3', name: 'Dream Vacation', target: 50000, current: 15000, icon: '✈️' },
        ],
      },
    };
  }

  private static saveLocalData(data: LifeData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private static async simulateNetwork(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
    if (Math.random() < 0.05) {
      throw new Error('Sync failed. Please try again.');
    }
  }
}
