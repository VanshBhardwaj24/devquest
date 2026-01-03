/**
 * Enhanced Button Icon Subcomponent
 * Provides animated icons with XP rewards for button interactions
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface ButtonIconProps {
  icon: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  pulse?: boolean;
  rotate?: boolean;
  bounce?: boolean;
  color?: string;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  className?: string;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  icon,
  size = 'md',
  animated = true,
  pulse = false,
  rotate = false,
  bounce = false,
  color = 'currentColor',
  xpReward = 1,
  xpSource = 'icon_interaction',
  showXPGain = false,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const animationClasses = `
    ${animated ? 'transition-all duration-300' : ''}
    ${pulse ? 'animate-pulse' : ''}
    ${rotate ? 'hover:rotate-180' : ''}
    ${bounce ? 'hover:animate-bounce' : ''}
    ${isAnimating ? 'animate-spin' : ''}
  `;

  const handleClick = () => {
    setIsAnimating(true);
    setClickCount(prev => prev + 1);
    
    // Award XP for icon interaction
    if (xpReward > 0) {
      addXP(xpReward, `${xpSource}_icon_${clickCount + 1}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
    }
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} ${animationClasses} ${className}`}
        style={{ color }}
        onClick={handleClick}
      >
        {icon}
      </div>
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}
      
      {/* Click Counter */}
      {clickCount > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs px-1 py-0.5 rounded-full">
          {clickCount}
        </div>
      )}
    </div>
  );
};

export default ButtonIcon;
