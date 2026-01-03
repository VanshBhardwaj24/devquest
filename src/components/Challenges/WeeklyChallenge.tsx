import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Trophy, Star, CheckCircle, Play, Edit, Calendar, Users, Zap, Award, TrendingUp, Flag, Timer, BarChart3 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { appDataService } from '../../services/appDataService';

export function WeeklyChallenge() {
  const { state, dispatch } = useApp();
  const { user: authUser } = useAuth();
  const { darkMode, challenges } = state;
  const [selectedChallenge, setSelectedChallenge] = useState<(typeof challenges)[number] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<(typeof challenges)[number]['milestones'][number] | null>(null);

  const persistArena = async () => {
    if (!authUser?.id) return;
    try {
      const existing = await appDataService.getAppData(authUser.id);
      const merged = { ...(existing?.challenges || {}), arena: state.challenges };
      await appDataService.updateAppDataField(authUser.id, 'challenges', merged);
    } catch {
      // ignore
    }
  };
  // Enhanced challenge management functions
  const startChallenge = async (challengeId: string) => {
    if (!authUser) return;

    try {
      dispatch({ type: 'START_CHALLENGE', payload: challengeId });
      await persistArena();
      
      // Add XP for starting challenge
      dispatch({ type: 'ADD_XP', payload: { amount: 25, source: 'Challenge Started' } });
      
      // Add notification
      const challenge = challenges.find(c => c.id === challengeId);
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'challenge',
        title: 'Challenge Started! 🚀',
        message: `You've started "${challenge?.title}". Good luck!`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
      }});

      // Update social stats
      dispatch({ type: 'UPDATE_SOCIAL_STATS', payload: { 
        profileViews: state.socialStats.profileViews + Math.floor(Math.random() * 3) + 1 
      }});

    } catch (error) {
      const msg = (error as { message?: string })?.message || JSON.stringify(error);
      console.error('Error starting challenge:', msg);
    }
  };

  const resumeChallenge = async (challengeId: string) => {
    if (!authUser) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Simulate progress update
    const progressIncrement = Math.floor(Math.random() * 3) + 1;
    const newProgress = Math.min(challenge.progress + progressIncrement, challenge.maxProgress);
    
    const updatedChallenge = {
      ...challenge,
      progress: newProgress,
      status: newProgress >= challenge.maxProgress ? 'completed' : 'in-progress'
    };

    dispatch({ type: 'UPDATE_CHALLENGE', payload: updatedChallenge });
    await persistArena();

    // Add XP for progress
    const xpGained = progressIncrement * 10;
    dispatch({ type: 'ADD_XP', payload: { amount: xpGained, source: 'Challenge Progress' } });

    // Check for completion
    if (newProgress >= challenge.maxProgress) {
      dispatch({ type: 'ADD_XP', payload: { amount: challenge.xpReward, source: 'Challenge Completed' } });
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Challenge Completed! 🎉',
        message: `Congratulations! You completed "${challenge.title}" and earned ${challenge.xpReward} XP!`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
      }});

      // Random reward chance
      if (Math.random() < 0.3) {
        const rewards = [
          '🎁 Bonus XP Multiplier x2 for 1 hour!',
          '🌟 Special Theme Unlocked!',
          '💎 Rare Badge Unlocked!',
          '🔥 Streak Booster Activated!',
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: (Date.now() + 1).toString(),
          type: 'reward',
          title: 'Bonus Reward! 🎰',
          message: reward,
          timestamp: new Date(),
          read: false,
          priority: 'high',
        }});

        if (reward.includes('Multiplier')) {
          dispatch({ type: 'ACTIVATE_BONUS_XP', payload: { multiplier: 2, duration: 1 } });
        }
      }
    } else {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: Date.now().toString(),
        type: 'challenge',
        title: 'Progress Made! 📈',
        message: `You made progress on "${challenge.title}". Keep going!`,
        timestamp: new Date(),
        read: false,
        priority: 'low',
      }});
    }
  };

  const updateMilestoneProgress = (challengeId: string, milestoneId: string, newProgress: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const updatedMilestones = challenge.milestones.map((milestone) => {
      if (milestone.id === milestoneId) {
        const completed = newProgress >= milestone.target;
        if (completed && !milestone.completed) {
          // Milestone just completed
          dispatch({ type: 'ADD_XP', payload: { amount: milestone.xpReward, source: 'Milestone Completed' } });
          
          dispatch({ type: 'ADD_NOTIFICATION', payload: {
            id: Date.now().toString(),
            type: 'achievement',
            title: 'Milestone Achieved! 🎯',
            message: `You completed "${milestone.title}" and earned ${milestone.xpReward} XP!`,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
          }});
        }
        return { ...milestone, progress: newProgress, completed };
      }
      return milestone;
    });

    const totalProgress = updatedMilestones.reduce((sum: number, m) => sum + (m.completed ? 1 : 0), 0);
    const updatedChallenge = {
      ...challenge,
      milestones: updatedMilestones,
      progress: totalProgress,
      status: totalProgress >= challenge.maxProgress ? 'completed' : challenge.status
    };

    dispatch({ type: 'UPDATE_CHALLENGE', payload: updatedChallenge });
    persistArena();
  };

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
    // Simple time calculation for demo
    const days = parseInt(timeLimit.split(' ')[0]);
    return `${days - Math.floor(Math.random() * 3)} days left`;
  };

  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const inProgressChallenges = challenges.filter(c => c.status === 'in-progress').length;
  const totalXPFromChallenges = challenges
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.xpReward, 0);

  return (
    <div className="p-6 bg-black/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple mb-2">
                WEEKLY CHALLENGE ARENA
              </h1>
              <p className="text-lg text-neon-blue font-mono">
                Earn XP and level up with glitch-mode intensity
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-black/40 border border-neon-yellow/40 shadow-lg"
              >
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-neon-yellow mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neon-yellow font-cyber">
                    {completedChallenges}
                  </div>
                  <div className="text-sm text-neon-blue">
                    Completed
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-black/40 shadow-lg border border-neon-green/40"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-neon-green" />
              <div>
                <div className="text-2xl font-bold text-neon-green font-cyber">
                  {completedChallenges}
                </div>
                <div className="text-sm text-neon-blue">
                  Completed
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-black/40 shadow-lg border border-neon-blue/40"
          >
            <div className="flex items-center space-x-3">
              <Play className="h-8 w-8 text-neon-blue" />
              <div>
                <div className="text-2xl font-bold text-neon-blue font-cyber">
                  {inProgressChallenges}
                </div>
                <div className="text-sm text-neon-blue">
                  In Progress
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-black/40 shadow-lg border border-neon-yellow/40"
          >
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-neon-yellow" />
              <div>
                <div className="text-2xl font-bold text-neon-yellow font-cyber">
                  {totalXPFromChallenges.toLocaleString()}
                </div>
                <div className="text-sm text-neon-blue">
                  Total XP
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-black/40 shadow-lg border border-neon-purple/40"
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-neon-purple" />
              <div>
                <div className="text-2xl font-bold text-neon-purple font-cyber">
                  {Math.floor(Math.random() * 5) + 1}
                </div>
                <div className="text-sm text-neon-blue">
                  Days Left
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-2xl bg-black/40 shadow-lg border border-neon-pink/40"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-neon-pink" />
              <div>
                <div className="text-2xl font-bold text-neon-pink font-cyber">
                  {Math.floor((completedChallenges / challenges.length) * 100)}%
                </div>
                <div className="text-sm text-neon-blue">
                  Success Rate
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-black/40 shadow-lg border border-neon-blue/40"
          >
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-neon-blue" />
              <div>
                <div className="text-2xl font-bold text-neon-blue font-cyber">
                  #{Math.floor(Math.random() * 100) + 1}
                </div>
                <div className="text-sm text-neon-blue">
                  Global Rank
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`p-6 rounded-2xl bg-black/40 shadow-lg cursor-pointer border ${
                selectedChallenge?.id === challenge.id
                  ? 'border-neon-purple'
                  : 'border-neon-purple/30 hover:border-neon-purple/60'
              } transition-all duration-300`}
              onClick={() => setSelectedChallenge(challenge)}
            >
              {/* Challenge Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(challenge.status)}
                  <div>
                    <h3 className="text-lg font-bold text-neon-pink font-cyber">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} text-white`}>
                        {challenge.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        'bg-black/40 text-white'
                      }`}>
                        {challenge.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-neon-yellow" />
                    <span className="font-bold text-neon-yellow font-cyber">
                      {challenge.xpReward.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-neon-blue">
                    XP Reward
                  </div>
                </div>
              </div>

              {/* Challenge Description */}
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                {challenge.description}
              </p>

              {/* Enhanced Progress Section */}
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
                    Milestones ({challenge.milestones.filter((m: any) => m.completed).length}/{challenge.milestones.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {challenge.milestones.slice(0, 4).map((milestone: any, idx: number) => (
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
                      startChallenge(challenge.id);
                    } else if (challenge.status === 'in-progress') {
                      resumeChallenge(challenge.id);
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
                    {challenge.rewards.slice(0, 3).map((reward: string, idx: number) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
