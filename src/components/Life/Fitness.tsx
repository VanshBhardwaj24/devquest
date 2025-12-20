import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Flame, Trophy, Plus, CheckCircle, X, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface WorkoutSession {
  id: string;
  type: string;
  duration: number; // minutes
  xpEarned: number;
  date: Date;
  intensity: 'Light' | 'Moderate' | 'Intense';
  notes?: string;
}

const workoutTypes = [
  { name: 'Gym Workout', icon: '💪', baseXP: 100, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Running/Cardio', icon: '🏃', baseXP: 80, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Yoga/Stretching', icon: '🧘', baseXP: 60, intensityMultiplier: { Light: 1, Moderate: 1.3, Intense: 1.5 } },
  { name: 'Swimming', icon: '🏊', baseXP: 90, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Cycling', icon: '🚴', baseXP: 75, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Sports/Games', icon: '⚽', baseXP: 85, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Home Workout', icon: '🏠', baseXP: 70, intensityMultiplier: { Light: 1, Moderate: 1.5, Intense: 2 } },
  { name: 'Martial Arts', icon: '🥋', baseXP: 95, intensityMultiplier: { Light: 1, Moderate: 1.6, Intense: 2.2 } },
];

export function Fitness() {
  const { dispatch } = useApp();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(workoutTypes[0]);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'Intense'>('Moderate');
  const [notes, setNotes] = useState('');

  const calculateXP = () => {
    const multiplier = selectedWorkout.intensityMultiplier[intensity];
    const durationBonus = Math.floor(duration / 15) * 10; // Bonus for longer sessions
    return Math.floor(selectedWorkout.baseXP * multiplier + durationBonus);
  };

  const addWorkout = () => {
    const xpEarned = calculateXP();
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      type: selectedWorkout.name,
      duration,
      xpEarned,
      date: new Date(),
      intensity,
      notes: notes.trim(),
    };

    setSessions(prev => [newSession, ...prev]);
    
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
  };

  const removeSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: -session.xpEarned, 
          source: `Removed: ${session.type}` 
        } 
      });
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const totalWorkouts = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalXPEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const currentStreak = 3; // TODO: Calculate actual streak

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <Dumbbell className="text-lime-400" size={36} />
            FITNESS <span className="text-lime-400">💪</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Level up your body, gain XP for your character
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brutal-card bg-lime-900/20 border-lime-500/50 p-4"
          >
            <div className="flex flex-col items-center">
              <Trophy className="text-lime-400 mb-2" size={28} />
              <p className="text-xs text-gray-500 font-mono uppercase text-center">Total XP</p>
              <p className="text-2xl font-black text-lime-400 font-mono">+{totalXPEarned}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-orange-900/20 border-orange-500/50 p-4"
          >
            <div className="flex flex-col items-center">
              <Flame className="text-orange-400 mb-2" size={28} />
              <p className="text-xs text-gray-500 font-mono uppercase text-center">Streak</p>
              <p className="text-2xl font-black text-orange-400 font-mono">{currentStreak} days</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="brutal-card bg-cyan-900/20 border-cyan-500/50 p-4"
          >
            <div className="flex flex-col items-center">
              <TrendingUp className="text-cyan-400 mb-2" size={28} />
              <p className="text-xs text-gray-500 font-mono uppercase text-center">Workouts</p>
              <p className="text-2xl font-black text-cyan-400 font-mono">{totalWorkouts}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="brutal-card bg-purple-900/20 border-purple-500/50 p-4"
          >
            <div className="flex flex-col items-center">
              <Zap className="text-purple-400 mb-2" size={28} />
              <p className="text-xs text-gray-500 font-mono uppercase text-center">Minutes</p>
              <p className="text-2xl font-black text-purple-400 font-mono">{totalMinutes}</p>
            </div>
          </motion.div>
        </div>

        {/* Add Workout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="brutal-card bg-lime-500 hover:bg-lime-600 border-lime-400 text-black px-6 py-3 font-black mb-6 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <Plus size={20} />
            LOG WORKOUT
          </span>
        </motion.button>

        {/* Workout History */}
        <div className="brutal-card bg-gray-900 border-gray-700 p-4">
          <h2 className="text-xl font-black text-white mb-4 font-mono">WORKOUT HISTORY</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-500 font-mono">No workouts logged yet.</p>
              <p className="text-gray-600 text-sm font-mono mt-2">Start your fitness journey! 💪</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="brutal-card bg-gray-800 border-lime-500/30 p-4 hover:border-lime-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-4xl">
                        {workoutTypes.find(w => w.name === session.type)?.icon || '💪'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{session.type}</h3>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                            session.intensity === 'Intense' ? 'bg-red-500/20 text-red-400' :
                            session.intensity === 'Moderate' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {session.intensity}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm">
                          <span className="text-cyan-400 font-mono">⏱️ {session.duration} min</span>
                          <span className="text-lime-400 font-mono">⚡ +{session.xpEarned} XP</span>
                          <span className="text-gray-500 font-mono">
                            📅 {session.date.toLocaleDateString()}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-gray-400 text-sm mt-2 italic">"{session.notes}"</p>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeSession(session.id)}
                      className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <X size={16} className="text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="brutal-card bg-gray-900 border-lime-500 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                <Dumbbell className="text-lime-500" />
                LOG WORKOUT
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">WORKOUT TYPE</label>
                  <select
                    value={selectedWorkout.name}
                    onChange={e => setSelectedWorkout(workoutTypes.find(t => t.name === e.target.value)!)}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-lime-500 outline-none"
                  >
                    {workoutTypes.map(type => (
                      <option key={type.name} value={type.name}>
                        {type.icon} {type.name} (Base: {type.baseXP} XP)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">DURATION (MINUTES)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">INTENSITY</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Light', 'Moderate', 'Intense'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setIntensity(level)}
                        className={`p-3 font-bold border-2 brutal-shadow transition-colors ${
                          intensity === level
                            ? 'bg-lime-500 text-black border-lime-400'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-lime-500/50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">NOTES (OPTIONAL)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="How did it feel?"
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-lime-500 outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="brutal-card bg-lime-900/30 border-lime-500/50 p-4">
                  <p className="text-lime-400 font-mono text-sm">
                    ⚡ You will earn <span className="font-black text-lg">+{calculateXP()} XP</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addWorkout}
                    className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-black py-3 px-4 border-2 border-lime-400 brutal-shadow"
                  >
                    <CheckCircle className="inline mr-2" size={16} />
                    COMPLETE
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
