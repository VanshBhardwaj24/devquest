import React from 'react';
import { InternshipTracker as LifeInternshipTracker } from '../Life/InternshipTracker';

// Wrapper: Dashboard no longer hosts the internship quest implementation.
// This file forwards to the Life tab's implementation so imports remain valid.
export function InternshipTracker() {
  return <LifeInternshipTracker />;
}

export default InternshipTracker;
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
    { id: 'resume', name: 'Resume & Profile', icon: <FileText size={16} />, color: 'bg-cyan-400' },
    { id: 'skills', name: 'Skills Building', icon: <Code size={16} />, color: 'bg-purple-400' },
    { id: 'portfolio', name: 'Portfolio', icon: <Globe size={16} />, color: 'bg-emerald-400' },
    { id: 'networking', name: 'Networking', icon: <Users size={16} />, color: 'bg-orange-400' },
    { id: 'applications', name: 'Applications', icon: <Briefcase size={16} />, color: 'bg-rose-400' },
  ];

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const overallProgress = (completedMilestones / totalMilestones) * 100;
  const totalXP = milestones.reduce((sum, m) => sum + m.xp, 0);
  const earnedXP = milestones.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0);

  return (
    <div className="w-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
          <div className="p-1.5 bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <Target className="text-black" size={16} />
          </div>
          <span className="truncate uppercase tracking-tight">Internship Quest</span>
        </h3>
        <div className="flex items-center gap-2 bg-yellow-400 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
          <Sparkles size={14} className="text-black" />
          <span className="text-xs sm:text-sm font-bold text-black">
            {earnedXP}/{totalXP} XP
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className={`mb-6 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between text-xs mb-2 font-bold uppercase">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Mission Progress
          </span>
          <span className={darkMode ? 'text-white' : 'text-black'}>
            {completedMilestones}/{totalMilestones}
          </span>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 border-2 border-black relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-green-500 relative"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMEgwTDQwIDQwVjB6IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
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
                className={`w-full p-3 flex items-center justify-between transition-all border-2 ${
                  darkMode 
                    ? 'bg-zinc-900 border-white hover:bg-zinc-800' 
                    : 'bg-white border-black hover:bg-gray-100'
                } ${isExpanded ? 'translate-x-[2px] translate-y-[2px] shadow-none' : 'shadow-[4px_4px_0px_0px_#000]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 border-2 ${darkMode ? 'border-white' : 'border-black'} ${category.color} text-black shadow-[2px_2px_0px_0px_#000]`}>
                    {category.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className={`font-bold text-sm uppercase ${darkMode ? 'text-white' : 'text-black'}`}>
                      {category.name}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {categoryCompleted}/{categoryMilestones.length} Completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-16 h-2 border ${darkMode ? 'bg-zinc-800 border-white' : 'bg-gray-200 border-black'}`}>
                    <div 
                      className={`h-full ${category.color}`}
                      style={{ width: `${categoryProgress}%` }}
                    />
                  </div>
                  {isExpanded ? <ChevronUp size={16} className={darkMode ? 'text-white' : 'text-black'} /> : <ChevronDown size={16} className={darkMode ? 'text-white' : 'text-black'} />}
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
                    <div className="pt-2 px-1 space-y-2">
                      {categoryMilestones.map((milestone) => (
                        <div 
                          key={milestone.id}
                          className={`p-3 border-2 shadow-[2px_2px_0px_0px_#000] ${
                            milestone.completed 
                              ? 'bg-green-100 dark:bg-green-900/20' 
                              : darkMode 
                              ? 'bg-zinc-900 border-white' 
                              : 'bg-white border-black'
                          } ${milestone.completed ? (darkMode ? 'border-green-500' : 'border-green-600') : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => !milestone.subTasks && toggleMilestone(milestone.id)}
                                disabled={!!milestone.subTasks}
                                className={`${milestone.subTasks ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
                              >
                                {milestone.completed ? (
                                  <div className={`bg-green-500 text-white border-2 p-0.5 ${darkMode ? 'border-white' : 'border-black'}`}>
                                    <CheckCircle size={16} />
                                  </div>
                                ) : (
                                  <div className={`border-2 p-0.5 ${darkMode ? 'bg-zinc-800 border-white' : 'bg-gray-200 border-black'}`}>
                                    <Circle size={16} className={darkMode ? 'text-zinc-600' : 'text-gray-400'} />
                                  </div>
                                )}
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5 className={`font-bold text-sm uppercase ${
                                  milestone.completed 
                                    ? 'line-through text-gray-500' 
                                    : darkMode ? 'text-white' : 'text-black'
                                }`}>
                                  {milestone.title}
                                </h5>
                                <span className="text-xs bg-yellow-400 border border-black px-1.5 font-bold text-black flex-shrink-0">
                                  +{milestone.xp} XP
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {milestone.description}
                              </p>
                              
                              {/* Sub-tasks */}
                              {milestone.subTasks && (
                                <div className="mt-3 space-y-1">
                                  {milestone.subTasks.map((subTask) => (
                                    <button
                                      key={subTask.id}
                                      onClick={() => toggleSubTask(milestone.id, subTask.id)}
                                      className={`flex items-center gap-2 w-full text-left group p-1 transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                                    >
                                      {subTask.completed ? (
                                        <div className={`bg-green-500 text-white border ${darkMode ? 'border-white' : 'border-black'}`}>
                                          <CheckCircle size={10} />
                                        </div>
                                      ) : (
                                        <div className={`border ${darkMode ? 'border-white bg-zinc-800' : 'border-black bg-white'}`}>
                                          <Circle size={10} className="text-transparent" />
                                        </div>
                                      )}
                                      <span className={`text-xs ${
                                        subTask.completed 
                                          ? 'line-through text-gray-500' 
                                          : darkMode ? 'text-gray-300' : 'text-gray-700'
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
        <div className={`mt-6 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-2 bg-purple-500 border-2 border-black text-white">
            <Rocket size={20} />
          </div>
          <div>
            <span className={`text-sm font-bold block uppercase ${darkMode ? 'text-white' : 'text-black'}`}>
              Keep Pushing!
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalMilestones - completedMilestones} milestones remaining to complete your quest.
            </span>
          </div>
        </div>
      )}

      {completedMilestones === totalMilestones && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] bg-yellow-400 text-black text-center"
        >
          <Trophy size={32} className="mx-auto mb-2" />
          <h4 className="font-bold text-lg uppercase border-b-2 border-black inline-block mb-2">Quest Complete!</h4>
          <p className="text-sm font-bold">You're ready to land that internship! Go get 'em!</p>
        </motion.div>
      )}
    </div>
  );
}