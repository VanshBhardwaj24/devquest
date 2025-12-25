import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Clock, Activity, Flame, Medal, Star, Zap, Lock, Filter, Target, Brain, Rocket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export function Achievements() {
  const { state, dispatch } = useApp();
  const { badges, codingStats, timeBasedStreak, darkMode, xpSystem, challenges } = state;
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Analytics Calculation
  const activityData = timeBasedStreak.dailyActivity || {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Most active day calculation
  const dayCounts = Object.entries(activityData).reduce((acc, [date, data]) => {
    const dayIndex = new Date(date).getDay();
    acc[dayIndex] = (acc[dayIndex] || 0) + (data.tasksCompleted || 0) + (data.problemsSolved || 0);
    return acc;
  }, {} as Record<number, number>);

  const mostActiveDayIndex = Object.keys(dayCounts).reduce((a, b) => dayCounts[Number(a)] > dayCounts[Number(b)] ? a : b, '0');
  const mostActiveDay = days[Number(mostActiveDayIndex)];

  // Detailed Stats
  const totalTasks = Object.values(activityData).reduce((acc, curr) => acc + (curr.tasksCompleted || 0), 0);
  const totalCoding = Object.values(activityData).reduce((acc, curr) => acc + (curr.problemsSolved || 0), 0);
  const totalActiveMinutes = Object.values(activityData).reduce((acc, curr) => acc + (curr.activeMinutes || 0), 0);

  // Heatmap data (last 30 days)
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const activity = activityData[dateStr];
    const count = (activity?.tasksCompleted || 0) + (activity?.problemsSolved || 0);
    return { date: dateStr, count };
  });

  // Badge Filtering
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      if (filter === 'unlocked') return badge.unlocked;
      if (filter === 'locked') return !badge.unlocked;
      return true;
    });
  }, [badges, filter]);

  // Next Badge to Unlock (Lowest XP required among locked)
  const nextBadge = useMemo(() => {
    const locked = badges.filter(b => !b.unlocked);
    return locked.sort((a, b) => a.xpRequired - b.xpRequired)[0];
  }, [badges]);

  const handleStartChallenge = (id: string) => {
    dispatch({ type: 'START_CHALLENGE', payload: id });
  };

  return (
    <div className="space-y-6">
      {/* Level Progress Section */}
      <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-2xl font-black uppercase">Level {xpSystem.currentLevel}</h3>
              <p className="text-sm opacity-70">Next Level: {xpSystem.currentXP} / {xpSystem.xpToNextLevel} XP</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold uppercase text-green-500">
                {Math.floor((xpSystem.currentXP / xpSystem.xpToNextLevel) * 100)}% Complete
              </div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 border-2 border-black relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(xpSystem.currentXP / xpSystem.xpToNextLevel) * 100}%` }}
              className="h-full bg-yellow-400 relative"
            >
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMEgwTDQwIDQwVjB6IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-sm">
              <Activity className="h-5 w-5 text-blue-500" /> Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
                {heatmapData.map((day, i) => (
                  <div 
                    key={i}
                    title={`${day.date}: ${day.count} activities`}
                    className={`w-4 h-4 border border-black transition-colors duration-200 hover:scale-110 ${
                      day.count === 0 ? (darkMode ? 'bg-zinc-800' : 'bg-gray-100') :
                      day.count < 3 ? 'bg-green-200' :
                      day.count < 5 ? 'bg-green-400' :
                      'bg-green-600'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs font-mono opacity-70">
                <span>30 Days Ago</span>
                <span>Today</span>
              </div>
              
              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-dashed border-gray-500">
                <div className="text-center">
                  <div className="text-[10px] uppercase">Streak</div>
                  <div className="font-bold">{timeBasedStreak.currentStreak} 🔥</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase">Tasks</div>
                  <div className="font-bold">{totalTasks} ✅</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase">Coding</div>
                  <div className="font-bold">{totalCoding} 💻</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase">Hours</div>
                  <div className="font-bold">{(totalActiveMinutes / 60).toFixed(1)} ⏱️</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-sm">
              <Zap className="h-5 w-5 text-yellow-500" /> Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-center">
            {nextBadge ? (
              <div className="flex items-center gap-4">
                <div className={`p-4 border-2 border-black ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'} grayscale opacity-70`}>
                  <div className="text-4xl">{nextBadge.icon}</div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-bold uppercase">{nextBadge.name}</div>
                  <div className="text-xs opacity-70">{nextBadge.description}</div>
                  <div className="text-xs font-mono bg-yellow-200 text-black px-1 inline-block border border-black">
                    Requires {nextBadge.xpRequired} XP
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl">🏆</div>
                <div className="font-bold">All Badges Unlocked!</div>
                <div className="text-xs opacity-70">You are a legend.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Active Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase flex items-center gap-2">
          <Target className="text-red-500" /> Active Challenges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(challenge => (
            <Card key={challenge.id} variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold uppercase">{challenge.title}</h4>
                  <span className={`text-xs px-2 py-0.5 border border-black font-bold ${
                    challenge.difficulty === 'Easy' ? 'bg-green-200 text-black' :
                    challenge.difficulty === 'Medium' ? 'bg-yellow-200 text-black' :
                    'bg-red-200 text-black'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-xs opacity-70 mb-4 h-10 line-clamp-2">{challenge.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Progress</span>
                    <span>{Math.round((challenge.progress / challenge.maxProgress) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 border border-black relative">
                    <div 
                      className="h-full bg-blue-500 absolute top-0 left-0"
                      style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    +{challenge.xpReward} XP
                  </div>
                  {challenge.status === 'not-started' ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartChallenge(challenge.id)}
                      className="h-7 text-xs"
                    >
                      Start Challenge
                    </Button>
                  ) : (
                     <span className="text-xs font-bold text-blue-500 uppercase">
                       {challenge.status}
                     </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
        <CardHeader className="flex flex-row items-center justify-between border-b-2 border-black pb-2">
          <CardTitle className="flex items-center gap-2 uppercase text-sm">
            <Trophy className="h-5 w-5 text-yellow-500" /> Badges ({filteredBadges.length})
          </CardTitle>
          
          <div className="flex gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] uppercase px-2 py-1 border border-black font-bold transition-all ${
                  filter === f 
                    ? 'bg-black text-white' 
                    : (darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:bg-gray-100')
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredBadges.map((badge) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={badge.id}
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-4 border-2 border-black flex flex-col items-center text-center gap-2 group ${
                    badge.unlocked 
                      ? (darkMode ? 'bg-zinc-800' : 'bg-white') 
                      : (darkMode ? 'bg-zinc-950 opacity-50' : 'bg-gray-100 opacity-50')
                  }`}
                >
                  <div className={`text-3xl transition-all duration-300 ${!badge.unlocked && 'grayscale group-hover:grayscale-0 group-hover:opacity-70'}`}>
                    {badge.icon}
                  </div>
                  <div className="text-xs font-bold uppercase leading-tight">{badge.name}</div>
                  
                  {/* Badge Rarity Tag */}
                  <div className={`text-[10px] uppercase px-1 border border-black ${
                    badge.rarity === 'bronze' ? 'bg-orange-300' :
                    badge.rarity === 'silver' ? 'bg-gray-300' :
                    badge.rarity === 'gold' ? 'bg-yellow-300' :
                    'bg-purple-300'
                  }`}>
                    {badge.rarity}
                  </div>

                  {/* Lock Icon for locked badges */}
                  {!badge.unlocked && (
                    <div className="absolute top-2 right-2 opacity-50">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {filteredBadges.length === 0 && (
            <div className="text-center py-10 opacity-50 font-mono text-sm">
              No badges found in this category.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
