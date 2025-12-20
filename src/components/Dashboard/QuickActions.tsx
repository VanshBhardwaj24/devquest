import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, BookOpen, Users, Calendar, Code, Zap, Trophy, Brain, Rocket } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';

export function QuickActions() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { darkMode } = state;

  const createQuickTask = async (taskData: any) => {
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

    } catch (error: any) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Error creating task:', error?.message || JSON.stringify(error));
    }
  };

  const actions = [
    {
      title: 'Solve LeetCode Problem',
      description: 'Practice algorithmic thinking',
      icon: Code,
      color: 'from-orange-500 to-red-500',
      action: () => createQuickTask({
        title: 'Solve 2 LeetCode Problems',
        description: 'Practice data structures and algorithms',
        priority: 'Core',
        xp: 100,
        category: 'DSA'
      }),
    },
    {
      title: 'Update Resume',
      description: 'Keep your profile current',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      action: () => createQuickTask({
        title: 'Update Resume with Latest Projects',
        description: 'Add recent work and skills to resume',
        priority: 'Elite',
        xp: 150,
        category: 'Profile'
      }),
    },
    {
      title: 'Read Tech Article',
      description: 'Stay updated with trends',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      action: () => createQuickTask({
        title: 'Read 2 Tech Articles',
        description: 'Stay updated with latest technology trends',
        priority: 'Bonus',
        xp: 50,
        category: 'Learning'
      }),
    },
    {
      title: 'Mock Interview',
      description: 'Practice interview skills',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      action: () => createQuickTask({
        title: 'Complete Mock Interview',
        description: 'Practice technical and behavioral questions',
        priority: 'Elite',
        xp: 200,
        category: 'Interview'
      }),
    },
    {
      title: 'Build Side Project',
      description: 'Enhance your portfolio',
      icon: Rocket,
      color: 'from-indigo-500 to-purple-500',
      action: () => createQuickTask({
        title: 'Work on Side Project',
        description: 'Spend 2 hours building your portfolio project',
        priority: 'Core',
        xp: 175,
        category: 'Portfolio'
      }),
    },
    {
      title: 'Network on LinkedIn',
      description: 'Connect with professionals',
      icon: Users,
      color: 'from-blue-600 to-blue-800',
      action: () => createQuickTask({
        title: 'Connect with 5 Professionals',
        description: 'Expand your professional network on LinkedIn',
        priority: 'Core',
        xp: 75,
        category: 'Networking'
      }),
    },
    {
      title: 'Learn New Technology',
      description: 'Expand your skill set',
      icon: Brain,
      color: 'from-yellow-500 to-orange-500',
      action: () => createQuickTask({
        title: 'Learn New Framework/Library',
        description: 'Spend time learning a new technology',
        priority: 'Bonus',
        xp: 125,
        category: 'Learning'
      }),
    },
    {
      title: 'Contribute to Open Source',
      description: 'Give back to the community',
      icon: Trophy,
      color: 'from-green-600 to-green-800',
      action: () => createQuickTask({
        title: 'Make Open Source Contribution',
        description: 'Contribute to an open source project',
        priority: 'Elite',
        xp: 250,
        category: 'Open Source'
      }),
    },
  ];

  return (
    <div className={`rounded-2xl p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <div className="flex items-center space-x-3 mb-6">
        <Zap className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
              className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-300 text-left group`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
                <div className="text-xs opacity-75 group-hover:opacity-100 transition-opacity">
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
        className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}
      >
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
          💡 Pro Tip: Complete daily tasks to maintain your streak!
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Each action creates a trackable task with XP rewards
          </span>
        </div>
      </motion.div>
    </div>
  );
}