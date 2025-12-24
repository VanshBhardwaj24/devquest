import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Target, Zap, Calendar, Trophy, Flame, 
  Heart, Shield, Skull, CheckCircle, Circle, Trash2, 
  Clock, AlertTriangle, TrendingUp, Coins
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { achievementService } from '../../services/achievementService';
import { Task } from '../../types';

// Default tasks for new users
const DEFAULT_TASKS: Omit<Task, 'id'>[] = [
  { title: 'Solve 2 LeetCode Problems', description: 'Practice DSA with medium difficulty', priority: 'Elite', completed: false, xp: 150, category: 'DSA', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Complete Striver SDE Sheet - Arrays', description: 'Master array concepts', priority: 'Elite', completed: false, xp: 200, category: 'DSA', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Solve Graph Traversal Problems', description: 'Master BFS and DFS', priority: 'Elite', completed: false, xp: 175, category: 'DSA', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Practice Dynamic Programming', description: 'Solve 3 DP problems', priority: 'Elite', completed: false, xp: 200, category: 'DSA', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Complete Binary Tree Problems', description: 'Practice tree traversals', priority: 'Elite', completed: false, xp: 175, category: 'DSA', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Attend Live Coding Contest', description: 'Participate in weekly contest', priority: 'Elite', completed: false, xp: 250, category: 'Contest', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'System Design Interview Prep', description: 'Design scalable systems', priority: 'Elite', completed: false, xp: 200, category: 'Interview', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Implement Advanced Data Structure', description: 'Code Trie or Segment Tree', priority: 'Elite', completed: false, xp: 225, category: 'DSA', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Crack Hard LeetCode Problem', description: 'Solve one hard problem', priority: 'Elite', completed: false, xp: 250, category: 'DSA', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'dsa' },
  { title: 'Complete Mock Technical Interview', description: 'Full technical simulation', priority: 'Elite', completed: false, xp: 300, category: 'Interview', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Read System Design Chapter', description: 'Learn scalable architecture', priority: 'Core', completed: false, xp: 100, category: 'Learning', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Build Portfolio Project', description: 'Work on React/Node.js project', priority: 'Core', completed: false, xp: 175, category: 'Portfolio', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'react' },
  { title: 'Practice Mock Interview', description: 'Prepare for interview rounds', priority: 'Core', completed: false, xp: 125, category: 'Interview', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Learn New Framework', description: 'Explore Next.js or Vue', priority: 'Core', completed: false, xp: 150, category: 'Learning', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'react' },
  { title: 'Contribute to Open Source', description: 'Make your first PR', priority: 'Core', completed: false, xp: 150, category: 'Portfolio', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'typescript' },
  { title: 'Write Technical Blog Post', description: 'Share learnings on Medium', priority: 'Core', completed: false, xp: 125, category: 'Learning', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Complete API Integration', description: 'Integrate REST/GraphQL API', priority: 'Core', completed: false, xp: 125, category: 'Portfolio', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'typescript' },
  { title: 'Deploy Project to Cloud', description: 'Deploy to Vercel or AWS', priority: 'Core', completed: false, xp: 150, category: 'Portfolio', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'react' },
  { title: 'Database Design Practice', description: 'Design schema for app', priority: 'Core', completed: false, xp: 125, category: 'Learning', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Prepare FAANG Resume', description: 'Update resume for FAANG', priority: 'Core', completed: false, xp: 100, category: 'Interview', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Update GitHub README', description: 'Showcase skills & projects', priority: 'Bonus', completed: false, xp: 75, category: 'Profile', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Review OOP Concepts', description: 'Revise SOLID principles', priority: 'Bonus', completed: false, xp: 50, category: 'Learning', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'typescript' },
  { title: 'Connect on LinkedIn', description: 'Network with professionals', priority: 'Bonus', completed: false, xp: 50, category: 'Networking', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
  { title: 'Watch Tech Conference Talk', description: 'Learn from industry experts', priority: 'Bonus', completed: false, xp: 50, category: 'Learning', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Read Tech Articles', description: 'Stay updated with trends', priority: 'Bonus', completed: false, xp: 40, category: 'Learning', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Learn Git Advanced', description: 'Master rebase & cherry-pick', priority: 'Bonus', completed: false, xp: 75, category: 'Learning', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Explore Design Patterns', description: 'Study Singleton, Factory', priority: 'Bonus', completed: false, xp: 75, category: 'Learning', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'problem-solving' },
  { title: 'Join Developer Community', description: 'Participate in Discord/Reddit', priority: 'Bonus', completed: false, xp: 50, category: 'Networking', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), createdAt: new Date(), streak: 0, relatedSkillId: 'communication' },
];

// Skinner Box: Variable Reward System
const calculateCriticalHit = () => {
  const roll = Math.random() * 100;
  if (roll < 1) return { type: 'jackpot', multiplier: 10, message: '🎰 JACKPOT! Ultra Rare!' };
  if (roll < 5) return { type: 'epic', multiplier: 5, message: '💎 EPIC Hit!' };
  if (roll < 15) return { type: 'critical', multiplier: 3, message: '⚡ CRITICAL!' };
  if (roll < 30) return { type: 'bonus', multiplier: 1.5, message: '✨ Bonus!' };
  return { type: 'normal', multiplier: 1, message: null };
};

export function TaskBoard() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { tasks, user, overduePenaltiesEnabled } = state;
  
  const [filter, setFilter] = useState<'all' | 'Elite' | 'Core' | 'Bonus' | 'in-progress'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [criticalHit, setCriticalHit] = useState<{show: boolean; message: string; type: string}>({ show: false, message: '', type: '' });
  const [dailyHP, setDailyHP] = useState(100);
  const [dailyGold, setDailyGold] = useState(500);
  const [goblinAlert, setGoblinAlert] = useState(false);
  const [penalizedTasks, setPenalizedTasks] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'Core' as 'Elite' | 'Core' | 'Bonus', 
    category: '', 
    xp: 100, 
    relatedSkillId: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    dueDateISO: ''
  });

  // Difficulty Multipliers
  const difficultyConfig = {
    easy: { xp: 50, label: 'Easy', color: 'text-green-400', border: 'border-green-500/30' },
    medium: { xp: 100, label: 'Medium', color: 'text-yellow-400', border: 'border-yellow-500/30' },
    hard: { xp: 200, label: 'Hard', color: 'text-red-400', border: 'border-red-500/30' }
  };

  // Loss Aversion: HP Decay after 6 PM
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18) {
      const pending = tasks.filter(t => !t.completed).length;
      const decay = Math.min(pending * 5, 50);
      setDailyHP(Math.max(0, 100 - decay));
      if (hour >= 22 && dailyHP < 50) {
        setGoblinAlert(true);
        setDailyGold(prev => Math.max(0, prev - 100));
      }
    }
  }, [tasks, dailyHP]);

  // Initialize default tasks
  useEffect(() => {
    if (tasks.length === 0 && authUser) {
      DEFAULT_TASKS.forEach((t, i) => {
        dispatch({ type: 'ADD_TASK', payload: { ...t, id: `task-${Date.now()}-${i}` } });
      });
    }
  }, [authUser, tasks.length, dispatch]);

  useEffect(() => {
    if (!overduePenaltiesEnabled) return;
    const interval = setInterval(() => {
      try {
        const now = new Date();
        const newlyOverdue = tasks.filter(t => !t.completed && t.dueDate < now && !penalizedTasks.has(t.id));
        if (newlyOverdue.length > 0) {
          const totalPenalty = newlyOverdue.reduce((sum, t) => sum + Math.round(Math.min(50, t.xp * 0.1)), 0);
          newlyOverdue.forEach(t => {
            const p = Math.round(Math.min(50, t.xp * 0.1));
            dispatch({ type: 'ADD_XP', payload: { amount: -p, source: `Overdue: ${t.title}` } });
          });
          setPenalizedTasks(prev => {
            const next = new Set(prev);
            newlyOverdue.forEach(t => next.add(t.id));
            return next;
          });
          setDailyHP(prev => Math.max(0, prev - 5));
          setDailyGold(prev => Math.max(0, prev - 10));
          dispatch({ type: 'ADD_NOTIFICATION', payload: {
            id: Date.now().toString(),
            type: 'system',
            title: 'Overdue Penalties Applied',
            message: `-${totalPenalty} XP deducted for overdue quests`,
            timestamp: new Date(),
          }});
        }
      } catch {
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: Date.now().toString(),
          type: 'system',
          title: 'Penalty Error',
          message: 'Failed to apply overdue penalties',
          timestamp: new Date(),
          read: false,
          priority: 'low',
        }});
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, penalizedTasks, dispatch, overduePenaltiesEnabled]);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || (filter === 'in-progress' ? !task.completed : task.priority === filter);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Zeigarnik Effect: Show in-progress tasks first
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const order = { Elite: 0, Core: 1, Bonus: 2 };
    return order[a.priority] - order[b.priority];
  });

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const completionPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const isNearComplete = completionPct >= 75; // Goal Gradient zone

  const toggleComplete = async (task: Task) => {
    if (!authUser) return;
    const updated = { ...task, completed: !task.completed };
    const completionTime = new Date();
    
    try {
      await taskService.updateTask(authUser.id, task.id, updated);
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      
      if (!task.completed) {
        // Update time-based streak for task completion
        dispatch({ type: 'UPDATE_TIME_BASED_STREAK', payload: { activityType: 'task', timestamp: completionTime } });
        
        const crit = calculateCriticalHit();
        const finalXP = Math.round(task.xp * crit.multiplier);
        
        if (crit.type !== 'normal') {
          setCriticalHit({ show: true, message: crit.message!, type: crit.type });
          setTimeout(() => setCriticalHit({ show: false, message: '', type: '' }), 2500);
        }
        
        setDailyHP(prev => Math.min(100, prev + 10));
        setDailyGold(prev => prev + 25);
        
        dispatch({ type: 'ADD_XP', payload: { amount: finalXP, source: `Completed "${task.title}"` } });
        
        // Goal Gradient bonus
        if (isNearComplete) {
          dispatch({ type: 'ADD_XP', payload: { amount: Math.round(task.xp * 0.25), source: 'Goal Gradient Bonus! 🎯' } });
        }

        if (task.relatedSkillId) {
          dispatch({ 
            type: 'ADD_SKILL_XP', 
            payload: { 
              skillId: task.relatedSkillId, 
              amount: finalXP, 
              source: `Task: ${task.title}` 
            } 
          });
        }

        const skillName = task.relatedSkillId && user?.skills 
          ? user.skills.find(s => s.id === task.relatedSkillId)?.name 
          : null;

        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: Date.now().toString(),
          type: 'task-completed',
          title: crit.type !== 'normal' ? crit.message! : 'Quest Completed! 🎉',
          message: skillName 
            ? `+${finalXP} XP to ${skillName}!` 
            : `+${finalXP} XP earned!`,
          timestamp: completionTime,
        }});

        if (crit.type === 'jackpot') {
          dispatch({ type: 'ADD_NOTIFICATION', payload: {
            id: `loot-${Date.now()}`,
            type: 'reward',
            title: '🎁 LOOT BOX!',
            message: 'Legendary drop! Check Rewards!',
            timestamp: completionTime,
          }});
        }

        const count = completedTasks.length + 1;
        if (count === 1) {
          await achievementService.unlockAchievement(authUser.id, 'first-task');
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first-task' });
        }
      }
    } catch (error: unknown) {
      console.error('Error:', (error as Error)?.message || JSON.stringify(error));
    }
  };

  const deleteTask = async (task: Task) => {
    if (!authUser) return;
    try {
      await taskService.deleteTask(authUser.id, task.id);
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      const penalty = Math.min(50, Math.round(task.xp * 0.2));
      dispatch({ type: 'ADD_XP', payload: { amount: -penalty, source: 'Quest Abandoned' } });
    } catch (error: unknown) {
      console.error('Error:', (error as Error)?.message || JSON.stringify(error));
    }
  };

  const addCustomTask = async () => {
    if (!authUser || !newTask.title.trim()) return;
    try {
      const taskData: Omit<Task, 'id'> = {
        ...newTask,
        completed: false,
        category: newTask.category || 'General',
        dueDate: newTask.dueDateISO ? new Date(newTask.dueDateISO) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        streak: 0,
        // Include relatedSkillId from state
        relatedSkillId: newTask.relatedSkillId || undefined
      };
      await taskService.createTask(authUser.id, taskData);
      dispatch({ type: 'ADD_TASK', payload: { ...taskData, id: Date.now().toString() } });
      setNewTask({ title: '', description: '', priority: 'Core', category: '', xp: 100, relatedSkillId: '', difficulty: 'medium', dueDateISO: '' });
      setShowAddTask(false);
    } catch (error: unknown) {
      console.error('Error:', (error as Error)?.message || JSON.stringify(error));
    }
  };

  const formatDate = (d: Date) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid Date';
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(d);
    return `${dateStr} ${timeStr}`;
  };
  
  const priorityConfig = {
    Elite: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-l-red-500', icon: '🔥' },
    Core: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-l-cyan-500', icon: '⚡' },
    Bonus: { bg: 'bg-lime-500/20', text: 'text-lime-400', border: 'border-l-lime-500', icon: '✨' },
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Critical Hit Overlay */}
        <AnimatePresence>
          {criticalHit.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                transition={{ repeat: 2, duration: 0.3 }}
                className={`text-4xl md:text-6xl font-black font-mono drop-shadow-[0_0_40px_currentColor] ${
                  criticalHit.type === 'jackpot' ? 'text-lime-400' :
                  criticalHit.type === 'epic' ? 'text-fuchsia-400' :
                  criticalHit.type === 'critical' ? 'text-orange-400' : 'text-cyan-400'
                }`}
              >
                {criticalHit.message}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goblin Alert - Neo Brutalist */}
        <AnimatePresence>
          {goblinAlert && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="fixed top-20 right-4 z-40 p-4 bg-red-900 border-4 border-red-500 brutal-shadow"
            >
              <div className="flex items-center gap-3">
                <Skull className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-red-300 font-black font-mono">GOBLIN_ATTACK!</div>
                  <div className="text-red-400 text-sm font-mono">-100 Gold stolen!</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with HP/Gold - Neo Brutalist */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono truncate">
                QUEST_BOARD <span className="text-lime-400">⚔️</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-mono">// Complete quests to survive. HP drains at night!</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* HP Bar */}
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 brutal-card bg-gray-900 ${dailyHP < 30 ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${dailyHP < 30 ? 'text-red-500' : 'text-pink-500'}`} />
                <div className="w-12 sm:w-16 h-2 bg-gray-800 border border-gray-700 overflow-hidden">
                  <motion.div 
                    className={`h-full ${dailyHP < 30 ? 'bg-red-500' : dailyHP < 60 ? 'bg-yellow-500' : 'bg-lime-500'}`}
                    animate={{ width: `${dailyHP}%` }}
                  />
                </div>
                <span className={`text-xs font-black font-mono ${dailyHP < 30 ? 'text-red-400' : 'text-white'}`}>{dailyHP}</span>
              </div>

              {/* Gold */}
              <div className="flex items-center gap-2 px-3 py-2 brutal-card bg-gray-900 border-yellow-600/30">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-black text-yellow-400 font-mono">{dailyGold}</span>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 px-3 py-2 brutal-card bg-gray-900 border-cyan-600/30">
                <Shield className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-black text-cyan-400 font-mono">{user?.streak || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Gradient Progress Bar - Neo Brutalist */}
        <motion.div 
          className={`mb-4 sm:mb-6 p-3 sm:p-4 brutal-card bg-gray-900 ${isNearComplete ? 'border-lime-500' : 'border-gray-700'}`}
          animate={isNearComplete ? { boxShadow: ['0 0 0 0 rgba(132, 204, 22, 0)', '0 0 20px 5px rgba(132, 204, 22, 0.3)', '0 0 0 0 rgba(132, 204, 22, 0)'] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isNearComplete ? 'text-lime-400' : 'text-cyan-400'}`} />
              <span className="font-black text-white font-mono text-sm">DAILY_PROGRESS</span>
              {isNearComplete && (
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-lime-400 font-black text-xs font-mono">
                  ⚡ +25% XP ZONE!
                </motion.span>
              )}
            </div>
            <span className={`text-sm font-black font-mono ${isNearComplete ? 'text-lime-400' : 'text-gray-400'}`}>
              {completedTasks.length}/{tasks.length} ({completionPct}%)
            </span>
          </div>
          <div className="w-full h-4 bg-gray-800 border-2 border-gray-700 overflow-hidden">
            <motion.div 
              className={`h-full ${isNearComplete ? 'bg-gradient-to-r from-lime-500 via-cyan-400 to-lime-500' : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Stats - Neo Brutalist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { icon: Target, color: 'cyan', value: pendingTasks.length, label: 'ACTIVE' },
            { icon: Trophy, color: 'lime', value: completedTasks.length, label: 'DONE' },
            { icon: Calendar, color: 'orange', value: completedTasks.filter(t => t.createdAt.toDateString() === new Date().toDateString()).length, label: 'TODAY' },
            { icon: Flame, color: 'fuchsia', value: user?.streak || 0, label: 'STREAK' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02, y: -2 }} className={`p-2 sm:p-3 brutal-card bg-gray-900 border-${s.color}-500/30`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${s.color}-400 flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-black text-white font-mono truncate">{s.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-mono truncate">{s.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls - Neo Brutalist */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            <input
              type="text"
              placeholder="search_quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-900 border-2 border-gray-700 focus:border-lime-500 text-white font-mono text-xs sm:text-sm placeholder-gray-500 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'Elite' | 'Core' | 'Bonus' | 'in-progress')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm bg-gray-800 border-gray-700 text-white`}
            >
              <option value="all">All Quests</option>
              <option value="in-progress">In Progress</option>
              <option value="Elite">🔥 Elite</option>
              <option value="Core">⚡ Core</option>
              <option value="Bonus">✨ Bonus</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTask(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Quest</span>
              <span className="sm:hidden">New</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'SET_OVERDUE_PENALTIES', payload: !overduePenaltiesEnabled })}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${overduePenaltiesEnabled ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
            >
              {overduePenaltiesEnabled ? 'Penalties: On' : 'Penalties: Off'}
            </motion.button>
          </div>
        </div>

        {/* Task List (Compact) */}
        <div className="space-y-2">
          <AnimatePresence>
            {sortedTasks.map((task, index) => {
              const cfg = priorityConfig[task.priority];
              const isOverdue = new Date() > task.dueDate && !task.completed;
              const isDueToday = task.dueDate.toDateString() === new Date().toDateString();
              const isDueSoon = !task.completed && !isOverdue && (task.dueDate.getTime() - Date.now() <= 12 * 60 * 60 * 1000);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`p-2 sm:p-3 rounded-lg border-l-4 ${cfg.border} bg-gray-800/80 border-gray-700 ${task.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-500/50' : ''} hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleComplete(task)}
                      className={`flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-500 hover:text-green-400'}`}
                    >
                      {task.completed ? <CheckCircle size={18} className="sm:w-5 sm:h-5" /> : <Circle size={18} className="sm:w-5 sm:h-5" />}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm">{cfg.icon}</span>
                        <span className={`font-medium text-xs sm:text-sm ${task.completed ? 'line-through' : ''} text-white truncate`}>{task.title}</span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${cfg.bg} ${cfg.text} flex-shrink-0`}>{task.priority}</span>
                        {task.category && <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs bg-gray-700 text-gray-400 flex-shrink-0`}>{task.category}</span>}
                      </div>
                      {task.description && <p className={`text-[10px] sm:text-xs mt-0.5 truncate text-gray-500`}>{task.description}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {isOverdue && <span className="flex items-center gap-1 text-red-400 text-[10px] sm:text-xs"><AlertTriangle size={10} className="sm:w-3 sm:h-3" />Overdue (-{Math.round(Math.min(50, task.xp * 0.1))} XP)</span>}
                        {isDueToday && !isOverdue && <span className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs"><Clock size={10} className="sm:w-3 sm:h-3" />Today</span>}
                        {isDueSoon && !isOverdue && !isDueToday && <span className="flex items-center gap-1 text-orange-400 text-[10px] sm:text-xs"><Clock size={10} className="sm:w-3 sm:h-3" />Soon</span>}
                        <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${isNearComplete && !task.completed ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-700'}`}>
                        <Zap size={10} className={`sm:w-3 sm:h-3 ${isNearComplete && !task.completed ? 'text-yellow-400' : 'text-purple-400'}`} />
                        <span className={`text-[10px] sm:text-xs font-bold ${isNearComplete && !task.completed ? 'text-yellow-400' : 'text-white'}`}>
                          {isNearComplete && !task.completed ? `${task.xp}+${Math.round(task.xp * 0.25)}` : task.xp}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteTask(task)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {sortedTasks.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-400">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-lg font-medium">No quests found</p>
          </div>
        )}

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full p-4 sm:p-6 rounded-2xl bg-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">⚔️ Create Quest</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    placeholder="Quest title..."
                  />
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-500 resize-none"
                    placeholder="Description..."
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'Elite' | 'Core' | 'Bonus' }))}
                      className="px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="Elite">🔥 Elite</option>
                      <option value="Core">⚡ Core</option>
                      <option value="Bonus">✨ Bonus</option>
                    </select>
                    
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => {
                        const diff = e.target.value as 'easy' | 'medium' | 'hard';
                        setNewTask(prev => ({ 
                          ...prev, 
                          difficulty: diff,
                          xp: difficultyConfig[diff].xp 
                        }));
                      }}
                      className="px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="easy">🟢 Easy (50 XP)</option>
                      <option value="medium">🟡 Medium (100 XP)</option>
                      <option value="hard">🔴 Hard (200 XP)</option>
                    </select>
                  </div>
                  
                  {/* XP Override (Optional) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Custom XP:</span>
                    <input
                      type="number"
                      value={newTask.xp}
                      onChange={(e) => setNewTask(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 rounded border text-sm bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    placeholder="Category (DSA, Learning...)"
                  />
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-400">Due date & time:</span>
                    </div>
                    <input
                      type="datetime-local"
                      value={newTask.dueDateISO}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDateISO: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>
                  
                  {user?.skills && user.skills.length > 0 && (
                    <select
                      value={newTask.relatedSkillId}
                      onChange={(e) => setNewTask(prev => ({ ...prev, relatedSkillId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="">-- Link to Skill (Optional) --</option>
                      {user.skills.map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} (Lvl {skill.level})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddTask(false)} className="flex-1 py-2 rounded-lg border text-sm border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={addCustomTask} disabled={!newTask.title.trim()} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-colors">Create</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
