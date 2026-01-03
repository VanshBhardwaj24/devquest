import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Trophy, Target, BookOpen, Clock, Star, Award, 
  Flame, TrendingUp, Zap, CheckCircle, Lock, 
  Calendar, Timer, BarChart3, Lightbulb
} from 'lucide-react';
import { SkillNode, SkillChallenge, SkillResource, SkillAchievement } from './SkillTree';

interface SkillDetailsProps {
  skill: SkillNode;
  onPractice: (skillId: string) => void;
  onChallenge: (challengeId: string) => void;
  onResourceComplete: (resourceId: string) => void;
}

export function SkillDetails({ skill, onPractice, onChallenge, onResourceComplete }: SkillDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'resources' | 'achievements' | 'progression'>('overview');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-neon-green/10 text-neon-green border-neon-green/30';
      case 'medium': return 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30';
      case 'hard': return 'bg-neon-orange/10 text-neon-orange border-neon-orange/30';
      case 'expert': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-800 text-gray-400';
      case 'rare': return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30';
      case 'epic': return 'bg-neon-purple/10 text-neon-purple border-neon-purple/30';
      case 'legendary': return 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Skill Stats */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <BarChart3 className="w-5 h-5" />
            Skill Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
              <div className="text-2xl font-bold text-neon-blue font-mono">{skill.level}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Current Level</div>
            </div>
            <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
              <div className="text-2xl font-bold text-neon-green font-mono">{skill.stats.totalXpEarned}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total XP Earned</div>
            </div>
            <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
              <div className="text-2xl font-bold text-neon-orange font-mono">{skill.stats.currentStreak}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-black/40 rounded-lg border border-white/5">
              <div className="text-2xl font-bold text-neon-purple font-mono">{skill.stats.efficiency.toFixed(1)}x</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mastery Path */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-purple">
            <Trophy className="w-5 h-5" />
            Mastery Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.masteryPath.map((path) => (
              <div key={path.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/40">
                <div className="flex-1">
                  <h4 className="font-semibold text-white font-cyber">{path.name}</h4>
                  <p className="text-sm text-gray-400">{path.description}</p>
                  <Progress value={(path.progress / path.maxProgress) * 100} className="mt-2 h-1.5" />
                </div>
                <div className="ml-4">
                  {path.completed ? (
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Session */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-yellow">
            <Zap className="w-5 h-5" />
            Practice Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Session Duration</span>
              <span className="font-semibold text-white font-mono">30 min</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Estimated XP Gain</span>
              <span className="font-semibold text-neon-green font-mono">+{Math.floor(25 * skill.stats.efficiency)} XP</span>
            </div>
            <Button 
              onClick={() => onPractice(skill.id)}
              className="w-full"
              variant="neon"
              disabled={!skill.isUnlocked}
            >
              {skill.isUnlocked ? 'Start Practice' : 'Skill Locked'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChallengesTab = () => (
    <div className="space-y-4">
      {skill.challenges.map((challenge) => (
        <Card key={challenge.id} variant="cyber" className="border-l-4 border-l-neon-purple">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white font-cyber">{challenge.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500 font-mono">
                    {challenge.attempts}/{challenge.maxAttempts} attempts
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 font-mono text-xs">
                  <span className="font-semibold text-neon-green">+{challenge.rewards.xp} XP</span>
                  <span className="font-semibold text-neon-yellow">+{challenge.rewards.coins} Coins</span>
                </div>
              </div>
              <div className="ml-4">
                <Button
                  onClick={() => onChallenge(challenge.id)}
                  disabled={challenge.completed || challenge.attempts >= challenge.maxAttempts}
                  size="sm"
                  variant={challenge.completed ? "ghost" : "glitch"}
                >
                  {challenge.completed ? 'Completed' : 'Start'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ResourcesTab = () => (
    <div className="space-y-4">
      {skill.resources.map((resource) => (
        <Card key={resource.id} variant="cyber" className="border-l-4 border-l-neon-blue">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white font-cyber">{resource.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{resource.type} • {resource.duration} min</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-neon-yellow" />
                    <span className="text-sm text-gray-300">{resource.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-white/20 text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="ml-4">
                <Button
                  onClick={() => onResourceComplete(resource.id)}
                  disabled={resource.completed}
                  size="sm"
                  variant={resource.completed ? "secondary" : "neon"}
                >
                  {resource.completed ? 'Completed' : 'View'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-4">
      {skill.achievements.map((achievement) => (
        <Card key={achievement.id} variant="neon">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-800'}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white font-cyber">{achievement.name}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="mt-2 h-1.5" />
                </div>
              </div>
              <div className="ml-4">
                {achievement.unlocked ? (
                  <CheckCircle className="w-6 h-6 text-neon-green" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ProgressionTab = () => (
    <div className="space-y-6">
      {/* Milestones */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-pink">
            <Target className="w-5 h-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.progression.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-black/40">
                <div>
                  <h4 className="font-semibold text-white font-cyber">{milestone.title}</h4>
                  <p className="text-sm text-gray-400">{milestone.description}</p>
                </div>
                <div>
                  {milestone.unlocked ? (
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-yellow">
            <Lightbulb className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.progression.recommendations.map((rec, index) => (
              <div key={index} className="p-3 border border-white/10 rounded-lg bg-black/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white font-cyber">{rec.title}</h4>
                    <p className="text-sm text-gray-400">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={rec.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'}>
                        {rec.priority}
                      </Badge>
                      <span className="text-sm text-gray-500 font-mono">{rec.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card variant="neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <TrendingUp className="w-5 h-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {skill.progression.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue border border-neon-blue/50 flex items-center justify-center text-xs font-bold font-mono">
                  {index + 1}
                </div>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neon-blue">Estimated Time</span>
              <span className="text-sm text-gray-300 font-mono">{skill.progression.estimatedTime} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="neon" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent pointer-events-none" />
        <CardHeader>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue border border-neon-blue/30">
              {skill.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-white">{skill.name}</CardTitle>
              <p className="text-sm text-gray-400">{skill.description}</p>
            </div>
            <Badge variant="outline" className={getDifficultyColor(skill.progression.difficulty)}>
              {skill.progression.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-gray-300">Level {skill.level}</span>
              <span className="text-neon-blue">{skill.xp}/{skill.maxXp} XP</span>
            </div>
            <Progress value={(skill.xp / skill.maxXp) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/40 p-1 rounded-lg border border-white/10 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'challenges', label: 'Challenges', icon: Target },
          { id: 'resources', label: 'Resources', icon: BookOpen },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'progression', label: 'Progression', icon: TrendingUp }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "neon" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 ${activeTab === tab.id ? '' : 'text-gray-400 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'challenges' && <ChallengesTab />}
      {activeTab === 'resources' && <ResourcesTab />}
      {activeTab === 'achievements' && <AchievementsTab />}
      {activeTab === 'progression' && <ProgressionTab />}
    </div>
  );
}
