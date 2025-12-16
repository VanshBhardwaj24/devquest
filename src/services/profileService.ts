import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export const profileService = {
  async getProfile(userId: string) {
    // Return null if Supabase is not configured (will trigger profile setup)
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: No profile fetch needed');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Profile service error:', error);
      return null;
    }
  },

  async createProfile(profile: Omit<User, 'id' | 'lastActivity'> & { user_id: string }) {
    // Return mock profile if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating profile creation');
      return {
        id: `demo-profile-${Date.now()}`,
        ...profile,
        career_goal: profile.careerGoal,
        last_activity: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          degree: profile.degree,
          branch: profile.branch,
          year: profile.year,
          interests: profile.interests,
          career_goal: profile.careerGoal,
          avatar: profile.avatar,
          level: profile.level,
          xp: profile.xp,
          tier: profile.tier,
          streak: profile.streak,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      // Initialize career stats with error handling
      try {
        await supabase
          .from('career_stats')
          .upsert({
            user_id: profile.user_id,
            knowledge: 0,
            mindset: 0,
            communication: 0,
            portfolio: 0,
          }, {
            onConflict: 'user_id'
          });
      } catch (statsError) {
        console.warn('Error initializing career stats:', statsError);
        // Don't throw here as profile creation was successful
      }

      return data;
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          degree: updates.degree,
          branch: updates.branch,
          year: updates.year,
          interests: updates.interests,
          career_goal: updates.careerGoal,
          avatar: updates.avatar,
          level: updates.level,
          xp: updates.xp,
          tier: updates.tier,
          streak: updates.streak,
          last_activity: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  async getCareerStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('career_stats')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error fetching career stats:', error);
        // Return default stats instead of throwing
        return { knowledge: 0, mindset: 0, communication: 0, portfolio: 0 };
      }

      return data && data.length > 0 ? data[0] : { knowledge: 0, mindset: 0, communication: 0, portfolio: 0 };
    } catch (error) {
      console.error('Career stats service error:', error);
      // Return default stats as fallback
      return { knowledge: 0, mindset: 0, communication: 0, portfolio: 0 };
    }
  },

  async updateCareerStats(userId: string, stats: { knowledge?: number; mindset?: number; communication?: number; portfolio?: number }) {
    try {
      const { data, error } = await supabase
        .from('career_stats')
        .upsert({
          user_id: userId,
          ...stats,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating career stats:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Career stats update error:', error);
      throw error;
    }
  },
};