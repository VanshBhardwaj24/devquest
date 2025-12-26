import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Plus, X, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LifeService, WorkoutSession } from '../../services/lifeService';
import { Button } from '../ui/button';

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
  const { darkMode } = state;
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
        
        // Add XP
        dispatch({ 
        type: 'ADD_XP', 
        payload: { 
            amount: xpEarned, 
            source: `Fitness: ${selectedWorkout.name} (${duration}min)` 
        } 
        });

        // Add notification
        dispatch({ 
    } catch (err) {
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
<<<<<<< HEAD
    } catch {
=======
        } catch (err) {
>>>>>>> origin/main
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
<<<<<<< HEAD
        } catch {
=======
        } catch (err) {
>>>>>>> origin/main
            alert('Failed to delete workout.');
        }
    }
  };

  const totalWorkouts = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalXPEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

  if (loading) return <div className="p-8 text-center font-mono animate-pulse">LOADING FITNESS DATA...</div>;
  if (error) return (
      <div className="p-8 text-center text-red-500 font-mono flex flex-col items-center">
          <AlertTriangle className="mb-2" />
          {error}
          <Button variant="outline" size="sm" onClick={fetchSessions} className="mt-4"><RefreshCw className="mr-2 h-4 w-4"/> Retry</Button>
      </div>
  );

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 border-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} brutal-shadow`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold font-mono text-lg uppercase">Workouts</h3>
          </div>
          <div className="text-4xl font-black font-mono">{totalWorkouts}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 border-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} brutal-shadow`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold font-mono text-lg uppercase">Active Mins</h3>
          </div>
          <div className="text-4xl font-black font-mono">{totalMinutes}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 border-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} brutal-shadow`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h3 className="font-bold font-mono text-lg uppercase">Fitness XP</h3>
          </div>
          <div className="text-4xl font-black font-mono">{totalXPEarned}</div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black font-mono uppercase">Session Log</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 font-bold font-mono border-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            darkMode 
              ? 'bg-lime-500 text-black border-lime-400' 
              : 'bg-black text-white border-black'
          }`}
        >
          <Plus className="h-5 w-5" />
          LOG WORKOUT
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 border-2 flex items-center justify-between group ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                session.intensity === 'Intense' ? 'bg-red-500' :
                session.intensity === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'
              }`}>
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold font-mono text-lg">{session.type}</div>
                <div className="text-sm font-mono opacity-60 flex gap-4">
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                  <span>{session.duration} mins</span>
                  <span className="uppercase">{session.intensity}</span>
                </div>
                {session.notes && (
                  <div className="text-xs font-mono mt-1 opacity-80 italic">"{session.notes}"</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-black font-mono text-lg ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                +{session.xpEarned} XP
              </div>
              <button 
                onClick={() => removeSession(session.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-12 font-mono opacity-50 border-2 border-dashed border-gray-400">
            NO WORKOUTS RECORDED YET. GET MOVING!
          </div>
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
              darkMode ? 'bg-gray-900 border-white' : 'bg-white border-black'
            }`}
          >
            <div className={`p-4 border-b-4 flex justify-between items-center ${
              darkMode ? 'bg-gray-800 border-white' : 'bg-gray-100 border-black'
            }`}>
              <h3 className="font-black font-mono text-xl uppercase">Log Session</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-bold font-mono mb-2 text-sm uppercase">Workout Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {workoutTypes.map(type => (
                    <button
                      key={type.name}
                      onClick={() => setSelectedWorkout(type)}
                      className={`p-2 border-2 text-left text-sm font-mono transition-all ${
                        selectedWorkout.name === type.name
                          ? 'bg-black text-white border-black translate-x-[2px] translate-y-[2px]' 
                          : 'bg-white text-black border-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                    onChange={(e) => setIntensity(e.target.value as any)}
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold font-mono mb-2 text-sm uppercase">Duration (min)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className={`w-full p-2 border-2 font-mono ${
                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-bold font-mono mb-2 text-sm uppercase">Intensity</label>
                  <select
                    value={intensity}
<<<<<<< HEAD
                    onChange={(e) => setIntensity(e.target.value as 'Light' | 'Moderate' | 'Intense')}
=======
                    onChange={(e) => setIntensity(e.target.value as any)}
>>>>>>> origin/main
                    className={`w-full p-2 border-2 font-mono ${
                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'
                    }`}
                  >
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Intense">Intense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold font-mono mb-2 text-sm uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it feel?"
                  className={`w-full p-2 border-2 font-mono h-20 ${
                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'
                  }`}
                />
              </div>

              <div className={`p-3 border-2 font-mono text-center font-bold ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-black'
              }`}>
                Estimated XP: <span className="text-xl text-green-500">{calculateXP()}</span>
              </div>

              <button
                onClick={addWorkout}
                className="w-full py-3 font-black font-mono uppercase bg-green-500 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Confirm Workout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
