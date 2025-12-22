import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { 
  Zap, Trophy, Target, Star, Crown,
  TrendingUp, Gift, Shield,
  CheckCircle, Rocket, Flame, ArrowUp, Clock,
  Activity, Terminal, Crosshair, Map, Database,
  Cpu, Battery, Signal, Wifi, Menu, User, Briefcase
} from 'lucide-react';  
import { LootBoxOpener } from '../Gamification/LootBoxOpener';
import { EnergySystem } from '../Gamification/EnergySystem';
import { DailyMissions } from '../Gamification/DailyMissions';
import { Mindfulness } from '../Life/Mindfulness';
import { Networking } from '../Life/Networking';
import { BucketList } from '../Life/BucketList';
import { Accountability } from '../Life/Accountability';

import { Achievements } from './Achievements';
import { ErrorBoundary } from '../ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { user, xpSystem, tasks, codingStats, darkMode, systemLogs, vitality } = state;
  const [activeTab, setActiveTab] = useState('overview');
  
  // System Clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stats Calculation
  const stats = useMemo(() => {
    const currentLevel = xpSystem?.currentLevel || user?.level || 1;
    const currentXP = xpSystem?.currentXP || user?.xp || 0;
    const streak = codingStats?.currentStreak || user?.streak || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const totalTasks = tasks?.length || 0;
    
    const getXPForLevel = (level: number) => Math.floor(1000 * Math.pow(1.1, level - 1));
    const xpForCurrentLevel = getXPForLevel(currentLevel);
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const levelXP = Math.max(0, currentXP - xpForCurrentLevel);
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    const levelProgress = Math.min(Math.max((levelXP / neededXP) * 100, 0), 100);

    return {
      level: currentLevel,
      xp: currentXP,
      progress: levelProgress,
      streak,
      taskRate: totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0,
      nextLevelXP: xpForNextLevel - currentXP
    };
  }, [xpSystem, user, tasks, codingStats]);

  // Priority Tasks Logic
  const priorityTasks = useMemo(() => {
    return [...tasks]
      .filter(t => !t.completed)
      .sort((a, b) => {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
        const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
        return pB - pA;
      })
      .slice(0, 5);
  }, [tasks]);

  const handleManualStreakCheck = () => {
    dispatch({ type: 'CHECK_DAILY_RESET' });
    dispatch({ 
        type: 'ADD_SYSTEM_LOG', 
        payload: { 
            id: Date.now().toString(), 
            timestamp: new Date(), 
            message: 'Manual streak sync initiated...', 
            type: 'info' 
        } 
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DailyMissions />
            
            {/* Priority Targets */}
            <Card variant="brutal" className={`min-h-[300px] relative ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
              <CardHeader className="border-b-2 border-black pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center gap-2 uppercase text-sm font-bold">
                    <Target className="h-5 w-5 text-red-500" /> Priority Targets
                  </span>
                  <Button variant="brutal" size="sm" className="text-xs h-8 shadow-[2px_2px_0px_0px_#000]">
                    + New Target
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 {priorityTasks.map((task) => (
                   <div key={task.id} className={`flex items-center justify-between p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all ${darkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                     <div className="flex items-center gap-3">
                       <div className={`h-3 w-3 border border-black ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                       <div>
                         <div className="text-sm font-bold uppercase">{task.title}</div>
                         <div className="text-xs opacity-70 font-mono">{task.category || 'General'} • {task.difficulty}</div>
                       </div>
                     </div>
                     <Button 
                        onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: true } })}
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-green-500 hover:text-white border border-transparent hover:border-black rounded-none"
                     >
                       <CheckCircle className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
                 {priorityTasks.length === 0 && (
                   <div className="text-center py-10 opacity-50">
                     <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                     <p>No active targets. Systems idle.</p>
                   </div>
                 )}
              </CardContent>
            </Card>

            <Accountability />
          </div>
        );
      case 'achievements':
        return <Achievements />;
      case 'career':
        return <Accountability />;
      default:
        return <div className="p-4">Module under construction...</div>;
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 overflow-x-hidden font-mono ${darkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-black'}`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} 
      />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header / Status Bar */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Operator Level */}
          <Card variant="brutal" className={`flex flex-col justify-between p-4 ${darkMode ? 'bg-zinc-900 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-white border-black shadow-[8px_8px_0px_0px_#000]'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-black tracking-widest text-lg uppercase font-mono">Operator Level</h2>
                <div className="text-xs font-bold bg-black text-white px-2 py-0.5 inline-block mt-1">CLASS: NETRUNNER</div>
              </div>
              <Crown className="h-6 w-6" />
            </div>
            
            <div className="flex items-end gap-4 mt-4">
              <div className={`h-20 w-20 border-4 border-black flex items-center justify-center relative ${darkMode ? 'bg-zinc-800 text-white' : 'bg-yellow-400 text-black'}`}>
                <span className="text-4xl font-black">{stats.level}</span>
                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] px-1 font-bold">LVL</div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold mb-1 uppercase">
                  <span>Progress</span>
                  <span>{Math.floor(stats.progress)}%</span>
                </div>
                <div className="w-full h-6 border-2 border-black bg-gray-200 dark:bg-zinc-800 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    className="h-full bg-green-500 border-r-2 border-black" 
                  />
                  {/* Stripes pattern overlay */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
                </div>
                <div className="text-[10px] mt-1 font-bold text-right uppercase opacity-70">{stats.nextLevelXP} XP to Level {stats.level + 1}</div>
              </div>
            </div>
          </Card>

          {/* Vitality & Resources (Revamped) */}
          <Card variant="brutal" className={`flex flex-col justify-between p-4 space-y-4 ${darkMode ? 'bg-zinc-900 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-white border-black shadow-[8px_8px_0px_0px_#000]'}`}>
            {/* Energy Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-xs flex items-center gap-2 uppercase">
                  <Zap className="h-4 w-4 text-yellow-500" /> Vitality (Energy)
                </span>
                <span className="font-black text-xs bg-yellow-500 text-black px-1 border border-black">
                  {Math.floor(vitality?.energy?.current || 100)}/{vitality?.energy?.max || 100}
                </span>
              </div>
              <div className="w-full h-6 border-2 border-black bg-gray-200 dark:bg-zinc-800 relative">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${((vitality?.energy?.current || 100) / (vitality?.energy?.max || 100)) * 100}%` }}
                   className="h-full bg-yellow-500 border-r-2 border-black" 
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-black uppercase">{vitality?.mood?.label || 'Neutral'}</span>
                 </div>
              </div>
            </div>

            {/* Credits */}
            <div className={`flex items-center justify-between p-3 border-2 border-black relative overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-yellow-100'}`}>
              <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                <Database size={64} />
              </div>
              <div className="z-10">
                <span className="font-bold text-xs flex items-center gap-2 uppercase mb-1">
                  <Database className="h-3 w-3" /> Available Credits
                </span>
                <span className="font-black text-2xl tracking-tighter">
                  {(user?.gold || 0).toLocaleString()} <span className="text-sm">🪙</span>
                </span>
              </div>
              <Button size="sm" variant="brutal" className="h-8 text-xs z-10 bg-white dark:bg-black hover:bg-gray-100" onClick={() => dispatch({ type: 'UPDATE_USER', payload: { gold: (user?.gold || 0) + 100 } })}>ADD</Button>
            </div>
          </Card>

          {/* Time & System Status */}
          <Card variant="brutal" className={`flex flex-col justify-between p-4 relative overflow-hidden ${darkMode ? 'bg-zinc-900 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-white border-black shadow-[8px_8px_0px_0px_#000]'}`}>
             <div className="absolute top-2 right-2 flex gap-2">
               <div className="flex items-center gap-1 border border-black px-1 bg-green-500 text-black text-[10px] font-bold uppercase">
                  <div className="h-2 w-2 bg-black animate-pulse rounded-full" />
                  Online
               </div>
             </div>
             
             <div>
               <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                 System Time
               </div>
               <div className="text-5xl font-black tracking-tighter font-mono">
                 {time.toLocaleTimeString([], { hour12: false })}
               </div>
               <div className="text-xs font-bold uppercase mt-1 border-t-2 border-black inline-block pt-1">
                 {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </div>
             </div>
             
             <div className="mt-4 grid grid-cols-2 gap-2">
               <div className="border border-black p-1 text-center bg-blue-500 text-white text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                 Network: Secure
               </div>
               <div className="border border-black p-1 text-center bg-purple-500 text-white text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                 Sync: Active
               </div>
             </div>
          </Card>
        </header>

        {/* System Ticker */}
        <div className={`w-full overflow-hidden border-y-2 border-black mb-6 py-1 font-mono text-xs uppercase font-bold ${darkMode ? 'bg-zinc-900 text-white' : 'bg-yellow-400 text-black'}`}>
          <div className="whitespace-nowrap animate-marquee inline-block">
            SYSTEM STATUS: ONLINE /// TASKS PENDING: {tasks.filter(t => !t.completed).length} /// STREAK: {stats.streak} DAYS /// NEXT LEVEL IN: {stats.nextLevelXP} XP /// REMEMBER: CONSISTENCY IS KEY /// 
            SYSTEM STATUS: ONLINE /// TASKS PENDING: {tasks.filter(t => !t.completed).length} /// STREAK: {stats.streak} DAYS /// NEXT LEVEL IN: {stats.nextLevelXP} XP /// REMEMBER: CONSISTENCY IS KEY ///
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Navigation & Quick Stats */}
          <div className="lg:col-span-3 space-y-6">
             <Card variant="brutal" className={`p-0 overflow-hidden ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
               <div className={`p-3 border-b-2 border-black ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                 <h3 className="font-bold text-sm flex items-center gap-2 uppercase">
                   <Menu className="h-4 w-4" /> Quick Access
                 </h3>
               </div>
               <div className="p-3 grid grid-cols-2 gap-2">
                 <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'brutal'} size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <Activity className="h-3 w-3 mr-2" /> Overview
                 </Button>
                 <Button onClick={() => setActiveTab('career')} variant={activeTab === 'career' ? 'default' : 'brutal'} size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <Briefcase className="h-3 w-3 mr-2" /> Career
                 </Button>
                 <Button onClick={() => setActiveTab('achievements')} variant={activeTab === 'achievements' ? 'default' : 'brutal'} size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <Trophy className="h-3 w-3 mr-2" /> Stats
                 </Button>
                 <Button variant="brutal" size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <Map className="h-3 w-3 mr-2" /> Map
                 </Button>
                 <Button variant="brutal" size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <User className="h-3 w-3 mr-2" /> Social
                 </Button>
                 <Button variant="brutal" size="sm" className="justify-start text-xs font-bold uppercase h-9 w-full shadow-[2px_2px_0px_0px_#000]">
                   <Terminal className="h-3 w-3 mr-2" /> Settings
                 </Button>
               </div>
             </Card>

             <Card variant="brutal" className={`p-4 ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase">
                 <Flame className="h-4 w-4 text-orange-500" /> Streak Status
               </h3>
               <div className="text-center py-4 border-2 border-black bg-orange-500 text-white mb-4 shadow-[4px_4px_0px_0px_#000]">
                 <div className="text-5xl font-bold mb-1">
                   {stats.streak}
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest text-black bg-white inline-block px-2 border border-black">Day Streak</div>
               </div>
               <div className="grid grid-cols-7 gap-1 mt-4">
                 {[...Array(7)].map((_, i) => (
                   <div key={i} className={`h-8 border border-black ${i < (stats.streak % 7) ? 'bg-orange-500' : 'bg-gray-200 dark:bg-zinc-800'}`} />
                 ))}
               </div>
               <Button onClick={handleManualStreakCheck} size="sm" variant="ghost" className="w-full mt-2 text-[10px] uppercase border border-dashed border-black">
                 Sync Streak
               </Button>
             </Card>

             <Card variant="brutal" className={`p-4 min-h-[200px] ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
               <h3 className="font-bold text-sm mb-2 flex items-center gap-2 uppercase">
                 <Terminal className="h-4 w-4" /> System Log
               </h3>
               <div className={`font-mono text-[10px] space-y-1 p-2 border-2 border-black h-40 overflow-hidden relative ${darkMode ? 'bg-black text-green-400' : 'bg-gray-100 text-gray-800'}`}>
                 {systemLogs && systemLogs.length > 0 ? (
                    systemLogs.slice(0, 10).map((log) => (
                      <p key={log.id}>
                        <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'})}]</span> {'>'} <span className={log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-400' : ''}>{log.message}</span>
                      </p>
                    ))
                 ) : (
                   <>
                     <p>{'>'} System initialized...</p>
                     <p>{'>'} Waiting for input...</p>
                   </>
                 )}
               </div>
             </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-6">
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>

          {/* Right Column - Gamification & Social */}
          <div className="lg:col-span-3 space-y-6">
             <EnergySystem />
             
             <Card variant="brutal" className={`p-4 ${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'}`}>
               <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase">
                 <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
               </h3>
               <div className="space-y-3">
                 {[
                   { name: 'User_001', score: 9850, rank: 1 },
                   { name: 'NeonSamurai', score: 8720, rank: 2 },
                   { name: 'CodeNinja', score: 8540, rank: 3 },
                 ].map((player, i) => (
                   <div key={i} className={`flex items-center justify-between text-sm p-2 border-2 border-black ${i === 0 ? 'bg-yellow-400 text-black' : darkMode ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                     <div className="flex items-center gap-2">
                       <span className="font-bold">
                         #{player.rank}
                       </span>
                       <span>{player.name}</span>
                     </div>
                     <span className="font-bold">{player.score}</span>
                   </div>
                 ))}
               </div>
               <Button variant="brutal" className="w-full mt-4 text-xs shadow-[4px_4px_0px_0px_#000]">
                 VIEW GLOBAL RANKINGS
               </Button>
             </Card>

             <LootBoxOpener />
          </div>
          
        </div>
      </div>
    </div>
  );
}
