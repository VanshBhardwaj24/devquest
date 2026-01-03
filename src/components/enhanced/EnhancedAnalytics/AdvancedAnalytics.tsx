/**
 * Advanced Analytics Component
 * Enhanced analytics with AI-powered insights, predictive analytics, and comprehensive reporting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface AdvancedAnalyticsProps {
  data?: any;
  showPredictive?: boolean;
  showRealTime?: boolean;
  showAIInsights?: boolean;
  showCustomReports?: boolean;
  showDataVisualization?: boolean;
  showSegmentation?: boolean;
  showFunnelAnalysis?: boolean;
  showCohortAnalysis?: boolean;
  showRetentionAnalysis?: boolean;
  showPerformanceMetrics?: boolean;
  showUserBehavior?: boolean;
  showRevenueAnalytics?: boolean;
  showConversionTracking?: boolean;
  showAITesting?: boolean;
  showAnomalyDetection?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackInteractions?: boolean;
  trackReports?: boolean;
  trackInsights?: boolean;
  className?: string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  data = {},
  showPredictive = true,
  showRealTime = true,
  showAIInsights = true,
  showCustomReports = true,
  showDataVisualization = true,
  showSegmentation = true,
  showFunnelAnalysis = true,
  showCohortAnalysis = true,
  showRetentionAnalysis = true,
  showPerformanceMetrics = true,
  showUserBehavior = true,
  showRevenueAnalytics = true,
  showConversionTracking = true,
  showAITesting = true,
  showAnomalyDetection = true,
  enableExport = true,
  enableSharing = true,
  xpReward = 35,
  xpSource = 'advanced_analytics',
  showXPGain = false,
  trackInteractions = true,
  trackReports = true,
  trackInsights = true,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['users', 'revenue', 'conversion']);
  const [interactionCount, setInteractionCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Enhanced analytics data
  const analyticsData = useMemo(() => ({
    overview: {
      totalUsers: 45678,
      activeUsers: 12345,
      newUsers: 2345,
      returningUsers: 8901,
      totalRevenue: 123456,
      averageRevenuePerUser: 89.5,
      conversionRate: 12.3,
      bounceRate: 32.1,
      averageSessionDuration: 8.5,
      pagesPerSession: 4.2,
      retentionRate: 78.5,
      churnRate: 21.5,
      netPromoterScore: 72,
      customerLifetimeValue: 456.7,
      averageOrderValue: 67.8,
    },
    predictive: {
      nextMonthUsers: 48900,
      nextMonthRevenue: 134567,
      nextQuarterGrowth: 23.4,
      predictedChurnRisk: 15.2,
      recommendedActions: [
        'Focus on user retention for high-value customers',
        'Optimize checkout process to reduce cart abandonment',
        'Increase marketing spend in underperforming segments',
        'Implement personalized recommendations engine',
      ],
      confidenceScore: 87.5,
      modelAccuracy: 92.3,
    },
    aiInsights: [
      {
        type: 'anomaly',
        title: 'Unusual Traffic Spike Detected',
        description: 'Traffic increased 300% between 2-3 AM, possible bot activity',
        severity: 'high',
        confidence: 94,
        recommendedAction: 'Investigate source and implement rate limiting',
      },
      {
        type: 'opportunity',
        title: 'High-Value User Segment Identified',
        description: 'Users from enterprise segment showing 3x higher engagement',
        severity: 'low',
        confidence: 89,
        recommendedAction: 'Create targeted campaign for enterprise users',
      },
      {
        type: 'trend',
        title: 'Mobile Usage Growing Rapidly',
        description: 'Mobile traffic increased 45% this month, now 60% of total',
        severity: 'medium',
        confidence: 96,
        recommendedAction: 'Optimize mobile experience and invest in mobile marketing',
      },
    ],
    segmentation: [
      {
        id: 'enterprise',
        name: 'Enterprise Users',
        size: 1234,
        characteristics: ['High LTV', 'Low Churn', 'High Engagement'],
        revenue: 234567,
        conversionRate: 18.5,
        averageOrderValue: 234.5,
      },
      {
        id: 'smb',
        name: 'Small Business',
        size: 5678,
        characteristics: ['Medium LTV', 'Medium Churn', 'Seasonal Usage'],
        revenue: 456789,
        conversionRate: 10.2,
        averageOrderValue: 89.3,
      },
      {
        id: 'consumer',
        name: 'Consumer',
        size: 23456,
        characteristics: ['Low LTV', 'High Churn', 'Price Sensitive'],
        revenue: 123456,
        conversionRate: 8.7,
        averageOrderValue: 45.6,
      },
    ],
    funnelAnalysis: {
      stages: [
        { stage: 'Visit', users: 100000, conversionRate: 100, dropOffRate: 0 },
        { stage: 'Signup', users: 15000, conversionRate: 15, dropOffRate: 85 },
        { stage: 'Activation', users: 12000, conversionRate: 80, dropOffRate: 20 },
        { stage: 'First Purchase', users: 9600, conversionRate: 80, dropOffRate: 20 },
        { stage: 'Repeat Purchase', users: 7200, conversionRate: 75, dropOffRate: 25 },
      ],
      bottlenecks: [
        'Signup form complexity causing 15% drop-off',
        'Email verification process too long',
        'Onboarding flow not optimized for mobile',
      ],
    },
    cohortAnalysis: [
      {
        cohort: 'Jan 2024',
        size: 1234,
        retention: {
          day1: 100,
          day7: 78.5,
          day30: 65.2,
          day90: 45.8,
        },
        revenue: {
          month1: 12345,
          month3: 34567,
          month6: 56789,
        },
      },
      {
        cohort: 'Feb 2024',
        size: 1456,
        retention: {
          day1: 100,
          day7: 82.1,
          day30: 71.3,
          day90: 52.4,
        },
        revenue: {
          month1: 15678,
          month3: 42345,
          month6: 67890,
        },
      },
    ],
    performanceMetrics: {
      pageLoadTime: 1.2,
      serverResponseTime: 0.8,
      uptime: 99.9,
      errorRate: 0.2,
      databaseQueryTime: 0.3,
      apiResponseTime: 0.5,
      cacheHitRate: 94.5,
      cdnPerformance: 98.2,
    },
    userBehavior: {
      topPages: [
        { page: '/dashboard', views: 45678, avgTime: 180 },
        { page: '/products', views: 34567, avgTime: 240 },
        { page: '/checkout', views: 12345, avgTime: 300 },
      ],
      userFlows: [
        { flow: 'Purchase Path', completionRate: 67.8, avgTime: 450 },
        { flow: 'Onboarding', completionRate: 78.5, avgTime: 320 },
        { flow: 'Support', completionRate: 89.2, avgTime: 180 },
      ],
      featureUsage: [
        { feature: 'Search', usage: 89.5, satisfaction: 4.2 },
        { feature: 'Recommendations', usage: 67.3, satisfaction: 4.5 },
        { feature: 'Chat Support', usage: 45.6, satisfaction: 4.8 },
      ],
    },
    revenueAnalytics: {
      total: 1234567,
      recurring: 890123,
      oneTime: 344444,
      bySegment: {
        enterprise: 567890,
        smb: 345678,
        consumer: 234567,
      },
      byProduct: {
        premium: 678901,
        basic: 345678,
        addOns: 123456,
      },
      trends: {
        monthly: [89000, 92000, 95000, 98000, 102000],
        growth: [5.2, 3.4, 3.8, 4.1, 4.5],
      },
    },
    conversionTracking: {
      overallRate: 12.3,
      byChannel: {
        organic: 8.5,
        paid: 15.2,
        social: 10.3,
        email: 18.7,
        direct: 14.1,
      },
      byDevice: {
        desktop: 14.2,
        mobile: 10.8,
        tablet: 8.9,
      },
      bySource: {
        google: 12.5,
        facebook: 8.3,
        twitter: 6.7,
        linkedin: 15.2,
        direct: 18.9,
      },
      optimization: {
        testedVariants: 4,
        bestPerformer: 'Variant B',
        improvement: 23.4,
        confidence: 95.2,
      },
    },
  }), []);

  // Track interactions
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for tab interaction
    if (xpReward > 0 && trackInteractions) {
      const tabXP = Math.floor(xpReward / 8);
      addXP(tabXP, `${xpSource}_tab_${tab}`, {
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

  const handleReportGeneration = (reportType: string) => {
    if (!trackReports) return;
    
    setIsProcessing(true);
    setReportCount(prev => prev + 1);
    
    // Simulate report generation
    setTimeout(() => {
      setIsProcessing(false);
      
      // Award XP for report generation
      if (xpReward > 0) {
        const reportXP = Math.floor(xpReward * 1.5);
        addXP(reportXP, `${xpSource}_report_${reportCount + 1}`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        updateStreak('general');
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }, 2000);
  };

  const handleInsightAction = (insightIndex: number) => {
    if (!trackInsights) return;
    
    setInsightCount(prev => prev + 1);
    
    // Award XP for acting on insights
    if (xpReward > 0) {
      const insightXP = Math.floor(xpReward * 2);
      addXP(insightXP, `${xpSource}_insight_${insightCount + 1}`, {
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

  // Simulate real-time updates
  useEffect(() => {
    if (showRealTime) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [showRealTime]);

  return (
    <div className={`bg-white rounded-lg shadow-lg h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Advanced Analytics</h2>
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${showRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-600">
                {showRealTime ? 'Real-time' : 'Static'}
              </span>
            </div>
            
            {/* Last Update */}
            <div className="text-sm text-gray-600">
              Last: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 p-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Dashboard
          </button>
          
          {showPredictive && (
            <button
              onClick={() => handleTabChange('predictive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'predictive' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🤖 Predictive
            </button>
          )}
          
          {showAIInsights && (
            <button
              onClick={() => handleTabChange('insights')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'insights' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💡 AI Insights
            </button>
          )}
          
          {showSegmentation && (
            <button
              onClick={() => handleTabChange('segmentation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'segmentation' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 Segmentation
            </button>
          )}
          
          {showFunnelAnalysis && (
            <button
              onClick={() => handleTabChange('funnel')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'funnel' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📈 Funnel Analysis
            </button>
          )}
          
          {showCohortAnalysis && (
            <button
              onClick={() => handleTabChange('cohort')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'cohort' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Cohort Analysis
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="h-full p-4 bg-gray-50 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Key Metrics */}
              {Object.entries(analyticsData.overview).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-4 shadow">
                  <h3 className="text-sm font-medium text-gray-600 capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {key.includes('Rate') || key.includes('Score') || key.includes('Value') ? '' : '%'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.performanceMetrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-medium">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                      {key.includes('Time') ? 's' : key.includes('Rate') ? '%' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && showAIInsights && (
          <div className="h-full p-4 bg-gray-50 overflow-y-auto">
            <div className="space-y-4">
              {analyticsData.aiInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confidence: {insight.confidence}%
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Recommended Action:</span>
                    <button
                      onClick={() => handleInsightAction(index)}
                      className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors"
                    >
                      {insight.recommendedAction}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Tab */}
        {!['dashboard', 'insights'].includes(activeTab) && (
          <div className="h-full p-4 bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">
                {activeTab === 'predictive' ? '🤖' :
                 activeTab === 'segmentation' ? '👥' :
                 activeTab === 'funnel' ? '📈' :
                 activeTab === 'cohort' ? '📊' : '🔧'}
              </div>
              <p className="text-lg font-medium">
                {activeTab === 'predictive' ? 'Predictive Analytics' :
                 activeTab === 'segmentation' ? 'User Segmentation' :
                 activeTab === 'funnel' ? 'Funnel Analysis' :
                 activeTab === 'cohort' ? 'Cohort Analysis' : 'Feature Coming Soon'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {enableExport && (
              <button
                onClick={() => handleReportGeneration('export')}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? '⏳ Generating...' : '📊 Export Report'}
              </button>
            )}
            
            {enableSharing && (
              <button
                onClick={() => handleReportGeneration('share')}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isProcessing ? '⏳ Preparing...' : '🔗 Share Dashboard'}
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {interactionCount > 0 && `Interactions: ${interactionCount} | `}
            {reportCount > 0 && `Reports: ${reportCount} | `}
            {insightCount > 0 && `Insights: ${insightCount}`}
          </div>
        </div>
      </div>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="fixed -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{xpReward} XP!</span>
        </div>
      )}

      {/* Engagement Stats */}
      {(interactionCount > 0 || reportCount > 0 || insightCount > 0) && (
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          {interactionCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              👆 {interactionCount}
            </div>
          )}
          {reportCount > 0 && (
            <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📊 {reportCount}
            </div>
          )}
          {insightCount > 0 && (
            <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              💡 {insightCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
