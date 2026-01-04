import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { GraduationCap, CheckSquare, Target, Clock, ListChecks, Flame, AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { getLocalStorage, setLocalStorage } from '../../lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

let __sfxCtx: AudioContext | null = null;
const __getSfxCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!__sfxCtx) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    __sfxCtx = Ctx ? new Ctx() : null;
  }
  return __sfxCtx;
};

const __playNotes = (notes: Array<{ f: number; d: number; v?: number }>) => {
  const ctx = __getSfxCtx();
  if (!ctx) return;
  let t = ctx.currentTime;
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(n.v ?? 0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(t);
    osc.stop(t + n.d + 0.02);
    t += n.d * 0.9;
  }
};

const playCompletionSfx = () => {
  __playNotes([
    { f: 784, d: 0.09, v: 0.18 },
    { f: 988, d: 0.11, v: 0.2 },
    { f: 1319, d: 0.13, v: 0.22 },
  ]);
};

type ChecklistItem = {
  id: string;
  label: string;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high';
  custom?: boolean;
};

type QuestRecurrence = 'daily' | 'weekly' | 'monthly' | 'one-off';

type Quest = {
  id: string;
  title: string;
  xpReward: number;
  timeMinutes?: number;
  recurrence: QuestRecurrence;
  lastCompletedAt?: string | null; // ISO date
  overdue?: boolean;
  description?: string;
};

type ChecklistGroup = {
  id: string;
  title: string;
  items: ChecklistItem[];
};

