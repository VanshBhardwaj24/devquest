import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useApp } from '../../contexts/AppContext';
import { Trophy, Clock, Calendar, RefreshCw, AlertTriangle, Flame, Star, Zap, Target, Shield, Sword, Gem, Crown, Sparkles, Medal, Award } from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  const key = 'placement_quests_v2';
  const streakKey = 'quest_streak_v1';
  const achievementsKey = 'quest_achievements_v1';
  const powerUpsKey = 'quest_powerups_v1';
  const statsKey = 'quest_stats_v1';
  
  const [quests, setQuests] = useState<Quest[]>(() => getLocalStorage<Quest[]>(key, DEFAULT_QUESTS));
  const [streak, setStreak] = useState<QuestStreak>(() => getLocalStorage<QuestStreak>(streakKey, { current: 0, best: 0, lastCompletedDate: null }));
  const [achievements, setAchievements] = useState<QuestAchievement[]>(() => getLocalStorage<QuestAchievement[]>(achievementsKey, DEFAULT_ACHIEVEMENTS));
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => getLocalStorage<PowerUp[]>(powerUpsKey, DEFAULT_POWER_UPS));
  const [totalXPEarned, setTotalXPEarned] = useState(() => getLocalStorage<number>(statsKey, 0));
  const [showAchievementModal, setShowAchievementModal] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);

  useEffect(() => setLocalStorage(key, quests), [quests]);
  useEffect(() => setLocalStorage(streakKey, streak), [streak]);
  useEffect(() => setLocalStorage(achievementsKey, achievements), [achievements]);
  useEffect(() => setLocalStorage(powerUpsKey, powerUps), [powerUps]);
  useEffect(() => setLocalStorage(statsKey, totalXPEarned), [totalXPEarned]);

  const now = new Date();

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

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-blue-500';
      case 'hard': return 'text-orange-500';
      case 'elite': return 'text-purple-500';
      case 'boss': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category: Category): React.ReactNode => {
    switch (category) {
      case 'technical': return <Target className="h-3 w-3" />;
      case 'soft-skills': return <Award className="h-3 w-3" />;
      case 'portfolio': return <Gem className="h-3 w-3" />;
      case 'networking': return <Users className="h-3 w-3" />;
      case 'interview': return <Shield className="h-3 w-3" />;
      case 'application': return <Briefcase className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const updateStreak = () => {
    const today = now.toDateString();
    const newStreak = { ...streak };
    
    if (streak.lastCompletedDate === today) {
      // Already completed today, increment combo
      setComboCount(prev => prev + 1);
    } else if (streak.lastCompletedDate === new Date(now.getTime() - 86400000).toDateString()) {
      // Yesterday was last completion, maintain streak
      newStreak.current += 1;
      setComboCount(1);
    } else {
      // Streak broken
      newStreak.current = 1;
      setComboCount(1);
    }
    
    newStreak.lastCompletedDate = today;
    if (newStreak.current > newStreak.best) {
      newStreak.best = newStreak.current;
    }
    
    setStreak(newStreak);
    return newStreak;
  };

  const checkAchievements = (newStreak: QuestStreak, xpGained: number, quest: Quest) => {
    const updatedAchievements = [...achievements];
    let newUnlocks: string[] = [];

    // Check first quest
    if (!updatedAchievements[0].unlocked && quest.completedCount === 1) {
      updatedAchievements[0] = { ...updatedAchievements[0], unlocked: true, unlockedAt: new Date().toISOString(), progress: 1 };
      newUnlocks.push(updatedAchievements[0].title);
    }

    // Check week streak
    if (!updatedAchievements[1].unlocked && newStreak.current >= 7) {
      updatedAchievements[1] = { ...updatedAchievements[1], unlocked: true, unlockedAt: new Date().toISOString(), progress: 7 };
      newUnlocks.push(updatedAchievements[1].title);
    }

    // Check month streak
    if (!updatedAchievements[2].unlocked && newStreak.current >= 30) {
      updatedAchievements[2] = { ...updatedAchievements[2], unlocked: true, unlockedAt: new Date().toISOString(), progress: 30 };
      newUnlocks.push(updatedAchievements[2].title);
    }

    // Update progress
    updatedAchievements[1].progress = Math.min(updatedAchievements[1].progress, newStreak.current);
    updatedAchievements[2].progress = Math.min(updatedAchievements[2].progress, newStreak.current);
    updatedAchievements[4].progress = Math.min(updatedAchievements[4].progress + xpGained, 5000);

    setAchievements(updatedAchievements);
    return newUnlocks;
  };

  const activatePowerUp = (powerUpId: string) => {
    const updatedPowerUps = powerUps.map(p => {
      if (p.id === powerUpId && p.uses > 0 && !p.active) {
        return { ...p, uses: p.uses - 1, active: true, expiresAt: new Date(Date.now() + p.duration * 3600000).toISOString() };
      }
      return p;
    });
    setPowerUps(updatedPowerUps);
  };

  const isDue = (q: Quest) => {
    if (!q.lastCompletedAt) return true;
    const last = new Date(q.lastCompletedAt);
    if (q.recurrence === 'daily') return last.toDateString() !== now.toDateString();
    if (q.recurrence === 'weekly') {
      const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
      return last < oneWeekAgo;
    }
    if (q.recurrence === 'monthly') return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
    return !q.lastCompletedAt;
  };

  const complete = (id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, lastCompletedAt: new Date().toISOString(), overdue: false } : q));
    const q = quests.find(x => x.id === id);
    if (q) dispatch({ type: 'ADD_XP', payload: { amount: q.xpReward, source: `Quest: ${q.title}` } });
  };

  const applyPenalties = () => {
    // Individual penalties per overdue quest with difficulty multipliers
    let totalPenalty = 0;
    const updated = quests.map(q => {
      if (q.recurrence === 'one-off') return q;
      if (isDue(q)) {
        const multiplier = getDifficultyMultiplier(q.difficulty);
        const basePenalty = Math.ceil(q.xpReward * 0.2);
        const penalty = Math.ceil(basePenalty * multiplier);
        totalPenalty += penalty;
        
        // Only apply penalty if not already applied today
        const lastPenaltyDate = q.lastPenaltyDate ? new Date(q.lastPenaltyDate).toDateString() : null;
        const today = new Date().toDateString();
        
        if (lastPenaltyDate !== today) {
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: { 
              id: Date.now().toString(),
              type: 'mission',
              title: 'Quest Overdue',
              message: `-${penalty} XP penalty for overdue ${q.title}`,
              timestamp: new Date()
            } 
          });
          
          return { ...q, overdue: true, penaltyApplied: penalty, lastPenaltyDate: new Date().toISOString() };
        }
        
        return { ...q, overdue: true };
      }
      return { ...q, overdue: false, penaltyApplied: 0 };
    });
    if (totalPenalty > 0) {
      dispatch({ type: 'ADD_XP', payload: { amount: -totalPenalty, source: 'Overdue Quests Penalty' } });
    }
    setQuests(updated);
  };

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
  }, [quests]);

  const daily = useMemo(() => quests.filter(q => q.recurrence === 'daily'), [quests]);
  const weekly = useMemo(() => quests.filter(q => q.recurrence === 'weekly'), [quests]);
  const monthly = useMemo(() => quests.filter(q => q.recurrence === 'monthly'), [quests]);

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
          {[{ title: 'Daily', list: daily, icon: Calendar }, { title: 'Weekly', list: weekly, icon: Clock }, { title: 'Monthly', list: monthly, icon: Trophy }].map((col) => (
            <Card key={col.title} className="rounded-none">
              <CardHeader className="p-3 border-b-2 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><col.icon className="h-4 w-4" /> <CardTitle className="text-lg font-black uppercase">{col.title}</CardTitle></div>
                  <div className="text-sm opacity-70">{col.list.length} quests</div>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
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
