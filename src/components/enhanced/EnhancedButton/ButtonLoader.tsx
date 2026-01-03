/**
 * Enhanced Button Loader Subcomponent
 * Provides animated loading states with XP rewards for patience
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface ButtonLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'bounce';
  speed?: 'slow' | 'normal' | 'fast';
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  className?: string;
  text?: string;
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  size = 'md',
  color = 'currentColor',
  type = 'spinner',
  speed = 'normal',
  xpReward = 2,
  xpSource = 'loader_patience',
  showXPGain = false,
  className = '',
  text = 'Loading...',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  const [loadingTime, setLoadingTime] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [patienceBonus, setPatienceBonus] = useState(0);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
      
      // Award patience XP every 5 seconds
      if (loadingTime > 0 && loadingTime % 5 === 0) {
        const patienceXP = Math.floor(xpReward * (loadingTime / 5));
        addXP(patienceXP, `${xpSource}_patience_${loadingTime}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        setPatienceBonus(prev => prev + patienceXP);
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [loadingTime, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} ${speedClasses[speed]} border-2 border-t-transparent border-${color} rounded-full`} />
        );
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-${color} rounded-full animate-pulse`} />
        );
      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 bg-${color} animate-pulse`}
                style={{ 
                  height: size === 'xs' ? '16px' : size === 'sm' ? '20px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '40px',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        );
      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      default:
        return (
          <div className={`${sizeClasses[size]} ${speedClasses[speed]} border-2 border-t-transparent border-${color} rounded-full`} />
        );
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {renderLoader()}
      {text && (
        <span className={`text-${color} text-sm font-medium animate-pulse`}>
          {text}
        </span>
      )}
      
      {/* Patience Timer */}
      {loadingTime > 0 && (
        <div className="text-xs text-gray-500">
          {loadingTime}s
        </div>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{Math.floor(xpReward * (loadingTime / 5))} XP!</span>
          <span className="text-xs">Patience Bonus</span>
        </div>
      )}
      
      {/* Patience Bonus Indicator */}
      {patienceBonus > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
          +{patienceBonus}
        </div>
      )}
    </div>
  );
};

export default ButtonLoader;
