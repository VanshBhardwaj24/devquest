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
  Plug
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

  const progressTabs = [
    { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'lime', desc: 'Badges' },
    { id: 'questline', label: 'Roadmap', icon: Map, color: 'cyan', desc: 'Career path' },
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
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 mb-2">
        <Sparkles className="w-3 h-3 text-lime-500" />
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{title}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
      </div>
      <div className="space-y-1 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 border-2 border-transparent font-medium text-sm transition-all rounded ${getColorClasses(tab.color, isActive)} ${isActive ? 'brutal-shadow translate-x-1' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : ''}`} />
              <div className="flex-1 text-left">
                <span className={`block ${isActive ? 'text-black' : 'text-gray-300'}`}>{tab.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-gray-500'}`}>{tab.desc}</span>
              </div>
              {isActive && <Sparkles className="w-3 h-3 text-black" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col bg-[#0d0d0d] border-r-4 border-lime-500/30 z-40">
      {/* Logo */}
      <div className="p-4 border-b-4 border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-lime-500 border-2 border-black brutal-shadow flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-black" />
            </div>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">DEV<span className="text-lime-400">QUEST</span></h1>
            <p className="text-[10px] text-gray-500">Level up your career</p>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="p-3 border-b-4 border-gray-800">
        <div className="brutal-card bg-gray-900 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-500 border border-black flex items-center justify-center font-bold text-black text-sm">{level}</div>
              <div>
                <p className="text-[10px] text-gray-500">Level</p>
                <p className="text-sm text-lime-400 font-bold">{user?.tier || 'Novice'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">XP Progress</p>
              <p className="text-sm text-cyan-400 font-medium">{progressXP.toLocaleString()}/{neededXP.toLocaleString()}</p>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="h-3 bg-gray-800 border border-gray-700 overflow-hidden mb-3 rounded">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1 }} 
              className="h-full bg-gradient-to-r from-lime-500 to-cyan-400"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-[10px] text-gray-500 block">Boost</span>
              <span className="text-xs text-lime-400 font-bold">{xpMultiplier}x</span>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <span className="text-[10px] text-gray-500 block">Tasks</span>
              <span className="text-xs text-cyan-400 font-bold">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="bg-gray-800 p-2 rounded flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-400 font-bold">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {renderTabGroup(mainTabs, 'Main')}
        {renderTabGroup(progressTabs, 'Progress')}
        {renderTabGroup(settingsTabs, 'Settings')}
      </nav>
    </aside>
  );
}
