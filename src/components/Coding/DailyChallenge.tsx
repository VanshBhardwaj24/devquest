import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { isValidUrl } from '../../lib/utils';

interface DailyChallengeData {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  url: string;
  xp: number;
  bonusXp: number;
  tags: string[];
}

export function DailyChallenge() {
  const { state } = useApp();
  const { darkMode } = state;
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const { dispatch } = useApp();

  useEffect(() => {
    loadDailyChallenge();
    // Check local storage for today's completion
    const today = new Date().toISOString().split('T')[0];
    const completedDate = localStorage.getItem('daily_challenge_completed_date');
    if (completedDate === today) {
      setCompleted(true);
    }
  }, []);

  const loadDailyChallenge = async () => {
    try {
      setTimeout(() => {
        const data: DailyChallengeData = {
          id: `daily-${new Date().toISOString().split('T')[0]}`,
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'Easy',
          platform: 'LeetCode',
          url: 'https://leetcode.com/problems/two-sum/',
          xp: 75,
          bonusXp: 25,
          tags: ['Array', 'Hash Table'],
        };
        setDailyChallenge(data);
        setLoading(false);
      }, 500);
    } catch (error) {
      const msg = (error as { message?: string })?.message || JSON.stringify(error);
      console.error('Error loading daily challenge:', msg);
      setLoading(false);
    }
  };

  const markCompleted = () => {
    if (!dailyChallenge) return;
    
    setCompleted(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('daily_challenge_completed_date', today);
    
    // Add XP
    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: dailyChallenge.xp + dailyChallenge.bonusXp, 
        source: 'Daily Challenge' 
      } 
    });

    // Update Streak
    dispatch({
      type: 'UPDATE_TIME_BASED_STREAK',
      payload: {
        activityType: 'coding',
        timestamp: new Date()
      }
    });

    // Update Coding Stats
    dispatch({
      type: 'SOLVE_PROBLEM',
      payload: {
        xp: dailyChallenge.xp,
        difficulty: dailyChallenge.difficulty,
        platform: dailyChallenge.platform,
        topic: dailyChallenge.tags[0] || 'General'
      } 
    });
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!dailyChallenge) {
    return (
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          No Daily Challenge
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Check back tomorrow for a new challenge!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg border-l-4 border-yellow-500 ${
        completed ? 'bg-green-50 dark:bg-green-900/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-yellow-500" />
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily Challenge
          </h3>
        </div>
        {completed && <CheckCircle className="h-6 w-6 text-green-500" />}
      </div>

      <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {dailyChallenge.title}
      </h4>

      <div className="flex items-center space-x-4 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          dailyChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          dailyChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {dailyChallenge.difficulty}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
        }`}>
          {dailyChallenge.platform}
        </span>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {dailyChallenge.xp + dailyChallenge.bonusXp} XP
          </span>
        </div>
      </div>

      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {dailyChallenge.description}
      </p>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            try {
              window.open(dailyChallenge.url, '_blank');
            } catch {
              // noop
            }
          }}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center space-x-2"
        >
          <ExternalLink size={16} />
          <span>Solve Challenge</span>
        </motion.button>
        
        {!completed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markCompleted}
            className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600"
          >
            ✓
          </motion.button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Bonus XP expires at midnight
          </span>
        </div>
      </div>
    </motion.div>
  );
}
