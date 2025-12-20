import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Trophy } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';

export function RecentActivity() {
  const { state } = useApp();
  const { darkMode } = state;

  const activities = [
    {
      id: 1,
      type: 'task',
      title: 'Completed Leetcode Easy Problem',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-500',
      xp: 50,
    },
    {
      id: 2,
      type: 'milestone',
      title: 'Updated LinkedIn Profile',
      time: '1 day ago',
      icon: Target,
      color: 'text-blue-500',
      xp: 100,
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Unlocked "First Resume Upload" badge',
      time: '2 days ago',
      icon: Trophy,
      color: 'text-yellow-500',
      xp: 200,
    },
    {
      id: 4,
      type: 'task',
      title: 'Started Mock Interview Practice',
      time: '3 days ago',
      icon: Clock,
      color: 'text-purple-500',
      xp: 75,
    },
  ];

  return (
    <Card variant="brutal" className={`p-6 rounded-none ${
      darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'
    }`}>
      <h2 className={`text-2xl font-black font-mono uppercase mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
        <Clock className={darkMode ? "text-white" : "text-black"} size={24} />
        Recent Activity
      </h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
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
              <div className={`${activity.color} mr-4 p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold font-mono uppercase truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                  {activity.title}
                </div>
                <div className={`text-xs font-mono uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activity.time}
                </div>
              </div>
              <div className={`text-sm font-black font-mono border-2 border-black px-2 py-1 ${
                darkMode ? 'bg-zinc-700 text-white' : 'bg-yellow-300 text-black'
              } shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                +{activity.xp}XP
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}