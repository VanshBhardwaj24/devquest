import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronUp, Zap, Lock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export function SkillMatrix() {
  const { state, dispatch } = useApp();
  const { skills, user } = state;
  const userGold = user?.gold || 0;
  const UPGRADE_COST = 50;

  const handleUpgrade = (skillId: string) => {
    if (userGold >= UPGRADE_COST) {
      dispatch({ 
        type: 'UPDATE_SKILL', 
        payload: { id: skillId, amount: 1 } 
      });
    } else {
        // Optional: Trigger a "not enough gold" visual feedback or notification
        // The reducer already handles the notification, but we could add local UI feedback
    }
  };

  return (
    <Card variant="neon" className="relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
       
       <CardHeader className="pb-2 relative z-10 border-b border-white/10 bg-black/40">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase text-gray-400 font-cyber flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-blue" /> Neural Link
            </CardTitle>
            <Badge variant="outline" className="border-neon-yellow text-neon-yellow bg-neon-yellow/10 font-mono">
                {userGold} G
            </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 relative z-10 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {skills.map((skill) => {
            const isMaxed = skill.level >= skill.maxLevel;
            const canAfford = userGold >= UPGRADE_COST;
            const progress = (skill.level / skill.maxLevel) * 100;

            return (
                <div key={skill.id} className="group relative bg-black/40 border border-white/5 p-3 rounded-lg hover:border-neon-blue/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-white font-cyber text-sm tracking-wide">{skill.name}</h4>
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/10 text-gray-300">
                                    Lvl {skill.level}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">{skill.category}</p>
                        </div>
                        
                        {!isMaxed ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpgrade(skill.id)}
                                disabled={!canAfford}
                                className={cn(
                                    "h-7 text-[10px] font-mono border border-white/10 hover:bg-neon-blue/20 hover:text-neon-blue hover:border-neon-blue/50 transition-all",
                                    !canAfford && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500"
                                )}
                            >
                                <span className="mr-1">UPGRADE</span>
                                <span className={cn(canAfford ? "text-neon-yellow" : "text-gray-500")}>
                                    {UPGRADE_COST}G
                                </span>
                            </Button>
                        ) : (
                            <Badge variant="outline" className="border-neon-green text-neon-green bg-neon-green/10">
                                MAXED
                            </Badge>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            className={cn(
                                "absolute top-0 left-0 h-full rounded-full shadow-[0_0_8px_currentColor]",
                                isMaxed ? "bg-neon-green text-neon-green" : "bg-neon-blue text-neon-blue"
                            )}
                        />
                    </div>
                </div>
            );
        })}
      </CardContent>
    </Card>
  );
}
