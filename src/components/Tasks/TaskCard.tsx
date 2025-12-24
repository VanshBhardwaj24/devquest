import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, CheckCircle, Circle, Trash2, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { achievementService } from '../../services/achievementService';
import { Task, CareerStats } from '../../types';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { darkMode } = state;

  const priorityColors = {
    Elite: 'from-red-500 to-pink-500',
    Core: 'from-blue-500 to-cyan-500',
    Bonus: 'from-green-500 to-emerald-500',
  };

  const priorityBorders = {
    Elite: 'border-red-500',
    Core: 'border-blue-500',
    Bonus: 'border-green-500',
  };

  const toggleComplete = async () => {
    if (!authUser) return;

    const updatedTask = { ...task, completed: !task.completed };
    
    try {
      await taskService.updateTask(authUser.id, task.id, updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      if (!task.completed) {
        // Task completed
        dispatch({ type: 'ADD_XP', payload: { amount: task.xp, source: `Completed "${task.title}"` } });
        
        // Update career stats based on category
        const statUpdates: Partial<CareerStats> = {};
        switch (task.category.toLowerCase()) {
          case 'dsa':
          case 'learning':
            statUpdates.skillsMastered = Math.min(100, state.careerStats.skillsMastered + 1);
            break;
          case 'interview':
          case 'networking':
            statUpdates.interviews = state.careerStats.interviews + 1;
            break;
          case 'portfolio':
          case 'profile':
            statUpdates.projectsCompleted = state.careerStats.projectsCompleted + 1;
            break;
          default:
            statUpdates.skillsMastered = Math.min(100, state.careerStats.skillsMastered + 1);
        }
        dispatch({ type: 'UPDATE_STATS', payload: statUpdates });

        // Add completion notification
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: Date.now().toString(),
          type: 'task-completed',
          title: 'Task Completed! 🎉',
          message: `You earned ${task.xp} XP for completing "${task.title}"`,
          timestamp: new Date(),
        }});

        // Check for achievements
        const completedTasks = state.tasks.filter(t => t.completed).length + 1;
        if (completedTasks === 1) {
          await achievementService.unlockAchievement(authUser.id, 'first-task');
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first-task' });
        } else if (completedTasks === 10) {
          await achievementService.unlockAchievement(authUser.id, 'task-master');
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'task-master' });
        }
      }
    } catch (error: unknown) {
      console.error('Error updating task:', (error as Error)?.message || JSON.stringify(error));
    }
  };

  const deleteTask = async () => {
    if (!authUser) return;

    try {
      await taskService.deleteTask(authUser.id, task.id);
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'task-completed',
        title: 'Task Deleted',
        message: `"${task.title}" has been removed from your board.`,
        timestamp: new Date(),
      }});
    } catch (error: unknown) {
      console.error('Error deleting task:', (error as Error)?.message || JSON.stringify(error));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isOverdue = new Date() > task.dueDate && !task.completed;
  const isDueToday = task.dueDate.toDateString() === new Date().toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-5 rounded-xl border-2 ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } hover:shadow-lg transition-all duration-300 ${
        task.completed ? 'opacity-75' : ''
      } ${priorityBorders[task.priority]} group`}
    >
      <div className="flex items-start space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleComplete}
          className={`mt-1 ${
            task.completed
              ? 'text-green-500'
              : darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-400 hover:text-gray-600'
          } transition-colors`}
        >
          {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
        </motion.button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-3">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${priorityColors[task.priority]} text-white text-sm font-medium`}>
              {task.priority}
            </div>
            <div className={`px-3 py-1 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            } text-sm font-medium`}>
              {task.category}
            </div>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1"
              >
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-yellow-500 text-sm font-medium">+{task.xp}</span>
              </motion.div>
            )}
          </div>
          
          <h3 className={`font-bold text-lg mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          } ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          
          <p className={`text-sm mb-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          } line-clamp-2`}>
            {task.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className={`h-4 w-4 ${
                  isOverdue ? 'text-red-500' : 
                  isDueToday ? 'text-yellow-500' :
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  isOverdue ? 'text-red-500 font-medium' : 
                  isDueToday ? 'text-yellow-500 font-medium' :
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatDate(task.dueDate)}
                  {isOverdue && ' (Overdue)'}
                  {isDueToday && ' (Today)'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Zap className={`h-4 w-4 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {task.xp} XP
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={deleteTask}
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' 
                    : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                } transition-colors`}
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>
          
          {task.streak > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className={`text-xs ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  {task.streak} day streak
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
