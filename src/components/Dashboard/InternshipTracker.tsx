import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, Circle, Target,
  FileText, Globe, Users,
  Rocket, ChevronDown, ChevronUp, Sparkles,
  Code, Trophy, Linkedin, Github, BookOpen, MessageSquare
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';

interface Milestone {
  id: string;
  title: string;
  description: string;
  iconName: string;
  completed: boolean;
  xp: number;
  category: 'resume' | 'skills' | 'portfolio' | 'networking' | 'applications';
  subTasks?: { id: string; title: string; completed: boolean }[];
}

// Helper function to get default milestones
function getDefaultMilestones(): Milestone[] {
  return [
    // Resume & Profile
    {
      id: 'resume-1',
      title: 'Create ATS-Friendly Resume',
      description: 'Build a clean, ATS-compatible resume with keywords',
      iconName: 'FileText',
      completed: false,
      xp: 200,
      category: 'resume',
      subTasks: [
        { id: 'r1-1', title: 'Choose clean template', completed: false },
        { id: 'r1-2', title: 'Add contact info & links', completed: false },
        { id: 'r1-3', title: 'Write compelling summary', completed: false },
        { id: 'r1-4', title: 'List relevant projects', completed: false },
        { id: 'r1-5', title: 'Add skills section', completed: false },
      ]
    },
    {
      id: 'resume-2',
      title: 'Optimize LinkedIn Profile',
      description: 'Complete profile with custom URL and headline',
      iconName: 'Linkedin',
      completed: false,
      xp: 150,
      category: 'resume',
      subTasks: [
        { id: 'r2-1', title: 'Professional photo', completed: false },
        { id: 'r2-2', title: 'Custom headline', completed: false },
        { id: 'r2-3', title: 'About section', completed: false },
        { id: 'r2-4', title: '500+ connections', completed: false },
      ]
    },
    {
      id: 'resume-3',
      title: 'GitHub Profile README',
      description: 'Create an impressive GitHub profile with stats',
      iconName: 'Github',
      completed: false,
      xp: 100,
      category: 'resume',
    },
    
    // Skills Building
    {
      id: 'skills-1',
      title: 'Master DSA Fundamentals',
      description: 'Complete 50+ problems on LeetCode/HackerRank',
      iconName: 'Code',
      completed: false,
      xp: 500,
      category: 'skills',
      subTasks: [
        { id: 's1-1', title: 'Arrays & Strings (15 problems)', completed: false },
        { id: 's1-2', title: 'Linked Lists (10 problems)', completed: false },
        { id: 's1-3', title: 'Trees & Graphs (15 problems)', completed: false },
        { id: 's1-4', title: 'Dynamic Programming (10 problems)', completed: false },
      ]
    },
    {
      id: 'skills-2',
      title: 'Build 3 Full-Stack Projects',
      description: 'Create portfolio-worthy projects with deployment',
      iconName: 'BookOpen',
      completed: false,
      xp: 400,
      category: 'skills',
      subTasks: [
        { id: 's2-1', title: 'Project 1: Full-stack web app', completed: false },
        { id: 's2-2', title: 'Project 2: API + Frontend', completed: false },
        { id: 's2-3', title: 'Project 3: Mobile/Desktop app', completed: false },
        { id: 's2-4', title: 'Deploy all projects', completed: false },
      ]
    },
    
    // Portfolio
    {
      id: 'portfolio-1',
      title: 'Create Personal Portfolio Website',
      description: 'Build and deploy a stunning portfolio site',
      iconName: 'Globe',
      completed: false,
      xp: 300,
      category: 'portfolio',
      subTasks: [
        { id: 'p1-1', title: 'Design mockup', completed: false },
        { id: 'p1-2', title: 'Build responsive site', completed: false },
        { id: 'p1-3', title: 'Add project showcase', completed: false },
        { id: 'p1-4', title: 'Deploy to Vercel/Netlify', completed: false },
      ]
    },
    {
      id: 'portfolio-2',
      title: 'Write Technical Blog Posts',
      description: 'Publish 5+ technical articles on Medium/Dev.to',
      iconName: 'Rocket',
      completed: false,
      xp: 600,
      category: 'portfolio',
      subTasks: [
        { id: 'p2-1', title: 'Write 5 blog posts', completed: false },
        { id: 'p2-2', title: 'Get 100+ views total', completed: false },
        { id: 'p2-3', title: 'Share on LinkedIn', completed: false },
      ]
    },
    
    // Networking
    {
      id: 'network-1',
      title: 'Attend Tech Meetups/Conferences',
      description: 'Join communities and build professional network',
      iconName: 'Users',
      completed: false,
      xp: 250,
      category: 'networking',
      subTasks: [
        { id: 'n1-1', title: 'Join Discord/Slack communities', completed: false },
        { id: 'n1-2', title: 'Attend 2 meetups/webinars', completed: false },
        { id: 'n1-3', title: 'Connect with 10 developers', completed: false },
        { id: 'n1-4', title: 'Get 1 referral', completed: false },
      ]
    },
    {
      id: 'network-2',
      title: 'Practice Mock Interviews',
      description: 'Complete mock interviews and get feedback',
      iconName: 'MessageSquare',
      completed: false,
      xp: 300,
      category: 'networking',
    },
    
    // Applications
    {
      id: 'apply-1',
      title: 'Apply to 10+ Internships',
      description: 'Submit applications to target companies',
      iconName: 'Briefcase',
      completed: false,
      xp: 400,
      category: 'applications',
      subTasks: [
        { id: 'a1-1', title: 'Research 20 companies', completed: false },
        { id: 'a1-2', title: 'Apply to 10 internships', completed: false },
        { id: 'a1-3', title: 'Follow up on applications', completed: false },
        { id: 'a1-4', title: 'Track in spreadsheet', completed: false },
      ]
    },
    {
      id: 'apply-2',
      title: 'Land First Interview',
      description: 'Get called for technical/HR round',
      iconName: 'Trophy',
      completed: false,
      xp: 500,
      category: 'applications',
    },
  ];
}

