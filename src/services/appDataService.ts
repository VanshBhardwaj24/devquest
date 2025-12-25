import { supabase, isSupabaseConfigured } from '../lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserAppData {
  timeBasedStreak?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    streakStartDate: string;
    dailyActivity: {
      [date: string]: {
        problemsSolved: number;
        tasksCompleted: number;
        xpEarned: number;
        activeMinutes: number;
        lastActivityTime: string;
      };
    };
  };
  dailyReset?: {
    lastResetDate: string;
    nextResetTime: string | null;
    resetCountdown: number;
    hasResetToday: boolean;
  };
  activityTimer?: {
    sessionStartTime: string | null;
    totalActiveTime: number;
    currentSessionTime: number;
    isActive: boolean;
    lastActivityTimestamp: string | null;
  };
  accountabilityData?: {
    timeWasters: any[];
    businessGoals: any[];
    internshipApplications: any[];
    networkingEvents: any[];
    publicCommitments: any[];
  };
  internshipMilestones?: any[];
  nonNegotiables?: any[];
  profileStats?: {
    lastDSASolve: string | null;
    lastDSADate: string | null;
    weeklyCommits: number;
    weeklyReset: string | null;
  };
  integrationData?: {
    github: any;
    leetcode: any;
    vscode: any;
    calendar: any;
  };
  appPreferences?: {
    darkMode: boolean;
    notifications: boolean;
  };
  contacts?: any[];
  bucketList?: any[];
  mindfulness?: any;
  projects?: any[];
  skills?: any[];
  challenges?: {
    daily: any[];
    weekly: any[];
    monthly: any[];
  };
}

