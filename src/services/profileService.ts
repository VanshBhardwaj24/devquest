import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import { calculateTier } from '../lib/utils';

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
    // Return mock update if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating profile update');
      return {
        id: `demo-profile-${userId}`,
        user_id: userId,
        ...updates,
        last_activity: new Date().toISOString(),
      };
    }

    try {
      // Build update object with only provided fields
      const updateData: any = {
        last_activity: new Date().toISOString(),
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.degree !== undefined) updateData.degree = updates.degree;
      if (updates.branch !== undefined) updateData.branch = updates.branch;
      if (updates.year !== undefined) updateData.year = updates.year;
      if (updates.interests !== undefined) updateData.interests = updates.interests;
      if (updates.careerGoal !== undefined) updateData.career_goal = updates.careerGoal;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.xp !== undefined) {
        updateData.xp = updates.xp;
        // Auto-calculate tier if not provided
        if (updates.tier === undefined) {
          updateData.tier = calculateTier(updates.xp);
        }
      }
      if (updates.tier !== undefined) updateData.tier = updates.tier;
      if (updates.streak !== undefined) updateData.streak = updates.streak;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
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