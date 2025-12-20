import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Lock, Unlock, Star, Trophy, Target, Zap, Crown,
  CheckCircle, ChevronRight, Flame, Sparkles
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LifeZone {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  requiredLevel: number;
  unlocked: boolean;
  progress: number;
  missions: Mission[];
  rewards: string[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: 'main' | 'side' | 'daily';
}

const lifeZones: LifeZone[] = [
  {
    id: 'spawn',
    name: 'THE BEGINNING',
    description: 'Where every legend starts. Complete basic setup to unlock your journey.',
    icon: '🏠',
    color: 'green',
    bgColor: 'bg-green-900/30',
    requiredLevel: 1,
    unlocked: true,
    progress: 100,
    missions: [
      { id: 'm1', title: 'Create Profile', description: 'Set up your identity', xpReward: 50, completed: true, type: 'main' },
      { id: 'm2', title: 'First Task', description: 'Complete your first task', xpReward: 25, completed: true, type: 'main' },
    ],
    rewards: ['🎮 Player Status Unlocked', '📊 Stats Dashboard'],
  },
  {
    id: 'coding',
    name: 'CODE DISTRICT',
    description: 'The tech hub. Master DSA, solve problems, build your coding arsenal.',
    icon: '💻',
    color: 'cyan',
    bgColor: 'bg-cyan-900/30',
    requiredLevel: 2,
    unlocked: true,
    progress: 45,
    missions: [
      { id: 'c1', title: 'Solve 10 Easy Problems', description: 'Build fundamentals', xpReward: 100, completed: true, type: 'main' },
      { id: 'c2', title: 'Solve 5 Medium Problems', description: 'Level up your skills', xpReward: 150, completed: false, type: 'main' },
      { id: 'c3', title: 'Complete a Hard Problem', description: 'Prove your worth', xpReward: 300, completed: false, type: 'side' },
      { id: 'c4', title: '7-Day Coding Streak', description: 'Consistency is key', xpReward: 200, completed: false, type: 'daily' },
    ],
    rewards: ['🏆 Code Warrior Badge', '⚡ +10% XP on coding tasks'],
  },
  {
    id: 'fitness',
    name: 'IRON TEMPLE',
    description: 'Physical power zone. Transform your body, unlock strength.',
    icon: '💪',
    color: 'red',
    bgColor: 'bg-red-900/30',
    requiredLevel: 3,
    unlocked: true,
    progress: 30,
    missions: [
      { id: 'f1', title: 'First Workout', description: 'Begin your physical journey', xpReward: 75, completed: true, type: 'main' },
      { id: 'f2', title: '10 Gym Sessions', description: 'Build the habit', xpReward: 200, completed: false, type: 'main' },
      { id: 'f3', title: 'Run 5K', description: 'Cardio milestone', xpReward: 150, completed: false, type: 'side' },
      { id: 'f4', title: '30-Day Streak', description: 'Become unstoppable', xpReward: 500, completed: false, type: 'main' },
    ],
    rewards: ['💪 Iron Will Badge', '🔥 +2 Energy per day'],
  },
  {
    id: 'wealth',
    name: 'FORTUNE TOWERS',
    description: 'Financial district. Build wealth, master money, secure your future.',
    icon: '💰',
    color: 'yellow',
    bgColor: 'bg-yellow-900/30',
    requiredLevel: 5,
    unlocked: false,
    progress: 0,
    missions: [
      { id: 'w1', title: 'Track First Income', description: 'Know your money', xpReward: 50, completed: false, type: 'main' },
      { id: 'w2', title: 'Save ₹10,000', description: 'Emergency fund start', xpReward: 200, completed: false, type: 'main' },
      { id: 'w3', title: 'First Investment', description: 'Make money work', xpReward: 300, completed: false, type: 'main' },
      { id: 'w4', title: 'Zero Debt', description: 'Financial freedom', xpReward: 500, completed: false, type: 'side' },
    ],
    rewards: ['💎 Wealthy Mindset', '📈 Investment Tracker'],
  },
  {
    id: 'social',
    name: 'HEART HAVEN',
    description: 'Relationship zone. Build connections, nurture bonds, grow together.',
    icon: '❤️',
    color: 'pink',
    bgColor: 'bg-pink-900/30',
    requiredLevel: 4,
    unlocked: false,
    progress: 0,
    missions: [
      { id: 's1', title: 'Add 5 Connections', description: 'Map your circle', xpReward: 75, completed: false, type: 'main' },
      { id: 's2', title: 'Weekly Check-in', description: 'Stay connected', xpReward: 50, completed: false, type: 'daily' },
      { id: 's3', title: 'Deep Conversation', description: 'Meaningful connections', xpReward: 100, completed: false, type: 'side' },
      { id: 's4', title: 'Help Someone', description: 'Give back', xpReward: 150, completed: false, type: 'main' },
    ],
    rewards: ['💕 Social Butterfly', '🤝 Network Bonus'],
  },
  {
    id: 'knowledge',
    name: 'WISDOM LIBRARY',
    description: 'Knowledge fortress. Read, learn, grow your mind exponentially.',
    icon: '📚',
    color: 'purple',
    bgColor: 'bg-purple-900/30',
    requiredLevel: 3,
    unlocked: true,
    progress: 20,
    missions: [
      { id: 'k1', title: 'Read First Book', description: 'Begin the journey', xpReward: 100, completed: true, type: 'main' },
      { id: 'k2', title: 'Complete a Course', description: 'Structured learning', xpReward: 200, completed: false, type: 'main' },
      { id: 'k3', title: '100 Pages Read', description: 'Bookworm milestone', xpReward: 150, completed: false, type: 'side' },
      { id: 'k4', title: 'Teach Someone', description: 'Master by teaching', xpReward: 250, completed: false, type: 'main' },
    ],
    rewards: ['🧠 Big Brain Badge', '📖 +25% Learning XP'],
  },
  {
    id: 'discipline',
    name: 'SHADOW REALM',
    description: 'Accountability zone. Face your demons, destroy bad habits.',
    icon: '⚔️',
    color: 'gray',
    bgColor: 'bg-gray-800/50',
    requiredLevel: 6,
    unlocked: false,
    progress: 0,
    missions: [
      { id: 'd1', title: 'Track Distractions', description: 'Know your enemy', xpReward: 50, completed: false, type: 'main' },
      { id: 'd2', title: '24 Hours No Social Media', description: 'Digital detox', xpReward: 200, completed: false, type: 'main' },
      { id: 'd3', title: '7 Days Under 1 Hour Reels', description: 'Break the addiction', xpReward: 300, completed: false, type: 'main' },
      { id: 'd4', title: '30 Days Clean', description: 'Absolute discipline', xpReward: 1000, completed: false, type: 'side' },
    ],
    rewards: ['👁️ Shadow Hunter', '🛡️ Discipline Shield'],
  },
  {
    id: 'legendary',
    name: 'LEGEND\'S PEAK',
    description: 'The ultimate destination. Only the truly dedicated reach here.',
    icon: '👑',
    color: 'amber',
    bgColor: 'bg-gradient-to-br from-amber-900/40 to-yellow-800/30',
    requiredLevel: 10,
    unlocked: false,
    progress: 0,
    missions: [
      { id: 'l1', title: 'Reach Level 10', description: 'Prove your dedication', xpReward: 500, completed: false, type: 'main' },
      { id: 'l2', title: 'Complete All Zones', description: 'Master of all', xpReward: 1000, completed: false, type: 'main' },
      { id: 'l3', title: '100-Day Streak', description: 'Legendary consistency', xpReward: 2000, completed: false, type: 'main' },
      { id: 'l4', title: 'Help 10 People', description: 'Leave a legacy', xpReward: 1500, completed: false, type: 'side' },
    ],
    rewards: ['👑 Legend Status', '🌟 All XP +50%', '🏆 Hall of Fame'],
  },
];

export function LifeMap() {
  const { state } = useApp();
  const [selectedZone, setSelectedZone] = useState<LifeZone | null>(null);
  const [zones, setZones] = useState(lifeZones);

  const currentLevel = state.xpSystem?.currentLevel || 1;
  const unlockedCount = zones.filter(z => z.unlocked).length;
  const totalMissions = zones.reduce((sum, z) => sum + z.missions.length, 0);
  const completedMissions = zones.reduce((sum, z) => sum + z.missions.filter(m => m.completed).length, 0);
  const overallProgress = Math.round((completedMissions / totalMissions) * 100);

  const getZoneStatus = (zone: LifeZone) => {
    if (zone.progress === 100) return 'completed';
    if (zone.unlocked) return 'active';
    if (currentLevel >= zone.requiredLevel) return 'unlockable';
    return 'locked';
  };

  const unlockZone = (zoneId: string) => {
    setZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, unlocked: true } : z
    ));
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <Map className="text-amber-400" size={36} />
            LIFE MAP <span className="text-amber-400">🗺️</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Your world. Your story. Unlock zones. Complete missions. Become legendary.
          </p>
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/50 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center border-4 border-amber-500">
                <span className="text-4xl">🎮</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white font-mono">YOUR JOURNEY</h2>
                <p className="text-amber-400 font-mono">Level {currentLevel} Explorer</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-amber-400">{unlockedCount}/{zones.length}</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Zones Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-cyan-400">{completedMissions}/{totalMissions}</p>
                <p className="text-xs text-gray-500 font-mono uppercase">Missions Done</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{overallProgress}%</p>
                <p className="text-xs text-gray-500 font-mono uppercase">World Progress</p>
              </div>
            </div>
          </div>
          
          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {zones.map((zone, index) => {
            const status = getZoneStatus(zone);
            
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={status !== 'locked' ? { scale: 1.02, y: -5 } : {}}
                onClick={() => status !== 'locked' && setSelectedZone(zone)}
                className={`brutal-card ${zone.bgColor} p-5 cursor-pointer relative overflow-hidden transition-all ${
                  status === 'locked' ? 'opacity-50 cursor-not-allowed grayscale' : ''
                } ${
                  status === 'completed' ? 'border-green-500' :
                  status === 'active' ? `border-${zone.color}-500` :
                  'border-gray-600'
                }`}
              >
                {/* Lock overlay */}
                {status === 'locked' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="text-gray-500 mx-auto mb-2" size={32} />
                      <p className="text-gray-500 font-mono text-sm">Level {zone.requiredLevel}</p>
                    </div>
                  </div>
                )}

                {/* Unlockable glow */}
                {status === 'unlockable' && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500/10 pointer-events-none"
                  />
                )}

                {/* Completed badge */}
                {status === 'completed' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{zone.icon}</span>
                  <div>
                    <h3 className={`font-black text-white text-lg`}>{zone.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">Lvl {zone.requiredLevel}+</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{zone.description}</p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-mono">Progress</span>
                    <span className={`font-bold text-${zone.color}-400`}>{zone.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${zone.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${
                        zone.color === 'green' ? 'from-green-600 to-green-500' :
                        zone.color === 'cyan' ? 'from-cyan-600 to-cyan-400' :
                        zone.color === 'red' ? 'from-red-600 to-red-500' :
                        zone.color === 'yellow' ? 'from-yellow-600 to-yellow-400' :
                        zone.color === 'pink' ? 'from-pink-600 to-pink-400' :
                        zone.color === 'purple' ? 'from-purple-600 to-purple-500' :
                        zone.color === 'amber' ? 'from-amber-600 to-amber-400' :
                        'from-gray-600 to-gray-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">
                    {zone.missions.filter(m => m.completed).length}/{zone.missions.length} Missions
                  </span>
                  {status === 'unlockable' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockZone(zone.id);
                      }}
                      className="px-3 py-1 bg-amber-500 text-black font-bold text-xs border border-amber-400"
                    >
                      <Unlock size={12} className="inline mr-1" /> UNLOCK
                    </button>
                  )}
                  {status === 'active' && (
                    <ChevronRight className="text-gray-500" size={16} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="brutal-card bg-gray-900 border-gray-700 p-4 mb-6">
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">MAP LEGEND</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-xs text-gray-500">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs text-gray-500">Ready to Unlock</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">Locked (Level Up)</span>
            </div>
          </div>
        </div>

        {/* Zone Detail Modal */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedZone(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
                className={`brutal-card ${selectedZone.bgColor} p-4 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border-4 ${
                  selectedZone.color === 'green' ? 'border-green-500' :
                  selectedZone.color === 'cyan' ? 'border-cyan-400' :
                  selectedZone.color === 'red' ? 'border-red-500' :
                  selectedZone.color === 'yellow' ? 'border-yellow-400' :
                  selectedZone.color === 'pink' ? 'border-pink-400' :
                  selectedZone.color === 'purple' ? 'border-purple-500' :
                  selectedZone.color === 'amber' ? 'border-amber-400' : 'border-gray-500'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-6xl">{selectedZone.icon}</span>
                  <div>
                    <h2 className="text-3xl font-black text-white font-mono">{selectedZone.name}</h2>
                    <p className="text-gray-400">{selectedZone.description}</p>
                  </div>
                </div>

                {/* Zone Progress */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 font-mono">Zone Progress</span>
                    <span className="text-white font-black">{selectedZone.progress}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedZone.progress}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full bg-gradient-to-r ${
                        selectedZone.color === 'green' ? 'from-green-600 to-green-500' :
                        selectedZone.color === 'cyan' ? 'from-cyan-600 to-cyan-400' :
                        selectedZone.color === 'red' ? 'from-red-600 to-red-500' :
                        selectedZone.color === 'yellow' ? 'from-yellow-600 to-yellow-400' :
                        selectedZone.color === 'pink' ? 'from-pink-600 to-pink-400' :
                        selectedZone.color === 'purple' ? 'from-purple-600 to-purple-500' :
                        selectedZone.color === 'amber' ? 'from-amber-600 to-amber-400' :
                        'from-gray-600 to-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Missions */}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Target className="text-amber-400" size={20} /> MISSIONS
                  </h3>
                  <div className="space-y-3">
                    {selectedZone.missions.map(mission => (
                      <div
                        key={mission.id}
                        className={`brutal-card p-4 ${
                          mission.completed 
                            ? 'bg-green-900/30 border-green-500/50' 
                            : 'bg-gray-800 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {mission.completed ? (
                              <CheckCircle className="text-green-400" size={20} />
                            ) : (
                              <div className={`w-5 h-5 rounded-full border-2 ${
                                mission.type === 'main' ? 'border-amber-400' :
                                mission.type === 'side' ? 'border-purple-400' :
                                'border-cyan-400'
                              }`} />
                            )}
                            <div>
                              <h4 className={`font-bold ${mission.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                {mission.title}
                              </h4>
                              <p className="text-xs text-gray-500">{mission.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black ${mission.completed ? 'text-green-400' : 'text-amber-400'}`}>
                              +{mission.xpReward} XP
                            </p>
                            <span className={`text-xs uppercase font-mono ${
                              mission.type === 'main' ? 'text-amber-500' :
                              mission.type === 'side' ? 'text-purple-500' :
                              'text-cyan-500'
                            }`}>
                              {mission.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewards */}
                <div className="mb-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} /> ZONE REWARDS
                  </h3>
                  <div className="grid gap-2">
                    {selectedZone.rewards.map((reward, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-800/50 p-3 border border-gray-700">
                        <Sparkles className="text-yellow-400" size={16} />
                        <span className="text-gray-300">{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedZone(null)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-black py-3 border-2 border-gray-600"
                >
                  CLOSE
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Tips */}
        <div className="brutal-card bg-gray-900 border-gray-700 p-6">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Flame className="text-orange-400" /> HOW TO PROGRESS
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 rounded">
                <Zap className="text-cyan-400" size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold">Complete Tasks</h4>
                <p className="text-sm text-gray-500">Every completed task gives XP and unlocks missions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded">
                <Star className="text-amber-400" size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold">Level Up</h4>
                <p className="text-sm text-gray-500">Higher levels unlock new zones and abilities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded">
                <Crown className="text-green-400" size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold">Claim Rewards</h4>
                <p className="text-sm text-gray-500">Completing zones gives permanent bonuses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
