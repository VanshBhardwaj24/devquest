import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Database, Globe, Smartphone, Brain, Users, Briefcase, Zap, 
  Lock, Unlock, Star, Trophy, ChevronRight, Cpu, Network, Terminal,
  Activity, Award, Layers, Plus, Target, Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Skill as UserSkill, Task } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

// Static definitions for skills (descriptions, prereqs, etc.)
interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'soft' | 'life';
  prerequisites: string[];
  maxLevel: number;
  defaultIcon: React.ElementType;
  synergies: string[]; // IDs of skills that boost this one
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const handleCreateTask = (skillId: string, skillName: string) => {
    // Dispatch action to open task modal with this skill pre-selected
    // For now, we'll just log it or maybe we need a way to trigger the modal from here
    // Ideally, we should have a global UI state for modals
    console.log(`Create task for ${skillName}`);
    // This would require a global modal state which we might not have exposed yet
    // Alternatively, we can just navigate to tasks page
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={cn(
              "text-4xl font-extrabold tracking-tight mb-2 font-cyber",
              darkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple" : "text-gray-900"
            )}>
              NEURAL INTERFACE // SKILL TREE
            </h1>
            <p className={cn("text-lg", darkMode ? "text-gray-400" : "text-gray-600")}>
              Upgrade your capabilities and unlock new potentials.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Total Level</p>
              <p className="text-2xl font-bold text-neon-blue font-mono">
                {user?.skills?.reduce((acc, s) => acc + s.level, 0) || 0}
              </p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Mastered</p>
              <p className="text-2xl font-bold text-neon-purple font-mono">
                {user?.skills?.filter(s => s.level >= 10).length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-4">
          {(['technical', 'soft', 'life'] as const).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "neon" : "ghost"}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "capitalize min-w-[120px]",
                selectedCategory !== category && darkMode && "text-gray-400 hover:text-white"
              )}
            >
              {category === 'technical' && <Cpu className="mr-2 h-4 w-4" />}
              {category === 'soft' && <Users className="mr-2 h-4 w-4" />}
              {category === 'life' && <Activity className="mr-2 h-4 w-4" />}
              {category}
            </Button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Grid */}
          <motion.div 
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {mergedSkills.map((skill) => {
              const Icon = skill.defaultIcon;
              const isLocked = !skill.isUnlocked;
              const progress = (skill.xp / skill.maxXp) * 100;
              
              return (
                <motion.div key={skill.id} variants={itemVariants}>
                  <Card 
                    variant={isLocked ? "default" : selectedSkillId === skill.id ? "neon" : "cyber"}
                    className={cn(
                      "cursor-pointer relative overflow-hidden group h-full",
                      isLocked && "opacity-60 grayscale",
                      selectedSkillId === skill.id && "ring-2 ring-neon-blue"
                    )}
                    onClick={() => setSelectedSkillId(skill.id)}
                  >
                    {/* Background decoration */}
                    {!isLocked && (
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon className="w-24 h-24 text-neon-blue" />
                      </div>
                    )}
                    
                    <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-lg ${isLocked ? 'bg-gray-700' : 'bg-neon-blue/20 text-neon-blue'}`}>
                          {isLocked ? <Lock className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                        </div>
                        {skill.level > 0 && (
                          <Badge variant="outline" className="font-mono text-neon-purple border-neon-purple">
                            LVL {skill.level}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{skill.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {skill.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      {isLocked ? (
                        <div className="text-sm text-red-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>Requires: {skill.prerequisites.map(p => SKILL_DEFINITIONS.find(d => d.id === p)?.name).join(', ')}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono text-gray-400">
                            <span>XP: {skill.xp} / {skill.maxXp}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Skill Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedSkill ? (
                <motion.div
                  key={selectedSkill.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card variant="holographic" className="sticky top-6 h-auto min-h-[500px]">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10">
                          <selectedSkill.defaultIcon className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl">{selectedSkill.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2 capitalize">{selectedSkill.category}</Badge>
                        </div>
                      </div>
                      <CardDescription className="text-lg text-gray-300">
                        {selectedSkill.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-8">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                          <p className="text-xs text-gray-400 uppercase">Current Level</p>
                          <p className="text-3xl font-bold text-neon-blue font-mono">{selectedSkill.level || 0}</p>
                        </div>
                        <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                          <p className="text-xs text-gray-400 uppercase">Max Level</p>
                          <p className="text-3xl font-bold text-gray-500 font-mono">{selectedSkill.maxLevel}</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-white">Progress to Next Level</span>
                          <span className="text-xs font-mono text-neon-purple">{selectedSkill.xp} / {selectedSkill.maxXp} XP</span>
                        </div>
                        <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                            initial={{ width: 0 }}
                            animate={{ width: `${(selectedSkill.xp / selectedSkill.maxXp) * 100}%` }}
                          />
                          {/* Scanline effect */}
                          <div className="absolute inset-0 bg-white/10 w-full animate-[scanline_2s_linear_infinite]" />
                        </div>
                      </div>

                      {/* Related Tasks */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4 text-neon-green" />
                            Active Tasks
                          </h3>
                          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleCreateTask(selectedSkill.id, selectedSkill.name)}>
                            <Plus className="w-3 h-3 mr-1" /> Add Task
                          </Button>
                        </div>
                        
                        {relatedTasks && relatedTasks.length > 0 ? (
                          <div className="space-y-2">
                            {relatedTasks.map(task => (
                              <div key={task.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="text-sm text-gray-300 truncate max-w-[180px]">{task.title}</span>
                                <Badge variant="outline" className="text-xs border-neon-blue text-neon-blue">
                                  {task.difficulty || 'Normal'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-4 border border-dashed border-gray-700 rounded-lg">
                            <p className="text-xs text-gray-500">No active tasks for this skill</p>
                            <Button variant="link" size="sm" className="text-neon-blue mt-1 h-auto p-0">Create one +</Button>
                          </div>
                        )}
                      </div>

                      {/* Synergies */}
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-neon-purple" />
                          Synergies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSkill.synergies?.map((synergyId) => {
                             const synergySkill = SKILL_DEFINITIONS.find(s => s.id === synergyId);
                             return synergySkill ? (
                               <Badge key={synergyId} variant="secondary" className="bg-purple-900/30 text-purple-300 border border-purple-500/30">
                                 {synergySkill.name}
                               </Badge>
                             ) : null;
                          })}
                          {!selectedSkill.synergies?.length && (
                            <span className="text-xs text-gray-500">No known synergies</span>
                          )}
                        </div>
                      </div>

                      {/* Unlocks/Perks */}
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          Next Unlocks
                        </h3>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                (selectedSkill.level || 0) >= (selectedSkill.level || 0) + i 
                                  ? 'bg-green-500/20 text-green-500' 
                                  : 'bg-gray-700/50 text-gray-500'
                              }`}>
                                { (selectedSkill.level || 0) >= (selectedSkill.level || 0) + i ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" /> }
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-200">Level {(selectedSkill.level || 0) + i} Perk</p>
                                <p className="text-xs text-gray-500">Unlocks advanced techniques</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full" variant="glitch" disabled={!selectedSkill.isUnlocked}>
                        {selectedSkill.isUnlocked ? 'Train Skill' : 'Locked'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 p-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <div className="text-center">
                    <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a skill to view details</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
