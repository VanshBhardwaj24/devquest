/**
 * Enhanced Button Component - Every button can award XP
 * This component automatically adds XP when clicked
 */

import React, { useState } from 'react';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  xpReward?: number;
  xpSource?: string;
  actionType?: string;
  difficulty?: string;
  showXPGain?: boolean;
  cooldown?: number; // milliseconds
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  xpReward = 0,
  xpSource = 'button_click',
  actionType = 'general',
  difficulty,
  showXPGain = false,
  cooldown = 0,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const { addXP, calculateXPForAction, currentStreak } = useUniversalXP();
  const [isCooldown, setIsCooldown] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Calculate XP reward
  const calculatedXP = xpReward || calculateXPForAction(actionType, difficulty);

  // Handle click with XP award
  const handleClick = () => {
    if (disabled || isCooldown) return;

    // Call original onClick if provided
    if (onClick) {
      onClick();
    }

    // Award XP if configured
    if (calculatedXP > 0) {
      addXP(calculatedXP, xpSource, {
        showNotification: showXPGain,
        trackActivity: true,
      });

      // Show reward animation
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
      }
    }

    // Apply cooldown if configured
    if (cooldown > 0) {
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), cooldown);
    }
  };

  // Get button styles based on variant
  const getButtonStyles = () => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantStyles = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
      disabled || isCooldown ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${className}`;
  };

  return (
    <div className="relative inline-block">
      <button
        className={getButtonStyles()}
        onClick={handleClick}
        disabled={disabled || isCooldown}
      >
        {children}
        
        {/* XP indicator */}
        {calculatedXP > 0 && showXPGain && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
            +{calculatedXP} XP
          </span>
        )}
        
        {/* Cooldown indicator */}
        {isCooldown && (
          <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
            ⏳
          </span>
        )}
      </button>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg animate-bounce">
          <span className="text-sm font-bold">+{calculatedXP} XP!</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedButton;
