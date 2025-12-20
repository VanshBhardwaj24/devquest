import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Swords, Gamepad2, Gift } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const { state } = useApp();
  const { tasks, codingStats, user } = state;
  
  const completedTasks = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const pendingTasks = totalTasks - completedTasks;
  const streak = codingStats?.currentStreak || user?.streak || 0;

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, badge: null },
    { id: 'tasks', label: 'Quests', icon: CheckSquare, badge: pendingTasks > 0 ? pendingTasks : null },
    { id: 'coding', label: 'Arena', icon: Swords, badge: null },
    { id: 'gamification', label: 'Rewards', icon: Gamepad2, badge: streak > 0 ? '🔥' : null },
    { id: 'rewards', label: 'Shop', icon: Gift, badge: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t-4 border-lime-500/30 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1"
            >
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    size={22}
                    className={isActive ? 'text-lime-400' : 'text-gray-500'}
                  />
                </motion.div>
                {tab.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-lime-500 border-2 border-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black text-black"
                  >
                    {typeof tab.badge === 'number' ? tab.badge : tab.badge}
                  </motion.div>
                )}
              </div>
              <span
                className={`text-[10px] font-bold ${
                  isActive ? 'text-lime-400' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-lime-500"
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

