import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Brain, Wind, CloudRain, Sun, Timer, Focus, Play, CheckCircle2 } from 'lucide-react';

export function Mindfulness() {
  const { state, dispatch } = useApp();
  const { user, darkMode } = state;
  const [activeSession, setActiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5); // Minutes
  const [stats, setStats] = useState({ currentStreak: 0, totalMinutes: 0, averageMood: 0 });

  useEffect(() => {
    if (user?.mindfulness) {
      setStats(user.mindfulness);
    }
  }, [user]);

  const sessions = [
    { id: 'focus', name: 'Deep Focus', icon: Focus, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'calm', name: 'Calm Mind', icon: Wind, color: 'text-lime-500', bg: 'bg-lime-500/10' },
    { id: 'anxiety', name: 'Anxiety Relief', icon: CloudRain, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
    { id: 'morning', name: 'Morning Clarity', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const startSession = () => {
    setActiveSession(true);
    setTimeLeft(selectedDuration * 60);
    // In a real app, this would use a proper timer interval
  };
  
  useEffect(() => {
    if (!activeSession || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, timeLeft]);
  
  useEffect(() => {
    if (activeSession && timeLeft === 0) {
      const now = new Date();
      const iso = now.toISOString().split('T')[0];
      dispatch({ type: 'UPDATE_TIME_BASED_STREAK', payload: { activityType: 'mindfulness', timestamp: now } });
      
      const existing = state.timeBasedStreak.dailyActivity[iso] || { activeMinutes: 0, problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, lastActivityTime: now.toISOString() };
      dispatch({ 
        type: 'RECORD_DAILY_ACTIVITY', 
        payload: { 
          date: iso, 
          activity: { 
            activeMinutes: (existing.activeMinutes || 0) + selectedDuration, 
            lastActivityTime: now.toISOString() 
          } 
        } 
      });
      
      dispatch({ type: 'COMPLETE_MINDFULNESS_SESSION', payload: { durationMinutes: selectedDuration, timestamp: now, moodScore: 7 } });
      setActiveSession(false);
    }
  }, [activeSession, timeLeft, selectedDuration, state.timeBasedStreak.dailyActivity, dispatch]);

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
                <Button variant="outline" onClick={() => setActiveSession(false)} className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono uppercase">
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
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
