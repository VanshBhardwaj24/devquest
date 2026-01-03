import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Trophy, Zap, Target, Save, X, 
  Terminal, Code, GitBranch, AlertTriangle, CheckCircle,
  Flame, Shield, Skull, Coffee, Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

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
    <div className={`p-4 md:p-6 space-y-6 ${darkMode ? 'bg-black' : 'bg-gray-50'} min-h-screen pb-24`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Warning Banner for Non-Negotiables */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-4 mb-6 backdrop-blur-sm"
            >
              <Skull className="w-8 h-8 text-red-500 animate-pulse" />
              <div className="flex-1">
                <div className="text-red-400 font-bold font-cyber tracking-wide">⚠️ CRITICAL SYSTEM FAILURE IMMINENT</div>
                <div className="text-red-300/80 text-sm font-mono">
                  Non-negotiable protocols breached. Execute recovery tasks immediately to prevent XP wipe.
                </div>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setShowWarning(false)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Header */}
        <Card variant="neon" className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${getTierGradient(user.tier)} p-[2px] relative group-hover:shadow-[0_0_20px_rgba(var(--neon-blue),0.3)] transition-all duration-500`}>
                  <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center relative overflow-hidden">
                    <span className="text-3xl font-bold font-cyber text-white z-10">{user.name.charAt(0).toUpperCase()}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Rotating border effect */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-4px] border border-dashed border-white/20 rounded-xl pointer-events-none"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3">
                   <Badge variant="outline" className="bg-black border-neon-yellow text-neon-yellow font-bold shadow-[0_0_10px_rgba(var(--neon-yellow),0.3)]">
                    Lvl {user.level}
                   </Badge>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="space-y-1">
                        {isEditing ? (
                            <div className="space-y-3 max-w-md">
                                <Input
                                    value={editData.name}
                                    onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Dev Name"
                                    className="bg-black/50 border-white/10"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={editData.degree}
                                        onChange={e => setEditData(prev => ({ ...prev, degree: e.target.value }))}
                                        placeholder="Degree"
                                        className="bg-black/50 border-white/10"
                                    />
                                    <Input
                                        value={editData.branch}
                                        onChange={e => setEditData(prev => ({ ...prev, branch: e.target.value }))}
                                        placeholder="Branch"
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                     <Input
                                        type="number"
                                        value={editData.year}
                                        onChange={e => setEditData(prev => ({ ...prev, year: parseInt(e.target.value) || 1 }))}
                                        placeholder="Year"
                                        className="bg-black/50 border-white/10"
                                    />
                                    <Input
                                        value={editData.careerGoal}
                                        onChange={e => setEditData(prev => ({ ...prev, careerGoal: e.target.value }))}
                                        placeholder="Target Role"
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl md:text-3xl font-bold font-cyber text-white tracking-wide flex items-center gap-3">
                                    {user.name}
                                    <span className={`text-xs px-2 py-1 rounded border border-white/10 bg-white/5 font-mono text-gray-400`}>
                                        {user.tier}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                                    <Code className="w-4 h-4 text-neon-blue" />
                                    {user.degree} • {user.branch} • Year {user.year}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                                    <Target className="w-4 h-4 text-neon-purple" />
                                    Target: <span className="text-neon-purple">{user.careerGoal}</span>
                                </div>
                            </>
                        )}
                    </div>
                    
                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={isEditing ? "bg-neon-green text-black hover:bg-neon-green/90" : "border-neon-blue text-neon-blue hover:bg-neon-blue/10"}
                    >
                        {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                        {isEditing ? 'SAVE' : 'EDIT'}
                    </Button>
                </div>

                {/* Level Progress Bar */}
                <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                        <span>XP PROGRESS</span>
                        <span className="text-neon-blue">{progressXp} / {neededXp} XP</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            className={`h-full bg-gradient-to-r ${getTierGradient(user.tier)} shadow-[0_0_10px_rgba(var(--neon-blue),0.5)]`}
                        />
                    </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: user.xp.toLocaleString(), icon: Zap, color: 'text-neon-yellow', border: 'border-neon-yellow/30' },
            { label: 'Rank', value: `#${user.rank || '??'}`, icon: Trophy, color: 'text-neon-purple', border: 'border-neon-purple/30' },
            { label: 'Streak', value: `${user.streak} Days`, icon: Flame, color: 'text-neon-orange', border: 'border-neon-orange/30' },
            { label: 'System', value: 'ONLINE', icon: Shield, color: 'text-neon-green', border: 'border-neon-green/30' },
          ].map((stat, i) => (
            <Card key={i} className={`bg-black/40 backdrop-blur-sm border-white/5 hover:border-opacity-50 transition-colors group`}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                    <div className={`p-2 rounded-full bg-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xl font-bold font-cyber text-white">{stat.value}</div>
                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>

        {/* Non-Negotiables */}
        <div className="space-y-4">
            <h3 className="text-lg font-cyber text-neon-red flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                NON-NEGOTIABLE PROTOCOLS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daily DSA */}
                <Card className={`bg-black/40 border-l-4 ${dailyDSA ? 'border-l-neon-green border-white/10' : 'border-l-neon-red border-red-500/30'}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                    <Code className={`w-4 h-4 ${dailyDSA ? 'text-neon-green' : 'text-neon-red'}`} />
                                    Daily DSA
                                </div>
                                <div className="text-xs font-mono text-gray-400">1 Problem / Day</div>
                            </div>
                            <Badge variant={dailyDSA ? "default" : "destructive"} className={dailyDSA ? "bg-neon-green/20 text-neon-green hover:bg-neon-green/30" : "bg-neon-red/20 text-neon-red hover:bg-neon-red/30"}>
                                {dailyDSA ? 'COMPLETED' : 'PENDING'}
                            </Badge>
                        </div>
                        
                        {!dailyDSA ? (
                             <Button 
                                onClick={markDSAComplete}
                                className="w-full bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/50"
                                size="sm"
                            >
                                MARK COMPLETE
                            </Button>
                        ) : (
                            <div className="text-center py-1 text-sm font-mono text-neon-green">
                                Protocol Satisfied
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Weekly Commits */}
                <Card className={`bg-black/40 border-l-4 ${weeklyCommits >= 3 ? 'border-l-neon-green border-white/10' : 'border-l-neon-yellow border-yellow-500/30'}`}>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                    <GitBranch className={`w-4 h-4 ${weeklyCommits >= 3 ? 'text-neon-green' : 'text-neon-yellow'}`} />
                                    Weekly Commits
                                </div>
                                <div className="text-xs font-mono text-gray-400">3 Commits / Week</div>
                            </div>
                            <Badge variant="outline" className={`${weeklyCommits >= 3 ? 'border-neon-green text-neon-green' : 'border-neon-yellow text-neon-yellow'}`}>
                                {weeklyCommits}/3
                            </Badge>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((weeklyCommits / 3) * 100, 100)}%` }}
                                    className={`h-full ${weeklyCommits >= 3 ? 'bg-neon-green' : 'bg-neon-yellow'}`}
                                />
                            </div>
                            <Button 
                                onClick={addCommit}
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs font-mono text-gray-400 hover:text-white h-6"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Log Manual Commit
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </div>
  );
}
