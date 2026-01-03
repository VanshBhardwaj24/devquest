c/**
 * AutoXP Provider - Automatically adds XP logic to ALL components
 * Wrap your entire app with this provider to ensure every component uses XP logic
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface AutoXPContextType {
  isEnabled: boolean;
  globalXPConfig: {
    defaultXPReward: number;
    defaultXPSource: string;
    showGlobalXPGain: boolean;
    trackAllInteractions: boolean;
    trackPageViews: boolean;
    trackScrolling: boolean;
    trackHovering: boolean;
    trackDuration: boolean;
  };
  updateConfig: (config: Partial<AutoXPContextType['globalXPConfig']>) => void;
  enableAutoXP: () => void;
  disableAutoXP: () => void;
}

const AutoXPContext = createContext<AutoXPContextType | null>(null);

export function useAutoXP() {
  const context = useContext(AutoXPContext);
  if (!context) {
    throw new Error('useAutoXP must be used within AutoXPProvider');
  }
  return context;
}

interface AutoXPProviderProps {
  children: React.ReactNode;
  defaultConfig?: Partial<AutoXPContextType['globalXPConfig']>;
  enabled?: boolean;
}

export function AutoXPProvider({ 
  children, 
  defaultConfig = {},
  enabled = true 
}: AutoXPProviderProps) {
  const { addXP, updateStreak, calculateXPForAction } = useUniversalXP();
  
  const [globalXPConfig, setGlobalXPConfig] = useState<AutoXPContextType['globalXPConfig']>({
    defaultXPReward: 5,
    defaultXPSource: 'auto_xp',
    showGlobalXPGain: false,
    trackAllInteractions: true,
    trackPageViews: true,
    trackScrolling: false,
    trackHovering: false,
    trackDuration: true,
    ...defaultConfig,
  });
  
  const [isEnabled, setIsEnabled] = useState(enabled);
  
  // Global interaction tracking
  const globalInteractionCount = useRef(0);
  const globalScrollCount = useRef(0);
  const globalDuration = useRef(0);
  const lastGlobalInteraction = useRef(0);
  
  // Track global page view
  useEffect(() => {
    if (!isEnabled || !globalXPConfig.trackPageViews) return;
    
    const pageXP = calculateXPForAction('page_view');
    addXP(pageXP, `${globalXPConfig.defaultXPSource}_page_view`, {
      showNotification: false,
      trackActivity: true,
    });
  }, [isEnabled, globalXPConfig.trackPageViews, globalXPConfig.defaultXPSource, addXP, calculateXPForAction]);
  
  // Track global interactions
  useEffect(() => {
    if (!isEnabled || !globalXPConfig.trackAllInteractions) return;
    
    const handleGlobalInteraction = () => {
      const now = Date.now();
      if (now - lastGlobalInteraction.current < 1000) return; // 1 second cooldown
      
      globalInteractionCount.current++;
      lastGlobalInteraction.current = now;
      
      const interactionXP = globalXPConfig.defaultXPReward;
      addXP(interactionXP, `${globalXPConfig.defaultXPSource}_global_interaction_${globalInteractionCount.current}`, {
        showNotification: globalXPConfig.showGlobalXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    };
    
    // Add global click listener
    document.addEventListener('click', handleGlobalInteraction);
    
    // Add global keyboard listener
    const handleKeyPress = () => handleGlobalInteraction();
    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('click', handleGlobalInteraction);
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isEnabled, globalXPConfig.trackAllInteractions, globalXPConfig.defaultXPReward, globalXPConfig.defaultXPSource, globalXPConfig.showGlobalXPGain, addXP, updateStreak]);
  
  // Track global scrolling
  useEffect(() => {
    if (!isEnabled || !globalXPConfig.trackScrolling) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        globalScrollCount.current++;
        const scrollXP = Math.floor(globalXPConfig.defaultXPReward / 2);
        addXP(scrollXP, `${globalXPConfig.defaultXPSource}_global_scroll_${globalScrollCount.current}`, {
          showNotification: false,
          trackActivity: true,
        });
      }, 500);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isEnabled, globalXPConfig.trackScrolling, globalXPConfig.defaultXPReward, globalXPConfig.defaultXPSource, addXP]);
  
  // Track global duration
  useEffect(() => {
    if (!isEnabled || !globalXPConfig.trackDuration) return;
    
    const durationInterval = setInterval(() => {
      globalDuration.current += 10000; // 10 seconds
      
      const durationXP = Math.floor(globalXPConfig.defaultXPReward / 10);
      addXP(durationXP, `${globalXPConfig.defaultXPSource}_global_duration`, {
        showNotification: false,
        trackActivity: false,
      });
    }, 10000);
    
    return () => clearInterval(durationInterval);
  }, [isEnabled, globalXPConfig.trackDuration, globalXPConfig.defaultXPReward, globalXPConfig.defaultXPSource, addXP]);
  
  const updateConfig = (newConfig: Partial<AutoXPContextType['globalXPConfig']>) => {
    setGlobalXPConfig(prev => ({ ...prev, ...newConfig }));
  };
  
  const enableAutoXP = () => setIsEnabled(true);
  const disableAutoXP = () => setIsEnabled(false);
  
  const contextValue: AutoXPContextType = {
    isEnabled,
    globalXPConfig,
    updateConfig,
    enableAutoXP,
    disableAutoXP,
  };
  
  return (
    <AutoXPContext.Provider value={contextValue}>
      {children}
    </AutoXPContext.Provider>
  );
}

/**
 * HOC to automatically add XP logic to any component
 * Usage: export default withAutoXP(MyComponent);
 */
