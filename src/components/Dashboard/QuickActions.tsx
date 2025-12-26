import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Target, BookOpen, Users, Code, Zap, Trophy, Brain, Rocket } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { Card } from '../ui/card';
=======
import { Plus, Target, BookOpen, Users, Calendar, Code, Zap, Trophy, Brain, Rocket } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
>>>>>>> origin/main

type TaskTemplate = {
  title: string;
  description: string;
  priority: 'Elite' | 'Core' | 'Bonus';
  xp: number;
  category: string;
  relatedSkillId?: string;
};

export function QuickActions() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { darkMode } = state;

  const createQuickTask = async (taskData: TaskTemplate) => {
    if (!authUser) return;

    try {
      const newTask = {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority as 'Elite' | 'Core' | 'Bonus',
        completed: false,
        xp: taskData.xp,
        category: taskData.category,
        relatedSkillId: taskData.relatedSkillId,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        createdAt: new Date(),
        streak: 0,
      };

      await taskService.createTask(authUser.id, newTask);
      dispatch({ type: 'ADD_TASK', payload: newTask });
      
      // Add notification
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'task-completed',
        title: 'Task Created! 📝',
        message: `"${taskData.title}" has been added to your task board.`,
        timestamp: new Date(),
      }});

    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      const msg = (error as unknown as { message?: string })?.message || JSON.stringify(error);
      console.error('Error creating task:', msg);
    }
  };

  const recommendedXP = useMemo(() => {
    const level = state.user?.level ?? 1;
    if (level >= 50) return 250;
    if (level >= 25) return 175;
    if (level >= 10) return 125;
    return 75;
  }, [state.user?.level]);

  const actions: TaskTemplate[] = [
    {
      title: 'Solve LeetCode Problem',
      description: 'Practice algorithmic thinking',
      icon: Code,
      color: 'bg-orange-500',
      action: () => createQuickTask({
        title: 'Solve 2 LeetCode Problems',
        description: 'Practice data structures and algorithms',
        priority: 'Core',
        xp: recommendedXP,
        category: 'DSA',
        relatedSkillId: 'dsa'
      }),
    },
    {
      title: 'Update Resume',
      description: 'Keep your profile current',
      icon: Target,
      color: 'bg-emerald-500',
      action: () => createQuickTask({
        title: 'Update Resume with Latest Projects',
        description: 'Add recent work and skills to resume',
        priority: 'Elite',
        xp: recommendedXP + 50,
        category: 'Profile',
        relatedSkillId: 'communication'
      }),
    },
    {
      title: 'Read Tech Article',
      description: 'Stay updated with trends',
      icon: BookOpen,
      color: 'bg-cyan-500',
      action: () => createQuickTask({
        title: 'Read 2 Tech Articles',
        description: 'Stay updated with latest technology trends',
        priority: 'Bonus',
        xp: Math.max(50, recommendedXP - 25),
        category: 'Learning',
        relatedSkillId: 'javascript'
      }),
    },
    {
      title: 'Mock Interview',
      description: 'Practice interview skills',
      icon: Users,
      color: 'bg-pink-500',
      action: () => createQuickTask({
        title: 'Complete Mock Interview',
        description: 'Practice technical and behavioral questions',
        priority: 'Elite',
        xp: recommendedXP + 100,
        category: 'Interview',
        relatedSkillId: 'communication'
      }),
    },
    {
      title: 'Build Side Project',
      description: 'Enhance your portfolio',
      icon: Rocket,
      color: 'bg-purple-500',
      action: () => createQuickTask({
        title: 'Work on Side Project',
        description: 'Spend 2 hours building your portfolio project',
        priority: 'Core',
        xp: recommendedXP + 75,
        category: 'Portfolio',
        relatedSkillId: 'react'
      }),
    },
    {
      title: 'Network on LinkedIn',
      description: 'Connect with professionals',
      icon: Users,
      color: 'bg-blue-600',
      action: () => createQuickTask({
        title: 'Connect with 5 Professionals',
        description: 'Expand your professional network on LinkedIn',
        priority: 'Core',
        xp: Math.max(75, recommendedXP - 10),
        category: 'Networking',
        relatedSkillId: 'communication'
      }),
    },
    {
      title: 'Learn New Technology',
      description: 'Expand your skill set',
      icon: Brain,
      color: 'bg-yellow-500',
      action: () => createQuickTask({
        title: 'Learn New Framework/Library',
        description: 'Spend time learning a new technology',
        priority: 'Bonus',
        xp: recommendedXP,
        category: 'Learning',
        relatedSkillId: 'problem-solving'
      }),
    },
    {
      title: 'Contribute to Open Source',
      description: 'Give back to the community',
      icon: Trophy,
      color: 'bg-green-600',
      action: () => createQuickTask({
        title: 'Make Open Source Contribution',
        description: 'Contribute to an open source project',
        priority: 'Elite',
        xp: recommendedXP + 125,
        category: 'Open Source',
        relatedSkillId: 'typescript'
      }),
    },
  ];

  return (
    <Card variant="brutal" className={`p-6 ${darkMode ? 'bg-zinc-900 border-white text-white' : 'bg-white border-black text-black'}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${darkMode ? 'bg-yellow-400' : 'bg-yellow-500'}`}>
          <Zap className="h-6 w-6 text-black" />
        </div>
        <h2 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
          Quick Actions
        </h2>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`p-4 border-2 border-black ${action.color} text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 text-left group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={64} />
              </div>
              <div className="flex items-start space-x-3 relative z-10">
                <div className="p-2 bg-black/20 border-2 border-black/10 rounded-none">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold font-mono text-sm mb-1 uppercase">{action.title}</div>
                  <div className="text-xs opacity-90 font-mono">{action.description}</div>
                </div>
                <div className="text-xs font-bold bg-black/20 px-2 py-1 border border-black/10 font-mono">
                  +XP
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`mt-6 p-4 border-2 ${darkMode ? 'bg-zinc-800 border-white text-gray-300' : 'bg-gray-100 border-black text-gray-600'} text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      >
        <p className="text-sm font-mono mb-2 uppercase font-bold">
          💡 Pro Tip: Maintain your streak!
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-mono">
            Each action creates a trackable task with XP rewards
          </span>
        </div>
      </motion.div>
    </Card>
  );
}
