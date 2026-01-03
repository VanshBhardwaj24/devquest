/**
 * User reducer - Handles all user-related state changes
 * Production-ready with error handling and validation
 */

import type { User, AppAction } from '../types/enhanced';
import { validateXP } from '../utils/xpCalculations';

export const userReducer = (user: User | null, action: AppAction): User | null => {
  try {
    switch (action.type) {
      case 'SET_USER':
        return action.payload;
      
      case 'ADD_XP': {
        if (!user) return user;
        
        const { amount } = action.payload;
        const newXP = validateXP(user.xp + amount);
        
        return {
          ...user,
          xp: newXP,
          lastActivity: new Date(),
        };
      }
      
      case 'SPEND_GOLD': {
        if (!user) return user;
        
        const { amount } = action.payload;
        const currentGold = user.gold || 0;
        
        if (currentGold < amount) {
          console.warn('Insufficient gold for purchase');
          return user;
        }
        
        return {
          ...user,
          gold: currentGold - amount,
        };
      }
      
      case 'CONVERT_XP_TO_GOLD': {
        if (!user) return user;
        
        const { amount } = action.payload;
        const xpCost = amount * 10;
        
        if (user.xp < xpCost) {
          console.warn('Insufficient XP for conversion');
          return user;
        }
        
        return {
          ...user,
          xp: user.xp - xpCost,
          gold: (user.gold || 0) + amount,
        };
      }
      
      case 'ADD_PROJECT': {
        if (!user) return user;
        
        const updatedProjects = [action.payload, ...(user.projects || [])];
        
        return {
          ...user,
          projects: updatedProjects,
          lastActivity: new Date(),
        };
      }
      
      case 'UPDATE_PROJECT': {
        if (!user) return user;
        
        const updatedProjects = (user.projects || []).map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload, lastUpdated: new Date() } : p
        );
        
        return {
          ...user,
          projects: updatedProjects,
          lastActivity: new Date(),
        };
      }
      
      case 'ADD_SKILL_XP': {
        if (!user || !user.skills) return user;
        
        const { skillId, amount } = action.payload;
        const skillIndex = user.skills.findIndex(s => s.id === skillId);
        
        if (skillIndex === -1) {
          console.warn(`Skill with ID ${skillId} not found`);
          return user;
        }
        
        const skill = user.skills[skillIndex];
        let newXp = skill.xp + amount;
        let newLevel = skill.level;
        let newMaxXp = skill.maxXp;
        
        // Handle level ups
        while (newXp >= newMaxXp) {
          newLevel += 1;
          newXp = newXp - newMaxXp;
          newMaxXp = Math.floor(newMaxXp * 1.5);
        }
        
        const updatedSkills = [...user.skills];
        updatedSkills[skillIndex] = { ...skill, level: newLevel, xp: newXp, maxXp: newMaxXp };
        
        return {
          ...user,
          skills: updatedSkills,
        };
      }
      
      case 'COMPLETE_MINDFULNESS_SESSION': {
        if (!user) return user;
        
        const { durationMinutes, timestamp, moodScore } = action.payload;
        const prev = user.mindfulness || { currentStreak: 0, totalMinutes: 0, averageMood: 0, totalSessions: 0 };
        
        const lastIso = prev.lastSessionDate ? new Date(prev.lastSessionDate).toISOString().split('T')[0] : '';
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Simple streak calculation
        const streakContinued = lastIso === todayStr || lastIso === new Date(timestamp.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const newStreak = streakContinued ? prev.currentStreak + 1 : 1;
        
        const newTotalSessions = (prev.totalSessions || 0) + 1;
        const mood = typeof moodScore === 'number' ? moodScore : 7;
        const newAvgMood = Math.round((((prev.averageMood || 0) * (prev.totalSessions || 0)) + mood) / newTotalSessions);
        
        return {
          ...user,
          mindfulness: {
            ...prev,
            currentStreak: newStreak,
            totalMinutes: (prev.totalMinutes || 0) + (durationMinutes || 0),
            averageMood: newAvgMood,
            totalSessions: newTotalSessions,
            lastSessionDate: timestamp,
          },
        };
      }
      
      default:
        return user;
    }
  } catch (error) {
    console.error('Error in userReducer:', error);
    return user; // Return original state on error
  }
};
