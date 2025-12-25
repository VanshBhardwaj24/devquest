import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Code2, GitBranch, Skull, 
  CheckCircle, X, Terminal, Clock,
  Flame, TrendingDown, Lock, BookOpen
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
  dailyReading: {
    minutes: number;
    lastReadDate: string;
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

const getDateOnlyString = (): string => {
  return new Date().toISOString().split('T')[0];
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
      if (!isToday(parsed.dailyReading?.lastReadDate || new Date().toISOString())) {
        parsed.dailyReading = {
          minutes: 0,
          lastReadDate: new Date().toISOString(),
          streak: parsed.dailyReading?.streak || 0,
        };
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
      dailyReading: {
        minutes: 0,
        lastReadDate: new Date().toISOString(),
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
  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [commitCount, setCommitCount] = useState(1);
  const [readingMinutes, setReadingMinutes] = useState(15);

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
    const todayDateOnly = getDateOnlyString();
    if (data.penalties.lastReset && data.penalties.lastReset.split('T')[0] === todayDateOnly) {
      return;
    }
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
      ...(type === 'daily' ? {
        dailyReading: {
          ...prev.dailyReading,
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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const lastSolvedDate = new Date(data.dailyDSA.lastSolvedDate);
      if (lastSolvedDate.toDateString() !== now.toDateString() && 
          lastSolvedDate.toDateString() !== yesterday.toDateString() &&
          data.dailyDSA.streak > 0) {
        applyPenalty('daily');
      }
      const currentWeekStart = getStartOfWeek();
      const dataWeekStart = new Date(data.weeklyCommits.weekStart);
      if (currentWeekStart > dataWeekStart && data.weeklyCommits.count < 3) {
        applyPenalty('weekly');
        setData(prev => ({
          ...prev,
          weeklyCommits: {
            ...prev.weeklyCommits,
            count: 0,
            weekStart: getStartOfWeek().toISOString(),
          }
        }));
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [data.dailyDSA.lastSolvedDate, data.dailyDSA.streak, data.weeklyCommits.weekStart, data.weeklyCommits.count, applyPenalty]);

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
  const dailyReadingCompleted = isToday(data.dailyReading.lastReadDate) && data.dailyReading.minutes >= 15;

  const logReading = () => {
    const today = new Date().toISOString();
    const alreadyToday = isToday(data.dailyReading.lastReadDate) && data.dailyReading.minutes >= 15;
    const newMinutes = Math.min(180, data.dailyReading.minutes + readingMinutes);
    const achieved = newMinutes >= 15 && data.dailyReading.minutes < 15;
    
    setData(prev => ({
      ...prev,
      dailyReading: {
        minutes: newMinutes,
        lastReadDate: today,
        streak: achieved ? prev.dailyReading.streak + 1 : prev.dailyReading.streak,
      },
    }));

    if (achieved) {
      dispatch({
        type: 'ADD_XP',
        payload: { amount: 75, source: '📚 Daily Tech Reading Complete!' }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'achievement',
          title: '📚 Non-Negotiable Complete!',
          message: `Tech reading done! Streak: ${data.dailyReading.streak + 1} days 🔥`,
          timestamp: new Date(),
        }
      });
    } else {
      dispatch({
        type: 'ADD_XP',
        payload: { amount: Math.floor(readingMinutes / 5) * 10, source: `+${readingMinutes}m Tech Reading` }
      });
    }

    setShowAddReadingModal(false);
    setReadingMinutes(15);
  };

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
    {
      id: 'daily-read',
      title: 'Tech Reading (15m)',
      description: 'Read technical documentation or articles for 15 mins.',
      icon: <BookOpen className="w-6 h-6" />,
      type: 'daily',
      target: 15,
      current: data.dailyReading.minutes,
      completed: dailyReadingCompleted,
      deadline: getEndOfDay(),
      penalty: 'HP -10',
      color: 'from-purple-500 to-pink-600',
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 border relative overflow-hidden transition-all ${
        darkMode 
          ? 'bg-zinc-900/90 border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' 
          : 'bg-white border-red-200 shadow-xl'
      }`}
    >
      {/* Danger pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className={`absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,${darkMode ? '#dc2626' : '#ff0000'}_10px,${darkMode ? '#dc2626' : '#ff0000'}_20px)]`} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-900/20`}>
            <Skull className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Terminal className="w-5 h-5 text-red-500" />
              <span className="tracking-tight">NON_NEGOTIABLES</span>
              <span className="text-red-500 animate-pulse">_</span>
            </h3>
            <p className="text-sm text-red-500/80 font-mono font-medium">
              {"// FAIL = XP.reset(0) // NO MERCY"}
            </p>
          </div>
        </div>
        
        {/* Penalty Counter */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
          darkMode ? 'bg-black/50 border-red-900/30' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${data.dailyDSA.streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            <span className={`font-mono text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data.dailyDSA.streak}d Streak
            </span>
          </div>
          {data.penalties.xpResetCount > 0 && (
            <>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="font-mono text-sm text-red-500 font-bold">
                  {data.penalties.xpResetCount} Resets
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Non-Negotiables List */}
      <div className="relative z-10 grid gap-4">
        {nonNegotiables.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative p-4 rounded-lg border transition-all duration-200 group ${
              item.completed 
                ? (darkMode ? 'bg-green-900/10 border-green-900/30' : 'bg-green-50 border-green-200')
                : (darkMode ? 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
            }`}
          >
            {/* Completion glow */}
            {item.completed && (
              <div className="absolute inset-0 bg-green-500/5 rounded-lg" />
            )}

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} shadow-lg ${
                item.completed ? 'opacity-50 grayscale' : ''
              }`}>
                <div className="text-white">{item.icon}</div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'} ${item.completed ? 'line-through opacity-50' : ''}`}>
                    {item.title}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                    item.type === 'daily' 
                      ? (darkMode ? 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50' : 'bg-cyan-100 text-cyan-700 border-cyan-200')
                      : (darkMode ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-purple-100 text-purple-700 border-purple-200')
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  {item.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${item.completed ? 'opacity-50' : ''}`}>
                  {item.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.current / item.target) * 100)}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    />
                  </div>
                  <span className={`font-mono text-xs font-bold ${
                    item.completed ? 'text-green-500' : (darkMode ? 'text-gray-400' : 'text-gray-600')
                  }`}>
                    {item.current}/{item.target}
                  </span>
                </div>
              </div>

              {/* Right side: Timer & Action */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-center">
                {/* Countdown */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${
                  item.completed 
                    ? 'text-green-500' 
                    : 'text-orange-500 bg-orange-500/10'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">
                    {item.type === 'daily' ? countdown.daily : countdown.weekly}
                  </span>
                </div>

                {/* Action button */}
                {!item.completed && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (item.id === 'daily-dsa') setShowAddDSAModal(true);
                      else if (item.id === 'weekly-commits') setShowAddCommitModal(true);
                      else setShowAddReadingModal(true);
                    }}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-lg shadow-lg transition-all ${
                      item.id === 'daily-dsa' 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/25' 
                        : item.id === 'weekly-commits'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25'
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-pink-500/25'
                    }`}
                  >
                    {item.id === 'daily-dsa' ? 'LOG DSA' : item.id === 'weekly-commits' ? 'LOG COMMITS' : 'LOG READING'}
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
        className={`mt-6 p-4 rounded-lg border flex items-center gap-3 ${
          darkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-200'
        }`}
      >
        <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
          <span className="font-bold uppercase">Warning:</span> Missing these non-negotiables will{' '}
          <span className="font-bold underline decoration-red-500 underline-offset-2">RESET ALL XP TO ZERO</span>. 
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddDSAModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-6 max-w-md w-full mx-4 border-2 border-black shadow-[8px_8px_0px_0px_#00f3ff] ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-black font-mono uppercase flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <Code2 className="w-6 h-6 text-cyan-500" />
                  LOG_DSA_PROBLEM
                </h3>
                <button onClick={() => setShowAddDSAModal(false)}>
                  <X className={`w-6 h-6 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} />
                </button>
              </div>

              <div className={`p-4 border-2 border-black mb-4 ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-2 font-mono font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm you've solved a DSA problem today:
                </p>
                <ul className={`text-xs space-y-1 font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>[x] LeetCode, Codeforces, HackerRank</li>
                  <li>[x] Striver SDE Sheet problems</li>
                  <li>[x] Any algo/DS problem</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddDSAModal(false)}
                  className={`flex-1 px-4 py-3 font-mono font-bold uppercase border-2 border-black ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                  CANCEL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markDSASolved}
                  className="flex-1 px-4 py-3 bg-cyan-400 text-black border-2 border-black hover:bg-cyan-300 shadow-[4px_4px_0px_0px_#000] font-mono font-bold uppercase"
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    CONFIRM
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddCommitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 p-6 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_#22c55e] border-2 border-green-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                  <GitBranch className="w-6 h-6 text-green-500" />
                  LOG_GITHUB_COMMITS
                </h3>
                <button onClick={() => setShowAddCommitModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="p-4 bg-black border border-gray-800 mb-4">
                <p className="text-sm text-gray-300 mb-3 font-mono">
                  How many commits did you push today?
                </p>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCommitCount(Math.max(1, commitCount - 1))}
                    className="brutal-btn w-10 h-10 flex items-center justify-center bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                  >
                    -
                  </motion.button>
                  <div className="text-4xl font-bold font-mono text-white w-16 text-center">
                    {commitCount}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCommitCount(commitCount + 1)}
                    className="brutal-btn w-10 h-10 flex items-center justify-center bg-green-600 text-black border-green-400 hover:bg-green-500"
                  >
                    +
                  </motion.button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2 font-mono">
                  Current week: {data.weeklyCommits.count} / 3 commits
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCommitModal(false)}
                  className="brutal-btn flex-1 px-4 py-3 bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  CANCEL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addCommits}
                  className="brutal-btn flex-1 px-4 py-3 bg-green-600 text-black border-green-400 hover:bg-green-500 shadow-[4px_4px_0px_0px_#000]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    ADD {commitCount} COMMIT{commitCount !== 1 ? 'S' : ''}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Reading Modal */}
      <AnimatePresence>
        {showAddReadingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddReadingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-6 max-w-md w-full mx-4 border-2 border-black shadow-[8px_8px_0px_0px_#ff00aa] ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-black font-mono uppercase flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                  <BookOpen className="w-6 h-6 text-pink-500" />
                  LOG_TECH_READING
                </h3>
                <button onClick={() => setShowAddReadingModal(false)}>
                  <X className={`w-6 h-6 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`} />
                </button>
              </div>

              <div className={`p-4 border-2 border-black mb-4 ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-2 font-mono font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select minutes to log today:
                </p>
                <div className="flex gap-2">
                  {[5, 10, 15, 30].map(m => (
                    <button
                      key={m}
                      onClick={() => setReadingMinutes(m)}
                      className={`px-3 py-2 border-2 ${readingMinutes === m ? 'bg-pink-500 text-black border-pink-400' : darkMode ? 'bg-zinc-800 text-white border-white' : 'bg-white text-black border-black'} brutal-shadow`}
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logReading}
                  className="flex-1 px-4 py-2 bg-pink-500 text-black font-black border-2 border-black brutal-shadow"
                >
                  CONFIRM
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddReadingModal(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-zinc-800 text-white border-white' : 'bg-white text-black border-black'} font-black border-2 brutal-shadow`}
                >
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
