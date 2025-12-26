import { appDataService } from './appDataService';

export interface UnifiedProgress {
  totalLevel: number;
  totalXp: number;
  componentXp: {
    tasks: number;
    skills: number;
    lifeMap: number;
    bucketList: number;
    networking: number;
    mindfulness: number;
  };
  masteryTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic' | 'Legend';
  tierProgress: number;
  globalBonuses: {
    xpMultiplier: number;
    unlockSpeed: number;
    specialFeatures: string[];
  };
}

export interface CrossComponentBonus {
  id: string;
  name: string;
  description: string;
  requirement: {
    component: string;
    threshold: number;
    type: 'level' | 'xp' | 'completion';
  };
  reward: {
    targetComponent: string;
    bonus: string;
    value: number;
  };
  unlocked: boolean;
}

export interface AchievementChain {
  id: string;
  name: string;
  description: string;
  steps: AchievementStep[];
  currentStep: number;
  completed: boolean;
  rewards: {
    xp: number;
    title: string;
    cosmetic?: string;
    feature?: string;
  };
}

export interface AchievementStep {
  id: string;
  description: string;
  requirement: string;
  completed: boolean;
  completedAt?: Date;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  challenges: EventChallenge[];
  rewards: EventReward[];
  isActive: boolean;
}

export interface EventChallenge {
  id: string;
  name: string;
  description: string;
  component: string;
  requirement: string;
  progress: number;
  target: number;
  completed: boolean;
  points: number;
}

export interface EventReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'cosmetic' | 'powerup' | 'title' | 'feature';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

class ProgressionService {
  private static instance: ProgressionService;

  static getInstance(): ProgressionService {
    if (!ProgressionService.instance) {
      ProgressionService.instance = new ProgressionService();
    }
    return ProgressionService.instance;
  }

  async getUnifiedProgress(userId: string): Promise<UnifiedProgress> {
    try {
      const appData = await appDataService.getAppData(userId);
      const saved = appData?.unifiedProgress;

      if (saved) {
        return saved;
      }

      // Initialize unified progress
      const initialProgress: UnifiedProgress = {
        totalLevel: 1,
        totalXp: 0,
        componentXp: {
          tasks: 0,
          skills: 0,
          lifeMap: 0,
          bucketList: 0,
          networking: 0,
          mindfulness: 0
        },
        masteryTier: 'Bronze',
        tierProgress: 0,
        globalBonuses: {
          xpMultiplier: 1.0,
          unlockSpeed: 1.0,
          specialFeatures: []
        }
      };

      await this.saveUnifiedProgress(userId, initialProgress);
      return initialProgress;
    } catch (error) {
      console.error('Error getting unified progress:', error);
      throw error;
    }
  }

  async saveUnifiedProgress(userId: string, progress: UnifiedProgress): Promise<void> {
    try {
      await appDataService.updateAppDataField(userId, 'unifiedProgress', progress);
    } catch (error) {
      console.error('Error saving unified progress:', error);
      throw error;
    }
  }

