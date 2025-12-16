import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function StatsOverview() {
  const { state } = useApp();
  const { user, tasks, darkMode } = state;

  const stats = [
    {
      title: 'Total XP',
      value: user?.xp.toLocaleString() || '0',
      icon: Zap,
      color: 'from-purple-500 to-blue-500',
      change: '+150 this week',
    },
    {
      title: 'Current Level',
      value: user?.level || 1,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      change: `${user?.tier} tier`,
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(t => !t.completed).length,
      icon: Target,
      color: 'from-orange-500 to-red-500',
      change: '+3 this week',
    },
    {
      title: 'Streak Days',
      value: user?.streak || 0,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      change: 'Keep it up!',
    },
  ];

  return (
    <div className={`rounded-2xl p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Your Progress Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.title}
                  </div>
                </div>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.change}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}