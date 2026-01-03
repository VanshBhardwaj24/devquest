/**
 * Enhanced Streak Display Subcomponent
 * Provides interactive streak displays with animations and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface StreakDisplayProps {
  currentStreak: number;
  maxStreak: number;
  streakType?: 'general' | 'coding' | 'task' | 'learning' | 'fitness';
  showAnimation?: boolean;
  animated?: boolean;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
  showBonus?: boolean;
  showMilestones?: boolean;
  milestones?: number[];
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackViews?: boolean;
  trackInteractions?: boolean;
  trackCelebrations?: boolean;
  celebrationXP?: number;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  maxStreak,
  streakType = 'general',
  showAnimation = true,
  animated = true,
  compact = false,
  size = 'md',
  color = 'text-orange-600',
  bgColor = 'bg-orange-100',
  icon,
  showProgress = true,
  showBonus = true,
  showMilestones = true,
  milestones = [3, 7, 14, 30, 50, 100],
  xpReward = 3,
  xpSource = 'streak_display',
  showXPGain = false,
  trackViews = true,
  trackInteractions = true,
  trackCelebrations = true,
  celebrationXP = 10,
  className = '',
}) => {
  const { addXP, updateStreak, calculateStreakBonus } = useUniversalXP();
  
  const [viewCount, setViewCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [lastStreak, setLastStreak] = useState(currentStreak);
  const [streakBonus, setStreakBonus] = useState(0);

  // Default icons for different streak types
  const defaultIcons = {
    general: '🔥',
    coding: '💻',
    task: '✅',
    learning: '📚',
    fitness: '🏃',
  };

  const defaultColors = {
    general: 'text-orange-600',
    coding: 'text-blue-600',
    task: 'text-green-600',
    learning: 'text-purple-600',
    fitness: 'text-red-600',
  };

  const defaultBgColors = {
    general: 'bg-orange-100',
    coding: 'bg-blue-100',
    task: 'bg-green-100',
    learning: 'bg-purple-100',
    fitness: 'bg-red-100',
  };

  // Calculate streak bonus
  useEffect(() => {
    const bonus = calculateStreakBonus(currentStreak);
    setStreakBonus(bonus);
  }, [currentStreak, calculateStreakBonus]);

  // Trigger animation when streak changes
  useEffect(() => {
    if (currentStreak !== lastStreak) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      setLastStreak(currentStreak);
    }
  }, [currentStreak, lastStreak]);

  // Track views
  useEffect(() => {
    if (trackViews) {
      setViewCount(prev => prev + 1);
      
      // Award XP for viewing
      if (xpReward > 0) {
        const viewXP = viewCount === 1 ? xpReward : Math.floor(xpReward / 2);
        addXP(viewXP, `${xpSource}_streak_view_${viewCount}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }
  }, [trackViews, viewCount, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  const handleClick = () => {
    if (!trackInteractions) return;
    
    setInteractionCount(prev => prev + 1);
    
    // Award XP for interaction
    if (xpReward > 0) {
      const interactionXP = Math.floor(xpReward / 2);
      addXP(interactionXP, `${xpSource}_streak_interaction_${interactionCount}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
    }
  };

  const handleCelebrate = () => {
    if (!trackCelebrations) return;
    
    setIsCelebrating(true);
    setCelebrationCount(prev => prev + 1);
    
    // Award XP for celebration
    if (celebrationXP > 0) {
      addXP(celebrationXP, `${xpSource}_streak_celebration_${celebrationCount}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
      }
    }
    
    setTimeout(() => setIsCelebrating(false), 2000);
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const containerSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const actualIcon = icon || defaultIcons[streakType];
  const actualColor = color || defaultColors[streakType];
  const actualBgColor = bgColor || defaultBgColors[streakType];

  // Get next milestone
  const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
  const milestoneProgress = nextMilestone ? ((currentStreak % nextMilestone) / nextMilestone) * 100 : 100;

  if (compact) {
    return (
      <div 
        className={`relative inline-flex items-center space-x-2 px-3 py-1 ${actualBgColor} rounded-full cursor-pointer ${animated ? 'transition-all duration-200 hover:shadow-md' : ''} ${className}`}
        onClick={handleClick}
      >
        {/* Icon */}
        <div className={`text-lg ${actualColor} ${isAnimating ? 'animate-bounce' : ''}`}>
          {actualIcon}
        </div>
        
        {/* Streak Count */}
        <span className={`font-bold ${actualColor} ${sizeClasses[size]}`}>
          {currentStreak}
        </span>
        
        {/* Progress */}
        {showProgress && (
          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${actualColor} ${animated ? 'transition-all duration-500' : ''}`}
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        )}
        
        {/* Bonus */}
        {showBonus && streakBonus > 0 && (
          <span className={`text-green-600 ${sizeClasses[size]}`}>
            +{streakBonus}%
          </span>
        )}
        
        {/* XP Reward Animation */}
        {showReward && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            <span className="font-bold">+{xpReward} XP!</span>
          </div>
        )}
        
        {/* Engagement Stats */}
        {(viewCount > 0 || interactionCount > 0 || celebrationCount > 0) && (
          <div className="absolute -bottom-2 -right-2 flex space-x-1">
            {viewCount > 0 && (
              <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                👁️
              </div>
            )}
            {interactionCount > 0 && (
              <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded-full">
                👆
              </div>
            )}
            {celebrationCount > 0 && (
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full">
                🎉
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleClick}
    >
      {/* Main Streak Display */}
      <div 
        className={`${containerSizeClasses[size]} ${actualBgColor} rounded-full flex flex-col items-center justify-center cursor-pointer ${animated ? 'transition-all duration-300 hover:shadow-lg' : ''} ${isAnimating ? 'animate-bounce' : ''}`}
      >
        {/* Icon */}
        <div className={`text-2xl ${actualColor} ${isCelebrating ? 'animate-spin' : ''}`}>
          {actualIcon}
        </div>
        
        {/* Streak Count */}
        <div className={`font-bold ${actualColor} ${sizeClasses[size]}`}>
          {currentStreak}
        </div>
        
        {/* Max Streak */}
        <div className={`text-gray-500 ${sizeClasses[size]}`}>
          / {maxStreak}
        </div>
        
        {/* Celebration Effect */}
        {isCelebrating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-ping">🎉</div>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Next Milestone</span>
            <span>{nextMilestone}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${actualColor} ${animated ? 'transition-all duration-500' : ''}`}
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Bonus Display */}
      {showBonus && (
        <div className="mt-2 text-center">
          <div className={`text-green-600 font-medium ${sizeClasses[size]}`}>
            Streak Bonus: +{streakBonus}%
          </div>
        </div>
      )}
      
      {/* Milestones */}
      {showMilestones && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">Milestones</div>
          <div className="flex space-x-1">
            {milestones.map((milestone, index) => (
              <div
                key={milestone}
                className={`w-2 h-2 rounded-full ${
                  currentStreak >= milestone ? actualColor.replace('text', 'bg') : 'bg-gray-300'
                }`}
                title={`${milestone} days`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Celebration Button */}
      {trackCelebrations && currentStreak > 0 && (
        <button
          onClick={handleCelebrate}
          className={`mt-2 px-3 py-1 ${actualBgColor} ${actualColor} rounded-full text-xs font-medium hover:opacity-80 transition-opacity`}
        >
          🎉 Celebrate Streak
        </button>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
      
      {/* Engagement Stats */}
      {(viewCount > 0 || interactionCount > 0 || celebrationCount > 0) && (
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          {viewCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
              👁️ {viewCount}
            </div>
          )}
          {interactionCount > 0 && (
            <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded-full">
              👆 {interactionCount}
            </div>
          )}
          {celebrationCount > 0 && (
            <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full">
              🎉 {celebrationCount}
            </div>
          )}
        </div>
      )}
      
      {/* Animation Effects */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping" />
      )}
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 opacity-10 rounded-full pointer-events-none" />
    </div>
  );
};

export default StreakDisplay;
