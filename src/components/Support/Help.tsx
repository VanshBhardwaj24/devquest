import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Zap, Trophy, Shield, Target, BookOpen, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function Help() {
  const { state } = useApp();
  const { darkMode } = state;

  const features = [
    {
      icon: <Zap className="text-yellow-400" />,
      title: "XP & Leveling",
      description: "Earn XP by completing tasks, coding challenges, and daily quests. Level up to unlock new features and badges."
    },
    {
      icon: <Trophy className="text-orange-400" />,
      title: "Badges & Achievements",
      description: "Unlock unique badges by reaching milestones. Show off your achievements on your profile."
    },
    {
      icon: <Shield className="text-lime-400" />,
      title: "Streaks",
      description: "Maintain your coding and task streaks to earn multipliers. Don't let the fire go out!"
    },
    {
      icon: <Target className="text-cyan-400" />,
      title: "Quests",
      description: "Complete daily and weekly quests for bonus rewards. Some quests have penalties if missed!"
    },
    {
      icon: <BookOpen className="text-purple-400" />,
      title: "Skill Tree",
      description: "Visualize your growth across different domains like Coding, Fitness, and Finance."
    },
    {
      icon: <Star className="text-pink-400" />,
      title: "Leaderboard",
      description: "Compete with other developers. Climb the ranks to become the top coder."
    }
  ];

  return (
    <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <HelpCircle size={32} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-mono">HOW TO PLAY</h1>
            <p className="text-gray-500">Master the game of life and code</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border-2 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } hover:border-cyan-500 transition-colors group`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-900 rounded-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 font-mono">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`mt-8 p-6 rounded-xl border-2 border-dashed ${
          darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
        }`}>
          <h3 className="text-lg font-bold mb-4 font-mono flex items-center gap-2">
            <span className="text-2xl">💡</span> PRO TIPS
          </h3>
          <ul className="space-y-2 text-sm text-gray-500 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-lime-500">→</span> Complete "Non-Negotiables" first to secure your streak.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lime-500">→</span> Check the Shop daily for new power-ups.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lime-500">→</span> Connect your GitHub account to automate coding tracking.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
