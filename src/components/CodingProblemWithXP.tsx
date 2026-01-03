/**
 * Enhanced Coding Problem Component with XP Integration
 * Automatically awards XP and updates streaks when problems are solved
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useXPSystem } from '../hooks/useXPSystem';
import { useStreakSystem } from '../hooks/useStreakSystem';

interface CodingProblemWithXPProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
    platform: string;
    topic: string;
    xpReward?: number;
  };
  onProblemSolved?: (problemId: string) => void;
  showXPAnimation?: boolean;
  className?: string;
}

export const CodingProblemWithXP: React.FC<CodingProblemWithXPProps> = ({
  problem,
  onProblemSolved,
  showXPAnimation = true,
  className = '',
}) => {
  const { addXP, calculateXPForAction } = useXPSystem();
  const { updateStreak, calculateStreakBonus } = useStreakSystem();
  const [isSolving, setIsSolving] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [solution, setSolution] = useState('');

  // Calculate XP reward for this problem
  const xpReward = useMemo(() => {
    const baseXP = problem.xpReward || calculateXPForAction('coding_problem', problem.difficulty);
    const streakBonus = calculateStreakBonus(baseXP);
    return baseXP + streakBonus - baseXP; // Just the bonus amount
  }, [problem.xpReward, problem.difficulty, calculateXPForAction, calculateStreakBonus]);

  // Get difficulty color and styling
  const getDifficultyStyle = () => {
    switch (problem.difficulty) {
      case 'Easy':
        return 'border-green-500 bg-green-50 text-green-800';
      case 'Medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'Hard':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'Elite':
        return 'border-red-500 bg-red-50 text-red-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      leetcode: '💻',
      geeksforgeeks: '🐘',
      codechef: '👨‍🍳',
      hackerrank: '🏆',
      codewars: '⚔️',
    };
    return icons[platform.toLowerCase()] || '💻';
  };

  // Handle problem submission
  const handleSubmit = useCallback(async () => {
    if (isSolving || !solution.trim()) return;

    setIsSolving(true);

    try {
      // Simulate problem solving validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate total XP (base + bonus)
      const baseXP = problem.xpReward || calculateXPForAction('coding_problem', problem.difficulty);
      const totalXP = calculateStreakBonus(baseXP);

      // Add XP
      addXP(totalXP, `coding_problem_${problem.id}`);

      // Update streak
      updateStreak('coding');

      // Call callback
      if (onProblemSolved) {
        onProblemSolved(problem.id);
      }

      // Show reward animation
      if (showXPAnimation) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
      }

      console.log(`Problem solved: ${problem.title} - +${totalXP} XP`);
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setIsSolving(false);
    }
  }, [
    problem,
    solution,
    isSolving,
    addXP,
    calculateXPForAction,
    updateStreak,
    calculateStreakBonus,
    onProblemSolved,
    showXPAnimation,
  ]);

  // Get XP amount display
  const getXPDisplay = () => {
    const baseXP = problem.xpReward || calculateXPForAction('coding_problem', problem.difficulty);
    const totalXP = calculateStreakBonus(baseXP);
    const bonus = totalXP - baseXP;
    
    if (bonus > 0) {
      return `${baseXP} + ${bonus} = ${totalXP} XP`;
    }
    return `${totalXP} XP`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Problem Card */}
      <div className={`border-2 rounded-lg p-6 transition-all duration-300 ${getDifficultyStyle()}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold">{problem.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyStyle()}`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="text-gray-700 mb-3">{problem.description}</p>
            
            {/* Problem Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <span>{getPlatformIcon(problem.platform)}</span>
                <span className="font-medium">{problem.platform}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📚</span>
                <span className="font-medium">{problem.topic}</span>
              </div>
            </div>
          </div>
          
          {/* XP Reward */}
          <div className="text-right ml-4">
            <p className="text-sm text-gray-600">Reward</p>
            <p className="text-xl font-bold text-indigo-600">
              {getXPDisplay()}
            </p>
          </div>
        </div>

        {/* Solution Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Solution
            </label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter your solution here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={isSolving}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSolving || !solution.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSolving || !solution.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSolving ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </span>
            ) : (
              <span>Submit Solution</span>
            )}
          </button>
        </div>

        {/* Streak Bonus Indicator */}
        {xpReward > 0 && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
              🔥 {xpReward} Bonus
            </span>
          </div>
        )}
      </div>

      {/* Success Animation */}
      {showReward && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg pointer-events-none">
          <div className="bg-white rounded-lg p-6 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Problem Solved!</h3>
              <p className="text-2xl font-bold text-indigo-600 mb-1">
                +{problem.xpReward || calculateXPForAction('coding_problem', problem.difficulty)} XP
              </p>
              {xpReward > 0 && (
                <p className="text-sm text-green-600">
                  +{xpReward} Streak Bonus
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">{problem.title}</p>
              <div className="mt-3 text-xs text-gray-500">
                {problem.platform} • {problem.topic} • {problem.difficulty}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingProblemWithXP;
