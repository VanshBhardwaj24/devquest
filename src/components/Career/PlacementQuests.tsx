import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { Trophy, Clock, Calendar, AlertTriangle, Flame, Star, Sword, Gem, Crown } from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

type Recurrence = 'daily' | 'weekly' | 'monthly' | 'one-off';
type Difficulty = 'easy' | 'medium' | 'hard' | 'elite' | 'boss';
type Category = 'technical' | 'soft-skills' | 'portfolio' | 'networking' | 'interview' | 'application';

interface QuestStreak {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

interface QuestAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  effect: 'xp_boost' | 'streak_protect' | 'instant_complete' | 'time_freeze';
  duration: number;
  uses: number;
  active: boolean;
  expiresAt?: string;
}

type Quest = {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  timeMinutes?: number;
  recurrence: Recurrence;
  difficulty: Difficulty;
  category: Category;
  lastCompletedAt?: string | null;
  overdue?: boolean;
  completedCount?: number;
  isBossQuest?: boolean;
  requiredStreak?: number;
  prerequisites?: string[];
  bonusXP?: number;
  comboMultiplier?: number;
  penaltyApplied?: number;
  lastPenaltyDate?: string | null;
};

const DEFAULT_QUESTS: Quest[] = [
  // Daily Technical Quests
  { id: 'daily:dsa', title: 'Practice DSA (1h)', description: 'Solve algorithmic problems and sharpen your problem-solving skills', xpReward: 25, timeMinutes: 60, recurrence: 'daily', difficulty: 'medium', category: 'technical', completedCount: 0 },
  { id: 'daily:git', title: 'Meaningful GitHub commit', description: 'Make a significant contribution to any project', xpReward: 10, timeMinutes: 15, recurrence: 'daily', difficulty: 'easy', category: 'technical', completedCount: 0 },
  { id: 'daily:leetcode', title: 'LeetCode Challenge', description: 'Complete a medium/hard problem on LeetCode', xpReward: 30, timeMinutes: 45, recurrence: 'daily', difficulty: 'hard', category: 'technical', completedCount: 0 },
  
  // Daily Soft Skills
  { id: 'daily:networking', title: 'Professional Networking', description: 'Connect with 2 professionals on LinkedIn', xpReward: 15, timeMinutes: 20, recurrence: 'daily', difficulty: 'easy', category: 'networking', completedCount: 0 },
  { id: 'daily:resume', title: 'Resume Enhancement', description: 'Update or improve one section of your resume', xpReward: 20, timeMinutes: 30, recurrence: 'daily', difficulty: 'medium', category: 'application', completedCount: 0 },
  
  // Weekly Quests
  { id: 'weekly:project', title: 'Weekly Project Milestone', description: 'Complete a significant milestone in your project', xpReward: 120, timeMinutes: 240, recurrence: 'weekly', difficulty: 'hard', category: 'portfolio', completedCount: 0 },
  { id: 'weekly:mock', title: 'Mock Interview Session', description: 'Complete a full mock interview with feedback', xpReward: 150, timeMinutes: 90, recurrence: 'weekly', difficulty: 'hard', category: 'interview', completedCount: 0 },
  { id: 'weekly:blog', title: 'Technical Blog Post', description: 'Write and publish a technical blog post', xpReward: 100, timeMinutes: 180, recurrence: 'weekly', difficulty: 'medium', category: 'portfolio', completedCount: 0 },
  
  // Monthly Quests
  { id: 'monthly:deploy', title: 'Monthly Deploy & Demo', description: 'Deploy a project and create a demo video', xpReward: 350, timeMinutes: 480, recurrence: 'monthly', difficulty: 'elite', category: 'portfolio', completedCount: 0, isBossQuest: true },
  { id: 'monthly:hackathon', title: 'Hackathon Participation', description: 'Participate in a hackathon or coding competition', xpReward: 300, timeMinutes: 720, recurrence: 'monthly', difficulty: 'elite', category: 'technical', completedCount: 0, isBossQuest: true },
  
  // Boss Quests
  { id: 'boss:placement', title: 'Placement Boss Quest', description: 'Secure a job offer from your dream company', xpReward: 1000, timeMinutes: 2880, recurrence: 'one-off', difficulty: 'boss', category: 'application', isBossQuest: true, requiredStreak: 30, bonusXP: 500, comboMultiplier: 3 },
  { id: 'boss:faang', title: 'FAANG Challenge', description: 'Get an interview at a FAANG company', xpReward: 750, timeMinutes: 1440, recurrence: 'one-off', difficulty: 'boss', category: 'interview', isBossQuest: true, requiredStreak: 21, bonusXP: 250, comboMultiplier: 2.5 },
];

