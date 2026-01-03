import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Plus, X, Zap, AlertTriangle, RefreshCw, Activity, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LifeService, WorkoutSession } from '../../services/lifeService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface WorkoutType {
  name: string;
  icon: string;
  baseXP: number;
  intensityMultiplier: {
    Light: number;
    Moderate: number;
    Intense: number;
  };
}

const workoutTypes: WorkoutType[] = [
  { name: 'Gym Workout', icon: '💪', baseXP: 100, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Running/Cardio', icon: '🏃', baseXP: 80, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Swimming', icon: '🏊', baseXP: 90, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Cycling', icon: '🚴', baseXP: 75, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Sports/Games', icon: '⚽', baseXP: 85, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Home Workout', icon: '🏠', baseXP: 70, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Martial Arts', icon: '🥋', baseXP: 95, intensityMultiplier: { Light: 1, Moderate: 1.6, Intense: 2.2 } },
];

export function Fitness() {
  const { dispatch, state } = useApp();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(workoutTypes[0]);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'Intense'>('Moderate');
  const [notes, setNotes] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LifeService.getFitnessData();
      setSessions(data);
    } catch {
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const calculateXP = () => {
    const multiplier = selectedWorkout.intensityMultiplier[intensity];
    const durationBonus = Math.floor(duration / 15) * 10; // Bonus for longer sessions
    return Math.floor(selectedWorkout.baseXP * multiplier + durationBonus);
  };

  const addWorkout = async () => {
    const xpEarned = calculateXP();
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      type: selectedWorkout.name,
      duration,
      xpEarned,
      date: new Date().toISOString(),
      intensity,
      notes: notes.trim(),
    };

    try {
      const updatedSessions = await LifeService.saveWorkout(newSession);
      setSessions(updatedSessions);
      
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: xpEarned, 
          source: `Fitness: ${selectedWorkout.name} (${duration}min)` 
        } 
      });

      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: Date.now().toString(),
          type: 'achievement',
          title: 'Workout Complete! 💪',
          message: `Earned ${xpEarned} XP from ${selectedWorkout.name}. Keep grinding!`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
        }
      });

      setShowAddModal(false);
      setDuration(30);
      setNotes('');
    } catch {
      alert('Failed to save workout. Please try again.');
    }
  };

  const removeSession = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
        try {
            const updatedSessions = await LifeService.deleteWorkout(id);
            setSessions(updatedSessions);
            dispatch({ 
                type: 'ADD_XP', 
                payload: { 
                amount: -session.xpEarned, 
                source: `Removed: ${session.type}` 
                } 
            });
        } catch {
            alert('Failed to delete workout.');
        }
    }
  };

  const totalWorkouts = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalXPEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

  if (loading) return <div className="p-8 text-center font-mono animate-pulse text-neon-blue">LOADING FITNESS DATA...</div>;
  if (error) return (
      <div className="p-8 text-center text-red-500 font-mono flex flex-col items-center">
          <AlertTriangle className="mb-2" />
          {error}
          <Button variant="outline" size="sm" onClick={fetchSessions} className="mt-4"><RefreshCw className="mr-2 h-4 w-4"/> Retry</Button>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="neon" className="h-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-cyber uppercase mb-1">Total Workouts</p>
                <div className="text-3xl font-bold text-neon-blue font-mono">{totalWorkouts}</div>
              </div>
              <div className="p-3 bg-neon-blue/10 rounded-lg text-neon-blue border border-neon-blue/30">
                <Dumbbell className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="neon" className="h-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-cyber uppercase mb-1">Active Minutes</p>
                <div className="text-3xl font-bold text-neon-purple font-mono">{totalMinutes}</div>
              </div>
              <div className="p-3 bg-neon-purple/10 rounded-lg text-neon-purple border border-neon-purple/30">
                <Flame className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="neon" className="h-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-cyber uppercase mb-1">Fitness XP</p>
                <div className="text-3xl font-bold text-neon-yellow font-mono">{totalXPEarned}</div>
              </div>
              <div className="p-3 bg-neon-yellow/10 rounded-lg text-neon-yellow border border-neon-yellow/30">
                <Zap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-cyber text-white">
          SESSION LOG
        </h2>
        <Button
          variant="neon"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          LOG WORKOUT
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="cyber" className="group border-l-4 border-l-neon-blue hover:border-l-neon-purple transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg border border-white/10 ${
                    session.intensity === 'Intense' ? 'bg-red-500/10 text-red-500' :
                    session.intensity === 'Moderate' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold font-cyber text-lg text-white">{session.type}</div>
                    <div className="text-sm text-gray-400 font-mono flex gap-4 items-center">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(session.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {session.duration} mins</span>
                      <Badge variant="outline" className="uppercase text-[10px] h-5">{session.intensity}</Badge>
                    </div>
                    {session.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">"{session.notes}"</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold font-mono text-lg text-neon-yellow">
                    +{session.xpEarned} XP
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSession(session.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {sessions.length === 0 && (
          <Card variant="outline" className="border-dashed border-gray-700 bg-transparent">
            <CardContent className="p-12 text-center text-gray-500 font-mono">
              NO WORKOUTS RECORDED YET. GET MOVING!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <Card variant="neon" className="border-2 border-neon-blue">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                <CardTitle className="font-cyber text-xl text-white uppercase">Log Session</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="h-8 w-8 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-cyber text-neon-blue uppercase text-xs">Workout Type</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {workoutTypes.map(type => (
                      <button
                        key={type.name}
                        onClick={() => setSelectedWorkout(type)}
                        className={`p-2 text-left text-sm font-mono transition-all border rounded-md flex items-center gap-2 ${
                          selectedWorkout.name === type.name
                            ? 'bg-neon-blue/20 text-white border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
                            : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span>{type.icon}</span>
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-cyber text-neon-blue uppercase text-xs">Duration (min)</Label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="bg-black/40 border-white/10 text-white font-mono focus:border-neon-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-cyber text-neon-blue uppercase text-xs">Intensity</Label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value as 'Light' | 'Moderate' | 'Intense')}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-md text-white font-mono focus:border-neon-blue focus:outline-none"
                    >
                      <option value="Light">Light</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Intense">Intense</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-cyber text-neon-blue uppercase text-xs">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it feel?"
                    className="bg-black/40 border-white/10 text-white font-mono h-20 focus:border-neon-blue resize-none"
                  />
                </div>

                <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-md text-center">
                  <span className="text-gray-400 font-mono text-sm uppercase">Estimated XP: </span>
                  <span className="text-xl font-bold text-neon-green font-mono">{calculateXP()}</span>
                </div>

                <Button
                  onClick={addWorkout}
                  variant="neon"
                  className="w-full font-cyber uppercase tracking-wider"
                >
                  Confirm Workout
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
