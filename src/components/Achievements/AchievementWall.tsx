import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function AchievementWall() {
  const { state } = useApp();
  const { achievements, darkMode } = state;

  const tierColors = {
    bronze: 'from-yellow-600 to-yellow-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
    mythic: 'from-red-400 to-pink-600',
  };

  const tierIcons = {
    bronze: Trophy,
    silver: Star,
    gold: Award,
    platinum: Crown,
    mythic: Crown,
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Achievement Wall 🏆
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Your badges and milestones showcase your journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(tierColors).map(([tier, gradient]) => {
            const tierAchievements = achievements.filter(a => a.tier === tier);
            const unlockedCount = tierAchievements.filter(a => a.unlocked).length;
            const TierIcon = tierIcons[tier as keyof typeof tierIcons];
            
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
                    <TierIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {unlockedCount}/{tierAchievements.length}
                    </div>
                    <div className={`text-sm capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tier} Badges
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const TierIcon = tierIcons[achievement.tier];
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-2xl border-2 ${
                  achievement.unlocked
                    ? `border-transparent bg-gradient-to-r ${tierColors[achievement.tier]}`
                    : darkMode
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                } ${!achievement.unlocked && 'opacity-50'}`}
              >
                <div className="text-center">
                  <div className={`text-6xl mb-4 ${
                    !achievement.unlocked && 'grayscale'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-2 ${
                    achievement.unlocked
                      ? 'text-white'
                      : darkMode
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    achievement.unlocked
                      ? 'text-white/80'
                      : darkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <TierIcon className={`h-4 w-4 ${
                        achievement.unlocked
                          ? 'text-white'
                          : darkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`} />
                      <span className={`text-xs uppercase font-medium ${
                        achievement.unlocked
                          ? 'text-white'
                          : darkMode
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}>
                        {achievement.tier}
                      </span>
                    </div>
                    
                    <div className={`text-xs font-bold ${
                      achievement.unlocked
                        ? 'text-white'
                        : darkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}>
                      {achievement.xp} XP
                    </div>
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs text-white/80">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}