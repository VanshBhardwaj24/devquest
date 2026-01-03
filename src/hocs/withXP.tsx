/**
 * Higher-Order Component: withXP
 * Automatically adds XP logic to ANY component without manual implementation
 * This ensures every component can award XP and track engagement
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface WithXPConfig {
  xpReward?: number;
  xpSource?: string;
  actionType?: string;
  difficulty?: string;
  trackMount?: boolean;
  trackUnmount?: boolean;
  trackInteraction?: boolean;
  interactionXP?: number;
  showXPGain?: boolean;
  cooldown?: number;
  minInteractionTime?: number; // milliseconds
  trackHover?: boolean;
  hoverXP?: number;
  trackScroll?: boolean;
  scrollXP?: number;
  trackFocus?: boolean;
  focusXP?: number;
  trackVisibility?: boolean;
  visibilityXP?: number;
  trackDuration?: boolean;
  durationXP?: number;
  durationInterval?: number; // milliseconds
}

interface WithXPProps {
  config?: WithXPConfig;
  children: React.ReactElement;
  className?: string;
  [key: string]: any;
}

/**
 * Higher-order component that automatically adds XP logic to any component
 * Usage: const EnhancedComponent = withXP(OriginalComponent, { xpReward: 10 });
 */
export function withXP<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: WithXPConfig = {}
) {
  return function WithXPWrapper(props: P & WithXPProps) {
    const { config: propConfig, children, className, ...restProps } = props;
    const finalConfig = { ...config, ...propConfig };
    
    return <WithXPComponent config={finalConfig}>
      <WrappedComponent {...(restProps as P)} className={className}>
        {children}
      </WrappedComponent>
    </WithXPComponent>;
  };
}

/**
 * Internal component that handles all XP logic automatically
 */
