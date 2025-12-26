import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Bell, Sparkles, Gift, Lock, Unlock, Zap, Trophy, Flame, Target, Users, TrendingUp, TrendingDown, Clock, Calendar, Coins, Crown, Shield, Gem, Skull, Package, CheckCircle, Timer, Rocket, Frown, AlertCircle, XCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DailySpinWheel } from './DailySpinWheel';
import { LootBoxOpener } from './LootBoxOpener';
import { EnergySystem } from './EnergySystem';
import { SlotMachineReward } from './SlotMachineReward';
import { getUnlockedPowerUps, type PowerUp as PowerUpType } from '../../data/powerUps';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// FOMO Timer Component - Creates urgency with countdown
const FOMOTimer = ({ deadline, title, reward }: { 
  deadline: Date; 
  title: string; 
  reward: string;
}) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = deadline.getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = deadline.getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (timeLeft === 0) return null;

  return (
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-red-400 font-bold text-sm">{title}</h3>
          <p className="text-red-300 text-xs">{reward}</p>
        </div>
        <div className="text-right">
          <div className="text-red-400 font-mono text-lg">
            {hours}h {minutes}m {seconds}s
          </div>
          <div className="text-red-500 text-xs">LEFT</div>
        </div>
      </div>
    </motion.div>
  );
};

