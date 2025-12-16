import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Trophy } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

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
    <div className={`rounded-2xl p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
              className={`flex items-center p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              } hover:scale-105 transition-transform`}
            >
              <div className={`${activity.color} mr-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {activity.title}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activity.time}
                </div>
              </div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                +{activity.xp} XP
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}