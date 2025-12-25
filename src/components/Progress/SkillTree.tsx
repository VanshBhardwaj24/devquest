import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Database, Globe, Smartphone, Brain, Users, Briefcase, 
  Activity, Layers, Zap, Lock, Terminal, Target, Plus, Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Task } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Static definitions for skills
interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'soft' | 'life';
  prerequisites: string[];
  maxLevel: number;
  defaultIcon: React.ElementType;
  synergies: string[];
}

const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Technical Skills
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'The language of the web. Master ES6+, async programming, and DOM manipulation.',
    category: 'technical',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Code,
    synergies: ['typescript', 'react', 'nodejs']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Typed JavaScript at any scale. Interfaces, generics, and type safety.',
    category: 'technical',
    prerequisites: ['javascript'],
    maxLevel: 10,
    defaultIcon: Terminal,
    synergies: ['javascript', 'react']
  },
  {
    id: 'react',
    name: 'React',
    description: 'A library for building user interfaces. Components, hooks, and state management.',
    category: 'technical',
    prerequisites: ['javascript'],
    maxLevel: 10,
    defaultIcon: Globe,
    synergies: ['javascript', 'typescript', 'mobile-dev']
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
    category: 'technical',
    prerequisites: ['javascript'],
    maxLevel: 10,
    defaultIcon: Database,
    synergies: ['javascript', 'database']
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    description: 'Building apps for iOS and Android using React Native or Flutter.',
    category: 'technical',
    prerequisites: ['react'],
    maxLevel: 10,
    defaultIcon: Smartphone,
    synergies: ['react', 'javascript']
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'The foundation of efficient coding. Master arrays, trees, graphs, and dynamic programming.',
    category: 'technical',
    prerequisites: ['javascript'],
    maxLevel: 10,
    defaultIcon: Brain,
    synergies: ['problem-solving', 'javascript']
  },
  // Soft Skills
  {
    id: 'communication',
    name: 'Communication',
    description: 'Effective information exchange. Verbal, written, and non-verbal.',
    category: 'soft',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Users,
    synergies: ['leadership', 'negotiation']
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Guiding and motivating a team towards a common goal.',
    category: 'soft',
    prerequisites: ['communication'],
    maxLevel: 10,
    defaultIcon: Briefcase,
    synergies: ['communication', 'management']
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'The art of finding solutions to difficult or complex issues.',
    category: 'soft',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Brain,
    synergies: ['programming', 'logic']
  },
  // Life Skills
  {
    id: 'finance',
    name: 'Financial Literacy',
    description: 'Managing personal finances, investing, and budgeting.',
    category: 'life',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Activity,
    synergies: ['math', 'planning']
  },
  {
    id: 'fitness',
    name: 'Physical Fitness',
    description: 'Maintaining a healthy body through exercise and nutrition.',
    category: 'life',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Zap,
    synergies: ['discipline', 'health']
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Maintaining a moment-by-moment awareness of our thoughts and environment.',
    category: 'life',
    prerequisites: [],
    maxLevel: 10,
    defaultIcon: Layers,
    synergies: ['focus', 'stress-management']
  }
];

