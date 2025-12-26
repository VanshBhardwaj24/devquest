import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { 
  Target, Trophy, Heart, Brain, 
  Briefcase, Users, Plane,
  Zap, Award, Sparkles, Flag, CheckCircle,
  Circle, Plus, Globe,
  GraduationCap, Rocket, Lock, TrendingUp
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { appDataService } from '../../services/appDataService';

interface LifeArea {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  goals: LifeGoal[];
  milestones: Milestone[];
  isUnlocked: boolean;
  requiredAreas: string[];
}

interface LifeGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  targetDate: Date;
  progress: number;
  rewards: {
    xp: number;
    achievement?: string;
    unlock?: string;
  };
  dependencies: string[];
  subtasks: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: Date;
  icon: React.ReactNode;
  rewards: {
    xp: number;
    title: string;
    ability?: string;
  };
}

interface Journey {
  id: string;
  name: string;
  description: string;
  areas: LifeArea[];
  currentArea: string;
  journeyProgress: number;
  totalGoals: number;
  completedGoals: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const LIFE_AREAS: LifeArea[] = [
  {
    id: 'career',
    name: 'Career & Professional',
    description: 'Professional growth, skills, and achievements',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'blue',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_job',
        title: 'First Professional Role',
        description: 'Land your first career position',
        achieved: false,
        icon: <Trophy className="w-5 h-5" />,
        rewards: { xp: 100, title: 'Career Starter' }
      },
      {
        id: 'promotion',
        title: 'First Promotion',
        description: 'Get promoted to a higher position',
        achieved: false,
        icon: <TrendingUp className="w-5 h-5" />,
        rewards: { xp: 200, title: 'Rising Star', ability: 'Leadership Basics' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'relationships',
    name: 'Relationships & Social',
    description: 'Family, friends, and social connections',
    icon: <Users className="w-6 h-6" />,
    color: 'pink',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'deep_connection',
        title: 'Deep Connection',
        description: 'Form a meaningful, lasting relationship',
        achieved: false,
        icon: <Heart className="w-5 h-5" />,
        rewards: { xp: 150, title: 'Connection Master' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Physical and mental well-being',
    icon: <Heart className="w-6 h-6" />,
    color: 'green',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'fitness_goal',
        title: 'Fitness Achievement',
        description: 'Reach your fitness goals',
        achieved: false,
        icon: <Zap className="w-5 h-5" />,
        rewards: { xp: 120, title: 'Health Warrior' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'finance',
    name: 'Financial Freedom',
    description: 'Money management, investments, and wealth',
    icon: <Trophy className="w-6 h-6" />,
    color: 'yellow',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_savings',
        title: 'Emergency Fund',
        description: 'Build your first emergency fund',
        achieved: false,
        icon: <Award className="w-5 h-5" />,
        rewards: { xp: 100, title: 'Financial Planner' }
      }
    ],
    isUnlocked: false,
    requiredAreas: ['career']
  },
  {
    id: 'personal_growth',
    name: 'Personal Growth',
    description: 'Learning, skills, and self-improvement',
    icon: <Brain className="w-6 h-6" />,
    color: 'purple',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'skill_mastery',
        title: 'Skill Mastery',
        description: 'Master a new skill completely',
        achieved: false,
        icon: <GraduationCap className="w-5 h-5" />,
        rewards: { xp: 180, title: 'Lifelong Learner', ability: 'Accelerated Learning' }
      }
    ],
    isUnlocked: true,
    requiredAreas: []
  },
  {
    id: 'adventure',
    name: 'Adventure & Travel',
    description: 'Exploration, experiences, and memories',
    icon: <Plane className="w-6 h-6" />,
    color: 'orange',
    currentLevel: 1,
    targetLevel: 10,
    progress: 10,
    goals: [],
    milestones: [
      {
        id: 'first_trip',
        title: 'First Big Adventure',
        description: 'Embark on a memorable journey',
        achieved: false,
        icon: <Globe className="w-5 h-5" />,
        rewards: { xp: 150, title: 'Explorer' }
      }
    ],
    isUnlocked: false,
    requiredAreas: ['finance', 'health']
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
  };
  return colorMap[color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Set your first life goal',
    icon: <Target className="w-5 h-5" />,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'milestone_master',
    title: 'Milestone Master',
    description: 'Complete 5 milestones',
    icon: <Flag className="w-5 h-5" />,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'life_balancer',
    title: 'Life Balancer',
    description: 'Balance all 6 life areas',
    icon: <Sparkles className="w-5 h-5" />,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'journey_complete',
    title: 'Journey Complete',
    description: 'Complete your life journey',
    icon: <Rocket className="w-5 h-5" />,
    unlocked: false,
    rarity: 'legendary'
  }
];

