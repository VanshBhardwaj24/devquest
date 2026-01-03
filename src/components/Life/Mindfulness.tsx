import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Brain, Wind, CloudRain, Sun, Focus, Play } from 'lucide-react';
import { getLocalStorage, setLocalStorage, clamp } from '../../lib/utils';
import { appDataService } from '../../services/appDataService';
import { useAuth } from '../../hooks/useAuth';

export function Mindfulness() {
  const { state, dispatch } = useApp();
  const { user, darkMode } = state;
  const { user: authUser } = useAuth();
  const [activeSession, setActiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [stats, setStats] = useState<{ currentStreak: number; totalMinutes: number; averageMood: number; totalSessions: number }>({ currentStreak: 0, totalMinutes: 0, averageMood: 0, totalSessions: 0 });
  const [selectedType, setSelectedType] = useState<'focus' | 'calm' | 'anxiety' | 'morning'>('focus');
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [history, setHistory] = useState<{ id: string; type: string; duration: number; mood: number; date: string }[]>([]);

  useEffect(() => {
    if (user?.mindfulness) {
      setStats(user.mindfulness);
    }
  }, [user]);
  
  useEffect(() => {
    const saved = getLocalStorage('mindfulness_sessions', [] as typeof history);
    setHistory(Array.isArray(saved) ? saved.slice(0, 50) : []);
  }, []);

  useEffect(() => {
    const loadBackend = async () => {
      if (!authUser?.id) return;
      try {
        const data = await appDataService.getAppData(authUser.id);
        const payload = data?.mindfulness as { stats?: { currentStreak: number; totalMinutes: number; averageMood: number; totalSessions: number; lastSessionDate?: Date }; sessions?: { id: string; type: string; duration: number; mood: number; date: string }[] } | undefined;
        if (payload?.stats) {
          setStats({
            currentStreak: payload.stats.currentStreak || 0,
            totalMinutes: payload.stats.totalMinutes || 0,
            averageMood: payload.stats.averageMood || 0,
            totalSessions: payload.stats.totalSessions || 0,
          });
        }
        if (Array.isArray(payload?.sessions)) {
          setHistory(payload.sessions.slice(0, 50));
        }
      } catch (e) {
        void e;
      }
    };
    loadBackend();
  }, [authUser?.id]);

  const sessions = [
    { id: 'focus', name: 'Deep Focus', icon: Focus, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'calm', name: 'Calm Mind', icon: Wind, color: 'text-lime-500', bg: 'bg-lime-500/10' },
    { id: 'anxiety', name: 'Anxiety Relief', icon: CloudRain, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
    { id: 'morning', name: 'Morning Clarity', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const startSession = () => {
    setError('');
    if (!user) {
      setError('Sign in to track sessions');
      return;
    }
    if (activeSession) return;
    const dur = clamp(selectedDuration, 1, 120);
    if (dur <= 0) {
      setError('Invalid duration');
      return;
    }
    setActiveSession(true);
    setPaused(false);
    setMoodScore(null);
    setTimeLeft(dur * 60);
  };
  
  useEffect(() => {
    if (!activeSession || timeLeft <= 0 || paused) return;
    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, timeLeft, paused]);
  
  const finalizeSession = (endedEarly = false) => {
    const now = new Date();
    const iso = now.toISOString().split('T')[0];
    dispatch({ type: 'UPDATE_TIME_BASED_STREAK', payload: { activityType: 'mindfulness', timestamp: now } });
    
    const existing = state.timeBasedStreak.dailyActivity[iso] || { activeMinutes: 0, problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, lastActivityTime: now.toISOString() };
    const totalSeconds = selectedDuration * 60;
    const elapsedSeconds = endedEarly ? Math.max(0, totalSeconds - timeLeft) : totalSeconds;
    const minutesDone = clamp(Math.ceil(elapsedSeconds / 60), 1, 120);
    
    dispatch({ 
      type: 'RECORD_DAILY_ACTIVITY', 
      payload: { 
        date: iso, 
        activity: { 
          activeMinutes: (existing.activeMinutes || 0) + minutesDone, 
          lastActivityTime: now.toISOString() 
        } 
      } 
    });
    const finalMood = typeof moodScore === 'number' ? moodScore : 7;
    dispatch({ type: 'COMPLETE_MINDFULNESS_SESSION', payload: { durationMinutes: minutesDone, timestamp: now, moodScore: finalMood } });
    const entry = { id: Date.now().toString(), type: selectedType, duration: minutesDone, mood: finalMood, date: now.toISOString() };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    setLocalStorage('mindfulness_sessions', updated);
    const newTotalSessions = (stats.totalSessions || 0) + 1;
    const newAvgMood = Math.round((((stats.averageMood || 0) * (newTotalSessions - 1)) + finalMood) / newTotalSessions);
    const updatedStats = {
      currentStreak: stats.currentStreak,
      totalMinutes: (stats.totalMinutes || 0) + minutesDone,
      averageMood: newAvgMood,
      totalSessions: newTotalSessions,
      lastSessionDate: now,
    };
    setStats({ currentStreak: updatedStats.currentStreak, totalMinutes: updatedStats.totalMinutes, averageMood: updatedStats.averageMood, totalSessions: updatedStats.totalSessions });
    if (authUser?.id) {
      const payload = {
        stats: updatedStats,
        sessions: updated
      };
      appDataService.updateAppDataField(authUser.id, 'mindfulness', payload).catch(() => {});
    }
    setActiveSession(false);
    setPaused(false);
    setMoodScore(null);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (activeSession && timeLeft === 0) {
      finalizeSession(false);
    }
  }, [activeSession, timeLeft, selectedDuration, selectedType, moodScore, history, state.timeBasedStreak.dailyActivity, dispatch, authUser?.id, stats]);

  const deleteHistory = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    setLocalStorage('mindfulness_sessions', updatedHistory);
    const totalMinutes = updatedHistory.reduce((acc, h) => acc + h.duration, 0);
    const totalSessions = updatedHistory.length;
    const averageMood = totalSessions > 0 ? Math.round(updatedHistory.reduce((acc, h) => acc + h.mood, 0) / totalSessions) : 0;
    const lastSessionDate = updatedHistory[0]?.date ? new Date(updatedHistory[0].date) : undefined;
    const updatedStats = { currentStreak: stats.currentStreak, totalMinutes, totalSessions, averageMood, lastSessionDate };
    setStats(updatedStats);
    if (authUser?.id) {
      const payload = {
        stats: {
          currentStreak: updatedStats.currentStreak,
          totalMinutes: updatedStats.totalMinutes,
          averageMood: updatedStats.averageMood,
          totalSessions: updatedStats.totalSessions,
          lastSessionDate: updatedStats.lastSessionDate
        },
        sessions: updatedHistory
      };
      appDataService.updateAppDataField(authUser.id, 'mindfulness', payload).catch(() => {});
    }
  };

  const addCustomSession = (type: string, duration: number, mood: number, notes?: string) => {
    const entry = { 
      id: Date.now().toString(), 
      type, 
      duration, 
      mood, 
      date: new Date().toISOString(),
      notes: notes || ''
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    setLocalStorage('mindfulness_sessions', updated);
    const newTotalSessions = (stats.totalSessions || 0) + 1;
    const newAvgMood = Math.round((((stats.averageMood || 0) * (newTotalSessions - 1)) + mood) / newTotalSessions);
    const updatedStats = {
      currentStreak: stats.currentStreak,
      totalMinutes: (stats.totalMinutes || 0) + duration,
      averageMood: newAvgMood,
      totalSessions: newTotalSessions,
      lastSessionDate: new Date(),
    };
    setStats({ currentStreak: updatedStats.currentStreak, totalMinutes: updatedStats.totalMinutes, averageMood: updatedStats.averageMood, totalSessions: updatedStats.totalSessions });
    if (authUser?.id) {
      const payload = {
        stats: updatedStats,
        sessions: updated
      };
      appDataService.updateAppDataField(authUser.id, 'mindfulness', payload).catch(() => {});
    }
  };

  const updateSession = (id: string, updates: Partial<typeof history[0]>) => {
    const updatedHistory = history.map(h => h.id === id ? { ...h, ...updates } : h);
    setHistory(updatedHistory);
    setLocalStorage('mindfulness_sessions', updatedHistory);
    const totalMinutes = updatedHistory.reduce((acc, h) => acc + h.duration, 0);
    const totalSessions = updatedHistory.length;
    const averageMood = totalSessions > 0 ? Math.round(updatedHistory.reduce((acc, h) => acc + h.mood, 0) / totalSessions) : 0;
    const lastSessionDate = updatedHistory[0]?.date ? new Date(updatedHistory[0].date) : undefined;
    const updatedStats = { currentStreak: stats.currentStreak, totalMinutes, totalSessions, averageMood, lastSessionDate };
    setStats(updatedStats);
    if (authUser?.id) {
      const payload = {
        stats: {
          currentStreak: updatedStats.currentStreak,
          totalMinutes: updatedStats.totalMinutes,
          averageMood: updatedStats.averageMood,
          totalSessions: updatedStats.totalSessions,
          lastSessionDate: updatedStats.lastSessionDate
        },
        sessions: updatedHistory
      };
      appDataService.updateAppDataField(authUser.id, 'mindfulness', payload).catch(() => {});
    }
  };

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
            Mindfulness <span className="text-cyan-400">Hub</span>
          </h1>
          <p className="text-gray-500 font-mono">Center your mind. Optimize your focus.</p>
        </header>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-cyan-400">{stats.currentStreak}</div>
              <div className="text-xs font-mono uppercase text-gray-500">Day Streak</div>
            </CardContent>
          </Card>
          <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-lime-400">{stats.totalMinutes}</div>
              <div className="text-xs font-mono uppercase text-gray-500">Total Minutes</div>
            </CardContent>
          </Card>
          <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-fuchsia-400">{stats.averageMood}/10</div>
              <div className="text-xs font-mono uppercase text-gray-500">Avg Mood</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Selector */}
          <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
            <CardHeader>
              <CardTitle className="font-mono uppercase">Select Session</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  className={`p-4 border-2 border-dashed ${darkMode ? 'border-gray-700 hover:border-white' : 'border-gray-300 hover:border-black'} flex flex-col items-center gap-2 transition-all hover:scale-105`}
                  onClick={() => setSelectedType(s.id as typeof selectedType)}
                >
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                  <span className="font-bold font-mono text-sm uppercase">{s.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Active Session / Timer */}
          <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow flex flex-col items-center justify-center p-8 text-center`}>
            {activeSession ? (
              <div className="space-y-6">
                <div className="w-48 h-48 rounded-full border-8 border-cyan-400 flex items-center justify-center animate-pulse">
                  <span className="text-4xl font-black font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <h3 className="text-xl font-bold font-mono uppercase">Breathe In...</h3>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => setPaused(p => !p)} className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-mono uppercase">
                    {paused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="outline" onClick={() => finalizeSession(true)} className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono uppercase">
                    End
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase">Mood</div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={moodScore ?? 7}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-48"
                  />
                </div>
                <Button variant="outline" onClick={() => finalizeSession(true)} className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono uppercase">
                  End Session
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Brain className="w-24 h-24 text-gray-500 mx-auto" />
                <div>
                   <h3 className="text-xl font-bold font-mono uppercase mb-2">Ready to Meditate?</h3>
                   <div className="flex justify-center gap-2 mb-4">
                      {[5, 10, 15, 20].map(min => (
                        <button 
                          key={min}
                          onClick={() => setSelectedDuration(min)}
                          className={`px-3 py-1 font-mono text-sm border ${selectedDuration === min ? 'bg-cyan-500 text-black border-cyan-500' : 'border-gray-500'}`}
                        >
                          {min}m
                        </button>
                      ))}
                   </div>
                </div>
                <Button 
                  onClick={startSession}
                  className="w-full bg-lime-500 text-black font-bold font-mono uppercase border-2 border-black brutal-shadow hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Play className="w-4 h-4 mr-2" /> Start {selectedDuration} Min
                </Button>
                {error && <div className="text-xs font-mono text-red-500">{error}</div>}
              </div>
            )}
          </Card>
        </div>
        
        <Card className={`border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}>
          <CardHeader>
            <CardTitle className="font-mono uppercase">Session History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              <div className="font-bold uppercase">Date</div>
              <div className="font-bold uppercase">Type</div>
              <div className="font-bold uppercase">Duration</div>
              <div className="font-bold uppercase">Mood</div>
              {history.map(h => (
                <div key={h.id} className="contents">
                  <div className="flex items-center justify-between">
                    <span>{new Date(h.date).toLocaleString()}</span>
                    <button onClick={() => deleteHistory(h.id)} className="text-red-500">Del</button>
                  </div>
                  <div className="uppercase">{h.type}</div>
                  <div>{h.duration}m</div>
                  <div>{h.mood}/10</div>
                </div>
              ))}
              {history.length === 0 && (
                <>
                  <div className="col-span-4 text-gray-500">No sessions recorded</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
