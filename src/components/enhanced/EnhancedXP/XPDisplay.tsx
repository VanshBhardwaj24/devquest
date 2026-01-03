/**
 * Enhanced XP Display Subcomponent
 * Provides interactive XP displays with animations and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface XPDisplayProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLevel?: boolean;
  showProgress?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackViews?: boolean;
  trackInteractions?: boolean;
  className?: string;
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  currentXP,
  maxXP,
  level,
  showLevel = true,
  showProgress = true,
  showPercentage = false,
  animated = true,
  compact = false,
  size = 'md',
  color = 'text-indigo-600',
  bgColor = 'bg-indigo-100',
  xpReward = 1,
  xpSource = 'xp_display',
  showXPGain = false,
  trackViews = true,
  trackInteractions = true,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [viewCount, setViewCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lastXP, setLastXP] = useState(currentXP);

  // Calculate progress percentage
  useEffect(() => {
    const percentage = (currentXP / maxXP) * 100;
    setProgressPercentage(percentage);
    
    // Trigger animation when XP changes
    if (currentXP !== lastXP) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      setLastXP(currentXP);
    }
  }, [currentXP, maxXP, lastXP]);

  // Track views
  useEffect(() => {
    if (trackViews) {
      setViewCount(prev => prev + 1);
      
      // Award XP for viewing
      if (xpReward > 0) {
        const viewXP = viewCount === 1 ? xpReward : Math.floor(xpReward / 2);
        addXP(viewXP, `${xpSource}_view_${viewCount}`, {
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
      addXP(interactionXP, `${xpSource}_interaction_${interactionCount}`, {
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

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const containerSizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48',
  };

  if (compact) {
    return (
      <div 
        className={`relative inline-flex items-center space-x-2 px-3 py-1 ${bgColor} rounded-full cursor-pointer ${animated ? 'transition-all duration-200 hover:shadow-md' : ''} ${className}`}
        onClick={handleClick}
      >
        {/* Level */}
        {showLevel && (
          <span className={`font-bold ${color} ${sizeClasses[size]}`}>
            Lv {level}
          </span>
        )}
        
        {/* XP */}
        <span className={`${color} ${sizeClasses[size]}`}>
          {currentXP.toLocaleString()}
        </span>
        
        {/* Progress */}
        {showProgress && (
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${animated ? 'transition-all duration-500' : ''} bg-gradient-to-r from-indigo-500 to-purple-500`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        {/* Percentage */}
        {showPercentage && (
          <span className={`${color} ${sizeClasses[size]}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        )}
        
        {/* XP Reward Animation */}
        {showReward && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            <span className="font-bold">+{xpReward} XP!</span>
          </div>
        )}
        
        {/* Interaction Counter */}
        {interactionCount > 0 && (
          <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs px-1 py-0.5 rounded-full">
            {interactionCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative ${containerSizeClasses[size]} ${animated ? 'transition-all duration-300' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Circular Progress */}
      <div className="relative w-full h-full">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
            className={`${color} ${animated ? 'transition-all duration-500' : ''}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Level */}
          {showLevel && (
            <div className={`font-bold ${color} ${sizeClasses[size]} mb-1`}>
              Lv {level}
            </div>
          )}
          
          {/* XP */}
          <div className={`${color} ${sizeClasses[size]}`}>
            {currentXP.toLocaleString()}
          </div>
          
          {/* Max XP */}
          <div className={`text-gray-500 ${sizeClasses[size]}`}>
            / {maxXP.toLocaleString()}
          </div>
          
          {/* Percentage */}
          {showPercentage && (
            <div className={`${color} ${sizeClasses[size]} mt-1`}>
              {progressPercentage.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
      
      {/* Linear Progress Bar */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${animated ? 'transition-all duration-500' : ''} bg-gradient-to-r from-indigo-500 to-purple-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
      
      {/* Animation Effect */}
      {isAnimating && (
        <div className="absolute inset-0 bg-indigo-500 opacity-20 rounded-full animate-ping" />
      )}
      
      {/* Engagement Stats */}
      {(viewCount > 0 || interactionCount > 0) && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {viewCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              👁️ {viewCount}
            </div>
          )}
          {interactionCount > 0 && (
            <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              👆 {interactionCount}
            </div>
          )}
        </div>
      )}
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 opacity-10 rounded-full pointer-events-none" />
    </div>
  );
};

export default XPDisplay;
