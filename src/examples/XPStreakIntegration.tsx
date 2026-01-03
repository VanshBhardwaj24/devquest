/**
 * Complete XP and Streak Integration Example
 * Shows how to use all the XP and streak components together
 */

import React from 'react';
import { XPProgressBar } from '../components/XPProgressBar';
import { StreakDisplay } from '../components/StreakDisplay';
import { TaskWithXP } from '../components/TaskWithXP';
import { CodingProblemWithXP } from '../components/CodingProblemWithXP';
import { ActivityTracker } from '../components/ActivityTracker';
import { useXPSystem } from '../hooks/useXPSystem';
import { useStreakSystem } from '../hooks/useStreakSystem';

export const XPStreakIntegrationExample: React.FC = () => {
  const { 
    currentXP, 
    currentLevel, 
    xpToNextLevel, 
    progress, 
    addXP, 
    calculateXPForAction,
    activateBonusXP 
  } = useXPSystem();
  
  const { 
    currentStreak, 
    isStreakActive, 
    updateStreak, 
    protectStreak, 
    calculateStreakBonus,
    getStreakRewards 
  } = useStreakSystem();

  // Sample tasks
  const sampleTasks = [
    {
      id: '1',
      title: 'Complete React Tutorial',
      description: 'Finish the advanced React tutorial and build a sample project',
      priority: 'Core' as const,
      category: 'learning' as const,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
      createdAt: new Date(),
      streak: 0,
      xp: 75,
    },
    {
      id: '2',
      title: 'Solve Array Problem',
      description: 'Complete a medium difficulty array manipulation problem',
      priority: 'Bonus' as const,
      category: 'coding' as const,
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      completed: false,
      createdAt: new Date(),
      streak: 0,
      xp: 50,
    },
    {
      id: '3',
      title: 'Portfolio Review',
      description: 'Get feedback on your portfolio from 3 peers',
      priority: 'Elite' as const,
      category: 'career' as const,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      completed: false,
      createdAt: new Date(),
      streak: 0,
      xp: 100,
    },
  ];

  // Sample coding problems
  const sampleProblems = [
    {
      id: '1',
      title: 'Two Sum',
      description: 'Find two numbers that add up to a target sum in an array',
      difficulty: 'Easy' as const,
      platform: 'LeetCode',
      topic: 'Arrays',
      xpReward: 50,
    },
    {
      id: '2',
      title: 'Binary Tree Inorder Traversal',
      description: 'Implement inorder traversal of a binary tree',
      difficulty: 'Medium' as const,
      platform: 'LeetCode',
      topic: 'Trees',
      xpReward: 75,
    },
    {
      id: '3',
      title: 'Dynamic Programming - Knapsack',
      description: 'Solve the 0/1 knapsack problem using dynamic programming',
      difficulty: 'Hard' as const,
      platform: 'LeetCode',
      topic: 'Dynamic Programming',
      xpReward: 100,
    },
  ];

  // Handle task completion
  const handleTaskComplete = (taskId: string) => {
    console.log(`Task ${taskId} completed!`);
  };

  // Handle task update
  const handleTaskUpdate = (task: any) => {
    console.log('Task updated:', task);
  };

  // Handle problem solved
  const handleProblemSolved = (problemId: string) => {
    console.log(`Problem ${problemId} solved!`);
  };

  // Manual XP addition
  const handleManualXP = () => {
    const amount = Math.floor(Math.random() * 100) + 10;
    const source = 'manual_bonus';
    addXP(amount, source);
  };

  // Manual streak update
  const handleManualStreak = () => {
    updateStreak('general');
  };

  // Activate bonus XP
  const handleBonusXP = () => {
    activateBonusXP(2, 30); // 2x multiplier for 30 minutes
  };

  // Protect streak
  const handleProtectStreak = () => {
    protectStreak('streak_shield', 60); // 60 minutes
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            XP & Streak Integration Demo
          </h1>
          <p className="text-gray-600">
            Complete tasks, solve problems, and watch your XP and streaks grow!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <XPProgressBar showDetails={true} animated={true} />
          <StreakDisplay showDetails={true} animated={true} showProtection={true} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleManualXP}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🎁 Random XP
            </button>
            <button
              onClick={handleManualStreak}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔥 Update Streak
            </button>
            <button
              onClick={handleBonusXP}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              ⚡ Bonus XP (2x)
            </button>
            <button
              onClick={handleProtectStreak}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🛡️ Protect Streak
            </button>
          </div>
        </div>

        {/* Current Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Current Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-indigo-600">{currentXP.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Current XP</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">{currentLevel}</p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">{currentStreak}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-600">{xpToNextLevel.toLocaleString()}</p>
              <p className="text-sm text-gray-600">XP to Next</p>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tasks with XP</h2>
          <div className="space-y-4">
            {sampleTasks.map((task) => (
              <TaskWithXP
                key={task.id}
                task={task}
                onTaskComplete={handleTaskComplete}
                onTaskUpdate={handleTaskUpdate}
                showXPAnimation={true}
              />
            ))}
          </div>
        </div>

        {/* Coding Problems Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Coding Problems with XP</h2>
          <div className="space-y-4">
            {sampleProblems.map((problem) => (
              <CodingProblemWithXP
                key={problem.id}
                problem={problem}
                onProblemSolved={handleProblemSolved}
                showXPAnimation={true}
              />
            ))}
          </div>
        </div>

        {/* Activity Tracker */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ActivityTracker showDetails={true} autoTrack={true} />
        </div>

        {/* Milestone Rewards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Streak Milestone Rewards</h2>
          <div className="space-y-2">
            {getStreakRewards().map((reward, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {reward.badgeReward && `🏆 ${reward.badgeReward.replace('_', ' ').toUpperCase()}`}
                    {reward.titleReward && `👑 ${reward.titleReward}`}
                  </p>
                  <p className="text-sm text-gray-600">Milestone {reward.milestone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">+{reward.xpReward} XP</p>
                  {reward.goldReward > 0 && (
                    <p className="text-sm text-yellow-600">+{reward.goldReward} Gold</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Calculator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">XP Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Task Completion</p>
              <p className="text-xl font-bold text-green-600">
                +{calculateXPForAction('task_completion', 'Core')} XP
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Coding Problem</p>
              <p className="text-xl font-bold text-blue-600">
                +{calculateXPForAction('coding_problem', 'Medium')} XP
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">With {currentStreak}-Day Streak</p>
              <p className="text-xl font-bold text-purple-600">
                +{calculateStreakBonus(100) - 100} Bonus XP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPStreakIntegrationExample;
