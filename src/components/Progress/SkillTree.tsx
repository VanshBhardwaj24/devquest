import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { 
  Zap, Trophy, Target, Crown, Star, Lock, Unlock, Flame, Brain, Code, 
  Database, Globe, Users, MessageSquare, Heart, Sparkles, TrendingUp,
  Award, Gift, Coins, Gem, Shield, Sword, Hammer, Wrench, Cpu,
  BookOpen, GraduationCap, Lightbulb, Rocket, Compass, MapPin
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { appDataService } from '../../services/appDataService';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'technical' | 'creative' | 'business' | 'personal';
  level: number;
  xp: number;
  maxXp: number;
  costMultiplier: number;
  prerequisites: string[];
  synergies: string[];
  isUnlocked: boolean;
  isMastered: boolean;
  rewards: {
    xp: number;
    coins: number;
    title?: string;
    ability?: string;
  };
  nextLevelRewards: {
    xp: number;
    coins: number;
    title?: string;
    ability?: string;
  };
  // New components
  masteryPath: MasteryPath[];
  challenges: SkillChallenge[];
  resources: SkillResource[];
  achievements: SkillAchievement[];
  stats: SkillStats;
  progression: SkillProgression;
}

interface MasteryPath {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  rewards: {
    title: string;
    bonus: string;
    value: number;
  };
  completed: boolean;
  progress: number;
  maxProgress: number;
}

interface SkillChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: string[];
  rewards: {
    xp: number;
    coins: number;
    item?: string;
  };
  completed: boolean;
  attempts: number;
  maxAttempts: number;
  timeLimit?: number;
}

interface SkillResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'book' | 'tool';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  rating: number;
  tags: string[];
  completed: boolean;
  bookmarked: boolean;
}

interface SkillAchievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirements: string[];
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SkillStats {
  totalPracticeTime: number;
  practiceSessions: number;
  averageSessionTime: number;
  longestStreak: number;
  currentStreak: number;
  totalXpEarned: number;
  masteryPoints: number;
  efficiency: number;
}

