import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Flame, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  change: number; // Position change
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic';
  isCurrentUser: boolean;
}

export function BattleRoyaleLeaderboard() {
  const { state } = useApp();
  const { user, xpSystem } = state;
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'alltime'>('daily');

  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentStreak = user?.streak || 0;

  // Generate mock leaderboard data
  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    const entries: LeaderboardEntry[] = [];
    
    // Add current user
    entries.push({
      id: 'current-user',
      rank: 42,
      name: user?.name || 'You',
      avatar: user?.avatar || '🚀',
      xp: currentXP,
      level: currentLevel,
      streak: currentStreak,
      change: 3,
      tier: (user?.tier as LeaderboardEntry['tier']) || 'Bronze',
      isCurrentUser: true,
    });

    // Generate other users
    for (let i = 0; i < 99; i++) {
      const rank = i + 1;
      const xp = Math.floor(Math.random() * 50000) + 1000;
      const level = Math.floor(xp / 1000) + 1;
      const streak = Math.floor(Math.random() * 30);
      const tiers: Array<LeaderboardEntry['tier']> = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Mythic'];
      const tier = tiers[Math.floor(Math.random() * tiers.length)] as LeaderboardEntry['tier'];
      
      entries.push({
        id: `user-${i}`,
        rank,
        name: `Player${rank}`,
        avatar: ['🚀', '⚡', '🔥', '👑', '💎', '⭐', '🎯', '🏆'][Math.floor(Math.random() * 8)],
        xp,
        level,
        streak,
        change: Math.floor(Math.random() * 10) - 5,
        tier,
        isCurrentUser: false,
      });
    }

    // Sort by XP
    entries.sort((a, b) => b.xp - a.xp);
    
    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }, [user, currentXP, currentLevel, currentStreak]);

  const topThree = leaderboard.slice(0, 3);
  const currentUserEntry = leaderboard.find(e => e.isCurrentUser);
  const nearbyEntries = leaderboard.filter((_e, i) => {
    if (!currentUserEntry) return false;
    const userIndex = leaderboard.findIndex(entry => entry.isCurrentUser);
    return i >= Math.max(0, userIndex - 2) && i <= Math.min(leaderboard.length - 1, userIndex + 2);
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Medal className="text-orange-400" size={20} />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Mythic': return 'from-yellow-300 to-amber-500';
      case 'Platinum': return 'from-purple-400 to-pink-500';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-600 to-orange-800';
    }
  };

  return (
    <div className="brutal-card bg-gray-900 border-cyan-500/30 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          Battle Royale Leaderboard
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'daily' | 'weekly' | 'alltime')}
            className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {topThree.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`text-center ${
              index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'
            }`}
          >
            <motion.div
              whileHover={{ y: -4 }}
              className={`brutal-card p-3 sm:p-4 border-4 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-400'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-800/30 to-gray-700/30 border-gray-400'
                  : 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400'
              }`}
            >
              <div className="text-4xl sm:text-5xl mb-2">{entry.avatar}</div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {getRankIcon(entry.rank)}
              </div>
              <h4 className="font-bold text-white text-sm mb-1 truncate">{entry.name}</h4>
              <div className="text-xs text-lime-400 font-bold mb-1">{entry.xp.toLocaleString()} XP</div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <Flame size={10} />
                <span>{entry.streak} days</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Current User Position */}
      {currentUserEntry && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-lime-900/30 to-cyan-900/30 border-4 border-lime-500/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentUserEntry.avatar}</div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  {currentUserEntry.name}
                  <span className="text-xs text-lime-400">(You)</span>
                </h4>
                <div className="text-xs text-gray-400">Rank #{currentUserEntry.rank}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-lime-400">{currentUserEntry.xp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">XP</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-cyan-400">
                <Zap size={12} />
                <span>Level {currentUserEntry.level}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame size={12} />
                <span>{currentUserEntry.streak} days</span>
              </div>
            </div>
            {currentUserEntry.change !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-bold ${
                currentUserEntry.change > 0 ? 'text-lime-400' : 'text-red-400'
              }`}>
                <TrendingUp size={12} className={currentUserEntry.change < 0 ? 'rotate-180' : ''} />
                <span>{Math.abs(currentUserEntry.change)}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Nearby Rankings */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        <h4 className="text-sm font-bold text-gray-400 mb-2">Nearby Rankings</h4>
        {nearbyEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 border-2 flex items-center justify-between ${
              entry.isCurrentUser
                ? 'bg-lime-500/20 border-lime-500/50'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-2xl">{entry.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold">#{entry.rank}</span>
                  <h5 className={`font-bold text-sm truncate ${entry.isCurrentUser ? 'text-lime-400' : 'text-white'}`}>
                    {entry.name}
                  </h5>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-lime-400">{entry.xp.toLocaleString()} XP</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-cyan-400">Lv.{entry.level}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {entry.change !== 0 && (
                <div className={`text-xs font-bold ${
                  entry.change > 0 ? 'text-lime-400' : 'text-red-400'
                }`}>
                  {entry.change > 0 ? '↑' : '↓'} {Math.abs(entry.change)}
                </div>
              )}
              <div className={`px-2 py-1 text-xs font-bold bg-gradient-to-r ${getTierColor(entry.tier)} text-black`}>
                {entry.tier}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

