export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'xp_boost' | 'streak_shield' | 'double_coins' | 'time_freeze' | 'lucky_drop' | 'energy_boost' | 'focus_mode' | 'speed_boost' | 'combo_multiplier' | 'instant_reward' | 'streak_multiplier' | 'task_boost' | 'coding_boost' | 'social_boost' | 'learning_boost' | 'fitness_boost' | 'finance_boost' | 'time_warp' | 'perfect_streak' | 'legendary_boost' | 'internship_boost' | 'network_boost' | 'portfolio_boost' | 'interview_boost' | 'business_boost' | 'accountability_boost' | 'application_boost' | 'referral_boost' | 'skill_boost' | 'productivity_boost';
  duration: number; // in minutes
  multiplier?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  cost: number;
  unlockCondition: {
    type: 'level' | 'streak' | 'tasks' | 'xp' | 'achievement' | 'none';
    value: number;
    description: string;
  };
  visualEffect?: string;
  category: 'combat' | 'utility' | 'economic' | 'defensive' | 'offensive' | 'career' | 'accountability' | 'networking' | 'business';
}

export const ALL_POWER_UPS: PowerUp[] = [
  // COMMON POWER-UPS
  {
    id: 'pu-1',
    name: 'XP Surge',
    description: 'Double all XP earned for 30 minutes',
    icon: '⚡',
    type: 'xp_boost',
    duration: 30,
    multiplier: 2.0,
    rarity: 'common',
    cost: 500,
    unlockCondition: { type: 'streak', value: 3, description: '3-day streak' },
    visualEffect: 'electric',
    category: 'offensive'
  },
  {
    id: 'pu-2',
    name: 'Focus Mode',
    description: 'Block distractions and gain 25% more XP',
    icon: '🎯',
    type: 'focus_mode',
    duration: 45,
    multiplier: 1.25,
    rarity: 'common',
    cost: 250,
    unlockCondition: { type: 'level', value: 1, description: 'Available from start' },
    visualEffect: 'glow',
    category: 'utility'
  },
  {
    id: 'pu-3',
    name: 'Energy Drink',
    description: 'Instant +100 XP boost',
    icon: '🥤',
    type: 'instant_reward',
    duration: 0,
    multiplier: 1,
    rarity: 'common',
    cost: 100,
    unlockCondition: { type: 'none', value: 0, description: 'Always available' },
    visualEffect: 'sparkle',
    category: 'utility'
  },
  {
    id: 'pu-4',
    name: 'Speed Boost',
    description: 'Complete tasks 50% faster for 1 hour',
    icon: '🚀',
    type: 'speed_boost',
    duration: 60,
    multiplier: 1.5,
    rarity: 'common',
    cost: 300,
    unlockCondition: { type: 'tasks', value: 5, description: 'Complete 5 tasks' },
    visualEffect: 'speed',
    category: 'utility'
  },
  {
    id: 'pu-5',
    name: 'Task Master',
    description: 'Tasks give 2x XP for 2 hours',
    icon: '✅',
    type: 'task_boost',
    duration: 120,
    multiplier: 2.0,
    rarity: 'common',
    cost: 400,
    unlockCondition: { type: 'tasks', value: 10, description: 'Complete 10 tasks' },
    visualEffect: 'checkmark',
    category: 'offensive'
  },

  // RARE POWER-UPS
  {
    id: 'pu-6',
    name: 'Streak Shield',
    description: 'Protect your streak for 24 hours if you miss a day',
    icon: '🛡️',
    type: 'streak_shield',
    duration: 1440,
    multiplier: 1,
    rarity: 'rare',
    cost: 1000,
    unlockCondition: { type: 'streak', value: 7, description: '7-day streak' },
    visualEffect: 'shield',
    category: 'defensive'
  },
  {
    id: 'pu-7',
    name: 'Coin Doubler',
    description: 'Earn 2x coins from all activities',
    icon: '💰',
    type: 'double_coins',
    duration: 60,
    multiplier: 2.0,
    rarity: 'rare',
    cost: 750,
    unlockCondition: { type: 'tasks', value: 20, description: 'Complete 20 tasks' },
    visualEffect: 'coins',
    category: 'economic'
  },
  {
    id: 'pu-8',
    name: 'Coding Mastery',
    description: 'Coding problems give 3x XP for 1 hour',
    icon: '💻',
    type: 'coding_boost',
    duration: 60,
    multiplier: 3.0,
    rarity: 'rare',
    cost: 600,
    unlockCondition: { type: 'level', value: 5, description: 'Reach level 5' },
    visualEffect: 'code',
    category: 'offensive'
  },
  {
    id: 'pu-9',
    name: 'Combo Multiplier',
    description: 'Chain completions for 2.5x XP (stacks with streak)',
    icon: '🔥',
    type: 'combo_multiplier',
    duration: 90,
    multiplier: 2.5,
    rarity: 'rare',
    cost: 800,
    unlockCondition: { type: 'streak', value: 5, description: '5-day streak' },
    visualEffect: 'combo',
    category: 'offensive'
  },
  {
    id: 'pu-10',
    name: 'Learning Accelerator',
    description: 'Learning activities give 2.5x XP',
    icon: '📚',
    type: 'learning_boost',
    duration: 120,
    multiplier: 2.5,
    rarity: 'rare',
    cost: 700,
    unlockCondition: { type: 'level', value: 3, description: 'Reach level 3' },
    visualEffect: 'book',
    category: 'offensive'
  },
  {
    id: 'pu-11',
    name: 'Time Freeze',
    description: 'Freeze daily reset timer for 6 hours',
    icon: '⏸️',
    type: 'time_freeze',
    duration: 360,
    multiplier: 1,
    rarity: 'rare',
    cost: 1200,
    unlockCondition: { type: 'level', value: 8, description: 'Reach level 8' },
    visualEffect: 'freeze',
    category: 'utility'
  },
  {
    id: 'pu-12',
    name: 'Energy Boost',
    description: 'Restore 50% energy instantly',
    icon: '⚡',
    type: 'energy_boost',
    duration: 0,
    multiplier: 1,
    rarity: 'rare',
    cost: 500,
    unlockCondition: { type: 'level', value: 4, description: 'Reach level 4' },
    visualEffect: 'energy',
    category: 'utility'
  },

  // EPIC POWER-UPS
  {
    id: 'pu-13',
    name: 'Lucky Charm',
    description: 'Increases rare drop chances by 50%',
    icon: '🍀',
    type: 'lucky_drop',
    duration: 120,
    multiplier: 1.5,
    rarity: 'epic',
    cost: 2000,
    unlockCondition: { type: 'level', value: 10, description: 'Reach level 10' },
    visualEffect: 'luck',
    category: 'utility'
  },
  {
    id: 'pu-14',
    name: 'Streak Multiplier',
    description: 'Your streak bonus is doubled for 24 hours',
    icon: '🔥',
    type: 'streak_multiplier',
    duration: 1440,
    multiplier: 2.0,
    rarity: 'epic',
    cost: 1500,
    unlockCondition: { type: 'streak', value: 14, description: '14-day streak' },
    visualEffect: 'flame',
    category: 'offensive'
  },
  {
    id: 'pu-15',
    name: 'Fitness Warrior',
    description: 'Fitness activities give 3x XP',
    icon: '💪',
    type: 'fitness_boost',
    duration: 180,
    multiplier: 3.0,
    rarity: 'epic',
    cost: 1000,
    unlockCondition: { type: 'level', value: 7, description: 'Reach level 7' },
    visualEffect: 'fitness',
    category: 'offensive'
  },
  {
    id: 'pu-16',
    name: 'Social Butterfly',
    description: 'Social activities give 2.5x XP',
    icon: '👥',
    type: 'social_boost',
    duration: 120,
    multiplier: 2.5,
    rarity: 'epic',
    cost: 900,
    unlockCondition: { type: 'level', value: 6, description: 'Reach level 6' },
    visualEffect: 'social',
    category: 'offensive'
  },
  {
    id: 'pu-17',
    name: 'Finance Guru',
    description: 'Finance tracking gives 2x XP',
    icon: '💵',
    type: 'finance_boost',
    duration: 240,
    multiplier: 2.0,
    rarity: 'epic',
    cost: 1100,
    unlockCondition: { type: 'level', value: 9, description: 'Reach level 9' },
    visualEffect: 'money',
    category: 'economic'
  },
  {
    id: 'pu-18',
    name: 'Time Warp',
    description: 'Extend day by 4 hours, all activities count',
    icon: '⏰',
    type: 'time_warp',
    duration: 240,
    multiplier: 1,
    rarity: 'epic',
    cost: 1800,
    unlockCondition: { type: 'level', value: 12, description: 'Reach level 12' },
    visualEffect: 'warp',
    category: 'utility'
  },

  // LEGENDARY POWER-UPS
  {
    id: 'pu-19',
    name: 'Perfect Streak',
    description: 'Next 7 days count as perfect streak (no penalties)',
    icon: '⭐',
    type: 'perfect_streak',
    duration: 10080,
    multiplier: 1,
    rarity: 'legendary',
    cost: 3000,
    unlockCondition: { type: 'streak', value: 21, description: '21-day streak' },
    visualEffect: 'perfect',
    category: 'defensive'
  },
  {
    id: 'pu-20',
    name: 'Legendary Boost',
    description: 'ALL activities give 5x XP for 1 hour',
    icon: '👑',
    type: 'legendary_boost',
    duration: 60,
    multiplier: 5.0,
    rarity: 'legendary',
    cost: 5000,
    unlockCondition: { type: 'level', value: 20, description: 'Reach level 20' },
    visualEffect: 'legendary',
    category: 'offensive'
  },
  {
    id: 'pu-21',
    name: 'Mega XP Surge',
    description: '10x XP for 30 minutes (once per week)',
    icon: '💥',
    type: 'xp_boost',
    duration: 30,
    multiplier: 10.0,
    rarity: 'legendary',
    cost: 4000,
    unlockCondition: { type: 'level', value: 15, description: 'Reach level 15' },
    visualEffect: 'mega',
    category: 'offensive'
  },
  {
    id: 'pu-22',
    name: 'Immortal Shield',
    description: 'Protect streak for 7 days, no matter what',
    icon: '🛡️',
    type: 'streak_shield',
    duration: 10080,
    multiplier: 1,
    rarity: 'legendary',
    cost: 6000,
    unlockCondition: { type: 'streak', value: 30, description: '30-day streak' },
    visualEffect: 'immortal',
    category: 'defensive'
  },

  // MORE COMMON POWER-UPS - Real Life Focused
  {
    id: 'pu-25',
    name: 'Morning Momentum',
    description: 'Early morning tasks give 1.5x XP (before 9 AM)',
    icon: '🌅',
    type: 'productivity_boost',
    duration: 180,
    multiplier: 1.5,
    rarity: 'common',
    cost: 350,
    unlockCondition: { type: 'streak', value: 2, description: '2-day streak' },
    visualEffect: 'sunrise',
    category: 'utility'
  },
  {
    id: 'pu-26',
    name: 'Accountability Partner',
    description: 'Share progress publicly, get 1.3x XP bonus',
    icon: '🤝',
    type: 'accountability_boost',
    duration: 1440,
    multiplier: 1.3,
    rarity: 'common',
    cost: 450,
    unlockCondition: { type: 'level', value: 2, description: 'Reach level 2' },
    visualEffect: 'partner',
    category: 'accountability'
  },
  {
    id: 'pu-27',
    name: 'Resume Builder',
    description: 'Resume/portfolio work gives 2x XP for 2 hours',
    icon: '📄',
    type: 'portfolio_boost',
    duration: 120,
    multiplier: 2.0,
    rarity: 'common',
    cost: 500,
    unlockCondition: { type: 'tasks', value: 15, description: 'Complete 15 tasks' },
    visualEffect: 'resume',
    category: 'career'
  },
  {
    id: 'pu-28',
    name: 'Network Starter',
    description: 'Networking activities give 1.8x XP',
    icon: '🤝',
    type: 'network_boost',
    duration: 90,
    multiplier: 1.8,
    rarity: 'common',
    cost: 400,
    unlockCondition: { type: 'level', value: 3, description: 'Reach level 3' },
    visualEffect: 'network',
    category: 'networking'
  },
  {
    id: 'pu-29',
    name: 'Application Focus',
    description: 'Job/internship applications give 2.5x XP',
    icon: '📧',
    type: 'application_boost',
    duration: 60,
    multiplier: 2.5,
    rarity: 'common',
    cost: 550,
    unlockCondition: { type: 'tasks', value: 25, description: 'Complete 25 tasks' },
    visualEffect: 'application',
    category: 'career'
  },
  {
    id: 'pu-30',
    name: 'Skill Accelerator',
    description: 'Learning new skills gives 2x XP',
    icon: '🎓',
    type: 'skill_boost',
    duration: 120,
    multiplier: 2.0,
    rarity: 'common',
    cost: 450,
    unlockCondition: { type: 'level', value: 4, description: 'Reach level 4' },
    visualEffect: 'skill',
    category: 'career'
  },

  // MORE RARE POWER-UPS - Career Focused
  {
    id: 'pu-31',
    name: 'Internship Hunter',
    description: 'Internship-related tasks give 3x XP for 2 hours',
    icon: '🎯',
    type: 'internship_boost',
    duration: 120,
    multiplier: 3.0,
    rarity: 'rare',
    cost: 1200,
    unlockCondition: { type: 'level', value: 6, description: 'Reach level 6' },
    visualEffect: 'internship',
    category: 'career'
  },
  {
    id: 'pu-32',
    name: 'Interview Master',
    description: 'Interview prep gives 3.5x XP for 1 hour',
    icon: '🎤',
    type: 'interview_boost',
    duration: 60,
    multiplier: 3.5,
    rarity: 'rare',
    cost: 1500,
    unlockCondition: { type: 'level', value: 8, description: 'Reach level 8' },
    visualEffect: 'interview',
    category: 'career'
  },
  {
    id: 'pu-33',
    name: 'Portfolio Power',
    description: 'Portfolio projects give 3x XP',
    icon: '💼',
    type: 'portfolio_boost',
    duration: 180,
    multiplier: 3.0,
    rarity: 'rare',
    cost: 1100,
    unlockCondition: { type: 'tasks', value: 30, description: 'Complete 30 tasks' },
    visualEffect: 'portfolio',
    category: 'career'
  },
  {
    id: 'pu-34',
    name: 'Network Amplifier',
    description: 'Networking events give 2.5x XP',
    icon: '🌐',
    type: 'network_boost',
    duration: 240,
    multiplier: 2.5,
    rarity: 'rare',
    cost: 1300,
    unlockCondition: { type: 'level', value: 7, description: 'Reach level 7' },
    visualEffect: 'amplify',
    category: 'networking'
  },
  {
    id: 'pu-35',
    name: 'Referral Magnet',
    description: 'Get referral activities give 4x XP',
    icon: '🔗',
    type: 'referral_boost',
    duration: 60,
    multiplier: 4.0,
    rarity: 'rare',
    cost: 1800,
    unlockCondition: { type: 'level', value: 10, description: 'Reach level 10' },
    visualEffect: 'referral',
    category: 'networking'
  },
  {
    id: 'pu-36',
    name: 'Public Commitment',
    description: 'Public accountability gives 1.5x XP for 24 hours',
    icon: '📢',
    type: 'accountability_boost',
    duration: 1440,
    multiplier: 1.5,
    rarity: 'rare',
    cost: 1000,
    unlockCondition: { type: 'streak', value: 10, description: '10-day streak' },
    visualEffect: 'public',
    category: 'accountability'
  },
  {
    id: 'pu-37',
    name: 'Deep Work Mode',
    description: 'Focus sessions give 2.5x XP, block distractions',
    icon: '🧠',
    type: 'focus_mode',
    duration: 120,
    multiplier: 2.5,
    rarity: 'rare',
    cost: 900,
    unlockCondition: { type: 'level', value: 5, description: 'Reach level 5' },
    visualEffect: 'deep',
    category: 'utility'
  },
  {
    id: 'pu-38',
    name: 'Application Spree',
    description: 'Apply to 5+ companies, get 3x XP bonus',
    icon: '📬',
    type: 'application_boost',
    duration: 180,
    multiplier: 3.0,
    rarity: 'rare',
    cost: 1400,
    unlockCondition: { type: 'tasks', value: 40, description: 'Complete 40 tasks' },
    visualEffect: 'spree',
    category: 'career'
  },

  // MORE EPIC POWER-UPS - Business & Advanced Career
  {
    id: 'pu-39',
    name: 'Business Starter',
    description: 'Business/startup activities give 4x XP',
    icon: '🚀',
    type: 'business_boost',
    duration: 180,
    multiplier: 4.0,
    rarity: 'epic',
    cost: 2500,
    unlockCondition: { type: 'level', value: 12, description: 'Reach level 12' },
    visualEffect: 'business',
    category: 'business'
  },
  {
    id: 'pu-40',
    name: 'LinkedIn Power',
    description: 'LinkedIn/networking activities give 3x XP',
    icon: '💼',
    type: 'network_boost',
    duration: 240,
    multiplier: 3.0,
    rarity: 'epic',
    cost: 2200,
    unlockCondition: { type: 'level', value: 11, description: 'Reach level 11' },
    visualEffect: 'linkedin',
    category: 'networking'
  },
  {
    id: 'pu-41',
    name: 'Interview Confidence',
    description: 'Mock interviews give 4x XP',
    icon: '🎯',
    type: 'interview_boost',
    duration: 120,
    multiplier: 4.0,
    rarity: 'epic',
    cost: 2800,
    unlockCondition: { type: 'level', value: 13, description: 'Reach level 13' },
    visualEffect: 'confidence',
    category: 'career'
  },
  {
    id: 'pu-42',
    name: 'Portfolio Showcase',
    description: 'Portfolio work gives 4.5x XP',
    icon: '🌟',
    type: 'portfolio_boost',
    duration: 180,
    multiplier: 4.5,
    rarity: 'epic',
    cost: 2600,
    unlockCondition: { type: 'tasks', value: 50, description: 'Complete 50 tasks' },
    visualEffect: 'showcase',
    category: 'career'
  },
  {
    id: 'pu-43',
    name: 'Accountability Master',
    description: 'Complete accountability tasks, get 2x XP for 48 hours',
    icon: '⚖️',
    type: 'accountability_boost',
    duration: 2880,
    multiplier: 2.0,
    rarity: 'epic',
    cost: 2400,
    unlockCondition: { type: 'streak', value: 21, description: '21-day streak' },
    visualEffect: 'master',
    category: 'accountability'
  },
  {
    id: 'pu-44',
    name: 'Skill Mastery',
    description: 'Master new skills, get 3.5x XP',
    icon: '🏆',
    type: 'skill_boost',
    duration: 240,
    multiplier: 3.5,
    rarity: 'epic',
    cost: 2300,
    unlockCondition: { type: 'level', value: 14, description: 'Reach level 14' },
    visualEffect: 'mastery',
    category: 'career'
  },
  {
    id: 'pu-45',
    name: 'Productivity Surge',
    description: 'All productivity tasks give 3x XP',
    icon: '⚡',
    type: 'productivity_boost',
    duration: 180,
    multiplier: 3.0,
    rarity: 'epic',
    cost: 2100,
    unlockCondition: { type: 'level', value: 15, description: 'Reach level 15' },
    visualEffect: 'surge',
    category: 'utility'
  },
  {
    id: 'pu-46',
    name: 'Application Master',
    description: 'Applications give 4x XP, track progress',
    icon: '📋',
    type: 'application_boost',
    duration: 240,
    multiplier: 4.0,
    rarity: 'epic',
    cost: 2700,
    unlockCondition: { type: 'tasks', value: 60, description: 'Complete 60 tasks' },
    visualEffect: 'master',
    category: 'career'
  },

  // MORE LEGENDARY POWER-UPS
  {
    id: 'pu-47',
    name: 'Internship Magnet',
    description: 'All internship activities give 5x XP',
    icon: '🎯',
    type: 'internship_boost',
    duration: 180,
    multiplier: 5.0,
    rarity: 'legendary',
    cost: 5000,
    unlockCondition: { type: 'level', value: 18, description: 'Reach level 18' },
    visualEffect: 'magnet',
    category: 'career'
  },
  {
    id: 'pu-48',
    name: 'Business Launch',
    description: 'Startup/business activities give 6x XP',
    icon: '🚀',
    type: 'business_boost',
    duration: 240,
    multiplier: 6.0,
    rarity: 'legendary',
    cost: 6000,
    unlockCondition: { type: 'level', value: 20, description: 'Reach level 20' },
    visualEffect: 'launch',
    category: 'business'
  },
  {
    id: 'pu-49',
    name: 'Network Legend',
    description: 'Networking gives 5x XP, unlock connections',
    icon: '👑',
    type: 'network_boost',
    duration: 300,
    multiplier: 5.0,
    rarity: 'legendary',
    cost: 5500,
    unlockCondition: { type: 'level', value: 19, description: 'Reach level 19' },
    visualEffect: 'legend',
    category: 'networking'
  },
  {
    id: 'pu-50',
    name: 'Interview Ace',
    description: 'Interview prep gives 6x XP',
    icon: '⭐',
    type: 'interview_boost',
    duration: 180,
    multiplier: 6.0,
    rarity: 'legendary',
    cost: 5800,
    unlockCondition: { type: 'level', value: 22, description: 'Reach level 22' },
    visualEffect: 'ace',
    category: 'career'
  },
  {
    id: 'pu-51',
    name: 'Portfolio Perfection',
    description: 'Portfolio work gives 5.5x XP',
    icon: '💎',
    type: 'portfolio_boost',
    duration: 240,
    multiplier: 5.5,
    rarity: 'legendary',
    cost: 5200,
    unlockCondition: { type: 'tasks', value: 100, description: 'Complete 100 tasks' },
    visualEffect: 'perfection',
    category: 'career'
  },
  {
    id: 'pu-52',
    name: 'Accountability Champion',
    description: 'Accountability gives 3x XP permanently (until broken)',
    icon: '🏅',
    type: 'accountability_boost',
    duration: 999999,
    multiplier: 3.0,
    rarity: 'legendary',
    cost: 7000,
    unlockCondition: { type: 'streak', value: 60, description: '60-day streak' },
    visualEffect: 'champion',
    category: 'accountability'
  },
  {
    id: 'pu-53',
    name: 'Application Pro',
    description: 'Applications give 5x XP, auto-track',
    icon: '📊',
    type: 'application_boost',
    duration: 300,
    multiplier: 5.0,
    rarity: 'legendary',
    cost: 5400,
    unlockCondition: { type: 'tasks', value: 80, description: 'Complete 80 tasks' },
    visualEffect: 'pro',
    category: 'career'
  },
  {
    id: 'pu-54',
    name: 'Skill Master',
    description: 'All skill learning gives 5x XP',
    icon: '🎓',
    type: 'skill_boost',
    duration: 300,
    multiplier: 5.0,
    rarity: 'legendary',
    cost: 5600,
    unlockCondition: { type: 'level', value: 25, description: 'Reach level 25' },
    visualEffect: 'master',
    category: 'career'
  },

  // MYTHIC POWER-UPS
  {
    id: 'pu-23',
    name: 'God Mode',
    description: '20x XP, infinite energy, all unlocks for 1 hour',
    icon: '⚡',
    type: 'legendary_boost',
    duration: 60,
    multiplier: 20.0,
    rarity: 'mythic',
    cost: 10000,
    unlockCondition: { type: 'level', value: 50, description: 'Reach level 50' },
    visualEffect: 'god',
    category: 'offensive'
  },
  {
    id: 'pu-24',
    name: 'Eternal Flame',
    description: 'Streak never breaks, permanent 3x multiplier',
    icon: '🔥',
    type: 'streak_multiplier',
    duration: 999999,
    multiplier: 3.0,
    rarity: 'mythic',
    cost: 20000,
    unlockCondition: { type: 'streak', value: 100, description: '100-day streak' },
    visualEffect: 'eternal',
    category: 'offensive'
  },
  {
    id: 'pu-55',
    name: 'Career God',
    description: 'All career activities give 10x XP for 2 hours',
    icon: '👑',
    type: 'internship_boost',
    duration: 120,
    multiplier: 10.0,
    rarity: 'mythic',
    cost: 15000,
    unlockCondition: { type: 'level', value: 40, description: 'Reach level 40' },
    visualEffect: 'career',
    category: 'career'
  },
  {
    id: 'pu-56',
    name: 'Business Empire',
    description: 'Business activities give 12x XP',
    icon: '🏰',
    type: 'business_boost',
    duration: 180,
    multiplier: 12.0,
    rarity: 'mythic',
    cost: 18000,
    unlockCondition: { type: 'level', value: 45, description: 'Reach level 45' },
    visualEffect: 'empire',
    category: 'business'
  },
  {
    id: 'pu-57',
    name: 'Network Deity',
    description: 'Networking gives 10x XP, unlimited connections',
    icon: '🌌',
    type: 'network_boost',
    duration: 360,
    multiplier: 10.0,
    rarity: 'mythic',
    cost: 16000,
    unlockCondition: { type: 'level', value: 42, description: 'Reach level 42' },
    visualEffect: 'deity',
    category: 'networking'
  },
  {
    id: 'pu-58',
    name: 'Accountability Immortal',
    description: 'Permanent 5x XP from accountability, never breaks',
    icon: '⚖️',
    type: 'accountability_boost',
    duration: 999999,
    multiplier: 5.0,
    rarity: 'mythic',
    cost: 25000,
    unlockCondition: { type: 'streak', value: 200, description: '200-day streak' },
    visualEffect: 'immortal',
    category: 'accountability'
  },
  {
    id: 'pu-59',
    name: 'Portfolio Legend',
    description: 'Portfolio work gives 10x XP',
    icon: '💫',
    type: 'portfolio_boost',
    duration: 300,
    multiplier: 10.0,
    rarity: 'mythic',
    cost: 17000,
    unlockCondition: { type: 'tasks', value: 200, description: 'Complete 200 tasks' },
    visualEffect: 'legend',
    category: 'career'
  },
  {
    id: 'pu-60',
    name: 'Ultimate Career Boost',
    description: 'ALL career activities give 15x XP for 1 hour',
    icon: '🌟',
    type: 'legendary_boost',
    duration: 60,
    multiplier: 15.0,
    rarity: 'mythic',
    cost: 20000,
    unlockCondition: { type: 'level', value: 50, description: 'Reach level 50' },
    visualEffect: 'ultimate',
    category: 'career'
  }
];

export function getPowerUpById(id: string): PowerUp | undefined {
  return ALL_POWER_UPS.find(pu => pu.id === id);
}

export function getPowerUpsByRarity(rarity: PowerUp['rarity']): PowerUp[] {
  return ALL_POWER_UPS.filter(pu => pu.rarity === rarity);
}

export function getUnlockedPowerUps(userLevel: number, userStreak: number, completedTasks: number, totalXP: number): PowerUp[] {
  return ALL_POWER_UPS.filter(pu => {
    const condition = pu.unlockCondition;
    switch (condition.type) {
      case 'level':
        return userLevel >= condition.value;
      case 'streak':
        return userStreak >= condition.value;
      case 'tasks':
        return completedTasks >= condition.value;
      case 'xp':
        return totalXP >= condition.value;
      case 'none':
        return true;
      default:
        return false;
    }
  });
}

