import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TaskBoard } from './components/Tasks/TaskBoard';
import { CodingArena } from './components/Coding/CodingArena';
import { DailyChallenge } from './components/Coding/DailyChallenge';
import { ChallengesManager } from './components/Coding/ChallengesManager';
import { GamificationHub } from './components/Gamification/GamificationHub';
import { ProfileSetup } from './components/Profile/ProfileSetup';
import { RewardsShop } from './components/Rewards/RewardsShop';
import { Fitness } from './components/Life/Fitness';
import { Accountability } from './components/Life/Accountability';
import { Finance } from './components/Life/Finance';
import { Relationships } from './components/Life/Relationships';
import { Learning } from './components/Life/Learning';
import { LifeMap } from './components/Life/LifeMap';
import { Mindfulness } from './components/Life/Mindfulness';
import { Networking } from './components/Life/Networking';
import { BucketList } from './components/Life/BucketList';
import { LevelUpModal } from './components/Gamification/LevelUpModal';
import { ConfettiProvider } from './components/Gamification/ConfettiProvider';
import { BadgeUnlockModal } from './components/Gamification/BadgeUnlockModal';
import { BonusXPIndicator } from './components/Gamification/BonusXPIndicator';
import { ProfileCard } from './components/Profile/ProfileCard';
import { MobileBottomNav } from './components/Layout/MobileBottomNav';
import { Help } from './components/Support/Help';
import { Toaster } from 'react-hot-toast';
import { AnalyticsDashboard } from './components/Progress/AnalyticsDashboard';
import { SkillTree } from './components/Progress/SkillTree';
import { ProjectShowcase } from './components/Progress/ProjectShowcase';
import { ActivityHeatmap } from './components/Progress/ActivityHeatmap';
import ErrorBoundary from './components/ErrorBoundary';
import { Life } from './components/Life/Life';
import { InternshipQuest } from './components/InternshipQuest';
import { PlacementPrep } from './components/Career/PlacementPrep';
import PlacementQuests from './components/Career/PlacementQuests';

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
  }, [user, user?.xp, user?.level]);

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
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskBoard />;
      case 'coding':
        return <CodingArena />;
      case 'challenges-daily':
        return (
          <div className="space-y-6">
            <DailyChallenge />
            <ChallengesManager frequency="Daily" />
          </div>
        );
      case 'challenges-weekly':
        return <ChallengesManager frequency="Weekly" />;
      case 'challenges-monthly':
        return <ChallengesManager frequency="Monthly" />;
      case 'gamification':
        return <GamificationHub />;
      case 'rewards':
        return <RewardsShop />;
      case 'fitness':
      case 'accountability':
      case 'finance':
      case 'relationships':
      case 'learning':
      case 'lifemap':
      case 'mindfulness':
      case 'networking':
      case 'bucketlist':
        return <Life section={activeTab} />;
      case 'internships':
        return <InternshipQuest />;
      case 'placement':
        return <PlacementPrep />;
      case 'placement-quests':
        return <PlacementQuests />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'skills':
        return <SkillTree />;
      case 'projects':
        return <ProjectShowcase />;
      case 'activity':
        return <ActivityHeatmap />;
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
      case 'help':
        return <Help />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0d0d0d] text-white' : 'bg-gray-100 text-gray-900'} font-sans selection:bg-lime-500/30`}>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '0px',
            border: '2px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
            fontFamily: 'monospace'
          },
        }}
      />
      
      <ConfettiProvider>
        {/* Level Up Modal */}
        <AnimatePresence>
          {showLevelUpModal && (
            <LevelUpModal 
              newLevel={levelUpData.newLevel} 
              xpGained={levelUpData.xpGained}
              onClose={() => setShowLevelUpModal(false)} 
            />
          )}
        </AnimatePresence>

        <BadgeUnlockModal />
        <BonusXPIndicator />

        {/* Main Layout */}
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 h-full border-r-4 border-gray-800 bg-[#111] overflow-y-auto custom-scrollbar">
            <ErrorBoundary fallback={<div className="p-4 text-red-500">Sidebar failed to load.</div>}>
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </ErrorBoundary>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-64 bg-[#111] z-50 border-r-4 border-gray-800 overflow-y-auto lg:hidden"
                >
                  <ErrorBoundary fallback={<div className="p-4 text-red-500">Sidebar failed to load.</div>}>
                    <Sidebar activeTab={activeTab} onTabChange={(tab) => {
                      setActiveTab(tab);
                      setSidebarOpen(false);
                    }} />
                  </ErrorBoundary>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 custom-scrollbar scroll-smooth">
              <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
                <ErrorBoundary fallback={<div className="p-4 text-red-500">Content failed to render.</div>}>
                  {renderContent()}
                </ErrorBoundary>
              </div>
            </main>
            
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </ConfettiProvider>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
