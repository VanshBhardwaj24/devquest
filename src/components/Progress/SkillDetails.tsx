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
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-orange-100 text-orange-600';
      case 'expert': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-600';
      case 'rare': return 'bg-blue-100 text-blue-600';
      case 'epic': return 'bg-purple-100 text-purple-600';
      case 'legendary': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Skill Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Skill Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{skill.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{skill.stats.totalXpEarned}</div>
              <div className="text-sm text-gray-600">Total XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{skill.stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{skill.stats.efficiency.toFixed(1)}x</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mastery Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Mastery Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.masteryPath.map((path) => (
              <div key={path.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{path.name}</h4>
                  <p className="text-sm text-gray-600">{path.description}</p>
                  <Progress value={(path.progress / path.maxProgress) * 100} className="mt-2" />
                </div>
                <div className="ml-4">
                  {path.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Practice Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Session Duration</span>
              <span className="font-semibold">30 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated XP Gain</span>
              <span className="font-semibold text-green-600">+{Math.floor(25 * skill.stats.efficiency)} XP</span>
            </div>
            <Button 
              onClick={() => onPractice(skill.id)}
              className="w-full"
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
        <Card key={challenge.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{challenge.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {challenge.attempts}/{challenge.maxAttempts} attempts
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm font-semibold text-green-600">+{challenge.rewards.xp} XP</span>
                  <span className="text-sm font-semibold text-yellow-600">+{challenge.rewards.coins} Coins</span>
                </div>
              </div>
              <div className="ml-4">
                <Button
                  onClick={() => onChallenge(challenge.id)}
                  disabled={challenge.completed || challenge.attempts >= challenge.maxAttempts}
                  size="sm"
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
        <Card key={resource.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{resource.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{resource.type} • {resource.duration} min</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{resource.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
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
                  variant={resource.completed ? "secondary" : "default"}
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
        <Card key={achievement.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-100'}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{achievement.name}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="mt-2" />
                </div>
              </div>
              <div className="ml-4">
                {achievement.unlocked ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.progression.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                </div>
                <div>
                  {milestone.unlocked ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skill.progression.recommendations.map((rec, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}>
                        {rec.priority}
                      </Badge>
                      <span className="text-sm text-gray-500">{rec.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {skill.progression.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Estimated Time</span>
              <span className="text-sm">{skill.progression.estimatedTime} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {skill.icon}
            </div>
            <div className="flex-1">
              <CardTitle>{skill.name}</CardTitle>
              <p className="text-sm text-gray-600">{skill.description}</p>
            </div>
            <Badge className={getDifficultyColor(skill.progression.difficulty)}>
              {skill.progression.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Level {skill.level}</span>
              <span>{skill.xp}/{skill.maxXp} XP</span>
            </div>
            <Progress value={(skill.xp / skill.maxXp) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'challenges', label: 'Challenges', icon: Target },
          { id: 'resources', label: 'Resources', icon: BookOpen },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'progression', label: 'Progression', icon: TrendingUp }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
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
