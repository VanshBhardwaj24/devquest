import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, GraduationCap, Target, Tags, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { achievementService } from '../../services/achievementService';
import { User } from '../../types';

export function ProfileSetup() {
  const { dispatch } = useApp();
  const { user: authUser, isDemoMode } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    degree: '',
    branch: '',
    year: 1,
    interests: [] as string[],
    careerGoal: '',
  });

  // Update email when authUser changes
  useEffect(() => {
    if (authUser?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: authUser.email || '' }));
    }
  }, [authUser?.email]);

  const degrees = [
    'B.Tech',
    'B.E.',
    'BCA',
    'B.Sc',
    'M.Tech',
    'MCA',
    'M.Sc',
    'MBA',
  ];

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical',
    'Electrical',
    'Other',
  ];

  const interestOptions = [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps',
    'UI/UX Design',
    'Product Management',
    'Cybersecurity',
    'Blockchain',
    'Game Development',
  ];

  const careerGoals = [
    'SDE Intern at FAANG',
    'Frontend Developer at Startup',
    'Data Scientist at Tech Company',
    'Product Manager Intern',
    'ML Engineer Role',
    'Full Stack Developer',
    'UI/UX Designer',
    'DevOps Engineer',
    'Mobile App Developer',
    'Cybersecurity Analyst',
  ];

  const handleSubmit = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const newUser: User = {
        id: isDemoMode ? 'demo-profile-id' : '',
        name: formData.name,
        email: formData.email,
        degree: formData.degree,
        branch: formData.branch,
        year: formData.year,
        interests: formData.interests,
        careerGoal: formData.careerGoal,
        avatar: '',
        level: 1,
        xp: 100,
        tier: 'Bronze',
        streak: 0,
        lastActivity: new Date(),
      };

      // In demo mode, skip Supabase calls and just set the user
      if (isDemoMode) {
        dispatch({ type: 'SET_USER', payload: newUser });
        dispatch({ type: 'COMPLETE_SETUP' });
        setLoading(false);
        return;
      }

      const profile = await profileService.createProfile({
        ...newUser,
        user_id: authUser.id,
      });

      const profileUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        degree: profile.degree,
        branch: profile.branch,
        year: profile.year,
        interests: profile.interests,
        careerGoal: profile.career_goal,
        avatar: profile.avatar,
        level: profile.level,
        xp: profile.xp,
        tier: profile.tier as 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mythic',
        streak: profile.streak,
        lastActivity: new Date(profile.last_activity),
      };

      dispatch({ type: 'SET_USER', payload: profileUser });
      dispatch({ type: 'COMPLETE_SETUP' });

      // Unlock profile completion achievement
      try {
        await achievementService.unlockAchievement(authUser.id, 'profile-complete');
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'profile-complete' });
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.email.trim() && formData.degree && formData.branch;
      case 2:
        return formData.interests.length > 0;
      case 3:
        return formData.careerGoal.trim();
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (step === 4) {
        handleSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome to Career Quest
          </h1>
          <p className="text-gray-600">
            Let's set up your profile to create a personalized career roadmap
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <GraduationCap className="mx-auto h-12 w-12 text-purple-500 mb-2" />
              <h2 className="text-2xl font-bold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
                  placeholder="Enter your email"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree *
                </label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Degree</option>
                  {degrees.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Tags className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <h2 className="text-2xl font-bold">Your Interests</h2>
              <p className="text-gray-600">Select areas you're passionate about (at least 1)</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map(interest => (
                <motion.button
                  key={interest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.interests.includes(interest)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{interest}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Career Goal */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Target className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <h2 className="text-2xl font-bold">Career Goal</h2>
              <p className="text-gray-600">What's your dream role?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {careerGoals.map(goal => (
                <motion.button
                  key={goal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, careerGoal: goal }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.careerGoal === goal
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{goal}</div>
                </motion.button>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Goal (Optional)
              </label>
              <input
                type="text"
                value={formData.careerGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, careerGoal: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your custom career goal"
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <CheckCircle className="mx-auto h-12 w-12 text-purple-500 mb-2" />
              <h2 className="text-2xl font-bold">Review Your Profile</h2>
              <p className="text-gray-600">Make sure everything looks good</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div><strong>Name:</strong> {formData.name}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Education:</strong> {formData.degree} in {formData.branch}, {formData.year}th Year</div>
              <div><strong>Interests:</strong> {formData.interests.join(', ')}</div>
              <div><strong>Career Goal:</strong> {formData.careerGoal}</div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-2 rounded-lg ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={loading || !canProceed()}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
              loading || !canProceed()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            <span>{loading ? 'Creating...' : step === 4 ? 'Complete Setup' : 'Next'}</span>
            {step !== 4 && !loading && <ChevronRight size={16} />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}