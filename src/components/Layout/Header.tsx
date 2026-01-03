import { motion } from 'framer-motion';
import { Settings, Moon, Sun, LogOut, Flame, Zap, Crown, Menu, Gamepad2, Cpu } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../Notifications/NotificationCenter';
import { useMemo } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
  onOpenNeuralLink?: () => void;
}

export function Header({ onMenuClick, onOpenNeuralLink }: HeaderProps) {
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
    
    return {
      xpProgress,
      multiplier,
      completionRate,
      totalXP: currentXP,
      levelXP,
      neededXP
    };
  }, [currentXP, currentLevel, streak, completedTasks, totalTasks]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-[55] bg-black/90 backdrop-blur-md border-b border-neon-blue/20 shadow-[0_4px_20px_rgba(0,243,255,0.1)]"
    >
      {/* Grainy Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      
      <div className="px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Menu Button (Mobile) & Logo & User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2 bg-black/50 border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/20 transition-colors relative z-[60] shadow-[0_0_10px_rgba(0,243,255,0.2)]"
            >
              <Menu size={20} />
            </motion.button>
            
            {/* Logo - Desktop Only */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden lg:flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-black border border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)] flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-neon-blue/10 group-hover:bg-neon-blue/20 transition-colors" />
                <Gamepad2 className="w-6 h-6 text-neon-blue relative z-10" />
              </div>
              <div>
                <span className="text-base font-black text-white tracking-tight font-cyber">
                  DEV<span className="text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">QUEST</span>
                </span>
                <div className="text-[9px] text-gray-400 font-mono">
                  Level {currentLevel} • {user?.tier || 'Novice'}
                </div>
              </div>
            </motion.div>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.3)] flex items-center justify-center text-neon-purple font-black text-sm font-mono relative overflow-hidden group">
                    <div className="absolute inset-0 bg-neon-purple/10 group-hover:bg-neon-purple/20 transition-colors" />
                    <span className="relative z-10">{user.avatar || user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-black border border-neon-pink flex items-center justify-center text-[10px] font-black text-neon-pink shadow-[0_0_5px_rgba(236,72,153,0.5)]"
                  >
                    {currentLevel}
                  </motion.div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-white font-cyber tracking-wide">
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Crown size={10} className="text-neon-yellow" />
                    <span className="text-[10px] text-gray-400 uppercase font-mono">
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
            <motion.div className="bg-black/50 border border-neon-blue/30 px-3 py-1.5 hover:border-neon-blue/60 transition-colors group relative overflow-hidden" whileHover={{ y: -2 }}>
              <div className="absolute inset-0 bg-neon-blue/5 group-hover:bg-neon-blue/10 transition-colors" />
              <div className="flex items-center gap-2 relative z-10">
                <Zap className="text-neon-blue" size={14} />
                <div>
                  <div className="text-[9px] text-gray-400 font-mono">Total XP</div>
                  <div className="text-xs font-black text-neon-blue font-mono shadow-neon-blue">
                    {stats.totalXP.toLocaleString()}
                  </div>
                  <div className="w-14 h-1 bg-gray-900 border border-gray-800 overflow-hidden mt-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.xpProgress}%` }}
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_5px_rgba(0,243,255,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Streak */}
            <motion.div className="bg-black/50 border border-neon-purple/30 px-3 py-1.5 hover:border-neon-purple/60 transition-colors group relative overflow-hidden" whileHover={{ y: -2 }}>
              <div className="absolute inset-0 bg-neon-purple/5 group-hover:bg-neon-purple/10 transition-colors" />
              <div className="flex items-center gap-2 relative z-10">
                <motion.div animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>
                  <Flame className="text-neon-purple" size={14} />
                </motion.div>
                <div>
                  <div className="text-[9px] text-gray-400 font-mono">Streak</div>
                  <div className="text-xs font-black text-neon-purple font-mono">
                    {streak} days
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Multiplier */}
            <motion.div className="bg-black/50 border border-neon-pink/30 px-3 py-1.5 hover:border-neon-pink/60 transition-colors group relative overflow-hidden" whileHover={{ y: -2 }}>
              <div className="absolute inset-0 bg-neon-pink/5 group-hover:bg-neon-pink/10 transition-colors" />
              <div className="flex items-center gap-2 relative z-10">
                <Zap className="text-neon-pink" size={14} />
                <div>
                  <div className="text-[9px] text-gray-400 font-mono">Boost</div>
                  <div className="text-xs font-black text-neon-pink font-mono">
                    ×{stats.multiplier}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div className="bg-black/50 border border-neon-yellow/30 px-3 py-1.5 hidden lg:block hover:border-neon-yellow/60 transition-colors group relative overflow-hidden" whileHover={{ y: -2 }}>
              <div className="absolute inset-0 bg-neon-yellow/5 group-hover:bg-neon-yellow/10 transition-colors" />
              <div className="flex items-center gap-2 relative z-10">
                <div className="text-neon-yellow text-sm">✓</div>
                <div>
                  <div className="text-[9px] text-gray-400 font-mono">Tasks</div>
                  <div className="text-xs font-black text-neon-yellow font-mono">
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
              onClick={() => {
                if (onOpenNeuralLink) {
                  onOpenNeuralLink();
                } else {
                  window.dispatchEvent(new CustomEvent('open-ai'));
                }
              }}
              className="p-2 bg-black/50 border border-neon-purple/30 hover:border-neon-purple text-neon-purple transition-all group relative overflow-hidden"
              title="Neural Link"
            >
              <div className="absolute inset-0 bg-neon-purple/0 group-hover:bg-neon-purple/10 transition-colors" />
              <div className="flex items-center gap-1">
                <Cpu size={16} />
                <span className="text-[10px] font-mono">AI</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className="p-2 bg-black/50 border border-gray-800 hover:border-neon-blue text-gray-400 hover:text-neon-blue transition-all group relative overflow-hidden"
              title="Toggle theme"
            >
              <div className="absolute inset-0 bg-neon-blue/0 group-hover:bg-neon-blue/10 transition-colors" />
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex p-2 bg-black/50 border border-gray-800 hover:border-neon-purple text-gray-400 hover:text-neon-purple transition-all group relative overflow-hidden"
              title="Settings"
            >
              <div className="absolute inset-0 bg-neon-purple/0 group-hover:bg-neon-purple/10 transition-colors" />
              <Settings size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="p-2 bg-red-950/30 border border-red-900/50 hover:border-red-500 text-red-500/70 hover:text-red-500 transition-all group relative overflow-hidden"
              title="Sign out"
            >
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Stats Bar */}
      <div className="md:hidden border-t border-gray-800 bg-black/80 backdrop-blur px-3 py-2 flex items-center justify-around gap-2 relative z-10">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 border border-neon-blue/30 rounded">
          <Zap className="text-neon-blue" size={12} />
          <span className="text-[10px] font-bold text-neon-blue font-mono">{stats.totalXP.toLocaleString()} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 border border-neon-purple/30 rounded">
          <Flame className="text-neon-purple" size={12} />
          <span className="text-[10px] font-bold text-neon-purple font-mono">{streak} days</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 border border-neon-pink/30 rounded">
          <span className="text-[10px] font-bold text-neon-pink font-mono">×{stats.multiplier}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 border border-neon-yellow/30 rounded">
          <span className="text-[10px] font-bold text-neon-yellow font-mono">{completedTasks}/{totalTasks}</span>
        </div>
      </div>
    </motion.header>
  );
}
