/**
 * Enhanced Task Component with XP Integration
 * Automatically awards XP and updates streaks when tasks are completed
 */

import React, { useState, useCallback } from 'react';
import { useXPSystem } from '../hooks/useXPSystem';
import { useStreakSystem } from '../hooks/useStreakSystem';
import type { Task } from '../types';

interface TaskWithXPProps {
  task: Task;
  onTaskComplete?: (taskId: string) => void;
  onTaskUpdate?: (task: Task) => void;
  showXPAnimation?: boolean;
  className?: string;
}

export const TaskWithXP: React.FC<TaskWithXPProps> = ({
  task,
  onTaskComplete,
  onTaskUpdate,
  showXPAnimation = true,
  className = '',
}) => {
  const { addXP, calculateXPForAction } = useXPSystem();
  const { updateStreak, calculateStreakBonus } = useStreakSystem();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Calculate XP reward for this task
  const xpReward = useMemo(() => {
    const baseXP = calculateXPForAction('task_completion', task.priority);
    const streakBonus = calculateStreakBonus(baseXP);
    return baseXP + streakBonus - baseXP; // Just the bonus amount
  }, [task.priority, calculateXPForAction, calculateStreakBonus]);

  // Handle task completion
  const handleComplete = useCallback(async () => {
    if (isCompleting || task.completed) return;

    setIsCompleting(true);

    try {
      // Calculate total XP (base + bonus)
      const baseXP = calculateXPForAction('task_completion', task.priority);
      const totalXP = calculateStreakBonus(baseXP);

      // Add XP
      addXP(totalXP, `task_completion_${task.id}`);

      // Update streak
      updateStreak('task');

      // Update task status
      const updatedTask = { ...task, completed: true, completedAt: new Date() };
      
      // Call callbacks
      if (onTaskComplete) {
        onTaskComplete(task.id);
      }
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      // Show reward animation
      if (showXPAnimation) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
      }

      console.log(`Task completed: ${task.title} - +${totalXP} XP`);
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setIsCompleting(false);
    }
  }, [
    task,
    isCompleting,
    addXP,
    calculateXPForAction,
    updateStreak,
    calculateStreakBonus,
    onTaskComplete,
    onTaskUpdate,
    showXPAnimation,
  ]);

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'elite': return 'border-red-500 bg-red-50';
      case 'core': return 'border-blue-500 bg-blue-50';
      case 'bonus': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // Get XP amount display
  const getXPDisplay = () => {
    const baseXP = calculateXPForAction('task_completion', task.priority);
    const totalXP = calculateStreakBonus(baseXP);
    const bonus = totalXP - baseXP;
    
    if (bonus > 0) {
      return `${baseXP} + ${bonus} = ${totalXP} XP`;
    }
    return `${totalXP} XP`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Task Card */}
      <div
        className={`border-2 rounded-lg p-4 transition-all duration-300 ${
          task.completed 
            ? 'border-green-500 bg-green-50 opacity-75' 
            : getPriorityColor(task.priority)
        } ${!task.completed && !isCompleting ? 'hover:shadow-md cursor-pointer' : ''}`}
        onClick={!task.completed && !isCompleting ? handleComplete : undefined}
      >
        {/* Task Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className={`font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {/* Priority Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              task.priority === 'Elite' ? 'bg-red-500 text-white' :
              task.priority === 'Core' ? 'bg-blue-500 text-white' :
              task.priority === 'Bonus' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {task.priority || 'Normal'}
            </span>
            
            {/* XP Reward */}
            <div className="text-right">
              <p className="text-xs text-gray-500">Reward</p>
              <p className="text-sm font-bold text-indigo-600">
                {getXPDisplay()}
              </p>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex space-x-4">
            {task.category && (
              <span className="flex items-center">
                📁 {task.category}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {/* Completion Status */}
          <div className="flex items-center space-x-2">
            {task.completed ? (
              <span className="flex items-center text-green-600">
                ✅ Completed
              </span>
            ) : isCompleting ? (
              <span className="flex items-center text-blue-600">
                ⏳ Processing...
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
                ⭕ Click to complete
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar for tasks with progress */}
        {task.progress !== undefined && task.maxProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{task.progress}/{task.maxProgress}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(task.progress / task.maxProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg pointer-events-none">
          <div className="bg-white rounded-lg p-6 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Task Completed!</h3>
              <p className="text-2xl font-bold text-indigo-600 mb-1">
                +{calculateXPForAction('task_completion', task.priority)} XP
              </p>
              {xpReward > 0 && (
                <p className="text-sm text-green-600">
                  +{xpReward} Streak Bonus
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">{task.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Streak Bonus Indicator */}
      {xpReward > 0 && !task.completed && (
        <div className="absolute top-2 right-2">
          <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
            🔥 {xpReward} Bonus
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskWithXP;
