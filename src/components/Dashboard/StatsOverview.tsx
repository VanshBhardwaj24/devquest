import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';

export function StatsOverview() {
  const { state } = useApp();
  const { user, tasks, darkMode } = state;

  const stats = [
    {
      title: 'Total XP',
      value: user?.xp.toLocaleString() || '0',
      icon: Zap,
      bg: 'bg-purple-500',
      text: 'text-white',
      change: '+150 this week',
    },
    {
      title: 'Current Level',
      value: user?.level || 1,
      icon: TrendingUp,
      bg: 'bg-green-500',
      text: 'text-black',
      change: `${user?.tier || 'Novice'} tier`,
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(t => !t.completed).length,
      icon: Target,
      bg: 'bg-orange-500',
      text: 'text-black',
      change: '+3 this week',
    },
    {
      title: 'Streak Days',
      value: user?.streak || 0,
      icon: Calendar,
      bg: 'bg-blue-500',
      text: 'text-white',
      change: 'Keep it up!',
    },
  ];

  return (
    <Card variant="brutal" className={`p-6 ${darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'}`}>
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
        <TrendingUp className={darkMode ? "text-white" : "text-black"} />
        Your Progress
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
              whileHover={{ scale: 1.02, rotate: -1 }}
              className={`p-4 border-2 border-black transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                darkMode ? 'bg-zinc-800 border-zinc-500' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.text}`} />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.title}
                </div>
                <div className={`text-xs font-mono bg-black text-white px-1 py-0.5 ${darkMode ? 'bg-white text-black' : ''}`}>
                  {stat.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
