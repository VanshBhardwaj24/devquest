/**
 * Game content generation utilities - Creates badges and challenges
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  category: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  xpReward: number;
  timeLimit: string;
  progress: number;
  maxProgress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  category: string;
  requirements: string[];
  rewards: string[];
  startedAt?: Date;
  completedAt?: Date;
  milestones: ChallengeMilestone[];
}

export interface ChallengeMilestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  xpReward: number;
}

/**
 * Generates a comprehensive set of badges for various achievements
 */
export const generateBadges = (): Badge[] => {
  const badges: Badge[] = [];
  
  // XP Milestone badges
  [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].forEach((xp, index) => {
    badges.push({
      id: `xp-${xp}`,
      name: `${xp} XP Master`,
      description: `Earned ${xp.toLocaleString()} total XP`,
      icon: '⚡',
      xpRequired: xp,
      unlocked: false,
      rarity: index < 2 ? 'bronze' : index < 4 ? 'silver' : index < 6 ? 'gold' : 'platinum',
      category: 'XP Milestones'
    });
  });

  // Coding badges
  [10, 25, 50, 100, 250, 500, 1000].forEach((count, index) => {
    badges.push({
      id: `coding-${count}`,
      name: `${count} Problems Solved`,
      description: `Solved ${count} coding problems`,
      icon: '💻',
      xpRequired: count * 50,
      unlocked: false,
      rarity: index < 2 ? 'bronze' : index < 4 ? 'silver' : index < 6 ? 'gold' : 'platinum',
      category: 'Coding'
    });
  });

  // Streak badges
  [7, 14, 30, 60, 100, 365].forEach((days, index) => {
    badges.push({
      id: `streak-${days}`,
      name: `${days}-Day Streak`,
      description: `Maintained a ${days}-day streak`,
      icon: '🔥',
      xpRequired: days * 10,
      unlocked: false,
      rarity: index < 2 ? 'bronze' : index < 4 ? 'silver' : 'gold',
      category: 'Streaks'
    });
  });

  return badges;
};

/**
 * Generates engaging challenges for users to complete
 */
export const generateChallenges = (): Challenge[] => {
  return [
    {
      id: 'dsa-sprint',
      title: 'DSA Sprint Challenge',
      description: 'Master data structures and algorithms by solving problems across different difficulty levels',
      difficulty: 'Medium',
      xpReward: 500,
      timeLimit: '7 days',
      progress: 0,
      maxProgress: 25,
      status: 'not-started',
      category: 'Programming',
      requirements: ['Basic programming knowledge', 'Problem-solving skills'],
      rewards: ['DSA Master badge', '500 XP', 'Algorithm expertise'],
      milestones: [
        { id: 'dsa-1', title: 'Array Basics', description: 'Solve 5 array problems', progress: 0, target: 5, completed: false, xpReward: 100 },
        { id: 'dsa-2', title: 'String Manipulation', description: 'Solve 5 string problems', progress: 0, target: 5, completed: false, xpReward: 100 },
        { id: 'dsa-3', title: 'Tree Traversal', description: 'Solve 5 tree problems', progress: 0, target: 5, completed: false, xpReward: 150 },
        { id: 'dsa-4', title: 'Dynamic Programming', description: 'Solve 5 DP problems', progress: 0, target: 5, completed: false, xpReward: 200 },
        { id: 'dsa-5', title: 'Graph Algorithms', description: 'Solve 5 graph problems', progress: 0, target: 5, completed: false, xpReward: 250 },
      ],
    },
    {
      id: 'portfolio-boost',
      title: 'Portfolio Powerhouse',
      description: 'Build an impressive portfolio with multiple projects showcasing different technologies',
      difficulty: 'Hard',
      xpReward: 750,
      timeLimit: '14 days',
      progress: 0,
      maxProgress: 5,
      status: 'not-started',
      category: 'Portfolio',
      requirements: ['Web development skills', 'Design sense', 'Project planning'],
      rewards: ['Portfolio Master badge', '750 XP', 'Professional portfolio'],
      milestones: [
        { id: 'port-1', title: 'Frontend Project', description: 'Build a React/Vue application', progress: 0, target: 1, completed: false, xpReward: 150 },
        { id: 'port-2', title: 'Backend API', description: 'Create a REST API', progress: 0, target: 1, completed: false, xpReward: 150 },
        { id: 'port-3', title: 'Full-Stack App', description: 'Complete full-stack application', progress: 0, target: 1, completed: false, xpReward: 200 },
        { id: 'port-4', title: 'Mobile App', description: 'Build a mobile application', progress: 0, target: 1, completed: false, xpReward: 175 },
        { id: 'port-5', title: 'Documentation', description: 'Write comprehensive documentation', progress: 0, target: 1, completed: false, xpReward: 75 },
      ],
    },
    {
      id: 'consistency-king',
      title: 'Consistency King',
      description: 'Maintain daily activity for an extended period',
      difficulty: 'Easy',
      xpReward: 300,
      timeLimit: '30 days',
      progress: 0,
      maxProgress: 30,
      status: 'not-started',
      category: 'Consistency',
      requirements: ['Daily commitment', 'Time management'],
      rewards: ['Consistency Champion badge', '300 XP', 'Habit formation'],
      milestones: [
        { id: 'cons-1', title: 'First Week', description: '7 days of activity', progress: 0, target: 7, completed: false, xpReward: 50 },
        { id: 'cons-2', title: 'Two Weeks', description: '14 days of activity', progress: 0, target: 14, completed: false, xpReward: 75 },
        { id: 'cons-3', title: 'Three Weeks', description: '21 days of activity', progress: 0, target: 21, completed: false, xpReward: 100 },
        { id: 'cons-4', title: 'Full Month', description: '30 days of activity', progress: 0, target: 30, completed: false, xpReward: 75 },
      ],
    },
  ];
};
