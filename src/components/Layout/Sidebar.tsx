import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Trophy,
  Swords,
  Users,
  Map,
  Settings,
  HelpCircle,
  CheckSquare,
  Flame,
  Sparkles,
  Gift,
  Gamepad2,
  Plug,
  Dumbbell,
  DollarSign,
  Heart,
  BookOpen,
  Shield,
  Target
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { state } = useApp();
  const { user, xpSystem, tasks, codingStats } = state;

  // Simple dynamic values
  const currentXP = xpSystem?.currentXP || user?.xp || 0;
  const level = xpSystem?.currentLevel || user?.level || 1;
  const streak = user?.streak || codingStats?.currentStreak || 0;
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const pendingTasks = totalTasks - completedTasks;
  
  // XP progress calculation - matches AppContext formula
  const getXPForLevel = (lvl: number) => Math.floor(1000 * Math.pow(1.1, lvl - 1));
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level + 1);
  const progressXP = Math.max(0, currentXP - xpForCurrentLevel);
  const neededXP = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(Math.max((progressXP / neededXP) * 100, 0), 100);
  
  // Streak multiplier
  const xpMultiplier = useMemo(() => {
    return (1 + streak * 0.1).toFixed(1);
  }, [streak]);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'lime', desc: 'Home' },
    { id: 'tasks', label: 'Quests', icon: CheckSquare, color: 'cyan', desc: `${pendingTasks} pending` },
    { id: 'coding', label: 'Arena', icon: Swords, color: 'orange', desc: 'Challenges' },
    { id: 'gamification', label: 'Power-Ups', icon: Gamepad2, color: 'magenta', desc: 'Boosts' },
  ];

  const lifeCategories = [
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'lime', desc: 'Gym & Health' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'cyan', desc: 'Money & Wealth' },
    { id: 'relationships', label: 'Social', icon: Heart, color: 'magenta', desc: 'Connections' },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: 'orange', desc: 'Skills & Books' },
    { id: 'accountability', label: 'Accountability', icon: Shield, color: 'lime', desc: 'Punishments' },
    { id: 'lifemap', label: 'Life Map', icon: Map, color: 'cyan', desc: 'Progress View' },
  ];

  const progressTabs = [
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'lime', desc: 'Badges' },
    { id: 'questline', label: 'Roadmap', icon: Target, color: 'cyan', desc: 'Career path' },
    { id: 'integrations', label: 'Integrations', icon: Plug, color: 'orange', desc: 'Connect apps' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users, color: 'magenta', desc: 'Rankings' },
    { id: 'rewards', label: 'Shop', icon: Gift, color: 'lime', desc: 'Rewards' },
  ];

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: Settings, color: 'lime', desc: 'Settings' },
    { id: 'help', label: 'Help', icon: HelpCircle, color: 'cyan', desc: 'Guide' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { active: string; hover: string; icon: string }> = {
      lime: { active: 'bg-lime-500 text-black border-lime-400', hover: 'hover:bg-lime-500/20 hover:border-lime-500/50', icon: 'text-lime-400' },
      cyan: { active: 'bg-cyan-500 text-black border-cyan-400', hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/50', icon: 'text-cyan-400' },
      magenta: { active: 'bg-fuchsia-500 text-black border-fuchsia-400', hover: 'hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50', icon: 'text-fuchsia-400' },
      orange: { active: 'bg-orange-500 text-black border-orange-400', hover: 'hover:bg-orange-500/20 hover:border-orange-500/50', icon: 'text-orange-400' },
    };
    return isActive ? colors[color].active : `${colors[color].hover} ${colors[color].icon}`;
  };

  const renderTabGroup = (tabs: typeof mainTabs, title: string) => (
    <div className="mb-3 sm:mb-4">
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 mb-1.5 sm:mb-2">
        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-lime-500 flex-shrink-0" />
        <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wide truncate">{title}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
      </div>
      <div className="space-y-1 px-1.5 sm:px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-transparent font-medium text-xs sm:text-sm transition-all rounded ${getColorClasses(tab.color, isActive)} ${isActive ? 'brutal-shadow translate-x-0.5 sm:translate-x-1' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
              <div className="flex-1 text-left min-w-0">
                <span className={`block truncate ${isActive ? 'text-black' : 'text-gray-300'}`}>{tab.label}</span>
                <span className={`text-[9px] sm:text-[10px] truncate ${isActive ? 'text-black/60' : 'text-gray-500'}`}>{tab.desc}</span>
              </div>
              {isActive && <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] lg:w-[260px] xl:w-[280px] flex flex-col bg-[#0d0d0d] border-r-4 border-lime-500/30 z-40 lg:z-30">
      {/* Logo */}
      <div className="p-3 sm:p-4 border-b-4 border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-lime-500 border-2 border-black brutal-shadow flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
            </div>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-black text-white truncate">DEV<span className="text-lime-400">QUEST</span></h1>
            <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">Level up your career</p>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="p-2 sm:p-3 border-b-4 border-gray-800">
        <div className="brutal-card bg-gray-900 p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-lime-500 border border-black flex items-center justify-center font-bold text-black text-xs sm:text-sm flex-shrink-0">{level}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">Level</p>
                <p className="text-xs sm:text-sm text-lime-400 font-bold truncate">{user?.tier || 'Novice'}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[9px] sm:text-[10px] text-gray-500">XP</p>
              <p className="text-xs sm:text-sm text-cyan-400 font-medium whitespace-nowrap">{Math.floor(progressXP / 1000)}k/{Math.floor(neededXP / 1000)}k</p>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="h-2 sm:h-3 bg-gray-800 border border-gray-700 overflow-hidden mb-2 sm:mb-3 rounded">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1 }} 
              className="h-full bg-gradient-to-r from-lime-500 to-cyan-400"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            <div className="bg-gray-800 p-1.5 sm:p-2 rounded">
              <span className="text-[9px] sm:text-[10px] text-gray-500 block truncate">Boost</span>
              <span className="text-[10px] sm:text-xs text-lime-400 font-bold">{xpMultiplier}x</span>
            </div>
            <div className="bg-gray-800 p-1.5 sm:p-2 rounded">
              <span className="text-[9px] sm:text-[10px] text-gray-500 block truncate">Tasks</span>
              <span className="text-[10px] sm:text-xs text-cyan-400 font-bold truncate">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="bg-gray-800 p-1.5 sm:p-2 rounded flex items-center justify-center gap-0.5 sm:gap-1">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs text-orange-400 font-bold">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 sm:py-3 scrollbar-hide">
        {renderTabGroup(mainTabs, 'Main')}
        {renderTabGroup(lifeCategories, 'Life')}
        {renderTabGroup(progressTabs, 'Progress')}
        {renderTabGroup(settingsTabs, 'Settings')}
      </nav>
    </aside>
  );
}