export const appDataService = {
  /**
   * Get all app data for a user
   */
  async getAppData(userId: string): Promise<UserAppData | null> {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      return this.getAppDataFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from('user_app_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Handle "not found" errors gracefully (404, PGRST116, table doesn't exist)
        if (error.code === 'PGRST116' || 
            error.code === '42P01' || 
            error.message?.includes('404') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('schema cache') ||
            error.message?.includes('Could not find the table')) {
          // Table doesn't exist or no data found, silently return null to use defaults
          // This is expected if migration hasn't been run yet
          return null;
        }
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error fetching app data:', error?.message || JSON.stringify(error));
        // Fallback to localStorage on error
        return this.getAppDataFromLocalStorage();
      }

      if (!data) return null;

      return {
        timeBasedStreak: data.time_based_streak as any,
        dailyReset: data.daily_reset as any,
        activityTimer: data.activity_timer as any,
        accountabilityData: data.accountability_data as any,
        internshipMilestones: data.internship_milestones as any,
        nonNegotiables: data.non_negotiables as any,
        profileStats: data.profile_stats as any,
        integrationData: data.integration_data as any,
        appPreferences: data.app_preferences as any,
        contacts: (data as any).contacts as any,
        bucketList: (data as any).bucket_list as any,
        mindfulness: (data as any).mindfulness as any,
        projects: (data as any).projects as any,
        skills: (data as any).skills as any,
        challenges: (data as any).challenges as any,
      };
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error in getAppData:', (error as any)?.message || JSON.stringify(error));
      return this.getAppDataFromLocalStorage();
    }
  },

  /**
   * Save app data to backend
   */
  async saveAppData(userId: string, appData: Partial<UserAppData>): Promise<boolean> {
    // Always save to localStorage as backup
    this.saveAppDataToLocalStorage(appData);

    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      // Prepare data for database
      const dbData: any = {};

      if (appData.timeBasedStreak !== undefined) {
        dbData.time_based_streak = appData.timeBasedStreak;
      }
      if (appData.dailyReset !== undefined) {
        dbData.daily_reset = {
          ...appData.dailyReset,
          nextResetTime: appData.dailyReset.nextResetTime 
            ? new Date(appData.dailyReset.nextResetTime).toISOString() 
            : null,
        };
      }
      if (appData.activityTimer !== undefined) {
        dbData.activity_timer = {
          ...appData.activityTimer,
          sessionStartTime: appData.activityTimer.sessionStartTime 
            ? new Date(appData.activityTimer.sessionStartTime).toISOString() 
            : null,
          lastActivityTimestamp: appData.activityTimer.lastActivityTimestamp 
            ? new Date(appData.activityTimer.lastActivityTimestamp).toISOString() 
            : null,
        };
      }
      if (appData.accountabilityData !== undefined) {
        dbData.accountability_data = appData.accountabilityData;
      }
      if (appData.internshipMilestones !== undefined) {
        dbData.internship_milestones = appData.internshipMilestones;
      }
      if (appData.nonNegotiables !== undefined) {
        dbData.non_negotiables = appData.nonNegotiables;
      }
      if (appData.profileStats !== undefined) {
        dbData.profile_stats = appData.profileStats;
      }
      if (appData.integrationData !== undefined) {
        dbData.integration_data = appData.integrationData;
      }
      if (appData.appPreferences !== undefined) {
        dbData.app_preferences = appData.appPreferences;
      }
      if (appData.contacts !== undefined) {
        dbData.contacts = appData.contacts;
      }
      if (appData.bucketList !== undefined) {
        dbData.bucket_list = appData.bucketList;
      }
      if (appData.mindfulness !== undefined) {
        dbData.mindfulness = appData.mindfulness;
      }
      if (appData.projects !== undefined) {
        dbData.projects = appData.projects;
      }
      if (appData.skills !== undefined) {
        dbData.skills = appData.skills;
      }
      if (appData.challenges !== undefined) {
        dbData.challenges = appData.challenges;
      }

      // Use upsert to create or update
      const { error } = await supabase
        .from('user_app_data')
        .upsert({
          user_id: userId,
          ...dbData,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        const msg = error.message || '';
        const code = (error as any).code;
        if (
          code === 'PGRST116' ||
          code === '42P01' ||
          msg.includes('404') ||
          msg.includes('schema cache') ||
          msg.includes('Could not find the table')
        ) {
          return false;
        }
        console.error('Error saving app data:', msg || JSON.stringify(error));
        return false;
      }

      return true;
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error in saveAppData:', (error as any)?.message || JSON.stringify(error));
      return false;
    }
  },

  /**
   * Update specific field in app data
   */
  async updateAppDataField(
    userId: string,
    field: keyof UserAppData,
    value: any
  ): Promise<boolean> {
    const fieldMap: { [key: string]: string } = {
      timeBasedStreak: 'time_based_streak',
      dailyReset: 'daily_reset',
      activityTimer: 'activity_timer',
      accountabilityData: 'accountability_data',
      internshipMilestones: 'internship_milestones',
      nonNegotiables: 'non_negotiables',
      profileStats: 'profile_stats',
      integrationData: 'integration_data',
      appPreferences: 'app_preferences',
      contacts: 'contacts',
      bucketList: 'bucket_list',
      mindfulness: 'mindfulness',
      projects: 'projects',
      skills: 'skills',
      challenges: 'challenges',
    };

    const dbField = fieldMap[field];
    if (!dbField) {
      console.error('Invalid field:', field);
      return false;
    }

    // Prepare value for database (handle dates)
    let dbValue = value;
    if (field === 'dailyReset' && value?.nextResetTime) {
      dbValue = {
        ...value,
        nextResetTime: new Date(value.nextResetTime).toISOString(),
      };
    }
    if (field === 'activityTimer') {
      dbValue = {
        ...value,
        sessionStartTime: value.sessionStartTime 
          ? new Date(value.sessionStartTime).toISOString() 
          : null,
        lastActivityTimestamp: value.lastActivityTimestamp 
          ? new Date(value.lastActivityTimestamp).toISOString() 
          : null,
      };
    }

    // Save to localStorage
    this.saveAppDataToLocalStorage({ [field]: value });

    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_app_data')
        .upsert({
          user_id: userId,
          [dbField]: dbValue,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        const msg = error.message || '';
        const code = (error as any).code;
        if (
          code === 'PGRST116' ||
          code === '42P01' ||
          msg.includes('404') ||
          msg.includes('schema cache') ||
          msg.includes('Could not find the table')
        ) {
          return false;
        }
        console.error(`Error updating ${field}:`, msg || JSON.stringify(error));
        return false;
      }

      return true;
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error(`Error in updateAppDataField for ${field}:`, (error as any)?.message || JSON.stringify(error));
      return false;
    }
  },

  /**
   * Get app data from localStorage (fallback)
   */
  getAppDataFromLocalStorage(): UserAppData | null {
    if (typeof window === 'undefined') return null;

    try {
      const timeBasedStreak = localStorage.getItem('timeBasedStreak');
      const dailyReset = localStorage.getItem('dailyReset');
      const activityTimer = localStorage.getItem('activityTimer');
      const accountabilityData = localStorage.getItem('accountabilityData');
      const internshipMilestones = localStorage.getItem('internshipMilestones');
      const nonNegotiables = localStorage.getItem('nonNegotiables');
      const profileStats = localStorage.getItem('profileStats');
      const integrationData = localStorage.getItem('integrationData');
      const appPreferences = localStorage.getItem('appPreferences');
      const contacts = localStorage.getItem('contacts');
      const bucketList = localStorage.getItem('bucketList');
      const mindfulness = localStorage.getItem('mindfulness');
      const projects = localStorage.getItem('projects');
      const skills = localStorage.getItem('skills');
      const challenges = localStorage.getItem('challenges');

      return {
        timeBasedStreak: timeBasedStreak ? JSON.parse(timeBasedStreak) : undefined,
        dailyReset: dailyReset ? JSON.parse(dailyReset) : undefined,
        activityTimer: activityTimer ? JSON.parse(activityTimer) : undefined,
        accountabilityData: accountabilityData ? JSON.parse(accountabilityData) : undefined,
        internshipMilestones: internshipMilestones ? JSON.parse(internshipMilestones) : undefined,
        nonNegotiables: nonNegotiables ? JSON.parse(nonNegotiables) : undefined,
        profileStats: profileStats ? JSON.parse(profileStats) : undefined,
        integrationData: integrationData ? JSON.parse(integrationData) : undefined,
        appPreferences: appPreferences ? JSON.parse(appPreferences) : undefined,
        contacts: contacts ? JSON.parse(contacts) : undefined,
        bucketList: bucketList ? JSON.parse(bucketList) : undefined,
        mindfulness: mindfulness ? JSON.parse(mindfulness) : undefined,
        projects: projects ? JSON.parse(projects) : undefined,
        skills: skills ? JSON.parse(skills) : undefined,
        challenges: challenges ? JSON.parse(challenges) : undefined,
      };
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error reading from localStorage:', (error as any)?.message || JSON.stringify(error));
      return null;
    }
  },

  /**
   * Save app data to localStorage (backup)
   */
  saveAppDataToLocalStorage(appData: Partial<UserAppData>): void {
    if (typeof window === 'undefined') return;

    try {
      if (appData.timeBasedStreak !== undefined) {
        localStorage.setItem('timeBasedStreak', JSON.stringify(appData.timeBasedStreak));
      }
      if (appData.dailyReset !== undefined) {
        localStorage.setItem('dailyReset', JSON.stringify(appData.dailyReset));
      }
      if (appData.activityTimer !== undefined) {
        localStorage.setItem('activityTimer', JSON.stringify(appData.activityTimer));
      }
      if (appData.accountabilityData !== undefined) {
        localStorage.setItem('accountabilityData', JSON.stringify(appData.accountabilityData));
      }
      if (appData.internshipMilestones !== undefined) {
        localStorage.setItem('internshipMilestones', JSON.stringify(appData.internshipMilestones));
      }
      if (appData.nonNegotiables !== undefined) {
        localStorage.setItem('nonNegotiables', JSON.stringify(appData.nonNegotiables));
      }
      if (appData.profileStats !== undefined) {
        localStorage.setItem('profileStats', JSON.stringify(appData.profileStats));
      }
      if (appData.integrationData !== undefined) {
        localStorage.setItem('integrationData', JSON.stringify(appData.integrationData));
      }
      if (appData.appPreferences !== undefined) {
        localStorage.setItem('appPreferences', JSON.stringify(appData.appPreferences));
      }
      if (appData.contacts !== undefined) {
        localStorage.setItem('contacts', JSON.stringify(appData.contacts));
      }
      if (appData.bucketList !== undefined) {
        localStorage.setItem('bucketList', JSON.stringify(appData.bucketList));
      }
      if (appData.mindfulness !== undefined) {
        localStorage.setItem('mindfulness', JSON.stringify(appData.mindfulness));
      }
      if (appData.projects !== undefined) {
        localStorage.setItem('projects', JSON.stringify(appData.projects));
      }
      if (appData.skills !== undefined) {
        localStorage.setItem('skills', JSON.stringify(appData.skills));
      }
      if (appData.challenges !== undefined) {
        localStorage.setItem('challenges', JSON.stringify(appData.challenges));
      }
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error saving to localStorage:', (error as any)?.message || JSON.stringify(error));
    }
  },

  /**
   * Sync localStorage to backend (for migration)
   */
  async syncLocalStorageToBackend(userId: string): Promise<boolean> {
    const localData = this.getAppDataFromLocalStorage();
    if (!localData) return false;

    return this.saveAppData(userId, localData);
  },
};
