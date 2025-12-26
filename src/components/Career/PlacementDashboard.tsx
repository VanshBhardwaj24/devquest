import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Target, Trophy, TrendingUp, Calendar, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PlacementDashboard() {
  const { state } = useApp();
  const { user, darkMode } = state;

  const applicationsToday = React.useMemo(() => {
    if (!user?.internships) return 0;
    const today = new Date().toDateString();
    return user.internships.filter(app => {
      const d = new Date(app.dateApplied);
      return d.toDateString() === today;
    }).length;
  }, [user?.internships]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-mono uppercase tracking-tight">
            Placement <span className="text-lime-500">Dashboard</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm">Your command center for landing the dream job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
              <Target className="h-4 w-4 text-lime-500" /> Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black mb-1">{applicationsToday} / 3 <span className="text-sm text-gray-500 font-normal">Applications</span></div>
            <p className="text-xs text-gray-500">
              {applicationsToday >= 3 ? "Goal met! Great job." : `Apply to ${3 - applicationsToday} more companies today.`}
            </p>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Interview Prep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black mb-1">2 <span className="text-sm text-gray-500 font-normal">Problems</span></div>
            <p className="text-xs text-gray-500">Solve 2 DSA problems to stay sharp.</p>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-500" /> Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black mb-1">{user?.streak || 0} <span className="text-sm text-gray-500 font-normal">Days</span></div>
            <p className="text-xs text-gray-500">Consistency is key to success.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
          <CardHeader>
            <CardTitle className="font-mono uppercase flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="bg-orange-500/20 p-2 rounded">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Mock Interview</h4>
                  <p className="text-xs text-gray-500">Tomorrow at 4:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="bg-lime-500/20 p-2 rounded">
                  <CheckCircle2 className="h-5 w-5 text-lime-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Resume Review</h4>
                  <p className="text-xs text-gray-500">Friday at 2:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-black'} border-2 brutal-shadow`}>
          <CardHeader>
            <CardTitle className="font-mono uppercase flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" /> Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>DSA Syllabus</span>
                  <span>45%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Projects</span>
                  <span>70%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-cyan-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Core Subjects</span>
                  <span>30%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    className="h-full bg-lime-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
