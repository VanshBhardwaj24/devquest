/**
 * Enhanced XP Progress Bar Subcomponent
 * Provides interactive progress bars with animations and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLevel?: boolean;
  showXP?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  gradient?: boolean;
  rounded?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackViews?: boolean;
  trackInteractions?: boolean;
  trackHover?: boolean;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  maxXP,
  level,
  showLevel = true,
  showXP = true,
  showPercentage = false,
  animated = true,
  compact = false,
  size = 'md',
  color = 'bg-indigo-500',
  bgColor = 'bg-gray-200',
  gradient = true,
  rounded = true,
  xpReward = 1,
  xpSource = 'xp_progress',
  showXPGain = false,
  trackViews = true,
  trackInteractions = true,
  trackHover = false,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastXP, setLastXP] = useState(currentXP);
  const [isHovering, setIsHovering] = useState(false);
  
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Track hover time
  useEffect(() => {
    if (trackHover && isHovering) {
      hoverTimerRef.current = setTimeout(() => {
        setHoverTime(prev => prev + 1);
        
        // Award XP for hover time
        if (hoverTime > 0 && hoverTime % 3 === 0) {
          const hoverXP = Math.floor(hoverTime / 3) * Math.floor(xpReward / 3);
          addXP(hoverXP, `${xpSource}_hover_${hoverTime}`, {
            showNotification: false,
            trackActivity: true,
          });
          
          updateStreak('general');
        }
      }, 1000);
    }
    
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [trackHover, isHovering, hoverTime, xpReward, xpSource, addXP, updateStreak]);

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

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const progressColor = gradient 
    ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
    : color;

  if (compact) {
    return (
      <div 
        className={`relative inline-flex items-center space-x-2 px-3 py-1 ${bgColor} rounded-full cursor-pointer ${animated ? 'transition-all duration-200 hover:shadow-md' : ''} ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Level */}
        {showLevel && (
          <span className={`font-bold text-indigo-600 ${textSizeClasses[size]}`}>
            Lv {level}
          </span>
        )}
        
        {/* Progress Bar */}
        <div className={`w-16 ${sizeClasses[size]} ${bgColor} rounded-full overflow-hidden`}>
          <div 
            className={`h-full ${progressColor} ${animated ? 'transition-all duration-500' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* XP */}
        {showXP && (
          <span className={`text-gray-600 ${textSizeClasses[size]}`}>
            {currentXP}/{maxXP}
          </span>
        )}
        
        {/* Percentage */}
        {showPercentage && (
          <span className={`text-gray-500 ${textSizeClasses[size]}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        )}
        
        {/* XP Reward Animation */}
        {showReward && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            <span className="font-bold">+{xpReward} XP!</span>
          </div>
        )}
        
        {/* Engagement Stats */}
        {(viewCount > 0 || interactionCount > 0 || hoverTime > 0) && (
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
            {hoverTime > 0 && (
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded-full">
                ⏱️
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {/* Level */}
        {showLevel && (
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-indigo-600 ${textSizeClasses[size]}`}>
              Level {level}
            </span>
            {isAnimating && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
        )}
        
        {/* XP Display */}
        {showXP && (
          <div className="flex items-center space-x-2">
            <span className={`text-gray-600 ${textSizeClasses[size]}`}>
              {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
            </span>
            {showPercentage && (
              <span className={`text-gray-500 ${textSizeClasses[size]}`}>
                ({progressPercentage.toFixed(1)}%)
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className={`relative ${sizeClasses[size]} ${bgColor} ${rounded ? 'rounded-full' : 'rounded'} overflow-hidden cursor-pointer`}>
        {/* Background */}
        <div className={`absolute inset-0 ${bgColor}`} />
        
        {/* Progress */}
        <div 
          className={`absolute inset-0 ${progressColor} ${animated ? 'transition-all duration-500' : ''}`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Animated Overlay */}
        {isAnimating && (
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
        )}
        
        {/* Hover Effect */}
        {isHovering && (
          <div className="absolute inset-0 bg-white opacity-10" />
        )}
        
        {/* Percentage Text */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-white font-medium ${textSizeClasses[size]} drop-shadow-lg`}>
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Milestone Markers */}
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <div
            key={milestone}
            className={`w-2 h-2 rounded-full ${
              progressPercentage >= milestone ? 'bg-indigo-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
      
      {/* Engagement Stats */}
      {(viewCount > 0 || interactionCount > 0 || hoverTime > 0) && (
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
          {hoverTime > 0 && (
            <div className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              ⏱️ {hoverTime}s
            </div>
          )}
        </div>
      )}
      
      {/* Hover Indicator */}
      {isHovering && (
        <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default XPProgressBar;
