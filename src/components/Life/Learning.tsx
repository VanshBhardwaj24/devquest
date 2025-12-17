import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Trophy, Target, Plus, CheckCircle, 
  Clock, Flame, Brain,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LearningSession {
  id: string;
  type: 'book' | 'course' | 'video' | 'practice' | 'article';
  title: string;
  category: string;
  duration: number; // minutes
  progress?: number; // for books (pages) or courses (%)
  notes?: string;
  date: Date;
  xpEarned: number;
}

interface LearningGoal {
  id: string;
  title: string;
  type: 'book' | 'course' | 'skill';
  target: number;
  current: number;
  unit: string;
  icon: string;
  deadline?: Date;
}

const learningTypes = [
  { id: 'book', name: 'Reading Book', icon: '📚', baseXP: 2, unit: 'pages' },
  { id: 'course', name: 'Online Course', icon: '🎓', baseXP: 3, unit: '% completed' },
  { id: 'video', name: 'Tutorial Video', icon: '📺', baseXP: 1.5, unit: 'minutes' },
  { id: 'practice', name: 'Hands-on Practice', icon: '💻', baseXP: 4, unit: 'minutes' },
  { id: 'article', name: 'Article/Blog', icon: '📝', baseXP: 1, unit: 'articles' },
];

const categories = [
  { name: 'Programming', icon: '💻', color: 'cyan' },
  { name: 'DSA/Algorithms', icon: '🧮', color: 'green' },
  { name: 'System Design', icon: '🏗️', color: 'purple' },
  { name: 'DevOps', icon: '⚙️', color: 'orange' },
  { name: 'AI/ML', icon: '🤖', color: 'pink' },
  { name: 'Web Development', icon: '🌐', color: 'blue' },
  { name: 'Mobile Dev', icon: '📱', color: 'lime' },
  { name: 'Soft Skills', icon: '🗣️', color: 'yellow' },
  { name: 'Finance', icon: '💰', color: 'green' },
  { name: 'Health', icon: '🏥', color: 'red' },
  { name: 'Languages', icon: '🌍', color: 'indigo' },
  { name: 'Other', icon: '📖', color: 'gray' },
];

