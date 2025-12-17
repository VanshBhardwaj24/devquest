import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { 
  Zap, Trophy, Target, Star, Crown,
  TrendingUp, Gift, Shield,
  CheckCircle, Rocket, Flame, ArrowUp
} from 'lucide-react';
import { NonNegotiables } from './NonNegotiables';
import { InternshipTracker } from './InternshipTracker';

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
  const { state } = useApp();
  const { user, xpSystem, tasks, codingStats } = state;
  const [pulseXP, setPulseXP] = useState(false);
  
  // Core values from state
  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;

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
        completed: completedTasks >= 1 
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
        completed: codingProblems % 3 === 0 && codingProblems > 0
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
        completed: streak > 0 
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
        completed: completedTasks >= 5
      },
    ];
  }, [completedTasks, codingStats, currentLevel, streak]);

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
      className="p-3 sm:p-4 lg:p-6 min-h-screen bg-[#0a0a0a]"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden mb-4 sm:mb-6 bg-gray-900 border-4 border-lime-500/30 brutal-shadow p-4 sm:p-6"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#84cc16_20px,#84cc16_22px)]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: User Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-lime-400 to-cyan-400 border-4 border-black brutal-shadow flex items-center justify-center text-3xl sm:text-4xl">
                {user?.avatar || '🚀'}
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 bg-orange-500 border-2 border-black px-2 py-0.5 text-xs font-black text-black"
              >
                LVL {currentLevel}
              </motion.div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{greeting.text}</span>
                <span>{greeting.emoji}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                {user?.name || 'Champion'}<span className="text-lime-400">!</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Crown className="text-yellow-400" size={14} />
                <span className="text-sm text-gray-400">{user?.tier || 'Novice'}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-orange-500/50 px-3 sm:px-4 py-2 flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <Flame className="text-orange-400" size={20} />
              </motion.div>
              <div>
                <div className="text-white font-black text-lg">{streak}</div>
                <div className="text-gray-500 text-[10px] uppercase">Day Streak</div>
              </div>
            </motion.div>

            {/* Total XP */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className={`brutal-card bg-gray-800 border-lime-500/50 px-3 sm:px-4 py-2 flex items-center gap-2 ${pulseXP ? 'ring-2 ring-lime-400' : ''}`}
            >
              <Zap className="text-lime-400" size={20} />
              <div>
                <div className="text-white font-black text-lg">{currentXP.toLocaleString()}</div>
                <div className="text-gray-500 text-[10px] uppercase">Total XP</div>
              </div>
            </motion.div>

            {/* Multiplier */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-fuchsia-500/50 px-3 sm:px-4 py-2 flex items-center gap-2"
            >
              <ArrowUp className="text-fuchsia-400" size={20} />
              <div>
                <div className="text-white font-black text-lg">×{stats.multiplier}</div>
                <div className="text-gray-500 text-[10px] uppercase">Boost</div>
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="brutal-card bg-gray-800 border-cyan-500/50 px-3 sm:px-4 py-2 flex items-center gap-2"
            >
              <CheckCircle className="text-cyan-400" size={20} />
              <div>
                <div className="text-white font-black text-lg">{completedTasks}/{totalTasks}</div>
                <div className="text-gray-500 text-[10px] uppercase">Tasks</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative z-10 mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Level {currentLevel} → {currentLevel + 1}</span>
            <span className="text-xs text-lime-400">{stats.levelXP.toLocaleString()} / {stats.neededXP.toLocaleString()} XP</span>
          </div>
          <div className="h-4 bg-gray-800 border-2 border-gray-700 overflow-hidden">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Daily Quests */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-gray-900 border-lime-500/30 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="text-lime-400" size={20} />
                Daily Quests
              </h2>
              <span className="text-xs text-gray-500">
                {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length} Complete
              </span>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 border-2 ${quest.completed ? 'border-lime-500/50 bg-lime-500/10' : 'border-gray-700 bg-gray-800'} flex items-center gap-3`}
                >
                  <div className="text-2xl">{quest.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-sm ${quest.completed ? 'text-lime-400' : 'text-white'}`}>
                        {quest.title}
                      </h3>
                      <span className="text-xs text-lime-400 flex items-center gap-1">
                        <Zap size={10} /> +{quest.xp} XP
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
                    <div className="mt-2 h-1.5 bg-gray-700 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                        className={`h-full ${quest.completed ? 'bg-lime-500' : 'bg-cyan-500'}`}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">{quest.progress}/{quest.target}</span>
                      {quest.completed && <span className="text-[10px] text-lime-400">✓ Complete</span>}
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
            className="brutal-card bg-gray-900 border-orange-500/30 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="text-orange-400" size={20} />
                Weekly Challenge
              </h2>
              <span className="text-sm text-orange-400 font-bold flex items-center gap-1">
                <Gift size={14} /> {weeklyChallenge.reward} XP
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold">{weeklyChallenge.name}</span>
                <span className="text-sm text-gray-400">{weeklyChallenge.progress}%</span>
              </div>
              <div className="h-3 bg-gray-800 border border-gray-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyChallenge.progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {weeklyChallenge.milestones.map((milestone, i) => (
                <div 
                  key={i}
                  className={`p-2 border ${milestone.done ? 'border-lime-500/50 bg-lime-500/10' : 'border-gray-700 bg-gray-800'} text-center`}
                >
                  <div className={`text-lg ${milestone.done ? 'text-lime-400' : 'text-gray-500'}`}>
                    {milestone.done ? '✓' : '○'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{milestone.name}</p>
                  <p className="text-[10px] text-orange-400">+{milestone.xp} XP</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Non-Negotiables */}
          <NonNegotiables />
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Active Power-Ups */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-gray-900 border-fuchsia-500/30 p-4"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Rocket className="text-fuchsia-400" size={20} />
              Power-Ups
              <span className="text-xs text-fuchsia-400 ml-auto">
                {activePowerUps.filter(p => p.active).length}/{activePowerUps.length} Active
              </span>
            </h2>

            {activePowerUps.length > 0 ? (
              <div className="space-y-2">
                {activePowerUps.map((powerUp) => (
                  <motion.div
                    key={powerUp.id}
                    whileHover={{ x: 4 }}
                    className={`p-3 border-2 flex items-center gap-3 transition-all ${
                      powerUp.active 
                        ? 'bg-gray-800 border-fuchsia-500/50' 
                        : 'bg-gray-900/50 border-gray-700/50 opacity-60'
                    }`}
                  >
                    <div className={`text-2xl ${!powerUp.active ? 'grayscale' : ''}`}>{powerUp.icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${powerUp.active ? 'text-fuchsia-400' : 'text-gray-500'}`}>
                        {powerUp.name}
                      </h3>
                      <p className="text-xs text-gray-500">{powerUp.description}</p>
                    </div>
                    {powerUp.active ? (
                      <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-600 rounded-full" />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Shield size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active power-ups</p>
                <p className="text-xs">Build your streak to unlock boosts!</p>
              </div>
            )}
          </motion.div>

          {/* Level Progress */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brutal-card bg-gray-900 border-cyan-500/30 p-4"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Star className="text-cyan-400" size={20} />
              Level Progress
            </h2>

            <div className="text-center mb-4">
              <div className="relative w-24 h-24 mx-auto">
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
              <p className="text-2xl font-black text-white">{stats.levelXP.toLocaleString()}</p>
              <p className="text-sm text-gray-400">of {stats.neededXP.toLocaleString()} XP to Level {currentLevel + 1}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-gray-800 rounded">
                <p className="text-xs text-gray-500">Total XP</p>
                <p className="text-lg font-bold text-lime-400">{currentXP.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gray-800 rounded">
                <p className="text-xs text-gray-500">XP Remaining</p>
                <p className="text-lg font-bold text-cyan-400">{stats.xpRemaining.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="brutal-card bg-gray-900 border-lime-500/30 p-4"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="text-lime-400" size={20} />
              Stats
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-sm text-gray-400">Total XP</span>
                <span className="font-bold text-lime-400">{currentXP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-sm text-gray-400">Level</span>
                <span className="font-bold text-cyan-400">{currentLevel}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-sm text-gray-400">Best Streak</span>
                <span className="font-bold text-orange-400">{Math.max(streak, codingStats?.longestStreak || 0)} days</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-sm text-gray-400">Completion Rate</span>
                <span className="font-bold text-fuchsia-400">{stats.completionRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Internship Tracker */}
          <InternshipTracker />
        </div>
      </div>
    </motion.div>
  );
}
