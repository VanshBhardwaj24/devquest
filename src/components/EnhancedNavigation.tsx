/**
 * Enhanced Navigation Component - Every navigation action can award XP
 * This component automatically awards XP for navigation and exploration
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface EnhancedNavigationProps {
  items: Array<{
    id: string;
    label: string;
    path: string;
    icon?: string;
    xpReward?: number;
    difficulty?: string;
  }>;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackExploration?: boolean;
  className?: string;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  items,
  xpReward = 5,
  xpSource = 'navigation',
  showXPGain = false,
  trackExploration = true,
  className = '',
}) => {
  const { addXP, calculateXPForAction, currentStreak } = useUniversalXP();
  const location = useLocation();
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());
  const [showReward, setShowReward] = useState(false);

  // Track page visits
  useEffect(() => {
    if (!trackExploration) return;

    const currentPage = location.pathname;
    
    if (!visitedPages.has(currentPage)) {
      const calculatedXP = xpReward || calculateXPForAction('page_visit');
      
      if (calculatedXP > 0) {
        addXP(calculatedXP, `${xpSource}_visit_${currentPage}`, {
          showNotification: false,
          trackActivity: true,
        });
        
        setVisitedPages(prev => new Set([...prev, currentPage]));
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1000);
        }
      }
    }
  }, [location.pathname, visitedPages, trackExploration, xpReward, calculateXPForAction, xpSource, addXP, showXPGain]);

  // Handle navigation click
  const handleNavClick = (item: any) => {
    const calculatedXP = item.xpReward || calculateXPForAction('navigation_click', item.difficulty);
    
    if (calculatedXP > 0) {
      addXP(calculatedXP, `${xpSource}_click_${item.id}`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1000);
      }
    }
  };

  return (
    <nav className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="space-y-2">
        {items.map((item) => {
          const isVisited = visitedPages.has(item.path);
          const itemXP = item.xpReward || calculateXPForAction('navigation_click', item.difficulty);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                  : isVisited
                  ? 'bg-green-50 text-green-700 border-2 border-green-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon && <span className="text-xl">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* XP indicator */}
                {itemXP > 0 && showXPGain && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                    +{itemXP} XP
                  </span>
                )}
                
                {/* Visit indicator */}
                {isVisited && (
                  <span className="text-green-500 text-sm" title="Visited">✓</span>
                )}
                
                {/* Current page indicator */}
                {location.pathname === item.path && (
                  <span className="text-indigo-500 text-sm" title="Current">→</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="fixed top-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
          <span className="text-sm font-bold">+{xpReward} XP for exploration!</span>
        </div>
      )}

      {/* Exploration Stats */}
      {trackExploration && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Pages Explored</span>
            <span className="font-medium">{visitedPages.size} / {items.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ 
                width: `${(visitedPages.size / items.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default EnhancedNavigation;
