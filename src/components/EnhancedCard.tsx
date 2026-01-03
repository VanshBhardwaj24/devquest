/**
 * Enhanced Card Component - Every card interaction can award XP
 * This component automatically tracks engagement and awards XP
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  xpReward?: number;
  xpSource?: string;
  actionType?: string;
  difficulty?: string;
  onViewXP?: number;
  onInteractXP?: number;
  showXPGain?: boolean;
  className?: string;
  hoverEffect?: boolean;
  trackView?: boolean;
  trackInteractions?: boolean;
  interactionCooldown?: number; // milliseconds
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  xpReward = 0,
  xpSource = 'card_interaction',
  actionType = 'general',
  difficulty,
  onViewXP = 5,
  onInteractXP = 10,
  showXPGain = false,
  className = '',
  hoverEffect = true,
  trackView = true,
  trackInteractions = true,
  interactionCooldown = 5000,
}) => {
  const { addXP, calculateXPForAction, currentStreak } = useUniversalXP();
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // Track card view
  useEffect(() => {
    if (trackView && !hasBeenViewed) {
      const calculatedXP = onViewXP || calculateXPForAction('view_content', difficulty);
      
      if (calculatedXP > 0) {
        addXP(calculatedXP, `${xpSource}_view`, {
          showNotification: false,
          trackActivity: false,
        });
        
        setHasBeenViewed(true);
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }
  }, [trackView, hasBeenViewed, onViewXP, calculateXPForAction, difficulty, xpSource, addXP, showXPGain]);

  // Handle interaction
  const handleInteraction = () => {
    if (!trackInteractions) return;

    const now = Date.now();
    if (now - lastInteraction < interactionCooldown) return;

    const calculatedXP = onInteractXP || calculateXPForAction(actionType, difficulty);
    
    if (calculatedXP > 0) {
      addXP(calculatedXP, `${xpSource}_interact`, {
        showNotification: showXPGain,
        trackActivity: true,
      });

      setInteractionCount(prev => prev + 1);
      setLastInteraction(now);

      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
    }
  };

  // Calculate total XP potential
  const totalXPPotential = (onViewXP || calculateXPForAction('view_content', difficulty)) + 
                           (onInteractXP || calculateXPForAction(actionType, difficulty));

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md transition-all duration-300 ${
        hoverEffect ? 'hover:shadow-lg hover:scale-105' : ''
      } ${className}`}
      onClick={handleInteraction}
    >
      {/* XP Indicator */}
      {totalXPPotential > 0 && showXPGain && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            +{totalXPPotential} XP
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        {title && (
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="flex items-center space-x-2">
              {/* View indicator */}
              {hasBeenViewed && (
                <span className="text-green-500 text-sm" title="Viewed">✓</span>
              )}
              {/* Interaction count */}
              {trackInteractions && interactionCount > 0 && (
                <span className="text-blue-500 text-sm" title="Interactions">
                  {interactionCount}x
                </span>
              )}
            </div>
          </div>
        )}
        
        {children}
      </div>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg pointer-events-none">
          <div className="bg-white rounded-lg p-3 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-sm font-bold text-indigo-600">
                +{onInteractXP || calculateXPForAction(actionType, difficulty)} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      {(hasBeenViewed || interactionCount > 0) && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          {hasBeenViewed && <span className="mr-2">👁️ Viewed</span>}
          {interactionCount > 0 && <span>👆 {interactionCount} interactions</span>}
        </div>
      )}
    </div>
  );
};

export default EnhancedCard;
