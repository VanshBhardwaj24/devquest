import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { 
  Zap, Trophy, Target, Star, Crown,
  TrendingUp, Gift, Shield,
  CheckCircle, Rocket, Flame, ArrowUp, Clock
} from 'lucide-react';
import { NonNegotiables } from './NonNegotiables';
import { InternshipTracker } from './InternshipTracker';
import { LootBoxOpener } from '../Gamification/LootBoxOpener';
import { EnergySystem } from '../Gamification/EnergySystem';
import { DailyMissions } from '../Gamification/DailyMissions';

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  target: number;
  icon: string;
  type: 'coding' | 'task' | 'learning' | 'streak';
  completed: boolean;
  timeRemaining?: number; // seconds until midnight
  xpPenalty?: number; // XP to deduct if not completed
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  effect: string;
}

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { user, xpSystem, tasks, codingStats } = state;
  const [pulseXP, setPulseXP] = useState(false);
  const [questTimers, setQuestTimers] = useState<{ [key: string]: number }>({});
  
  // Calculate time until midnight for quest timers
  const getTimeUntilMidnight = (): number => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  };
  
  // Format timer display
  const formatQuestTimer = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  
  // Core values from state - use time-based streaks
  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  
  // Countdown removed - no longer needed

  // Dynamic calculations - Using consistent XP formula from AppContext
  const stats = useMemo(() => {
    // XP progression - Using exact formula from AppContext: getXPForLevel = 1000 * 1.1^(level-1)
    const getXPForLevel = (level: number) => Math.floor(1000 * Math.pow(1.1, level - 1));
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const levelXP = Math.max(0, currentXP - xpForCurrentLevel);
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    const levelProgress = Math.min(Math.max((levelXP / neededXP) * 100, 0), 100);
    
    // Total XP earned
    const totalXPEarned = xpSystem?.totalXPEarned || currentXP;
    
    // Streak multiplier
    const multiplier = parseFloat((1 + streak * 0.1).toFixed(1));
    
    // Task completion rate
    const completionRate = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
    
    // XP to next level
    const xpRemaining = Math.max(0, xpForNextLevel - currentXP);
    
    return {
      totalXP: currentXP,
      xpForNextLevel,
      xpForCurrentLevel,
      levelProgress,
      multiplier,
      totalXPEarned,
      completionRate,
      levelXP,
      neededXP,
      xpRemaining
    };
  }, [currentXP, currentLevel, streak, completedTasks, totalTasks, xpSystem]);

  // Active power-ups based on user stats - Always show available power-ups with active/inactive state
  const activePowerUps = useMemo<PowerUp[]>(() => {
    const powerUps: PowerUp[] = [];
    
    // XP Boost - Active when streak >= 3
    const xpBoostActive = streak >= 3;
    powerUps.push({
      id: '1',
      name: xpBoostActive ? `${stats.multiplier}x XP Boost` : 'XP Boost',
      description: xpBoostActive ? `${streak}-day streak bonus` : `Need ${3 - streak} more days`,
      icon: '⚡',
      active: xpBoostActive,
      effect: xpBoostActive ? `${stats.multiplier}x` : 'locked'
    });
    
    // Streak Shield - Active when streak >= 7
    const shieldActive = streak >= 7;
    powerUps.push({
      id: '2',
      name: 'Streak Shield',
      description: shieldActive ? 'Protection active' : `Unlock at 7-day streak (${streak}/7)`,
      icon: '🛡️',
      active: shieldActive,
      effect: shieldActive ? 'shield' : 'locked'
    });
    
    // Focus Mode - Active when completion rate >= 50%
    const focusActive = stats.completionRate >= 50;
    powerUps.push({
      id: '3',
      name: 'Focus Mode',
      description: focusActive ? `${stats.completionRate}% tasks done` : `Complete 50%+ tasks (${stats.completionRate}%)`,
      icon: '🎯',
      active: focusActive,
      effect: focusActive ? 'focus' : 'locked'
    });
    
    return powerUps;
  }, [streak, stats.multiplier, stats.completionRate]);

  // Daily quests
  const dailyQuests = useMemo<DailyQuest[]>(() => {
    const codingProblems = (codingStats?.easyCount || 0) + (codingStats?.mediumCount || 0) + (codingStats?.hardCount || 0);
    const timeLeft = questTimers['1'] !== undefined ? questTimers['1'] : getTimeUntilMidnight();
    
    return [
      { 
        id: '1', 
        title: 'First Task', 
        description: 'Complete your first task today', 
        xp: 25 + currentLevel * 5, 
        progress: Math.min(completedTasks, 1), 
        target: 1, 
        icon: '🌅', 
        type: 'task', 
        completed: completedTasks >= 1,
        timeRemaining: questTimers['1'] !== undefined ? questTimers['1'] : timeLeft,
        xpPenalty: Math.floor((25 + currentLevel * 5) * 0.5)
      },
      { 
        id: '2', 
        title: 'Problem Solver', 
        description: `Solve 3 coding problems`, 
        xp: 100 + currentLevel * 10, 
        progress: Math.min(codingProblems % 3, 3), 
        target: 3, 
        icon: '⚔️', 
        type: 'coding', 
        completed: codingProblems % 3 === 0 && codingProblems > 0,
        timeRemaining: questTimers['2'] !== undefined ? questTimers['2'] : timeLeft,
        xpPenalty: Math.floor((100 + currentLevel * 10) * 0.5)
      },
      { 
        id: '3', 
        title: 'Keep the Streak', 
        description: `Maintain your ${streak}-day streak`, 
        xp: 50 + streak * 10, 
        progress: streak > 0 ? 1 : 0, 
        target: 1, 
        icon: '🔥', 
        type: 'streak', 
        completed: streak > 0,
        timeRemaining: questTimers['3'] !== undefined ? questTimers['3'] : timeLeft,
        xpPenalty: Math.floor((50 + streak * 10) * 0.5)
      },
      { 
        id: '4', 
        title: 'Task Master', 
        description: `Complete 5 tasks`, 
        xp: 150 + currentLevel * 15, 
        progress: Math.min(completedTasks, 5), 
        target: 5, 
        icon: '✅', 
        type: 'task', 
        completed: completedTasks >= 5,
        timeRemaining: questTimers['4'] !== undefined ? questTimers['4'] : timeLeft,
        xpPenalty: Math.floor((150 + currentLevel * 15) * 0.5)
      },
    ];
  }, [completedTasks, codingStats, currentLevel, streak, questTimers]);

  // Check and deduct XP for incomplete quests
  const checkAndDeductQuestXP = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = typeof window !== 'undefined' ? localStorage.getItem('lastQuestCheck') || '' : '';
    
    // Only check once per day
    if (lastCheck === today) return;
    
    dailyQuests.forEach(quest => {
      if (!quest.completed) {
        const penalty = quest.xpPenalty || Math.floor(quest.xp * 0.5); // Deduct 50% of quest XP
        
        // Deduct XP
        dispatch({ 
          type: 'ADD_XP', 
          payload: { 
            amount: -penalty, 
            source: `Quest Failed: ${quest.title}` 
          } 
        });
        
        // Add notification
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString() + quest.id,
            type: 'achievement',
            title: 'Quest Failed! ⚠️',
            message: `"${quest.title}" not completed. -${penalty} XP deducted.`,
            timestamp: new Date(),
            read: false,
            priority: 'high',
          }
        });
      }
    });
    
    // Save today's date
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lastQuestCheck', today);
      } catch (error: any) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error saving to localStorage:', error?.message || JSON.stringify(error));
      }
    }
  }, [dailyQuests, dispatch]);
  
  // Update quest timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = getTimeUntilMidnight();
      setQuestTimers(prev => {
        const updated: { [key: string]: number } = {};
        dailyQuests.forEach(quest => {
          updated[quest.id] = timeLeft;
        });
        return updated;
      });
      
      // Check if midnight passed and deduct XP for incomplete quests
      if (timeLeft === 0) {
        checkAndDeductQuestXP();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [dailyQuests, checkAndDeductQuestXP]);

  // Weekly challenge
  const weeklyChallenge = useMemo(() => {
    const totalProgress = Math.min(
      Math.floor(completedTasks * 2) + 
      Math.floor(streak * 5) + 
      Math.floor(currentLevel * 3), 
      100
    );
    
    return {
      name: 'Weekly Champion',
      description: 'Complete tasks, maintain streak, and level up!',
      progress: totalProgress,
      reward: 500 + currentLevel * 50,
      milestones: [
        { name: 'Complete 10 tasks', done: completedTasks >= 10, xp: 100 },
        { name: '7-day streak', done: streak >= 7, xp: 150 },
        { name: 'Solve 5 problems', done: (codingStats?.easyCount || 0) >= 5, xp: 200 },
      ]
    };
  }, [completedTasks, streak, currentLevel, codingStats]);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseXP(true);
      setTimeout(() => setPulseXP(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Night Owl', emoji: '🌙' };
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌆' };
    return { text: 'Night Session', emoji: '🦉' };
  };

  const greeting = getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-2 sm:p-3 lg:p-4 min-h-screen bg-[#0a0a0a] pb-20 lg:pb-4 lg:pl-6"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden mb-2 sm:mb-3 bg-gray-900 border-4 border-lime-500/30 brutal-shadow p-2 sm:p-3 lg:p-4"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#84cc16_20px,#84cc16_22px)]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
          {/* Left: User Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-gradient-to-br from-lime-400 to-cyan-400 border-4 border-black brutal-shadow flex items-center justify-center text-xl sm:text-2xl md:text-3xl flex-shrink-0">
                {user?.avatar || '🚀'}
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 bg-orange-500 border-2 border-black px-1 py-0.5 sm:px-1.5 text-[9px] sm:text-[10px] font-black text-black"
              >
                LVL {currentLevel}
              </motion.div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-gray-400 text-xs sm:text-sm truncate">{greeting.text}</span>
                <span className="text-sm sm:text-base">{greeting.emoji}</span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white truncate">
                {user?.name || 'Champion'}<span className="text-lime-400">!</span>
              </h1>
              <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                <Crown className="text-yellow-400 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm text-gray-400 truncate">{user?.tier || 'Novice'}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start md:justify-end">
            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-orange-500/50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2"
            >
              <motion.div
                animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <Flame className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <div className="min-w-0">
                <div className="text-white font-black text-sm sm:text-base md:text-lg truncate">{streak}</div>
                <div className="text-gray-500 text-[9px] sm:text-[10px] uppercase truncate">Time Streak</div>
              </div>
            </motion.div>

            {/* Total XP */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className={`brutal-card bg-gray-800 border-lime-500/50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 ${pulseXP ? 'ring-2 ring-lime-400' : ''}`}
            >
              <Zap className="text-lime-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-black text-sm sm:text-base md:text-lg truncate">{currentXP > 9999 ? `${Math.floor(currentXP / 1000)}k` : currentXP.toLocaleString()}</div>
                <div className="text-gray-500 text-[9px] sm:text-[10px] uppercase truncate">XP</div>
              </div>
            </motion.div>

            {/* Multiplier */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-fuchsia-500/50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2"
            >
              <ArrowUp className="text-fuchsia-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-black text-sm sm:text-base md:text-lg truncate">×{stats.multiplier}</div>
                <div className="text-gray-500 text-[9px] sm:text-[10px] uppercase truncate">Boost</div>
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-cyan-500/50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2"
            >
              <CheckCircle className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-black text-sm sm:text-base md:text-lg truncate">{completedTasks}/{totalTasks}</div>
                <div className="text-gray-500 text-[9px] sm:text-[10px] uppercase truncate">Tasks</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative z-10 mt-2 sm:mt-3">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[10px] sm:text-xs text-gray-400 truncate">Lv.{currentLevel}→{currentLevel + 1}</span>
            <span className="text-[10px] sm:text-xs text-lime-400 whitespace-nowrap">{stats.levelXP > 999 ? `${Math.floor(stats.levelXP / 1000)}k` : stats.levelXP.toLocaleString()} / {stats.neededXP > 999 ? `${Math.floor(stats.neededXP / 1000)}k` : stats.neededXP.toLocaleString()}</span>
          </div>
          <div className="h-3 sm:h-4 bg-gray-800 border-2 border-gray-700 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.levelProgress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-lime-500 via-cyan-400 to-lime-500 relative"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(0,0,0,0.2)_4px,rgba(0,0,0,0.2)_8px)]" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Addictive Game Features - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="sm:col-span-1 xl:col-span-1">
          <EnergySystem />
        </div>
        <div className="sm:col-span-1 xl:col-span-1">
          <LootBoxOpener />
        </div>
        <div className="sm:col-span-2 xl:col-span-1">
          <DailyMissions />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {/* Left Column */}
        <div className="md:col-span-2 lg:col-span-2 space-y-2 sm:space-y-3">
          {/* Daily Quests */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-gray-900 border-lime-500/30 p-2 sm:p-3"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Target className="text-lime-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Daily Quests</span>
              </h2>
              <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-2 sm:p-2.5 border-2 ${quest.completed ? 'border-lime-500/50 bg-lime-500/10' : 'border-gray-700 bg-gray-800'} flex items-center gap-2`}
                >
                  <div className="text-xl sm:text-2xl flex-shrink-0">{quest.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-bold text-xs sm:text-sm ${quest.completed ? 'text-lime-400' : 'text-white'} truncate`}>
                        {quest.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-lime-400 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap flex-shrink-0">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> +{quest.xp}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{quest.description}</p>
                    <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 bg-gray-700 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                        className={`h-full ${quest.completed ? 'bg-lime-500' : 'bg-cyan-500'}`}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-0.5 sm:mt-1 gap-2">
                      <span className="text-[9px] sm:text-[10px] text-gray-500">{quest.progress}/{quest.target}</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {!quest.completed && quest.timeRemaining !== undefined && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                            <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono">
                              {formatQuestTimer(quest.timeRemaining)}
                            </span>
                            {quest.xpPenalty && (
                              <span className="text-[9px] sm:text-[10px] text-red-400 ml-1">
                                (-{quest.xpPenalty} XP)
                              </span>
                            )}
                          </div>
                        )}
                        {quest.completed && <span className="text-[9px] sm:text-[10px] text-lime-400">✓</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Challenge */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brutal-card bg-gray-900 border-orange-500/30 p-2 sm:p-3"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Trophy className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Weekly Challenge</span>
              </h2>
              <span className="text-xs sm:text-sm text-orange-400 font-bold flex items-center gap-0.5 sm:gap-1 whitespace-nowrap flex-shrink-0">
                <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {weeklyChallenge.reward > 999 ? `${Math.floor(weeklyChallenge.reward / 1000)}k` : weeklyChallenge.reward}
              </span>
            </div>

            <div className="mb-2 sm:mb-3">
              <div className="flex justify-between items-center mb-1 gap-2">
                <span className="text-white font-bold text-xs sm:text-sm truncate">{weeklyChallenge.name}</span>
                <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap flex-shrink-0">{weeklyChallenge.progress}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-gray-800 border border-gray-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyChallenge.progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-1.5">
              {weeklyChallenge.milestones.map((milestone, i) => (
                <div 
                  key={i}
                  className={`p-1.5 sm:p-2 border ${milestone.done ? 'border-lime-500/50 bg-lime-500/10' : 'border-gray-700 bg-gray-800'} text-center`}
                >
                  <div className={`text-base sm:text-lg ${milestone.done ? 'text-lime-400' : 'text-gray-500'}`}>
                    {milestone.done ? '✓' : '○'}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 truncate">{milestone.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-orange-400">+{milestone.xp}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily Missions */}
          <DailyMissions />

          {/* Non-Negotiables */}
          <NonNegotiables />
        </div>

        {/* Right Column */}
        <div className="space-y-2 sm:space-y-3">
          {/* Active Power-Ups */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-gray-900 border-fuchsia-500/30 p-2 sm:p-3"
          >
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Rocket className="text-fuchsia-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">Power-Ups</span>
              <span className="text-[10px] sm:text-xs text-fuchsia-400 ml-auto whitespace-nowrap flex-shrink-0">
                {activePowerUps.filter(p => p.active).length}/{activePowerUps.length}
              </span>
            </h2>

            {activePowerUps.length > 0 ? (
              <div className="space-y-1 sm:space-y-1.5">
                {activePowerUps.map((powerUp) => (
                  <motion.div
                    key={powerUp.id}
                    whileHover={{ x: 2 }}
                    className={`p-1.5 sm:p-2 border-2 flex items-center gap-2 transition-all ${
                      powerUp.active 
                        ? 'bg-gray-800 border-fuchsia-500/50' 
                        : 'bg-gray-900/50 border-gray-700/50 opacity-60'
                    }`}
                  >
                    <div className={`text-lg sm:text-xl md:text-2xl flex-shrink-0 ${!powerUp.active ? 'grayscale' : ''}`}>{powerUp.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs sm:text-sm font-bold ${powerUp.active ? 'text-fuchsia-400' : 'text-gray-500'} truncate`}>
                        {powerUp.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{powerUp.description}</p>
                    </div>
                    {powerUp.active ? (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-fuchsia-400 rounded-full animate-pulse flex-shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No active power-ups</p>
                <p className="text-[10px] sm:text-xs">Build your streak to unlock boosts!</p>
              </div>
            )}
          </motion.div>

          {/* Level Progress */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brutal-card bg-gray-900 border-cyan-500/30 p-2 sm:p-3"
          >
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Star className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">Level Progress</span>
            </h2>

            <div className="text-center mb-2 sm:mb-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#22d3ee"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: `${stats.levelProgress * 2.51} 251` }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-cyan-400">{Math.floor(stats.levelProgress)}%</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl sm:text-2xl font-black text-white">{stats.levelXP > 999 ? `${Math.floor(stats.levelXP / 1000)}k` : stats.levelXP.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-gray-400 truncate">of {stats.neededXP > 999 ? `${Math.floor(stats.neededXP / 1000)}k` : stats.neededXP.toLocaleString()} XP to Lv.{currentLevel + 1}</p>
            </div>

            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1 sm:gap-1.5 text-center">
              <div className="p-1.5 sm:p-2 bg-gray-800 rounded">
                <p className="text-[10px] sm:text-xs text-gray-500">Total XP</p>
                <p className="text-sm sm:text-lg font-bold text-lime-400 truncate">{currentXP > 9999 ? `${Math.floor(currentXP / 1000)}k` : currentXP.toLocaleString()}</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-gray-800 rounded">
                <p className="text-[10px] sm:text-xs text-gray-500">Remaining</p>
                <p className="text-sm sm:text-lg font-bold text-cyan-400 truncate">{stats.xpRemaining > 999 ? `${Math.floor(stats.xpRemaining / 1000)}k` : stats.xpRemaining.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="brutal-card bg-gray-900 border-lime-500/30 p-2 sm:p-3"
          >
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <TrendingUp className="text-lime-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Stats</span>
            </h2>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-800 rounded gap-2">
                <span className="text-xs sm:text-sm text-gray-400 truncate">Total XP</span>
                <span className="font-bold text-lime-400 text-xs sm:text-sm whitespace-nowrap">{currentXP > 9999 ? `${Math.floor(currentXP / 1000)}k` : currentXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-800 rounded gap-2">
                <span className="text-xs sm:text-sm text-gray-400 truncate">Level</span>
                <span className="font-bold text-cyan-400 text-xs sm:text-sm">{currentLevel}</span>
              </div>
              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-800 rounded gap-2">
                <span className="text-xs sm:text-sm text-gray-400 truncate">Best Streak</span>
                <span className="font-bold text-orange-400 text-xs sm:text-sm whitespace-nowrap">{Math.max(streak, codingStats?.longestStreak || 0)}d</span>
              </div>
              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-800 rounded gap-2">
                <span className="text-xs sm:text-sm text-gray-400 truncate">Completion</span>
                <span className="font-bold text-fuchsia-400 text-xs sm:text-sm">{stats.completionRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Internship Tracker */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="brutal-card bg-gray-900 border-green-500/30 p-2 sm:p-3"
          >
            <InternshipTracker />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
