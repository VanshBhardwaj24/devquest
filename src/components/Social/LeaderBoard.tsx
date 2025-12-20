import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Users, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { BattleRoyaleLeaderboard } from './BattleRoyaleLeaderboard';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  tier: string;
  streak: number;
  rank: number;
}

export function LeaderBoard() {
  const { state } = useApp();
  const { darkMode, user } = state;
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  // Mock leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    {
      id: '1',
      name: 'Alex Chen',
      avatar: 'AC',
      xp: 15420,
      level: 15,
      tier: 'Platinum',
      streak: 45,
      rank: 1,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      xp: 14890,
      level: 14,
      tier: 'Gold',
      streak: 32,
      rank: 2,
    },
    {
      id: '3',
      name: 'Raj Patel',
      avatar: 'RP',
      xp: 13750,
      level: 13,
      tier: 'Gold',
      streak: 28,
      rank: 3,
    },
    {
      id: '4',
      name: 'Emily Davis',
      avatar: 'ED',
      xp: 12340,
      level: 12,
      tier: 'Silver',
      streak: 21,
      rank: 4,
    },
    {
      id: '5',
      name: user?.name || 'You',
      avatar: user?.name?.charAt(0) || 'Y',
      xp: user?.xp || 0,
      level: user?.level || 1,
      tier: user?.tier || 'Bronze',
      streak: user?.streak || 0,
      rank: 5,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'mythic':
        return 'from-red-500 to-pink-500';
      case 'platinum':
        return 'from-purple-500 to-indigo-500';
      case 'gold':
        return 'from-yellow-400 to-orange-500';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={`p-3 sm:p-6 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} min-h-screen pb-20 lg:pb-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Battle Royale Leaderboard */}
        <BattleRoyaleLeaderboard />
        
        {/* Original Leaderboard */}
        <div className="mt-6">
          <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Leaderboard 🏆
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            See how you rank against other career questers
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-2 mb-6">
          {(['weekly', 'monthly', 'all-time'] as const).map((period) => (
            <motion.button
              key={period}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                timeframe === period
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {period.replace('-', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboardData.slice(0, 3).map((user, index) => {
            const positions = [1, 0, 2]; // Center, Left, Right
            const actualIndex = positions[index];
            const heights = ['h-32', 'h-40', 'h-28'];
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: actualIndex * 0.2 }}
                className={`${heights[actualIndex]} flex flex-col items-center justify-end`}
              >
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(user.tier)} flex items-center justify-center text-white font-bold text-xl mb-2 mx-auto`}>
                    {user.avatar}
                  </div>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.name}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.xp.toLocaleString()} XP
                  </div>
                </div>
                
                <div className={`w-full bg-gradient-to-t ${getTierColor(user.tier)} rounded-t-lg flex items-center justify-center ${heights[actualIndex]}`}>
                  <div className="text-center text-white">
                    {getRankIcon(user.rank)}
                    <div className="text-2xl font-bold mt-2">#{user.rank}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Full Rankings
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboardData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  user.id === '5' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTierColor(user.tier)} flex items-center justify-center text-white font-bold`}>
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                      {user.id === '5' && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Level {user.level} • {user.tier}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.xp.toLocaleString()} XP
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.streak} day streak
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+{Math.floor(Math.random() * 100)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}