export function withAutoXP<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: Partial<AutoXPContextType['globalXPConfig']> = {}
) {
  return function WithAutoXPWrapper(props: P) {
    const { isEnabled, globalXPConfig } = useAutoXP();
    
    if (!isEnabled) {
      return <WrappedComponent {...props} />;
    }
    
    return (
      <div className="auto-xp-wrapper">
        <WrappedComponent {...props} />
        {/* XP indicators */}
        {globalXPConfig.showGlobalXPGain && (
          <div className="fixed top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full shadow-lg z-50 animate-pulse">
            <span className="text-sm font-bold">Auto XP Active</span>
          </div>
        )}
      </div>
    );
  };
}

/**
 * Hook for automatic XP integration in any component
 * Usage: const autoXP = useAutoXPHook();
 */
export function useAutoXPHook(config: Partial<AutoXPContextType['globalXPConfig']> = {}) {
  const { isEnabled, globalXPConfig, updateConfig } = useAutoXP();
  const { addXP, updateStreak, calculateXPForAction } = useUniversalXP();
  
  const mergedConfig = { ...globalXPConfig, ...config };
  
  const awardAutoXP = useCallback((multiplier: number = 1, source?: string) => {
    if (!isEnabled) return;
    
    const xp = Math.floor(mergedConfig.defaultXPReward * multiplier);
    const xpSource = source || mergedConfig.defaultXPSource;
    
    addXP(xp, xpSource, {
      showNotification: mergedConfig.showGlobalXPGain,
      trackActivity: true,
    });
    
    updateStreak('general');
  }, [isEnabled, mergedConfig.defaultXPReward, mergedConfig.defaultXPSource, mergedConfig.showGlobalXPGain, addXP, updateStreak]);
  
  const trackCustomAction = useCallback((actionType: string, difficulty?: string, multiplier: number = 1) => {
    if (!isEnabled) return;
    
    const xp = calculateXPForAction(actionType, difficulty);
    const finalXP = Math.floor(xp * multiplier);
    
    addXP(finalXP, `${mergedConfig.defaultXPSource}_${actionType}`, {
      showNotification: mergedConfig.showGlobalXPGain,
      trackActivity: true,
    });
    
    updateStreak('general');
  }, [isEnabled, mergedConfig.defaultXPSource, calculateXPForAction, mergedConfig.showGlobalXPGain, addXP, updateStreak]);
  
  return {
    isEnabled,
    globalXPConfig: mergedConfig,
    updateConfig,
    awardAutoXP,
    trackCustomAction,
  };
}