const DEFAULT_ACHIEVEMENTS: QuestAchievement[] = [
  { id: 'first_quest', title: 'Quest Beginner', description: 'Complete your first quest', icon: <Star className="h-4 w-4" />, unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'week_streak', title: 'Week Warrior', description: 'Maintain a 7-day quest streak', icon: <Flame className="h-4 w-4" />, unlocked: false, progress: 0, maxProgress: 7 },
  { id: 'month_streak', title: 'Monthly Master', description: 'Maintain a 30-day quest streak', icon: <Crown className="h-4 w-4" />, unlocked: false, progress: 0, maxProgress: 30 },
  { id: 'boss_slayer', title: 'Boss Slayer', description: 'Complete 5 boss quests', icon: <Sword className="h-4 w-4" />, unlocked: false, progress: 0, maxProgress: 5 },
  { id: 'xp_collector', title: 'XP Collector', description: 'Earn 5000 XP from quests', icon: <Gem className="h-4 w-4" />, unlocked: false, progress: 0, maxProgress: 5000 },
];

const DEFAULT_POWER_UPS: PowerUp[] = [
  { id: 'xp_boost', name: 'XP Boost', description: '2x XP for next quest completion', effect: 'xp_boost', duration: 1, uses: 3, active: false },
  { id: 'streak_protect', name: 'Streak Shield', description: 'Protects your streak for one missed day', effect: 'streak_protect', duration: 24, uses: 2, active: false },
  { id: 'instant_complete', name: 'Instant Complete', description: 'Instantly complete one daily quest', effect: 'instant_complete', duration: 0, uses: 1, active: false },
];

