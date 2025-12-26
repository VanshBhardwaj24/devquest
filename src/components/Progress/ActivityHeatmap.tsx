import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useApp } from '../../contexts/AppContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export function ActivityHeatmap() {
  const { state } = useApp();
  const { darkMode, user, timeBasedStreak } = state;
  const [refreshKey, setRefreshKey] = useState(0);

  const activityData = useMemo(() => {
    const data: { date: Date; count: number }[] = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 364);
    const toIso = (date: Date) => date.toISOString().split('T')[0];
    const daily = timeBasedStreak.dailyActivity;
    const logs = user?.activityLog || [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const iso = toIso(d);
      const streakEntry = daily[iso];
      const logEntry = logs.find(e => e.date === iso);
      const actions = (streakEntry?.tasksCompleted || 0) + (streakEntry?.problemsSolved || 0) + (logEntry?.tasksCompleted || 0);
      const xp = (streakEntry?.xpEarned || 0) + (logEntry?.xpEarned || 0);
      const minutes = (streakEntry?.activeMinutes || 0) + (logEntry?.minutesActive || 0);
      let count = 0;
      if (actions >= 7 || xp >= 500 || minutes >= 120) count = 4;
      else if (actions >= 4 || xp >= 200 || minutes >= 60) count = 3;
      else if (actions >= 2 || xp >= 50 || minutes >= 30) count = 2;
      else if (actions >= 1 || xp > 0 || minutes >= 10) count = 1;
      data.push({ date: new Date(d), count });
    }
    // Using refreshKey to force re-calculation when requested
    if (refreshKey) { /* no-op */ }
    return data;
  }, [refreshKey, timeBasedStreak.dailyActivity, user?.activityLog]);

  const stats = useMemo(() => {
    const total = activityData.reduce((acc, curr) => acc + curr.count, 0);
    
    let maxStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    activityData.forEach((day) => {
        if (day.count > 0) {
            tempStreak++;
        } else {
            if (tempStreak > maxStreak) maxStreak = tempStreak;
            tempStreak = 0;
        }
    });
    // check last streak
    if (tempStreak > maxStreak) maxStreak = tempStreak;

    // Current streak (counting backwards from today)
    for (let i = activityData.length - 1; i >= 0; i--) {
        if (activityData[i].count > 0) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Most active day of week
    const dayCounts = [0,0,0,0,0,0,0]; // Sun-Sat
    activityData.forEach(day => {
        if (day.count > 0) dayCounts[day.date.getDay()]++;
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mostActiveDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const mostActiveDay = days[mostActiveDayIndex];

    return { total, maxStreak, currentStreak, mostActiveDay };
  }, [activityData]);

  const getColor = (count: number) => {
    if (count === 0) return darkMode ? 'bg-gray-800' : 'bg-gray-200';
    if (count === 1) return 'bg-lime-900';
    if (count === 2) return 'bg-lime-700';
    if (count === 3) return 'bg-lime-500';
    return 'bg-lime-300';
  };

  return (
    <div className={`p-6 rounded-none border-4 ${darkMode ? 'bg-[#111] border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-black'} font-mono uppercase tracking-tighter`}>
            Activity Log
        </h2>
        <Button variant="outline" size="icon" onClick={() => setRefreshKey(k => k + 1)} title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[800px]">
          {/* Heatmap Grid */}
          <TooltipProvider>
            <div className="flex gap-1">
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const dayData = activityData[dataIndex];
                    
                    if (!dayData) return <div key={dayIndex} className="w-3 h-3" />;

                    return (
                        <Tooltip key={dayIndex}>
                            <TooltipTrigger asChild>
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${getColor(dayData.count)} rounded-sm border border-black/20 cursor-pointer`}
                            />
                            </TooltipTrigger>
                            <TooltipContent>
                            <p className="font-mono text-xs">
                                {dayData.date.toLocaleDateString()} : {dayData.count > 0 ? `${dayData.count} contributions` : 'No activity'}
                            </p>
                            </TooltipContent>
                        </Tooltip>
                    );
                    })}
                </div>
                ))}
            </div>
          </TooltipProvider>
          
          <div className="flex justify-between mt-4 text-xs font-mono text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className={`w-3 h-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <div className="w-3 h-3 bg-lime-900" />
              <div className="w-3 h-3 bg-lime-700" />
              <div className="w-3 h-3 bg-lime-500" />
              <div className="w-3 h-3 bg-lime-300" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t-2 border-dashed border-gray-700 pt-6">
        <div className="text-center">
            <div className="text-3xl font-black text-lime-500 font-mono">{stats.total}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Total Contributions</div>
        </div>
        <div className="text-center">
            <div className="text-3xl font-black text-cyan-400 font-mono">{stats.maxStreak}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Max Streak</div>
        </div>
        <div className="text-center">
            <div className="text-3xl font-black text-orange-400 font-mono">{stats.currentStreak}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Current Streak</div>
        </div>
        <div className="text-center">
            <div className="text-3xl font-black text-magenta-500 font-mono">{stats.mostActiveDay}</div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Most Active Day</div>
        </div>
      </div>
    </div>
  );
}
