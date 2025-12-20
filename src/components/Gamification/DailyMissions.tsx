import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, Zap, Trophy, Flame } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

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
  const { tasks, codingStats, user } = state;
  
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
      case 'epic': return 'border-purple-400 bg-purple-900/20';
      case 'rare': return 'border-blue-400 bg-blue-900/20';
      default: return 'border-gray-400 bg-gray-800/20';
    }
  };

  return (
    <div className="brutal-card bg-gray-900 border-orange-500/30 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <Target className="text-orange-400" size={20} />
          Daily Missions
        </h3>
        <div className="text-right">
          <div className="text-sm font-bold text-orange-400">{completedMissions}/{missions.length}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-4 p-3 bg-gray-800 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Daily Progress</span>
          <span className="text-xs text-lime-400 font-bold">{Math.floor((completedMissions / missions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedMissions / missions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">Total Rewards</span>
          <span className="text-lime-400 font-bold">+{totalRewards} XP & Coins</span>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 border-2 ${getRarityColor(mission.rarity)} ${
              mission.completed ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{mission.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold text-sm ${mission.completed ? 'text-lime-400' : 'text-white'}`}>
                    {mission.title}
                  </h4>
                  {mission.completed && (
                    <CheckCircle className="text-lime-400" size={16} />
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{mission.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-500">{mission.progress}/{mission.target}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-lime-400 flex items-center gap-1">
                        <Zap size={10} /> {mission.xpReward} XP
                      </span>
                      <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                        💰 {mission.coinReward}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                      className={`h-full ${
                        mission.completed ? 'bg-lime-500' : 'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Time Left */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock size={10} />
                    <span>{mission.timeLeft} left</span>
                  </div>
                  {mission.completed && (
                    claimedMissions.has(mission.id) ? (
                      <CheckCircle size={16} className="text-lime-400" />
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => claimReward(mission)}
                        className="px-3 py-1 bg-lime-500 text-black text-xs font-bold border-2 border-black"
                      >
                        CLAIM
                      </motion.button>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Daily Reset Timer */}
      <div className="mt-4 p-3 bg-gray-800 border border-gray-700 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          <span>New missions in <span className="text-lime-400 font-bold">12h 30m</span></span>
        </div>
      </div>
    </div>
  );
}

