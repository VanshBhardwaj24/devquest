import { appDataService } from './appDataService';

export interface EnhancedReward {
  id: string;
  name: string;
  description: string;
  category: 'cosmetic' | 'powerup' | 'title' | 'feature' | 'currency' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  cost: number;
  value?: number;
  duration?: number; // in minutes for temporary effects
  maxStack?: number;
  cooldown?: number; // in hours
  requirements: RewardRequirement[];
  effects: RewardEffect[];
  icon: string;
  unlocked: boolean;
  purchased: boolean;
  purchaseCount: number;
  lastPurchased?: Date;
  expiresAt?: Date;
}

export interface RewardRequirement {
  type: 'level' | 'tier' | 'achievement' | 'streak' | 'completion' | 'currency';
  value: number | string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
}

export interface RewardEffect {
  type: 'xp_multiplier' | 'unlock_speed' | 'special_feature' | 'cosmetic' | 'title' | 'currency_bonus' | 'time_reduction' | 'probability_boost';
  target: string;
  value: number;
  duration?: number;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  duration: number;
  cooldown: number;
  effects: RewardEffect[];
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  uses: number;
  maxUses: number;
  lastUsed?: Date;
}

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'avatar' | 'badge' | 'frame' | 'effect' | 'sound';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlocked: boolean;
  equipped: boolean;
  cost: number;
  icon: string;
  preview?: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  displayText: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlocked: boolean;
  equipped: boolean;
  requirements: RewardRequirement[];
  icon: string;
}

class RewardsService {
  private static instance: RewardsService;
  private rewards: EnhancedReward[] = [];
  private powerUps: PowerUp[] = [];
  private cosmetics: Cosmetic[] = [];
  private titles: Title[] = [];

  static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  constructor() {
    this.initializeRewards();
  }

