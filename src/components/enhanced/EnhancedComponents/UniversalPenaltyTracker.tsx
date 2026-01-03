/**
 * Universal Penalty Tracker Component
 * Tracks penalties across all components with comprehensive management
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface UniversalPenaltyTrackerProps {
  children?: React.ReactNode;
  globalTracking?: boolean;
  showNotifications?: boolean;
  showAnalytics?: boolean;
  showHistory?: boolean;
  showAppeals?: boolean;
  showReductions?: boolean;
  showWaivers?: boolean;
  autoAppeal?: boolean;
  autoReduction?: boolean;
  xpReward?: number;
  xpSource?: string;
  showXPGain?: boolean;
  className?: string;
}

interface PenaltyContextType {
  penalties: any[];
  appeals: any[];
  reductions: any[];
  waivers: any[];
  addPenalty: (penalty: any) => void;
  addAppeal: (appeal: any) => void;
  addReduction: (reduction: any) => void;
  addWaiver: (waiver: any) => void;
  getPenaltyScore: () => number;
  getActivePenalties: () => any[];
}

const PenaltyContext = createContext<PenaltyContextType | null>(null);

export const usePenaltyContext = () => {
  const context = useContext(PenaltyContext);
  if (!context) {
    throw new Error('usePenaltyContext must be used within a PenaltyProvider');
  }
  return context;
};

export const PenaltyProvider: React.FC<UniversalPenaltyTrackerProps> = ({
  children,
  globalTracking = true,
  showNotifications = true,
  showAnalytics = true,
  showHistory = true,
  showAppeals = true,
  showReductions = true,
  showWaivers = true,
  autoAppeal = true,
  autoReduction = true,
  xpReward = 40,
  xpSource = 'universal_penalty_tracker',
  showXPGain = false,
  className = '',
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [penalties, setPenalties] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [reductions, setReductions] = useState<any[]>([]);
  const [waivers, setWaivers] = useState<any[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-appeal system
  useEffect(() => {
    if (autoAppeal && globalTracking) {
      const interval = setInterval(() => {
        const eligiblePenalties = penalties.filter(p => 
          p.status === 'active' && 
          p.appealable && 
          p.appealDeadline && 
          new Date() < p.appealDeadline
        );

        eligiblePenalties.forEach(penalty => {
          const appeal = {
            id: Date.now().toString(),
            penaltyId: penalty.id,
            reason: 'Auto-appeal: System detected eligible penalty',
            status: 'pending',
            submittedDate: new Date(),
            reviewedDate: null,
            reviewer: 'system_auto',
            outcome: null,
          };

          setAppeals(prev => [...prev, appeal]);
          setPenalties(prev => prev.map(p => 
            p.id === penalty.id ? { ...p, status: 'under_appeal' } : p
          ));

          // Award XP for auto-appeal
          if (xpReward > 0) {
            const appealXP = Math.floor(xpReward * 0.5);
            addXP(appealXP, `${xpSource}_auto_appeal`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
            
            if (showXPGain) {
              setShowReward(true);
              setTimeout(() => setShowReward(false), 1500);
            }
          }
        });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoAppeal, globalTracking, penalties, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  // Auto-reduction system
  useEffect(() => {
    if (autoReduction && globalTracking) {
      const interval = setInterval(() => {
        const eligiblePenalties = penalties.filter(p => 
          p.status === 'active' && 
          p.xpDeduction > 50 && 
          Math.random() < 0.1 // 10% chance for reduction
        );

        eligiblePenalties.forEach(penalty => {
          const reduction = {
            id: Date.now().toString(),
            penaltyId: penalty.id,
            originalDeduction: penalty.xpDeduction,
            reducedDeduction: Math.floor(penalty.xpDeduction * 0.5),
            reason: 'Auto-reduction: Good behavior detected',
            approvedBy: 'system_auto',
            approvedDate: new Date(),
          };

          setReductions(prev => [...prev, reduction]);
          setPenalties(prev => prev.map(p => 
            p.id === penalty.id ? { ...p, xpDeduction: reduction.reducedDeduction } : p
          ));

          // Award XP for auto-reduction
          if (xpReward > 0) {
            const reductionXP = Math.floor(xpReward * 0.3);
            addXP(reductionXP, `${xpSource}_auto_reduction`, {
              showNotification: showXPGain,
              trackActivity: true,
            });
            
            updateStreak('general');
            
            if (showXPGain) {
              setShowReward(true);
              setTimeout(() => setShowReward(false), 1500);
            }
          }
        });
      }, 45000); // Check every 45 seconds

      return () => clearInterval(interval);
    }
  }, [autoReduction, globalTracking, penalties, xpReward, xpSource, showXPGain, addXP, updateStreak]);

  const addPenalty = (penalty: any) => {
    setPenalties(prev => [...prev, penalty]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for penalty tracking
    if (xpReward > 0) {
      const trackingXP = Math.floor(xpReward * 0.2);
      addXP(trackingXP, `${xpSource}_penalty_tracking`, {
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

  const addAppeal = (appeal: any) => {
    setAppeals(prev => [...prev, appeal]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for appeal submission
    if (xpReward > 0) {
      const appealXP = Math.floor(xpReward * 0.4);
      addXP(appealXP, `${xpSource}_appeal_submission`, {
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

  const addReduction = (reduction: any) => {
    setReductions(prev => [...prev, reduction]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for reduction request
    if (xpReward > 0) {
      const reductionXP = Math.floor(xpReward * 0.5);
      addXP(reductionXP, `${xpSource}_reduction_request`, {
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

  const addWaiver = (waiver: any) => {
    setWaivers(prev => [...prev, waiver]);
    setInteractionCount(prev => prev + 1);
    
    // Award XP for waiver request
    if (xpReward > 0) {
      const waiverXP = Math.floor(xpReward * 0.6);
      addXP(waiverXP, `${xpSource}_waiver_request`, {
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

  const getPenaltyScore = () => {
    const totalDeductions = penalties.reduce((sum, p) => sum + (p.xpDeduction || 0), 0);
    const totalReductions = reductions.reduce((sum, r) => sum + (r.originalDeduction - r.reducedDeduction), 0);
    const totalWaivers = waivers.reduce((sum, w) => sum + (w.xpDeduction || 0), 0);
    
    const netDeductions = totalDeductions - totalReductions - totalWaivers;
    const score = Math.max(0, 100 - (netDeductions / 10));
    
    return score;
  };

  const getActivePenalties = () => {
    return penalties.filter(p => p.status === 'active');
  };

  const contextValue: PenaltyContextType = {
    penalties,
    appeals,
    reductions,
    waivers,
    addPenalty,
    addAppeal,
    addReduction,
    addWaiver,
    getPenaltyScore,
    getActivePenalties,
  };

  return (
    <PenaltyContext.Provider value={contextValue}>
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Universal Penalty Tracker</h2>
          <div className="flex items-center space-x-4">
            {/* Penalty Score */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Penalty Score:</span>
              <span className={`text-lg font-bold ${
                getPenaltyScore() >= 80 ? 'text-green-600' : 
                getPenaltyScore() >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getPenaltyScore()}/100
              </span>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Active: {getActivePenalties().length}</span>
              <span>Appeals: {appeals.filter(a => a.status === 'pending').length}</span>
              <span>Reductions: {reductions.length}</span>
              <span>Waivers: {waivers.length}</span>
            </div>
            
            {/* Processing Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-600">
                {isProcessing ? 'Processing...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => addPenalty({
              id: Date.now().toString(),
              type: 'test_violation',
              severity: 'medium',
              description: 'Test violation detected',
              xpDeduction: 25,
              date: new Date(),
              status: 'active',
              appealable: true,
              appealDeadline: new Date(Date.now() + 86400000 * 7),
            })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Add Test Penalty
          </button>
          
          <button
            onClick={() => addAppeal({
              id: Date.now().toString(),
              penaltyId: 'test_penalty_1',
              reason: 'False positive - test was correct',
              status: 'pending',
              submittedDate: new Date(),
              reviewedDate: null,
              reviewer: null,
              outcome: null,
            })}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            File Appeal
          </button>
          
          <button
            onClick={() => addReduction({
              id: Date.now().toString(),
              penaltyId: 'test_penalty_2',
              originalDeduction: 50,
              reducedDeduction: 25,
              reason: 'Good behavior - first offense reduction',
              approvedBy: 'system_auto',
              approvedDate: new Date(),
            })}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Request Reduction
          </button>
          
          <button
            onClick={() => addWaiver({
              id: Date.now().toString(),
              penaltyId: 'test_penalty_3',
              type: 'time_extension',
              reason: 'System maintenance - temporary waiver',
              status: 'approved',
              approvedBy: 'admin',
              approvedDate: new Date(),
              expires: new Date(Date.now() + 86400000 * 7),
            })}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Apply Waiver
          </button>
        </div>
        
        {/* Content */}
        {children}
        
        {/* XP Reward Animation */}
        {showReward && (
          <div className="fixed -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
            <span className="font-bold">+{xpReward} XP!</span>
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
        
        {/* Auto-system Status */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Auto-Systems Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Auto-Appeal:</span>
              <span className={autoAppeal ? 'text-green-600' : 'text-red-600'}>
                {autoAppeal ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-Reduction:</span>
              <span className={autoReduction ? 'text-green-600' : 'text-red-600'}>
                {autoReduction ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Global Tracking:</span>
              <span className={globalTracking ? 'text-green-600' : 'text-red-600'}>
                {globalTracking ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PenaltyContext.Provider>
  );
};

export default PenaltyProvider;