interface SkillProgression {
  milestones: ProgressMilestone[];
  recommendations: ProgressRecommendation[];
  nextSteps: string[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  level: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rewards: string[];
}

interface ProgressRecommendation {
  type: 'practice' | 'resource' | 'challenge' | 'break';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  benefits: string[];
}

interface SkillTree {
  id: string;
  name: string;
  description: string;
  nodes: SkillNode[];
  requiredLevel: number;
  isUnlocked: boolean;
}

const calculateLevelUpCost = (baseCost: number, level: number, multiplier: number = 1.5): number => {
  return Math.floor(baseCost * Math.pow(multiplier, level - 1));
};

const calculateMaxXp = (level: number): number => {
  return 100 * Math.pow(1.2, level - 1);
};

const SKILL_TREES: SkillTree[] = [
  {
    id: 'technical',
    name: 'Technical Mastery',
    description: 'Programming, systems, and technology skills',
    requiredLevel: 1,
    isUnlocked: true,
    nodes: [
      {
        id: 'programming',
        name: 'Programming Fundamentals',
        description: 'Master the art of code and algorithms',
        icon: <Code className="w-6 h-6" />,
        category: 'technical',
        level: 1,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.5,
        prerequisites: [],
        synergies: ['algorithms', 'databases'],
        isUnlocked: true,
        isMastered: false,
        rewards: { xp: 50, coins: 100, title: 'Code Apprentice' },
        nextLevelRewards: { xp: 75, coins: 150, title: 'Code Journeyman' },
        masteryPath: [
          {
            id: 'code_apprentice',
            name: 'Code Apprentice',
            description: 'Complete 10 coding exercises',
            requirements: ['exercises_completed >= 10'],
            rewards: { title: 'Code Apprentice', bonus: 'xp_multiplier', value: 0.1 },
            completed: false,
            progress: 0,
            maxProgress: 10
          }
        ],
        challenges: [
          {
            id: 'first_program',
            title: 'First Program',
            description: 'Write your first working program',
            difficulty: 'easy',
            requirements: [],
            rewards: { xp: 25, coins: 50 },
            completed: false,
            attempts: 0,
            maxAttempts: 3
          }
        ],
        resources: [
          {
            id: 'basic_syntax',
            title: 'Basic Programming Syntax',
            type: 'article',
            url: '#',
            difficulty: 'beginner',
            duration: 30,
            rating: 4.5,
            tags: ['basics', 'syntax'],
            completed: false,
            bookmarked: false
          }
        ],
        achievements: [
          {
            id: 'first_line',
            name: 'First Line of Code',
            description: 'Write your first line of code',
            icon: <Star className="w-4 h-4" />,
            requirements: ['code_written'],
            progress: 0,
            maxProgress: 1,
            unlocked: false,
            rarity: 'common'
          }
        ],
        stats: {
          totalPracticeTime: 0,
          practiceSessions: 0,
          averageSessionTime: 0,
          longestStreak: 0,
          currentStreak: 0,
          totalXpEarned: 0,
          masteryPoints: 0,
          efficiency: 1.0
        },
        progression: {
          milestones: [
            {
              id: 'level_5',
              title: 'Level 5 Milestone',
              description: 'Reach level 5 in programming',
              level: 5,
              unlocked: false,
              rewards: ['bonus_xp', 'new_abilities']
            }
          ],
          recommendations: [
            {
              type: 'practice',
              title: 'Daily Coding Practice',
              description: 'Practice coding for 30 minutes daily',
              priority: 'high',
              estimatedTime: 30,
              benefits: ['skill_improvement', 'consistency_bonus']
            }
          ],
          nextSteps: ['Complete basic exercises', 'Read syntax guide'],
          estimatedTime: 120,
          difficulty: 'easy'
        }
      },
      {
        id: 'algorithms',
        name: 'Algorithm Design',
        description: 'Complex problem-solving and optimization',
        icon: <Brain className="w-6 h-6" />,
        category: 'technical',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.8,
        prerequisites: ['programming'],
        synergies: ['programming', 'databases'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 100, coins: 200, title: 'Algorithm Master' },
        nextLevelRewards: { xp: 150, coins: 300, ability: 'Pattern Recognition' }
      },
      {
        id: 'databases',
        name: 'Database Architecture',
        description: 'Data storage, retrieval, and management',
        icon: <Database className="w-6 h-6" />,
        category: 'technical',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.6,
        prerequisites: ['programming'],
        synergies: ['programming', 'algorithms'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 80, coins: 180, title: 'Data Architect' },
        nextLevelRewards: { xp: 120, coins: 270, ability: 'Query Optimization' }
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative Arts',
    description: 'Design, art, and creative expression',
    requiredLevel: 3,
    isUnlocked: false,
    nodes: [
      {
        id: 'design',
        name: 'Visual Design',
        description: 'Create beautiful and functional designs',
        icon: <Sparkles className="w-6 h-6" />,
        category: 'creative',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.4,
        prerequisites: [],
        synergies: ['writing', 'music'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 60, coins: 120, title: 'Design Novice' },
        nextLevelRewards: { xp: 90, coins: 180, ability: 'Color Theory' }
      },
      {
        id: 'writing',
        name: 'Creative Writing',
        description: 'Craft compelling stories and content',
        icon: <BookOpen className="w-6 h-6" />,
        category: 'creative',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.3,
        prerequisites: [],
        synergies: ['design', 'music'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 50, coins: 100, title: 'Storyteller' },
        nextLevelRewards: { xp: 75, coins: 150, ability: 'Narrative Structure' }
      }
    ]
  },
  {
    id: 'business',
    name: 'Business & Leadership',
    description: 'Entrepreneurship, management, and strategy',
    requiredLevel: 5,
    isUnlocked: false,
    nodes: [
      {
        id: 'leadership',
        name: 'Team Leadership',
        description: 'Inspire and guide teams to success',
        icon: <Users className="w-6 h-6" />,
        category: 'business',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.7,
        prerequisites: [],
        synergies: ['strategy', 'communication'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 100, coins: 250, title: 'Team Leader' },
        nextLevelRewards: { xp: 150, coins: 375, ability: 'Motivation Techniques' }
      },
      {
        id: 'strategy',
        name: 'Strategic Planning',
        description: 'Develop winning business strategies',
        icon: <Target className="w-6 h-6" />,
        category: 'business',
        level: 0,
        xp: 0,
        maxXp: 100,
        costMultiplier: 1.9,
        prerequisites: ['leadership'],
        synergies: ['leadership', 'communication'],
        isUnlocked: false,
        isMastered: false,
        rewards: { xp: 120, coins: 300, title: 'Strategist' },
        nextLevelRewards: { xp: 180, coins: 450, ability: 'Market Analysis' }
      }
    ]
  }
];

export function SkillTree() {
  const { state, dispatch } = useApp();
  const { authUser, xpSystem } = state;
  const [skillTrees, setSkillTrees] = useState<SkillTree[]>(SKILL_TREES);
  const [selectedTree, setSelectedTree] = useState<string>('technical');
  const [userLevel, setUserLevel] = useState(1);
  const [totalCoins, setTotalCoins] = useState(1000);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  useEffect(() => {
    if (authUser) {
      loadSkillData();
    }
  }, [authUser]);

  const loadSkillData = async () => {
    try {
      const appData = await appDataService.getAppData(authUser!.id);
      const savedSkills = appData?.skills || {};
      
      // Update skill trees with saved progress
      const updatedTrees = SKILL_TREES.map(tree => {
        const savedTree = savedSkills[tree.id];
        if (!savedTree) return tree;
        
        return {
          ...tree,
          nodes: tree.nodes.map(node => {
            const savedNode = savedTree.nodes?.find((n: any) => n.id === node.id);
            if (!savedNode) return node;
            
            return {
              ...node,
              level: savedNode.level || 0,
              xp: savedNode.xp || 0,
              isUnlocked: savedNode.isUnlocked || node.isUnlocked,
              isMastered: savedNode.isMastered || false
            };
          })
        };
      });
      
      setSkillTrees(updatedTrees);
      
      // Calculate user level based on total skill levels
      const totalLevels = updatedTrees.reduce((acc, tree) => 
        acc + tree.nodes.reduce((sum, node) => sum + node.level, 0), 0
      );
      setUserLevel(Math.max(1, Math.floor(totalLevels / 3)));
      
      setTotalCoins(appData?.coins || 1000);
    } catch (error) {
      console.error('Error loading skill data:', error);
    }
  };

  const saveSkillData = async (updatedTrees: SkillTree[]) => {
    try {
      const skillData = updatedTrees.reduce((acc, tree) => {
        acc[tree.id] = {
          nodes: tree.nodes.map(({ id, level, xp, isUnlocked, isMastered }) => ({
            id, level, xp, isUnlocked, isMastered
          }))
        };
        return acc;
      }, {} as any);
      
      await appDataService.updateAppDataField(authUser!.id, 'skills', skillData);
      setSkillTrees(updatedTrees);
    } catch (error) {
      console.error('Error saving skill data:', error);
    }
  };

  const canLevelUp = (node: SkillNode): boolean => {
    if (node.level >= 10) return false; // Max level
    if (!node.isUnlocked) return false;
    
    const cost = calculateLevelUpCost(100, node.level, node.costMultiplier);
    return totalCoins >= cost && node.xp >= node.maxXp;
  };

  const levelUpSkill = async (treeId: string, nodeId: string) => {
    const tree = skillTrees.find(t => t.id === treeId);
    const node = tree?.nodes.find(n => n.id === nodeId);
    
    if (!node || !canLevelUp(node)) return;
    
    const cost = calculateLevelUpCost(100, node.level, node.costMultiplier);
    
    // Update node
    const updatedTrees = skillTrees.map(t => {
      if (t.id !== treeId) return t;
      
      return {
        ...t,
        nodes: t.nodes.map(n => {
          if (n.id !== nodeId) return n;
          
          const newLevel = n.level + 1;
          const isMastered = newLevel >= 10;
          
          return {
            ...n,
            level: newLevel,
            xp: 0,
            maxXp: calculateMaxXp(newLevel),
            isMastered
          };
        })
      };
    });
    
    // Update coins and XP
    const newCoins = totalCoins - cost;
    setTotalCoins(newCoins);
    
    // Award rewards
    dispatch({ type: 'ADD_XP', payload: { 
      amount: node.nextLevelRewards.xp, 
      source: `Skill Level Up: ${node.name}` 
    }});
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'achievement',
      title: 'Skill Leveled Up!',
      message: `${node.name} is now level ${node.level + 1}! ${node.nextLevelRewards.title ? `New title: ${node.nextLevelRewards.title}` : ''}`,
      timestamp: new Date(),
      read: false,
      priority: 'high'
    }});
    
    // Unlock dependent skills
    const unlockedTrees = updatedTrees.map(t => {
      if (t.id !== treeId) return t;
      
      return {
        ...t,
        nodes: t.nodes.map(n => {
          if (n.prerequisites.includes(nodeId)) {
            return { ...n, isUnlocked: true };
          }
          return n;
        })
      };
    });
    
    await saveSkillData(unlockedTrees);
    
    // Update user level
    const totalLevels = unlockedTrees.reduce((acc, tree) => 
      acc + tree.nodes.reduce((sum, node) => sum + node.level, 0), 0
    );
    setUserLevel(Math.max(1, Math.floor(totalLevels / 3)));
  };

