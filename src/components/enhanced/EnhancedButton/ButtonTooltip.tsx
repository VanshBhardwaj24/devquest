/**
 * Enhanced Button Tooltip Subcomponent
 * Provides interactive tooltips with XP rewards for exploration
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface ButtonTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  delay?: number;
  duration?: number;
  arrow?: boolean;
  animated?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const ButtonTooltip: React.FC<ButtonTooltipProps> = ({
  content,
  position = 'top',
  size = 'md',
  color = 'white',
  bgColor = 'bg-gray-800',
  delay = 500,
  duration = 2000,
  arrow = true,
  animated = true,
  xpReward = 1,
  xpSource = 'tooltip_view',
  showXPGain = false,
  className = '',
  children,
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
    xl: 'text-xl px-6 py-3',
  };

  const positionClasses = {
    'top': 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    'bottom': 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    'left': 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    'right': 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2',
  };

  const arrowClasses = {
    'top': 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-gray-800',
    'bottom': 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-gray-800',
    'left': 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-gray-800',
    'right': 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-gray-800',
    'top-left': 'top-full right-0 border-l-transparent border-r-transparent border-b-gray-800',
    'top-right': 'top-full left-0 border-l-transparent border-r-transparent border-b-gray-800',
    'bottom-left': 'bottom-full right-0 border-l-transparent border-r-transparent border-t-gray-800',
    'bottom-right': 'bottom-full left-0 border-l-transparent border-r-transparent border-t-gray-800',
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      
      // Award XP for viewing tooltip
      if (!hasBeenViewed && xpReward > 0) {
        addXP(xpReward, `${xpSource}_first_view`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        setHasBeenViewed(true);
        setViewCount(1);
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      } else if (xpReward > 0) {
        setViewCount(prev => prev + 1);
        
        // Award XP for additional views
        if (viewCount > 0 && viewCount % 5 === 0) {
          addXP(xpReward, `${xpSource}_view_${viewCount + 1}`, {
            showNotification: false,
            trackActivity: true,
          });
          
          updateStreak('general');
          
          if (showXPGain) {
            setShowReward(true);
            setTimeout(() => setShowReward(false), 1500);
          }
        }
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      
      {/* Tooltip */}
      {isVisible && (
        <div className={`absolute z-50 ${sizeClasses[size]} ${bgColor} ${positionClasses[position]} ${animated ? 'transition-all duration-200' : ''} rounded-lg shadow-lg`}>
          {arrow && (
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
          )}
          
          <div className={`${sizeClasses[size]} ${color} text-center`}>
            {content}
            
            {/* View indicator */}
            {viewCount > 0 && (
              <div className="mt-1 text-xs opacity-75">
                Viewed {viewCount}x
              </div>
            )}
            
            {/* XP indicator */}
            {xpReward > 0 && (
              <div className="mt-1 text-xs font-bold text-green-400">
                +{xpReward} XP
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
      
      {/* View Counter */}
      {viewCount > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs px-1 py-0.5 rounded-full">
          {viewCount}
        </div>
      )}
      
      {/* Hover indicator */}
      <div
        className="absolute inset-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default ButtonTooltip;
