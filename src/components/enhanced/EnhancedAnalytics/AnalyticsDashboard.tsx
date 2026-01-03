/**
 * Enhanced Analytics Dashboard Component
 * Provides comprehensive analytics with real-time tracking and insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface AnalyticsDashboardProps {
  data?: any;
  refreshInterval?: number;
  showRealTime?: boolean;
  showPredictions?: boolean;
  showInsights?: boolean;
  showComparisons?: boolean;
  showTrends?: boolean;
  showHeatmaps?: boolean;
  showFunnel?: boolean;
  showCohorts?: boolean;
  showRetention?: boolean;
  showPerformance?: boolean;
  showErrors?: boolean;
  showAlerts?: boolean;
  showRecommendations?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackViews?: boolean;
  trackInteractions?: boolean;
  trackExports?: boolean;
  trackShares?: boolean;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data = {},
  refreshInterval = 30000,
  showRealTime = true,
  showPredictions = true,
  showInsights = true,
  showComparisons = true,
  showTrends = true,
  showHeatmaps = true,
  showFunnel = true,
  showCohorts = true,
  showRetention = true,
  showPerformance = true,
  showErrors = true,
  showAlerts = true,
  showRecommendations = true,
  xpReward = 10,
  xpSource = 'analytics_dashboard',
  showXPGain = false,
  trackViews = true,
  trackInteractions = true,
  trackExports = true,
  trackShares = true,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [viewCount, setViewCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [exportCount, setExportCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock analytics data
  const analyticsData = useMemo(() => ({
    overview: {
      totalUsers: 15234,
      activeUsers: 8921,
      newUsers: 1234,
      retention: 78.5,
      engagement: 65.2,
      conversion: 12.3,
      revenue: 45678,
      growth: 23.4,
    },
    trends: {
      daily: [120, 145, 132, 189, 167, 198, 234],
      weekly: [890, 945, 1023, 1156, 1234, 1456],
      monthly: [3456, 3789, 4123, 4567, 4890, 5234],
    },
    heatmap: Array.from({ length: 24 }, (_, i) => 
      Array.from({ length: 7 }, (_, j) => Math.floor(Math.random() * 100))
    ),
    funnel: [
      { stage: 'Visit', count: 10000, conversion: 100 },
      { stage: 'Signup', count: 2340, conversion: 23.4 },
      { stage: 'Activation', count: 1567, conversion: 67.0 },
      { stage: 'Engagement', count: 1234, conversion: 78.8 },
      { stage: 'Retention', count: 967, conversion: 78.4 },
    ],
    cohorts: [
      { cohort: 'Jan 2024', size: 1234, retention7: 78.5, retention30: 65.2 },
      { cohort: 'Feb 2024', size: 1456, retention7: 82.1, retention30: 71.3 },
      { cohort: 'Mar 2024', size: 1678, retention7: 85.6, retention30: 74.8 },
    ],
    performance: {
      avgLoadTime: 1.2,
      bounceRate: 32.5,
      errorRate: 0.8,
      uptime: 99.9,
      score: 94,
    },
    errors: [
      { type: '404', count: 123, trend: 'down' },
      { type: '500', count: 45, trend: 'up' },
      { type: 'Timeout', count: 67, trend: 'stable' },
    ],
    predictions: {
      nextMonth: 5678,
      nextQuarter: 18900,
      nextYear: 67890,
      confidence: 87.5,
    },
    insights: [
      'User engagement increased by 15% this week',
      'Mobile traffic is growing 20% faster than desktop',
      'Peak usage hours are 2-4 PM EST',
      'New feature adoption rate is 45% above average',
    ],
    recommendations: [
      'Optimize mobile experience for better conversion',
      'Focus on user retention in first 7 days',
      'Increase server capacity during peak hours',
      'A/B test new onboarding flow',
    ],
  }), []);

  // Track views
  useEffect(() => {
    if (trackViews) {
      setViewCount(prev => prev + 1);
      
      if (xpReward > 0) {
        const viewXP = viewCount === 1 ? xpReward : Math.floor(xpReward / 3);
        addXP(viewXP, `${xpSource}_view_${viewCount}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }
  }, [trackViews, viewCount, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  // Auto-refresh data
  useEffect(() => {
    if (showRealTime && refreshInterval > 0) {
      const timer = setInterval(() => {
        setIsRefreshing(true);
        setTimeout(() => {
          setLastRefresh(new Date());
          setIsRefreshing(false);
        }, 1000);
      }, refreshInterval);

      return () => clearInterval(timer);
    }
  }, [showRealTime, refreshInterval]);

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
    setInteractionCount(prev => prev + 1);
    
    if (xpReward > 0) {
      const interactionXP = Math.floor(xpReward / 2);
      addXP(interactionXP, `${xpSource}_metric_${metric}`, {
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

  const handleExport = () => {
    setExportCount(prev => prev + 1);
    
    if (xpReward > 0) {
      const exportXP = xpReward * 2;
      addXP(exportXP, `${xpSource}_export_${exportCount}`, {
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

  const handleShare = () => {
    setShareCount(prev => prev + 1);
    
    if (xpReward > 0) {
      const shareXP = Math.floor(xpReward * 1.5);
      addXP(shareXP, `${xpSource}_share_${shareCount}`, {
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
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={() => setIsRefreshing(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            📊 Export
          </button>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔗 Share
          </button>
        </div>
      </div>

      {/* Last Refresh */}
      <div className="text-sm text-gray-500 mb-4">
        Last updated: {lastRefresh.toLocaleTimeString()}
        {isRefreshing && ' (Refreshing...)'}
      </div>

      {/* Overview Cards */}
      {showInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(analyticsData.overview).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleMetricClick(key)}
            >
              <h3 className="text-sm font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-2xl font-bold text-gray-800">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {key === 'retention' || key === 'engagement' || key === 'conversion' || key === 'growth' ? '%' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        {showTrends && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Trends</h3>
            <div className="h-64 flex items-center justify-center bg-white rounded">
              <div className="text-gray-500">📈 Chart visualization</div>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {showHeatmaps && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Heatmap</h3>
            <div className="h-64 flex items-center justify-center bg-white rounded">
              <div className="text-gray-500">🔥 Heatmap visualization</div>
            </div>
          </div>
        )}

        {/* Funnel */}
        {showFunnel && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
            <div className="space-y-2">
              {analyticsData.funnel.map((stage, index) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{stage.count.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{stage.conversion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance */}
        {showPerformance && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
            <div className="space-y-2">
              {Object.entries(analyticsData.performance).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-medium">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    {key.includes('Rate') || key === 'uptime' ? '%' : ''}
                    {key === 'avgLoadTime' ? 's' : ''}
                    {key === 'score' ? '/100' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Insights */}
        {showInsights && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
            <ul className="space-y-2">
              {analyticsData.insights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500">💡</span>
                  <span className="text-sm text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {analyticsData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500">🎯</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="fixed -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}

      {/* Engagement Stats */}
      {(viewCount > 0 || interactionCount > 0 || exportCount > 0 || shareCount > 0) && (
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          {viewCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              👁️ {viewCount}
            </div>
          )}
          {interactionCount > 0 && (
            <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              👆 {interactionCount}
            </div>
          )}
          {exportCount > 0 && (
            <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📊 {exportCount}
            </div>
          )}
          {shareCount > 0 && (
            <div className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              🔗 {shareCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
