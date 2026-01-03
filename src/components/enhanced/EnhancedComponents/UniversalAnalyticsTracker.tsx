/**
 * Universal Analytics Tracker Component
 * Tracks analytics across all components with comprehensive data collection
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface UniversalAnalyticsTrackerProps {
  children?: React.ReactNode;
  globalTracking?: boolean;
  trackPageViews?: boolean;
  trackUserInteractions?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackConversions?: boolean;
  trackRevenue?: boolean;
  trackUserBehavior?: boolean;
  trackSessionDuration?: boolean;
  trackScrollDepth?: boolean;
  trackClickPatterns?: boolean;
  trackFormInteractions?: boolean;
  trackSearchQueries?: boolean;
  trackFeatureUsage?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  className?: string;
}

interface AnalyticsContextType {
  pageViews: any[];
  interactions: any[];
  performance: any[];
  errors: any[];
  conversions: any[];
  revenue: any[];
  userBehavior: any[];
  sessions: any[];
  scrollDepth: any[];
  clickPatterns: any[];
  formInteractions: any[];
  searchQueries: any[];
  featureUsage: any[];
  trackPageView: (page: string) => void;
  trackInteraction: (interaction: any) => void;
  trackPerformance: (performance: any) => void;
  trackError: (error: any) => void;
  trackConversion: (conversion: any) => void;
  trackRevenue: (revenue: any) => void;
  trackUserBehavior: (behavior: any) => void;
  trackSession: (session: any) => void;
  trackScrollDepth: (depth: number) => void;
  trackClickPattern: (pattern: any) => void;
  trackFormInteraction: (form: any) => void;
  trackSearchQuery: (query: any) => void;
  trackFeatureUsage: (feature: any) => void;
  getAnalytics: () => any;
  getRealTimeMetrics: () => any;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<UniversalAnalyticsTrackerProps> = ({
  children,
  globalTracking = true,
  trackPageViews = true,
  trackUserInteractions = true,
  trackPerformance = true,
  trackErrors = true,
  trackConversions = true,
  trackRevenue = true,
  trackUserBehavior = true,
  trackSessionDuration = true,
  trackScrollDepth = true,
  trackClickPatterns = true,
  trackFormInteractions = true,
  trackSearchQueries = true,
  trackFeatureUsage = true,
  xpReward = 45,
  xpSource = 'universal_analytics_tracker',
  showXPGain = false,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [userBehavior, setUserBehavior] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [scrollDepth, setScrollDepth] = useState<any[]>([]);
  const [clickPatterns, setClickPatterns] = useState<any[]>([]);
  const [formInteractions, setFormInteractions] = useState<any[]>([]);
  const [searchQueries, setSearchQueries] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [currentScrollDepth, setCurrentScrollDepth] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Auto-tracking systems
  useEffect(() => {
    if (globalTracking) {
      // Track page views
      if (trackPageViews) {
        const handlePageView = () => {
          const pageView = {
            id: Date.now().toString(),
            url: window.location.href,
            title: document.title,
            timestamp: new Date(),
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            sessionId: Date.now().toString(),
          };

          setPageViews(prev => [...prev, pageView]);
          
          // Award XP for page view tracking
          if (xpReward > 0) {
            const pageViewXP = Math.floor(xpReward * 0.1);
            addXP(pageViewXP, `${xpSource}_page_view`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        // Track page view on load
        handlePageView();
        
        // Track page view on route changes
        const originalPushState = window.history.pushState;
        window.history.pushState = function(...args) {
          originalPushState.apply(this, args);
          setTimeout(handlePageView, 100);
        };
      }

      // Track user interactions
      if (trackUserInteractions) {
        const handleInteraction = (event: Event) => {
          const interaction = {
            id: Date.now().toString(),
            type: event.type,
            target: (event.target as Element)?.tagName,
            timestamp: new Date(),
            sessionId: Date.now().toString(),
            pageUrl: window.location.href,
          };

          setInteractions(prev => [...prev, interaction]);
          setInteractionCount(prev => prev + 1);
          
          // Award XP for interaction tracking
          if (xpReward > 0) {
            const interactionXP = Math.floor(xpReward * 0.05);
            addXP(interactionXP, `${xpSource}_user_interaction`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        // Add global event listeners
        document.addEventListener('click', handleInteraction);
        document.addEventListener('scroll', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('mousemove', handleInteraction);
      }

      // Track performance
      if (trackPerformance) {
        const measurePerformance = () => {
          if ('performance' in window) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            if (perfData) {
              const performance = {
                id: Date.now().toString(),
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                firstPaint: perfData.firstPaint,
                firstContentfulPaint: perfData.firstContentfulPaint,
                timestamp: new Date(),
                sessionId: Date.now().toString(),
              };

              setPerformance(prev => [...prev, performance]);
              
              // Award XP for performance tracking
              if (xpReward > 0) {
                const performanceXP = Math.floor(xpReward * 0.15);
                addXP(performanceXP, `${xpSource}_performance_tracking`, {
                  showNotification: showXPGain,
                  trackActivity: true,
                });
                
                updateStreak('general');
              }
            }
          }
        };

        // Measure performance every 30 seconds
        const perfInterval = setInterval(measurePerformance, 30000);
        
        return () => clearInterval(perfInterval);
      }

      // Track errors
      if (trackErrors) {
        const handleError = (event: ErrorEvent) => {
          const error = {
            id: Date.now().toString(),
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: new Date(),
            sessionId: Date.now().toString(),
            pageUrl: window.location.href,
          };

          setErrors(prev => [...prev, error]);
          
          // Award XP for error tracking
          if (xpReward > 0) {
            const errorXP = Math.floor(xpReward * 0.2);
            addXP(errorXP, `${xpSource}_error_tracking`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleError);
      }

      // Track scroll depth
      if (trackScrollDepth) {
        const handleScroll = () => {
          const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          setCurrentScrollDepth(Math.floor(scrollPercentage));
          
          const scrollDepthData = {
            id: Date.now().toString(),
            depth: Math.floor(scrollPercentage),
            maxDepth: 100,
            timestamp: new Date(),
            sessionId: Date.now().toString(),
            pageUrl: window.location.href,
          };

          setScrollDepth(prev => [...prev, scrollDepthData]);
          
          // Award XP for scroll tracking
          if (xpReward > 0 && scrollPercentage > 50) {
            const scrollXP = Math.floor(xpReward * 0.08);
            addXP(scrollXP, `${xpSource}_scroll_tracking`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        window.addEventListener('scroll', handleScroll);
      }

      // Track click patterns
      if (trackClickPatterns) {
        const handleClick = (event: MouseEvent) => {
          const now = Date.now();
          const timeSinceLastClick = now - lastClickTime;
          
          const clickPattern = {
            id: Date.now().toString(),
            target: (event.target as Element)?.tagName,
            x: event.clientX,
            y: event.clientY,
            timestamp: new Date(),
            timeSinceLastClick,
            sessionId: Date.now().toString(),
            pageUrl: window.location.href,
          };

          setClickPatterns(prev => [...prev, clickPattern]);
          setLastClickTime(now);
          
          // Award XP for click pattern tracking
          if (xpReward > 0 && timeSinceLastClick < 1000) {
            const clickPatternXP = Math.floor(xpReward * 0.06);
            addXP(clickPatternXP, `${xpSource}_click_pattern_tracking`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        document.addEventListener('click', handleClick);
      }

      // Track session duration
      if (trackSessionDuration) {
        const handleSessionEnd = () => {
          const sessionDuration = Date.now() - sessionStartTime;
          
          const session = {
            id: Date.now().toString(),
            duration: sessionDuration,
            startTime: new Date(sessionStartTime),
            endTime: new Date(),
            pageViews: pageViews.length,
            interactions: interactions.length,
            timestamp: new Date(),
          };

          setSessions(prev => [...prev, session]);
          
          // Award XP for session tracking
          if (xpReward > 0 && sessionDuration > 60000) { // 1 minute
            const sessionXP = Math.floor(xpReward * 0.25);
            addXP(sessionXP, `${xpSource}_session_tracking`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
          }
        };

        // Track session end on page unload
        window.addEventListener('beforeunload', handleSessionEnd);
      }
    }
  }, [globalTracking, trackPageViews, trackUserInteractions, trackPerformance, trackErrors, trackConversions, trackRevenue, trackUserBehavior, trackSessionDuration, trackScrollDepth, trackClickPatterns, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  const trackPageView = (page: string) => {
    const pageView = {
      id: Date.now().toString(),
      url: page,
      title: document.title,
      timestamp: new Date(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId: Date.now().toString(),
    };

    setPageViews(prev => [...prev, pageView]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual page view tracking
    if (xpReward > 0) {
      const pageViewXP = Math.floor(xpReward * 0.3);
      addXP(pageViewXP, `${xpSource}_manual_page_view`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackInteraction = (interaction: any) => {
    setInteractions(prev => [...prev, interaction]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual interaction tracking
    if (xpReward > 0) {
      const interactionXP = Math.floor(xpReward * 0.1);
      addXP(interactionXP, `${xpSource}_manual_interaction`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackPerformance = (performanceData: any) => {
    setPerformance(prev => [...prev, performance]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual performance tracking
    if (xpReward > 0) {
      const performanceXP = Math.floor(xpReward * 0.2);
      addXP(performanceXP, `${xpSource}_manual_performance`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackError = (error: any) => {
    setErrors(prev => [...prev, error]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual error tracking
    if (xpReward > 0) {
      const errorXP = Math.floor(xpReward * 0.15);
      addXP(errorXP, `${xpSource}_manual_error`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackConversion = (conversion: any) => {
    setConversions(prev => [...prev, conversion]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual conversion tracking
    if (xpReward > 0) {
      const conversionXP = Math.floor(xpReward * 0.5);
      addXP(conversionXP, `${xpSource}_manual_conversion`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackRevenue = (revenue: any) => {
    setRevenue(prev => [...prev, revenue]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual revenue tracking
    if (xpReward > 0) {
      const revenueXP = Math.floor(xpReward * 0.4);
      addXP(revenueXP, `${xpSource}_manual_revenue`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackUserBehavior = (behavior: any) => {
    setUserBehavior(prev => [...prev, behavior]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual behavior tracking
    if (xpReward > 0) {
      const behaviorXP = Math.floor(xpReward * 0.12);
      addXP(behaviorXP, `${xpSource}_manual_behavior`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackSession = (session: any) => {
    setSessions(prev => [...prev, session]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual session tracking
    if (xpReward > 0) {
      const sessionXP = Math.floor(xpReward * 0.2);
      addXP(sessionXP, `${xpSource}_manual_session`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackScrollDepth = (depth: number) => {
    const scrollDepthData = {
      id: Date.now().toString(),
      depth,
      maxDepth: 100,
      timestamp: new Date(),
      sessionId: Date.now().toString(),
      pageUrl: window.location.href,
    };

    setScrollDepth(prev => [...prev, scrollDepthData]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual scroll tracking
    if (xpReward > 0 && depth > 50) {
      const scrollXP = Math.floor(xpReward * 0.08);
      addXP(scrollXP, `${xpSource}_manual_scroll`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackClickPattern = (pattern: any) => {
    setClickPatterns(prev => [...prev, pattern]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual click pattern tracking
    if (xpReward > 0) {
      const clickPatternXP = Math.floor(xpReward * 0.06);
      addXP(clickPatternXP, `${xpSource}_manual_click_pattern`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackFormInteraction = (form: any) => {
    setFormInteractions(prev => [...prev, form]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual form interaction tracking
    if (xpReward > 0) {
      const formXP = Math.floor(xpReward * 0.18);
      addXP(formXP, `${xpSource}_manual_form_interaction`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackSearchQuery = (query: any) => {
    setSearchQueries(prev => [...prev, query]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual search tracking
    if (xpReward > 0) {
      const searchXP = Math.floor(xpReward * 0.22);
      addXP(searchXP, `${xpSource}_manual_search`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const trackFeatureUsage = (feature: any) => {
    setFeatureUsage(prev => [...prev, feature]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for manual feature tracking
    if (xpReward > 0) {
      const featureXP = Math.floor(xpReward * 0.16);
      addXP(featureXP, `${xpSource}_manual_feature`, {
        showNotification: showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
    }
  };

  const getAnalytics = () => {
    return {
      pageViews,
      interactions,
      performance,
      errors,
      conversions,
      revenue,
      userBehavior,
      sessions,
      scrollDepth,
      clickPatterns,
      formInteractions,
      searchQueries,
      featureUsage,
      totalInteractions: interactionCount,
      sessionStartTime,
      currentScrollDepth,
    };
  };

  const getRealTimeMetrics = () => {
    return {
      currentPage: window.location.href,
      sessionDuration: Date.now() - sessionStartTime,
      totalPageViews: pageViews.length,
      totalInteractions: interactions.length,
      averageSessionDuration: sessions.length > 0 ? 
        sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0,
      currentScrollDepth,
      lastActivity: interactions.length > 0 ? 
        new Date(Math.max(...interactions.map(i => new Date(i.timestamp)))) : new Date(),
    };
  };

  const contextValue: AnalyticsContextType = {
    pageViews,
    interactions,
    performance,
    errors,
    conversions,
    revenue,
    userBehavior,
    sessions,
    scrollDepth,
    clickPatterns,
    formInteractions,
    searchQueries,
    featureUsage,
    trackPageView,
    trackInteraction,
    trackPerformance,
    trackError,
    trackConversion,
    trackRevenue,
    trackUserBehavior,
    trackSession,
    trackScrollDepth,
    trackClickPattern,
    trackFormInteraction,
    trackSearchQuery,
    trackFeatureUsage,
    getAnalytics,
    getRealTimeMetrics,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Universal Analytics Tracker</h2>
          <div className="flex items-center space-x-4">
            {/* Real-time Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
              <span className="text-sm text-gray-600">Global Tracking Active</span>
            </div>
            
            {/* Metrics Summary */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Page Views: {pageViews.length}</span>
              <span>Interactions: {interactions.length}</span>
              <span>Errors: {errors.length}</span>
              <span>Conversions: {conversions.length}</span>
            </div>
            
            {/* XP Reward Indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">XP Earned:</span>
              <span className="text-lg font-bold text-green-600">
                {Math.floor(interactionCount * xpReward * 0.1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => trackPageView('/test-page')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Track Page View
          </button>
          
          <button
            onClick={() => trackInteraction({ type: 'manual_test', target: 'button' })}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Track Interaction
          </button>
          
          <button
            onClick={() => trackPerformance({ loadTime: 1.2, domContentLoaded: 2.1 })}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Track Performance
          </button>
          
          <button
            onClick={() => trackError({ message: 'Test error', filename: 'test.js', lineno: 42 })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Track Error
          </button>
        </div>
        
        {/* Content */}
        {children}
        
        {/* XP Reward Animation */}
        {showReward && (
          <div className="fixed -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            <span className="font-bold">+{Math.floor(interactionCount * xpReward * 0.1)} XP!</span>
          </div>
        )}
        
        {/* Engagement Stats */}
        {interactionCount > 0 && (
          <div className="absolute -bottom-2 -right-2 flex space-x-1">
            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📊 {interactionCount}
            </div>
          </div>
        )}
        
        {/* Real-time Metrics */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Current Page:</span>
              <span className="font-medium">{window.location.href}</span>
            </div>
            <div className="flex justify-between">
              <span>Session Duration:</span>
              <span className="font-medium">{Math.floor((Date.now() - sessionStartTime) / 1000)}s</span>
            </div>
            <div className="flex justify-between">
              <span>Scroll Depth:</span>
              <span className="font-medium">{currentScrollDepth}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interactions:</span>
              <span className="font-medium">{interactions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