  async addXp(userId: string, component: keyof UnifiedProgress['componentXp'], amount: number): Promise<UnifiedProgress> {
    try {
      const progress = await this.getUnifiedProgress(userId);
      
      // Apply global bonuses
      const finalAmount = Math.floor(amount * progress.globalBonuses.xpMultiplier);
      
      progress.componentXp[component] += finalAmount;
      progress.totalXp += finalAmount;

      // Check for level up
      const newLevel = this.calculateLevel(progress.totalXp);
      if (newLevel > progress.totalLevel) {
        progress.totalLevel = newLevel;
        await this.checkTierProgression(progress);
        await this.unlockCrossComponentBonuses(userId, progress);
      }

      await this.saveUnifiedProgress(userId, progress);
      return progress;
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  }

  private calculateLevel(totalXp: number): number {
    // Level formula: 100 * level^1.5 XP required
    let level = 1;
    while (totalXp >= this.getXpForLevel(level + 1)) {
      level++;
    }
    return level;
  }

  private getXpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  private async checkTierProgression(progress: UnifiedProgress): Promise<void> {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Mythic', 'Legend'] as const;
    const levelThresholds = [1, 10, 25, 50, 100, 200];
    
    for (let i = 0; i < tiers.length; i++) {
      if (progress.totalLevel >= levelThresholds[i]) {
        progress.masteryTier = tiers[i];
        progress.tierProgress = ((progress.totalLevel - levelThresholds[i]) / 
          (levelThresholds[Math.min(i + 1, levelThresholds.length - 1)] - levelThresholds[i])) * 100;
        
        // Update global bonuses based on tier
        progress.globalBonuses = this.getTierBonuses(tiers[i]);
      }
    }
  }

  private getTierBonuses(tier: UnifiedProgress['masteryTier']): UnifiedProgress['globalBonuses'] {
    const bonuses = {
      Bronze: { xpMultiplier: 1.0, unlockSpeed: 1.0, specialFeatures: [] },
      Silver: { xpMultiplier: 1.1, unlockSpeed: 1.2, specialFeatures: ['daily_bonus'] },
      Gold: { xpMultiplier: 1.25, unlockSpeed: 1.5, specialFeatures: ['daily_bonus', 'weekly_challenges'] },
      Platinum: { xpMultiplier: 1.5, unlockSpeed: 2.0, specialFeatures: ['daily_bonus', 'weekly_challenges', 'seasonal_events'] },
      Mythic: { xpMultiplier: 2.0, unlockSpeed: 3.0, specialFeatures: ['daily_bonus', 'weekly_challenges', 'seasonal_events', 'exclusive_rewards'] },
      Legend: { xpMultiplier: 3.0, unlockSpeed: 5.0, specialFeatures: ['daily_bonus', 'weekly_challenges', 'seasonal_events', 'exclusive_rewards', 'cosmetic_customization'] }
    };
    
    return bonuses[tier];
  }

  private async unlockCrossComponentBonuses(userId: string, progress: UnifiedProgress): Promise<void> {
    const bonuses = this.getCrossComponentBonuses();
    
    for (const bonus of bonuses) {
      if (!bonus.unlocked && this.checkBonusRequirement(bonus, progress)) {
        bonus.unlocked = true;
        await this.saveCrossComponentBonuses(userId, bonuses);
      }
    }
  }

  private getCrossComponentBonuses(): CrossComponentBonus[] {
    return [
      {
        id: 'skill_task_synergy',
        name: 'Skill-Task Synergy',
        description: 'Skills boost task completion rewards',
        requirement: { component: 'skills', threshold: 5, type: 'level' },
        reward: { targetComponent: 'tasks', bonus: 'xp_multiplier', value: 0.2 },
        unlocked: false
      },
      {
        id: 'life_goal_focus',
        name: 'Life Goal Focus',
        description: 'LifeMap goals increase skill XP',
        requirement: { component: 'lifeMap', threshold: 3, type: 'completion' },
        reward: { targetComponent: 'skills', bonus: 'xp_multiplier', value: 0.15 },
        unlocked: false
      },
      {
        id: 'network_opportunities',
        name: 'Network Opportunities',
        description: 'Contacts unlock special tasks',
        requirement: { component: 'networking', threshold: 10, type: 'completion' },
        reward: { targetComponent: 'tasks', bonus: 'special_tasks', value: 1 },
        unlocked: false
      },
      {
        id: 'bucket_dreams',
        name: 'Bucket Dreams',
        description: 'BucketList items grant global XP',
        requirement: { component: 'bucketList', threshold: 5, type: 'completion' },
        reward: { targetComponent: 'global', bonus: 'xp_bonus', value: 50 },
        unlocked: false
      }
    ];
  }

  private checkBonusRequirement(bonus: CrossComponentBonus, progress: UnifiedProgress): boolean {
    const { component, threshold, type } = bonus.requirement;
    
    if (type === 'level') {
      return progress.totalLevel >= threshold;
    } else if (type === 'xp') {
      return progress.componentXp[component as keyof typeof progress.componentXp] >= threshold;
    } else if (type === 'completion') {
      // This would need to be implemented based on actual completion tracking
      return false;
    }
    
    return false;
  }

  async getCrossComponentBonuses(userId: string): Promise<CrossComponentBonus[]> {
    try {
      const appData = await appDataService.getAppData(userId);
      return appData?.crossComponentBonuses || this.getCrossComponentBonuses();
    } catch (error) {
      console.error('Error getting cross-component bonuses:', error);
      return this.getCrossComponentBonuses();
    }
  }

  async saveCrossComponentBonuses(userId: string, bonuses: CrossComponentBonus[]): Promise<void> {
    try {
      await appDataService.updateAppDataField(userId, 'crossComponentBonuses', bonuses);
    } catch (error) {
      console.error('Error saving cross-component bonuses:', error);
      throw error;
    }
  }

  async getAchievementChains(userId: string): Promise<AchievementChain[]> {
    try {
      const appData = await appDataService.getAppData(userId);
      return appData?.achievementChains || this.getDefaultAchievementChains();
    } catch (error) {
      console.error('Error getting achievement chains:', error);
      return this.getDefaultAchievementChains();
    }
  }

  private getDefaultAchievementChains(): AchievementChain[] {
    return [
      {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete tasks consistently to unlock mastery',
        steps: [
          { id: '1', description: 'Complete 10 tasks', requirement: 'tasks_completed >= 10', completed: false },
          { id: '2', description: 'Complete 50 tasks', requirement: 'tasks_completed >= 50', completed: false },
          { id: '3', description: 'Complete 100 tasks', requirement: 'tasks_completed >= 100', completed: false },
          { id: '4', description: 'Complete 500 tasks', requirement: 'tasks_completed >= 500', completed: false },
          { id: '5', description: 'Complete 1000 tasks', requirement: 'tasks_completed >= 1000', completed: false }
        ],
        currentStep: 0,
        completed: false,
        rewards: { xp: 1000, title: 'Task Master', cosmetic: 'golden_task_icon' }
      },
      {
        id: 'skill_expert',
        name: 'Skill Expert',
        description: 'Master skills across different categories',
        steps: [
          { id: '1', description: 'Reach level 5 in any skill', requirement: 'skill_level >= 5', completed: false },
          { id: '2', description: 'Reach level 10 in any skill', requirement: 'skill_level >= 10', completed: false },
          { id: '3', description: 'Master 3 different skills', requirement: 'mastered_skills >= 3', completed: false },
          { id: '4', description: 'Master 5 different skills', requirement: 'mastered_skills >= 5', completed: false },
          { id: '5', description: 'Reach max level in any skill', requirement: 'max_level_skill', completed: false }
        ],
        currentStep: 0,
        completed: false,
        rewards: { xp: 1500, title: 'Skill Expert', feature: 'skill_customization' }
      }
    ];
  }

  async updateAchievementChain(userId: string, chainId: string, progress: any): Promise<void> {
    try {
      const chains = await this.getAchievementChains(userId);
      const chain = chains.find(c => c.id === chainId);
      
      if (!chain) return;

      // Update progress based on the provided data
      for (let i = 0; i < chain.steps.length; i++) {
        const step = chain.steps[i];
        if (!step.completed && this.evaluateRequirement(step.requirement, progress)) {
          step.completed = true;
          step.completedAt = new Date();
          
          if (i === chain.currentStep) {
            chain.currentStep++;
            
            // Award step completion rewards
            if (chain.currentStep === chain.steps.length) {
              chain.completed = true;
              // Award full chain completion rewards
            }
          }
        }
      }

      await appDataService.updateAppDataField(userId, 'achievementChains', chains);
    } catch (error) {
      console.error('Error updating achievement chain:', error);
      throw error;
    }
  }

  private evaluateRequirement(requirement: string, progress: any): boolean {
    // Simple requirement evaluation - can be expanded
    const [key, operator, value] = requirement.split(' ');
    const progressValue = this.getProgressValue(key, progress);
    
    switch (operator) {
      case '>=':
        return progressValue >= parseInt(value);
      case '>':
        return progressValue > parseInt(value);
      case '==':
        return progressValue === parseInt(value);
      default:
        return false;
    }
  }

  private getProgressValue(key: string, progress: any): number {
    // Extract progress values based on key
    if (key === 'tasks_completed') return progress.tasksCompleted || 0;
    if (key === 'skill_level') return progress.skillLevel || 0;
    if (key === 'mastered_skills') return progress.masteredSkills || 0;
    if (key === 'max_level_skill') return progress.maxLevelSkill ? 1 : 0;
    return 0;
  }
}

export const progressionService = ProgressionService.getInstance();
