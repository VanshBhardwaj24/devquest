import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Trophy, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { ActivityItem } from '../../services/dashboardService';

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities: externalActivities }: RecentActivityProps) {
  const { state } = useApp();
  const { darkMode } = state;

  const defaultActivities = [
    {
      id: '1',
      type: 'task',
      title: 'Completed Leetcode Easy Problem',
      time: '2 hours ago',
      icon: 'check',
      xp: 50,
    },
    // ... potentially other defaults or just empty
  ];

  const activities = externalActivities || []; // Use external or empty (could use defaults but external is preferred)

  const getIcon = (type: string, iconName?: string) => {
    if (iconName === 'check') return CheckCircle;
    if (type === 'milestone') return Target;
    if (type === 'achievement') return Trophy;
    if (type === 'error') return AlertCircle;
    return Clock; // default
  };

  const getColor = (type: string) => {
      switch (type) {
          case 'task': return 'text-green-500';
          case 'milestone': return 'text-blue-500';
          case 'achievement': return 'text-yellow-500';
          case 'error': return 'text-red-500';
          default: return 'text-purple-500';
      }
  };

  return (
    <Card variant="brutal" className={`p-6 rounded-none ${
      darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'
    }`}>
      <h2 className={`text-2xl font-black font-mono uppercase mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
        <Clock className={darkMode ? "text-white" : "text-black"} size={24} />
        Recent Activity
      </h2>
      
      {activities.length === 0 ? (
          <div className="text-center py-8 font-mono opacity-60">NO RECENT ACTIVITY DETECTED</div>
      ) : (
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type, activity.icon);
          const colorClass = getColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
              className={`flex items-center p-4 border-2 transition-all rounded-none ${
                darkMode 
                  ? 'bg-zinc-800 border-zinc-600 hover:border-white' 
                  : 'bg-gray-50 border-black hover:bg-white'
              } hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              <div className={`${colorClass} mr-4 p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold font-mono uppercase truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                  {activity.title}
                </div>
                <div className={`text-xs font-mono uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {typeof activity.time === 'string' ? activity.time : 'Just now'}
                </div>
              </div>
              {activity.xp && (
              <div className={`text-sm font-black font-mono border-2 border-black px-2 py-1 ${
                darkMode ? 'bg-zinc-700 text-white' : 'bg-yellow-300 text-black'
              } shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                +{activity.xp}XP
              </div>
              )}
            </motion.div>
          );
        })}
      </div>
      )}
    </Card>
  );
}