import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
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
  Dumbbell,
  DollarSign,
  Heart,
  BookOpen,
  Shield,
  BarChart3,
  Brain,
  Folder,
  Calendar,
  Globe
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Clock } from 'lucide-react';
import { StreakAnalytics } from '../Sidebar/StreakAnalytics';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { state } = useApp();
  const { user, xpSystem, tasks, codingStats } = state;
  const unreadNotifications = (state.notifications || []).filter(n => !n.read).length || 0;

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
    { id: 'internships', label: 'Internship Quest', icon: Briefcase, color: 'lime', desc: 'Job Hunt' },
    { id: 'placement', label: 'Placement Prep', icon: GraduationCap, color: 'orange', desc: 'Roadmap' },
    { id: 'placement-quests', label: 'Placemt', icon: CheckSquare, color: 'cyan', desc: 'Daily / Weekly / Monthly' },
    { id: 'tasks', label: 'Quests', icon: CheckSquare, color: 'cyan', desc: `${pendingTasks} pending` },
    { id: 'coding', label: 'Arena', icon: Swords, color: 'orange', desc: 'Challenges' },
    { id: 'gamification', label: 'Power-Ups', icon: Gamepad2, color: 'magenta', desc: 'Boosts' },
    { id: 'rewards', label: 'Shop', icon: Gift, color: 'lime', desc: 'Rewards' },
  ];

  const lifeCategories = [
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'lime', desc: 'Gym & Health' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'cyan', desc: 'Money & Wealth' },
    { id: 'relationships', label: 'Social', icon: Heart, color: 'magenta', desc: 'Connections' },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: 'orange', desc: 'Skills & Books' },
    { id: 'accountability', label: 'Accountability', icon: Shield, color: 'lime', desc: 'Punishments' },
    { id: 'lifemap', label: 'Life Map', icon: Map, color: 'cyan', desc: 'Progress View' },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'lime', desc: 'Meditation' },
    { id: 'networking', label: 'Networking', icon: Users, color: 'cyan', desc: 'Contacts' },
    { id: 'bucketlist', label: 'Bucket List', icon: Globe, color: 'magenta', desc: 'Dreams' },
  ];

  const progressTabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'lime', desc: 'Stats' },
    { id: 'skills', label: 'Skill Tree', icon: Brain, color: 'cyan', desc: 'Mastery' },
    { id: 'projects', label: 'Projects', icon: Folder, color: 'orange', desc: 'Showcase' },
    { id: 'activity', label: 'Activity', icon: Calendar, color: 'magenta', desc: 'Log' },
  ];

  const challengeTabs = [
    { id: 'challenges-daily', label: 'Daily Challenges', icon: Calendar, color: 'orange', desc: 'Today\'s goal' },
    { id: 'challenges-weekly', label: 'Weekly Challenges', icon: Clock, color: 'cyan', desc: 'This week' },
    { id: 'challenges-monthly', label: 'Monthly Challenges', icon: Calendar, color: 'magenta', desc: 'This month' },
  ];

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: Settings, color: 'lime', desc: unreadNotifications > 0 ? `${unreadNotifications} alerts` : 'Settings' },
    { id: 'help', label: 'Help', icon: HelpCircle, color: 'cyan', desc: unreadNotifications > 0 ? `${unreadNotifications} unread` : 'Guide' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { active: string; hover: string; icon: string }> = {
      lime: { active: 'bg-neon-blue/20 text-neon-blue border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]', hover: 'hover:bg-neon-blue/10 hover:border-neon-blue/30', icon: 'text-neon-blue' },
      cyan: { active: 'bg-neon-purple/20 text-neon-purple border-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.3)]', hover: 'hover:bg-neon-purple/10 hover:border-neon-purple/30', icon: 'text-neon-purple' },
      magenta: { active: 'bg-neon-pink/20 text-neon-pink border-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.3)]', hover: 'hover:bg-neon-pink/10 hover:border-neon-pink/30', icon: 'text-neon-pink' },
      orange: { active: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow shadow-[0_0_10px_rgba(250,204,21,0.3)]', hover: 'hover:bg-neon-yellow/10 hover:border-neon-yellow/30', icon: 'text-neon-yellow' },
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

      <StreakAnalytics />
      
       
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 sm:py-3 scrollbar-hide">
        {renderTabGroup(mainTabs, 'Main')}
        {renderTabGroup(lifeCategories, 'Life')}
        {renderTabGroup(challengeTabs, 'Challenges')}
        {renderTabGroup(progressTabs, 'Progress')}
        {renderTabGroup(settingsTabs, 'Settings')}
      </nav>
    </aside>
  );
}
