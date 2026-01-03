import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Zap, Target, Brain, Code, Activity, Layout, Star
} from 'lucide-react';
import { useApp, Skill } from '../../contexts/AppContext';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  level: number;
  xp: number;
  maxXp: number;
  isUnlocked: boolean;
  isMastered: boolean;
}

interface SkillTree {
  id: string;
  name: string;
  description: string;
  nodes: SkillNode[];
  requiredLevel: number;
  isUnlocked: boolean;
}

const getSkillIcon = (id: string) => {
  switch (id) {
    case 'coding': return <Code className="w-6 h-6" />;
    case 'design': return <Layout className="w-6 h-6" />;
    case 'logic': return <Brain className="w-6 h-6" />;
    case 'focus': return <Target className="w-6 h-6" />;
    case 'speed': return <Zap className="w-6 h-6" />;
    case 'stamina': return <Activity className="w-6 h-6" />;
    default: return <Star className="w-6 h-6" />;
  }
};

const mapSkillToNode = (skill: Skill): SkillNode => ({
  id: skill.id,
  name: skill.name,
  description: skill.description || `Master the art of ${skill.name}`,
  icon: getSkillIcon(skill.id),
  category: skill.category,
  level: skill.level,
  xp: 0, // Simplified for now
  maxXp: 100 * Math.pow(1.2, skill.level),
  isUnlocked: true,
  isMastered: skill.level >= skill.maxLevel,
});

export function SkillTree() {
  const { state, dispatch } = useApp();
  const { skills } = state;
  const [selectedTreeId, setSelectedTreeId] = useState<string>('Technical');

  const skillTrees = useMemo(() => {
    // Get unique categories
    const categories = Array.from(new Set(skills.map(s => s.category)));
    
    // Create a tree for each category
    return categories.map(category => ({
      id: category,
      name: `${category} Mastery`,
      description: `Develop your ${category.toLowerCase()} capabilities`,
      nodes: skills.filter(s => s.category === category).map(mapSkillToNode),
      requiredLevel: 1,
      isUnlocked: true
    }));
  }, [skills]);

  // Ensure selectedTreeId is valid
  const effectiveSelectedTreeId = skillTrees.some(t => t.id === selectedTreeId) 
    ? selectedTreeId 
    : skillTrees[0]?.id || 'Technical';

  const selectedTree = skillTrees.find(t => t.id === effectiveSelectedTreeId);

  const handleUpgradeSkill = (skillId: string) => {
    dispatch({
      type: 'UPDATE_SKILL',
      payload: { id: skillId, amount: 1 }
    });
  };

  if (!selectedTree) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>No skill trees available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            SKILL TREES
          </h2>
          <p className="text-gray-400">Unlock and master new abilities</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full">
          {skillTrees.map(tree => (
            <Button
              key={tree.id}
              variant={effectiveSelectedTreeId === tree.id ? "neon" : "outline"}
              onClick={() => setSelectedTreeId(tree.id)}
              className={effectiveSelectedTreeId !== tree.id ? "border-white/10 text-gray-400 hover:text-white hover:border-neon-blue/50" : ""}
            >
              {tree.id}
            </Button>
          ))}
        </div>
      </div>

      <Card variant="cyber" className="min-h-[600px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 pointer-events-none" />
        
        <CardHeader className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                {selectedTree.name}
                <Badge variant="outline" className="border-neon-blue text-neon-blue">
                  Level {Math.floor(selectedTree.nodes.reduce((acc, node) => acc + node.level, 0) / Math.max(1, selectedTree.nodes.length))}
                </Badge>
              </CardTitle>
              <p className="text-gray-400 mt-1">{selectedTree.description}</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-gray-500 uppercase tracking-wider">Total Mastery</div>
              <div className="text-xl font-mono text-neon-yellow">
                {Math.round(selectedTree.nodes.reduce((acc, node) => acc + (node.level / 150) * 100, 0) / Math.max(1, selectedTree.nodes.length))}%
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedTree.nodes.map((node) => (
              <div key={node.id} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                  node.isMastered ? 'from-neon-yellow to-neon-orange' : 'from-neon-blue to-neon-purple'
                } rounded-xl opacity-20 group-hover:opacity-50 blur transition duration-500`} />
                
                <div className="relative p-5 bg-black/80 border border-white/10 rounded-xl hover:border-neon-blue/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      node.isMastered ? 'bg-neon-yellow/10 text-neon-yellow' : 'bg-neon-blue/10 text-neon-blue'
                    }`}>
                      {node.icon}
                    </div>
                    <Badge variant="outline" className={
                      node.isMastered ? 'border-neon-yellow text-neon-yellow' : 'border-neon-blue text-neon-blue'
                    }>
                      Lvl {node.level}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 font-cyber">{node.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{node.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 uppercase">
                      <span>Progress</span>
                      <span>{Math.round((node.level / 150) * 100)}%</span>
                    </div>
                    <Progress value={(node.level / 150) * 100} className="h-1" />
                    
                    <Button 
                      className="w-full mt-2 font-cyber" 
                      variant={node.isMastered ? "outline" : "neon"}
                      disabled={node.isMastered}
                      onClick={() => handleUpgradeSkill(node.id)}
                    >
                      {node.isMastered ? 'MASTERED' : 'UPGRADE'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
