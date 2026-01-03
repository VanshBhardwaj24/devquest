/**
 * Enhanced Card Header Subcomponent
 * Provides interactive headers with XP rewards and engagement tracking
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  avatar?: string;
  status?: 'active' | 'inactive' | 'pending' | 'completed' | 'archived';
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  clickable?: boolean;
  animated?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-500',
  icon,
  avatar,
  status = 'active',
  xpReward = 5,
  xpSource = 'header_interaction',
  showXPGain = false,
  clickable = true,
  animated = true,
  className = '',
  actions,
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    active: '🟢',
    inactive: '⚪',
    pending: '⏳',
    completed: '✅',
    archived: '📁',
  };

  const handleClick = () => {
    if (!clickable) return;

    setIsHovered(true);
    setClickCount(prev => prev + 1);
    setHasInteracted(true);

    // Award XP for header interaction
    if (xpReward > 0) {
      const interactionXP = hasInteracted ? Math.floor(xpReward / 2) : xpReward;
      addXP(interactionXP, `${xpSource}_header_${clickCount + 1}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });

      updateStreak('general');

      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
    }

    setTimeout(() => setIsHovered(false), 200);
  };

  return (
    <div 
      className={`relative ${clickable ? 'cursor-pointer' : ''} ${animated ? 'transition-all duration-200' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => clickable && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          {avatar && (
            <img
              src={avatar}
              alt={title}
              className={`w-12 h-12 rounded-full object-cover ${isHovered ? 'ring-2 ring-indigo-500' : ''}`}
            />
          )}
          
          {/* Icon */}
          {icon && !avatar && (
            <div className={`text-2xl ${isHovered ? 'scale-110' : ''} transition-transform`}>
              {icon}
            </div>
          )}
          
          {/* Text Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-semibold text-gray-800 ${isHovered ? 'text-indigo-600' : ''} transition-colors`}>
                {title}
              </h3>
              
              {/* Badge */}
              {badge && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor} animate-pulse`}>
                  {badge}
                </span>
              )}
              
              {/* Status */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
                {statusIcons[status]} {status}
              </span>
            </div>
            
            {subtitle && (
              <p className={`text-sm text-gray-600 ${isHovered ? 'text-gray-800' : ''} transition-colors`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
        
        {/* Interaction Indicator */}
        {clickable && (
          <div className="flex items-center space-x-2">
            {isHovered && (
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            )}
            {hasInteracted && (
              <div className="text-xs text-gray-500">
                {clickCount}x
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{hasInteracted ? Math.floor(xpReward / 2) : xpReward} XP!</span>
        </div>
      )}
      
      {/* Hover Effect */}
      {clickable && isHovered && (
        <div className="absolute inset-0 bg-indigo-50 rounded-lg opacity-20 pointer-events-none" />
      )}
      
      {/* Progress Bar */}
      {hasInteracted && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${Math.min((clickCount / 10) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CardHeader;
