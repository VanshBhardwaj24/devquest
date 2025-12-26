import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Trophy, Star, CheckCircle, Play, Flag, Timer, Users, Zap, Award, TrendingUp, Calendar, BarChart3, Flame, Shield, Sword, Gem, Coins, Heart, MessageSquare, Globe, Database, Brain, Code, Lock, Unlock, Crown, Sparkles } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  category: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  maxProgress: number;
  xpReward: number;
  timeLimit: string;
  milestones?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  rewards?: string[];
}

interface ChallengeCardProps {
  challenge: Challenge;
  isSelected: boolean;
  onSelect: (challenge: Challenge) => void;
  onStart: (challengeId: string) => void;
  onResume: (challengeId: string) => void;
  index: number;
  darkMode: boolean;
}

export function ChallengeCard({
  challenge,
  isSelected,
  onSelect,
  onStart,
  onResume,
  index,
  darkMode
}: ChallengeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-green-400 to-emerald-500';
      case 'Medium': return 'from-yellow-400 to-orange-500';
      case 'Hard': return 'from-red-400 to-pink-500';
      case 'Elite': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Play className="h-5 w-5 text-blue-500" />;
      case 'not-started': return <Target className="h-5 w-5 text-gray-400" />;
      default: return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTimeRemaining = (timeLimit: string) => {
    const days = parseInt(timeLimit.split(' ')[0]);
    return `${days - Math.floor(Math.random() * 3)} days left`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`p-6 rounded-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg cursor-pointer border-2 ${
        isSelected
          ? 'border-purple-500'
          : 'border-transparent hover:border-purple-300'
      } transition-all duration-300`}
      onClick={() => onSelect(challenge)}
    >
      {/* Challenge Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(challenge.status)}
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} text-white`}>
                {challenge.difficulty}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {challenge.category}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.xpReward.toLocaleString()}
            </span>
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            XP Reward
          </div>
        </div>
      </div>

      {/* Challenge Description */}
      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
        {challenge.description}
      </p>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Overall Progress
          </span>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {challenge.progress}/{challenge.maxProgress}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-full rounded-full bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)}`}
          />
        </div>
      </div>

      {/* Milestones Preview */}
      {challenge.milestones && challenge.milestones.length > 0 && (
        <div className="mb-4">
          <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Milestones ({challenge.milestones.filter(m => m.completed).length}/{challenge.milestones.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {challenge.milestones.slice(0, 4).map((milestone, idx) => (
              <div
                key={milestone.id}
                className={`p-2 rounded-lg text-xs ${
                  milestone.completed
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1">
                  {milestone.completed ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-current" />
                  )}
                  <span className="truncate">{milestone.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time and Action Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {getTimeRemaining(challenge.timeLimit)}
            </span>
          </div>
          
          {challenge.status === 'in-progress' && (
            <div className="flex items-center space-x-1">
              <Timer className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                Active
              </span>
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            if (challenge.status === 'not-started') {
              onStart(challenge.id);
            } else if (challenge.status === 'in-progress') {
              onResume(challenge.id);
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            challenge.status === 'completed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-default'
              : challenge.status === 'in-progress'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
          }`}
          disabled={challenge.status === 'completed'}
        >
          {challenge.status === 'completed' ? (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>Completed</span>
            </div>
          ) : challenge.status === 'in-progress' ? (
            <div className="flex items-center space-x-1">
              <Play className="h-4 w-4" />
              <span>Continue</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Flag className="h-4 w-4" />
              <span>Start Challenge</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Rewards Preview */}
      {challenge.rewards && challenge.rewards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Rewards:
          </div>
          <div className="flex flex-wrap gap-1">
            {challenge.rewards.slice(0, 3).map((reward, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-full text-xs ${
                  darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {reward}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
