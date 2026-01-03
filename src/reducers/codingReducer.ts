/**
 * Coding reducer - Handles all coding statistics and problem solving
 * Production-ready with error handling and validation
 */

import type { CodingStats, AppAction } from '../types/enhanced';
import { calculateTimeBasedStreak, getTodayDateString } from '../utils/streakCalculations';

export const codingReducer = (codingStats: CodingStats, action: AppAction): CodingStats => {
  try {
    switch (action.type) {
      case 'UPDATE_CODING_STATS':
        return { ...codingStats, ...action.payload };
      
      case 'SOLVE_PROBLEM': {
        const { xp, difficulty, platform, topic } = action.payload;
        const solveTimestamp = new Date();
        const todayStr = getTodayDateString();
        
        // Update streak
        const streakResult = calculateTimeBasedStreak(
          codingStats.timeBasedStreak.currentStreak,
          codingStats.timeBasedStreak.lastActivityDate,
          todayStr
        );
        
        const newCodingStreak = streakResult.newStreak;
        const newLongestCodingStreak = Math.max(codingStats.longestStreak, newCodingStreak);
        
        // Update daily activity
        const existingCodingActivity = codingStats.timeBasedStreak.dailyActivity[todayStr] || {
          problemsSolved: 0,
          tasksCompleted: 0,
          xpEarned: 0,
          activeMinutes: 0,
          lastActivityTime: solveTimestamp.toISOString(),
        };
        
        const updatedCodingDailyActivity = {
          ...codingStats.timeBasedStreak.dailyActivity,
          [todayStr]: {
            problemsSolved: existingCodingActivity.problemsSolved + 1,
            tasksCompleted: existingCodingActivity.tasksCompleted,
            xpEarned: existingCodingActivity.xpEarned + xp,
            activeMinutes: existingCodingActivity.activeMinutes + 1,
            lastActivityTime: solveTimestamp.toISOString(),
          },
        };
        
        return {
          ...codingStats,
          totalSolved: codingStats.totalSolved + 1,
          todaysSolved: codingStats.todaysSolved + 1,
          weeklyProgress: codingStats.weeklyProgress + 1,
          currentStreak: newCodingStreak,
          longestStreak: newLongestCodingStreak,
          lastProblemSolvedAt: solveTimestamp,
          [`${difficulty.toLowerCase()}Count`]: (codingStats[`${difficulty.toLowerCase()}Count` as keyof CodingStats] as number) + 1,
          platformStats: {
            ...codingStats.platformStats,
            [platform.toLowerCase()]: (codingStats.platformStats[platform.toLowerCase() as keyof typeof codingStats.platformStats] as number || 0) + 1,
          },
          topicStats: {
            ...codingStats.topicStats,
            [topic]: (codingStats.topicStats[topic] || 0) + 1,
          },
          timeBasedStreak: {
            ...codingStats.timeBasedStreak,
            currentStreak: newCodingStreak,
            longestStreak: newLongestCodingStreak,
            lastActivityDate: todayStr,
            streakStartDate: streakResult.streakBroken ? todayStr : codingStats.timeBasedStreak.streakStartDate,
            dailyActivity: updatedCodingDailyActivity,
          },
        };
      }
      
      default:
        return codingStats;
    }
  } catch (error) {
    console.error('Error in codingReducer:', error);
    return codingStats; // Return original state on error
  }
};