export function PlacementQuests() {
  const { state, dispatch } = useApp();
  const { darkMode } = state;

  const now = useMemo(() => new Date(), []);

  const key = 'placement_quests_v2';
  const streakKey = 'quest_streak_v1';
  const achievementsKey = 'quest_achievements_v1';
  const powerUpsKey = 'quest_powerups_v1';
  
  const [quests, setQuests] = useState<Quest[]>(() => getLocalStorage<Quest[]>(key, DEFAULT_QUESTS));
  const [streak, setStreak] = useState<QuestStreak>(() => getLocalStorage<QuestStreak>(streakKey, { current: 0, best: 0, lastCompletedDate: null }));
  const [achievements, setAchievements] = useState<QuestAchievement[]>(() => getLocalStorage<QuestAchievement[]>(achievementsKey, DEFAULT_ACHIEVEMENTS));
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => getLocalStorage<PowerUp[]>(powerUpsKey, DEFAULT_POWER_UPS));

  useEffect(() => setLocalStorage(key, quests), [quests]);
  useEffect(() => setLocalStorage(streakKey, streak), [streak]);
  useEffect(() => setLocalStorage(achievementsKey, achievements), [achievements]);
  useEffect(() => setLocalStorage(powerUpsKey, powerUps), [powerUps]);

  // Helper functions for gamification
  const getDifficultyMultiplier = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy': return 0.8;
      case 'medium': return 1;
      case 'hard': return 1.5;
      case 'elite': return 2;
      case 'boss': return 3;
      default: return 1;
    }
  };

  const isDue = useCallback((q: Quest) => {
    if (!q.lastCompletedAt) return true;
    const last = new Date(q.lastCompletedAt);
    if (q.recurrence === 'daily') return last.toDateString() !== now.toDateString();
    if (q.recurrence === 'weekly') {
      const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
      return last < oneWeekAgo;
    }
    if (q.recurrence === 'monthly') return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
    return !q.lastCompletedAt;
  }, [now]);

  const complete = (id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, lastCompletedAt: new Date().toISOString(), overdue: false } : q));
    const q = quests.find(x => x.id === id);
    if (q) dispatch({ type: 'ADD_XP', payload: { amount: q.xpReward, source: `Quest: ${q.title}` } });
  };

  const applyPenalties = useCallback(() => {
    // Individual penalties per overdue quest with difficulty multipliers
    let totalPenalty = 0;
    const penaltyDetails: Array<{questId: string; questTitle: string; penalty: number; difficulty: Difficulty}> = [];
    
    const updated = quests.map(q => {
      if (q.recurrence === 'one-off') return q;
      if (isDue(q)) {
        const multiplier = getDifficultyMultiplier(q.difficulty);
        const basePenalty = Math.ceil(q.xpReward * 0.15); // Reduced from 0.2 to 0.15
        const penalty = Math.ceil(basePenalty * multiplier);
        totalPenalty += penalty;
        
        // Only apply penalty if not already applied today
        const lastPenaltyDate = q.lastPenaltyDate ? new Date(q.lastPenaltyDate).toDateString() : null;
        const today = new Date().toDateString();
        
        if (lastPenaltyDate !== today) {
          penaltyDetails.push({
            questId: q.id,
            questTitle: q.title,
            penalty,
            difficulty: q.difficulty
          });
          
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: { 
              id: Date.now().toString(),
              type: 'mission',
              title: 'Quest Overdue',
              message: `-${penalty} XP penalty for overdue ${q.title} (${q.difficulty} difficulty)`,
              timestamp: new Date(),
              priority: 'medium'
            } 
          });
          
          return { ...q, overdue: true, penaltyApplied: penalty, lastPenaltyDate: new Date().toISOString() };
        }
        
        return { ...q, overdue: true };
      }
      return { ...q, overdue: false, penaltyApplied: 0 };
    });
    
    if (totalPenalty > 0) {
      // Apply penalty with proper source tracking
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: -totalPenalty, 
          source: 'Overdue Quests Penalty',
          multiplier: 1 
        } 
      });
      
      // Track penalty analytics
      dispatch({
        type: 'UPDATE_STATS',
        payload: { 
          totalPenalties: (state.careerStats.totalPenalties || 0) + totalPenalty,
          overdueQuests: (state.careerStats.overdueQuests || 0) + penaltyDetails.length
        }
      });
      
      // Log penalty details for analytics
      console.log('Penalty Details Applied:', {
        totalPenalty,
        penaltyCount: penaltyDetails.length,
        details: penaltyDetails,
        timestamp: new Date().toISOString()
      });
    }
    
    setQuests(updated);
  }, [quests, dispatch, state.careerStats.totalPenalties, state.careerStats.overdueQuests, isDue]);

  // auto-check daily rollover (minute resolution)
  useEffect(() => {
    const lastCheckKey = 'placement_quests_last_check_v1';
    const tick = () => {
      const last = getLocalStorage<string>(lastCheckKey, '');
      const nowS = new Date().toISOString();
      if (!last) {
        setLocalStorage(lastCheckKey, nowS);
        return;
      }
      const lastDate = new Date(last);
      if (lastDate.toDateString() !== new Date().toDateString()) {
        // day changed
        applyPenalties();
      }
      setLocalStorage(lastCheckKey, nowS);
    };
    tick();
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, [quests, applyPenalties]);

  const daily = useMemo(() => quests.filter(q => q.recurrence === 'daily'), [quests]);
  const weekly = useMemo(() => quests.filter(q => q.recurrence === 'weekly'), [quests]);
  const monthly = useMemo(() => quests.filter(q => q.recurrence === 'monthly'), [quests]);
  const categoryChartData = useMemo(() => {
    const categories: Category[] = ['technical','soft-skills','portfolio','networking','interview','application'];
    return categories.map(c => {
      const all = quests.filter(q => q.category === c).length;
      const due = quests.filter(q => q.category === c && isDue(q)).length;
      return { name: c, due, total: all };
    });
  }, [quests, isDue]);
  const completionTimelineData = useMemo(() => {
    const map: Record<string, number> = {};
    quests.forEach(q => {
      if (q.lastCompletedAt) {
        const d = new Date(q.lastCompletedAt);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[key] = (map[key] || 0) + 1;
      }
    });
    const keys = Object.keys(map);
    keys.sort((a, b) => {
      const da = new Date(a);
      const db = new Date(b);
      return da.getTime() - db.getTime();
    });
    return keys.map(k => ({ name: k, count: map[k] }));
  }, [quests]);
  const difficultyChartData = useMemo(() => {
    const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'elite', 'boss'];
    return diffs.map(d => ({ name: d, value: quests.filter(q => q.difficulty === d).length }));
  }, [quests]);
  const pieColors = ['#22d3ee','#84cc16','#ef4444','#f59e0b','#a855f7'];
  const today = new Date();
  const sameDay = (d: Date) => d.toDateString() === today.toDateString();
  const sameMonth = (d: Date) => d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  const weekBounds = (() => {
    const start = new Date(today); const day = start.getDay(); const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    return { start, end };
  })();
  const inWeek = (d: Date) => d >= weekBounds.start && d <= weekBounds.end;
  const dailyCompleted = daily.filter(q => q.lastCompletedAt && sameDay(new Date(q.lastCompletedAt))).length;
  const weeklyCompleted = weekly.filter(q => q.lastCompletedAt && inWeek(new Date(q.lastCompletedAt as string))).length;
  const monthlyCompleted = monthly.filter(q => q.lastCompletedAt && sameMonth(new Date(q.lastCompletedAt))).length;
  const dailyPct = daily.length ? Math.round((dailyCompleted / daily.length) * 100) : 0;
  const weeklyPct = weekly.length ? Math.round((weeklyCompleted / weekly.length) * 100) : 0;
  const monthlyPct = monthly.length ? Math.round((monthlyCompleted / monthly.length) * 100) : 0;

  return (
    <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-mono uppercase">Placement <span className="text-orange-500">Quests</span></h1>
            <p className="text-sm opacity-70">Focused daily/weekly/monthly placement quests — complete to earn XP. Missed quests incur penalties at day rollover.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={applyPenalties} className="border-2 border-black"><AlertTriangle className="mr-2" />Apply Penalties</Button>
            <Button onClick={() => { setQuests(DEFAULT_QUESTS); setLocalStorage(key, DEFAULT_QUESTS); }} className="border-2 border-black">Reset Defaults</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ label: 'Daily', pct: dailyPct, total: daily.length }, { label: 'Weekly', pct: weeklyPct, total: weekly.length }, { label: 'Monthly', pct: monthlyPct, total: monthly.length }].map((x, i) => (
            <Card key={i} className="rounded-none">
              <CardHeader className="p-3 border-b-2 border-black">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black uppercase">{x.label} Progress</CardTitle>
                  <div className="text-sm opacity-70">{x.total} quests</div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-2 bg-gray-800 border-2 border-gray-700">
                  <div className="h-full bg-lime-500" style={{ width: `${x.pct}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-none">
            <CardHeader className="p-3 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase">Categories</CardTitle>
                <div className="text-sm opacity-70">Due vs Total</div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <XAxis dataKey="name" stroke={darkMode ? '#888' : '#444'} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
                    <Legend />
                    <Bar dataKey="due" name="Due" fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar dataKey="total" name="Total" fill="#84cc16" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-none">
            <CardHeader className="p-3 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase">Completions</CardTitle>
                <div className="text-sm opacity-70">Timeline</div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completionTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#222' : '#ddd'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#888' : '#444'} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Completed" stroke="#f59e0b" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader className="p-3 border-b-2 border-black">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase">Difficulty Mix</CardTitle>
                <div className="text-sm opacity-70">{quests.length} total</div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={difficultyChartData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {difficultyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke={darkMode ? '#111' : '#fff'} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ title: 'Daily', list: daily, icon: Calendar }, { title: 'Weekly', list: weekly, icon: Clock }, { title: 'Monthly', list: monthly, icon: Trophy }].map((col) => (
            <Card key={col.title} className="rounded-none">
              <CardHeader className="p-3 border-b-2 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><col.icon className="h-4 w-4" /> <CardTitle className="text-lg font-black uppercase">{col.title}</CardTitle></div>
                  <div className="text-sm opacity-70">{col.list.length} quests</div>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {(() => {
                  const now = new Date();
                  const lastNDays = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(now); d.setDate(now.getDate() - (6 - i));
                    const key = d.toDateString();
                    const count = col.list.filter(q => q.lastCompletedAt && new Date(q.lastCompletedAt).toDateString() === key).length;
                    return { name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count };
                  });
                  const dueCount = col.list.filter(q => isDue(q)).length;
                  return (
                    <div className="p-2 border-2 border-black">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-mono">Due: {dueCount}</div>
                        <div className="text-xs font-mono">{col.list.length} total</div>
                      </div>
                      <div style={{ height: 60 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lastNDays}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#222' : '#ddd'} />
                            <XAxis dataKey="name" stroke={darkMode ? '#888' : '#444'} tickLine={false} axisLine={false} hide />
                            <Tooltip contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', borderRadius: 0, fontFamily: 'monospace' }} />
                            <Line type="monotone" dataKey="count" name="Completed" stroke="#10b981" dot={false} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
                {col.list.map(q => (
                  <div key={q.id} className={`p-3 border-2 ${q.overdue ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-black'} flex items-center justify-between`}> 
                    <div>
                      <div className="font-bold font-mono">{q.title}</div>
                      <div className="text-xs opacity-70">{q.description || `${q.timeMinutes || 0} min • ${q.xpReward} XP`}</div>
                      {q.lastCompletedAt && <div className="text-[10px] opacity-60">Last: {new Date(q.lastCompletedAt).toLocaleString()}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">{q.xpReward} XP</div>
                      <Button onClick={() => complete(q.id)} className="border-2 border-black">Complete</Button>
                    </div>
                  </div>
                ))}
                {col.list.length === 0 && <div className="text-sm opacity-60">No quests.</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlacementQuests;
