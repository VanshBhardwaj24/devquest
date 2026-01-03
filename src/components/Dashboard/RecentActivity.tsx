import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Trophy, AlertCircle, Activity } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ActivityItem } from '../../services/dashboardService';

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export function RecentActivity({ activities: externalActivities }: RecentActivityProps) {
  const { state } = useApp();
  const { darkMode } = state;

  const activities = externalActivities || [];

  const getIcon = (type: string, iconName?: string) => {
    if (iconName === 'check') return CheckCircle;
    if (type === 'milestone') return Target;
    if (type === 'achievement') return Trophy;
    if (type === 'error') return AlertCircle;
    return Activity; 
  };

  const getColor = (type: string) => {
      switch (type) {
          case 'task': return 'text-neon-green';
          case 'milestone': return 'text-neon-blue';
          case 'achievement': return 'text-neon-yellow';
          case 'error': return 'text-red-500';
          default: return 'text-neon-purple';
      }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
          <div className="text-center py-8 font-mono text-gray-500 border border-dashed border-gray-800 rounded-lg">
            NO RECENT ACTIVITY DETECTED
          </div>
      ) : (
      <div className="space-y-2">
        {activities.slice(0, 5).map((activity, index) => {
          const Icon = getIcon(activity.type, activity.icon);
          const colorClass = getColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
              className="flex items-center p-3 bg-black/40 border border-white/5 rounded-lg hover:border-neon-blue/50 transition-all group"
            >
              <div className={`${colorClass} mr-3 p-2 rounded bg-white/5 group-hover:bg-white/10 transition-colors`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold font-mono text-sm text-gray-200 group-hover:text-white truncate">
                  {activity.title}
                </div>
                <div className="text-[10px] font-mono uppercase text-gray-500">
                  {typeof activity.time === 'string' ? activity.time : 'Just now'}
                </div>
              </div>
              {activity.xp && (
              <div className="text-xs font-bold font-mono text-neon-yellow bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                +{activity.xp}XP
              </div>
              )}
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
