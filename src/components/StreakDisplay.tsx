/**
 * Streak Display Component
 * Reusable component for displaying streak information with animations and milestones
 */

import React, { useMemo } from 'react';
import { useStreakSystem } from '../hooks/useStreakSystem';
import { useXPSystem } from '../hooks/useXPSystem';

interface StreakDisplayProps {
  showDetails?: boolean;
  animated?: boolean;
  compact?: boolean;
  showProtection?: boolean;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  showDetails = true,
  animated = true,
  compact = false,
  showProtection = true,
  className = '',
}) => {
  const streakData = useStreakSystem();
  const { addXP } = useXPSystem();

  // Calculate streak intensity for visual effects
  const streakIntensity = useMemo(() => {
    if (streakData.currentStreak >= 365) return 'legendary';
    if (streakData.currentStreak >= 100) return 'epic';
    if (streakData.currentStreak >= 50) return 'master';
    if (streakData.currentStreak >= 30) return 'expert';
    if (streakData.currentStreak >= 14) return 'dedicated';
    if (streakData.currentStreak >= 7) return 'weekly';
    if (streakData.currentStreak >= 3) return 'getting-started';
    return 'beginner';
  }, [streakData.currentStreak]);

  // Get streak color and emoji
  const getStreakColor = () => {
    switch (streakIntensity) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'epic': return 'text-indigo-600 bg-indigo-100';
      case 'master': return 'text-blue-600 bg-blue-100';
      case 'expert': return 'text-green-600 bg-green-100';
      case 'dedicated': return 'text-yellow-600 bg-yellow-100';
      case 'weekly': return 'text-orange-600 bg-orange-100';
      case 'getting-started': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStreakEmoji = () => {
    switch (streakIntensity) {
      case 'legendary': return '🔥';
      case 'epic': return '⚡';
      case 'master': return '💎';
      case 'expert': return '🌟';
      case 'dedicated': return '🎯';
      case 'weekly': return '📅';
      case 'getting-started': return '🌱';
      default: return '🌟';
    }
  };

  // Handle streak update
  const handleStreakUpdate = (activityType: 'coding' | 'task' | 'general') => {
    streakData.updateStreak(activityType);
    
    // Add XP for maintaining streak
    const xpBonus = streakData.calculateStreakBonus(10);
    if (xpBonus > 10) {
      addXP(xpBonus, 'streak_bonus');
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-2xl">{getStreakEmoji()}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {streakData.currentStreak} Day Streak
          </p>
          {!streakData.isStreakActive && (
            <p className="text-xs text-red-500">
              {streakData.daysInactive} days inactive
            </p>
          )}
        </div>
        {showProtection && streakData.protection.hasShield && (
          <span className="text-blue-500" title="Streak Protected">🛡️</span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <span className={`text-3xl ${animated ? 'animate-pulse' : ''}`}>
            {getStreakEmoji()}
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {streakData.currentStreak} Day Streak
            </h3>
            <p className="text-sm text-gray-600 capitalize">{streakIntensity}</p>
          </div>
        </div>
        <div className="text-right">
          {showProtection && streakData.protection.hasShield && (
            <div className="flex items-center space-x-1 text-blue-500">
              <span className="text-xl">🛡️</span>
              <span className="text-sm">Protected</span>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className={`mb-4 p-3 rounded-lg ${getStreakColor()}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {streakData.isStreakActive ? '🔥 Streak Active!' : '⚠️ Streak at Risk'}
            </p>
            {!streakData.isStreakActive && (
              <p className="text-sm opacity-75">
                {streakData.daysInactive} days since last activity
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Longest: {streakData.longestStreak}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleStreakUpdate('task')}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          ✅ Complete Task
        </button>
        <button
          onClick={() => handleStreakUpdate('coding')}
          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          💻 Solve Problem
        </button>
        <button
          onClick={() => handleStreakUpdate('general')}
          className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
        >
          📝 Log Activity
        </button>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Next Milestone */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Next Milestone</p>
                <p className="text-lg font-bold text-gray-900">
                  {streakData.nextMilestone} Days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {streakData.daysToMilestone} days to go
                </p>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${((streakData.currentStreak / streakData.nextMilestone) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak Rewards */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Rewards</p>
            <div className="space-y-1">
              {streakData.getStreakRewards().map((reward, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {reward.badgeReward && `🏆 ${reward.badgeReward.replace('_', ' ').toUpperCase()}`}
                    {reward.titleReward && `👑 ${reward.titleReward}`}
                  </span>
                  <span className="font-medium text-gray-900">
                    +{reward.xpReward} XP
                    {reward.goldReward > 0 && ` +${reward.goldReward} Gold`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-600">Start Date</p>
              <p className="font-semibold">{streakData.streakStartDate}</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-600">Last Activity</p>
              <p className="font-semibold">{streakData.lastActivityDate || 'Never'}</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-600">Type</p>
              <p className="font-semibold capitalize">{streakData.streakType}</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-600">Bonus Multiplier</p>
              <p className="font-semibold">{(streakData.calculateStreakBonus(100) / 100).toFixed(1)}x</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