// Punishment System Component - Shows penalties for inactivity
const PunishmentSystem = ({ enhancedStreak, lastActive }: { 
  enhancedStreak: number; 
  lastActive: Date;
}) => {
  const daysInactive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  const punishments = [
    { days: 1, penalty: '-10% XP', icon: <TrendingDown className="w-4 h-4" />, color: 'text-yellow-500' },
    { days: 3, penalty: '-25% XP', icon: <Frown className="w-4 h-4" />, color: 'text-orange-500' },
    { days: 7, penalty: '-50% XP', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500' },
    { days: 14, penalty: 'Streak Reset', icon: <Skull className="w-4 h-4" />, color: 'text-red-700' },
  ];

  const currentPunishment = punishments.find(p => daysInactive >= p.days);

  if (!currentPunishment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800 border-2 border-red-900 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={currentPunishment.color}>
            {currentPunishment.icon}
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-sm">Inactivity Penalty</h3>
            <p className="text-gray-400 text-xs">
              {daysInactive} days inactive - {currentPunishment.penalty}
            </p>
          </div>
        </div>
        <div className="text-red-500 text-xs font-mono">
          ACTIVE
        </div>
      </div>
    </motion.div>
  );
};

// Limited Time Offer Component - Creates scarcity
const LimitedTimeOffer = ({ offer, onClaim }: { 
  offer: {
    id: string;
    title: string;
    description: string;
    originalPrice: number;
    discountPrice: number;
    quantity: number;
    maxQuantity: number;
    expiresAt: Date;
  };
  onClaim: (offerId: string) => void;
}) => {
  const [claimed, setClaimed] = useState(false);
  const percentageOff = Math.round(((offer.originalPrice - offer.discountPrice) / offer.originalPrice) * 100);

  const handleClaim = () => {
    setClaimed(true);
    onClaim(offer.id);
  };

  return (
    <motion.div
      whileHover={{ scale: claimed ? 1 : 1.02 }}
      className={`border-2 rounded-lg p-4 ${
        claimed 
          ? 'bg-gray-800 border-gray-700 opacity-50' 
          : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-purple-400 font-bold">{offer.title}</h3>
          <p className="text-gray-400 text-xs">{offer.description}</p>
        </div>
        <div className="text-right">
          <div className="text-red-400 line-through text-sm">{offer.originalPrice}</div>
          <div className="text-green-400 font-bold">{offer.discountPrice}</div>
          <div className="text-purple-400 text-xs">-{percentageOff}%</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">Stock:</div>
          <div className="flex items-center space-x-1">
            <div className="w-20 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 rounded-full h-2"
                style={{ width: `${(offer.quantity / offer.maxQuantity) * 100}%` }}
              />
            </div>
            <span className="text-xs text-purple-400">{offer.quantity}/{offer.maxQuantity}</span>
          </div>
        </div>
        <FOMOTimer deadline={offer.expiresAt} title="Expires" reward="Limited Time" />
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed || offer.quantity === 0}
        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
          claimed
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : offer.quantity === 0
            ? 'bg-red-900 text-red-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {claimed ? 'Claimed' : offer.quantity === 0 ? 'Sold Out' : 'Claim Now'}
      </button>
    </motion.div>
  );
};

// Social Proof Component - Shows what others are doing
const SocialProof = ({ activities }: { 
  activities: Array<{
    user: string;
    action: string;
    reward: string;
    timestamp: Date;
  }>;
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-blue-400 font-bold mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Live Activity
      </h3>
      <div className="space-y-2">
        {activities.slice(0, 3).map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">{activity.user}</span>
              <span className="text-gray-500">{activity.action}</span>
            </div>
            <span className="text-green-400">{activity.reward}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">+127 others active now</span>
          <span className="text-blue-400">Join them!</span>
        </div>
      </div>
    </div>
  );
};

// Streak Saver Component - Prevents enhancedStreak loss
const StreakSaver = ({ enhancedStreak, onSave }: { 
  enhancedStreak: number; 
  onSave: () => void;
}) => {
  const [saved, setSaved] = useState(false);

  // Use enhancedStreak to determine if saver should show
  if (enhancedStreak < 3) return null;

  const handleSave = () => {
    setSaved(true);
    onSave();
  };

  return (
    <motion.div
      animate={{ scale: saved ? 1 : [1, 1.05, 1] }}
      transition={{ repeat: saved ? 0 : Infinity, duration: 3 }}
      className={`border-2 rounded-lg p-4 ${
        saved
          ? 'bg-green-900/20 border-green-700'
          : 'bg-orange-900/20 border-orange-500'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-orange-400 font-bold flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Streak Saver
          </h3>
          <p className="text-gray-400 text-xs">
            Protect your {enhancedStreak}-day enhancedStreak!
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${
            saved
              ? 'bg-green-700 text-green-300'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {saved ? 'Protected' : 'Protect'}
        </button>
      </div>
    </motion.div>
  );
};

// Loss Aversion Component - Shows what users will lose
const LossAversionFrame = ({ nextReward, lastActiveTime }: { 
  nextReward: string;
  lastActiveTime: Date;
}) => {
  const hoursUntilLoss = 24 - Math.floor((Date.now() - lastActiveTime.getTime()) / (1000 * 60 * 60));
  const willLoseSoon = hoursUntilLoss <= 6;

  return (
    <motion.div
      animate={{ 
        opacity: willLoseSoon ? [1, 0.7, 1] : 1,
        border: willLoseSoon ? ['2px solid #ef4444', '2px solid #dc2626', '2px solid #ef4444'] : '2px solid #374151'
      }}
      transition={{ repeat: willLoseSoon ? Infinity : 0, duration: 2 }}
      className="bg-gray-900 border-2 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-red-400 font-bold flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Don't Lose Your Progress!
        </h3>
        <span className="text-red-500 text-xs font-mono">
          {hoursUntilLoss}h left
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">You'll lose:</span>
          <span className="text-red-400 font-bold">{nextReward}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Streak bonus:</span>
          <span className="text-orange-400 font-bold">2.5x XP</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Daily rewards:</span>
          <span className="text-yellow-400 font-bold">+500 XP</span>
        </div>
      </div>
      
      <button className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700">
        Play Now to Protect
      </button>
    </motion.div>
  );
};

// Competition Leaderboard Component - Social comparison
const CompetitionLeaderboard = ({ rankings }: { 
  rankings: Array<{
    rank: number;
    user: string;
    score: number;
    trend: 'up' | 'down' | 'same';
    isCurrentUser?: boolean;
  }>;
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-400" />;
      case 'same': return <span className="w-3 h-3 text-gray-400">—</span>;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-purple-400 font-bold mb-3 flex items-center">
        <Trophy className="w-4 h-4 mr-2" />
        Global Leaderboard
      </h3>
      
      <div className="space-y-2">
        {rankings.slice(0, 5).map((user) => (
          <motion.div
            key={user.rank}
            whileHover={{ x: user.isCurrentUser ? 4 : 0 }}
            className={`flex items-center justify-between p-2 rounded ${
              user.isCurrentUser ? 'bg-purple-900/30 border border-purple-500' : 'bg-gray-700/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                user.rank === 1 ? 'bg-yellow-500 text-black' :
                user.rank === 2 ? 'bg-gray-400 text-black' :
                user.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {user.rank}
              </div>
              <span className={`text-sm ${user.isCurrentUser ? 'text-purple-300 font-bold' : 'text-gray-300'}`}>
                {user.user}
              </span>
              {getTrendIcon(user.trend)}
            </div>
            <span className={`text-sm font-mono ${user.isCurrentUser ? 'text-purple-400' : 'text-gray-400'}`}>
              {user.score.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">You're ranked #12</span>
          <span className="text-purple-400">Top 5%!</span>
        </div>
      </div>
    </div>
  );
};

// Urgency Notification Component - Push-style notifications
const UrgencyNotification = ({ notifications }: { 
  notifications: Array<{
    id: string;
    type: 'warning' | 'opportunity' | 'loss';
    title: string;
    message: string;
    timeLeft?: string;
    action?: string;
  }>;
}) => {
  const getTypeColor = (type: 'warning' | 'opportunity' | 'loss') => {
    switch (type) {
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      case 'opportunity': return 'border-green-500 bg-green-900/20';
      case 'loss': return 'border-red-500 bg-red-900/20';
    }
  };

  const getTypeIcon = (type: 'warning' | 'opportunity' | 'loss') => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'opportunity': return <Gift className="w-4 h-4 text-green-400" />;
      case 'loss': return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-2">
      {notifications.slice(0, 3).map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-lg p-3 ${getTypeColor(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getTypeIcon(notification.type)}
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm">{notification.title}</h4>
              <p className="text-gray-400 text-xs">{notification.message}</p>
              {notification.timeLeft && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-400 text-xs font-mono">{notification.timeLeft}</span>
                  {notification.action && (
                    <button className="text-blue-400 text-xs font-bold hover:underline">
                      {notification.action}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Reward Multiplier Component - Shows boosted rewards
const RewardMultiplier = ({ multipliers, onActivate }: { 
  multipliers: Array<{
    id: string;
    type: 'xp' | 'coins' | 'streak';
    multiplier: number;
    duration: number;
    cost: number;
    active: boolean;
  }>;
  onActivate: (id: string) => void;
}) => {
  const getMultiplierColor = (type: 'xp' | 'coins' | 'streak') => {
    switch (type) {
      case 'xp': return 'text-blue-400';
      case 'coins': return 'text-yellow-400';
      case 'streak': return 'text-orange-400';
    }
  };

  const getMultiplierIcon = (type: 'xp' | 'coins' | 'streak') => {
    switch (type) {
      case 'xp': return <Sparkles className="w-4 h-4" />;
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'streak': return <Flame className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-green-400 font-bold mb-3 flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        Reward Boosters
      </h3>
      
      <div className="space-y-2">
        {multipliers.map((mult) => (
          <div key={mult.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
            <div className="flex items-center space-x-3">
              {getMultiplierIcon(mult.type)}
              <div>
                <span className={`font-bold ${getMultiplierColor(mult.type)}`}>
                  {mult.multiplier}x {mult.type.toUpperCase()}
                </span>
                <p className="text-gray-400 text-xs">{mult.duration}min duration</p>
              </div>
            </div>
            <button
              onClick={() => onActivate(mult.id)}
              disabled={mult.active}
              className={`px-3 py-1 rounded text-xs font-bold ${
                mult.active
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {mult.active ? 'Active' : `${mult.cost} coins`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Daily Streak Challenge Component - Daily engagement goals
const DailyStreakChallenge = ({ challenges, onComplete }: { 
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: string;
    completed: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  onComplete: (id: string) => void;
}) => {
  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'border-green-500';
      case 'medium': return 'border-yellow-500';
      case 'hard': return 'border-red-500';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-cyan-400 font-bold mb-3 flex items-center">
        <Target className="w-4 h-4 mr-2" />
        Daily Challenges
      </h3>
      
      <div className="space-y-2">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            whileHover={{ scale: challenge.completed ? 1 : 1.02 }}
            className={`border-2 rounded-lg p-3 ${getDifficultyColor(challenge.difficulty)} ${
              challenge.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-white font-bold text-sm">{challenge.title}</h4>
                <p className="text-gray-400 text-xs">{challenge.description}</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 text-xs font-bold">{challenge.reward}</div>
                {challenge.completed && (
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {challenge.progress}/{challenge.target}
              </span>
            </div>
            
            {!challenge.completed && challenge.progress === challenge.target && (
              <button
                onClick={() => onComplete(challenge.id)}
                className="w-full mt-2 bg-cyan-600 text-white py-1 rounded text-xs font-bold hover:bg-cyan-700"
              >
                Claim Reward
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Variable Reward System - Randomized rewards for addiction
const VariableRewardSystem = ({ spins, onSpin }: { 
  spins: number;
  onSpin: () => void;
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string | null>(null);

  const possibleRewards = [
    { reward: '50 XP', probability: 0.3, color: 'text-green-400' },
    { reward: '100 XP', probability: 0.25, color: 'text-blue-400' },
    { reward: '250 XP', probability: 0.15, color: 'text-purple-400' },
    { reward: '500 XP', probability: 0.1, color: 'text-orange-400' },
    { reward: '1000 XP', probability: 0.05, color: 'text-red-400' },
    { reward: 'Power-Up', probability: 0.1, color: 'text-yellow-400' },
    { reward: 'Mystery Box', probability: 0.05, color: 'text-pink-400' }
  ];

  const handleSpin = () => {
    if (spins <= 0 || isSpinning) return;
    
    setIsSpinning(true);
    setTimeout(() => {
      const random = Math.random();
      let cumulative = 0;
      let selectedReward = possibleRewards[0];
      
      for (const reward of possibleRewards) {
        cumulative += reward.probability;
        if (random <= cumulative) {
          selectedReward = reward;
          break;
        }
      }
      
      setLastReward(selectedReward.reward);
      setIsSpinning(false);
      onSpin();
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500 rounded-lg p-4">
      <h3 className="text-purple-400 font-bold mb-3 flex items-center">
        <Sparkles className="w-4 h-4 mr-2" />
        Mystery Wheel
      </h3>
      
      <div className="text-center mb-4">
        <motion.div
          animate={{ rotate: isSpinning ? 360 : 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center"
        >
          <Gift className="w-10 h-10 text-white" />
        </motion.div>
        
        {lastReward && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <span className={`font-bold ${possibleRewards.find(r => r.reward === lastReward)?.color}`}>
              {lastReward}
            </span>
          </motion.div>
        )}
      </div>
      
      <button
        onClick={handleSpin}
        disabled={spins <= 0 || isSpinning}
        className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
          spins <= 0 || isSpinning
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isSpinning ? 'Spinning...' : spins > 0 ? `Spin (${spins} left)` : 'No Spins Left'}
      </button>
    </div>
  );
};

// Fear of Missing Out Banner - Urgent notifications
const FearOfMissingOutBanner = ({ offers, onAction }: { 
  offers: Array<{
    id: string;
    title: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    participants: number;
    maxParticipants: number;
    timeLeft: string;
  }>;
  onAction: (id: string) => void;
}) => {
  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high' | 'critical') => {
    switch (urgency) {
      case 'low': return 'border-blue-500 bg-blue-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'high': return 'border-orange-500 bg-orange-900/20';
      case 'critical': return 'border-red-500 bg-red-900/20';
    }
  };

  const getUrgencyPulse = (urgency: 'low' | 'medium' | 'high' | 'critical') => {
    switch (urgency) {
      case 'critical': return true;
      case 'high': return Math.random() > 0.5;
      default: return false;
    }
  };

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <motion.div
          key={offer.id}
          animate={{ 
            scale: getUrgencyPulse(offer.urgency) ? [1, 1.02, 1] : 1,
          }}
          transition={{ repeat: getUrgencyPulse(offer.urgency) ? Infinity : 0, duration: 2 }}
          className={`border-2 rounded-lg p-3 ${getUrgencyColor(offer.urgency)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-white font-bold text-sm flex items-center">
                <Bell className="w-3 h-3 mr-1 text-red-400" />
                {offer.title}
              </h4>
              <p className="text-gray-400 text-xs">
                {offer.participants}/{offer.maxParticipants} joined
              </p>
            </div>
            <div className="text-right">
              <div className="text-red-400 text-xs font-mono">{offer.timeLeft}</div>
              <div className="text-xs text-gray-500">left</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${(offer.participants / offer.maxParticipants) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {Math.round((offer.participants / offer.maxParticipants) * 100)}%
            </span>
          </div>
          
          <button
            onClick={() => onAction(offer.id)}
            className="w-full bg-red-600 text-white py-1 rounded text-xs font-bold hover:bg-red-700"
          >
            Join Now
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// Penalty System - Progressive punishments
const PenaltySystem = ({ violations, onRecover }: { 
  violations: Array<{
    type: 'missed_day' | 'inactivity' | 'challenge_failed';
    severity: 'warning' | 'penalty' | 'strike';
    description: string;
    cost: number;
    time: Date;
  }>;
  onRecover: (cost: number) => void;
}) => {
  const getSeverityColor = (severity: 'warning' | 'penalty' | 'strike') => {
    switch (severity) {
      case 'warning': return 'border-yellow-500';
      case 'penalty': return 'border-orange-500';
      case 'strike': return 'border-red-500';
    }
  };

  const totalCost = violations.reduce((sum, v) => sum + v.cost, 0);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-red-400 font-bold mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Penalties & Recovery
      </h3>
      
      <div className="space-y-2 mb-4">
        {violations.slice(0, 3).map((violation, index) => (
          <div key={index} className={`border-l-4 ${getSeverityColor(violation.severity)} pl-3 py-2`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">{violation.description}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(violation.time).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-red-400 text-sm font-bold">-{violation.cost} XP</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Total Recovery Cost:</span>
          <span className="text-red-400 font-bold">{totalCost} XP</span>
        </div>
        <button
          onClick={() => onRecover(totalCost)}
          className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-orange-700"
        >
          Recover All Penalties
        </button>
      </div>
    </div>
  );
};

// Exclusivity Gates - Premium content with scarcity
const ExclusivityGates = ({ gates, onUnlock }: { 
  gates: Array<{
    id: string;
    title: string;
    description: string;
    requirement: string;
    reward: string;
    locked: boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    timeLimited: boolean;
    expiresAt?: Date;
  }>;
  onUnlock: (id: string) => void;
}) => {
  const getRarityColor = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
    }
  };

  const getRarityBg = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
      case 'common': return 'bg-gray-900/20';
      case 'rare': return 'bg-blue-900/20';
      case 'epic': return 'bg-purple-900/20';
      case 'legendary': return 'bg-yellow-900/20';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
        <Lock className="w-4 h-4 mr-2" />
        Exclusive Rewards
      </h3>
      
      <div className="space-y-3">
        {gates.map((gate) => (
          <div key={gate.id} className={`border-2 rounded-lg p-3 ${getRarityColor(gate.rarity)} ${getRarityBg(gate.rarity)}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-white font-bold text-sm flex items-center">
                  {gate.locked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                  {gate.title}
                </h4>
                <p className="text-gray-400 text-xs">{gate.description}</p>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 text-xs font-bold">{gate.reward}</div>
                {gate.timeLimited && gate.expiresAt && (
                  <div className="text-red-400 text-xs">
                    {Math.ceil((gate.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))}h left
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{gate.requirement}</span>
              <button
                onClick={() => onUnlock(gate.id)}
                disabled={!gate.locked}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  gate.locked
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white'
                }`}
              >
                {gate.locked ? 'Unlock' : 'Unlocked'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dark Pattern Component - Manipulative design patterns
const DarkPatternSystem = ({ patterns, onAction }: { 
  patterns: Array<{
    id: string;
    type: 'false_urgency' | 'hidden_costs' | 'social_pressure' | 'confirmshaming';
    title: string;
    description: string;
    action: string;
    alternative: string;
  }>;
  onAction: (id: string, action: 'primary' | 'alternative') => void;
}) => {
  const getPatternColor = (type: 'false_urgency' | 'hidden_costs' | 'social_pressure' | 'confirmshaming') => {
    switch (type) {
      case 'false_urgency': return 'border-red-500 bg-red-900/20';
      case 'hidden_costs': return 'border-orange-500 bg-orange-900/20';
      case 'social_pressure': return 'border-purple-500 bg-purple-900/20';
      case 'confirmshaming': return 'border-blue-500 bg-blue-900/20';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-red-400 font-bold mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Special Offers
      </h3>
      
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <div key={pattern.id} className={`border-2 rounded-lg p-3 ${getPatternColor(pattern.type)}`}>
            <h4 className="text-white font-bold text-sm mb-1">{pattern.title}</h4>
            <p className="text-gray-400 text-xs mb-3">{pattern.description}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => onAction(pattern.id, 'primary')}
                className="flex-1 bg-red-600 text-white py-2 rounded text-xs font-bold hover:bg-red-700"
              >
                {pattern.action}
              </button>
              <button
                onClick={() => onAction(pattern.id, 'alternative')}
                className="px-3 py-2 bg-gray-700 text-gray-400 rounded text-xs hover:bg-gray-600"
              >
                {pattern.alternative}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Addiction Loop Component - Reinforcement schedules
const AddictionLoopSystem = ({ loops, onComplete }: { 
  loops: Array<{
    id: string;
    name: string;
    currentProgress: number;
    maxProgress: number;
    reward: string;
    interval: number; // minutes
    lastCompleted: Date;
    isAddictive: boolean;
  }>;
  onComplete: (id: string) => void;
}) => {
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      loops.forEach(loop => {
        const timeSinceLast = Date.now() - loop.lastCompleted.getTime();
        const timeUntilNext = loop.interval * 60 * 1000 - timeSinceLast;
        newTimers[loop.id] = Math.max(0, Math.floor(timeUntilNext / 1000 / 60));
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [loops]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-purple-400 font-bold mb-3 flex items-center">
        <Zap className="w-4 h-4 mr-2" />
        Quick Rewards
      </h3>
      
      <div className="space-y-3">
        {loops.map((loop) => {
          const isReady = timers[loop.id] === 0;
          const progress = (loop.currentProgress / loop.maxProgress) * 100;
          
          return (
            <motion.div
              key={loop.id}
              animate={{ 
                scale: isReady && loop.isAddictive ? [1, 1.05, 1] : 1,
              }}
              transition={{ repeat: isReady && loop.isAddictive ? Infinity : 0, duration: 2 }}
              className={`border-2 rounded-lg p-3 ${
                isReady ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white font-bold text-sm">{loop.name}</h4>
                  <p className="text-gray-400 text-xs">{loop.reward}</p>
                </div>
                <div className="text-right">
                  {isReady ? (
                    <span className="text-green-400 text-xs font-bold">READY!</span>
                  ) : (
                    <span className="text-gray-400 text-xs">{timers[loop.id]}m</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {loop.currentProgress}/{loop.maxProgress}
                </span>
              </div>
              
              <button
                onClick={() => onComplete(loop.id)}
                disabled={!isReady}
                className={`w-full py-1 rounded text-xs font-bold ${
                  isReady
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isReady ? 'Claim Now' : `Wait ${timers[loop.id]}m`}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Social Comparison Engine - Constant comparison with others
const SocialComparisonEngine = ({ comparisons, userStats }: { 
  comparisons: Array<{
    userId: string;
    username: string;
    avatar: string;
    stats: {
      level: number;
      xp: number;
      achievements: number;
      enhancedStreak: number;
    };
    trend: 'gaining' | 'losing' | 'stable';
  }>;
  userStats: {
    level: number;
    xp: number;
    achievements: number;
    enhancedStreak: number;
    rank: number;
  };
}) => {
  const getTrendIcon = (trend: 'gaining' | 'losing' | 'stable') => {
    switch (trend) {
      case 'gaining': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'losing': return <TrendingDown className="w-3 h-3 text-red-400" />;
      case 'stable': return <span className="w-3 h-3 text-gray-400">—</span>;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-blue-400 font-bold mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        You vs Others
      </h3>
      
      <div className="space-y-2">
        {comparisons.slice(0, 4).map((comparison) => (
          <div key={comparison.userId} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {comparison.avatar}
              </div>
              <div>
                <p className="text-white text-sm font-bold">{comparison.username}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>Lvl {comparison.stats.level}</span>
                  <span>{comparison.stats.xp.toLocaleString()} XP</span>
                  {getTrendIcon(comparison.trend)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">
                {comparison.stats.achievements} achievements
              </div>
              <div className="text-xs text-orange-400">
                {comparison.stats.enhancedStreak} day enhancedStreak
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">You</p>
            <p className="text-gray-400 text-xs">Rank #{userStats.rank} globally</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">
              {userStats.achievements} achievements
            </div>
            <div className="text-xs text-orange-400">
              {userStats.enhancedStreak} day enhancedStreak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extreme FOMO Component - Maximum psychological pressure
const ExtremeFOMOSystem = ({ events, onJoin }: { 
  events: Array<{
    id: string;
    title: string;
    description: string;
    urgencyLevel: 'critical' | 'extreme' | 'ultimate';
    participants: number;
    maxParticipants: number;
    timeLeft: string;
    socialProof: string[];
    lossStatement: string;
  }>;
  onJoin: (id: string) => void;
}) => {
  const getUrgencyColor = (level: 'critical' | 'extreme' | 'ultimate') => {
    switch (level) {
      case 'critical': return 'border-red-600 bg-red-950/30';
      case 'extreme': return 'border-orange-600 bg-orange-950/30';
      case 'ultimate': return 'border-purple-600 bg-purple-950/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <motion.div
          key={event.id}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`border-2 rounded-lg p-4 ${getUrgencyColor(event.urgencyLevel)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-red-400 font-bold text-lg">{event.title}</h3>
              <p className="text-gray-300 text-sm mt-1">{event.description}</p>
              <div className="mt-2 space-y-1">
                {event.socialProof.map((proof, index) => (
                  <div key={index} className="text-xs text-gray-400 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {proof}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-red-500 font-mono text-lg font-bold">{event.timeLeft}</div>
              <div className="text-xs text-gray-400">remaining</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Spots remaining:</span>
              <span className="text-red-400 font-bold">
                {event.maxParticipants - event.participants}/{event.maxParticipants}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-600 to-orange-600 rounded-full h-3 transition-all duration-300"
                style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-red-900/20 border border-red-700 rounded p-2 mb-3">
            <p className="text-red-300 text-xs font-bold flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {event.lossStatement}
            </p>
          </div>
          
          <button
            onClick={() => onJoin(event.id)}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold hover:from-red-700 hover:to-orange-700"
          >
            JOIN NOW OR REGRET FOREVER
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// Extreme Punishment System - Maximum fear and loss aversion
const ExtremePunishmentSystem = ({ violations, onPrevent }: { 
  violations: Array<{
    id: string;
    type: 'enhancedStreak_loss' | 'rank_drop' | 'reward_forfeit';
    severity: 'warning' | 'danger' | 'critical';
    description: string;
    consequences: string[];
    timeUntil: string;
    preventCost: number;
  }>;
  onPrevent: (id: string, cost: number) => void;
}) => {
  const getSeverityColor = (severity: 'warning' | 'danger' | 'critical') => {
    switch (severity) {
      case 'warning': return 'border-yellow-600 bg-yellow-950/30';
      case 'danger': return 'border-orange-600 bg-orange-950/30';
      case 'critical': return 'border-red-600 bg-red-950/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-4">
      {violations.map((violation) => (
        <motion.div
          key={violation.id}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`border-2 rounded-lg p-4 ${getSeverityColor(violation.severity)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg">{violation.description}</h3>
              <div className="text-red-400 font-mono text-sm">{violation.timeUntil} until impact</div>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <h4 className="text-red-300 font-bold text-sm">CONSEQUENCES:</h4>
            {violation.consequences.map((consequence, index) => (
              <div key={index} className="text-gray-300 text-sm">
                • {consequence}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onPrevent(violation.id, violation.preventCost)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
            >
              PREVENT ({violation.preventCost} XP)
            </button>
            <button className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600">
              RISK IT
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Achievement Card
const AchievementCard = ({ achievement, onClaim }: { 
  achievement: Achievement; 
  onClaim: (achievementId: string) => void;
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'enhancedStreak': return 'bg-orange-100 text-orange-600';
      case 'tasks': return 'bg-green-100 text-green-600';
      case 'coding': return 'bg-blue-100 text-blue-600';
      case 'social': return 'bg-purple-100 text-purple-600';
      case 'special': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className={`p-4 ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}>
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{achievement.name}</h4>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{achievement.progress}/{achievement.target}</div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold text-green-600">+{achievement.xpReward} XP</div>
          </div>
        </div>
        <div className="ml-4">
          {achievement.unlocked ? (
            <Button size="sm" onClick={() => onClaim(achievement.id)}>
              Claim
            </Button>
          ) : (
            <CheckCircle className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>
    </Card>
  );
};

// Sub-component for Daily Reward Card
const DailyRewardCard = ({ reward, onClaim }: { 
  reward: DailyReward; 
  onClaim: (day: number) => void;
}) => {
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'xp': return <Sparkles className="w-6 h-6 text-blue-500" />;
      case 'coins': return <Coins className="w-6 h-6 text-yellow-500" />;
      case 'powerup': return <Zap className="w-6 h-6 text-purple-500" />;
      case 'chest': return <Package className="w-6 h-6 text-orange-500" />;
      default: return <Gift className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <Card className={`p-4 text-center ${reward.current ? 'ring-2 ring-blue-500' : ''} ${reward.claimed ? 'opacity-50' : ''}`}>
      <div className="text-2xl font-bold mb-2">Day {reward.day}</div>
      <div className="flex justify-center mb-3">
        {getRewardIcon(reward.reward.type)}
      </div>
      <div className="text-sm font-semibold mb-2">
        {reward.reward.amount} {reward.reward.type}
        {reward.reward.item && ` - ${reward.reward.item}`}
      </div>
      <Button 
        size="sm" 
        disabled={reward.claimed || !reward.current}
        onClick={() => onClaim(reward.day)}
      >
        {reward.claimed ? 'Claimed' : reward.current ? 'Claim' : 'Locked'}
      </Button>
    </Card>
  );
};

// Sub-component for Power Up Card
const PowerUpCard = ({ powerUp, onUse }: { 
  powerUp: PowerUpType; 
  onUse: (powerUpId: string) => void;
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-600 border-purple-300';
      case 'legendary': return 'bg-orange-100 text-orange-600 border-orange-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <Card className={`p-4 border-2 ${getRarityColor(powerUp.rarity)}`}>
      <div className="text-center">
        <div className="text-2xl mb-2">{powerUp.icon}</div>
        <h4 className="font-semibold">{powerUp.name}</h4>
        <p className="text-sm text-gray-600 mb-2">{powerUp.description}</p>
        <div className="text-xs text-gray-500 mb-3">
          Duration: {powerUp.duration}s | Uses: {powerUp.uses}
        </div>
        <Button 
          size="sm" 
          onClick={() => onUse(powerUp.id)}
          disabled={powerUp.uses <= 0}
        >
          {powerUp.uses > 0 ? 'Use' : 'Out of Uses'}
        </Button>
      </div>
    </Card>
  );
};

// Sub-component for Season Pass Tier
const SeasonPassTier = ({ tier, isPremium, onClaim }: { 
  tier: any; 
  isPremium: boolean;
  onClaim: (tierNumber: number, isPremium: boolean) => void;
}) => {
  return (
    <Card className={`p-4 mb-2 ${tier.claimed ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">Tier {tier.tier}</div>
          <div>
            <div className="text-sm font-semibold">Free: {tier.free}</div>
            <div className="text-sm font-semibold text-purple-600">Premium: {tier.premium}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            disabled={tier.claimed}
            onClick={() => onClaim(tier.tier, false)}
          >
            {tier.claimed ? 'Claimed' : 'Claim Free'}
          </Button>
          <Button 
            size="sm"
            disabled={tier.claimed || !isPremium}
            onClick={() => onClaim(tier.tier, true)}
          >
            {tier.claimed ? 'Claimed' : isPremium ? 'Claim Premium' : 'Upgrade'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Sub-component for Stats Overview
const GamificationStats = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="text-center">
        <CardContent className="p-4">
          <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold">{stats.enhancedStreak || 0}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{stats.coins || 0}</div>
          <div className="text-sm text-gray-600">Coins</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{stats.achievements || 0}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{stats.powerUps || 0}</div>
          <div className="text-sm text-gray-600">Power-Ups</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Using PowerUp type from powerUps.ts

interface DailyReward {
  day: number;
  reward: { type: 'xp' | 'coins' | 'powerup' | 'chest'; amount: number; item?: string };
  claimed: boolean;
  current: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  xpReward: number;
  unlocked: boolean;
  category: 'streak' | 'tasks' | 'coding' | 'social' | 'special';
}

interface SeasonPass {
  currentTier: number;
  maxTier: number;
  xpProgress: number;
  xpPerTier: number;
  rewards: { tier: number; free: string; premium: string; claimed: boolean }[];
}

interface LootBox {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  possibleRewards: string[];
  owned: number;
}

// Level titles with better progression
const LEVEL_TITLES = [
  { level: 1, title: 'Beginner', color: 'from-gray-400 to-gray-500' },
  { level: 5, title: 'Apprentice', color: 'from-green-400 to-green-600' },
  { level: 10, title: 'Skilled', color: 'from-blue-400 to-blue-600' },
  { level: 15, title: 'Expert', color: 'from-purple-400 to-purple-600' },
  { level: 20, title: 'Master', color: 'from-orange-400 to-red-500' },
  { level: 25, title: 'Grandmaster', color: 'from-yellow-400 to-orange-500' },
  { level: 30, title: 'Legend', color: 'from-pink-400 to-rose-600' },
  { level: 40, title: 'Mythic', color: 'from-cyan-400 to-blue-600' },
  { level: 50, title: 'Immortal', color: 'from-amber-300 to-yellow-500' },
];

export function GamificationHub() {
  const { state, dispatch } = useApp();
  const { user, codingStats, tasks, xpSystem } = state;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'powerups' | 'achievements' | 'season'>('overview');
  const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('claimedAchievements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [claimedSeasonRewards, setClaimedSeasonRewards] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('claimedSeasonRewards');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Core stats from state
  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const baseStreak = codingStats?.currentStreak || user?.streak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const coins = Math.floor(currentXP / 10); // Derive coins from XP

  // Enhanced streak calculation with proper logic
  const enhancedStreak = useMemo(() => {
    // Base streak from coding stats
    const streakBase = codingStats?.currentStreak || 0;
    
    // Boost streak with task completion
    const taskStreakBonus = Math.floor(completedTasks / 5);
    
    // Calculate total streak with bonuses
    const totalStreak = streakBase + taskStreakBonus;
    
    return Math.max(0, totalStreak);
  }, [codingStats?.currentStreak, completedTasks]);

  // Dynamic XP calculations
  const xpStats = useMemo(() => {
    const xpForNextLevel = Math.floor(1000 * Math.pow(1.1, currentLevel - 1));
    const xpForPrevLevel = currentLevel > 1 ? Math.floor(1000 * Math.pow(1.1, currentLevel - 2)) : 0;
    const levelXP = currentXP - xpForPrevLevel;
    const neededXP = xpForNextLevel - xpForPrevLevel;
    const progress = Math.min((levelXP / neededXP) * 100, 100);
    
    // Find current title
    const titleInfo = [...LEVEL_TITLES].reverse().find(t => currentLevel >= t.level) || LEVEL_TITLES[0];
    
    return { xpForNextLevel, levelXP, neededXP, progress, titleInfo };
  }, [currentXP, currentLevel]);

  // Streak multiplier
  const streakMultiplier = useMemo(() => {
    if (enhancedStreak >= 30) return 2.5;
    if (enhancedStreak >= 21) return 2.0;
    if (enhancedStreak >= 14) return 1.75;
    if (enhancedStreak >= 7) return 1.5;
    if (enhancedStreak >= 3) return 1.25;
    return 1.0;
  }, [enhancedStreak]);

  // Get all unlocked power-ups based on user stats
  const unlockedPowerUps = useMemo(() => {
    return getUnlockedPowerUps(currentLevel, enhancedStreak, completedTasks, currentXP);
  }, [currentLevel, enhancedStreak, completedTasks, currentXP]);

  // Enhanced power-ups with ownership and active state
  const powerUps = useMemo<Array<PowerUpType & { owned: number; active: boolean; remainingTime: number }>>(() => {
    return unlockedPowerUps.map(pu => {
      const ownedCount = state.ownedPowerUps?.[pu.id] || 0;
      const activeState = state.activePowerUps?.find(p => p.id === pu.id);
      
      return {
        ...pu,
        owned: ownedCount,
        active: !!activeState,
        remainingTime: activeState ? Math.max(0, Math.ceil((activeState.expiresAt - Date.now()) / 60000)) : 0
      };
    });
  }, [unlockedPowerUps, state.ownedPowerUps, state.activePowerUps]);

  // Daily rewards calendar
  const dailyRewards = useMemo<DailyReward[]>(() => {
    const currentDay = enhancedStreak % 7 + 1;
    return [
      { day: 1, reward: { type: 'xp', amount: 50 }, claimed: enhancedStreak >= 1, current: currentDay === 1 },
      { day: 2, reward: { type: 'coins', amount: 100 }, claimed: enhancedStreak >= 2, current: currentDay === 2 },
      { day: 3, reward: { type: 'xp', amount: 100 }, claimed: enhancedStreak >= 3, current: currentDay === 3 },
      { day: 4, reward: { type: 'powerup', amount: 1, item: 'Focus Mode' }, claimed: enhancedStreak >= 4, current: currentDay === 4 },
      { day: 5, reward: { type: 'coins', amount: 250 }, claimed: enhancedStreak >= 5, current: currentDay === 5 },
      { day: 6, reward: { type: 'xp', amount: 200 }, claimed: enhancedStreak >= 6, current: currentDay === 6 },
      { day: 7, reward: { type: 'chest', amount: 1, item: 'Weekly Chest' }, claimed: enhancedStreak >= 7, current: currentDay === 7 },
    ];
  }, [enhancedStreak]);

  // Achievements based on real progress
  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'enhancedStreak_3',
      name: 'Getting Started',
      description: 'Maintain a 3-day enhancedStreak',
      icon: '🔥',
      progress: Math.min(enhancedStreak, 3),
      target: 3,
      xpReward: 100,
      unlocked: enhancedStreak >= 3,
      category: 'streak'
    },
    {
      id: 'enhancedStreak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day enhancedStreak',
      icon: '⚡',
      progress: Math.min(enhancedStreak, 7),
      target: 7,
      xpReward: 250,
      unlocked: enhancedStreak >= 7,
      category: 'streak'
    },
    {
      id: 'enhancedStreak_30',
      name: 'Monthly Master',
      description: 'Maintain a 30-day enhancedStreak',
      icon: '👑',
      progress: Math.min(enhancedStreak, 30),
      target: 30,
      xpReward: 1000,
      unlocked: enhancedStreak >= 30,
      category: 'streak'
    },
    {
      id: 'tasks_10',
      name: 'Task Tackler',
      description: 'Complete 10 tasks',
      icon: '✅',
      progress: Math.min(completedTasks, 10),
      target: 10,
      xpReward: 150,
      unlocked: completedTasks >= 10,
      category: 'tasks'
    },
    {
      id: 'tasks_50',
      name: 'Productivity Pro',
      description: 'Complete 50 tasks',
      icon: '🚀',
      progress: Math.min(completedTasks, 50),
      target: 50,
      xpReward: 500,
      unlocked: completedTasks >= 50,
      category: 'tasks'
    },
    {
      id: 'level_10',
      name: 'Rising Star',
      description: 'Reach level 10',
      icon: '⭐',
      progress: Math.min(currentLevel, 10),
      target: 10,
      xpReward: 300,
      unlocked: currentLevel >= 10,
      category: 'special'
    },
    {
      id: 'level_25',
      name: 'Elite Status',
      description: 'Reach level 25',
      icon: '💎',
      progress: Math.min(currentLevel, 25),
      target: 25,
      xpReward: 1000,
      unlocked: currentLevel >= 25,
      category: 'special'
    },
    {
      id: 'coding_easy',
      name: 'Easy Solver',
      description: 'Solve 10 easy problems',
      icon: '🟢',
      progress: Math.min(codingStats?.easyCount || 0, 10),
      target: 10,
      xpReward: 100,
      unlocked: (codingStats?.easyCount || 0) >= 10,
      category: 'coding'
    },
    {
      id: 'coding_medium',
      name: 'Medium Master',
      description: 'Solve 10 medium problems',
      icon: '🟡',
      progress: Math.min(codingStats?.mediumCount || 0, 10),
      target: 10,
      xpReward: 250,
      unlocked: (codingStats?.mediumCount || 0) >= 10,
      category: 'coding'
    },
    {
      id: 'coding_hard',
      name: 'Hard Mode Hero',
      description: 'Solve 5 hard problems',
      icon: '🔴',
      progress: Math.min(codingStats?.hardCount || 0, 5),
      target: 5,
      xpReward: 500,
      unlocked: (codingStats?.hardCount || 0) >= 5,
      category: 'coding'
    },
  ], [enhancedStreak, completedTasks, currentLevel, codingStats]);

  // Season pass progress
  const seasonPass = useMemo<SeasonPass>(() => {
    const xpPerTier = 500;
    const currentTier = Math.floor(currentXP / xpPerTier);
    return {
      currentTier: Math.min(currentTier, 50),
      maxTier: 50,
      xpProgress: currentXP % xpPerTier,
      xpPerTier,
      rewards: Array.from({ length: 10 }, (_, i) => ({
        tier: (i + 1) * 5,
        free: ['100 XP', '1 Power-Up', '250 XP', '500 Coins', '2 Power-Ups', 'Rare Chest', '500 XP', '1000 Coins', 'Epic Chest', 'Legendary Chest'][i],
        premium: ['250 XP', '3 Power-Ups', '500 XP', '1500 Coins', '5 Power-Ups', 'Epic Chest', '1000 XP', '3000 Coins', 'Legendary Chest', 'Mythic Chest'][i],
        claimed: currentTier >= (i + 1) * 5
      }))
    };
  }, [currentXP]);

  // Loot boxes
  const lootBoxes = useMemo<LootBox[]>(() => [
    {
      id: '1',
      name: 'Common Chest',
      rarity: 'common',
      cost: 100,
      possibleRewards: ['50-100 XP', '1 Focus Mode', '50-100 Coins'],
      owned: Math.floor(completedTasks / 5)
    },
    {
      id: '2',
      name: 'Rare Chest',
      rarity: 'rare',
      cost: 500,
      possibleRewards: ['200-500 XP', '2-3 Power-Ups', '200-500 Coins', 'Rare Badge'],
      owned: Math.floor(enhancedStreak / 7)
    },
    {
      id: '3',
      name: 'Epic Chest',
      rarity: 'epic',
      cost: 1500,
      possibleRewards: ['500-1000 XP', '5 Power-Ups', '1000 Coins', 'Epic Badge', 'Streak Shield'],
      owned: Math.floor(currentLevel / 10)
    },
    {
      id: '4',
      name: 'Legendary Chest',
      rarity: 'legendary',
      cost: 5000,
      possibleRewards: ['2000+ XP', '10 Power-Ups', '5000 Coins', 'Legendary Badge', 'Lucky Charm', 'Exclusive Title'],
      owned: Math.floor(currentLevel / 25)
    },
  ], [completedTasks, enhancedStreak, currentLevel]);

  // Time until daily reset
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  // Active power-ups count
  const activePowerUps = powerUps.filter(p => p.active);

  // Claim daily login - persist to localStorage
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().split('T')[0];
    const lastClaimed = localStorage.getItem('dailyLoginClaimed');
    return lastClaimed === today;
  });

  const claimDailyLogin = () => {
    if (dailyLoginClaimed) return;
    const reward = 50 + enhancedStreak * 10;
    dispatch({ type: 'ADD_XP', payload: { amount: reward, source: 'Daily Login' } });
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailyLoginClaimed', today);
    setDailyLoginClaimed(true);
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: '🎁 Daily Login Bonus!',
        message: `You earned ${reward} XP!`,
        timestamp: new Date(),
      },
    });
  };

  // Tab content components
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Addictive Game Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <DailySpinWheel />
        <SlotMachineReward />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <EnergySystem />
        <LootBoxOpener />
      </div>
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-zinc-900 border-2 border-white text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm font-mono uppercase">Current Rank</p>
                <h2 className="text-2xl font-black font-mono uppercase text-brutal-cyan">{xpStats.titleInfo.title}</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black font-mono">{currentLevel}</div>
                <p className="text-gray-400 text-sm font-mono uppercase">Level</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1 font-mono">
                <span>{xpStats.levelXP.toLocaleString()} / {xpStats.neededXP.toLocaleString()} XP</span>
                <span>{xpStats.progress.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-black border-2 border-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpStats.progress}%` }}
                  className="h-full bg-brutal-green border-r-2 border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-mono mt-4">
              <span className="flex items-center gap-1 text-brutal-yellow">
                <Coins size={14} /> {currentXP.toLocaleString()} Total XP
              </span>
              <span className="flex items-center gap-1 text-brutal-pink">
                <Gem size={14} /> {coins.toLocaleString()} Coins
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-2">
              <span className="flex items-center gap-1 text-lime-400">
                <Zap size={12} /> {xpSystem.xpMultiplier.toFixed(2)}x Multiplier
              </span>
              {xpSystem.bonusXPActive && xpSystem.bonusXPExpiry && (
                <span className="text-fuchsia-400">
                  Expires in {Math.max(0, Math.ceil((xpSystem.bonusXPExpiry.getTime() - Date.now()) / 60000))}m
                </span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -2 }}>
          <Card className="border-2 bg-zinc-900 border-orange-500 p-4 text-center h-full flex flex-col justify-center items-center">
            <Flame className="text-orange-400 mb-2" size={24} />
            <p className="text-2xl font-black text-white font-mono">{enhancedStreak}</p>
            <p className="text-xs text-gray-500 font-mono uppercase">Day Streak</p>
            <p className="text-xs text-orange-400 mt-1 font-mono">{streakMultiplier}x Bonus</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className="border-2 bg-zinc-900 border-lime-500 p-4 text-center h-full flex flex-col justify-center items-center">
            <Zap className="text-lime-400 mb-2" size={24} />
            <p className="text-2xl font-black text-white font-mono">{activePowerUps.length}</p>
            <p className="text-xs text-gray-500 font-mono uppercase">Active Boosts</p>
            <p className="text-xs text-lime-400 mt-1 font-mono">{powerUps.reduce((a, p) => a + p.owned, 0)} Total</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className="border-2 bg-zinc-900 border-cyan-500 p-4 text-center h-full flex flex-col justify-center items-center">
            <Trophy className="text-cyan-400 mb-2" size={24} />
            <p className="text-2xl font-black text-white font-mono">{achievements.filter(a => a.unlocked).length}</p>
            <p className="text-xs text-gray-500 font-mono uppercase">Achievements</p>
            <p className="text-xs text-cyan-400 mt-1 font-mono">of {achievements.length}</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className="border-2 bg-zinc-900 border-fuchsia-500 p-4 text-center h-full flex flex-col justify-center items-center">
            <Package className="text-fuchsia-400 mb-2" size={24} />
            <p className="text-2xl font-black text-white font-mono">{lootBoxes.reduce((a, b) => a + b.owned, 0)}</p>
            <p className="text-xs text-gray-500 font-mono uppercase">Chests</p>
            <p className="text-xs text-fuchsia-400 mt-1 font-mono">Ready to Open</p>
          </Card>
        </motion.div>
      </div>

      {/* FOMO and Punishment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FOMO Timer - Limited Time Offers */}
        <FOMOTimer 
          deadline={new Date(Date.now() + 2 * 60 * 60 * 1000)} 
          title="Flash Sale Ends" 
          reward="50% OFF Power-Ups"
        />
        
        {/* Punishment System */}
        <PunishmentSystem 
          enhancedStreak={enhancedStreak} 
          lastActive={new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)}
        />
      </div>

      {/* Limited Time Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LimitedTimeOffer
          offer={{
            id: 'flash-sale-1',
            title: 'Mega Power-Up Pack',
            description: 'Get 10 legendary power-ups at 70% off!',
            originalPrice: 5000,
            discountPrice: 1500,
            quantity: 3,
            maxQuantity: 10,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
          }}
          onClaim={(id) => console.log('Claimed offer:', id)}
        />
        
        <LimitedTimeOffer
          offer={{
            id: 'flash-sale-2',
            title: 'XP Booster Bundle',
            description: 'Double your XP for 24 hours!',
            originalPrice: 2000,
            discountPrice: 800,
            quantity: 7,
            maxQuantity: 15,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
          }}
          onClaim={(id) => console.log('Claimed offer:', id)}
        />
      </div>

      {/* Social Proof and Streak Protection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SocialProof 
          activities={[
            { user: 'Alex_Pro', action: 'completed challenge', reward: '+250 XP', timestamp: new Date() },
            { user: 'Sarah_Coder', action: 'bought power-up', reward: 'Legendary', timestamp: new Date() },
            { user: 'Mike_Dev', action: 'reached level 25', reward: 'Elite Status', timestamp: new Date() },
            { user: 'Emma_Build', action: 'maintained enhancedStreak', reward: '30 days', timestamp: new Date() },
            { user: 'John_Code', action: 'opened chest', reward: 'Epic', timestamp: new Date() }
          ]}
        />
        
        <StreakSaver 
          enhancedStreak={enhancedStreak}
          onSave={() => console.log('Streak protected!')}
        />
      </div>

      {/* Loss Aversion and Competition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LossAversionFrame 
          nextReward="2.5x XP Bonus"
          lastActiveTime={new Date(Date.now() - 8 * 60 * 60 * 1000)}
        />
        
        <CompetitionLeaderboard 
          rankings={[
            { rank: 1, user: 'ProCoder99', score: 15420, trend: 'up' },
            { rank: 2, user: 'NinjaDev', score: 14850, trend: 'down' },
            { rank: 3, user: 'CodeMaster', score: 14100, trend: 'same' },
            { rank: 4, user: 'You', score: 13200, trend: 'up', isCurrentUser: true },
            { rank: 5, user: 'EliteCoder', score: 12900, trend: 'up' }
          ]}
        />
      </div>

      {/* Urgency Notifications */}
      <UrgencyNotification 
        notifications={[
          {
            id: '1',
            type: 'loss',
            title: 'Streak at Risk!',
            message: 'Complete a challenge in 4 hours to keep your enhancedStreak alive',
            timeLeft: '4h 23m',
            action: 'Play Now'
          },
          {
            id: '2',
            type: 'opportunity',
            title: 'Flash Sale!',
            message: 'Get 70% off legendary power-ups - only 2 left in stock',
            timeLeft: '1h 45m',
            action: 'Shop Now'
          },
          {
            id: '3',
            type: 'warning',
            title: 'Daily Goal',
            message: 'You\'re 2 challenges away from your daily bonus',
            action: 'Continue'
          }
        ]}
      />

      {/* Reward Multipliers and Daily Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RewardMultiplier 
          multipliers={[
            { id: 'xp-boost', type: 'xp', multiplier: 2, duration: 60, cost: 500, active: false },
            { id: 'coin-boost', type: 'coins', multiplier: 3, duration: 45, cost: 750, active: false },
            { id: 'streak-boost', type: 'streak', multiplier: 1.5, duration: 120, cost: 1000, active: true }
          ]}
          onActivate={(id) => console.log('Activated multiplier:', id)}
        />
        
        <DailyStreakChallenge 
          challenges={[
            {
              id: 'daily-1',
              title: 'Code Warrior',
              description: 'Solve 3 coding challenges',
              progress: 2,
              target: 3,
              reward: '+150 XP',
              completed: false,
              difficulty: 'medium'
            },
            {
              id: 'daily-2',
              title: 'Quick Learner',
              description: 'Complete 2 lessons',
              progress: 2,
              target: 2,
              reward: '+100 XP',
              completed: false,
              difficulty: 'easy'
            },
            {
              id: 'daily-3',
              title: 'Social Butterfly',
              description: 'Help 3 other users',
              progress: 1,
              target: 3,
              reward: '+200 XP',
              completed: false,
              difficulty: 'hard'
            }
          ]}
          onComplete={(id) => console.log('Completed challenge:', id)}
        />
      </div>

      {/* Variable Rewards and FOMO Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VariableRewardSystem 
          spins={3}
          onSpin={() => console.log('Spun the wheel!')}
        />
        
        <FearOfMissingOutBanner 
          offers={[
            {
              id: 'fomo-1',
              title: 'Limited Tournament',
              urgency: 'critical',
              participants: 847,
              maxParticipants: 1000,
              timeLeft: '2h 15m'
            },
            {
              id: 'fomo-2',
              title: 'Bonus XP Event',
              urgency: 'high',
              participants: 2341,
              maxParticipants: 5000,
              timeLeft: '5h 30m'
            }
          ]}
          onAction={(id) => console.log('Joined FOMO event:', id)}
        />
      </div>

      {/* Penalty System and Exclusivity Gates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PenaltySystem 
          violations={[
            {
              type: 'missed_day',
              severity: 'warning',
              description: 'Missed daily login',
              cost: 50,
              time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              type: 'inactivity',
              severity: 'penalty',
              description: '3 days inactive',
              cost: 150,
              time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
              type: 'challenge_failed',
              severity: 'strike',
              description: 'Failed daily challenge',
              cost: 100,
              time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]}
          onRecover={(cost) => console.log('Recovered penalties:', cost)}
        />
        
        <ExclusivityGates 
          gates={[
            {
              id: 'exclusive-1',
              title: 'Legendary Chest',
              description: 'Contains ultra-rare rewards',
              requirement: 'Level 25+',
              reward: '5 Legendary Items',
              locked: true,
              rarity: 'legendary',
              timeLimited: true,
              expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
            },
            {
              id: 'exclusive-2',
              title: 'Epic Power-Up',
              description: 'Double rewards for 24h',
              requirement: '10 Day Streak',
              reward: '2x All Rewards',
              locked: false,
              rarity: 'epic',
              timeLimited: false
            },
            {
              id: 'exclusive-3',
              title: 'Rare Badge',
              description: 'Show off your status',
              requirement: 'Complete 100 Challenges',
              reward: 'Elite Badge',
              locked: true,
              rarity: 'rare',
              timeLimited: true,
              expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
            }
          ]}
          onUnlock={(id) => console.log('Unlocked exclusive:', id)}
        />
      </div>

      {/* Dark Patterns and Addiction Loops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DarkPatternSystem 
          patterns={[
            {
              id: 'dark-1',
              type: 'false_urgency',
              title: 'LAST CHANCE!',
              description: 'Only 2 minutes left to get 90% off!',
              action: 'BUY NOW',
              alternative: 'Maybe Later'
            },
            {
              id: 'dark-2',
              type: 'confirmshaming',
              title: 'Don\'t Miss Out',
              description: 'Smart users are getting this deal right now',
              action: 'Be Smart',
              alternative: 'I\'ll Pass'
            }
          ]}
          onAction={(id, action) => console.log('Dark pattern action:', id, action)}
        />
        
        <AddictionLoopSystem 
          loops={[
            {
              id: 'loop-1',
              name: 'Quick Spin',
              currentProgress: 2,
              maxProgress: 5,
              reward: '+50 XP',
              interval: 15,
              lastCompleted: new Date(Date.now() - 10 * 60 * 1000),
              isAddictive: true
            },
            {
              id: 'loop-2',
              name: 'Bonus Chest',
              currentProgress: 1,
              maxProgress: 3,
              reward: 'Mystery Item',
              interval: 30,
              lastCompleted: new Date(Date.now() - 25 * 60 * 1000),
              isAddictive: true
            }
          ]}
          onComplete={(id) => console.log('Completed addiction loop:', id)}
        />
      </div>

      {/* Social Comparison Engine */}
      <SocialComparisonEngine 
        comparisons={[
          {
            userId: '1',
            username: 'ProGamer',
            avatar: 'PG',
            stats: { level: 28, xp: 15420, achievements: 45, enhancedStreak: 15 },
            trend: 'gaining'
          },
          {
            userId: '2',
            username: 'CodeNinja',
            avatar: 'CN',
            stats: { level: 26, xp: 14850, achievements: 42, enhancedStreak: 12 },
            trend: 'stable'
          },
          {
            userId: '3',
            username: 'EliteDev',
            avatar: 'ED',
            stats: { level: 25, xp: 14100, achievements: 40, enhancedStreak: 18 },
            trend: 'gaining'
          },
          {
            userId: '4',
            username: 'MasterCoder',
            avatar: 'MC',
            stats: { level: 24, xp: 13200, achievements: 38, enhancedStreak: 8 },
            trend: 'losing'
          }
        ]}
        userStats={{
          level: 23,
          xp: 12500,
          achievements: 35,
          enhancedStreak: 7,
          rank: 12
        }}
      />

      {/* Extreme FOMO System */}
      <ExtremeFOMOSystem 
        events={[
          {
            id: 'extreme-fomo-1',
            title: 'ULTIMATE TOURNAMENT',
            description: 'Last chance to join the biggest event of the year!',
            urgencyLevel: 'ultimate',
            participants: 987,
            maxParticipants: 1000,
            timeLeft: '47m 23s',
            socialProof: [
              'ProGamer just joined',
              'CodeNinja is participating',
              'EliteDev registered 2 min ago'
            ],
            lossStatement: 'You will miss out on 5000 XP and legendary rewards FOREVER!'
          },
          {
            id: 'extreme-fomo-2',
            title: 'EXCLUSIVE POWER-UP',
            description: 'Only 3 spots left for this game-changing item!',
            urgencyLevel: 'critical',
            participants: 97,
            maxParticipants: 100,
            timeLeft: '2h 15m',
            socialProof: [
              'Sarah_Coder claimed hers',
              'Mike_Dev got the bonus',
              'Emma_Build is excited'
            ],
            lossStatement: 'Everyone else will have advantage over you for weeks!'
          }
        ]}
        onJoin={(id) => console.log('Joined extreme FOMO:', id)}
      />

      {/* Extreme Punishment System */}
      <ExtremePunishmentSystem 
        violations={[
          {
            id: 'extreme-punish-1',
            type: 'enhancedStreak_loss',
            severity: 'critical',
            description: 'DAILY STREAK AT RISK',
            consequences: [
              'Lose 30 day enhancedStreak bonus',
              'Drop 500 XP',
              'Lose elite status',
              'Other users will see your failure'
            ],
            timeUntil: '4h 32m',
            preventCost: 200
          },
          {
            id: 'extreme-punish-2',
            type: 'rank_drop',
            severity: 'danger',
            description: 'RANK PROTECTION EXPIRING',
            consequences: [
              'Drop from Top 10%',
              'Lose leaderboard position',
              'Miss out on exclusive rewards',
              'Social status decrease'
            ],
            timeUntil: '1d 8h',
            preventCost: 350
          }
        ]}
        onPrevent={(id, cost) => console.log('Prevented punishment:', id, cost)}
      />

      {/* Daily Login */}
      <motion.div
        whileHover={{ scale: dailyLoginClaimed ? 1 : 1.01 }}
        onClick={claimDailyLogin}
      >
        <Card className="border-2" className={`cursor-pointer ${
          dailyLoginClaimed 
            ? 'bg-zinc-800 border-zinc-600' 
            : 'bg-zinc-900 border-brutal-purple'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 border-2 border-black ${dailyLoginClaimed ? 'bg-gray-700' : 'bg-brutal-yellow'}`}>
                <Gift className="text-black" size={24} />
              </div>
              <div>
                <h3 className={`font-black font-mono uppercase ${dailyLoginClaimed ? 'text-gray-400' : 'text-white'}`}>
                  {dailyLoginClaimed ? 'Claimed!' : 'Daily Login Bonus'}
                </h3>
                <p className={`text-sm font-mono ${dailyLoginClaimed ? 'text-gray-500' : 'text-brutal-purple'}`}>
                  {dailyLoginClaimed ? 'Come back tomorrow!' : `+${50 + enhancedStreak * 10} XP`}
                </p>
              </div>
            </div>
            {!dailyLoginClaimed && <Sparkles className="text-brutal-yellow animate-pulse" size={24} />}
          </div>
        </Card>
      </motion.div>

      {/* Daily Rewards Calendar */}
      <Card className="border-2 bg-zinc-900 border-lime-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2 font-mono uppercase">
            <Calendar size={18} className="text-lime-400" /> Weekly Rewards
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
            <Clock size={12} /> Resets in {timeUntilReset}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {dailyRewards.map((day) => (
            <motion.div
              key={day.day}
              whileHover={{ y: -2 }}
              className={`p-2 text-center border-2 ${
                day.claimed 
                  ? 'bg-lime-500/20 border-lime-500' 
                  : day.current 
                    ? 'bg-cyan-500/20 border-cyan-500 shadow-[2px_2px_0px_0px_rgba(34,211,238,1)]'
                    : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <p className={`text-xs font-mono font-bold ${day.claimed ? 'text-lime-400' : 'text-gray-500'}`}>Day {day.day}</p>
              <div className="text-lg my-1">
                {day.reward.type === 'xp' && '⚡'}
                {day.reward.type === 'coins' && '💰'}
                {day.reward.type === 'powerup' && '🎁'}
                {day.reward.type === 'chest' && '📦'}
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                {day.reward.type === 'xp' && `+${day.reward.amount}`}
                {day.reward.type === 'coins' && `${day.reward.amount}`}
                {day.reward.type === 'powerup' && 'Power-Up'}
                {day.reward.type === 'chest' && 'Chest'}
              </p>
              {day.claimed && <CheckCircle size={12} className="text-lime-400 mx-auto mt-1" />}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Active Power-Ups */}
      {activePowerUps.length > 0 && (
        <Card className="border-2 bg-zinc-900 border-fuchsia-500/30">
          <h3 className="font-bold text-white flex items-center gap-2 mb-3 font-mono uppercase">
            <Zap size={18} className="text-fuchsia-400" /> Active Power-Ups
          </h3>
          <div className="space-y-2">
            {activePowerUps.map((powerUp) => (
              <div key={powerUp.id} className="flex items-center justify-between p-2 bg-zinc-800 border-2 border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{powerUp.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{powerUp.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{powerUp.multiplier}x multiplier</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-fuchsia-400 animate-pulse" />
                  <span className="text-xs text-fuchsia-400 font-mono uppercase">Active</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderPowerUps = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white font-mono uppercase">Power-Ups & Boosters</h2>
        <span className="text-sm text-gray-400 flex items-center gap-1 font-mono">
          <Gem size={14} className="text-yellow-400" /> {coins.toLocaleString()} Coins
        </span>
      </div>

      {/* Rarity Legend */}
      <div className="flex flex-wrap gap-2">
        {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <span key={rarity} className={`px-2 py-1 border-2 border-black text-xs font-bold font-mono uppercase ${
            rarity === 'common' ? 'bg-zinc-700 text-gray-300' :
            rarity === 'rare' ? 'bg-blue-900 text-blue-300' :
            rarity === 'epic' ? 'bg-purple-900 text-purple-300' :
            'bg-yellow-900 text-yellow-300'
          }`}>
            {rarity}
          </span>
        ))}
      </div>

      {/* Power-Ups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerUps.map((powerUp) => (
          <motion.div
            key={powerUp.id}
            whileHover={{ y: -4 }}
            className={`p-4 border-2 cursor-pointer transition-all ${
              powerUp.active 
                ? 'bg-fuchsia-500/20 border-fuchsia-500' 
                : powerUp.rarity === 'legendary' ? 'bg-yellow-900/20 border-yellow-500/50' :
                  powerUp.rarity === 'epic' ? 'bg-purple-900/20 border-purple-500/50' :
                  powerUp.rarity === 'rare' ? 'bg-blue-900/20 border-blue-500/50' :
                  'bg-zinc-800 border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{powerUp.icon}</div>
              <div className="flex items-center gap-1">
                {powerUp.active && <div className="w-2 h-2 bg-fuchsia-400 animate-pulse" />}
                <span className={`text-xs px-2 py-0.5 border border-black font-mono uppercase font-bold ${
                  powerUp.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                  powerUp.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                  powerUp.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-zinc-600 text-gray-300'
                }`}>
                  {powerUp.rarity}
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-white mb-1 font-mono uppercase">{powerUp.name}</h3>
            <p className="text-xs text-gray-400 mb-3 font-mono">{powerUp.description}</p>
            
            <div className="flex items-center justify-between font-mono">
              <span className="text-sm text-gray-500">Owned: {powerUp.owned}</span>
              {powerUp.active ? (
                <span className="text-sm font-bold text-fuchsia-400">Active ({powerUp.remainingTime}m)</span>
              ) : (
                <div className="flex gap-2">
                  {powerUp.owned > 0 ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'ACTIVATE_POWERUP', payload: { powerUpId: powerUp.id, duration: powerUp.duration } });
                      }}
                      className="px-2 py-1 bg-lime-500 text-black text-xs font-bold border border-black hover:bg-lime-400 font-mono uppercase"
                    >
                      ACTIVATE
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (coins >= powerUp.cost) {
                          dispatch({ type: 'BUY_POWERUP', payload: { powerUpId: powerUp.id, cost: powerUp.cost } });
                        }
                      }}
                      disabled={coins < powerUp.cost}
                      className={`px-2 py-1 text-black text-xs font-bold border border-black flex items-center gap-1 font-mono uppercase ${
                        coins >= powerUp.cost ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      BUY <Coins size={10} /> {powerUp.cost}
                    </button>
                  )}
                </div>
              )}
            </div>

            {powerUp.duration > 0 && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 font-mono">
                <Timer size={10} /> Duration: {powerUp.duration} min
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Loot Boxes */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase">
          <Package size={20} className="text-fuchsia-400" /> Treasure Chests
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {lootBoxes.map((box) => (
            <motion.div
              key={box.id}
              whileHover={{ y: -4, rotate: [-1, 1, -1, 0] }}
              className={`p-4 border-2 text-center cursor-pointer ${
                box.rarity === 'legendary' ? 'bg-gradient-to-b from-yellow-900/30 to-orange-900/30 border-yellow-500' :
                box.rarity === 'epic' ? 'bg-gradient-to-b from-purple-900/30 to-pink-900/30 border-purple-500' :
                box.rarity === 'rare' ? 'bg-gradient-to-b from-blue-900/30 to-cyan-900/30 border-blue-500' :
                'bg-zinc-800 border-zinc-600'
              }`}
            >
              <div className="text-4xl mb-2">
                {box.rarity === 'legendary' ? '👑' : box.rarity === 'epic' ? '💎' : box.rarity === 'rare' ? '✨' : '📦'}
              </div>
              <h4 className="font-bold text-white text-sm font-mono uppercase">{box.name}</h4>
              <p className="text-xs text-gray-400 mt-1 font-mono">Owned: {box.owned}</p>
              <div className="mt-2 text-xs text-yellow-400 flex items-center justify-center gap-1 font-mono">
                <Coins size={10} /> {box.cost}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => {
    const categories = ['streak', 'tasks', 'coding', 'special'] as const;
    const categoryNames = { enhancedStreak: '🔥 Streak', tasks: '✅ Tasks', coding: '💻 Coding', special: '⭐ Special' };
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white font-mono uppercase">Achievements</h2>
          <span className="text-sm text-gray-400 font-mono">
            {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
          </span>
        </div>

        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-bold text-white mb-3 font-mono uppercase">{categoryNames[category]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.filter(a => a.category === category).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ x: 4 }}
                  className={`p-4 border-2 ${
                    achievement.unlocked 
                      ? 'bg-lime-500/20 border-lime-500' 
                      : 'bg-zinc-800 border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold font-mono uppercase ${achievement.unlocked ? 'text-lime-400' : 'text-white'}`}>
                          {achievement.name}
                        </h4>
                        <span className="text-xs text-yellow-400 flex items-center gap-1 font-mono">
                          <Coins size={10} /> +{achievement.xpReward}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{achievement.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="h-2 bg-black border border-white/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            className={`h-full ${achievement.unlocked ? 'bg-lime-500' : 'bg-cyan-500'}`}
                          />
                        </div>
                        <div className="flex justify-between mt-1 font-mono">
                          <span className="text-[10px] text-gray-500">{achievement.progress}/{achievement.target}</span>
                          {achievement.unlocked && (
                            claimedAchievements.has(achievement.id) ? (
                              <CheckCircle size={12} className="text-lime-400" />
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (!claimedAchievements.has(achievement.id)) {
                                    dispatch({ 
                                      type: 'ADD_XP', 
                                      payload: { 
                                        amount: achievement.xpReward, 
                                        source: `Achievement: ${achievement.name}` 
                                      } 
                                    });
                                    const newClaimed = new Set(claimedAchievements);
                                    newClaimed.add(achievement.id);
                                    setClaimedAchievements(newClaimed);
                                    localStorage.setItem('claimedAchievements', JSON.stringify(Array.from(newClaimed)));
                                    
                                    dispatch({
                                      type: 'ADD_NOTIFICATION',
                                      payload: {
                                        id: Date.now().toString(),
                                        type: 'achievement',
                                        title: '🏆 Achievement Claimed!',
                                        message: `Earned ${achievement.xpReward} XP from ${achievement.name}!`,
                                        timestamp: new Date(),
                                      },
                                    });
                                  }
                                }}
                                className="px-2 py-1 bg-lime-500 text-black text-[10px] font-bold border border-black hover:bg-lime-400 font-mono uppercase"
                              >
                                CLAIM
                              </motion.button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSeasonPass = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white font-mono uppercase">Season Pass</h2>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold border border-black font-mono uppercase">
          Season 1
        </span>
      </div>

      {/* Current Progress */}
      <Card className="border-2 bg-zinc-900 border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-400 text-sm font-mono uppercase">Current Tier</p>
            <p className="text-3xl font-black text-white font-mono">{seasonPass.currentTier}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-mono uppercase">Next Tier</p>
            <p className="text-xl font-bold text-purple-400 font-mono">{Math.min(seasonPass.currentTier + 1, 50)}</p>
          </div>
        </div>
        
        <div className="h-4 bg-black border-2 border-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(seasonPass.xpProgress / seasonPass.xpPerTier) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 border-r-2 border-black"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center font-mono">
          {seasonPass.xpProgress} / {seasonPass.xpPerTier} XP to next tier
        </p>
      </Card>

      {/* Reward Track */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {seasonPass.rewards.map((reward, index) => (
            <motion.div
              key={reward.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-32 p-3 border-2 ${
                reward.claimed 
                  ? 'bg-purple-500/20 border-purple-500' 
                  : seasonPass.currentTier >= reward.tier - 5 && seasonPass.currentTier < reward.tier
                    ? 'bg-zinc-800 border-cyan-500 shadow-[4px_4px_0px_0px_rgba(34,211,238,1)]'
                    : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <p className="text-center text-xs text-gray-400 mb-2 font-mono uppercase">Tier {reward.tier}</p>
              
              {/* Free Reward */}
              <div className="p-2 bg-zinc-700 border border-zinc-600 mb-2 text-center">
                <p className="text-[10px] text-gray-400 font-mono uppercase">FREE</p>
                <p className="text-xs text-white font-bold font-mono">{reward.free}</p>
                {seasonPass.currentTier >= reward.tier && !claimedSeasonRewards.has(reward.tier) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Extract XP from reward string (e.g., "100 XP" -> 100)
                      const xpMatch = reward.free.match(/(\d+)\s*XP/i);
                      if (xpMatch) {
                        const xpAmount = parseInt(xpMatch[1]);
                        dispatch({ 
                          type: 'ADD_XP', 
                          payload: { 
                            amount: xpAmount, 
                            source: `Season Pass Tier ${reward.tier}` 
                          } 
                        });
                        const newClaimed = new Set(claimedSeasonRewards);
                        newClaimed.add(reward.tier);
                        setClaimedSeasonRewards(newClaimed);
                        localStorage.setItem('claimedSeasonRewards', JSON.stringify(Array.from(newClaimed)));
                        
                        dispatch({
                          type: 'ADD_NOTIFICATION',
                          payload: {
                            id: Date.now().toString(),
                            type: 'achievement',
                            title: '🎁 Season Pass Reward!',
                            message: `Claimed ${reward.free} from Tier ${reward.tier}!`,
                            timestamp: new Date(),
                          },
                        });
                      }
                    }}
                    className="mt-1 px-2 py-1 bg-lime-500 text-black text-[10px] font-bold border border-black w-full font-mono uppercase hover:bg-lime-400"
                  >
                    CLAIM
                  </motion.button>
                )}
              </div>
              
              {/* Premium Reward */}
              <div className="p-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-center border border-purple-500/30">
                <p className="text-[10px] text-purple-300 font-mono uppercase">PREMIUM</p>
                <p className="text-xs text-white font-bold font-mono">{reward.premium}</p>
              </div>
              
              {claimedSeasonRewards.has(reward.tier) && (
                <div className="mt-2 flex justify-center">
                  <CheckCircle size={16} className="text-purple-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Upgrade CTA */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-black text-center cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
      >
        <Crown className="text-yellow-300 mx-auto mb-2" size={28} />
        <h3 className="text-lg font-black text-white font-mono uppercase">Upgrade to Premium</h3>
        <p className="text-sm text-purple-200 font-mono">Unlock exclusive rewards & 2x XP boost</p>
      </motion.div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#0a0a0a] pb-20 lg:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Rocket className="text-fuchsia-400" size={28} />
            Power-Ups Hub
          </h1>
          <p className="text-gray-400 mt-1">Level up, earn rewards, and boost your progress!</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'powerups', label: 'Power-Ups', icon: Zap },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'season', label: 'Season Pass', icon: Crown },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-lime-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'powerups' && renderPowerUps()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'season' && renderSeasonPass()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
