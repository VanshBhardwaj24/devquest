/**
 * Activity Tracker Component
 * Tracks user activities and automatically awards XP and updates streaks
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useXPSystem } from '../hooks/useXPSystem';
import { useStreakSystem } from '../hooks/useStreakSystem';

interface ActivityTrackerProps {
  showDetails?: boolean;
  autoTrack?: boolean;
  className?: string;
}

interface ActivityEvent {
  type: 'coding' | 'task' | 'learning' | 'social' | 'mindfulness';
  timestamp: Date;
  duration?: number;
  details?: string;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  showDetails = true,
  autoTrack = true,
  className = '',
}) => {
  const { addXP, calculateXPForAction } = useXPSystem();
  const { updateStreak, calculateStreakBonus } = useStreakSystem();
  const [isActive, setIsActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [lastActivity, setLastActivity] = useState<ActivityEvent | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Start activity session
  const startActivity = useCallback((type: ActivityEvent['type'], details?: string) => {
    const now = new Date();
    setIsActive(true);
    setSessionStart(now);
    
    const activity: ActivityEvent = {
      type,
      timestamp: now,
      details,
    };
    
    setLastActivity(activity);
    setActivities(prev => [activity, ...prev.slice(0, 9)]);
    
    // Award XP for starting activity
    const xpReward = calculateXPForAction(`activity_${type}`);
    addXP(xpReward, `activity_start_${type}`);
    
    // Update streak
    updateStreak(type === 'coding' ? 'coding' : type === 'task' ? 'task' : 'general');
    
    console.log(`Activity started: ${type} - +${xpReward} XP`);
  }, [addXP, calculateXPForAction, updateStreak]);

  // End activity session
  const endActivity = useCallback(() => {
    if (!isActive || !sessionStart) return;
    
    const now = new Date();
    const duration = now.getTime() - sessionStart.getTime();
    
    setIsActive(false);
    setTotalActiveTime(prev => prev + duration);
    
    if (lastActivity) {
      const updatedActivity = { ...lastActivity, duration };
      setActivities(prev => [updatedActivity, ...prev.slice(1, 10)]);
      
      // Award bonus XP for sustained activity
      const minutes = Math.floor(duration / (1000 * 60));
      if (minutes >= 5) {
        const bonusXP = Math.floor(minutes / 5) * 5;
        addXP(bonusXP, `activity_duration_${lastActivity.type}`);
        console.log(`Duration bonus: +${bonusXP} XP for ${minutes} minutes`);
      }
    }
    
    setSessionStart(null);
  }, [isActive, sessionStart, lastActivity, addXP]);

  // Log specific activity
  const logActivity = useCallback((type: ActivityEvent['type'], details?: string) => {
    const now = new Date();
    const activity: ActivityEvent = {
      type,
      timestamp: now,
      details,
    };
    
    setActivities(prev => [activity, ...prev.slice(0, 9)]);
    setLastActivity(activity);
    
    // Award XP for activity
    const xpReward = calculateXPForAction(`activity_${type}`);
    addXP(xpReward, `activity_${type}_${now.getTime()}`);
    
    // Update streak
    updateStreak(type === 'coding' ? 'coding' : type === 'task' ? 'task' : 'general');
    
    console.log(`Activity logged: ${type} - ${details} - +${xpReward} XP`);
  }, [addXP, calculateXPForAction, updateStreak]);

  // Auto-tracking effect
  useEffect(() => {
    if (!autoTrack) return;

    const handleUserActivity = () => {
      if (!isActive) {
        startActivity('general', 'User interaction detected');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        endActivity();
      } else if (!isActive) {
        startActivity('general', 'Page became visible');
      }
    };

    const handleBeforeUnload = () => {
      endActivity();
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endActivity();
    };
  }, [autoTrack, isActive, startActivity, endActivity]);

  // Format duration
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityEvent['type']): string => {
    const icons = {
      coding: '💻',
      task: '✅',
      learning: '📚',
      social: '👥',
      mindfulness: '🧘',
    };
    return icons[type] || '📝';
  };

  // Get activity color
  const getActivityColor = (type: ActivityEvent['type']): string => {
    const colors = {
      coding: 'bg-blue-100 text-blue-800',
      task: 'bg-green-100 text-green-800',
      learning: 'bg-purple-100 text-purple-800',
      social: 'bg-pink-100 text-pink-800',
      mindfulness: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Activity Tracker</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <button
          onClick={() => logActivity('coding', 'Coding session')}
          className="flex flex-col items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span className="text-xl">💻</span>
          <span className="text-xs text-blue-800">Coding</span>
        </button>
        <button
          onClick={() => logActivity('task', 'Task completed')}
          className="flex flex-col items-center p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <span className="text-xl">✅</span>
          <span className="text-xs text-green-800">Task</span>
        </button>
        <button
          onClick={() => logActivity('learning', 'Learning session')}
          className="flex flex-col items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <span className="text-xl">📚</span>
          <span className="text-xs text-purple-800">Learning</span>
        </button>
        <button
          onClick={() => logActivity('social', 'Social interaction')}
          className="flex flex-col items-center p-2 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
        >
          <span className="text-xl">👥</span>
          <span className="text-xs text-pink-800">Social</span>
        </button>
        <button
          onClick={() => logActivity('mindfulness', 'Mindfulness session')}
          className="flex flex-col items-center p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <span className="text-xl">🧘</span>
          <span className="text-xs text-indigo-800">Mindful</span>
        </button>
      </div>

      {/* Session Info */}
      {showDetails && (
        <div className="space-y-4">
          {/* Current Session */}
          {isActive && sessionStart && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800">Current Session</p>
                  <p className="text-xs text-blue-600">
                    Started at {sessionStart.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">
                    {formatDuration(Date.now() - sessionStart.getTime())}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total Active Time</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDuration(totalActiveTime)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Activities Today</p>
              <p className="text-lg font-bold text-gray-900">
                {activities.length}
              </p>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Activities</p>
            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No activities yet today
                </p>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={`${activity.type}-${activity.timestamp.getTime()}`}
                    className={`flex items-center justify-between p-2 rounded-lg ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <div>
                        <p className="text-sm font-medium capitalize">{activity.type}</p>
                        {activity.details && (
                          <p className="text-xs opacity-75">{activity.details}</p>
                        )}
                        {activity.duration && (
                          <p className="text-xs opacity-75">
                            {formatDuration(activity.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-tracking Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Auto-tracking</span>
          <span className={`text-sm font-medium ${autoTrack ? 'text-green-600' : 'text-gray-400'}`}>
            {autoTrack ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