export function InternshipTracker() {
  const { state, dispatch } = useApp();
  const { darkMode, user } = state;
  const { user: authUser } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  // Load milestones from localStorage
  useEffect(() => {
    const loadMilestones = () => {
      if (!authUser) {
        // Fallback to localStorage
        const saved = localStorage.getItem('internshipMilestones');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0 && parsed[0].iconName) {
              setMilestones(parsed);
            }
          } catch {
            // Use default milestones
          }
        }
        return;
      }

      // Load from localStorage only
      const saved = localStorage.getItem('internshipMilestones');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0 && parsed[0].iconName) {
            setMilestones(parsed);
            return;
          }
        } catch {
          // Continue to default milestones
        }
      }
      // Initialize with default milestones if nothing found
      const defaultMilestones = getDefaultMilestones();
      setMilestones(defaultMilestones);
    };
    loadMilestones();
  }, [authUser]);
  
  // Save milestones to localStorage
  useEffect(() => {
    if (milestones.length === 0) return;
    localStorage.setItem('internshipMilestones', JSON.stringify(milestones));
  }, [milestones]);
  
  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const newCompleted = !m.completed;
        if (newCompleted && user) {
          dispatch({
            type: 'ADD_XP',
            payload: { amount: m.xp, source: `Internship: ${m.title}` }
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              type: 'achievement',
              title: '🎯 Milestone Complete!',
              message: `+${m.xp} XP for "${m.title}"`,
              timestamp: new Date(),
            }
          });
        }
        return { ...m, completed: newCompleted };
      }
      return m;
    }));
  };

  const toggleSubTask = (milestoneId: string, subTaskId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId && m.subTasks) {
        const updatedSubTasks = m.subTasks.map(st => 
          st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubTasks.every(st => st.completed);
        
        if (allCompleted && !m.completed && user) {
          dispatch({
            type: 'ADD_XP',
            payload: { amount: m.xp, source: `Internship: ${m.title}` }
          });
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              type: 'achievement',
              title: '🎯 Milestone Complete!',
              message: `+${m.xp} XP for "${m.title}"`,
              timestamp: new Date(),
            }
          });
        }
        
        return { ...m, subTasks: updatedSubTasks, completed: allCompleted };
      }
      return m;
    }));
  };

  // Icon mapping function
  const getIcon = (iconName: string, size: number = 16) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      FileText: <FileText size={size} />,
      Linkedin: <Linkedin size={size} />,
      Github: <Github size={size} />,
      Code: <Code size={size} />,
      BookOpen: <BookOpen size={size} />,
      Globe: <Globe size={size} />,
      Rocket: <Rocket size={size} />,
      Users: <Users size={size} />,
      MessageSquare: <MessageSquare size={size} />,
      Briefcase: <Briefcase size={size} />,
      Trophy: <Trophy size={size} />,
      Target: <Target size={size} />,
    };
    return iconMap[iconName] || <Target size={size} />;
  };

  const categories = [
    { id: 'resume', name: 'Resume & Profile', icon: <FileText size={16} />, color: 'from-blue-500 to-cyan-500' },
    { id: 'skills', name: 'Skills Building', icon: <Code size={16} />, color: 'from-purple-500 to-pink-500' },
    { id: 'portfolio', name: 'Portfolio', icon: <Globe size={16} />, color: 'from-green-500 to-emerald-500' },
    { id: 'networking', name: 'Networking', icon: <Users size={16} />, color: 'from-orange-500 to-amber-500' },
    { id: 'applications', name: 'Applications', icon: <Briefcase size={16} />, color: 'from-red-500 to-rose-500' },
  ];

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const overallProgress = (completedMilestones / totalMilestones) * 100;
  const totalXP = milestones.reduce((sum, m) => sum + m.xp, 0);
  const earnedXP = milestones.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-bold text-sm sm:text-base flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="p-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
            <Target className="text-white" size={14} />
          </div>
          <span className="truncate">Internship Quest</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-yellow-500" />
          <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {earnedXP}/{totalXP} XP
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] sm:text-xs mb-1">
          <span className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Progress
          </span>
          <span className={`font-medium text-[10px] sm:text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {completedMilestones}/{totalMilestones}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative"
          >
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-1">
        {categories.map((category) => {
          const categoryMilestones = milestones.filter(m => m.category === category.id);
          const categoryCompleted = categoryMilestones.filter(m => m.completed).length;
          const categoryProgress = (categoryCompleted / categoryMilestones.length) * 100;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className={`w-full p-1.5 sm:p-2 rounded-lg flex items-center justify-between transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 hover:bg-gray-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
                } ${isExpanded ? 'ring-2 ring-purple-500/50' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded bg-gradient-to-r ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className={`font-medium text-xs sm:text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {category.name}
                    </h4>
                    <p className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {categoryCompleted}/{categoryMilestones.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                      style={{ width: `${categoryProgress}%` }}
                    />
                  </div>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pl-2 space-y-1">
                      {categoryMilestones.map((milestone) => (
                        <div 
                          key={milestone.id}
                          className={`p-1.5 sm:p-2 rounded-lg border-l-2 ${
                            milestone.completed 
                              ? 'border-green-500 bg-green-500/10' 
                              : darkMode 
                              ? 'border-gray-600 bg-gray-700/30' 
                              : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <div className={`p-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {getIcon(milestone.iconName, 14)}
                              </div>
                              <button
                                onClick={() => !milestone.subTasks && toggleMilestone(milestone.id)}
                                disabled={!!milestone.subTasks}
                                className={`${milestone.subTasks ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                {milestone.completed ? (
                                  <CheckCircle size={14} className="text-green-500" />
                                ) : (
                                  <Circle size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                                )}
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className={`font-medium text-xs sm:text-sm truncate ${
                                  milestone.completed 
                                    ? 'line-through text-gray-500' 
                                    : darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {milestone.title}
                                </h5>
                                <span className="text-[10px] sm:text-xs text-yellow-500 font-medium whitespace-nowrap flex-shrink-0">
                                  +{milestone.xp} XP
                                </span>
                              </div>
                              <p className={`text-[10px] sm:text-xs mt-0.5 line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {milestone.description}
                              </p>
                              
                              {/* Sub-tasks */}
                              {milestone.subTasks && (
                                <div className="mt-1.5 space-y-0.5">
                                  {milestone.subTasks.map((subTask) => (
                                    <button
                                      key={subTask.id}
                                      onClick={() => toggleSubTask(milestone.id, subTask.id)}
                                      className="flex items-center gap-1.5 w-full text-left group"
                                    >
                                      {subTask.completed ? (
                                        <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                                      ) : (
                                        <Circle size={12} className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:text-purple-500 flex-shrink-0`} />
                                      )}
                                      <span className={`text-[10px] sm:text-xs truncate ${
                                        subTask.completed 
                                          ? 'line-through text-gray-500' 
                                          : darkMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                        {subTask.title}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Motivation Footer */}
      {completedMilestones < totalMilestones && (
        <div className={`mt-2 p-1.5 sm:p-2 rounded-lg ${darkMode ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} border border-purple-500/20`}>
          <div className="flex items-center gap-1.5">
            <Rocket size={14} className="text-purple-500 flex-shrink-0" />
            <span className={`text-xs sm:text-sm truncate ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              {totalMilestones - completedMilestones} milestones left!
            </span>
          </div>
        </div>
      )}

      {completedMilestones === totalMilestones && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mt-2 p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center`}
        >
          <Trophy size={24} className="mx-auto mb-1" />
          <h4 className="font-bold text-sm sm:text-base">🎉 Quest Complete!</h4>
          <p className="text-xs sm:text-sm text-green-100">You're ready to land that internship!</p>
        </motion.div>
      )}
    </div>
  );
}
