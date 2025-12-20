import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, Zap, Trophy, Flame } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'coding' | 'streak' | 'social' | 'special';
  progress: number;
  target: number;
  xpReward: number;
  coinReward: number;
  timeLeft: string;
  completed: boolean;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
}

export function DailyMissions() {
  const { state, dispatch } = useApp();
  const { tasks, codingStats, user, darkMode } = state;
  
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const codingProblems = (codingStats?.easyCount || 0) + (codingStats?.mediumCount || 0) + (codingStats?.hardCount || 0);

  const missions: Mission[] = useMemo(() => [
    {
      id: '1',
      title: 'Complete 3 Tasks',
      description: 'Finish 3 tasks today',
      type: 'task',
      progress: Math.min(completedTasks, 3),
      target: 3,
      xpReward: 100,
      coinReward: 50,
      timeLeft: '12h 30m',
      completed: completedTasks >= 3,
      icon: '✅',
      rarity: 'common',
    },
    {
      id: '2',
      title: 'Solve 2 Coding Problems',
      description: 'Complete 2 coding challenges',
      type: 'coding',
      progress: Math.min(codingProblems % 2, 2),
      target: 2,
      xpReward: 150,
      coinReward: 75,
      timeLeft: '12h 30m',
      completed: (codingProblems % 2) === 0 && codingProblems >= 2,
      icon: '💻',
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Maintain Streak',
      description: 'Keep your streak alive',
      type: 'streak',
      progress: streak > 0 ? 1 : 0,
      target: 1,
      xpReward: 50 + streak * 10,
      coinReward: 25 + streak * 5,
      timeLeft: '12h 30m',
      completed: streak > 0,
      icon: '🔥',
      rarity: 'common',
    },
    {
      id: '4',
      title: 'Complete 5 Tasks',
      description: 'Finish 5 tasks today',
      type: 'task',
      progress: Math.min(completedTasks, 5),
      target: 5,
      xpReward: 250,
      coinReward: 125,
      timeLeft: '12h 30m',
      completed: completedTasks >= 5,
      icon: '🎯',
      rarity: 'rare',
    },
    {
      id: '5',
      title: 'Solve 5 Coding Problems',
      description: 'Complete 5 coding challenges',
      type: 'coding',
      progress: Math.min(codingProblems % 5, 5),
      target: 5,
      xpReward: 500,
      coinReward: 250,
      timeLeft: '12h 30m',
      completed: (codingProblems % 5) === 0 && codingProblems >= 5,
      icon: '⚔️',
      rarity: 'epic',
    },
    {
      id: '6',
      title: '7-Day Streak',
      description: 'Maintain a 7-day streak',
      type: 'streak',
      progress: Math.min(streak, 7),
      target: 7,
      xpReward: 1000,
      coinReward: 500,
      timeLeft: '12h 30m',
      completed: streak >= 7,
      icon: '👑',
      rarity: 'epic',
    },
  ], [completedTasks, codingProblems, streak]);

  const completedMissions = missions.filter(m => m.completed).length;
  const totalRewards = missions.filter(m => m.completed).reduce((sum, m) => sum + m.xpReward + m.coinReward, 0);

  const [claimedMissions, setClaimedMissions] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`claimedMissions_${today}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const claimReward = (mission: Mission) => {
    if (!mission.completed || claimedMissions.has(mission.id)) return;
    
    dispatch({ type: 'ADD_XP', payload: { amount: mission.xpReward, source: `Mission: ${mission.title}` } });
    
    const newClaimed = new Set(claimedMissions);
    newClaimed.add(mission.id);
    setClaimedMissions(newClaimed);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`claimedMissions_${today}`, JSON.stringify(Array.from(newClaimed)));
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: `🎉 Mission Complete!`,
        message: `Earned ${mission.xpReward} XP and ${mission.coinReward} coins!`,
        timestamp: new Date(),
        priority: mission.rarity === 'epic' ? 'high' : 'medium',
      },
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'epic': return 'bg-purple-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white';
    }
  };

  return (
    <Card variant="brutal" className={`p-4 sm:p-6 ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg sm:text-xl font-black flex items-center gap-2 uppercase ${darkMode ? 'text-white' : 'text-black'}`}>
          <Target className="text-red-500" size={20} />
          Daily Missions
        </h3>
        <div className="text-right">
          <div className="text-sm font-bold bg-red-500 text-white px-2 py-0.5 border border-black inline-block shadow-[2px_2px_0px_0px_#000]">{completedMissions}/{missions.length}</div>
          <div className="text-xs text-gray-500 mt-1 font-bold uppercase">Completed</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className={`mb-6 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${darkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase">Daily Progress</span>
          <span className="text-xs font-bold">{Math.floor((completedMissions / missions.length) * 100)}%</span>
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 border-2 border-black">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedMissions / missions.length) * 100}%` }}
            className="h-full bg-red-500"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold">
          <span className="uppercase opacity-70">Total Rewards</span>
          <span className="text-green-600 dark:text-green-400">+{totalRewards} XP & Coins</span>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] ${
              mission.completed 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : darkMode ? 'bg-zinc-800' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl border-2 border-black p-1 bg-white dark:bg-gray-700">{mission.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold text-sm uppercase ${mission.completed ? 'line-through opacity-70' : ''} ${darkMode ? 'text-white' : 'text-black'}`}>
                    {mission.title}
                  </h4>
                  {mission.completed && (
                    <CheckCircle className="text-green-500" size={16} />
                  )}
                </div>
                <p className="text-xs opacity-70 mb-2 font-mono">{mission.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold">{mission.progress}/{mission.target}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-200 text-purple-800 border border-black px-1 font-bold flex items-center gap-1">
                        <Zap size={10} /> {mission.xpReward} XP
                      </span>
                      <span className="text-[10px] bg-yellow-200 text-yellow-800 border border-black px-1 font-bold flex items-center gap-1">
                        💰 {mission.coinReward}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-700 border border-black">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                      className={`h-full ${
                        mission.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Time Left */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                    <Clock size={10} />
                    <span>{mission.timeLeft} left</span>
                  </div>
                  {mission.completed && (
                    claimedMissions.has(mission.id) ? (
                      <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 border border-black uppercase">Claimed</span>
                    ) : (
                      <Button
                        variant="brutal"
                        size="sm"
                        onClick={() => claimReward(mission)}
                        className="h-6 text-[10px] px-2 bg-yellow-400 hover:bg-yellow-500 border-black text-black"
                      >
                        CLAIM REWARD
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Reset Timer */}
      <div className={`mt-6 p-3 border-2 border-black text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
          <Clock size={12} />
          <span>New missions in <span className="text-red-500">12h 30m</span></span>
        </div>
      </div>
    </Card>
  );
}