  private initializeRewards(): void {
    // Initialize power-ups
    this.powerUps = [
      {
        id: 'xp_boost',
        name: 'XP Boost',
        description: 'Double XP gain for 30 minutes',
        type: 'active',
        duration: 30,
        cooldown: 24,
        effects: [
          { type: 'xp_multiplier', target: 'global', value: 2.0, duration: 30 }
        ],
        icon: 'zap',
        rarity: 'common',
        unlocked: true,
        uses: 3,
        maxUses: 3
      },
      {
        id: 'instant_complete',
        name: 'Instant Complete',
        description: 'Instantly complete one task',
        type: 'active',
        duration: 0,
        cooldown: 48,
        effects: [
          { type: 'time_reduction', target: 'task', value: 100 }
        ],
        icon: 'bolt',
        rarity: 'rare',
        unlocked: false,
        uses: 1,
        maxUses: 1
      },
      {
        id: 'skill_master',
        name: 'Skill Master',
        description: 'Instantly gain 100 XP in any skill',
        type: 'active',
        duration: 0,
        cooldown: 72,
        effects: [
          { type: 'xp_multiplier', target: 'skill', value: 100 }
        ],
        icon: 'graduation-cap',
        rarity: 'epic',
        unlocked: false,
        uses: 1,
        maxUses: 1
      },
      {
        id: 'lucky_day',
        name: 'Lucky Day',
        description: '50% chance for double rewards for 24 hours',
        type: 'passive',
        duration: 1440,
        cooldown: 168,
        effects: [
          { type: 'probability_boost', target: 'rewards', value: 0.5, duration: 1440 }
        ],
        icon: 'clover',
        rarity: 'legendary',
        unlocked: false,
        uses: 1,
        maxUses: 1
      }
    ];

    // Initialize cosmetics
    this.cosmetics = [
      {
        id: 'dark_theme',
        name: 'Dark Theme',
        description: 'Elegant dark theme for the interface',
        type: 'theme',
        rarity: 'common',
        unlocked: true,
        equipped: false,
        cost: 50,
        icon: 'moon'
      },
      {
        id: 'golden_avatar',
        name: 'Golden Avatar',
        description: 'Shiny golden avatar frame',
        type: 'avatar',
        rarity: 'rare',
        unlocked: false,
        equipped: false,
        cost: 200,
        icon: 'star'
      },
      {
        id: 'rainbow_effect',
        name: 'Rainbow Effect',
        description: 'Colorful rainbow effects on achievements',
        type: 'effect',
        rarity: 'epic',
        unlocked: false,
        equipped: false,
        cost: 500,
        icon: 'rainbow'
      },
      {
        id: 'legendary_frame',
        name: 'Legendary Frame',
        description: 'Animated legendary frame for profile',
        type: 'frame',
        rarity: 'legendary',
        unlocked: false,
        equipped: false,
        cost: 1000,
        icon: 'crown'
      }
    ];

    // Initialize titles
    this.titles = [
      {
        id: 'beginner',
        name: 'Beginner',
        description: 'Just starting the journey',
        displayText: 'Beginner',
        rarity: 'common',
        unlocked: true,
        equipped: false,
        requirements: [],
        icon: 'seedling'
      },
      {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 100 tasks',
        displayText: 'Task Master',
        rarity: 'rare',
        unlocked: false,
        equipped: false,
        requirements: [
          { type: 'completion', value: 100, operator: '>=' }
        ],
        icon: 'check-circle'
      },
      {
        id: 'skill_expert',
        name: 'Skill Expert',
        description: 'Master 5 skills',
        displayText: 'Skill Expert',
        rarity: 'epic',
        unlocked: false,
        equipped: false,
        requirements: [
          { type: 'achievement', value: 'skill_master_5', operator: '==' }
        ],
        icon: 'brain'
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Reach Mythic tier',
        displayText: 'Legend',
        rarity: 'mythic',
        unlocked: false,
        equipped: false,
        requirements: [
          { type: 'tier', value: 'Mythic', operator: '>=' }
        ],
        icon: 'crown'
      }
    ];

    // Initialize enhanced rewards
    this.rewards = [
      {
        id: 'xp_pack_small',
        name: 'Small XP Pack',
        description: 'Get 50 instant XP',
        category: 'currency',
        rarity: 'common',
        cost: 25,
        value: 50,
        requirements: [],
        effects: [
          { type: 'currency_bonus', target: 'xp', value: 50 }
        ],
        icon: 'package',
        unlocked: true,
        purchased: false,
        purchaseCount: 0
      },
      {
        id: 'xp_pack_large',
        name: 'Large XP Pack',
        description: 'Get 200 instant XP',
        category: 'currency',
        rarity: 'rare',
        cost: 75,
        value: 200,
        requirements: [
          { type: 'level', value: 5, operator: '>=' }
        ],
        effects: [
          { type: 'currency_bonus', target: 'xp', value: 200 }
        ],
        icon: 'gift',
        unlocked: false,
        purchased: false,
        purchaseCount: 0
      },
      {
        id: 'speed_boost',
        name: 'Speed Boost',
        description: '50% faster unlocking for 1 hour',
        category: 'boost',
        rarity: 'rare',
        cost: 100,
        duration: 60,
        requirements: [
          { type: 'level', value: 3, operator: '>=' }
        ],
        effects: [
          { type: 'unlock_speed', target: 'global', value: 1.5, duration: 60 }
        ],
        icon: 'wind',
        unlocked: false,
        purchased: false,
        purchaseCount: 0
      },
      {
        id: 'mystery_box',
        name: 'Mystery Box',
        description: 'Random reward from any category',
        category: 'feature',
        rarity: 'epic',
        cost: 300,
        requirements: [
          { type: 'level', value: 10, operator: '>=' }
        ],
        effects: [
          { type: 'special_feature', target: 'random', value: 1 }
        ],
        icon: 'box',
        unlocked: false,
        purchased: false,
        purchaseCount: 0
      }
    ];
  }

