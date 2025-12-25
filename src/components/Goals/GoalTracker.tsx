import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'short-term' | 'long-term' | 'career';
  progress: number;
  target: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
}

export function GoalTracker() {
  const { state } = useApp();
  const { darkMode } = state;
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'short-term' | 'long-term' | 'career'>('all');

  const goals: Goal[] = [
    {
      id: '1',
      title: 'Complete 100 LeetCode Problems',
      description: 'Solve 100 coding problems to improve algorithmic thinking',
      category: 'short-term',
      progress: 67,
      target: 100,
      unit: 'problems',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Build 5 Portfolio Projects',
      description: 'Create diverse projects showcasing different skills',
      category: 'long-term',
      progress: 3,
      target: 5,
      unit: 'projects',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'active',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Land Software Engineering Internship',
      description: 'Secure an internship at a tech company',
      category: 'career',
      progress: 2,
      target: 1,
      unit: 'applications',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'active',
      priority: 'high',
    },
    {
      id: '4',
      title: 'Maintain 30-Day Streak',
      description: 'Stay consistent with daily learning activities',
      category: 'short-term',
      progress: 15,
      target: 30,
      unit: 'days',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'active',
      priority: 'medium',
    },
  ];

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'from-red-400 to-pink-500';
      case 'medium':
        return 'from-yellow-400 to-orange-500';
      case 'low':
        return 'from-green-400 to-emerald-500';
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'short-term':
        return <Clock className="h-4 w-4" />;
      case 'long-term':
        return <Calendar className="h-4 w-4" />;
      case 'career':
        return <Target className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Goal Tracker 🎯
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Set, track, and achieve your career milestones
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'short-term', 'long-term', 'career'] as const).map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.replace('-', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredGoals.map((goal, index) => {
            const progressPercentage = Math.min((goal.progress / goal.target) * 100, 100);
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg border-l-4 border-purple-500`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getPriorityColor(goal.priority)}`}>
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {goal.category.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize bg-gradient-to-r ${getPriorityColor(goal.priority)} text-white`}>
                          {goal.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Complete
                    </div>
                  </div>
                </div>

                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {goal.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Progress
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {goal.progress}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${getPriorityColor(goal.priority)}`}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className={`h-4 w-4 ${
                      daysRemaining <= 7 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      daysRemaining <= 7 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingUp className={`h-5 w-5 ${
                        progressPercentage > 50 ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Goal Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 flex items-center space-x-2 mx-auto"
          >
            <Plus size={20} />
            <span>Add New Goal</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}