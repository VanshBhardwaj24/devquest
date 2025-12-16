import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Globe, Smartphone, Brain, Users, Briefcase, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Skill {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  level: number;
  maxLevel: number;
  xpRequired: number;
  currentXp: number;
  category: 'technical' | 'soft' | 'domain';
  prerequisites: string[];
  unlocked: boolean;
}

export function SkillTree() {
  const { state } = useApp();
  const { darkMode } = state;
  const [selectedCategory, setSelectedCategory] = useState<'technical' | 'soft' | 'domain'>('technical');

  const skills: Skill[] = [
    // Technical Skills
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: Code,
      level: 3,
      maxLevel: 5,
      xpRequired: 500,
      currentXp: 350,
      category: 'technical',
      prerequisites: [],
      unlocked: true,
    },
    {
      id: 'react',
      name: 'React',
      icon: Globe,
      level: 2,
      maxLevel: 5,
      xpRequired: 400,
      currentXp: 200,
      category: 'technical',
      prerequisites: ['javascript'],
      unlocked: true,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: Database,
      level: 1,
      maxLevel: 5,
      xpRequired: 300,
      currentXp: 100,
      category: 'technical',
      prerequisites: ['javascript'],
      unlocked: true,
    },
    {
      id: 'mobile-dev',
      name: 'Mobile Development',
      icon: Smartphone,
      level: 0,
      maxLevel: 5,
      xpRequired: 600,
      currentXp: 0,
      category: 'technical',
      prerequisites: ['react'],
      unlocked: false,
    },
    // Soft Skills
    {
      id: 'communication',
      name: 'Communication',
      icon: Users,
      level: 4,
      maxLevel: 5,
      xpRequired: 400,
      currentXp: 380,
      category: 'soft',
      prerequisites: [],
      unlocked: true,
    },
    {
      id: 'leadership',
      name: 'Leadership',
      icon: Briefcase,
      level: 2,
      maxLevel: 5,
      xpRequired: 500,
      currentXp: 250,
      category: 'soft',
      prerequisites: ['communication'],
      unlocked: true,
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      icon: Brain,
      level: 3,
      maxLevel: 5,
      xpRequired: 450,
      currentXp: 300,
      category: 'soft',
      prerequisites: [],
      unlocked: true,
    },
    // Domain Skills
    {
      id: 'web-development',
      name: 'Web Development',
      icon: Globe,
      level: 3,
      maxLevel: 5,
      xpRequired: 800,
      currentXp: 600,
      category: 'domain',
      prerequisites: ['javascript', 'react'],
      unlocked: true,
    },
    {
      id: 'full-stack',
      name: 'Full Stack',
      icon: Zap,
      level: 1,
      maxLevel: 5,
      xpRequired: 1000,
      currentXp: 200,
      category: 'domain',
      prerequisites: ['web-development', 'nodejs'],
      unlocked: true,
    },
  ];

  const filteredSkills = skills.filter(skill => skill.category === selectedCategory);

  const getSkillColor = (level: number, maxLevel: number) => {
    const percentage = level / maxLevel;
    if (percentage === 0) return 'from-gray-400 to-gray-600';
    if (percentage <= 0.2) return 'from-red-400 to-red-600';
    if (percentage <= 0.4) return 'from-orange-400 to-orange-600';
    if (percentage <= 0.6) return 'from-yellow-400 to-yellow-600';
    if (percentage <= 0.8) return 'from-green-400 to-green-600';
    return 'from-blue-400 to-purple-600';
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Skill Tree 🌳
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Track and level up your skills across different domains
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex space-x-2 mb-8">
          {(['technical', 'soft', 'domain'] as const).map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category} Skills
            </motion.button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => {
            const Icon = skill.icon;
            const progressPercentage = (skill.currentXp / skill.xpRequired) * 100;
            
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg border-2 ${
                  skill.unlocked ? 'border-transparent' : 'border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getSkillColor(skill.level, skill.maxLevel)}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Level
                    </div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {skill.level}/{skill.maxLevel}
                    </div>
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {skill.name}
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Progress
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {skill.currentXp}/{skill.xpRequired} XP
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${getSkillColor(skill.level, skill.maxLevel)}`}
                    />
                  </div>
                </div>

                {/* Prerequisites */}
                {skill.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Prerequisites:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {skill.prerequisites.map(prereq => {
                        const prereqSkill = skills.find(s => s.id === prereq);
                        return (
                          <span
                            key={prereq}
                            className={`px-2 py-1 rounded-full text-xs ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {prereqSkill?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!skill.unlocked}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    skill.unlocked
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {skill.unlocked ? 'Practice Skill' : 'Locked'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}