const groups: ChecklistGroup[] = [
  {
    id: 'purpose',
    title: 'Video Purpose & Target Audience',
    items: [
      { id: 'for', label: 'For: Students committed to 8h/day for 3 months' },
      { id: 'tier', label: 'For: Tier 2/3 colleges or no placements' },
      { id: 'not-shortcuts', label: 'Not For: Shortcuts or trendy tech seekers' },
      { id: 'goal', label: 'Focus: Become an essential Full-Stack Developer' },
    ],
  },
  {
    id: 'philosophy',
    title: 'Core Philosophy: Proof of Work',
    items: [
      { id: 'proof', label: 'Build proof via projects, DSA problems, live links' },
      { id: 'profiles', label: 'Publish GitHub, LeetCode, deployed apps, social proof' },
    ],
  },
  {
    id: 'daily-plan',
    title: 'Daily Time Allocation (8h)',
    items: [
      { id: 'dsa-3h', label: '3h — Data Structures & Algorithms' },
      { id: 'project-3h', label: '3h — Project Development' },
      { id: 'core-1h', label: '1h — Core Subjects (OS, Networking, DB)' },
      { id: 'social-1h', label: '1h — Social Media (Build in Public)' },
    ],
  },
  {
    id: 'month1',
    title: 'Month 1: Foundation & Frontend',
    items: [
      { id: 'lang-one', label: 'Pick one language (recommended: JavaScript)' },
      { id: 'platform-one', label: 'Use one platform (recommended: LeetCode)' },
      { id: 'dsa-schedule', label: 'DSA: 2h morning, 1h evening + revision' },
      { id: 'dsa-easy', label: 'Solve 2–3 Easy problems daily (≤90 min/problem)' },
      { id: 'arrays', label: 'Arrays + Searching/Sorting (1 week)' },
      { id: 'recursion', label: 'Recursion (1 week)' },
      { id: 'strings', label: 'Strings (1 week)' },
      { id: 'linkedlists', label: 'Linked Lists (1 week)' },
      { id: 'dsa-target', label: 'Target: 60–90 problems by month-end' },
      { id: 'frontend-react', label: 'Build one React frontend project' },
      { id: 'features', label: 'Include API calls, state, conditional rendering' },
      { id: 'example', label: 'Example: Basic e-commerce product listing' },
      { id: 'build-public', label: 'Daily: Push to GitHub' },
      { id: 'post-progress', label: 'Daily: Post progress on LinkedIn/Twitter (15–20 min)' },
      { id: 'networks', label: 'Core Subjects: Weeks 1–2 — Computer Networks' },
      { id: 'os', label: 'Core Subjects: Weeks 3–4 — Operating Systems' },
      { id: 'interview-notes', label: 'Make interview-focused notes' },
      { id: 'social-block', label: 'Social Media: Restrict to 1h/day block' },
    ],
  },
  {
    id: 'month2',
    title: 'Month 2: Advanced DSA & Full-Stack',
    items: [
      { id: 'stacks-queues', label: 'Stacks & Queues (1 week)' },
      { id: 'binary-search', label: 'Binary Search (1 week)' },
      { id: 'two-pointers', label: 'Two Pointers (1 week)' },
      { id: 'trees', label: 'Trees (Binary Trees) (1 week)' },
      { id: 'dsa-150', label: 'Target: ~150 problems total by month-end' },
      { id: 'fullstack-stack', label: 'Build Full-Stack: Node, Express, MongoDB, React' },
      { id: 'backend-basics', label: 'Week 1: Server, API, routing' },
      { id: 'db', label: 'Week 2: MongoDB, queries, aggregation' },
      { id: 'auth-pay', label: 'Week 3: Auth (JWT/cookies), payment, email' },
      { id: 'deploy', label: 'Week 4: Deploy on AWS/free tier, domain & NGINX' },
      { id: 'live', label: 'Make the app live' },
      { id: 'public-continue', label: 'Continue daily build-in-public updates' },
      { id: 'project-theory', label: 'Core Subjects: Project theory Q&A' },
      { id: 'resume-polish', label: 'Polish Resume & LinkedIn with proof links' },
    ],
  },
  {
    id: 'month3',
    title: 'Month 3: Interview Prep & Advanced Topics',
    items: [
      { id: 'backtracking', label: 'Backtracking & Greedy (1 week)' },
      { id: 'bst-heaps', label: 'BST & Heaps (1 week)' },
      { id: 'dp', label: 'Dynamic Programming (classic problems) (1 week)' },
      { id: 'graphs', label: 'Graphs (classic problems) (1 week)' },
      { id: 'talk-solve', label: 'Practice talk-and-solve explanations' },
      { id: 'project-adv', label: 'Project: Add advanced features (WebSockets, GPT API)' },
      { id: 'project-comm', label: 'Prepare project theory & communication' },
      { id: 'apply-daily', label: 'Apply 1h/day on LinkedIn, Indeed, AngelList, Internshala' },
      { id: 'referrals', label: 'Ask alumni/seniors for referrals with proof' },
      { id: 'cold-outreach', label: 'Cold message HRs/founders of funded startups' },
      { id: 'drives', label: 'Use hiring drives, but do not rely solely' },
      { id: 'intro', label: 'Perfect self-introduction; record and practice' },
      { id: 'explain', label: 'Explain projects and DSA fluently' },
    ],
  },
  {
    id: 'habits',
    title: 'Critical Non-Negotiable Habits',
    items: [
      { id: 'public-daily', label: 'Build in Public: GitHub commits and social posts daily' },
      { id: 'consistency', label: 'Show up every day; no breaks' },
      { id: 'sleep-workout', label: 'Sleep 8–9h; workout 30–60 min' },
      { id: 'detox', label: 'Social detox: Uninstall Instagram; limit Twitter/LinkedIn to ≤1h/day' },
      { id: 'partner', label: 'Find a serious partner; avoid distractions' },
      { id: 'pledge', label: 'Public pledge to 90-day challenge for accountability' },
    ],
  },
  {
    id: 'outcomes',
    title: 'Final Motivation & Outcomes',
    items: [
      { id: 'dsa-200', label: '200+ DSA problems solved' },
      { id: 'projects-2', label: 'Two deployed projects: 1 Frontend, 1 Full-Stack' },
      { id: 'green-graph', label: 'Green GitHub graph; strong LeetCode profile' },
      { id: 'confidence', label: 'High confidence in technical and communication skills' },
      { id: 'interview-ready', label: 'Interview-ready for software developer roles' },
    ],
  },
];

