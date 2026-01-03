/**
 * Enhanced Card Content Subcomponent
 * Provides interactive content areas with XP rewards and engagement tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface CardContentProps {
  children: React.ReactNode;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackReading?: boolean;
  trackScrolling?: boolean;
  trackInteraction?: boolean;
  readingTimeXP?: number;
  scrollXP?: number;
  interactionXP?: number;
  minReadingTime?: number;
  minScrollDistance?: number;
  className?: string;
  maxHeight?: number;
  expandable?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  xpReward = 3,
  xpSource = 'content_interaction',
  showXPGain = false,
  trackReading = true,
  trackScrolling = false,
  trackInteraction = true,
  readingTimeXP = 2,
  scrollXP = 1,
  interactionXP = 1,
  minReadingTime = 5,
  minScrollDistance = 100,
  className = '',
  maxHeight = 200,
  expandable = false,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [readingTime, setReadingTime] = useState(0);
  const [hasBeenRead, setHasBeenRead] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(0);
  
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track reading time
  useEffect(() => {
    if (trackReading && isExpanded) {
      readingTimerRef.current = setInterval(() => {
        setReadingTime(prev => prev + 1);
        
        // Award XP for reading time
        if (readingTime > 0 && readingTime % minReadingTime === 0) {
          const readingXP = Math.floor(readingTime / minReadingTime) * readingTimeXP;
          addXP(readingXP, `${xpSource}_reading_${readingTime}`, {
            showNotification: showXPGain,
            trackActivity: true,
          });
          
          setHasBeenRead(true);
          updateStreak('general');
          
          if (showXPGain) {
            setShowReward(true);
            setTimeout(() => setShowReward(false), 1500);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [trackReading, isExpanded, readingTime, minReadingTime, readingTimeXP, xpSource, showXPGain, addXP, updateStreak]);

  // Track scrolling
  useEffect(() => {
    if (trackScrolling && contentRef.current && isExpanded) {
      const handleScroll = () => {
        const element = contentRef.current;
        if (!element) return;
        
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        // Calculate scroll distance
        const newScrollDistance = scrollTop + (scrollHeight - clientHeight);
        setScrollDistance(newScrollDistance);
        
        // Award XP for scrolling
        if (newScrollDistance > scrollDistance && newScrollDistance - scrollDistance >= minScrollDistance) {
          const scrollXP = Math.floor((newScrollDistance - scrollDistance) / minScrollDistance) * scrollXP;
          addXP(scrollXP, `${xpSource}_scroll_${newScrollDistance}`, {
            showNotification: false,
            trackActivity: true,
          });
          
          updateStreak('general');
        }
      };
      
      const element = contentRef.current;
      element.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, [trackScrolling, isExpanded, scrollDistance, minScrollDistance, scrollXP, xpSource, addXP, updateStreak]);

  // Track interactions
  useEffect(() => {
    if (trackInteraction && contentRef.current) {
      const handleInteraction = () => {
        const now = Date.now();
        if (now - lastInteraction < 1000) return; // 1 second cooldown
        
        setIsInteracting(true);
        setLastInteraction(now);
        setInteractionCount(prev => prev + 1);
        
        // Award XP for interactions
        if (interactionXP > 0) {
          addXP(interactionXP, `${xpSource}_interaction_${interactionCount + 1}`, {
            showNotification: showXPGain,
            trackActivity: true,
          });
          
          updateStreak('general');
          
          if (showXPGain) {
            setShowReward(true);
            setTimeout(() => setShowReward(false), 1500);
          }
        
        setTimeout(() => setIsInteracting(false), 200);
      };
      
      const element = contentRef.current;
      element.addEventListener('click', handleInteraction);
      element.addEventListener('mousedown', handleInteraction);
      element.addEventListener('touchstart', handleInteraction);
      
      return () => {
        element.removeEventListener('click', handleInteraction);
        element.removeEventListener('mousedown', handleInteraction);
        element.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [trackInteraction, lastInteraction, interactionCount, interactionXP, xpSource, showXPGain, addXP, updateStreak]);

  const handleExpandToggle = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
      
      // Award XP for expanding/collapsing
      const expandXP = xpReward;
      addXP(expandXP, `${xpSource}_expand_${!isExpanded ? 'expand' : 'collapse'}`, {
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

  return (
    <div className={`relative ${className}`}>
      {/* Expand/Collapse Button */}
      {(expandable || collapsible) && (
        <button
          onClick={handleExpandToggle}
          className="absolute top-2 right-2 z-10 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <span className="text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </span>
        </button>
      )}
      
      {/* Content Container */}
      <div
        ref={contentRef}
        className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-50'} ${
          maxHeight ? (isExpanded ? 'overflow-y-auto' : 'overflow-hidden') : ''
        }`}
        style={{
          maxHeight: isExpanded ? maxHeight : 0,
        }}
      >
        {children}
      </div>
      
      {/* Reading Progress Indicator */}
      {trackReading && isExpanded && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Reading Time: {readingTime}s</span>
            {hasBeenRead && <span className="text-green-500">✓</span>}
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min((readingTime / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Scroll Progress Indicator */}
      {trackScrolling && isExpanded && scrollDistance > 0 && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Scrolled: {Math.floor(scrollDistance)}px</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.min((scrollDistance / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Interaction Indicator */}
      {trackInteraction && (
        <div className="absolute top-2 left-2 flex items-center space-x-2">
          {isInteracting && (
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          )}
          {interactionCount > 0 && (
            <span className="text-xs text-gray-500">
              {interactionCount} interactions
            </span>
          )}
        </div>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      
      {/* Engagement Stats */}
      {(readingTime > 0 || scrollDistance > 0 || interactionCount > 0) && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {readingTime > 0 && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {readingTime}s
            </div>
          )}
          {scrollDistance > 0 && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {Math.floor(scrollDistance)}px
            </div>
          )}
          {interactionCount > 0 && (
            <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {interactionCount}
            </div>
          )}
        </div>
      )}
      
      {/* Hover Effect */}
      {isExpanded && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 opacity-10 pointer-events-none" />
      )}
    </div>
  );
};

export default CardContent;
