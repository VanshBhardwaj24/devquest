import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProfileSetup } from './components/Profile/ProfileSetup';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TaskBoard } from './components/Tasks/TaskBoard';
import { AchievementWall } from './components/Achievements/AchievementWall';
import { CareerRoadmap } from './components/Questline/CareerRoadmap';
import { LeaderBoard } from './components/Social/LeaderBoard';
import { ProfileCard } from './components/Profile/ProfileCard';
import { CodingArena } from './components/Coding/CodingArena';
import { LevelUpModal } from './components/Gamification/LevelUpModal';
import { ConfettiProvider } from './components/Gamification/ConfettiProvider';
import { BadgeUnlockModal } from './components/Gamification/BadgeUnlockModal';
import { BonusXPIndicator } from './components/Gamification/BonusXPIndicator';
import { RewardsShop } from './components/Rewards/RewardsShop';
import { GamificationHub } from './components/Gamification/GamificationHub';
import { IntegrationsHub } from './components/Integrations/IntegrationsHub';
import { Fitness } from './components/Life/Fitness';
import { Accountability } from './components/Life/Accountability';
import { Finance } from './components/Life/Finance';
import { Relationships } from './components/Life/Relationships';
import { Learning } from './components/Life/Learning';
import { LifeMap } from './components/Life/LifeMap';
import { Toaster } from 'react-hot-toast';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border-4 border-red-500 brutal-shadow p-8 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-black text-red-500 mb-4 font-mono">SYSTEM CRASH</h2>
            <p className="text-gray-400 mb-6 font-mono text-sm">
              Critical error detected. Memory dump in progress...
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-red-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-red-400 transition-colors"
            >
              🔄 REBOOT SYSTEM
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-24 h-24 mx-auto mb-6 bg-lime-500 border-4 border-black brutal-shadow flex items-center justify-center"
        >
          <span className="text-4xl">🚀</span>
        </motion.div>
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-black text-white mb-2 font-mono"
        >
          LOADING<span className="text-lime-400">...</span>
        </motion.h2>
        <p className="text-gray-500 font-mono text-sm">Initializing DevQuest</p>
        
        <motion.div 
          className="mt-8 flex justify-center space-x-2"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scaleY: [1, 2, 1],
                backgroundColor: ['#84cc16', '#22d3ee', '#84cc16']
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.1 
              }}
              className="w-2 h-6 bg-lime-500"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Error Display Component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border-4 border-orange-500 brutal-shadow p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">🔌</div>
        <h2 className="text-2xl font-black text-orange-500 mb-4 font-mono">CONNECTION LOST</h2>
        <p className="text-gray-400 mb-6 font-mono text-sm">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="w-full px-6 py-3 bg-orange-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-orange-400 transition-colors"
        >
          🔄 RECONNECT
        </motion.button>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const { state } = useApp();
  const { user: authUser, loading: authLoading, error: authError, isDemoMode } = useAuth();
  const { user, isSetupComplete, darkMode, loading } = state;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ newLevel: 1, xpGained: 0 });
  const [retryCount, setRetryCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for level up
  useEffect(() => {
    if (user) {
      const currentLevel = Math.floor(user.xp / 1000) + 1;
      if (currentLevel > user.level) {
        setLevelUpData({ newLevel: currentLevel, xpGained: user.xp - (user.level - 1) * 1000 });
        setShowLevelUpModal(true);
      }
    }
  }, [user?.xp, user?.level]);

  // Handle retry for auth errors
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  // Show error screen for auth errors (but not in demo mode)
  if (authError && !isDemoMode && retryCount < 3) {
    return <ErrorDisplay error={authError} onRetry={handleRetry} />;
  }

  // Show loading screen
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Show auth form if not authenticated
  if (!authUser) {
    return <AuthForm onSuccess={() => {}} />;
  }

  // Show profile setup if not complete
  if (!isSetupComplete || !user) {
    return <ProfileSetup />;
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard />;
        case 'coding':
          return <CodingArena />;
        case 'gamification':
          return <GamificationHub />;
        case 'rewards':
          return <RewardsShop />;
        case 'tasks':
          return <TaskBoard />;
        case 'fitness':
          return <Fitness />;
        case 'accountability':
          return <Accountability />;
        case 'finance':
          return <Finance />;
        case 'relationships':
          return <Relationships />;
        case 'learning':
          return <Learning />;
        case 'lifemap':
          return <LifeMap />;
        case 'achievements':
          return <AchievementWall />;
        case 'questline':
          return <CareerRoadmap />;
        case 'integrations':
          return <IntegrationsHub />;
        case 'leaderboard':
          return <LeaderBoard />;
        case 'profile':
          return (
            <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
              <div className="max-w-4xl mx-auto">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
                  Profile 👤
                </h1>
                <ProfileCard />
              </div>
            </div>
          );
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Something went wrong
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Unable to load this section. Please try refreshing the page.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
            >
              🔄 Refresh Page
            </motion.button>
          </motion.div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar */}
        <div className={`
          fixed lg:block
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }} 
          />
        </div>
        
        {/* Main Content - Add left margin to account for sidebar */}
        <div className="flex-1 lg:ml-[260px] overflow-auto min-h-screen bg-[#0a0a0a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Gamification Overlays */}
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        newLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
      />
      
      <BadgeUnlockModal />
      <BonusXPIndicator />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900',
          style: {
            background: darkMode ? '#1F2937' : '#FFFFFF',
            color: darkMode ? '#FFFFFF' : '#111827',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ConfettiProvider>
          <AppContent />
        </ConfettiProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;