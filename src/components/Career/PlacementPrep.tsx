import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Briefcase, Users, FileText } from 'lucide-react';
import { PlacementDashboard } from './PlacementDashboard';
import { ApplicationTracker } from './ApplicationTracker';
import { PlacementChecklist } from './PlacementChecklist';
import { InterviewPrep } from './InterviewPrep';

type Tab = 'dashboard' | 'checklist' | 'applications' | 'interview';

export function PlacementPrep() {
  const { state } = useApp();
  const { darkMode } = state;
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'checklist', label: '90-Day Plan', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'applications', label: 'Applications', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'interview', label: 'Interview Prep', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className={`p-4 md:p-6 ${darkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-mono uppercase tracking-tight">
              Career <span className="text-indigo-500">Launchpad</span>
            </h1>
            <p className="text-gray-500 font-mono mt-1">
              Your comprehensive toolkit for placement success.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase transition-all
                ${
                  activeTab === tab.id
                    ? `border-b-4 ${darkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600'}`
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <PlacementDashboard />}
            {activeTab === 'checklist' && <PlacementChecklist />}
            {activeTab === 'applications' && <ApplicationTracker />}
            {activeTab === 'interview' && <InterviewPrep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
