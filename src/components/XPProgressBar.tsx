/**
 * XP Progress Bar Component
 * Reusable component for displaying XP progress with animations and milestones
 */

import React, { useMemo } from 'react';
import { useXPSystem } from '../hooks/useXPSystem';

interface XPProgressBarProps {
  showDetails?: boolean;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  showDetails = true,
  animated = true,
  compact = false,
  className = '',
}) => {
  const { currentXP, currentLevel, xpToNextLevel, progress, stats } = useXPSystem();

  // Calculate percentage for progress bar
  const percentage = useMemo(() => {
    return Math.min(Math.max((progress.levelXP / progress.neededXP) * 100, 0), 100);
  }, [progress.levelXP, progress.neededXP]);

  // Get color based on progress
  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (percentage >= 60) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (percentage >= 40) return 'bg-gradient-to-r from-green-500 to-blue-500';
    if (percentage >= 20) return 'bg-gradient-to-r from-yellow-500 to-green-500';
    return 'bg-gradient-to-r from-red-500 to-yellow-500';
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Level {currentLevel}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor()} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">{progress.xpToNext} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Level {currentLevel}</h3>
          <p className="text-sm text-gray-600">{stats.rank}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{currentXP.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{progress.levelXP.toLocaleString()} XP</span>
          <span>{xpToNextLevel.toLocaleString()} XP</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} ${animated ? 'transition-all duration-1000 ease-out' : ''} relative`}
            style={{ width: `${percentage}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{percentage.toFixed(1)}% Complete</span>
          <span>{progress.xpToNext.toLocaleString()} XP to next level</span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-600">Current Level XP</p>
            <p className="font-semibold">{stats.xpForCurrentLevel.toLocaleString()} XP</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-600">Next Level XP</p>
            <p className="font-semibold">{stats.xpForNextLevel.toLocaleString()} XP</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-600">Total Earned</p>
            <p className="font-semibold">{currentXP.toLocaleString()} XP</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-600">Multiplier</p>
            <p className="font-semibold">{stats.rank}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
