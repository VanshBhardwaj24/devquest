import { motion } from 'framer-motion';
import { Settings, Moon, Sun, LogOut, Flame, Zap, Crown, Menu, Gamepad2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../Notifications/NotificationCenter';
import { useMemo } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { state, dispatch } = useApp();
  const { user, darkMode, xpSystem, codingStats, tasks } = state;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const currentLevel = xpSystem?.currentLevel || user?.level || 1;
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const streak = codingStats?.currentStreak || user?.streak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;

  // Simple calculations
  const stats = useMemo(() => {
    // XP progress
    const xpForCurrentLevel = Math.floor(1000 * Math.pow(1.1, currentLevel - 1));
    const xpForPrevLevel = currentLevel > 1 ? Math.floor(1000 * Math.pow(1.1, currentLevel - 2)) : 0;
    const levelXP = currentXP - xpForPrevLevel;
    const neededXP = xpForCurrentLevel - xpForPrevLevel;
    const xpProgress = Math.min((levelXP / neededXP) * 100, 100);
    
    // Streak multiplier
    const multiplier = (1 + streak * 0.1).toFixed(1);
    
    // Task completion rate
    const completionRate = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
    
    // Daily XP earned
    const dailyXP = completedTasks * 75 + streak * 25;
    
    return {
      xpProgress,
      multiplier,
      completionRate,
      dailyXP,
      levelXP,
      neededXP
    };
  }, [currentXP, currentLevel, streak, completedTasks, totalTasks]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-[#0d0d0d] border-b-4 border-lime-500/30"
    >
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Menu Button (Mobile) & Logo & User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2 bg-gray-800 border-2 border-lime-500/50 text-lime-400 hover:bg-lime-500 hover:text-black transition-colors"
            >
              <Menu size={20} />
            </motion.button>
            
            {/* Logo - Desktop Only */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden lg:flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-lime-500 border-2 border-black brutal-shadow flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-base font-black text-white tracking-tight">
                  DEV<span className="text-lime-400">QUEST</span>
                </span>
                <div className="text-[9px] text-gray-500">
                  Level {currentLevel} • {user?.tier || 'Novice'}
                </div>
              </div>
            </motion.div>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-lime-400 to-cyan-400 border-2 border-black brutal-shadow flex items-center justify-center text-black font-black text-sm">
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 border border-black flex items-center justify-center text-[10px] font-black text-black"
                  >
                    {currentLevel}
                  </motion.div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-white">
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Crown size={10} className="text-yellow-400" />
                    <span className="text-[10px] text-gray-400 uppercase">
                      Level {currentLevel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Stats Cards */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* XP Progress */}
            <motion.div className="brutal-card bg-gray-900 border-lime-500/50 px-3 py-1.5" whileHover={{ y: -2 }}>
              <div className="flex items-center gap-2">
                <Zap className="text-lime-400" size={14} />
                <div>
                  <div className="text-[9px] text-gray-500">XP Today</div>
                  <div className="text-xs font-black text-lime-400">
                    +{stats.dailyXP}
                  </div>
                  <div className="w-14 h-1 bg-gray-800 border border-gray-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.xpProgress}%` }}
                      className="h-full bg-gradient-to-r from-lime-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Streak */}
            <motion.div className="brutal-card bg-gray-900 border-orange-500/50 px-3 py-1.5" whileHover={{ y: -2 }}>
              <div className="flex items-center gap-2">
                <motion.div animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>
                  <Flame className="text-orange-400" size={14} />
                </motion.div>
                <div>
                  <div className="text-[9px] text-gray-500">Streak</div>
                  <div className="text-xs font-black text-orange-400">
                    {streak} days
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Multiplier */}
            <motion.div className="brutal-card bg-gray-900 border-cyan-500/50 px-3 py-1.5" whileHover={{ y: -2 }}>
              <div className="flex items-center gap-2">
                <Zap className="text-cyan-400" size={14} />
                <div>
                  <div className="text-[9px] text-gray-500">Boost</div>
                  <div className="text-xs font-black text-cyan-400">
                    ×{stats.multiplier}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div className="brutal-card bg-gray-900 border-fuchsia-500/50 px-3 py-1.5 hidden lg:block" whileHover={{ y: -2 }}>
              <div className="flex items-center gap-2">
                <div className="text-fuchsia-400 text-sm">✓</div>
                <div>
                  <div className="text-[9px] text-gray-500">Tasks</div>
                  <div className="text-xs font-black text-fuchsia-400">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationCenter />

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className="p-2 bg-gray-800 border-2 border-gray-600 hover:border-lime-500 text-gray-300 hover:text-lime-400 transition-all"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex p-2 bg-gray-800 border-2 border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 transition-all"
              title="Settings"
            >
              <Settings size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 bg-red-900/50 border-2 border-red-500/50 hover:border-red-400 text-red-400 hover:text-red-300 transition-all"
              title="Sign out"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Stats Bar */}
      <div className="md:hidden border-t-2 border-gray-800 px-3 py-2 flex items-center justify-around gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-lime-500/30 rounded">
          <Zap className="text-lime-400" size={12} />
          <span className="text-[10px] font-bold text-lime-400">+{stats.dailyXP} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-orange-500/30 rounded">
          <Flame className="text-orange-400" size={12} />
          <span className="text-[10px] font-bold text-orange-400">{streak} days</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-cyan-500/30 rounded">
          <span className="text-[10px] font-bold text-cyan-400">×{stats.multiplier}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-fuchsia-500/30 rounded">
          <span className="text-[10px] font-bold text-fuchsia-400">{completedTasks}/{totalTasks}</span>
        </div>
      </div>
    </motion.header>
  );
}
