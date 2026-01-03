/**
 * Enhanced XP Reward Subcomponent
 * Provides interactive reward displays with animations and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface XPRewardProps {
  amount: number;
  source: string;
  type?: 'xp' | 'streak' | 'achievement' | 'bonus' | 'milestone';
  showAnimation?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  maxProgress?: number;
  xpReward?: number;
  showXPGain?: boolean;
  trackViews?: boolean;
  trackInteractions?: boolean;
  trackCelebrations?: boolean;
  celebrationXP?: number;
  className?: string;
}

export const XPReward: React.FC<XPRewardProps> = ({
  amount,
  source,
  type = 'xp',
  showAnimation = true,
  animated = true,
  size = 'md',
  color = 'text-green-600',
  bgColor = 'bg-green-100',
  icon,
  title,
  description,
  showProgress = false,
  progress = 0,
  maxProgress = 100,
  xpReward = 2,
  showXPGain = false,
  trackViews = true,
  trackInteractions = true,
  trackCelebrations = true,
  celebrationXP = 5,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [viewCount, setViewCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [lastAmount, setLastAmount] = useState(amount);

  // Default icons for different types
  const defaultIcons = {
    xp: '⚡',
    streak: '🔥',
    achievement: '🏆',
    bonus: '💎',
    milestone: '🎯',
  };

  const defaultColors = {
    xp: 'text-green-600',
    streak: 'text-orange-600',
    achievement: 'text-purple-600',
    bonus: 'text-blue-600',
    milestone: 'text-indigo-600',
  };

  const defaultBgColors = {
    xp: 'bg-green-100',
    streak: 'bg-orange-100',
    achievement: 'bg-purple-100',
    bonus: 'bg-blue-100',
    milestone: 'bg-indigo-100',
  };

  // Trigger animation when amount changes
  useEffect(() => {
    if (amount !== lastAmount) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      setLastAmount(amount);
    }
  }, [amount, lastAmount]);

  // Track views
  useEffect(() => {
    if (trackViews) {
      setViewCount(prev => prev + 1);
      
      // Award XP for viewing
      if (xpReward > 0) {
        const viewXP = viewCount === 1 ? xpReward : Math.floor(xpReward / 2);
        addXP(viewXP, `${source}_reward_view_${viewCount}`, {
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
  }, [trackViews, viewCount, xpReward, source, showXPGain, addXP, updateStreak]);

  const handleClick = () => {
    if (!trackInteractions) return;
    
    setInteractionCount(prev => prev + 1);
    
    // Award XP for interaction
    if (xpReward > 0) {
      const interactionXP = Math.floor(xpReward / 2);
      addXP(interactionXP, `${source}_reward_interaction_${interactionCount}`, {
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
      addXP(celebrationXP, `${source}_reward_celebration_${celebrationCount}`, {
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

  const actualIcon = icon || defaultIcons[type];
  const actualColor = color || defaultColors[type];
  const actualBgColor = bgColor || defaultBgColors[type];

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleClick}
    >
      {/* Main Reward Display */}
      <div 
        className={`${containerSizeClasses[size]} ${actualBgColor} rounded-full flex items-center justify-center cursor-pointer ${animated ? 'transition-all duration-300 hover:shadow-lg' : ''} ${isAnimating ? 'animate-bounce' : ''}`}
      >
        {/* Icon */}
        <div className={`text-2xl ${actualColor} ${isCelebrating ? 'animate-spin' : ''}`}>
          {actualIcon}
        </div>
        
        {/* Amount */}
        <div className={`absolute bottom-0 right-0 ${actualColor} font-bold ${sizeClasses[size]}`}>
          +{amount}
        </div>
        
        {/* Celebration Effect */}
        {isCelebrating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-ping">🎉</div>
          </div>
        )}
      </div>
      
      {/* Title and Description */}
      {(title || description) && (
        <div className="mt-2 text-center">
          {title && (
            <div className={`font-semibold ${actualColor} ${sizeClasses[size]}`}>
              {title}
            </div>
          )}
          {description && (
            <div className={`text-gray-600 ${sizeClasses[size]}`}>
              {description}
            </div>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${actualColor} ${animated ? 'transition-all duration-500' : ''}`}
              style={{ width: `${(progress / maxProgress) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Celebration Button */}
      {trackCelebrations && (
        <button
          onClick={handleCelebrate}
          className={`mt-2 px-3 py-1 ${actualBgColor} ${actualColor} rounded-full text-xs font-medium hover:opacity-80 transition-opacity`}
        >
          🎉 Celebrate
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

export default XPReward;
