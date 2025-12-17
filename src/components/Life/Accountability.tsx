import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Skull, TrendingDown, Clock, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface TimeWaster {
  id: string;
  activity: string;
  hours: number;
  xpLost: number;
  date: Date;
  icon: string;
}

const timeWasterTypes = [
  { name: 'Social Media / Reels', icon: '📱', xpPerHour: -50 },
  { name: 'YouTube / Netflix Binge', icon: '📺', xpPerHour: -40 },
  { name: 'Gaming (Unproductive)', icon: '🎮', xpPerHour: -45 },
  { name: 'Oversleeping', icon: '😴', xpPerHour: -35 },
  { name: 'Junk Food Binge', icon: '🍔', xpPerHour: -30 },
  { name: 'Procrastination', icon: '⏰', xpPerHour: -40 },
  { name: 'Endless Scrolling', icon: '📲', xpPerHour: -55 },
  { name: 'Gossip / Drama', icon: '💬', xpPerHour: -45 },
];

export function Accountability() {
  const { dispatch } = useApp();
  const [timeWasters, setTimeWasters] = useState<TimeWaster[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(timeWasterTypes[0]);
  const [hours, setHours] = useState(1);

  const addTimeWaster = () => {
    const xpLost = Math.abs(selectedActivity.xpPerHour * hours);
    const newWaster: TimeWaster = {
      id: Date.now().toString(),
      activity: selectedActivity.name,
      hours,
      xpLost,
      date: new Date(),
      icon: selectedActivity.icon,
    };

    setTimeWasters(prev => [newWaster, ...prev]);
    
    // Deduct XP
    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: -xpLost, 
        source: `Punishment: ${selectedActivity.name} (${hours}h)` 
      } 
    });

    // Add notification
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'XP Deducted! ⚠️',
        message: `Lost ${xpLost} XP for ${selectedActivity.name}. Stay focused!`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
      }
    });

    setShowAddModal(false);
    setHours(1);
  };

  const removeWaster = (id: string) => {
    const waster = timeWasters.find(w => w.id === id);
    if (waster) {
      // Refund XP
      dispatch({ 
        type: 'ADD_XP', 
        payload: { 
          amount: waster.xpLost, 
          source: `Removed punishment: ${waster.activity}` 
        } 
      });
      setTimeWasters(prev => prev.filter(w => w.id !== id));
    }
  };

  const totalXPLost = timeWasters.reduce((sum, w) => sum + w.xpLost, 0);
  const totalHoursWasted = timeWasters.reduce((sum, w) => sum + w.hours, 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <Shield className="text-red-500" size={36} />
            ACCOUNTABILITY <span className="text-red-400">⚠️</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Track your time wasters and face the consequences
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brutal-card bg-red-900/20 border-red-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="text-red-400" size={32} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">XP Lost</p>
                <p className="text-2xl font-black text-red-400 font-mono">-{totalXPLost}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-orange-900/20 border-orange-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="text-orange-400" size={32} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Hours Wasted</p>
                <p className="text-2xl font-black text-orange-400 font-mono">{totalHoursWasted}h</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="brutal-card bg-yellow-900/20 border-yellow-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <Skull className="text-yellow-400" size={32} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Total Entries</p>
                <p className="text-2xl font-black text-yellow-400 font-mono">{timeWasters.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Punishment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="brutal-card bg-red-500 hover:bg-red-600 border-red-400 text-black px-6 py-3 font-black mb-6 w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle size={20} />
            LOG TIME WASTER
          </span>
        </motion.button>

        {/* Time Wasters List */}
        <div className="brutal-card bg-gray-900 border-gray-700 p-4">
          <h2 className="text-xl font-black text-white mb-4 font-mono">RECENT PUNISHMENTS</h2>
          
          {timeWasters.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-500 font-mono">No punishments logged yet.</p>
              <p className="text-gray-600 text-sm font-mono mt-2">Stay disciplined! 💪</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeWasters.map((waster, index) => (
                <motion.div
                  key={waster.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="brutal-card bg-gray-800 border-red-500/30 p-4 hover:border-red-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-4xl">{waster.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{waster.activity}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm">
                          <span className="text-orange-400 font-mono">⏰ {waster.hours}h wasted</span>
                          <span className="text-red-400 font-mono">💔 -{waster.xpLost} XP</span>
                          <span className="text-gray-500 font-mono">
                            📅 {waster.date.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeWaster(waster.id)}
                      className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors"
                      title="Remove (Refund XP)"
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
              className="brutal-card bg-gray-900 border-red-500 p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                LOG TIME WASTER
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">ACTIVITY</label>
                  <select
                    value={selectedActivity.name}
                    onChange={e => setSelectedActivity(timeWasterTypes.find(t => t.name === e.target.value)!)}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-red-500 outline-none"
                  >
                    {timeWasterTypes.map(type => (
                      <option key={type.name} value={type.name}>
                        {type.icon} {type.name} ({type.xpPerHour} XP/hour)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 font-mono block mb-2">HOURS WASTED</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hours}
                    onChange={e => setHours(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-red-500 outline-none"
                  />
                </div>

                <div className="brutal-card bg-red-900/30 border-red-500/50 p-4">
                  <p className="text-red-400 font-mono text-sm">
                    ⚠️ You will lose <span className="font-black text-lg">{Math.abs(selectedActivity.xpPerHour * hours)} XP</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addTimeWaster}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-black font-black py-3 px-4 border-2 border-red-400 brutal-shadow"
                  >
                    ACCEPT PUNISHMENT
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
