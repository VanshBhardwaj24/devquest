/**
 * Enhanced Penalty System Component
 * Provides comprehensive penalty management with tracking, appeals, and recovery options
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface PenaltySystemProps {
  userId?: string;
  showHistory?: boolean;
  showAppeals?: boolean;
  showRecovery?: boolean;
  showStatistics?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  enableAutoAppeal?: boolean;
  enableReduction?: boolean;
  enableWaivers?: boolean;
  enableForgiveness?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  trackAppeals?: boolean;
  trackReductions?: boolean;
  trackWaivers?: boolean;
  className?: string;
}

export const PenaltySystem: React.FC<PenaltySystemProps> = ({
  userId = 'current_user',
  showHistory = true,
  showAppeals = true,
  showRecovery = true,
  showStatistics = true,
  showNotifications = true,
  showSettings = true,
  enableAutoAppeal = true,
  enableReduction = true,
  enableWaivers = true,
  enableForgiveness = true,
  xpReward = 30,
  xpSource = 'penalty_system',
  showXPGain = false,
  trackAppeals = true,
  trackReductions = true,
  trackWaivers = true,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [penalties, setPenalties] = useState([
    {
      id: 1,
      type: 'late_submission',
      severity: 'medium',
      description: 'Task submitted 2 days late',
      xpDeduction: 50,
      date: new Date(Date.now() - 86400000 * 2),
      status: 'active',
      appealable: true,
      appealDeadline: new Date(Date.now() + 86400000 * 7),
    },
    {
      id: 2,
      type: 'quality_issue',
      severity: 'low',
      description: 'Minor quality issues in code review',
      xpDeduction: 25,
      date: new Date(Date.now() - 86400000 * 5),
      status: 'resolved',
      appealable: false,
      appealDeadline: null,
    },
    {
      id: 3,
      type: 'plagiarism',
      severity: 'high',
      description: 'Content similarity detected',
      xpDeduction: 100,
      date: new Date(Date.now() - 86400000 * 10),
      status: 'under_review',
      appealable: true,
      appealDeadline: new Date(Date.now() + 86400000 * 3),
    },
  ]);
  
  const [appeals, setAppeals] = useState([
    {
      id: 1,
      penaltyId: 3,
      reason: 'False positive - content is original',
      status: 'pending',
      submittedDate: new Date(),
      reviewedDate: null,
      reviewer: null,
      outcome: null,
    },
  ]);
  
  const [reductions, setReductions] = useState([
    {
      id: 1,
      penaltyId: 1,
      originalDeduction: 50,
      reducedDeduction: 25,
      reason: 'First offense - 50% reduction',
      approvedBy: 'system_auto',
      approvedDate: new Date(),
    },
  ]);
  
  const [waivers, setWaivers] = useState([
    {
      id: 1,
      penaltyId: 1,
      type: 'time_extension',
      reason: 'Medical emergency',
      status: 'approved',
      approvedBy: 'admin',
      approvedDate: new Date(),
      expires: new Date(Date.now() + 86400000 * 7),
    },
  ]);
  
  const [appealCount, setAppealCount] = useState(0);
  const [reductionCount, setReductionCount] = useState(0);
  const [waiverCount, setWaiverCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [totalPenalties, setTotalPenalties] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [totalReductions, setTotalReductions] = useState(0);
  const [penaltyScore, setPenaltyScore] = useState(75);

  // Calculate statistics
  useEffect(() => {
    const activePenalties = penalties.filter(p => p.status === 'active');
    const totalDed = penalties.reduce((sum, p) => sum + p.xpDeduction, 0);
    const totalRed = reductions.reduce((sum, r) => sum + (r.originalDeduction - r.reducedDeduction), 0);
    
    setTotalPenalties(activePenalties.length);
    setTotalDeductions(totalDed);
    setTotalReductions(totalRed);
    setPenaltyScore(Math.max(0, 100 - (totalDed - totalRed) / 10));
  }, [penalties, reductions]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Award XP for tab interaction
    if (xpReward > 0) {
      const tabXP = Math.floor(xpReward / 6);
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

  const handleAppealSubmit = (penaltyId: number, reason: string) => {
    if (!trackAppeals) return;
    
    const newAppeal = {
      id: appeals.length + 1,
      penaltyId,
      reason,
      status: 'pending',
      submittedDate: new Date(),
      reviewedDate: null,
      reviewer: null,
      outcome: null,
    };
    
    setAppeals(prev => [...prev, newAppeal]);
    setAppealCount(prev => prev + 1);
    
    // Award XP for appeal submission
    if (xpReward > 0) {
      const appealXP = Math.floor(xpReward * 0.8);
      addXP(appealXP, `${xpSource}_appeal_${appealCount + 1}`, {
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

  const handleReductionRequest = (penaltyId: number, reason: string) => {
    if (!trackReductions) return;
    
    const penalty = penalties.find(p => p.id === penaltyId);
    if (!penalty) return;
    
    const newReduction = {
      id: reductions.length + 1,
      penaltyId,
      originalDeduction: penalty.xpDeduction,
      reducedDeduction: Math.floor(penalty.xpDeduction * 0.5),
      reason: `Good behavior - ${reason}`,
      approvedBy: 'system_auto',
      approvedDate: new Date(),
    };
    
    setReductions(prev => [...prev, newReduction]);
    setReductionCount(prev => prev + 1);
    
    // Award XP for reduction request
    if (xpReward > 0) {
      const reductionXP = Math.floor(xpReward * 1.2);
      addXP(reductionXP, `${xpSource}_reduction_${reductionCount + 1}`, {
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

  const handleWaiverRequest = (penaltyId: number, type: string, reason: string) => {
    if (!trackWaivers) return;
    
    const newWaiver = {
      id: waivers.length + 1,
      penaltyId,
      type,
      reason,
      status: 'pending',
      approvedBy: null,
      approvedDate: null,
      expires: null,
    };
    
    setWaivers(prev => [...prev, newWaiver]);
    setWaiverCount(prev => prev + 1);
    
    // Award XP for waiver request
    if (xpReward > 0) {
      const waiverXP = Math.floor(xpReward * 1.5);
      addXP(waiverXP, `${xpSource}_waiver_${waiverCount + 1}`, {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Penalty System</h2>
          <div className="flex items-center space-x-4">
            {/* Penalty Score */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Penalty Score:</span>
              <span className={`text-lg font-bold ${penaltyScore >= 80 ? 'text-green-600' : penaltyScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {penaltyScore}/100
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Active: {totalPenalties}</span>
              <span>Deductions: {totalDeductions}</span>
              <span>Reduced: {totalReductions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Overview
          </button>
          
          {showHistory && (
            <button
              onClick={() => handleTabChange('penalties')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'penalties' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚠️ Penalties
            </button>
          )}
          
          {showAppeals && (
            <button
              onClick={() => handleTabChange('appeals')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'appeals' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 Appeals
            </button>
          )}
          
          {showRecovery && (
            <button
              onClick={() => handleTabChange('recovery')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'recovery' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔄 Recovery
            </button>
          )}
          
          {showStatistics && (
            <button
              onClick={() => handleTabChange('statistics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'statistics' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📈 Statistics
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="h-full p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Penalty Score Card */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Penalty Score</h3>
                <div className="text-3xl font-bold text-indigo-600">{penaltyScore}/100</div>
                <div className="text-sm text-gray-600 mt-1">
                  {penaltyScore >= 80 ? 'Excellent' : penaltyScore >= 60 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              
              {/* Active Penalties Card */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Penalties</h3>
                <div className="text-3xl font-bold text-red-600">{totalPenalties}</div>
                <div className="text-sm text-gray-600 mt-1">Currently active</div>
              </div>
              
              {/* Total Deductions Card */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Deductions</h3>
                <div className="text-3xl font-bold text-orange-600">{totalDeductions}</div>
                <div className="text-sm text-gray-600 mt-1">XP deducted</div>
              </div>
              
              {/* Reductions Card */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">XP Recovered</h3>
                <div className="text-3xl font-bold text-green-600">{totalReductions}</div>
                <div className="text-sm text-gray-600 mt-1">Through reductions</div>
              </div>
              
              {/* Quick Actions Card */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  {enableAutoAppeal && (
                    <button className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                      🤖 Auto Appeal Eligible Penalties
                    </button>
                  )}
                  {enableReduction && (
                    <button className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      📉 Request Reduction
                    </button>
                  )}
                  {enableWaivers && (
                    <button className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                      📄 Apply for Waiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Penalties Tab */}
        {activeTab === 'penalties' && showHistory && (
          <div className="h-full p-4 bg-gray-50">
            <div className="space-y-4">
              {penalties.map(penalty => (
                <div key={penalty.id} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{penalty.type.replace('_', ' ').toUpperCase()}</h4>
                      <p className="text-sm text-gray-600">{penalty.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(penalty.severity)}`}>
                        {penalty.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(penalty.status)}`}>
                        {penalty.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>XP Deduction: {penalty.xpDeduction}</span>
                    <span>Date: {penalty.date.toLocaleDateString()}</span>
                  </div>
                  
                  {penalty.appealable && (
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Appeal Deadline: {penalty.appealDeadline?.toLocaleDateString() || 'N/A'}
                      </span>
                      <button
                        onClick={() => handleAppealSubmit(penalty.id, 'Disagree with penalty assessment')}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        📝 File Appeal
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Tab */}
        {!['overview', 'penalties'].includes(activeTab) && (
          <div className="h-full p-4 bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">
                {activeTab === 'appeals' ? '📝' :
                 activeTab === 'recovery' ? '🔄' :
                 activeTab === 'statistics' ? '📈' : '🔧'}
              </div>
              <p className="text-lg font-medium">
                {activeTab === 'appeals' ? 'Appeals Management' :
                 activeTab === 'recovery' ? 'Recovery Options' :
                 activeTab === 'statistics' ? 'Statistics & Analytics' : 'Feature Coming Soon'}
              </p>
            </div>
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
      {(appealCount > 0 || reductionCount > 0 || waiverCount > 0) && (
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          {appealCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📝 {appealCount}
            </div>
          )}
          {reductionCount > 0 && (
            <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📉 {reductionCount}
            </div>
          )}
          {waiverCount > 0 && (
            <div className="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              📄 {waiverCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PenaltySystem;
