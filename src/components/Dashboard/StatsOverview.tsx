import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { DashboardStats } from '../../services/dashboardService';

interface StatsOverviewProps {
  stats?: DashboardStats;
}

export function StatsOverview({ stats: externalStats }: StatsOverviewProps) {
  const { state } = useApp();
  const { user, tasks, darkMode } = state;

  // Use external stats if provided, otherwise fallback to basic calculation
  // Note: The parent Dashboard component calculates comprehensive stats, so we prioritize those.
  
  const displayStats = [
    {
      title: 'Total XP',
      value: (externalStats?.xp ?? user?.xp ?? 0).toLocaleString(),
      icon: Zap,
      color: 'text-neon-purple',
      borderColor: 'border-neon-purple',
      bg: 'bg-neon-purple/10',
      change: externalStats ? `Level ${externalStats.level}` : '+150 this week',
    },
    {
      title: 'Current Level',
      value: externalStats?.level ?? user?.level ?? 1,
      icon: TrendingUp,
      color: 'text-neon-green',
      borderColor: 'border-neon-green',
      bg: 'bg-neon-green/10',
      change: user?.tier || 'Novice',
    },
    {
      title: 'Active Tasks',
      value: externalStats?.pendingTasks ?? tasks.filter(t => !t.completed).length,
      icon: Target,
      color: 'text-neon-orange',
      borderColor: 'border-neon-orange',
      bg: 'bg-neon-orange/10',
      change: externalStats ? `${externalStats.completedTasks} done` : '+3 this week',
    },
    {
      title: 'Streak Days',
      value: externalStats?.streak ?? user?.streak ?? 0,
      icon: Calendar,
      color: 'text-neon-blue',
      borderColor: 'border-neon-blue',
      bg: 'bg-neon-blue/10',
      change: 'Keep it up!',
    },
  ];

  return (
    <Card variant="cyber" className="p-6">
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-2 font-cyber text-white">
        <TrendingUp className="text-neon-blue" />
        Your Progress
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`p-4 border rounded-xl bg-black/40 backdrop-blur-sm transition-all duration-300 group hover:bg-black/60 ${stat.borderColor} hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg border ${stat.borderColor} ${stat.bg} ${stat.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white font-mono tracking-tighter">
                    {stat.value}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 font-cyber">
                  {stat.title}
                </div>
                <div className={`text-xs font-mono px-2 py-0.5 rounded border ${stat.borderColor} ${stat.bg} ${stat.color}`}>
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