  const practiceSkill = async (treeId: string, nodeId: string) => {
    const tree = skillTrees.find(t => t.id === treeId);
    const node = tree?.nodes.find(n => n.id === nodeId);
    
    if (!node || !node.isUnlocked) return;
    
    const xpGain = Math.floor(Math.random() * 20) + 10; // 10-30 XP
    
    const updatedTrees = skillTrees.map(t => {
      if (t.id !== treeId) return t;
      
      return {
        ...t,
        nodes: t.nodes.map(n => {
          if (n.id !== nodeId) return n;
          
          const newXp = Math.min(n.xp + xpGain, n.maxXp);
          return { ...n, xp: newXp };
        })
      };
    });
    
    dispatch({ type: 'ADD_XP', payload: { amount: xpGain, source: `Practice: ${node.name}` } });
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: Date.now().toString(),
      type: 'skill-up',
      title: 'Skill Practice!',
      message: `Gained ${xpGain} XP in ${node.name}`,
      timestamp: new Date(),
      read: false,
      priority: 'low'
    }});
    
    await saveSkillData(updatedTrees);
  };

  const currentTree = skillTrees.find(t => t.id === selectedTree);
  const totalStats = useMemo(() => {
    return skillTrees.reduce((acc, tree) => ({
      totalSkills: acc.totalSkills + tree.nodes.length,
      unlockedSkills: acc.unlockedSkills + tree.nodes.filter(n => n.isUnlocked).length,
      masteredSkills: acc.masteredSkills + tree.nodes.filter(n => n.isMastered).length,
      totalLevels: acc.totalLevels + tree.nodes.reduce((sum, node) => sum + node.level, 0)
    }), { totalSkills: 0, unlockedSkills: 0, masteredSkills: 0, totalLevels: 0 });
  }, [skillTrees]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Tree</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Level {userLevel}</div>
            <div className="text-sm text-gray-600">Your Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{totalCoins}</div>
            <div className="text-sm text-gray-600">Coins</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalSkills}</div>
            <div className="text-sm text-gray-600">Total Skills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalStats.unlockedSkills}</div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalStats.masteredSkills}</div>
            <div className="text-sm text-gray-600">Mastered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalStats.totalLevels}</div>
            <div className="text-sm text-gray-600">Total Levels</div>
          </CardContent>
        </Card>
      </div>

      {/* Tree Selection */}
      <div className="flex gap-4 items-center">
        <Select value={selectedTree} onValueChange={setSelectedTree}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select skill tree" />
          </SelectTrigger>
          <SelectContent>
            {skillTrees.map(tree => (
              <SelectItem 
                key={tree.id} 
                value={tree.id}
                disabled={userLevel < tree.requiredLevel}
              >
                {tree.name} {userLevel < tree.requiredLevel && `(Req: Lvl ${tree.requiredLevel})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentTree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {currentTree.name}
            </CardTitle>
            <p className="text-gray-600">{currentTree.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {currentTree.nodes.map(node => (
                <Card key={node.id} className={`border-2 ${node.isUnlocked ? 'border-blue-500' : 'border-gray-300'} ${node.isMastered ? 'bg-gradient-to-r from-purple-50 to-pink-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${node.isUnlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {node.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{node.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant={node.isUnlocked ? 'default' : 'secondary'}>
                              Level {node.level}
                            </Badge>
                            {node.isMastered && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                                <Crown className="w-3 h-3 mr-1" />
                                MASTERED
                              </Badge>
                            )}
                            {!node.isUnlocked && (
                              <Badge variant="outline">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{node.description}</p>
                        
                        {node.isUnlocked && (
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{node.xp}/{node.maxXp} XP</span>
                              </div>
                              <Progress value={(node.xp / node.maxXp) * 100} className="h-2" />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => practiceSkill(currentTree.id, node.id)}
                                disabled={node.xp >= node.maxXp}
                              >
                                <Flame className="w-4 h-4 mr-1" />
                                Practice (+10-30 XP)
                              </Button>
                              
                              {node.level < 10 && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => levelUpSkill(currentTree.id, node.id)}
                                  disabled={!canLevelUp(node)}
                                >
                                  <Trophy className="w-4 h-4 mr-1" />
                                  Level Up ({calculateLevelUpCost(100, node.level, node.costMultiplier)} coins)
                                </Button>
                              )}
                            </div>
                            
                            {node.level < 10 && node.xp >= node.maxXp && (
                              <div className="text-sm text-green-600 font-medium">
                                Ready to level up! Cost: {calculateLevelUpCost(100, node.level, node.costMultiplier)} coins
                              </div>
                            )}
                            
                            {node.nextLevelRewards.title && node.level < 10 && (
                              <div className="text-sm text-purple-600">
                                Next reward: {node.nextLevelRewards.title}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!node.isUnlocked && node.prerequisites.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Requires: {node.prerequisites.map(prereq => 
                              currentTree.nodes.find(n => n.id === prereq)?.name || prereq
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
