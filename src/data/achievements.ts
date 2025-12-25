export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic';
  category: 'streak' | 'tasks' | 'coding' | 'social' | 'learning' | 'fitness' | 'finance' | 'special' | 'milestone' | 'combat' | 'internship' | 'business' | 'networking' | 'portfolio' | 'accountability' | 'career';
  xpReward: number;
  unlockCondition: {
    type: 'level' | 'streak' | 'tasks' | 'xp' | 'coding_problems' | 'days_active' | 'completion_rate' | 'custom';
    value: number;
    description: string;
  };
  unlocked: boolean;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // STREAK ACHIEVEMENTS
  { id: 'ach-1', name: 'First Flame', description: 'Complete 1 day streak', icon: '🔥', tier: 'bronze', category: 'streak', xpReward: 50, unlockCondition: { type: 'streak', value: 1, description: '1 day streak' }, unlocked: false, rarity: 'common' },
  { id: 'ach-2', name: 'Week Warrior', description: 'Complete 7 day streak', icon: '🔥', tier: 'silver', category: 'streak', xpReward: 200, unlockCondition: { type: 'streak', value: 7, description: '7 day streak' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-3', name: 'Fortnight Fighter', description: 'Complete 14 day streak', icon: '🔥', tier: 'gold', category: 'streak', xpReward: 500, unlockCondition: { type: 'streak', value: 14, description: '14 day streak' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-4', name: 'Monthly Master', description: 'Complete 30 day streak', icon: '🔥', tier: 'platinum', category: 'streak', xpReward: 1500, unlockCondition: { type: 'streak', value: 30, description: '30 day streak' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-5', name: 'Century Champion', description: 'Complete 100 day streak', icon: '🔥', tier: 'mythic', category: 'streak', xpReward: 10000, unlockCondition: { type: 'streak', value: 100, description: '100 day streak' }, unlocked: false, rarity: 'mythic' },
  
  // TASK ACHIEVEMENTS
  { id: 'ach-6', name: 'Task Starter', description: 'Complete 10 tasks', icon: '✅', tier: 'bronze', category: 'tasks', xpReward: 100, unlockCondition: { type: 'tasks', value: 10, description: '10 tasks' }, unlocked: false, rarity: 'common' },
  { id: 'ach-7', name: 'Task Master', description: 'Complete 50 tasks', icon: '✅', tier: 'silver', category: 'tasks', xpReward: 300, unlockCondition: { type: 'tasks', value: 50, description: '50 tasks' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-8', name: 'Task Legend', description: 'Complete 200 tasks', icon: '✅', tier: 'gold', category: 'tasks', xpReward: 1000, unlockCondition: { type: 'tasks', value: 200, description: '200 tasks' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-9', name: 'Task God', description: 'Complete 1000 tasks', icon: '✅', tier: 'platinum', category: 'tasks', xpReward: 5000, unlockCondition: { type: 'tasks', value: 1000, description: '1000 tasks' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-10', name: 'Perfect Day', description: 'Complete all daily tasks', icon: '⭐', tier: 'gold', category: 'tasks', xpReward: 500, unlockCondition: { type: 'completion_rate', value: 100, description: '100% completion' }, unlocked: false, rarity: 'epic' },
  
  // CODING ACHIEVEMENTS
  { id: 'ach-11', name: 'Code Novice', description: 'Solve 5 coding problems', icon: '💻', tier: 'bronze', category: 'coding', xpReward: 150, unlockCondition: { type: 'coding_problems', value: 5, description: '5 problems' }, unlocked: false, rarity: 'common' },
  { id: 'ach-12', name: 'Code Warrior', description: 'Solve 25 coding problems', icon: '💻', tier: 'silver', category: 'coding', xpReward: 400, unlockCondition: { type: 'coding_problems', value: 25, description: '25 problems' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-13', name: 'Code Master', description: 'Solve 100 coding problems', icon: '💻', tier: 'gold', category: 'coding', xpReward: 1500, unlockCondition: { type: 'coding_problems', value: 100, description: '100 problems' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-14', name: 'LeetCode Legend', description: 'Solve 500 coding problems', icon: '💻', tier: 'platinum', category: 'coding', xpReward: 5000, unlockCondition: { type: 'coding_problems', value: 500, description: '500 problems' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-15', name: 'Algorithm God', description: 'Solve 1000 coding problems', icon: '💻', tier: 'mythic', category: 'coding', xpReward: 20000, unlockCondition: { type: 'coding_problems', value: 1000, description: '1000 problems' }, unlocked: false, rarity: 'mythic' },
  
  // LEVEL ACHIEVEMENTS
  { id: 'ach-16', name: 'Level 5', description: 'Reach level 5', icon: '⭐', tier: 'bronze', category: 'milestone', xpReward: 200, unlockCondition: { type: 'level', value: 5, description: 'Level 5' }, unlocked: false, rarity: 'common' },
  { id: 'ach-17', name: 'Level 10', description: 'Reach level 10', icon: '⭐', tier: 'silver', category: 'milestone', xpReward: 500, unlockCondition: { type: 'level', value: 10, description: 'Level 10' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-18', name: 'Level 20', description: 'Reach level 20', icon: '⭐', tier: 'gold', category: 'milestone', xpReward: 2000, unlockCondition: { type: 'level', value: 20, description: 'Level 20' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-19', name: 'Level 50', description: 'Reach level 50', icon: '⭐', tier: 'platinum', category: 'milestone', xpReward: 10000, unlockCondition: { type: 'level', value: 50, description: 'Level 50' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-20', name: 'Level 100', description: 'Reach level 100', icon: '⭐', tier: 'mythic', category: 'milestone', xpReward: 50000, unlockCondition: { type: 'level', value: 100, description: 'Level 100' }, unlocked: false, rarity: 'mythic' },
  
  // XP ACHIEVEMENTS
  { id: 'ach-21', name: 'XP Collector', description: 'Earn 10,000 XP', icon: '⚡', tier: 'bronze', category: 'milestone', xpReward: 300, unlockCondition: { type: 'xp', value: 10000, description: '10k XP' }, unlocked: false, rarity: 'common' },
  { id: 'ach-22', name: 'XP Master', description: 'Earn 100,000 XP', icon: '⚡', tier: 'silver', category: 'milestone', xpReward: 1000, unlockCondition: { type: 'xp', value: 100000, description: '100k XP' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-23', name: 'XP Legend', description: 'Earn 1,000,000 XP', icon: '⚡', tier: 'gold', category: 'milestone', xpReward: 5000, unlockCondition: { type: 'xp', value: 1000000, description: '1M XP' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-24', name: 'XP God', description: 'Earn 10,000,000 XP', icon: '⚡', tier: 'platinum', category: 'milestone', xpReward: 50000, unlockCondition: { type: 'xp', value: 10000000, description: '10M XP' }, unlocked: false, rarity: 'legendary' },
  
  // LEARNING ACHIEVEMENTS
  { id: 'ach-25', name: 'Bookworm', description: 'Complete 5 learning sessions', icon: '📚', tier: 'bronze', category: 'learning', xpReward: 150, unlockCondition: { type: 'custom', value: 5, description: '5 sessions' }, unlocked: false, rarity: 'common' },
  { id: 'ach-26', name: 'Scholar', description: 'Complete 25 learning sessions', icon: '📚', tier: 'silver', category: 'learning', xpReward: 500, unlockCondition: { type: 'custom', value: 25, description: '25 sessions' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-27', name: 'Professor', description: 'Complete 100 learning sessions', icon: '📚', tier: 'gold', category: 'learning', xpReward: 2000, unlockCondition: { type: 'custom', value: 100, description: '100 sessions' }, unlocked: false, rarity: 'epic' },
  
  // FITNESS ACHIEVEMENTS
  { id: 'ach-28', name: 'Fitness Starter', description: 'Log 10 fitness activities', icon: '💪', tier: 'bronze', category: 'fitness', xpReward: 200, unlockCondition: { type: 'custom', value: 10, description: '10 activities' }, unlocked: false, rarity: 'common' },
  { id: 'ach-29', name: 'Fitness Warrior', description: 'Log 50 fitness activities', icon: '💪', tier: 'silver', category: 'fitness', xpReward: 600, unlockCondition: { type: 'custom', value: 50, description: '50 activities' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-30', name: 'Fitness Beast', description: 'Log 200 fitness activities', icon: '💪', tier: 'gold', category: 'fitness', xpReward: 2500, unlockCondition: { type: 'custom', value: 200, description: '200 activities' }, unlocked: false, rarity: 'epic' },
  
  // FINANCE ACHIEVEMENTS
  { id: 'ach-31', name: 'Money Manager', description: 'Track finances for 30 days', icon: '💰', tier: 'silver', category: 'finance', xpReward: 400, unlockCondition: { type: 'days_active', value: 30, description: '30 days' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-32', name: 'Financial Master', description: 'Track finances for 100 days', icon: '💰', tier: 'gold', category: 'finance', xpReward: 1500, unlockCondition: { type: 'days_active', value: 100, description: '100 days' }, unlocked: false, rarity: 'epic' },
  
  // SOCIAL ACHIEVEMENTS
  { id: 'ach-33', name: 'Social Butterfly', description: 'Complete 10 social activities', icon: '👥', tier: 'bronze', category: 'social', xpReward: 150, unlockCondition: { type: 'custom', value: 10, description: '10 activities' }, unlocked: false, rarity: 'common' },
  { id: 'ach-34', name: 'Network Master', description: 'Complete 50 social activities', icon: '👥', tier: 'silver', category: 'social', xpReward: 500, unlockCondition: { type: 'custom', value: 50, description: '50 activities' }, unlocked: false, rarity: 'rare' },
  
  // SPECIAL ACHIEVEMENTS
  { id: 'ach-35', name: 'Early Bird', description: 'Complete tasks before 8 AM', icon: '🌅', tier: 'gold', category: 'special', xpReward: 300, unlockCondition: { type: 'custom', value: 1, description: 'Before 8 AM' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-36', name: 'Night Owl', description: 'Complete tasks after 11 PM', icon: '🦉', tier: 'gold', category: 'special', xpReward: 300, unlockCondition: { type: 'custom', value: 1, description: 'After 11 PM' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-37', name: 'Speed Demon', description: 'Complete 10 tasks in one day', icon: '⚡', tier: 'silver', category: 'special', xpReward: 400, unlockCondition: { type: 'custom', value: 10, description: '10 in one day' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-38', name: 'Perfectionist', description: 'Maintain 90%+ completion rate for 30 days', icon: '⭐', tier: 'platinum', category: 'special', xpReward: 3000, unlockCondition: { type: 'completion_rate', value: 90, description: '90% for 30 days' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-39', name: 'Unstoppable', description: 'Never miss a day for 60 days', icon: '🔥', tier: 'platinum', category: 'streak', xpReward: 5000, unlockCondition: { type: 'streak', value: 60, description: '60 day streak' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-40', name: 'Immortal', description: 'Never miss a day for 365 days', icon: '👑', tier: 'mythic', category: 'streak', xpReward: 100000, unlockCondition: { type: 'streak', value: 365, description: '365 day streak' }, unlocked: false, rarity: 'mythic' },
  
  // COMBAT ACHIEVEMENTS
  { id: 'ach-41', name: 'First Blood', description: 'Complete your first accountability punishment', icon: '⚔️', tier: 'bronze', category: 'combat', xpReward: 100, unlockCondition: { type: 'custom', value: 1, description: 'First punishment' }, unlocked: false, rarity: 'common' },
  { id: 'ach-42', name: 'Warrior', description: 'Complete 10 accountability punishments', icon: '⚔️', tier: 'silver', category: 'combat', xpReward: 500, unlockCondition: { type: 'custom', value: 10, description: '10 punishments' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-43', name: 'Gladiator', description: 'Complete 50 accountability punishments', icon: '⚔️', tier: 'gold', category: 'combat', xpReward: 2000, unlockCondition: { type: 'custom', value: 50, description: '50 punishments' }, unlocked: false, rarity: 'epic' },
  
  // MORE SPECIAL ACHIEVEMENTS
  { id: 'ach-44', name: 'Power User', description: 'Use 10 different power-ups', icon: '🎁', tier: 'silver', category: 'special', xpReward: 600, unlockCondition: { type: 'custom', value: 10, description: '10 power-ups' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-45', name: 'Collector', description: 'Unlock 25 achievements', icon: '🏆', tier: 'gold', category: 'special', xpReward: 1500, unlockCondition: { type: 'custom', value: 25, description: '25 achievements' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-46', name: 'Completionist', description: 'Unlock 50 achievements', icon: '🏆', tier: 'platinum', category: 'special', xpReward: 5000, unlockCondition: { type: 'custom', value: 50, description: '50 achievements' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-47', name: 'Legend', description: 'Unlock all achievements', icon: '👑', tier: 'mythic', category: 'special', xpReward: 50000, unlockCondition: { type: 'custom', value: 100, description: 'All achievements' }, unlocked: false, rarity: 'mythic' },
  
  // DAILY ACTIVITY ACHIEVEMENTS
  { id: 'ach-48', name: 'Active Week', description: 'Be active for 7 consecutive days', icon: '📅', tier: 'bronze', category: 'milestone', xpReward: 200, unlockCondition: { type: 'days_active', value: 7, description: '7 days' }, unlocked: false, rarity: 'common' },
  { id: 'ach-49', name: 'Active Month', description: 'Be active for 30 consecutive days', icon: '📅', tier: 'silver', category: 'milestone', xpReward: 800, unlockCondition: { type: 'days_active', value: 30, description: '30 days' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-50', name: 'Active Year', description: 'Be active for 365 consecutive days', icon: '📅', tier: 'platinum', category: 'milestone', xpReward: 10000, unlockCondition: { type: 'days_active', value: 365, description: '365 days' }, unlocked: false, rarity: 'legendary' },
  
  // INTERNSHIP ACHIEVEMENTS
  { id: 'ach-51', name: 'First Application', description: 'Apply to your first internship', icon: '📧', tier: 'bronze', category: 'internship', xpReward: 200, unlockCondition: { type: 'custom', value: 1, description: 'First application' }, unlocked: false, rarity: 'common' },
  { id: 'ach-52', name: 'Application Spree', description: 'Apply to 10 internships', icon: '📬', tier: 'silver', category: 'internship', xpReward: 500, unlockCondition: { type: 'custom', value: 10, description: '10 applications' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-53', name: 'Application Master', description: 'Apply to 50 internships', icon: '📮', tier: 'gold', category: 'internship', xpReward: 2000, unlockCondition: { type: 'custom', value: 50, description: '50 applications' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-54', name: 'First Interview', description: 'Get your first interview call', icon: '🎤', tier: 'silver', category: 'internship', xpReward: 800, unlockCondition: { type: 'custom', value: 1, description: 'First interview' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-55', name: 'Interview Veteran', description: 'Complete 5 interviews', icon: '🎯', tier: 'gold', category: 'internship', xpReward: 1500, unlockCondition: { type: 'custom', value: 5, description: '5 interviews' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-56', name: 'Interview Master', description: 'Complete 20 interviews', icon: '🏆', tier: 'platinum', category: 'internship', xpReward: 5000, unlockCondition: { type: 'custom', value: 20, description: '20 interviews' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-57', name: 'Offer Received', description: 'Get your first internship offer', icon: '🎉', tier: 'gold', category: 'internship', xpReward: 3000, unlockCondition: { type: 'custom', value: 1, description: 'First offer' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-58', name: 'Multiple Offers', description: 'Get 3+ internship offers', icon: '🌟', tier: 'platinum', category: 'internship', xpReward: 8000, unlockCondition: { type: 'custom', value: 3, description: '3 offers' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-59', name: 'Dream Internship', description: 'Land your dream internship', icon: '👑', tier: 'mythic', category: 'internship', xpReward: 20000, unlockCondition: { type: 'custom', value: 1, description: 'Dream internship' }, unlocked: false, rarity: 'mythic' },
  
  // BUSINESS/STARTUP ACHIEVEMENTS
  { id: 'ach-60', name: 'Business Idea', description: 'Document your first business idea', icon: '💡', tier: 'bronze', category: 'business', xpReward: 300, unlockCondition: { type: 'custom', value: 1, description: 'First idea' }, unlocked: false, rarity: 'common' },
  { id: 'ach-61', name: 'Business Plan', description: 'Create a business plan', icon: '📋', tier: 'silver', category: 'business', xpReward: 600, unlockCondition: { type: 'custom', value: 1, description: 'Business plan' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-62', name: 'First Customer', description: 'Get your first paying customer', icon: '💰', tier: 'gold', category: 'business', xpReward: 2500, unlockCondition: { type: 'custom', value: 1, description: 'First customer' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-63', name: 'First $100', description: 'Earn your first $100', icon: '💵', tier: 'gold', category: 'business', xpReward: 2000, unlockCondition: { type: 'custom', value: 100, description: '$100 revenue' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-64', name: 'First $1K', description: 'Earn your first $1,000', icon: '💸', tier: 'platinum', category: 'business', xpReward: 8000, unlockCondition: { type: 'custom', value: 1000, description: '$1K revenue' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-65', name: 'First $10K', description: 'Earn your first $10,000', icon: '🏦', tier: 'platinum', category: 'business', xpReward: 20000, unlockCondition: { type: 'custom', value: 10000, description: '$10K revenue' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-66', name: 'Startup Launched', description: 'Launch your startup', icon: '🚀', tier: 'platinum', category: 'business', xpReward: 10000, unlockCondition: { type: 'custom', value: 1, description: 'Launch startup' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-67', name: 'Business Owner', description: 'Run a successful business for 6 months', icon: '👔', tier: 'mythic', category: 'business', xpReward: 50000, unlockCondition: { type: 'custom', value: 180, description: '6 months' }, unlocked: false, rarity: 'mythic' },
  
  // NETWORKING ACHIEVEMENTS
  { id: 'ach-68', name: 'First Connection', description: 'Make your first professional connection', icon: '🤝', tier: 'bronze', category: 'networking', xpReward: 150, unlockCondition: { type: 'custom', value: 1, description: 'First connection' }, unlocked: false, rarity: 'common' },
  { id: 'ach-69', name: 'Network Builder', description: 'Connect with 50 professionals', icon: '🌐', tier: 'silver', category: 'networking', xpReward: 600, unlockCondition: { type: 'custom', value: 50, description: '50 connections' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-70', name: 'Network Master', description: 'Connect with 200 professionals', icon: '🔗', tier: 'gold', category: 'networking', xpReward: 2000, unlockCondition: { type: 'custom', value: 200, description: '200 connections' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-71', name: 'LinkedIn Power User', description: 'Reach 500+ LinkedIn connections', icon: '💼', tier: 'platinum', category: 'networking', xpReward: 5000, unlockCondition: { type: 'custom', value: 500, description: '500 connections' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-72', name: 'First Referral', description: 'Get your first referral', icon: '🔗', tier: 'silver', category: 'networking', xpReward: 800, unlockCondition: { type: 'custom', value: 1, description: 'First referral' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-73', name: 'Referral Master', description: 'Get 5 referrals', icon: '⭐', tier: 'gold', category: 'networking', xpReward: 2500, unlockCondition: { type: 'custom', value: 5, description: '5 referrals' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-74', name: 'Event Attendee', description: 'Attend your first networking event', icon: '🎪', tier: 'bronze', category: 'networking', xpReward: 200, unlockCondition: { type: 'custom', value: 1, description: 'First event' }, unlocked: false, rarity: 'common' },
  { id: 'ach-75', name: 'Event Regular', description: 'Attend 10 networking events', icon: '🎭', tier: 'silver', category: 'networking', xpReward: 1000, unlockCondition: { type: 'custom', value: 10, description: '10 events' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-76', name: 'Network Influencer', description: 'Build a network of 1000+ professionals', icon: '👑', tier: 'mythic', category: 'networking', xpReward: 30000, unlockCondition: { type: 'custom', value: 1000, description: '1000 connections' }, unlocked: false, rarity: 'mythic' },
  
  // PORTFOLIO ACHIEVEMENTS
  { id: 'ach-77', name: 'First Project', description: 'Complete your first portfolio project', icon: '💻', tier: 'bronze', category: 'portfolio', xpReward: 300, unlockCondition: { type: 'custom', value: 1, description: 'First project' }, unlocked: false, rarity: 'common' },
  { id: 'ach-78', name: 'Portfolio Builder', description: 'Complete 5 portfolio projects', icon: '🏗️', tier: 'silver', category: 'portfolio', xpReward: 800, unlockCondition: { type: 'custom', value: 5, description: '5 projects' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-79', name: 'Portfolio Master', description: 'Complete 15 portfolio projects', icon: '🌟', tier: 'gold', category: 'portfolio', xpReward: 3000, unlockCondition: { type: 'custom', value: 15, description: '15 projects' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-80', name: 'GitHub Star', description: 'Get 10 stars on GitHub', icon: '⭐', tier: 'silver', category: 'portfolio', xpReward: 1000, unlockCondition: { type: 'custom', value: 10, description: '10 stars' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-81', name: 'GitHub Legend', description: 'Get 100 stars on GitHub', icon: '🌟', tier: 'gold', category: 'portfolio', xpReward: 4000, unlockCondition: { type: 'custom', value: 100, description: '100 stars' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-82', name: 'First Deployment', description: 'Deploy your first project', icon: '🚀', tier: 'bronze', category: 'portfolio', xpReward: 400, unlockCondition: { type: 'custom', value: 1, description: 'First deployment' }, unlocked: false, rarity: 'common' },
  { id: 'ach-83', name: 'Deployment Master', description: 'Deploy 10 projects', icon: '🌐', tier: 'gold', category: 'portfolio', xpReward: 2500, unlockCondition: { type: 'custom', value: 10, description: '10 deployments' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-84', name: 'Portfolio Website', description: 'Create your portfolio website', icon: '🌍', tier: 'silver', category: 'portfolio', xpReward: 1200, unlockCondition: { type: 'custom', value: 1, description: 'Portfolio site' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-85', name: 'Open Source Contributor', description: 'Contribute to open source', icon: '🔓', tier: 'gold', category: 'portfolio', xpReward: 2000, unlockCondition: { type: 'custom', value: 1, description: 'OS contribution' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-86', name: 'Portfolio Perfection', description: 'Complete 30 portfolio projects', icon: '💎', tier: 'platinum', category: 'portfolio', xpReward: 10000, unlockCondition: { type: 'custom', value: 30, description: '30 projects' }, unlocked: false, rarity: 'legendary' },
  
  // ACCOUNTABILITY ACHIEVEMENTS
  { id: 'ach-87', name: 'Accountability Starter', description: 'Log your first accountability entry', icon: '📝', tier: 'bronze', category: 'accountability', xpReward: 100, unlockCondition: { type: 'custom', value: 1, description: 'First entry' }, unlocked: false, rarity: 'common' },
  { id: 'ach-88', name: 'Accountability Warrior', description: 'Complete 25 accountability punishments', icon: '⚔️', tier: 'silver', category: 'accountability', xpReward: 800, unlockCondition: { type: 'custom', value: 25, description: '25 punishments' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-89', name: 'Accountability Master', description: 'Complete 100 accountability punishments', icon: '🏅', tier: 'gold', category: 'accountability', xpReward: 3000, unlockCondition: { type: 'custom', value: 100, description: '100 punishments' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-90', name: 'Public Commitment', description: 'Make your first public commitment', icon: '📢', tier: 'silver', category: 'accountability', xpReward: 600, unlockCondition: { type: 'custom', value: 1, description: 'Public commitment' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-91', name: 'Accountability Partner', description: 'Get an accountability partner', icon: '🤝', tier: 'gold', category: 'accountability', xpReward: 1500, unlockCondition: { type: 'custom', value: 1, description: 'Accountability partner' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-92', name: 'Discipline Master', description: 'Maintain accountability for 90 days', icon: '⚖️', tier: 'platinum', category: 'accountability', xpReward: 8000, unlockCondition: { type: 'custom', value: 90, description: '90 days' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-93', name: 'Accountability Immortal', description: 'Maintain accountability for 365 days', icon: '👑', tier: 'mythic', category: 'accountability', xpReward: 50000, unlockCondition: { type: 'custom', value: 365, description: '365 days' }, unlocked: false, rarity: 'mythic' },
  
  // CAREER ACHIEVEMENTS
  { id: 'ach-94', name: 'Resume Created', description: 'Create your first resume', icon: '📄', tier: 'bronze', category: 'career', xpReward: 200, unlockCondition: { type: 'custom', value: 1, description: 'First resume' }, unlocked: false, rarity: 'common' },
  { id: 'ach-95', name: 'Resume Optimized', description: 'Optimize your resume for ATS', icon: '✨', tier: 'silver', category: 'career', xpReward: 500, unlockCondition: { type: 'custom', value: 1, description: 'ATS optimized' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-96', name: 'LinkedIn Complete', description: 'Complete your LinkedIn profile', icon: '💼', tier: 'silver', category: 'career', xpReward: 600, unlockCondition: { type: 'custom', value: 1, description: 'LinkedIn complete' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-97', name: 'Mock Interview', description: 'Complete your first mock interview', icon: '🎤', tier: 'bronze', category: 'career', xpReward: 300, unlockCondition: { type: 'custom', value: 1, description: 'First mock' }, unlocked: false, rarity: 'common' },
  { id: 'ach-98', name: 'Mock Interview Master', description: 'Complete 10 mock interviews', icon: '🎯', tier: 'gold', category: 'career', xpReward: 2000, unlockCondition: { type: 'custom', value: 10, description: '10 mocks' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-99', name: 'Skill Certified', description: 'Get your first certification', icon: '🎓', tier: 'silver', category: 'career', xpReward: 800, unlockCondition: { type: 'custom', value: 1, description: 'First cert' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-100', name: 'Certification Master', description: 'Get 5 certifications', icon: '🏆', tier: 'gold', category: 'career', xpReward: 3000, unlockCondition: { type: 'custom', value: 5, description: '5 certs' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-101', name: 'Career Path Defined', description: 'Define your career path', icon: '🗺️', tier: 'silver', category: 'career', xpReward: 700, unlockCondition: { type: 'custom', value: 1, description: 'Career path' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-102', name: 'First Job', description: 'Land your first job/internship', icon: '💼', tier: 'platinum', category: 'career', xpReward: 10000, unlockCondition: { type: 'custom', value: 1, description: 'First job' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-103', name: 'Career Transition', description: 'Successfully transition careers', icon: '🔄', tier: 'platinum', category: 'career', xpReward: 15000, unlockCondition: { type: 'custom', value: 1, description: 'Career transition' }, unlocked: false, rarity: 'legendary' },
  
  // MORE STREAK ACHIEVEMENTS
  { id: 'ach-104', name: '3 Day Streak', description: 'Complete 3 day streak', icon: '🔥', tier: 'bronze', category: 'streak', xpReward: 100, unlockCondition: { type: 'streak', value: 3, description: '3 days' }, unlocked: false, rarity: 'common' },
  { id: 'ach-105', name: '21 Day Habit', description: 'Complete 21 day streak (habit formed)', icon: '🔥', tier: 'gold', category: 'streak', xpReward: 800, unlockCondition: { type: 'streak', value: 21, description: '21 days' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-106', name: '90 Day Champion', description: 'Complete 90 day streak', icon: '🔥', tier: 'platinum', category: 'streak', xpReward: 8000, unlockCondition: { type: 'streak', value: 90, description: '90 days' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-107', name: '200 Day Legend', description: 'Complete 200 day streak', icon: '🔥', tier: 'mythic', category: 'streak', xpReward: 30000, unlockCondition: { type: 'streak', value: 200, description: '200 days' }, unlocked: false, rarity: 'mythic' },
  
  // MORE CODING ACHIEVEMENTS
  { id: 'ach-108', name: 'Code Daily', description: 'Code for 7 consecutive days', icon: '💻', tier: 'bronze', category: 'coding', xpReward: 200, unlockCondition: { type: 'custom', value: 7, description: '7 days coding' }, unlocked: false, rarity: 'common' },
  { id: 'ach-109', name: 'Code Warrior', description: 'Solve 50 coding problems', icon: '⚔️', tier: 'silver', category: 'coding', xpReward: 600, unlockCondition: { type: 'coding_problems', value: 50, description: '50 problems' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-110', name: 'Hard Problem Solver', description: 'Solve 10 hard problems', icon: '💎', tier: 'gold', category: 'coding', xpReward: 2500, unlockCondition: { type: 'custom', value: 10, description: '10 hard' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-111', name: 'Contest Participant', description: 'Participate in coding contest', icon: '🏁', tier: 'silver', category: 'coding', xpReward: 800, unlockCondition: { type: 'custom', value: 1, description: 'First contest' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-112', name: 'Contest Winner', description: 'Win a coding contest', icon: '🥇', tier: 'platinum', category: 'coding', xpReward: 10000, unlockCondition: { type: 'custom', value: 1, description: 'Contest win' }, unlocked: false, rarity: 'legendary' },
  
  // MORE LEARNING ACHIEVEMENTS
  { id: 'ach-113', name: 'Course Completed', description: 'Complete your first course', icon: '📖', tier: 'bronze', category: 'learning', xpReward: 400, unlockCondition: { type: 'custom', value: 1, description: 'First course' }, unlocked: false, rarity: 'common' },
  { id: 'ach-114', name: 'Course Master', description: 'Complete 10 courses', icon: '🎓', tier: 'gold', category: 'learning', xpReward: 3000, unlockCondition: { type: 'custom', value: 10, description: '10 courses' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-115', name: 'Book Reader', description: 'Read 5 books', icon: '📚', tier: 'silver', category: 'learning', xpReward: 1000, unlockCondition: { type: 'custom', value: 5, description: '5 books' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-116', name: 'Bookworm Master', description: 'Read 20 books', icon: '📖', tier: 'gold', category: 'learning', xpReward: 4000, unlockCondition: { type: 'custom', value: 20, description: '20 books' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-117', name: 'Tutorial Master', description: 'Complete 50 tutorials', icon: '🎥', tier: 'silver', category: 'learning', xpReward: 1200, unlockCondition: { type: 'custom', value: 50, description: '50 tutorials' }, unlocked: false, rarity: 'rare' },
  
  // MORE TASK ACHIEVEMENTS
  { id: 'ach-118', name: 'Task Streak', description: 'Complete tasks for 7 days', icon: '✅', tier: 'bronze', category: 'tasks', xpReward: 150, unlockCondition: { type: 'custom', value: 7, description: '7 day task streak' }, unlocked: false, rarity: 'common' },
  { id: 'ach-119', name: 'Task Perfection', description: 'Complete 100% tasks for 7 days', icon: '⭐', tier: 'gold', category: 'tasks', xpReward: 2000, unlockCondition: { type: 'custom', value: 7, description: '7 perfect days' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-120', name: 'Task Marathon', description: 'Complete 20 tasks in one day', icon: '🏃', tier: 'silver', category: 'tasks', xpReward: 800, unlockCondition: { type: 'custom', value: 20, description: '20 in one day' }, unlocked: false, rarity: 'rare' },
  
  // MORE LEVEL ACHIEVEMENTS
  { id: 'ach-121', name: 'Level 15', description: 'Reach level 15', icon: '⭐', tier: 'silver', category: 'milestone', xpReward: 1000, unlockCondition: { type: 'level', value: 15, description: 'Level 15' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-122', name: 'Level 25', description: 'Reach level 25', icon: '⭐', tier: 'gold', category: 'milestone', xpReward: 3000, unlockCondition: { type: 'level', value: 25, description: 'Level 25' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-123', name: 'Level 30', description: 'Reach level 30', icon: '⭐', tier: 'gold', category: 'milestone', xpReward: 4000, unlockCondition: { type: 'level', value: 30, description: 'Level 30' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-124', name: 'Level 40', description: 'Reach level 40', icon: '⭐', tier: 'platinum', category: 'milestone', xpReward: 15000, unlockCondition: { type: 'level', value: 40, description: 'Level 40' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-125', name: 'Level 75', description: 'Reach level 75', icon: '⭐', tier: 'platinum', category: 'milestone', xpReward: 30000, unlockCondition: { type: 'level', value: 75, description: 'Level 75' }, unlocked: false, rarity: 'legendary' },
  
  // MORE SPECIAL ACHIEVEMENTS
  { id: 'ach-126', name: 'Early Riser', description: 'Complete tasks before 6 AM', icon: '🌅', tier: 'gold', category: 'special', xpReward: 500, unlockCondition: { type: 'custom', value: 1, description: 'Before 6 AM' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-127', name: 'Midnight Warrior', description: 'Complete tasks after midnight', icon: '🌙', tier: 'gold', category: 'special', xpReward: 500, unlockCondition: { type: 'custom', value: 1, description: 'After midnight' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-128', name: 'Weekend Warrior', description: 'Complete all weekend tasks', icon: '🎮', tier: 'silver', category: 'special', xpReward: 600, unlockCondition: { type: 'custom', value: 1, description: 'Weekend complete' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-129', name: 'Power-Up Collector', description: 'Use 25 different power-ups', icon: '🎁', tier: 'gold', category: 'special', xpReward: 2000, unlockCondition: { type: 'custom', value: 25, description: '25 power-ups' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-130', name: 'Achievement Hunter', description: 'Unlock 75 achievements', icon: '🏆', tier: 'platinum', category: 'special', xpReward: 10000, unlockCondition: { type: 'custom', value: 75, description: '75 achievements' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-131', name: 'True Legend', description: 'Unlock 100 achievements', icon: '👑', tier: 'mythic', category: 'special', xpReward: 75000, unlockCondition: { type: 'custom', value: 100, description: '100 achievements' }, unlocked: false, rarity: 'mythic' },
  
  // MORE FINANCE ACHIEVEMENTS
  { id: 'ach-132', name: 'Budget Master', description: 'Track budget for 60 days', icon: '💰', tier: 'gold', category: 'finance', xpReward: 2000, unlockCondition: { type: 'days_active', value: 60, description: '60 days' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-133', name: 'Savings Goal', description: 'Reach your first savings goal', icon: '💵', tier: 'silver', category: 'finance', xpReward: 1000, unlockCondition: { type: 'custom', value: 1, description: 'Savings goal' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-134', name: 'Investment Starter', description: 'Make your first investment', icon: '📈', tier: 'gold', category: 'finance', xpReward: 2500, unlockCondition: { type: 'custom', value: 1, description: 'First investment' }, unlocked: false, rarity: 'epic' },
  
  // MORE FITNESS ACHIEVEMENTS
  { id: 'ach-135', name: 'Fitness Streak', description: 'Exercise for 7 consecutive days', icon: '💪', tier: 'bronze', category: 'fitness', xpReward: 300, unlockCondition: { type: 'custom', value: 7, description: '7 day fitness streak' }, unlocked: false, rarity: 'common' },
  { id: 'ach-136', name: 'Fitness Champion', description: 'Exercise for 30 consecutive days', icon: '🏋️', tier: 'silver', category: 'fitness', xpReward: 1000, unlockCondition: { type: 'custom', value: 30, description: '30 day fitness streak' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-137', name: 'Fitness Immortal', description: 'Exercise for 100 consecutive days', icon: '💎', tier: 'platinum', category: 'fitness', xpReward: 8000, unlockCondition: { type: 'custom', value: 100, description: '100 day fitness streak' }, unlocked: false, rarity: 'legendary' },
  
  // MORE SOCIAL ACHIEVEMENTS
  { id: 'ach-138', name: 'Community Builder', description: 'Join 5 communities', icon: '👥', tier: 'silver', category: 'social', xpReward: 800, unlockCondition: { type: 'custom', value: 5, description: '5 communities' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-139', name: 'Mentor', description: 'Become a mentor', icon: '🎓', tier: 'gold', category: 'social', xpReward: 3000, unlockCondition: { type: 'custom', value: 1, description: 'Become mentor' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-140', name: 'Mentee', description: 'Get a mentor', icon: '🤝', tier: 'silver', category: 'social', xpReward: 1000, unlockCondition: { type: 'custom', value: 1, description: 'Get mentor' }, unlocked: false, rarity: 'rare' },
  { id: 'ach-141', name: 'Social Impact', description: 'Make a positive social impact', icon: '🌍', tier: 'platinum', category: 'social', xpReward: 10000, unlockCondition: { type: 'custom', value: 1, description: 'Social impact' }, unlocked: false, rarity: 'legendary' },
  
  // MORE COMBAT ACHIEVEMENTS
  { id: 'ach-142', name: 'Combat Veteran', description: 'Complete 25 accountability punishments', icon: '⚔️', tier: 'gold', category: 'combat', xpReward: 1500, unlockCondition: { type: 'custom', value: 25, description: '25 punishments' }, unlocked: false, rarity: 'epic' },
  { id: 'ach-143', name: 'Combat Master', description: 'Complete 100 accountability punishments', icon: '🗡️', tier: 'platinum', category: 'combat', xpReward: 6000, unlockCondition: { type: 'custom', value: 100, description: '100 punishments' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-144', name: 'Combat Immortal', description: 'Complete 500 accountability punishments', icon: '👑', tier: 'mythic', category: 'combat', xpReward: 40000, unlockCondition: { type: 'custom', value: 500, description: '500 punishments' }, unlocked: false, rarity: 'mythic' },
  
  // MORE XP ACHIEVEMENTS
  { id: 'ach-145', name: 'XP Millionaire', description: 'Earn 5,000,000 XP', icon: '⚡', tier: 'platinum', category: 'milestone', xpReward: 30000, unlockCondition: { type: 'xp', value: 5000000, description: '5M XP' }, unlocked: false, rarity: 'legendary' },
  { id: 'ach-146', name: 'XP Billionaire', description: 'Earn 50,000,000 XP', icon: '⚡', tier: 'mythic', category: 'milestone', xpReward: 200000, unlockCondition: { type: 'xp', value: 50000000, description: '50M XP' }, unlocked: false, rarity: 'mythic' },
  
  // ULTIMATE ACHIEVEMENTS
  { id: 'ach-147', name: 'Life Master', description: 'Master all life categories', icon: '👑', tier: 'mythic', category: 'special', xpReward: 100000, unlockCondition: { type: 'custom', value: 1, description: 'Master all' }, unlocked: false, rarity: 'mythic' },
  { id: 'ach-148', name: 'Career Complete', description: 'Complete all career milestones', icon: '🏆', tier: 'mythic', category: 'career', xpReward: 75000, unlockCondition: { type: 'custom', value: 1, description: 'Career complete' }, unlocked: false, rarity: 'mythic' },
  { id: 'ach-149', name: 'Business Success', description: 'Build a successful business', icon: '🚀', tier: 'mythic', category: 'business', xpReward: 100000, unlockCondition: { type: 'custom', value: 1, description: 'Business success' }, unlocked: false, rarity: 'mythic' },
  { id: 'ach-150', name: 'Ultimate Achievement', description: 'Unlock all achievements', icon: '🌟', tier: 'mythic', category: 'special', xpReward: 500000, unlockCondition: { type: 'custom', value: 150, description: 'All achievements' }, unlocked: false, rarity: 'mythic' },
];

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(ach => ach.category === category);
}

export function getAchievementsByTier(tier: Achievement['tier']): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(ach => ach.tier === tier);
}

export function getUnlockedAchievements(
  userLevel: number,
  userStreak: number,
  completedTasks: number,
  totalXP: number,
  codingProblems: number,
  daysActive: number,
  completionRate: number
): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(ach => {
    const condition = ach.unlockCondition;
    switch (condition.type) {
      case 'level':
        return userLevel >= condition.value;
      case 'streak':
        return userStreak >= condition.value;
      case 'tasks':
        return completedTasks >= condition.value;
      case 'xp':
        return totalXP >= condition.value;
      case 'coding_problems':
        return codingProblems >= condition.value;
      case 'days_active':
        return daysActive >= condition.value;
      case 'completion_rate':
        return completionRate >= condition.value;
      case 'custom':
        // Would need custom logic based on achievement
        return false;
      default:
        return false;
    }
  });
}

