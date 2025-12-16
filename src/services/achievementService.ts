import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Achievement } from '../types';

// Default achievements for demo mode
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'profile-complete', title: 'Profile Pioneer', description: 'Complete your profile setup', icon: '👤', unlocked: false, tier: 'bronze', xp: 100 },
  { id: 'first-task', title: 'Task Master', description: 'Complete your first task', icon: '✅', unlocked: false, tier: 'bronze', xp: 50 },
  { id: 'first-problem', title: 'Code Warrior', description: 'Solve your first coding problem', icon: '💻', unlocked: false, tier: 'bronze', xp: 75 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false, tier: 'silver', xp: 200 },
  { id: 'level-5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐', unlocked: false, tier: 'silver', xp: 150 },
  { id: 'problems-25', title: 'Problem Crusher', description: 'Solve 25 coding problems', icon: '🏆', unlocked: false, tier: 'gold', xp: 300 },
];

export const achievementService = {
  async getAchievements() {
    // Return default achievements if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Returning default achievements');
      return DEFAULT_ACHIEVEMENTS;
    }

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('tier', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return DEFAULT_ACHIEVEMENTS;
      }
      return data || DEFAULT_ACHIEVEMENTS;
    } catch (error) {
      console.error('Error in getAchievements:', error);
      return DEFAULT_ACHIEVEMENTS;
    }
  },

  async getUserAchievements(userId: string) {
    // Return default achievements if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Returning default user achievements');
      return DEFAULT_ACHIEVEMENTS;
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          unlocked_at,
          achievements (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user achievements:', error);
        return DEFAULT_ACHIEVEMENTS;
      }

      const unlockedIds = new Set(data?.map(ua => ua.achievement_id) || []);
      
      // Get all achievements and mark which ones are unlocked
      const allAchievements = await this.getAchievements();
      
      return allAchievements.map(achievement => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: data?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at 
          ? new Date(data.find(ua => ua.achievement_id === achievement.id)!.unlocked_at)
          : undefined,
        tier: achievement.tier as 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic',
        xp: achievement.xp,
      }));
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      return DEFAULT_ACHIEVEMENTS;
    }
  },

  async unlockAchievement(userId: string, achievementId: string) {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating achievement unlock');
      return { achievement_id: achievementId, user_id: userId };
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
        })
        .select()
        .single();

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }
  },
};