function WithXPComponent({ 
  config, 
  children 
}: { 
  config: WithXPConfig; 
  children: React.ReactNode; 
}) {
  const { 
    addXP, 
    updateStreak, 
    calculateXPForAction,
    currentStreak 
  } = useUniversalXP();
  
  const elementRef = useRef<HTMLElement>(null);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(0);
  const [showReward, setShowReward] = useState(false);
  
  // Default configuration
  const {
    xpReward = 5,
    xpSource = 'component_interaction',
    actionType = 'general',
    difficulty,
    trackMount = true,
    trackUnmount = false,
    trackInteraction = true,
    interactionXP = 2,
    showXPGain = false,
    cooldown = 1000,
    minInteractionTime = 500,
    trackHover = false,
    hoverXP = 1,
    trackScroll = false,
    scrollXP = 3,
    trackFocus = false,
    focusXP = 2,
    trackVisibility = false,
    visibilityXP = 5,
    trackDuration = false,
    durationXP = 1,
    durationInterval = 5000, // Award XP every 5 seconds of engagement
  } = config;

  // Calculate XP reward
  const calculatedXP = xpReward || calculateXPForAction(actionType, difficulty);

  // Award XP on mount
  useEffect(() => {
    if (trackMount && calculatedXP > 0) {
      addXP(calculatedXP, `${xpSource}_mount`, {
        showNotification: false,
        trackActivity: true,
      });
      
      if (showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1000);
      }
    }
  }, []);

  // Award XP on unmount
  useEffect(() => {
    return () => {
      if (trackUnmount && calculatedXP > 0) {
        addXP(calculatedXP, `${xpSource}_unmount`, {
          showNotification: false,
          trackActivity: false,
        });
      }
    };
  }, []);

  // Handle interaction tracking
  const handleInteraction = useCallback(() => {
    if (!trackInteraction) return;
    
    const now = Date.now();
    if (now - lastInteraction < cooldown) return;
    
    setIsInteracting(true);
    setLastInteraction(now);
    setInteractionCount(prev => prev + 1);
    
    // Start interaction timer
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    
    interactionTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
      
      // Award XP for sustained interaction
      if (interactionXP > 0) {
        addXP(interactionXP, `${xpSource}_interaction_${interactionCount}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1000);
        }
      }
    }, minInteractionTime);
    
    // Update streak for interaction
    updateStreak('general');
  }, [trackInteraction, cooldown, interactionXP, xpSource, interactionCount, showXPGain, addXP, updateStreak]);

  // Handle hover tracking
  const handleMouseEnter = useCallback(() => {
    if (!trackHover) return;
    
    setIsHovering(true);
    
    if (hoverXP > 0) {
      hoverTimerRef.current = setTimeout(() => {
        addXP(hoverXP, `${xpSource}_hover`, {
          showNotification: false,
          trackActivity: false,
        });
      }, 1000);
    }
  }, [trackHover, hoverXP, xpSource, addXP]);

  const handleMouseLeave = useCallback(() => {
    if (!trackHover) return;
    
    setIsHovering(false);
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  }, [trackHover]);

  // Handle scroll tracking
  const handleScroll = useCallback(() => {
    if (!trackScroll) return;
    
    if (scrollXP > 0) {
      addXP(scrollXP, `${xpSource}_scroll`, {
        showNotification: false,
        trackActivity: true,
      });
    }
  }, [trackScroll, scrollXP, xpSource, addXP]);

  // Handle focus tracking
  const handleFocus = useCallback(() => {
    if (!trackFocus) return;
    
    setIsFocused(true);
    
    if (focusXP > 0) {
      focusTimerRef.current = setTimeout(() => {
        addXP(focusXP, `${xpSource}_focus`, {
          showNotification: false,
          trackActivity: true,
        });
      }, 2000);
    }
  }, [trackFocus, focusXP, xpSource, addXP]);

  const handleBlur = useCallback(() => {
    if (!trackFocus) return;
    
    setIsFocused(false);
    
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
  }, [trackFocus]);

  // Handle visibility tracking
  useEffect(() => {
    if (!trackVisibility) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            if (visibilityXP > 0) {
              visibilityTimerRef.current = setTimeout(() => {
                addXP(visibilityXP, `${xpSource}_visible`, {
                  showNotification: false,
                  trackActivity: true,
                });
              }, 1000);
            }
          } else {
            setIsVisible(false);
            
            if (visibilityTimerRef.current) {
              clearTimeout(visibilityTimerRef.current);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [trackVisibility, visibilityXP, xpSource, addXP]);

  // Handle duration tracking
  useEffect(() => {
    if (!trackDuration) return;
    
    durationTimerRef.current = setInterval(() => {
      setTotalDuration(prev => prev + durationInterval);
      
      if (durationXP > 0) {
        addXP(durationXP, `${xpSource}_duration`, {
          showNotification: false,
          trackActivity: true,
        });
      }
    }, durationInterval);

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [trackDuration, durationXP, durationInterval, xpSource, addXP]);

  // Handle scroll events on the element
  useEffect(() => {
    if (!trackScroll || !elementRef.current) return;
    
    const element = elementRef.current;
    const handleScrollEvent = () => handleScroll();
    
    element.addEventListener('scroll', handleScrollEvent, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScrollEvent);
    };
  }, [trackScroll, handleScroll]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  // Clone child and add event handlers
  const child = React.Children.only(children) as React.ReactElement;
  
  const enhancedChild = React.cloneElement(child, {
    ref: elementRef,
    onClick: (e: React.MouseEvent) => {
      handleInteraction();
      if (child.props.onClick) child.props.onClick(e);
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      if (child.props.onMouseEnter) child.props.onMouseEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      if (child.props.onMouseLeave) child.props.onMouseLeave(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      if (child.props.onFocus) child.props.onFocus(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      if (child.props.onBlur) child.props.onBlur(e);
    },
  });

  return (
    <div className="relative">
      {enhancedChild}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{calculatedXP} XP!</span>
        </div>
      )}
      
      {/* Engagement Indicators */}
      {(isInteracting || isHovering || isVisible || isFocused) && (
        <div className="absolute top-0 right-0 mt-1 mr-1 flex space-x-1">
          {isInteracting && <span className="text-green-500 text-xs" title="Interacting">⚡</span>}
          {isHovering && <span className="text-blue-500 text-xs" title="Hovering">👁️</span>}
          {isVisible && <span className="text-purple-500 text-xs" title="Visible">👁️</span>}
          {isFocused && <span className="text-orange-500 text-xs" title="Focused">🎯</span>}
        </div>
      )}
      
      {/* Stats Display */}
      {(interactionCount > 0 || totalDuration > 0) && (
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">
          {interactionCount > 0 && <span className="mr-2">👆 {interactionCount}</span>}
          {totalDuration > 0 && <span>⏱️ {Math.floor(totalDuration / 1000)}s</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for automatic XP integration in functional components
 * Usage: const xpProps = useAutoXP({ xpReward: 10, trackInteraction: true });
 */
export function useAutoXP(config: WithXPConfig = {}) {
  const { 
    addXP, 
    updateStreak, 
    calculateXPForAction 
  } = useUniversalXP();
  
  const {
    xpReward = 5,
    xpSource = 'auto_component',
    actionType = 'general',
    difficulty,
    showXPGain = false,
  } = config;

  const calculatedXP = xpReward || calculateXPForAction(actionType, difficulty);

  const awardXP = useCallback((customXP?: number, customSource?: string) => {
    const xp = customXP || calculatedXP;
    const source = customSource || xpSource;
    
    addXP(xp, source, {
      showNotification: showXPGain,
      trackActivity: true,
    });
    
    updateStreak('general');
  }, [addXP, updateStreak, calculatedXP, xpSource, showXPGain]);

  const trackInteraction = useCallback(() => {
    awardXP();
  }, [awardXP]);

  const trackCompletion = useCallback(() => {
    const completionXP = calculatedXP * 2; // Double XP for completion
    awardXP(completionXP, `${xpSource}_complete`);
  }, [awardXP, calculatedXP, xpSource]);

  const trackMilestone = useCallback((multiplier: number = 3) => {
    const milestoneXP = calculatedXP * multiplier;
    awardXP(milestoneXP, `${xpSource}_milestone`);
  }, [awardXP, calculatedXP, xpSource]);

  return {
    awardXP,
    trackInteraction,
    trackCompletion,
    trackMilestone,
    calculatedXP,
  };
}

/**
 * HOC for automatic XP integration
 * Usage: export default withXP(MyComponent, { xpReward: 10, trackInteraction: true });
 */
export default function withXPHOC<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: WithXPConfig = {}
) {
  return function WithXPWrapper(props: P) {
    return (
      <WithXPComponent config={config}>
        <WrappedComponent {...props} />
      </WithXPComponent>
    );
  };
}