  async getAvailableRewards(userId: string): Promise<EnhancedReward[]> {
    try {
      const userProgress = await this.getUserProgress(userId);
      return this.rewards.filter(reward => 
        this.isRewardAvailable(reward, userProgress)
      );
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  async getPowerUps(userId: string): Promise<PowerUp[]> {
    try {
      const userProgress = await this.getUserProgress(userId);
      return this.powerUps.filter(powerUp => 
        this.isRewardAvailable(powerUp, userProgress)
      );
    } catch (error) {
      console.error('Error getting power-ups:', error);
      return [];
    }
  }

  async getCosmetics(userId: string): Promise<Cosmetic[]> {
    try {
      const userProgress = await this.getUserProgress(userId);
      return this.cosmetics.filter(cosmetic => 
        this.isRewardAvailable(cosmetic, userProgress)
      );
    } catch (error) {
      console.error('Error getting cosmetics:', error);
      return [];
    }
  }

  async getTitles(userId: string): Promise<Title[]> {
    try {
      const userProgress = await this.getUserProgress(userId);
      return this.titles.filter(title => 
        this.isRewardAvailable(title, userProgress)
      );
    } catch (error) {
      console.error('Error getting titles:', error);
      return [];
    }
  }

  private async getUserProgress(userId: string): Promise<any> {
    // This would get user progress from the progression service
    // For now, return a basic structure
    return {
      level: 1,
      tier: 'Bronze',
      achievements: [],
      streak: 0,
      currency: 0
    };
  }

  private isRewardAvailable(
    reward: EnhancedReward | PowerUp | Cosmetic | Title,
    userProgress: any
  ): boolean {
    if ('unlocked' in reward && !reward.unlocked) {
      return false;
    }

    if (!reward.requirements || reward.requirements.length === 0) {
      return true;
    }

    return reward.requirements.every(req => 
      this.checkRequirement(req, userProgress)
    );
  }

  private checkRequirement(requirement: RewardRequirement, userProgress: any): boolean {
    const { type, value, operator } = requirement;
    let userValue: any;

    switch (type) {
      case 'level':
        userValue = userProgress.level;
        break;
      case 'tier':
        userValue = userProgress.tier;
        break;
      case 'achievement':
        userValue = userProgress.achievements.includes(value);
        break;
      case 'streak':
        userValue = userProgress.streak;
        break;
      case 'currency':
        userValue = userProgress.currency;
        break;
      default:
        return false;
    }

    switch (operator) {
      case '>':
        return userValue > value;
      case '<':
        return userValue < value;
      case '>=':
        return userValue >= value;
      case '<=':
        return userValue <= value;
      case '==':
        return userValue === value;
      case '!=':
        return userValue !== value;
      default:
        return false;
    }
  }

  async purchaseReward(userId: string, rewardId: string): Promise<boolean> {
    try {
      const reward = this.rewards.find(r => r.id === rewardId);
      if (!reward) {
        throw new Error('Reward not found');
      }

      const userProgress = await this.getUserProgress(userId);
      
      if (!this.isRewardAvailable(reward, userProgress)) {
        throw new Error('Reward not available');
      }

      if (userProgress.currency < reward.cost) {
        throw new Error('Insufficient currency');
      }

      // Check cooldown
      if (reward.cooldown && reward.lastPurchased) {
        const cooldownEnd = new Date(reward.lastPurchased.getTime() + reward.cooldown * 60 * 60 * 1000);
        if (new Date() < cooldownEnd) {
          throw new Error('Reward is on cooldown');
        }
      }

      // Purchase reward
      reward.purchased = true;
      reward.purchaseCount++;
      reward.lastPurchased = new Date();

      if (reward.duration) {
        reward.expiresAt = new Date(Date.now() + reward.duration * 60 * 1000);
      }

      // Apply effects
      await this.applyRewardEffects(userId, reward.effects);

      // Deduct cost
      await this.deductCurrency(userId, reward.cost);

      // Save changes
      await this.saveUserRewards(userId, { rewards: this.rewards });

      return true;
    } catch (error) {
      console.error('Error purchasing reward:', error);
      return false;
    }
  }

  async usePowerUp(userId: string, powerUpId: string): Promise<boolean> {
    try {
      const powerUp = this.powerUps.find(p => p.id === powerUpId);
      if (!powerUp) {
        throw new Error('Power-up not found');
      }

      if (powerUp.uses <= 0) {
        throw new Error('No uses remaining');
      }

      // Check cooldown
      if (powerUp.lastUsed) {
        const cooldownEnd = new Date(powerUp.lastUsed.getTime() + powerUp.cooldown * 60 * 60 * 1000);
        if (new Date() < cooldownEnd) {
          throw new Error('Power-up is on cooldown');
        }
      }

      // Use power-up
      powerUp.uses--;
      powerUp.lastUsed = new Date();

      // Apply effects
      await this.applyRewardEffects(userId, powerUp.effects);

      // Save changes
      await this.saveUserRewards(userId, { powerUps: this.powerUps });

      return true;
    } catch (error) {
      console.error('Error using power-up:', error);
      return false;
    }
  }

  async equipCosmetic(userId: string, cosmeticId: string): Promise<boolean> {
    try {
      const cosmetic = this.cosmetics.find(c => c.id === cosmeticId);
      if (!cosmetic) {
        throw new Error('Cosmetic not found');
      }

      if (!cosmetic.unlocked) {
        throw new Error('Cosmetic not unlocked');
      }

      // Unequip other cosmetics of the same type
      this.cosmetics.forEach(c => {
        if (c.type === cosmetic.type) {
          c.equipped = false;
        }
      });

      // Equip the selected cosmetic
      cosmetic.equipped = true;

      // Save changes
      await this.saveUserRewards(userId, { cosmetics: this.cosmetics });

      return true;
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      return false;
    }
  }

  async equipTitle(userId: string, titleId: string): Promise<boolean> {
    try {
      const title = this.titles.find(t => t.id === titleId);
      if (!title) {
        throw new Error('Title not found');
      }

      if (!title.unlocked) {
        throw new Error('Title not unlocked');
      }

      // Unequip other titles
      this.titles.forEach(t => t.equipped = false);

      // Equip the selected title
      title.equipped = true;

      // Save changes
      await this.saveUserRewards(userId, { titles: this.titles });

      return true;
    } catch (error) {
      console.error('Error equipping title:', error);
      return false;
    }
  }

  private async applyRewardEffects(userId: string, effects: RewardEffect[]): Promise<void> {
    // This would apply the effects to the user's progress
    // Implementation depends on the specific effect types
    for (const effect of effects) {
      switch (effect.type) {
        case 'xp_multiplier':
          // Apply XP multiplier
          break;
        case 'unlock_speed':
          // Apply unlock speed boost
          break;
        case 'currency_bonus':
          // Add currency
          await this.addCurrency(userId, effect.value);
          break;
        case 'special_feature':
          // Unlock special feature
          break;
        // Add other effect types as needed
      }
    }
  }

  private async addCurrency(userId: string, amount: number): Promise<void> {
    // Implementation to add currency to user
  }

  private async deductCurrency(userId: string, amount: number): Promise<void> {
    // Implementation to deduct currency from user
  }

  private async saveUserRewards(userId: string, rewards: any): Promise<void> {
    // Implementation to save user's reward states
  }

  async getMysteryBoxReward(userId: string): Promise<EnhancedReward | null> {
    try {
      const availableRewards = await this.getAvailableRewards(userId);
      const rareRewards = availableRewards.filter(r => 
        r.rarity === 'rare' || r.rarity === 'epic' || r.rarity === 'legendary'
      );

      if (rareRewards.length === 0) {
        return null;
      }

      // Random selection with weighted probability
      const weights = {
        rare: 70,
        epic: 25,
        legendary: 5
      };

      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;

      for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
          const rewardsOfRarity = rareRewards.filter(r => r.rarity === rarity);
          return rewardsOfRarity[Math.floor(Math.random() * rewardsOfRarity.length)];
        }
      }

      return rareRewards[0];
    } catch (error) {
      console.error('Error getting mystery box reward:', error);
      return null;
    }
  }
}

export const rewardsService = RewardsService.getInstance();