export function Learning() {
  const { dispatch } = useApp();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([
    { id: '1', title: 'Atomic Habits', type: 'book', target: 285, current: 120, unit: 'pages', icon: '📚' },
    { id: '2', title: 'React Mastery Course', type: 'course', target: 100, current: 65, unit: '%', icon: '🎓' },
    { id: '3', title: 'Learn TypeScript', type: 'skill', target: 30, current: 12, unit: 'hours', icon: '💻' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'goals' | 'skills'>('sessions');

  // Form state
  const [selectedType, setSelectedType] = useState(learningTypes[0]);
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [duration, setDuration] = useState(30);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  // Goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'book' | 'course' | 'skill'>('book');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('📚');

  const calculateXP = () => {
    const baseXP = selectedType.baseXP;
    if (selectedType.id === 'book') {
      return Math.floor(progress * baseXP);
    } else if (selectedType.id === 'course') {
      return Math.floor(progress * baseXP);
    }
    return Math.floor(duration * baseXP);
  };

  const addSession = () => {
    if (!title.trim()) return;

    const xpEarned = calculateXP();
    
    const newSession: LearningSession = {
      id: Date.now().toString(),
      type: selectedType.id as any,
      title,
      category: selectedCategory.name,
      duration,
      progress,
      notes: notes.trim(),
      date: new Date(),
      xpEarned,
    };

    setSessions(prev => [newSession, ...prev]);

    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: xpEarned, 
        source: `Learning: ${selectedType.name} - ${title}` 
      } 
    });

    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Knowledge Gained! 📚',
        message: `+${xpEarned} XP for learning ${title}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
      }
    });

    setShowAddModal(false);
    setTitle('');
    setNotes('');
    setProgress(0);
    setDuration(30);
  };

  const addGoal = () => {
    if (!newGoalTitle || !newGoalTarget) return;

    const newGoal: LearningGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      type: newGoalType,
      target: parseInt(newGoalTarget),
      current: 0,
      unit: newGoalType === 'book' ? 'pages' : newGoalType === 'course' ? '%' : 'hours',
      icon: newGoalIcon,
    };

    setGoals(prev => [...prev, newGoal]);
    
    dispatch({ 
      type: 'ADD_XP', 
      payload: { amount: 25, source: `Created learning goal: ${newGoalTitle}` } 
    });

    setShowGoalModal(false);
    setNewGoalTitle('');
    setNewGoalTarget('');
  };

  const updateGoalProgress = (goalId: string, increment: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.min(goal.current + increment, goal.target);
        const wasComplete = goal.current >= goal.target;
        const isNowComplete = newCurrent >= goal.target;
        
        if (!wasComplete && isNowComplete) {
          dispatch({ 
            type: 'ADD_XP', 
            payload: { amount: 300, source: `Completed: ${goal.title}!` } 
          });
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: {
              id: Date.now().toString(),
              type: 'achievement',
              title: 'Goal Achieved! 🎉',
              message: `Completed "${goal.title}"! +300 XP`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
            }
          });
        }
        
        return { ...goal, current: newCurrent };
      }
      return goal;
    }));
  };

  // Stats
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalXPEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
  const streak = 5; // TODO: Calculate actual streak

  const skillStats = categories.map(cat => ({
    ...cat,
    sessions: sessions.filter(s => s.category === cat.name).length,
    minutes: sessions.filter(s => s.category === cat.name).reduce((sum, s) => sum + s.duration, 0),
  })).filter(s => s.sessions > 0).sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
            <BookOpen className="text-purple-400" size={36} />
            LEARNING <span className="text-purple-400">📚</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-mono">
            // Every page read, every skill learned = permanent stat boost.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'sessions', label: 'Sessions', icon: Clock },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'skills', label: 'Skill Tree', icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 font-bold border-2 brutal-shadow whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-black border-purple-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brutal-card bg-purple-900/20 border-purple-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-purple-400" size={28} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Sessions</p>
                <p className="text-2xl font-black text-purple-400 font-mono">{totalSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brutal-card bg-cyan-900/20 border-cyan-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="text-cyan-400" size={28} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Minutes</p>
                <p className="text-2xl font-black text-cyan-400 font-mono">{totalMinutes}</p>
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
              <Trophy className="text-yellow-400" size={28} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">XP Earned</p>
                <p className="text-2xl font-black text-yellow-400 font-mono">+{totalXPEarned}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="brutal-card bg-orange-900/20 border-orange-500/50 p-4"
          >
            <div className="flex items-center gap-3">
              <Flame className="text-orange-400" size={28} />
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Streak</p>
                <p className="text-2xl font-black text-orange-400 font-mono">{streak} days</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">LEARNING SESSIONS</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="brutal-card bg-purple-500 hover:bg-purple-600 border-purple-400 text-black px-4 py-2 font-black flex items-center gap-2"
              >
                <Plus size={16} /> LOG SESSION
              </motion.button>
            </div>

            <div className="brutal-card bg-gray-900 border-gray-700 p-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="text-gray-600 mx-auto mb-4" size={64} />
                  <p className="text-gray-500 font-mono">No learning sessions yet.</p>
                  <p className="text-gray-600 text-sm font-mono mt-2">Start learning something new! 📚</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="brutal-card bg-gray-800 border-purple-500/30 p-4 hover:border-purple-500/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {learningTypes.find(t => t.id === session.type)?.icon || '📚'}
                          </span>
                          <div>
                            <h3 className="text-white font-bold">{session.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm">
                              <span className="text-purple-400">{session.category}</span>
                              <span className="text-gray-500 font-mono flex items-center gap-1">
                                <Clock size={12} /> {session.duration} min
                              </span>
                              {(session.progress ?? 0) > 0 && (
                                <span className="text-cyan-400 font-mono">
                                  +{session.progress} {learningTypes.find(t => t.id === session.type)?.unit}
                                </span>
                              )}
                              <span className="text-gray-500 font-mono">
                                {session.date.toLocaleDateString()}
                              </span>
                            </div>
                            {session.notes && (
                              <p className="text-gray-400 text-sm mt-1 italic">"{session.notes}"</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-purple-400">+{session.xpEarned} XP</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white font-mono">LEARNING GOALS</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGoalModal(true)}
                className="brutal-card bg-cyan-500 hover:bg-cyan-600 border-cyan-400 text-black px-4 py-2 font-black flex items-center gap-2"
              >
                <Plus size={16} /> NEW GOAL
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal, index) => {
                const progressPercent = (goal.current / goal.target) * 100;
                const isComplete = goal.current >= goal.target;
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`brutal-card p-4 ${
                      isComplete ? 'bg-green-900/30 border-green-500' : 'bg-gray-900 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{goal.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          {goal.title}
                          {isComplete && <CheckCircle className="text-green-400" size={16} />}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{goal.type}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 font-mono">{goal.current} / {goal.target} {goal.unit}</span>
                        <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-purple-400'}`}>
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-800 border border-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`}
                        />
                      </div>
                    </div>

                    {!isComplete && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => updateGoalProgress(goal.id, goal.type === 'book' ? 10 : goal.type === 'course' ? 5 : 1)}
                          className="flex-1 px-3 py-2 bg-purple-500 text-black font-bold text-sm border-2 border-purple-400"
                        >
                          +{goal.type === 'book' ? '10 pages' : goal.type === 'course' ? '5%' : '1 hour'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-black text-white font-mono mb-4">SKILL TREE</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Skills */}
              <div className="brutal-card bg-gray-900 border-gray-700 p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Brain className="text-purple-400" /> YOUR SKILLS
                </h3>
                
                {skillStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Start learning to unlock skills!</p>
                ) : (
                  <div className="space-y-4">
                    {skillStats.slice(0, 6).map((skill, index) => (
                      <div key={skill.name} className="flex items-center gap-4">
                        <span className="text-2xl">{skill.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-white font-medium">{skill.name}</span>
                            <span className="text-purple-400 font-mono">{skill.minutes} min</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((skill.minutes / 600) * 100, 100)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{skill.sessions} sessions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skill Recommendations */}
              <div className="brutal-card bg-gray-900 border-gray-700 p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="text-yellow-400" /> RECOMMENDED
                </h3>
                
                <div className="space-y-4">
                  {[
                    { skill: 'System Design', reason: 'Essential for senior roles', icon: '🏗️', xp: 500 },
                    { skill: 'Data Structures', reason: 'Core for interviews', icon: '🧮', xp: 400 },
                    { skill: 'Cloud (AWS/GCP)', reason: 'High demand skill', icon: '☁️', xp: 450 },
                    { skill: 'Communication', reason: 'Career accelerator', icon: '🗣️', xp: 300 },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <span className="text-3xl">{rec.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{rec.skill}</h4>
                        <p className="text-sm text-gray-500">{rec.reason}</p>
                      </div>
                      <div className="text-yellow-400 font-mono text-sm">
                        +{rec.xp} XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Session Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-purple-500 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <BookOpen className="text-purple-500" /> LOG LEARNING
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TYPE</label>
                    <select
                      value={selectedType.id}
                      onChange={e => setSelectedType(learningTypes.find(t => t.id === e.target.value)!)}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                    >
                      {learningTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TITLE</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="What are you learning?"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">CATEGORY</label>
                    <select
                      value={selectedCategory.name}
                      onChange={e => setSelectedCategory(categories.find(c => c.name === e.target.value)!)}
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">DURATION (min)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(parseInt(e.target.value))}
                        min="5"
                        step="5"
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 font-mono block mb-2">
                        PROGRESS ({selectedType.unit})
                      </label>
                      <input
                        type="number"
                        value={progress}
                        onChange={e => setProgress(parseInt(e.target.value))}
                        min="0"
                        placeholder="Optional"
                        className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">NOTES (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Key takeaways?"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-purple-500 outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="brutal-card bg-purple-900/30 border-purple-500/50 p-4">
                    <p className="text-purple-400 font-mono text-sm">
                      ⚡ You will earn <span className="font-black text-lg">+{calculateXP()} XP</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addSession}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-black font-black py-3 px-4 border-2 border-purple-400 brutal-shadow"
                    >
                      <CheckCircle className="inline mr-2" size={16} />
                      LOG IT
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
        </AnimatePresence>

        {/* Add Goal Modal */}
        <AnimatePresence>
          {showGoalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGoalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="brutal-card bg-gray-900 border-cyan-500 p-6 max-w-md w-full"
              >
                <h2 className="text-2xl font-black text-white mb-4 font-mono flex items-center gap-2">
                  <Target className="text-cyan-500" /> NEW LEARNING GOAL
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">GOAL TITLE</label>
                    <input
                      type="text"
                      value={newGoalTitle}
                      onChange={e => setNewGoalTitle(e.target.value)}
                      placeholder="e.g., Complete React Course"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">TYPE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'book', label: 'Book', icon: '📚' },
                        { id: 'course', label: 'Course', icon: '🎓' },
                        { id: 'skill', label: 'Skill', icon: '💻' },
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setNewGoalType(type.id as any);
                            setNewGoalIcon(type.icon);
                          }}
                          className={`p-3 border-2 transition-colors flex flex-col items-center gap-1 ${
                            newGoalType === type.id
                              ? 'bg-cyan-500 text-black border-cyan-400'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-sm font-bold">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 font-mono block mb-2">
                      TARGET ({newGoalType === 'book' ? 'pages' : newGoalType === 'course' ? '%' : 'hours'})
                    </label>
                    <input
                      type="number"
                      value={newGoalTarget}
                      onChange={e => setNewGoalTarget(e.target.value)}
                      placeholder="Enter target"
                      className="w-full bg-gray-800 border-2 border-gray-700 text-white p-3 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addGoal}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-black py-3 px-4 border-2 border-cyan-400 brutal-shadow"
                    >
                      CREATE GOAL
                    </button>
                    <button
                      onClick={() => setShowGoalModal(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-black py-3 px-4 border-2 border-gray-600 brutal-shadow"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