export function SkillTree() {
  const { state, dispatch } = useApp();
  const { user, tasks, darkMode } = state;
  const [selectedCategory, setSelectedCategory] = useState<'technical' | 'soft' | 'life'>('technical');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Merge user skills with definitions
  const mergedSkills = SKILL_DEFINITIONS.map(def => {
    const userSkill = user?.skills?.find(s => s.id === def.id);
    return {
      ...def,
      level: userSkill?.level || 0,
      xp: userSkill?.xp || 0,
      maxXp: userSkill?.maxXp || 100,
      isUnlocked: (userSkill?.level || 0) > 0 || def.prerequisites.every(preId => {
        const preSkill = user?.skills?.find(s => s.id === preId);
        return (preSkill?.level || 0) >= 1;
      })
    };
  }).filter(skill => skill.category === selectedCategory);

  const selectedSkill = selectedSkillId ? mergedSkills.find(s => s.id === selectedSkillId) || SKILL_DEFINITIONS.find(s => s.id === selectedSkillId) : null;

  // Get related tasks for selected skill
  const relatedTasks = selectedSkill ? tasks.filter(t => t.relatedSkillId === selectedSkill.id && !t.completed) : [];

  const handleQuickPractice = () => {
    if (!selectedSkill) return;
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'info',
        title: 'Quick Practice Initiated',
        message: `Started a rapid fire practice session for ${selectedSkill.name}. +10 XP`,
        timestamp: new Date()
      }
    });
    
    const now = new Date();
    const iso = now.toISOString().split('T')[0];
    dispatch({ type: 'ADD_SKILL_XP', payload: { skillId: selectedSkill.id, amount: 10, source: 'Practice' } });
    dispatch({ type: 'ADD_XP', payload: { amount: 10, source: `Practice ${selectedSkill.name}` } });
    dispatch({ type: 'RECORD_DAILY_ACTIVITY', payload: { date: iso, activity: { xpEarned: 10, activeMinutes: 1, lastActivityTime: now.toISOString() } } });
  };

  const handleCreateTask = (skillId: string, skillName: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `Practice ${skillName}`,
      description: `Dedicate 30 minutes to practicing ${skillName} concepts.`,
      priority: 'medium',
      completed: false,
      xp: 50,
      category: 'learning',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      createdAt: new Date(),
      streak: 0,
      relatedSkillId: skillId,
      difficulty: 'medium'
    };
    
    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'mission',
        title: 'New Skill Task Created',
        message: `A new task to practice ${skillName} has been added to your board.`,
        timestamp: new Date()
      }
    });
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
              Skill <span className="text-cyan-400">Tree</span>
            </h1>
            <p className="text-gray-500 font-mono">Upgrade your capabilities and unlock new potentials.</p>
          </div>
          
          <div className={`flex items-center gap-4 border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'} p-4 brutal-shadow`}>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Total Level</p>
              <p className="text-2xl font-black text-lime-500 font-mono">
                {user?.skills?.reduce((acc, s) => acc + s.level, 0) || 0}
              </p>
            </div>
            <div className="h-8 w-0.5 bg-gray-700" />
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Mastered</p>
              <p className="text-2xl font-black text-fuchsia-500 font-mono">
                {user?.skills?.filter(s => s.level >= 10).length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4">
          {(['technical', 'soft', 'life'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 font-bold font-mono uppercase border-2 transition-all ${
                selectedCategory === category
                  ? `bg-lime-500 text-black border-black brutal-shadow translate-y-[-2px]`
                  : `${darkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-white border-black text-gray-500'} hover:border-lime-500 hover:text-lime-500`
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {mergedSkills.map((skill) => {
              const Icon = skill.defaultIcon;
              const isLocked = !skill.isUnlocked;
              const progress = (skill.xp / skill.maxXp) * 100;
              const isSelected = selectedSkillId === skill.id;

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`
                    relative p-6 border-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-cyan-400 brutal-shadow' 
                      : `${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} hover:border-cyan-400`
                    }
                    ${isLocked ? 'opacity-60 grayscale' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-black'}`}>
                      {isLocked ? <Lock className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    {skill.level > 0 && (
                      <Badge variant="outline" className="font-mono uppercase bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500">
                        Lvl {skill.level}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold font-mono mb-2">{skill.name}</h3>
                  <p className="text-sm text-gray-500 font-mono mb-4 h-10 line-clamp-2">{skill.description}</p>

                  {!isLocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono uppercase text-gray-500">
                        <span>XP</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 border-2 border-black bg-gray-800 p-[1px]">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-1000" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-xs font-mono text-red-500 mt-4 flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      REQUIRES: {skill.prerequisites.join(', ').toUpperCase()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
             <AnimatePresence mode="wait">
              {selectedSkill ? (
                <motion.div
                  key={selectedSkill.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`sticky top-6 p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-black'}`}>
                      <selectedSkill.defaultIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black font-mono uppercase">{selectedSkill.name}</h2>
                      <Badge variant="outline" className="font-mono uppercase mt-1">{selectedSkill.category}</Badge>
                    </div>
                  </div>

                  <p className="text-gray-500 font-mono mb-8">{selectedSkill.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-3 border-2 ${darkMode ? 'border-gray-700' : 'border-black'} text-center`}>
                      <div className="text-xs uppercase text-gray-500 font-mono mb-1">Current Lvl</div>
                      <div className="text-2xl font-black text-lime-500 font-mono">{selectedSkill.level}</div>
                    </div>
                    <div className={`p-3 border-2 ${darkMode ? 'border-gray-700' : 'border-black'} text-center`}>
                      <div className="text-xs uppercase text-gray-500 font-mono mb-1">Max Lvl</div>
                      <div className="text-2xl font-black text-gray-500 font-mono">{selectedSkill.maxLevel}</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold font-mono uppercase text-sm">Progress</span>
                      <span className="font-mono text-fuchsia-500 text-sm">{selectedSkill.xp} / {selectedSkill.maxXp} XP</span>
                    </div>
                    <div className="h-4 border-2 border-black bg-gray-800 p-[2px]">
                       <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" 
                          style={{ width: `${(selectedSkill.xp / selectedSkill.maxXp) * 100}%` }}
                        />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold font-mono uppercase text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" /> Active Tasks
                    </h3>
                    
                    {relatedTasks.length > 0 ? (
                      <div className="space-y-2">
                        {relatedTasks.map(task => (
                          <div key={task.id} className={`p-3 border-2 ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
                            <span className="text-sm font-mono truncate">{task.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-gray-700 text-center">
                        <p className="text-xs font-mono text-gray-500 mb-2">No active tasks</p>
                        <button 
                          onClick={() => handleCreateTask(selectedSkill.id, selectedSkill.name)}
                          className="text-xs font-mono uppercase text-cyan-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <Plus className="w-3 h-3" /> Create Task
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-700 flex gap-2">
                    <Button 
                      className="flex-1 font-mono uppercase font-bold border-2 border-black brutal-shadow hover:translate-y-[-2px] active:translate-y-[0px] transition-all bg-lime-500 text-black hover:bg-lime-400"
                      onClick={handleQuickPractice}
                    >
                      <Zap className="w-4 h-4 mr-2" /> Practice
                    </Button>
                  </div>

                  {selectedSkill.synergies && selectedSkill.synergies.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold font-mono uppercase text-sm mb-2 flex items-center gap-2">
                         <LinkIcon className="w-4 h-4" /> Synergies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkill.synergies.map(synId => {
                           const syn = SKILL_DEFINITIONS.find(s => s.id === synId);
                           return syn ? (
                             <Badge key={synId} variant="outline" className="font-mono text-xs border-fuchsia-500 text-fuchsia-500">
                               {syn.name}
                             </Badge>
                           ) : null;
                        })}
                      </div>
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className={`h-64 flex items-center justify-center border-4 border-dashed ${darkMode ? 'border-gray-800 text-gray-700' : 'border-gray-300 text-gray-400'} font-mono uppercase`}>
                  Select a skill
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