export function PlacementChecklist() {
  const { state } = useApp();
  const { darkMode } = state;
  const storageKey = 'placement_prep_checks';
  const initial = useMemo(() => getLocalStorage<Record<string, boolean>>(storageKey, {}), []);
  const [checked, setChecked] = useState<Record<string, boolean>>(initial);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'sixmonth'>('daily');

  // Custom tasks storage (persisted separately)
  const customKey = 'placement_prep_custom_tasks';
  const initialCustom = useMemo(() => getLocalStorage<ChecklistItem[]>(customKey, []), []);
  const [customTasks, setCustomTasks] = useState<ChecklistItem[]>(initialCustom);

  // Streak tracking
  const streakKey = 'placement_prep_streak';
  const initialStreak = useMemo(() => getLocalStorage<{ current: number; longest: number; lastDate: string | null }>(streakKey, { current: 0, longest: 0, lastDate: null }), []);
  const [streak, setStreak] = useState(initialStreak);

  // Achievement badges
  const achievementsKey = 'placement_prep_achievements';
  const initialAchievements = useMemo(() => getLocalStorage<string[]>(achievementsKey, []), []);
  const [achievements, setAchievements] = useState<string[]>(initialAchievements);

  const [newLabel, setNewLabel] = useState('');
  const [newDue, setNewDue] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { dispatch } = useApp();

  // Quests
  const questsKey = 'placement_prep_quests';
  const defaultQuests: Quest[] = [
    { id: 'daily:practice-dsa', title: 'Practice DSA 1 hour', xpReward: 20, timeMinutes: 60, recurrence: 'daily', lastCompletedAt: null },
    { id: 'daily:git-commit', title: 'Push a meaningful GitHub commit', xpReward: 10, timeMinutes: 15, recurrence: 'daily', lastCompletedAt: null },
    { id: 'weekly:project-update', title: 'Weekly project milestone', xpReward: 100, timeMinutes: 240, recurrence: 'weekly', lastCompletedAt: null },
    { id: 'monthly:deploy', title: 'Monthly deploy & demo', xpReward: 300, timeMinutes: 480, recurrence: 'monthly', lastCompletedAt: null },
  ];
  const initialQuests = useMemo(() => getLocalStorage<Quest[]>(questsKey, defaultQuests), []);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);

  useEffect(() => {
    setLocalStorage(questsKey, quests);
  }, [quests]);

  // helper: determine if quest is due (not completed for its window)
  const isQuestDue = (q: Quest) => {
    if (!q.lastCompletedAt) return true;
    const last = new Date(q.lastCompletedAt);
    const now = new Date();
    if (q.recurrence === 'daily') return last.toDateString() !== now.toDateString();
    if (q.recurrence === 'weekly') {
      const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
      return last < oneWeekAgo;
    }
    if (q.recurrence === 'monthly') {
      return last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();
    }
    return !q.lastCompletedAt;
  };

  const completeQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id) return q;
      const nowIso = new Date().toISOString();
      // reward XP
      dispatch({ type: 'ADD_XP', payload: { amount: q.xpReward, source: `Quest: ${q.title}` } });
      playCompletionSfx();
      return { ...q, lastCompletedAt: nowIso, overdue: false };
    }));
  };

  const applyOverduePenalties = () => {
    // For quests that are overdue (due and not completed in their window), apply small penalty
    const now = new Date();
    let overduePenaltyTotal = 0;
    const updated = quests.map(q => {
      if (q.recurrence === 'one-off') return q;
      if (isQuestDue(q)) {
        // mark overdue and compute penalty: 20% of xpReward (rounded up)
        const penalty = Math.ceil(q.xpReward * 0.2);
        overduePenaltyTotal += penalty;
        return { ...q, overdue: true };
      }
      return { ...q, overdue: false };
    });
    if (overduePenaltyTotal > 0) {
      dispatch({ type: 'ADD_XP', payload: { amount: -overduePenaltyTotal, source: 'Overdue Quests Penalty' } });
      // optional: add a notification
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'mission', message: `-${overduePenaltyTotal} XP deducted for overdue quests` } });
    }
    setQuests(updated);
  };

  // schedule daily reset at midnight: check every minute for rollover
  useEffect(() => {
    const checkRollover = () => {
      const now = new Date();
      const lastCheck = getLocalStorage<string>('placement_quests_last_check', '');
      if (!lastCheck) {
        setLocalStorage('placement_quests_last_check', now.toISOString());
        return;
      }
      const last = new Date(lastCheck);
      if (last.toDateString() !== now.toDateString()) {
        // day changed -> apply overdue penalties and allow daily quests to reset (we keep lastCompletedAt but isQuestDue will show true if not today)
        applyOverduePenalties();
      }
      setLocalStorage('placement_quests_last_check', now.toISOString());
    };
    checkRollover();
    const id = window.setInterval(checkRollover, 60 * 1000);
    return () => window.clearInterval(id);
  }, [quests]);

  useEffect(() => {
    setLocalStorage(storageKey, checked);
  }, [checked]);

  useEffect(() => {
    setLocalStorage(customKey, customTasks);
  }, [customTasks]);

  const toggle = (id: string) => {
    const wasChecked = checked[id];
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    
    // Gamification: Award XP for completing tasks
    if (!wasChecked) {
      const xpReward = 5; // Base XP for each completed task
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: xpReward, 
          source: '90-Day Plan Task' 
        } 
      });
      
      // Update streak
      const today = new Date().toDateString();
      const newStreak = streak.lastDate === today ? streak.current : 
                       streak.lastDate === new Date(Date.now() - 86400000).toDateString() ? streak.current + 1 : 1;
      
      const updatedStreak = {
        current: newStreak,
        longest: Math.max(newStreak, streak.longest),
        lastDate: today
      };
      setStreak(updatedStreak);
      setLocalStorage(streakKey, updatedStreak);
      
      // Check achievements
      const totalChecked = Object.keys(checked).filter(k => checked[k]).length + 1;
      const newAchievements = [...achievements];
      
      if (totalChecked === 10 && !achievements.includes('first_10')) {
        newAchievements.push('first_10');
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: 'First 10 Tasks Completed! +50 XP',
            timestamp: new Date()
          }
        });
        dispatch({ type: 'ADD_XP', payload: { amount: 50, source: 'Achievement: First 10 Tasks' } });
      }
      
      if (newStreak === 7 && !achievements.includes('week_streak')) {
        newAchievements.push('week_streak');
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: '7-Day Streak! +100 XP',
            timestamp: new Date()
          }
        });
        dispatch({ type: 'ADD_XP', payload: { amount: 100, source: 'Achievement: Week Streak' } });
      }
      
      setAchievements(newAchievements);
      setLocalStorage(achievementsKey, newAchievements);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'task-completed',
          title: 'Task Completed!',
          message: `+${xpReward} XP for completing a 90-day plan task`,
          timestamp: new Date()
        }
      });
    }
  };

  const resetAll = () => {
    setChecked({});
  };

  const resetDaily = () => {
    const dailyGroup = groups.find(g => g.id === 'daily-plan');
    if (!dailyGroup) return;
    setChecked(prev => {
      const next = { ...prev };
      dailyGroup.items.forEach(it => {
        const key = `${dailyGroup.id}:${it.id}`;
        if (next[key]) next[key] = false;
      });
      customTasks.forEach(t => {
        if (next[t.id]) next[t.id] = false;
      });
      return next;
    });
  };

  const renderGroupsForTab = () => {
    const isWeeklyItem = (label: string) => /\(1 week\)/i.test(label);
    if (activeTab === 'daily') {
      return groups.filter(g => g.id === 'daily-plan');
    }
    if (activeTab === 'weekly') {
      return groups
        .filter(g => g.id === 'month2' || g.id === 'month3')
        .map(g => ({ ...g, items: g.items.filter(it => isWeeklyItem(it.label)) }));
    }
    if (activeTab === 'monthly') {
      return groups.filter(g => g.id === 'month1' || g.id === 'month2' || g.id === 'month3');
    }
    return groups.filter(g => g.id === 'habits' || g.id === 'outcomes' || g.id === 'philosophy' || g.id === 'purpose');
  };

  const addCustomTask = () => {
    if (!newLabel.trim()) return;
    const id = `custom:${Date.now()}`;
    const task: ChecklistItem = { id, label: newLabel.trim(), dueDate: newDue || null, priority: newPriority, custom: true };
    setCustomTasks(prev => [task, ...prev]);
    setNewLabel('');
    setNewDue(null);
    setNewPriority('medium');
  };

  const removeCustomTask = (id: string) => {
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    setChecked(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const exportCSV = () => {
    const rows: string[] = [];
    rows.push(['group','id','label','checked','dueDate','priority'].join(','));
    groups.forEach(g => {
      g.items.forEach(it => {
        const key = `${g.id}:${it.id}`;
        rows.push([g.id, key, `"${it.label.replace(/"/g, '""')}"`, !!checked[key] ? '1' : '0', '', ''].join(','));
      });
    });
    customTasks.forEach(t => {
      rows.push(['custom', t.id, `"${t.label.replace(/"/g, '""')}"`, !!checked[t.id] ? '1' : '0', t.dueDate || '', t.priority || ''].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement_checklist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple`}>
            90-DAY PLACEMENT PLAN
          </h2>
          <p className="text-sm text-gray-400 font-mono">Structured roadmap with glitch-styled sections.</p>
        </div>
        <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
          <Button variant="neon" size="sm" onClick={exportCSV}>Export CSV</Button>
          <Button variant="glitch" size="sm" onClick={resetAll}>Reset All</Button>
        </div>
      </div>

      {/* Quick progress with gamification */}
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 rounded-full border-4 border-black flex items-center justify-center font-bold text-lg">
          {(() => {
            const totalKeys = groups.reduce((acc,g) => acc + g.items.length, 0) + customTasks.length;
            const checkedCount = Object.keys(checked).filter(k => checked[k]).length;
            const pct = totalKeys === 0 ? 0 : Math.floor((checkedCount / totalKeys) * 100);
            return `${pct}%`;
          })()}
        </div>
        
        {/* Streak Display */}
        <div className={`flex items-center gap-2 px-4 py-2 border-2 ${darkMode ? 'bg-orange-900 border-orange-600' : 'bg-orange-100 border-orange-500'}`}>
          <Flame className="h-5 w-5 text-orange-500" />
          <div className="text-center">
            <div className="text-lg font-black font-mono text-orange-500">{streak.current}</div>
            <div className="text-xs font-mono uppercase">Day Streak</div>
          </div>
        </div>
        
        {/* Achievements Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono uppercase">Badges:</span>
          {achievements.includes('first_10') && (
            <div className="px-2 py-1 bg-lime-500 text-black text-xs font-bold font-mono border border-black">
              10 Tasks
            </div>
          )}
          {achievements.includes('week_streak') && (
            <div className="px-2 py-1 bg-cyan-500 text-black text-xs font-bold font-mono border border-black">
              Week Streak
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="sixmonth">6-Month</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <div className="flex items-center justify-end mb-3">
            <Button variant="outline" onClick={resetDaily}>Reset Daily</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGroupsForTab().map((group, gi) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
                  <CardHeader className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      {group.id === 'daily-plan' ? <Clock className="h-5 w-5" /> : null}
                      {group.id === 'philosophy' ? <Target className="h-5 w-5" /> : null}
                      {group.id === 'habits' ? <Flame className="h-5 w-5" /> : <ListChecks className="h-5 w-5" />}
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{group.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checked[`${group.id}:${item.id}`]}
                            onChange={() => toggle(`${group.id}:${item.id}`)}
                            className="mt-0.5 h-4 w-4 border-2 border-black"
                          />
                          <span className="text-sm font-mono">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
                <CardHeader className="p-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Custom Tasks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Task label" className="flex-1 p-2 border-2 border-black" />
                      <input type="date" value={newDue || ''} onChange={e => setNewDue(e.target.value || null)} className="p-2 border-2 border-black" />
                      <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} className="p-2 border-2 border-black">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <Button onClick={addCustomTask}>Add</Button>
                    </div>
                    <div className="space-y-2">
                      {customTasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between gap-3 border p-2">
                          <label className="flex items-center gap-2 flex-1">
                            <input type="checkbox" checked={!!checked[t.id]} onChange={() => toggle(t.id)} className="h-4 w-4 border-2 border-black" />
                            <div>
                              <div className="font-mono text-sm">{t.label}</div>
                              <div className="text-xs opacity-60">{t.dueDate ? `Due: ${t.dueDate}` : 'No due date'} • {t.priority}</div>
                            </div>
                          </label>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => removeCustomTask(t.id)} className="border-2 border-black">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGroupsForTab().map((group, gi) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
                  <CardHeader className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{group.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checked[`${group.id}:${item.id}`]}
                            onChange={() => toggle(`${group.id}:${item.id}`)}
                            className="mt-0.5 h-4 w-4 border-2 border-black"
                          />
                          <span className="text-sm font-mono">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGroupsForTab().map((group, gi) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
                  <CardHeader className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{group.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checked[`${group.id}:${item.id}`]}
                            onChange={() => toggle(`${group.id}:${item.id}`)}
                            className="mt-0.5 h-4 w-4 border-2 border-black"
                          />
                          <span className="text-sm font-mono">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sixmonth">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGroupsForTab().map((group, gi) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
                  <CardHeader className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <CardTitle className="text-lg font-black uppercase tracking-tight">{group.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checked[`${group.id}:${item.id}`]}
                            onChange={() => toggle(`${group.id}:${item.id}`)}
                            className="mt-0.5 h-4 w-4 border-2 border-black"
                          />
                          <span className="text-sm font-mono">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <span className="text-sm font-mono">
              Track progress daily. Aim for consistent check-offs across DSA, Projects, Core, and Public updates.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
