import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { Folder, GitBranch, Star, Clock, CheckCircle2, Circle, Plus, X, Github, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Project } from '../../types';

export function ProjectShowcase() {
  const { state, dispatch } = useApp();
  const { darkMode, user } = state;
  const projects: Project[] = user?.projects || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    status: 'planning',
    progress: 0,
    techStack: [],
  });
  const [techInput, setTechInput] = useState('');

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'text-lime-500 border-lime-500 bg-lime-500/10';
      case 'in_progress': return 'text-cyan-400 border-cyan-400 bg-cyan-400/10';
      case 'planning': return 'text-orange-400 border-orange-400 bg-orange-400/10';
      case 'paused': return 'text-gray-400 border-gray-400 bg-gray-400/10';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'in_progress': return <Clock className="w-4 h-4 mr-1" />;
      case 'planning': return <Circle className="w-4 h-4 mr-1" />;
      case 'paused': return <Circle className="w-4 h-4 mr-1" />;
      default: return <Circle className="w-4 h-4 mr-1" />;
    }
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      status: (newProject.status as Project['status']) || 'planning',
      progress: newProject.progress || 0,
      techStack: newProject.techStack || [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      branch: 'main',
      stars: 0
    };

    dispatch({ type: 'ADD_PROJECT', payload: project });
    setIsAdding(false);
    setNewProject({
      title: '',
      description: '',
      status: 'planning',
      progress: 0,
      techStack: [],
    });
  };

  const addTech = () => {
    if (techInput.trim() && !newProject.techStack?.includes(techInput.trim())) {
      setNewProject({
        ...newProject,
        techStack: [...(newProject.techStack || []), techInput.trim()]
      });
      setTechInput('');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'} p-4`}>
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-4xl font-black font-mono uppercase tracking-tight mb-2">
            {(user?.name ? `${user.name}'s` : 'My')} <span className="text-lime-500">Projects</span>
            </h1>
            <p className="text-gray-500 font-mono">
              {user?.careerGoal ? `Focused on ${user.careerGoal}` : `Keep shipping`}
            </p>
        </div>
        <Button 
            onClick={() => setIsAdding(true)}
            className="bg-lime-500 text-black px-6 py-6 font-bold font-mono border-2 border-black brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        >
            <Plus className="w-5 h-5" /> {user?.name ? `New Project for ${user.name}` : 'New Project'}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className={`p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'} brutal-shadow relative`}>
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold font-mono mb-6">
                Initialize {newProject.title ? `"${newProject.title}"` : 'Project'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Project Title</Label>
                    <Input 
                      value={newProject.title}
                      onChange={e => setNewProject({...newProject, title: e.target.value})}
                      placeholder="e.g. Neural Network Visualizer"
                      className="font-mono mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={newProject.description}
                      onChange={e => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Brief overview of the project objectives..."
                      className="font-mono mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <div className="flex gap-2 mt-1">
                      {(['planning', 'in_progress', 'completed'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setNewProject({...newProject, status: s})}
                          className={`px-3 py-1 text-xs font-mono border ${
                            newProject.status === s 
                              ? 'bg-lime-500 text-black border-lime-500' 
                              : 'border-gray-600 text-gray-400'
                          }`}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Tech Stack</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={techInput}
                        onChange={e => setTechInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTech()}
                        placeholder="Add tech (Press Enter)"
                        className="font-mono"
                      />
                      <Button onClick={addTech} variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newProject.techStack?.map(tech => (
                        <Badge key={tech} variant="secondary" className="font-mono" onClick={() => {
                          setNewProject({
                            ...newProject,
                            techStack: newProject.techStack?.filter(t => t !== tech)
                          })
                        }}>
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleAddProject}
                  className="bg-cyan-400 text-black font-bold font-mono hover:bg-cyan-300"
                >
                  {user?.name ? `Create for ${user.name}` : 'Create'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative p-6 border-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} brutal-shadow hover:border-lime-500 transition-colors flex flex-col`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-gray-500" />
                <h3 className="text-xl font-bold font-mono">{project.title}</h3>
              </div>
              <Badge variant="outline" className={`font-mono uppercase ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status.replace('_', ' ')}
              </Badge>
            </div>

            <p className="text-gray-400 mb-6 font-mono text-sm h-10 line-clamp-2 flex-grow">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono uppercase text-gray-500">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-3 border-2 border-black bg-gray-800 p-[2px]">
                    <div 
                        className={`h-full ${project.status === 'completed' ? 'bg-lime-500' : 'bg-cyan-400'} transition-all duration-1000`} 
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                  <Badge key={tech} variant="secondary" className="font-mono">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-mono text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {project.branch || 'main'}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {project.stars || 0}
                </span>
              </div>
              <span>
                Updated {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(project.lastUpdated || project.createdAt)}
              </span>
            </div>
            
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-lime-500 hover:text-black transition-colors rounded-bl-lg border-l border-b border-gray-700">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-cyan-400 hover:text-black transition-colors rounded-bl-lg border-l border-b border-gray-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
            </div>
          </motion.div>
        ))}
        
        {/* Add new project placeholder - now clickable */}
        <motion.div
            onClick={() => setIsAdding(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: projects.length * 0.1 }}
            className={`flex flex-col items-center justify-center p-6 border-4 border-dashed ${darkMode ? 'border-gray-800 hover:border-lime-500/50 hover:bg-gray-900/50' : 'border-gray-300 hover:border-gray-400'} cursor-pointer transition-all min-h-[300px]`}
        >
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-gray-600 group-hover:text-lime-500" />
            </div>
            <p className="font-mono text-gray-500">
              {user?.careerGoal ? `Start a ${user.careerGoal} project` : 'Start a new project'}
            </p>
        </motion.div>
      </div>
    </div>
  );
}
