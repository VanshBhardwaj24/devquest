import React, { useMemo } from 'react';
import { useStreakSystem } from '../../hooks/useStreakSystem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

export function StreakAnalytics() {
  const streak = useStreakSystem();
  const percent = useMemo(() => {
    const next = streak.nextMilestone || 1;
    const value = Math.min(100, Math.max(0, Math.round((streak.currentStreak / next) * 100)));
    return value;
  }, [streak.currentStreak, streak.nextMilestone]);
  return (
    <Card className="mx-2 sm:mx-3 mt-3 bg-[#0f0f11] rounded-xl shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.03)] border border-white/5">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-xs sm:text-sm font-semibold text-gray-200">
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
          <span>Current</span>
          <span className="text-gray-200">{streak.currentStreak} days</span>
        </div>
        <Progress value={percent} className="h-2 bg-[#0b0b0d]" indicatorClassName="bg-gray-300" />
        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
          <div className="p-2 rounded-lg bg-[#0c0c0e] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.03)]">
            <div className="text-gray-500">Longest</div>
            <div className="text-gray-200 font-medium">{streak.longestStreak}</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0c0c0e] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.03)]">
            <div className="text-gray-500">Next</div>
            <div className="text-gray-200 font-medium">{streak.nextMilestone}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
          <div className="p-2 rounded-lg bg-[#0c0c0e] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.03)]">
            <div className="text-gray-500">Inactive</div>
            <div className="text-gray-200 font-medium">{streak.daysInactive}d</div>
          </div>
          <div className="p-2 rounded-lg bg-[#0c0c0e] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),inset_-6px_-6px_12px_rgba(255,255,255,0.03)]">
            <div className="text-gray-500">Protected</div>
            <div className="text-gray-200 font-medium">{streak.protection.hasShield ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
