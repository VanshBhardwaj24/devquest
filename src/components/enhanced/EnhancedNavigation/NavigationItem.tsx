/**
 * Enhanced Navigation Item Subcomponent
 * Provides interactive navigation items with XP rewards and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';
import { Link } from 'react-router-dom';

interface NavigationItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  active?: boolean;
  disabled?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackVisits?: boolean;
  trackHover?: boolean;
  trackDuration?: boolean;
  hoverDelay?: number;
  minHoverTime?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  to,
  label,
  icon,
  badge,
  badgeColor = 'bg-red-500',
  active = false,
  disabled = false,
  xpReward = 5,
  xpSource = 'navigation',
  showXPGain = false,
  trackVisits = true,
  trackHover = false,
  trackDuration = false,
  hoverDelay = 500,
  minHoverTime = 1000,
  className = '',
  size = 'md',
  variant = 'default',
  onClick,
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [visitCount, setVisitCount] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverStartTime = useRef<number | null>(null);

  // Track visits
  useEffect(() => {
    if (trackVisits && active) {
      setVisitCount(prev => prev + 1);
      
      // Award XP for visiting
      if (xpReward > 0) {
        const visitXP = visitCount === 1 ? xpReward : Math.floor(xpReward / 2);
        addXP(visitXP, `${xpSource}_visit_${visitCount}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        setHasInteracted(true);
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }
  }, [trackVisits, active, visitCount, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  // Track hover time
  useEffect(() => {
    if (trackHover && isHovering) {
      hoverTimerRef.current = setTimeout(() => {
        setHoverTime(prev => prev + 1);
        
        // Award XP for hover time
        if (hoverTime > 0 && hoverTime % Math.floor(minHoverTime / 1000) === 0) {
          const hoverXP = Math.floor(hoverTime / (minHoverTime / 1000)) * Math.floor(xpReward / 2);
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
  }, [trackHover, isHovering, hoverTime, minHoverTime, xpReward, xpSource, addXP, updateStreak]);

  // Track duration
  useEffect(() => {
    if (trackDuration && active) {
      durationTimerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
        
        // Award XP for duration
        if (totalTime > 0 && totalTime % 10 === 0) {
          const durationXP = Math.floor(totalTime / 10) * Math.floor(xpReward / 3);
          addXP(durationXP, `${xpSource}_duration_${totalTime}`, {
            showNotification: false,
            trackActivity: true,
          });
          
          updateStreak('general');
        }
      }, 1000);
    }
    
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [trackDuration, active, totalTime, xpReward, xpSource, addXP, updateStreak]);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (hoverDelay > 0) {
      hoverStartTime.current = Date.now();
      hoverTimerRef.current = setTimeout(() => {
        setIsHovering(true);
      }, hoverDelay);
    } else {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    setIsHovering(false);
    if (hoverStartTime.current) {
      const hoverDuration = Date.now() - hoverStartTime.current;
      setHoverTime(prev => prev + Math.floor(hoverDuration / 1000));
      hoverStartTime.current = null;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    // Award XP for click
    if (xpReward > 0) {
      const clickXP = hasInteracted ? Math.floor(xpReward / 2) : xpReward;
      addXP(clickXP, `${xpSource}_click_${visitCount + 1}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      setHasInteracted(true);
      updateStreak('general');
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
    }
    
    if (onClick) {
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    primary: 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50',
    secondary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    ghost: 'text-gray-600 hover:text-gray-900',
  };

  const activeClasses = {
    default: 'text-indigo-600 bg-indigo-50 border-indigo-500',
    primary: 'text-indigo-700 bg-indigo-600 border-indigo-500',
    secondary: 'text-gray-700 bg-gray-200 border-gray-300',
    ghost: 'text-gray-700 bg-transparent border-gray-300',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const baseClasses = `
    relative inline-flex items-center space-x-2 rounded-lg font-medium transition-all duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${active ? activeClasses[variant] : ''}
    ${disabled ? disabledClasses : ''}
    ${isHovering ? 'transform scale-105' : ''}
    ${className}
  `;

  return (
    <div className="relative inline-block">
      <Link
        to={to}
        className={baseClasses}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Icon */}
        {icon && (
          <span className={`text-lg ${isHovering ? 'scale-110' : ''} transition-transform`}>
            {icon}
          </span>
        )}
        
        {/* Label */}
        <span className={`${isHovering ? 'font-semibold' : ''}`}>
          {label}
        </span>
        
        {/* Badge */}
        {badge && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor} animate-pulse`}>
            {badge}
          </span>
        )}
        
        {/* Active Indicator */}
        {active && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
        )}
        
        {/* Hover Indicator */}
        {isHovering && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full animate-pulse" />
        )}
        
        {/* Engagement Stats */}
        {hasInteracted && (
          <div className="absolute -top-2 -right-2 flex space-x-1">
            {visitCount > 0 && (
              <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {visitCount}
              </div>
            )}
            {hoverTime > 0 && (
              <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {Math.floor(hoverTime)}s
              </div>
            )}
            {totalTime > 0 && (
              <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {Math.floor(totalTime)}s
              </div>
            )}
          </div>
        )}
      </Link>
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
    </div>
  );
};

export default NavigationItem;
