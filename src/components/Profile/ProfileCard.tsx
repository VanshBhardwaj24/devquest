import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Trophy, Zap, Target, Save, X, 
  Terminal, Code, GitBranch, AlertTriangle, CheckCircle,
  Flame, Shield, Skull, Coffee
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function ProfileCard() {
  const { state, dispatch } = useApp();
  const { user, darkMode } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    degree: user?.degree || '',
    branch: user?.branch || '',
    year: user?.year || 1,
    careerGoal: user?.careerGoal || '',
    interests: user?.interests?.join(', ') || '',
  });

  // Non-negotiables tracking
  const [dailyDSA, setDailyDSA] = useState(false);
  const [weeklyCommits, setWeeklyCommits] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const getWeekStart = useCallback(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toDateString();
  }, []);

  const handleNonNegotiableFail = useCallback((type: 'daily' | 'weekly') => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'challenge',
        title: type === 'daily' ? '💀 DAILY DSA MISSED!' : '💀 WEEKLY COMMITS FAILED!',
        message: 'Your XP has been reset to 0. Non-negotiables are MANDATORY.',
        timestamp: new Date(),
      }
    });
    // Reset XP to 0 would need backend integration - for now just show warning
    setShowWarning(true);
  }, [dispatch]);

  // Check non-negotiables on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const weekStart = getWeekStart();
    
    // Check if DSA problem solved today
    const lastDSASolve = localStorage.getItem('lastDSASolve');
    setDailyDSA(lastDSASolve === today);

    // Check weekly commits
    const commits = parseInt(localStorage.getItem('weeklyCommits') || '0');
    const lastWeekReset = localStorage.getItem('weeklyReset');
    
    if (lastWeekReset !== weekStart) {
      // New week - reset and check if failed
      if (commits < 3 && lastWeekReset) {
        // Failed weekly challenge - reset XP
        handleNonNegotiableFail('weekly');
      }
      localStorage.setItem('weeklyCommits', '0');
      localStorage.setItem('weeklyReset', weekStart);
      setWeeklyCommits(0);
    } else {
      setWeeklyCommits(commits);
    }

    // Check if DSA was missed yesterday
    const lastDSADate = localStorage.getItem('lastDSADate');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    if (lastDSADate && lastDSADate !== today && lastDSADate !== yesterday) {
      // Missed a day - show warning
      setShowWarning(true);
    }
  }, [getWeekStart, handleNonNegotiableFail]);

  const markDSAComplete = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastDSASolve', today);
    localStorage.setItem('lastDSADate', today);
    setDailyDSA(true);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: '✅ Daily DSA Complete!',
        message: 'Great job staying consistent! Keep the streak alive!',
        timestamp: new Date(),
      }
    });
  };

  const addCommit = () => {
    const newCount = weeklyCommits + 1;
    localStorage.setItem('weeklyCommits', newCount.toString());
    setWeeklyCommits(newCount);
    if (newCount >= 3) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'achievement',
          title: '✅ Weekly Commits Goal Met!',
          message: '3+ commits this week! Your XP is safe.',
          timestamp: new Date(),
        }
      });
    }
  };

  if (!user) return null;

  const handleSave = () => {
    dispatch({
      type: 'SET_USER',
      payload: {
        ...user,
        name: editData.name,
        degree: editData.degree,
        branch: editData.branch,
        year: editData.year,
        careerGoal: editData.careerGoal,
        interests: editData.interests.split(',').map(i => i.trim()).filter(i => i),
      }
    });
    setIsEditing(false);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: '✅ Profile Updated!',
        message: 'Your profile changes have been saved.',
        timestamp: new Date(),
      }
    });
  };

  const getTierGradient = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'mythic': return 'from-red-500 to-pink-500';
      case 'legend': return 'from-yellow-400 to-red-500';
      case 'platinum': return 'from-purple-500 to-indigo-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-amber-600 to-amber-800';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const nextLevelXp = user.level * 1000;
  const currentLevelXp = (user.level - 1) * 1000;
  const progressXp = user.xp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.min((progressXp / neededXp) * 100, 100);

  return (
    <div className={`p-3 sm:p-4 lg:p-6 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} min-h-screen pb-20 lg:pb-6`}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Warning Banner for Non-Negotiables */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3 sm:p-4 bg-red-900/50 border border-red-500 rounded-lg sm:rounded-xl flex items-center gap-3 sm:gap-4"
            >
              <Skull className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-red-300 font-bold text-sm sm:text-base">⚠️ NON-NEGOTIABLES WARNING</div>
                <div className="text-red-400 text-xs sm:text-sm">
                  You missed a daily DSA or weekly commits goal. Complete them NOW to avoid XP reset!
                </div>
              </div>
              <button 
                onClick={() => setShowWarning(false)}
                className="text-red-400 hover:text-red-300 flex-shrink-0"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nerdy Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl relative overflow-hidden`}
        >
          {/* Terminal-style background */}
          <div className="absolute inset-0 opacity-5">
            <div className="font-mono text-xs text-green-500 p-4 overflow-hidden">
              {Array(20).fill(null).map((_, i) => (
                <div key={i}>$ git commit -m "Grinding DSA {i}"</div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-green-500" />
                <h1 className={`text-2xl font-bold font-mono ${darkMode ? 'text-green-400' : 'text-gray-900'}`}>
                  ~/developer/profile
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? <><Save size={16} /> Save</> : <><Edit size={16} /> Edit</>}
              </motion.button>
            </div>

            {/* Profile Content */}
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-r ${getTierGradient(user.tier)} flex items-center justify-center text-white font-bold text-xl sm:text-2xl font-mono relative flex-shrink-0`}>
                {user.name.charAt(0).toUpperCase()}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                {isEditing ? (
                  <div className="space-y-2 sm:space-y-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm sm:text-base ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Name"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editData.degree}
                        onChange={e => setEditData(prev => ({ ...prev, degree: e.target.value }))}
                        className={`px-3 py-2 rounded-lg border font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={editData.branch}
                        onChange={e => setEditData(prev => ({ ...prev, branch: e.target.value }))}
                        className={`px-3 py-2 rounded-lg border font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Branch"
                      />
                      <input
                        type="number"
                        value={editData.year}
                        onChange={e => setEditData(prev => ({ ...prev, year: parseInt(e.target.value) || 1 }))}
                        className={`px-3 py-2 rounded-lg border font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        min={1} max={5}
                        placeholder="Year"
                      />
                    </div>
                    <input
                      type="text"
                      value={editData.careerGoal}
                      onChange={e => setEditData(prev => ({ ...prev, careerGoal: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Career Goal"
                    />
                    <input
                      type="text"
                      value={editData.interests}
                      onChange={e => setEditData(prev => ({ ...prev, interests: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Interests (comma separated)"
                    />
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-3 py-1 rounded text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className={`text-xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h2>
                      <div className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold font-mono bg-gradient-to-r ${getTierGradient(user.tier)} text-white`}>
                        {user.tier}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-green-400' : 'bg-gray-100 text-green-600'}`}>
                        Level {user.level}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-orange-400' : 'bg-gray-100 text-orange-600'}`}>
                        🔥 {user.streak} streak
                      </span>
                    </div>
                    <div className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Code className="inline w-4 h-4 mr-1" />
                      {user.degree} in {user.branch}, Year {user.year}
                    </div>
                    <div className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Target className="inline w-4 h-4 mr-1" />
                      {user.careerGoal}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total XP', value: user.xp.toLocaleString(), icon: Zap, color: 'text-purple-400' },
            { label: 'Level', value: user.level, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Streak', value: `${user.streak} days`, icon: Flame, color: 'text-orange-400' },
            { label: 'Rank', value: `#${user.rank || '??'}`, icon: Shield, color: 'text-cyan-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-lg sm:text-xl font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                    {stat.value}
                  </div>
                  <div className={`text-[10px] sm:text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Level Progress */}
        <motion.div
          className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="flex justify-between mb-2">
            <span className={`font-mono text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Level {user.level} → {user.level + 1}
            </span>
            <span className={`font-mono text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {progressXp}/{neededXp} XP
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className={`h-full rounded-full bg-gradient-to-r ${getTierGradient(user.tier)}`}
            />
          </div>
        </motion.div>

        {/* NON-NEGOTIABLES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border-2 border-red-500/50 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className={`text-xl font-bold font-mono ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              ⚠️ NON-NEGOTIABLES
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-mono bg-red-500/20 text-red-400`}>
              MISS = XP RESET TO 0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Daily DSA */}
            <div className={`p-4 rounded-xl border ${dailyDSA ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className={`w-5 h-5 ${dailyDSA ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={`font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Daily DSA Problem
                  </span>
                </div>
                {dailyDSA ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-400 text-sm font-mono animate-pulse">PENDING</span>
                )}
              </div>
              <p className={`text-sm font-mono mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Solve at least 1 DSA problem every day. No exceptions.
              </p>
              {!dailyDSA && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markDSAComplete}
                  className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-mono font-bold text-sm"
                >
                  ✅ Mark DSA Complete
                </motion.button>
              )}
              {dailyDSA && (
                <div className="text-green-400 text-sm font-mono text-center">
                  ✓ Completed for today!
                </div>
              )}
            </div>

            {/* Weekly Commits */}
            <div className={`p-4 rounded-xl border ${weeklyCommits >= 3 ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className={`w-5 h-5 ${weeklyCommits >= 3 ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span className={`font-bold font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Weekly GitHub Commits
                  </span>
                </div>
                <span className={`text-sm font-mono font-bold ${weeklyCommits >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {weeklyCommits}/3
                </span>
              </div>
              <p className={`text-sm font-mono mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Push at least 3 commits to GitHub every week.
              </p>
              {/* Progress bar */}
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-3 overflow-hidden`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((weeklyCommits / 3) * 100, 100)}%` }}
                  className={`h-full rounded-full ${weeklyCommits >= 3 ? 'bg-green-500' : 'bg-yellow-500'}`}
                />
              </div>
              {weeklyCommits < 3 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addCommit}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-mono font-bold text-sm"
                >
                  + Log Commit
                </motion.button>
              )}
              {weeklyCommits >= 3 && (
                <div className="text-green-400 text-sm font-mono text-center">
                  ✓ Weekly goal achieved!
                </div>
              )}
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} border border-red-500/30`}>
            <p className={`text-sm font-mono ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
              <Skull className="inline w-4 h-4 mr-1" />
              <strong>WARNING:</strong> Missing daily DSA or weekly commits will reset ALL your XP to 0. 
              These are non-negotiable requirements for serious developers. No excuses.
            </p>
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div
          className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h4 className={`text-sm font-bold font-mono mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Coffee className="inline w-4 h-4 mr-1" /> Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-lg text-xs font-mono ${
                  darkMode ? 'bg-gray-700 text-green-400 border border-green-500/30' : 'bg-gray-100 text-green-600'
                }`}
              >
                #{interest}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