export function LifeMap() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const [journey, setJourney] = useState<Journey>({
    id: 'main_journey',
    name: 'My Life Journey',
    description: 'The path to your ideal life',
    areas: LIFE_AREAS,
    currentArea: 'career',
    journeyProgress: 0,
    totalGoals: 0,
    completedGoals: 0,
    achievements: ACHIEVEMENTS
  });
  const [selectedArea, setSelectedArea] = useState<string>('career');
  const [newGoal, setNewGoal] = useState<Partial<LifeGoal>>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'not_started',
    targetDate: new Date(),
    progress: 0,
    rewards: { xp: 50 },
    dependencies: [],
    subtasks: []
  });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (user) {
      const loadLifeMapData = async () => {
        try {
          const appData = await appDataService.getAppData(user!.id);
          const savedJourney = appData?.lifeMap as Journey | undefined;
          
          if (savedJourney) {
            setJourney(savedJourney);
            calculateJourneyProgress(savedJourney);
          } else {
            // Initialize with default goals
            const initializedJourney = await initializeDefaultGoals();
            setJourney(initializedJourney);
            await saveLifeMapData(initializedJourney);
          }
        } catch (error) {
          console.error('Error loading life map data:', error);
        }
      };

      loadLifeMapData();
    }
  }, [user]);

  const initializeDefaultGoals = async () => {
    const defaultGoals: LifeGoal[] = [
      {
        id: 'career_start',
        title: 'Get First Job',
        description: 'Land your first professional position in your field',
        category: 'career',
        priority: 'high',
        status: 'not_started',
        targetDate: new Date('2025-06-01'),
        progress: 0,
        rewards: { xp: 100, achievement: 'Career Starter' },
        dependencies: [],
        subtasks: [
          { id: 'resume', title: 'Update Resume', completed: false },
          { id: 'apply', title: 'Apply to 10 companies', completed: false },
          { id: 'interview', title: 'Complete 3 interviews', completed: false }
        ]
      },
      {
        id: 'health_fitness',
        title: 'Improve Physical Fitness',
        description: 'Reach a healthy weight and fitness level',
        category: 'health',
        priority: 'medium',
        status: 'not_started',
        targetDate: new Date('2025-12-31'),
        progress: 0,
        rewards: { xp: 80, achievement: 'Health Warrior' },
        dependencies: [],
        subtasks: [
          { id: 'exercise', title: 'Exercise 3x per week', completed: false },
          { id: 'diet', title: 'Eat healthy meals', completed: false },
          { id: 'sleep', title: 'Get 8 hours sleep', completed: false }
        ]
      },
      {
        id: 'learning_skill',
        title: 'Learn New Skill',
        description: 'Master a valuable new skill',
        category: 'personal_growth',
        priority: 'medium',
        status: 'not_started',
        targetDate: new Date('2025-09-01'),
        progress: 0,
        rewards: { xp: 120, achievement: 'Skill Master' },
        dependencies: [],
        subtasks: [
          { id: 'research', title: 'Research skill options', completed: false },
          { id: 'course', title: 'Enroll in course', completed: false },
          { id: 'practice', title: 'Practice daily', completed: false }
        ]
      }
    ];

    const updatedAreas = LIFE_AREAS.map(area => {
      const areaGoals = defaultGoals.filter(goal => goal.category === area.id);
      return { ...area, goals: areaGoals };
    });

    return {
      ...journey,
      areas: updatedAreas,
      totalGoals: defaultGoals.length,
      completedGoals: 0
    };
  };

  const saveLifeMapData = async (updatedJourney: Journey) => {
    try {
      await appDataService.updateAppDataField(user!.id, 'lifeMap' as any, updatedJourney);
      setJourney(updatedJourney);
    } catch (error) {
      console.error('Error saving life map data:', error);
    }
  };

  const calculateJourneyProgress = (journeyData: Journey) => {
    const totalGoals = journeyData.areas.reduce((sum, area) => sum + area.goals.length, 0);
    const completedGoals = journeyData.areas.reduce((sum, area) => 
      sum + area.goals.filter(goal => goal.status === 'completed').length, 0
    );
    
    const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    // Update user level based on completed goals
    const newLevel = Math.max(1, Math.floor(completedGoals / 2) + 1);
    setUserLevel(newLevel);
    
    return { totalGoals, completedGoals, progress };
  };

  const addGoal = async () => {
    if (!newGoal.title || !selectedArea) return;

    const goal: LifeGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      category: selectedArea,
      priority: newGoal.priority || 'medium',
      status: 'not_started',
      targetDate: newGoal.targetDate || new Date(),
      progress: 0,
      rewards: newGoal.rewards || { xp: 50 },
      dependencies: newGoal.dependencies || [],
      subtasks: newGoal.subtasks || []
    };

    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === selectedArea) {
          return { ...area, goals: [...area.goals, goal] };
        }
        return area;
      })
    };

    const { totalGoals, completedGoals, progress } = calculateJourneyProgress(updatedJourney);
    updatedJourney.totalGoals = totalGoals;
    updatedJourney.completedGoals = completedGoals;
    updatedJourney.journeyProgress = progress;

    await saveLifeMapData(updatedJourney);

    // Award XP for setting a goal
    dispatch({ type: 'ADD_XP', payload: { amount: 10, source: 'Life Goal Set' } });
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'New Life Goal!',
      message: `Added "${goal.title}" to your life map (+10 XP)`,
      timestamp: new Date(),
      read: false,
      priority: 'low'
    }});

    setNewGoal({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'not_started',
      targetDate: new Date(),
      progress: 0,
      rewards: { xp: 50 },
      dependencies: [],
      subtasks: []
    });
    setShowGoalForm(false);
  };

  const updateGoalProgress = async (areaId: string, goalId: string, newProgress: number) => {
    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            goals: area.goals.map(goal => {
              if (goal.id === goalId) {
                const updatedGoal = { ...goal, progress: newProgress };
                
                // Check if goal is completed
                if (newProgress >= 100 && goal.status !== 'completed') {
                  updatedGoal.status = 'completed';
                  
                  // Award rewards
                  dispatch({ type: 'ADD_XP', payload: { 
                    amount: goal.rewards.xp, 
                    source: `Life Goal Completed: ${goal.title}` 
                  }});
                  
                  dispatch({ type: 'ADD_NOTIFICATION', payload: {
                    id: Date.now().toString(),
                    type: 'achievement',
                    title: 'Life Goal Achieved!',
                    message: `Completed "${goal.title}" (+${goal.rewards.xp} XP)`,
                    timestamp: new Date(),
                    read: false,
                    priority: 'high'
                  }});
                } else if (newProgress > 0 && newProgress < 100 && goal.status === 'not_started') {
                  updatedGoal.status = 'in_progress';
                }
                
                return updatedGoal;
              }
              return goal;
            })
          };
        }
        return area;
      })
    };

    const { totalGoals, completedGoals, progress } = calculateJourneyProgress(updatedJourney);
    updatedJourney.totalGoals = totalGoals;
    updatedJourney.completedGoals = completedGoals;
    updatedJourney.journeyProgress = progress;

    await saveLifeMapData(updatedJourney);
  };

  const toggleSubtask = async (areaId: string, goalId: string, subtaskId: string) => {
    const updatedJourney = {
      ...journey,
      areas: journey.areas.map(area => {
        if (area.id === areaId) {
          return {
            ...area,
            goals: area.goals.map(goal => {
              if (goal.id === goalId) {
                const updatedSubtasks = goal.subtasks.map(subtask =>
                  subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                );
                
                const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;
                const newProgress = (completedSubtasks / updatedSubtasks.length) * 100;
                
                return { ...goal, subtasks: updatedSubtasks, progress: newProgress };
              }
              return goal;
            })
          };
        }
        return area;
      })
    };

    await saveLifeMapData(updatedJourney);
  };

  const currentArea = journey.areas.find(area => area.id === selectedArea);
  const areaStats = useMemo(() => {
    return journey.areas.map(area => ({
      id: area.id,
      name: area.name,
      progress: area.goals.length > 0 
        ? (area.goals.filter(g => g.status === 'completed').length / area.goals.length) * 100
        : 0,
      goalsCount: area.goals.length,
      completedCount: area.goals.filter(g => g.status === 'completed').length
    }));
  }, [journey.areas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Life Map</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Level {userLevel}</div>
            <div className="text-sm text-gray-600">Life Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{journey.completedGoals}</div>
            <div className="text-sm text-gray-600">Goals Completed</div>
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            {journey.name}
          </CardTitle>
          <p className="text-gray-600">{journey.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Journey Progress</span>
              <span>{Math.round(journey.journeyProgress)}%</span>
            </div>
            <Progress value={journey.journeyProgress} className="h-3" />
            <div className="text-sm text-gray-600">
              {journey.completedGoals} of {journey.totalGoals} goals completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life Areas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areaStats.map(stat => {
          const area = journey.areas.find(a => a.id === stat.id);
          if (!area) return null;
          
          return (
            <Card 
              key={stat.id} 
              className={`cursor-pointer transition-all ${selectedArea === stat.id ? 'ring-2 ring-blue-500' : ''} ${area.isUnlocked ? 'hover:shadow-lg' : 'opacity-50'}`}
              onClick={() => area.isUnlocked && setSelectedArea(stat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(area.color).bg} ${getColorClasses(area.color).text}`}>
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{area.name}</h3>
                    <div className="text-sm text-gray-600">Level {area.currentLevel}</div>
                  </div>
                  {!area.isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(stat.progress)}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                  <div className="text-xs text-gray-600">
                    {stat.completedCount}/{stat.goalsCount} goals
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Area Details */}
      {currentArea && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {currentArea.icon}
                {currentArea.name}
              </CardTitle>
              <Button onClick={() => setShowGoalForm(!showGoalForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
            <p className="text-gray-600">{currentArea.description}</p>
          </CardHeader>
          <CardContent>
            {/* Add Goal Form */}
            {showGoalForm && (
              <div className="mb-6 p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">Add New Goal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Goal title..."
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Textarea
                  placeholder="Goal description..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={addGoal} disabled={!newGoal.title}>
                    Add Goal
                  </Button>
                  <Button variant="outline" onClick={() => setShowGoalForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              {currentArea.goals.map(goal => (
                <Card key={goal.id} className={`border-l-4 ${
                  goal.status === 'completed' ? 'border-green-500 bg-green-50' :
                  goal.status === 'in_progress' ? 'border-blue-500 bg-blue-50' :
                  goal.priority === 'critical' ? 'border-red-500' :
                  goal.priority === 'high' ? 'border-orange-500' :
                  goal.priority === 'medium' ? 'border-yellow-500' :
                  'border-gray-300'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex gap-2 mb-2">
                          <Badge variant={
                            goal.status === 'completed' ? 'default' :
                            goal.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{goal.priority}</Badge>
                          <Badge variant="outline">+{goal.rewards.xp} XP</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Target: {goal.targetDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(goal.progress)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      
                      {/* Subtasks */}
                      {goal.subtasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {goal.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2 text-sm">
                              <button
                                onClick={() => toggleSubtask(currentArea.id, goal.id, subtask.id)}
                                className="flex-shrink-0"
                              >
                                {subtask.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {currentArea.goals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No goals yet. Add your first goal to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
