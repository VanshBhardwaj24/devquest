import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Code2, GitBranch, Skull, 
  CheckCircle, X, Terminal, Clock,
  Flame, TrendingDown, Lock
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NonNegotiable {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'daily' | 'weekly';
  target: number;
  current: number;
  completed: boolean;
  deadline: Date;
  penalty: string;
  color: string;
}

interface NonNegotiableData {
  dailyDSA: {
    solved: number;
    lastSolvedDate: string;
    streak: number;
  };
  weeklyCommits: {
    count: number;
    weekStart: string;
    lastChecked: string;
  };
  penalties: {
    xpResetCount: number;
    lastReset: string | null;
  };
}

const getStartOfWeek = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getEndOfDay = (): Date => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

const getEndOfWeek = (): Date => {
  const startOfWeek = getStartOfWeek();
  const sunday = new Date(startOfWeek);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isCurrentWeek = (weekStartString: string): boolean => {
  const weekStart = new Date(weekStartString);
  const currentWeekStart = getStartOfWeek();
  return weekStart.toDateString() === currentWeekStart.toDateString();
};

export function NonNegotiables() {
  const { state, dispatch } = useApp();
  const { darkMode, user } = state;
  
  // Load saved data from localStorage
  const [data, setData] = useState<NonNegotiableData>(() => {
    const saved = localStorage.getItem('nonNegotiableData');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset daily if it's a new day
      if (!isToday(parsed.dailyDSA.lastSolvedDate)) {
        parsed.dailyDSA.solved = 0;
      }
      // Reset weekly if it's a new week
      if (!isCurrentWeek(parsed.weeklyCommits.weekStart)) {
        parsed.weeklyCommits.count = 0;
        parsed.weeklyCommits.weekStart = getStartOfWeek().toISOString();
      }
      return parsed;
    }
    return {
      dailyDSA: {
        solved: 0,
        lastSolvedDate: new Date().toISOString(),
        streak: 0,
      },
      weeklyCommits: {
        count: 0,
        weekStart: getStartOfWeek().toISOString(),
        lastChecked: new Date().toISOString(),
      },
      penalties: {
        xpResetCount: 0,
        lastReset: null,
      },
    };
  });

  const [countdown, setCountdown] = useState({ daily: '', weekly: '' });
  const [showAddDSAModal, setShowAddDSAModal] = useState(false);
  const [showAddCommitModal, setShowAddCommitModal] = useState(false);
  const [commitCount, setCommitCount] = useState(1);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('nonNegotiableData', JSON.stringify(data));
  }, [data]);

  // Countdown timer
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      
      // Daily countdown
      const endOfDay = getEndOfDay();
      const dailyMs = endOfDay.getTime() - now.getTime();
      const dailyHours = Math.floor(dailyMs / (1000 * 60 * 60));
      const dailyMins = Math.floor((dailyMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Weekly countdown
      const endOfWeek = getEndOfWeek();
      const weeklyMs = endOfWeek.getTime() - now.getTime();
      const weeklyDays = Math.floor(weeklyMs / (1000 * 60 * 60 * 24));
      const weeklyHours = Math.floor((weeklyMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setCountdown({
        daily: `${dailyHours}h ${dailyMins}m`,
        weekly: `${weeklyDays}d ${weeklyHours}h`,
      });
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, []);

  // Apply penalty function
  const applyPenalty = useCallback((type: 'daily' | 'weekly') => {
    if (!user) return;
    
    // Reset XP to 0
    dispatch({
      type: 'ADD_XP',
      payload: { 
        amount: -(user.xp || 0), 
        source: type === 'daily' 
          ? '💀 PENALTY: Missed Daily DSA Problem!' 
          : '💀 PENALTY: Missed Weekly GitHub Commits!' 
      }
    });

    // Track penalty
    setData(prev => ({
      ...prev,
      penalties: {
        xpResetCount: prev.penalties.xpResetCount + 1,
        lastReset: new Date().toISOString(),
      },
      ...(type === 'daily' ? {
        dailyDSA: {
          ...prev.dailyDSA,
          streak: 0,
        }
      } : {}),
    }));

    // Show notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: '💀 XP RESET - Non-Negotiable Failed!',
        message: type === 'daily' 
          ? 'You missed your daily DSA problem. All XP has been reset to 0!'
          : 'You missed your weekly GitHub commits. All XP has been reset to 0!',
        timestamp: new Date(),
      }
    });
  }, [user, dispatch]);

  // Check for penalty at midnight/week end
  useEffect(() => {
    const checkPenalties = () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if daily DSA was missed yesterday
      const lastSolvedDate = new Date(data.dailyDSA.lastSolvedDate);
      if (lastSolvedDate.toDateString() !== now.toDateString() && 
          lastSolvedDate.toDateString() !== yesterday.toDateString() &&
          data.dailyDSA.streak > 0) {
        // Missed yesterday, reset XP
        applyPenalty('daily');
      }
      
      // Check if weekly commits were missed
      const currentWeekStart = getStartOfWeek();
      const dataWeekStart = new Date(data.weeklyCommits.weekStart);
      if (currentWeekStart > dataWeekStart && data.weeklyCommits.count < 3) {
        applyPenalty('weekly');
      }
    };

    checkPenalties();
  }, [data.dailyDSA.lastSolvedDate, data.weeklyCommits.weekStart, data.weeklyCommits.count, data.dailyDSA.streak, applyPenalty]);

  const markDSASolved = () => {
    const today = new Date().toISOString();
    const wasAlreadyToday = isToday(data.dailyDSA.lastSolvedDate) && data.dailyDSA.solved > 0;
    
    setData(prev => ({
      ...prev,
      dailyDSA: {
        solved: prev.dailyDSA.solved + 1,
        lastSolvedDate: today,
        streak: wasAlreadyToday ? prev.dailyDSA.streak : prev.dailyDSA.streak + 1,
      },
    }));

    // Award XP bonus for completing non-negotiable
    dispatch({
      type: 'ADD_XP',
      payload: { amount: 100, source: '✅ Daily DSA Complete!' }
    });

    if (!wasAlreadyToday) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'achievement',
          title: '🎯 Non-Negotiable Complete!',
          message: `Daily DSA solved! Streak: ${data.dailyDSA.streak + 1} days 🔥`,
          timestamp: new Date(),
        }
      });
    }

    setShowAddDSAModal(false);
  };

  const addCommits = () => {
    setData(prev => ({
      ...prev,
      weeklyCommits: {
        ...prev.weeklyCommits,
        count: prev.weeklyCommits.count + commitCount,
        lastChecked: new Date().toISOString(),
      },
    }));

    const newTotal = data.weeklyCommits.count + commitCount;
    
    if (newTotal >= 3 && data.weeklyCommits.count < 3) {
      // Just completed the weekly goal
      dispatch({
        type: 'ADD_XP',
        payload: { amount: 300, source: '🎉 Weekly GitHub Goal Complete!' }
      });

      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'achievement',
          title: '🏆 Weekly Non-Negotiable Complete!',
          message: `You've made ${newTotal} commits this week! Goal achieved!`,
          timestamp: new Date(),
        }
      });
    } else {
      dispatch({
        type: 'ADD_XP',
        payload: { amount: 50 * commitCount, source: `+${commitCount} GitHub Commit(s)` }
      });
    }

    setShowAddCommitModal(false);
    setCommitCount(1);
  };

  const dailyDSACompleted = isToday(data.dailyDSA.lastSolvedDate) && data.dailyDSA.solved >= 1;
  const weeklyCommitsCompleted = data.weeklyCommits.count >= 3;

  const nonNegotiables: NonNegotiable[] = [
    {
      id: 'daily-dsa',
      title: 'Daily DSA Problem',
      description: 'Solve at least 1 DSA problem every day. No exceptions.',
      icon: <Code2 className="w-6 h-6" />,
      type: 'daily',
      target: 1,
      current: data.dailyDSA.solved,
      completed: dailyDSACompleted,
      deadline: getEndOfDay(),
      penalty: 'XP → 0',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'weekly-commits',
      title: 'Weekly GitHub Commits',
      description: 'Push at least 3 commits to GitHub every week. No exceptions.',
      icon: <GitBranch className="w-6 h-6" />,
      type: 'weekly',
      target: 3,
      current: data.weeklyCommits.count,
      completed: weeklyCommitsCompleted,
      deadline: getEndOfWeek(),
      penalty: 'XP → 0',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-xl border-2 ${darkMode ? 'border-red-500/30' : 'border-red-400/50'} relative overflow-hidden`}
    >
      {/* Danger pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${darkMode ? '#ef4444' : '#dc2626'} 10px,
            ${darkMode ? '#ef4444' : '#dc2626'} 20px
          )`
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30">
            <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="font-mono text-sm sm:text-base">NON_NEGOTIABLES</span>
              <span className="text-red-500 animate-pulse">_</span>
            </h3>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-red-400' : 'text-red-600'} font-mono hidden sm:block`}>
              {"// FAIL = XP.reset(0) // NO MERCY"}
            </p>
          </div>
        </div>
        
        {/* Penalty Counter */}
        <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} self-start sm:self-auto`}>
          <Flame className={`w-4 h-4 ${data.dailyDSA.streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className={`font-mono text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {data.dailyDSA.streak}d
          </span>
          {data.penalties.xpResetCount > 0 && (
            <>
              <span className="text-gray-400">|</span>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="font-mono text-xs sm:text-sm text-red-500">
                {data.penalties.xpResetCount}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Non-Negotiables List */}
      <div className="relative z-10 space-y-4">
        {nonNegotiables.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative rounded-xl p-4 ${
              item.completed 
                ? darkMode ? 'bg-green-900/30 border-green-500/50' : 'bg-green-50 border-green-400'
                : darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'
            } border-2 overflow-hidden group`}
          >
            {/* Completion glow */}
            {item.completed && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
            )}

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                  <div className="text-white">{item.icon}</div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                      item.type === 'daily' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                    {item.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {item.description}
                  </p>

                  {/* Progress */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-600/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (item.current / item.target) * 100)}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      />
                    </div>
                    <span className={`font-mono text-sm ${
                      item.completed ? 'text-green-400' : darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.current}/{item.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Timer & Penalty */}
              <div className="flex flex-col items-end gap-2 ml-4">
                {/* Countdown */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  item.completed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">
                    {item.type === 'daily' ? countdown.daily : countdown.weekly}
                  </span>
                </div>

                {/* Penalty indicator */}
                {!item.completed && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-mono text-xs font-bold">{item.penalty}</span>
                  </div>
                )}

                {/* Action button */}
                {!item.completed && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => item.id === 'daily-dsa' ? setShowAddDSAModal(true) : setShowAddCommitModal(true)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl transition-all`}
                  >
                    {item.id === 'daily-dsa' ? '+ Log DSA' : '+ Log Commits'}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border border-red-500/30 flex items-center gap-3`}
      >
        <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className={`text-sm font-mono ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
          <span className="font-bold">⚠️ WARNING:</span> Missing these non-negotiables will{' '}
          <span className="text-red-500 font-bold">RESET ALL XP TO ZERO</span>. 
          There are no excuses. Ship code or lose everything.
        </p>
      </motion.div>

      {/* Add DSA Modal */}
      <AnimatePresence>
        {showAddDSAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddDSAModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border ${darkMode ? 'border-cyan-500/30' : 'border-cyan-400'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Code2 className="w-6 h-6 text-cyan-500" />
                  Log DSA Problem
                </h3>
                <button onClick={() => setShowAddDSAModal(false)}>
                  <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} mb-4`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Confirm you've solved a DSA problem today:
                </p>
                <ul className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <li>✅ LeetCode, Codeforces, HackerRank, etc.</li>
                  <li>✅ Striver SDE Sheet problems</li>
                  <li>✅ Any algorithm or data structure problem</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddDSAModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markDSASolved}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirm Solved
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Commits Modal */}
      <AnimatePresence>
        {showAddCommitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddCommitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border ${darkMode ? 'border-green-500/30' : 'border-green-400'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <GitBranch className="w-6 h-6 text-green-500" />
                  Log GitHub Commits
                </h3>
                <button onClick={() => setShowAddCommitModal(false)}>
                  <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} mb-4`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  How many commits did you push today?
                </p>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCommitCount(Math.max(1, commitCount - 1))}
                    className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} text-xl font-bold`}
                  >
                    -
                  </motion.button>
                  <div className={`text-4xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'} w-16 text-center`}>
                    {commitCount}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCommitCount(commitCount + 1)}
                    className="w-10 h-10 rounded-full bg-green-500 text-white text-xl font-bold"
                  >
                    +
                  </motion.button>
                </div>
                <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Current week: {data.weeklyCommits.count} / 3 commits
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCommitModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addCommits}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Add {commitCount} Commit{commitCount !== 1 ? 's' : ''}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
