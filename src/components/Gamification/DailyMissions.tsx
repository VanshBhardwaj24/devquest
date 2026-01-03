import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle, Zap, Crosshair } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from 'recharts';

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
  const { tasks, codingStats, user, darkMode, skills } = state;
  
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const codingProblems = (codingStats?.easyCount || 0) + (codingStats?.mediumCount || 0) + (codingStats?.hardCount || 0);

  const missions: Mission[] = useMemo(() => {
    const baseMissions: Mission[] = [
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
      icon: '🚀',
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
    }
  ];

    // Dynamic Skill Mission
    if (skills && skills.length > 0) {
      // Find a focus skill (lowest level not maxed)
      const focusSkill = [...skills]
        .sort((a, b) => a.level - b.level)
        .find(s => (s.maxLevel ? s.level < s.maxLevel : true));

      if (focusSkill) {
        const today = new Date().toLocaleDateString('en-CA');
        const relevantTasks = tasks ? tasks.filter(t => 
            t.completed && 
            t.relatedSkillId === focusSkill.id && 
            new Date(t.completedAt || '').toLocaleDateString('en-CA') === today
        ) : [];

        baseMissions.push({
          id: 'skill-focus',
          title: `Train ${focusSkill.name}`,
          description: `Complete a task related to ${focusSkill.name}`,
          type: 'special',
          progress: Math.min(relevantTasks.length, 1),
          target: 1,
          xpReward: 200,
          coinReward: 100,
          timeLeft: '12h 30m',
          completed: relevantTasks.length >= 1,
          icon: focusSkill.icon || '🧠',
          rarity: 'epic'
        });
      }
    }

    return baseMissions;
  }, [completedTasks, codingProblems, streak, tasks, skills]);

  const completedMissions = missions.filter(m => m.completed).length;
  const totalRewards = missions.filter(m => m.completed).reduce((sum, m) => sum + m.xpReward + m.coinReward, 0);
  const overviewSpark = missions.map((m, i) => ({ name: i, pct: Math.round((m.progress / m.target) * 100) }));

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

  return (
    <Card variant="cyber" className="overflow-hidden">
      <CardHeader className="bg-black/40 border-b border-white/5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase text-gray-400 flex items-center gap-2">
            <Crosshair className="text-neon-pink" size={16} />
            Daily Objectives
          </CardTitle>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-neon-blue text-neon-blue bg-neon-blue/10">
               {completedMissions}/{missions.length} Complete
             </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Progress Overview */}
        <div className="p-4 bg-black/60 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mission Progress</span>
            <span className="text-xs font-mono text-neon-blue">{Math.floor((completedMissions / missions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedMissions / missions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-neon-pink to-neon-blue shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
             <div className="text-[10px] text-gray-500 uppercase">Rewards Earned</div>
             <div className="text-xs font-mono font-bold text-neon-yellow">+{totalRewards} XP/Coins</div>
          </div>
        </div>

        {/* Missions List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`group p-3 border rounded-lg transition-all ${
                mission.completed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-black/40 border-white/5 hover:border-neon-purple/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-xl p-2 rounded-lg bg-black/50 border border-white/10 ${mission.completed ? 'grayscale opacity-50' : ''}`}>
                  {mission.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-sm font-cyber uppercase ${mission.completed ? 'text-green-400 line-through decoration-green-500/50' : 'text-white group-hover:text-neon-purple transition-colors'}`}>
                      {mission.title}
                    </h4>
                    {mission.completed && (
                      <CheckCircle className="text-green-500" size={14} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-mono">{mission.description}</p>
                  
                  {/* Progress Bar */}
                  {!mission.completed && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-mono">{mission.progress}/{mission.target}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          className="h-full bg-neon-purple"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-purple-500/30 text-purple-400 bg-purple-500/10">
                        +{mission.xpReward} XP
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
                        +{mission.coinReward} G
                      </Badge>
                    </div>

                    {mission.completed && !claimedMissions.has(mission.id) && (
                      <Button
                        variant="neon"
                        size="sm"
                        onClick={() => claimReward(mission)}
                        className="h-6 text-[10px] px-3"
                      >
                        CLAIM
                      </Button>
                    )}
                    {claimedMissions.has(mission.id) && (
                      <span className="text-[10px] text-gray-500 font-mono uppercase">Claimed</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
