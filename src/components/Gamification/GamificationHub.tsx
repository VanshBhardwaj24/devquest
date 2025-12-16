import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Gift, Crown, Zap,
  Calendar, Sparkles, Timer, CheckCircle,
  Coins, Rocket, 
  TrendingUp, Gem, Trophy,
  Clock, Package
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

// Types for power-ups and boosters
interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'xp_boost' | 'streak_shield' | 'double_coins' | 'time_freeze' | 'lucky_drop';
  duration: number; // in minutes
  remainingTime: number; // in seconds
  multiplier?: number;
  active: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  owned: number;
}

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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'powerups' | 'rewards' | 'achievements' | 'season'>('overview');

  // Core stats from state
  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const coins = Math.floor(currentXP / 10); // Derive coins from XP

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
    if (streak >= 30) return 2.5;
    if (streak >= 21) return 2.0;
    if (streak >= 14) return 1.75;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
  }, [streak]);

  // Dynamic power-ups based on user stats
  const powerUps = useMemo<PowerUp[]>(() => {
    const basePowerUps: PowerUp[] = [
      {
        id: '1',
        name: 'XP Surge',
        description: 'Double all XP earned for 30 minutes',
        icon: '⚡',
        type: 'xp_boost',
        duration: 30,
        remainingTime: streak >= 7 ? 1800 : 0,
        multiplier: 2.0,
        active: streak >= 7,
        rarity: 'rare',
        cost: 500,
        owned: Math.floor(streak / 7)
      },
      {
        id: '2',
        name: 'Streak Shield',
        description: 'Protect your streak for 24 hours if you miss a day',
        icon: '🛡️',
        type: 'streak_shield',
        duration: 1440,
        remainingTime: streak >= 14 ? 86400 : 0,
        active: streak >= 14,
        rarity: 'epic',
        cost: 1000,
        owned: Math.floor(streak / 14)
      },
      {
        id: '3',
        name: 'Coin Doubler',
        description: 'Earn 2x coins from all activities',
        icon: '💰',
        type: 'double_coins',
        duration: 60,
        remainingTime: completedTasks >= 10 ? 3600 : 0,
        multiplier: 2.0,
        active: completedTasks >= 10,
        rarity: 'rare',
        cost: 750,
        owned: Math.floor(completedTasks / 10)
      },
      {
        id: '4',
        name: 'Lucky Charm',
        description: 'Increases rare drop chances by 50%',
        icon: '🍀',
        type: 'lucky_drop',
        duration: 120,
        remainingTime: currentLevel >= 10 ? 7200 : 0,
        multiplier: 1.5,
        active: currentLevel >= 10,
        rarity: 'legendary',
        cost: 2000,
        owned: Math.floor(currentLevel / 10)
      },
      {
        id: '5',
        name: 'Focus Mode',
        description: 'Block distractions and gain 25% more XP',
        icon: '🎯',
        type: 'xp_boost',
        duration: 45,
        remainingTime: 0,
        multiplier: 1.25,
        active: false,
        rarity: 'common',
        cost: 250,
        owned: 3
      },
      {
        id: '6',
        name: 'Energy Drink',
        description: 'Instant +100 XP boost',
        icon: '🥤',
        type: 'xp_boost',
        duration: 0,
        remainingTime: 0,
        multiplier: 1,
        active: false,
        rarity: 'common',
        cost: 100,
        owned: 5
      },
    ];
    return basePowerUps;
  }, [streak, completedTasks, currentLevel]);

  // Daily rewards calendar
  const dailyRewards = useMemo<DailyReward[]>(() => {
    const currentDay = streak % 7 + 1;
    return [
      { day: 1, reward: { type: 'xp', amount: 50 }, claimed: streak >= 1, current: currentDay === 1 },
      { day: 2, reward: { type: 'coins', amount: 100 }, claimed: streak >= 2, current: currentDay === 2 },
      { day: 3, reward: { type: 'xp', amount: 100 }, claimed: streak >= 3, current: currentDay === 3 },
      { day: 4, reward: { type: 'powerup', amount: 1, item: 'Focus Mode' }, claimed: streak >= 4, current: currentDay === 4 },
      { day: 5, reward: { type: 'coins', amount: 250 }, claimed: streak >= 5, current: currentDay === 5 },
      { day: 6, reward: { type: 'xp', amount: 200 }, claimed: streak >= 6, current: currentDay === 6 },
      { day: 7, reward: { type: 'chest', amount: 1, item: 'Weekly Chest' }, claimed: streak >= 7, current: currentDay === 7 },
    ];
  }, [streak]);

  // Achievements based on real progress
  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'streak_3',
      name: 'Getting Started',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      progress: Math.min(streak, 3),
      target: 3,
      xpReward: 100,
      unlocked: streak >= 3,
      category: 'streak'
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚡',
      progress: Math.min(streak, 7),
      target: 7,
      xpReward: 250,
      unlocked: streak >= 7,
      category: 'streak'
    },
    {
      id: 'streak_30',
      name: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '👑',
      progress: Math.min(streak, 30),
      target: 30,
      xpReward: 1000,
      unlocked: streak >= 30,
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
  ], [streak, completedTasks, currentLevel, codingStats]);

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
      owned: Math.floor(streak / 7)
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
  ], [completedTasks, streak, currentLevel]);

  // Time until daily reset
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  // Active power-ups count
  const activePowerUps = powerUps.filter(p => p.active);

  // Claim daily login
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState(false);
  const claimDailyLogin = () => {
    if (dailyLoginClaimed) return;
    const reward = 50 + streak * 10;
    dispatch({ type: 'ADD_XP', payload: { amount: reward, source: 'Daily Login' } });
    setDailyLoginClaimed(true);
  };

  // Tab content components
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 bg-gradient-to-br ${xpStats.titleInfo.color} rounded-2xl text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Current Rank</p>
              <h2 className="text-2xl font-bold">{xpStats.titleInfo.title}</h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">{currentLevel}</div>
              <p className="text-white/70 text-sm">Level</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{xpStats.levelXP.toLocaleString()} / {xpStats.neededXP.toLocaleString()} XP</span>
              <span>{xpStats.progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpStats.progress}%` }}
                className="h-full bg-white/90 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Coins size={14} /> {currentXP.toLocaleString()} Total XP
            </span>
            <span className="flex items-center gap-1">
              <Gem size={14} /> {coins.toLocaleString()} Coins
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-orange-500/50 p-4 text-center">
          <Flame className="text-orange-400 mx-auto mb-2" size={24} />
          <p className="text-2xl font-black text-white">{streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
          <p className="text-xs text-orange-400 mt-1">{streakMultiplier}x Bonus</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-lime-500/50 p-4 text-center">
          <Zap className="text-lime-400 mx-auto mb-2" size={24} />
          <p className="text-2xl font-black text-white">{activePowerUps.length}</p>
          <p className="text-xs text-gray-500">Active Boosts</p>
          <p className="text-xs text-lime-400 mt-1">{powerUps.reduce((a, p) => a + p.owned, 0)} Total</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-cyan-500/50 p-4 text-center">
          <Trophy className="text-cyan-400 mx-auto mb-2" size={24} />
          <p className="text-2xl font-black text-white">{achievements.filter(a => a.unlocked).length}</p>
          <p className="text-xs text-gray-500">Achievements</p>
          <p className="text-xs text-cyan-400 mt-1">of {achievements.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="brutal-card bg-gray-900 border-fuchsia-500/50 p-4 text-center">
          <Package className="text-fuchsia-400 mx-auto mb-2" size={24} />
          <p className="text-2xl font-black text-white">{lootBoxes.reduce((a, b) => a + b.owned, 0)}</p>
          <p className="text-xs text-gray-500">Chests</p>
          <p className="text-xs text-fuchsia-400 mt-1">Ready to Open</p>
        </motion.div>
      </div>

      {/* Daily Login */}
      <motion.div
        whileHover={{ scale: dailyLoginClaimed ? 1 : 1.01 }}
        onClick={claimDailyLogin}
        className={`p-4 rounded-xl cursor-pointer border-2 ${
          dailyLoginClaimed 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className={dailyLoginClaimed ? 'text-gray-500' : 'text-yellow-300'} size={28} />
            <div>
              <h3 className={`font-bold ${dailyLoginClaimed ? 'text-gray-400' : 'text-white'}`}>
                {dailyLoginClaimed ? 'Claimed!' : 'Daily Login Bonus'}
              </h3>
              <p className={`text-sm ${dailyLoginClaimed ? 'text-gray-500' : 'text-purple-200'}`}>
                {dailyLoginClaimed ? 'Come back tomorrow!' : `+${50 + streak * 10} XP`}
              </p>
            </div>
          </div>
          {!dailyLoginClaimed && <Sparkles className="text-yellow-300 animate-pulse" size={24} />}
        </div>
      </motion.div>

      {/* Daily Rewards Calendar */}
      <div className="brutal-card bg-gray-900 border-lime-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-lime-400" /> Weekly Rewards
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={12} /> Resets in {timeUntilReset}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {dailyRewards.map((day) => (
            <motion.div
              key={day.day}
              whileHover={{ y: -2 }}
              className={`p-2 rounded-lg text-center border-2 ${
                day.claimed 
                  ? 'bg-lime-500/20 border-lime-500/50' 
                  : day.current 
                    ? 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-400'
                    : 'bg-gray-800 border-gray-700'
              }`}
            >
              <p className={`text-xs ${day.claimed ? 'text-lime-400' : 'text-gray-500'}`}>Day {day.day}</p>
              <div className="text-lg my-1">
                {day.reward.type === 'xp' && '⚡'}
                {day.reward.type === 'coins' && '💰'}
                {day.reward.type === 'powerup' && '🎁'}
                {day.reward.type === 'chest' && '📦'}
              </div>
              <p className="text-[10px] text-gray-400">
                {day.reward.type === 'xp' && `+${day.reward.amount}`}
                {day.reward.type === 'coins' && `${day.reward.amount}`}
                {day.reward.type === 'powerup' && 'Power-Up'}
                {day.reward.type === 'chest' && 'Chest'}
              </p>
              {day.claimed && <CheckCircle size={12} className="text-lime-400 mx-auto mt-1" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Power-Ups */}
      {activePowerUps.length > 0 && (
        <div className="brutal-card bg-gray-900 border-fuchsia-500/30 p-4">
          <h3 className="font-bold text-white flex items-center gap-2 mb-3">
            <Zap size={18} className="text-fuchsia-400" /> Active Power-Ups
          </h3>
          <div className="space-y-2">
            {activePowerUps.map((powerUp) => (
              <div key={powerUp.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{powerUp.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{powerUp.name}</p>
                    <p className="text-xs text-gray-500">{powerUp.multiplier}x multiplier</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse" />
                  <span className="text-xs text-fuchsia-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPowerUps = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Power-Ups & Boosters</h2>
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Gem size={14} className="text-yellow-400" /> {coins.toLocaleString()} Coins
        </span>
      </div>

      {/* Rarity Legend */}
      <div className="flex flex-wrap gap-2">
        {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <span key={rarity} className={`px-2 py-1 rounded text-xs font-medium ${
            rarity === 'common' ? 'bg-gray-700 text-gray-300' :
            rarity === 'rare' ? 'bg-blue-900 text-blue-300' :
            rarity === 'epic' ? 'bg-purple-900 text-purple-300' :
            'bg-yellow-900 text-yellow-300'
          }`}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </span>
        ))}
      </div>

      {/* Power-Ups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerUps.map((powerUp) => (
          <motion.div
            key={powerUp.id}
            whileHover={{ y: -4 }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              powerUp.active 
                ? 'bg-fuchsia-500/20 border-fuchsia-500' 
                : powerUp.rarity === 'legendary' ? 'bg-yellow-900/20 border-yellow-500/50' :
                  powerUp.rarity === 'epic' ? 'bg-purple-900/20 border-purple-500/50' :
                  powerUp.rarity === 'rare' ? 'bg-blue-900/20 border-blue-500/50' :
                  'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{powerUp.icon}</div>
              <div className="flex items-center gap-1">
                {powerUp.active && <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-pulse" />}
                <span className={`text-xs px-2 py-0.5 rounded ${
                  powerUp.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                  powerUp.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                  powerUp.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {powerUp.rarity}
                </span>
              </div>
            </div>
            
            <h3 className="font-bold text-white mb-1">{powerUp.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{powerUp.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Owned: {powerUp.owned}</span>
              <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                <Coins size={12} /> {powerUp.cost}
              </span>
            </div>

            {powerUp.duration > 0 && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Timer size={10} /> Duration: {powerUp.duration} min
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Loot Boxes */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-fuchsia-400" /> Treasure Chests
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {lootBoxes.map((box) => (
            <motion.div
              key={box.id}
              whileHover={{ y: -4, rotate: [-1, 1, -1, 0] }}
              className={`p-4 rounded-xl border-2 text-center cursor-pointer ${
                box.rarity === 'legendary' ? 'bg-gradient-to-b from-yellow-900/30 to-orange-900/30 border-yellow-500' :
                box.rarity === 'epic' ? 'bg-gradient-to-b from-purple-900/30 to-pink-900/30 border-purple-500' :
                box.rarity === 'rare' ? 'bg-gradient-to-b from-blue-900/30 to-cyan-900/30 border-blue-500' :
                'bg-gray-800 border-gray-600'
              }`}
            >
              <div className="text-4xl mb-2">
                {box.rarity === 'legendary' ? '👑' : box.rarity === 'epic' ? '💎' : box.rarity === 'rare' ? '✨' : '📦'}
              </div>
              <h4 className="font-bold text-white text-sm">{box.name}</h4>
              <p className="text-xs text-gray-400 mt-1">Owned: {box.owned}</p>
              <div className="mt-2 text-xs text-yellow-400 flex items-center justify-center gap-1">
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
    const categoryNames = { streak: '🔥 Streak', tasks: '✅ Tasks', coding: '💻 Coding', special: '⭐ Special' };
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Achievements</h2>
          <span className="text-sm text-gray-400">
            {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
          </span>
        </div>

        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-bold text-white mb-3">{categoryNames[category]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.filter(a => a.category === category).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ x: 4 }}
                  className={`p-4 rounded-xl border-2 ${
                    achievement.unlocked 
                      ? 'bg-lime-500/20 border-lime-500/50' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold ${achievement.unlocked ? 'text-lime-400' : 'text-white'}`}>
                          {achievement.name}
                        </h4>
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <Coins size={10} /> +{achievement.xpReward}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            className={`h-full ${achievement.unlocked ? 'bg-lime-500' : 'bg-cyan-500'}`}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-500">{achievement.progress}/{achievement.target}</span>
                          {achievement.unlocked && <CheckCircle size={12} className="text-lime-400" />}
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
        <h2 className="text-xl font-bold text-white">Season Pass</h2>
        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
          Season 1
        </span>
      </div>

      {/* Current Progress */}
      <div className="brutal-card bg-gray-900 border-purple-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-400 text-sm">Current Tier</p>
            <p className="text-3xl font-black text-white">{seasonPass.currentTier}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Next Tier</p>
            <p className="text-xl font-bold text-purple-400">{Math.min(seasonPass.currentTier + 1, 50)}</p>
          </div>
        </div>
        
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(seasonPass.xpProgress / seasonPass.xpPerTier) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {seasonPass.xpProgress} / {seasonPass.xpPerTier} XP to next tier
        </p>
      </div>

      {/* Reward Track */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {seasonPass.rewards.map((reward, index) => (
            <motion.div
              key={reward.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-32 p-3 rounded-xl border-2 ${
                reward.claimed 
                  ? 'bg-purple-500/20 border-purple-500/50' 
                  : seasonPass.currentTier >= reward.tier - 5 && seasonPass.currentTier < reward.tier
                    ? 'bg-gray-800 border-cyan-500 ring-2 ring-cyan-400'
                    : 'bg-gray-800 border-gray-700'
              }`}
            >
              <p className="text-center text-xs text-gray-400 mb-2">Tier {reward.tier}</p>
              
              {/* Free Reward */}
              <div className="p-2 bg-gray-700 rounded mb-2 text-center">
                <p className="text-[10px] text-gray-400">FREE</p>
                <p className="text-xs text-white font-bold">{reward.free}</p>
              </div>
              
              {/* Premium Reward */}
              <div className="p-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded text-center border border-purple-500/30">
                <p className="text-[10px] text-purple-300">PREMIUM</p>
                <p className="text-xs text-white font-bold">{reward.premium}</p>
              </div>
              
              {reward.claimed && (
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
        className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center cursor-pointer"
      >
        <Crown className="text-yellow-300 mx-auto mb-2" size={28} />
        <h3 className="text-lg font-bold text-white">Upgrade to Premium</h3>
        <p className="text-sm text-purple-200">Unlock exclusive rewards & 2x XP boost</p>
      </motion.div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-[#0a0a0a]">
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
