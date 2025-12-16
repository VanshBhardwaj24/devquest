import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, Trophy, Target, AlertCircle, CheckCircle, RefreshCw, Skull, Terminal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signUp, signIn, loading: authLoading, error: authError, resetPassword, demoLogin } = useAuth();

  const loading = localLoading || authLoading;
  const error = localError || authError;
  const isConfigured = isSupabaseConfigured();

  const validateForm = () => {
    setLocalError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setLocalError('Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      setLocalError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      setLocalError('Demo mode: Please configure Supabase credentials in .env file to enable authentication');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      const { error } = isSignUp
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password);

      if (error) {
        setLocalError(error.message);
      } else {
        setSuccessMessage(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setLocalError(err.message || 'An unexpected error occurred');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isConfigured) {
      setLocalError('Demo mode: Password reset not available without Supabase configuration');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter your email address first');
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      const { error } = await resetPassword(email.trim());
      
      if (error) {
        setLocalError(error.message);
      } else {
        setSuccessMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send reset email');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Use the demo login function from useAuth
    setLocalLoading(true);
    setLocalError('');

    try {
      demoLogin();
      setSuccessMessage('Demo mode activated! Exploring Career Quest...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to activate demo mode');
    } finally {
      setLocalLoading(false);
    }
  };

  // Show configuration warning if Supabase is not set up
  const showConfigWarning = !isConfigured && !error;

  const features = [
    { icon: Zap, text: 'Gamified Learning Experience' },
    { icon: Trophy, text: 'Unlock Achievements & Badges' },
    { icon: Target, text: 'Track Your Career Progress' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_50px,#84cc16_50px,#84cc16_51px),repeating-linear-gradient(90deg,transparent,transparent_50px,#84cc16_50px,#84cc16_51px)]" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 bg-lime-500 border-4 border-black brutal-shadow flex items-center justify-center">
                <Skull className="w-10 h-10 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white font-mono">
                  DEV<span className="text-lime-400">QUEST</span>
                </h1>
                <p className="text-sm text-gray-500 font-mono tracking-widest">LEVEL UP OR DIE</p>
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 mb-8 font-mono"
            >
              Transform your career journey into an epic adventure. Level up your skills, unlock achievements, and reach your dream job!
            </motion.p>
            
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ x: 8 }}
                    className="flex items-center space-x-4 p-3 bg-gray-900 border-2 border-gray-700 hover:border-lime-500/50 transition-colors"
                  >
                    <div className="p-2 bg-lime-500 border-2 border-black">
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-gray-300 font-mono">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto bg-gray-900 border-4 border-lime-500/30 brutal-shadow p-6 sm:p-8"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-lime-500 border-2 border-black brutal-shadow flex items-center justify-center">
              <Skull className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white font-mono">
                DEV<span className="text-lime-400">QUEST</span>
              </h1>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white mb-2 font-mono">
              {isSignUp ? 'JOIN_THE_QUEST' : 'WELCOME_BACK'}
            </h2>
            <p className="text-gray-500 font-mono text-sm">
              {isSignUp ? '// Start your career adventure' : '// Continue your journey'}
            </p>
          </div>

          {/* Configuration Warning */}
          {showConfigWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-orange-500/10 border-2 border-orange-500/50 flex items-start space-x-2 mb-6"
            >
              <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-orange-400 font-bold font-mono mb-1">DEMO_MODE</p>
                <p className="text-gray-400 font-mono text-xs">
                  Configure Supabase in .env for full features
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-lime-400 mb-2 font-mono uppercase">
                <Terminal className="inline w-3 h-3 mr-1" /> Email_Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-lime-500 text-white font-mono placeholder-gray-500 transition-colors outline-none"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-lime-400 mb-2 font-mono uppercase">
                <Terminal className="inline w-3 h-3 mr-1" /> Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError('');
                  }}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border-2 border-gray-700 focus:border-lime-500 text-white font-mono placeholder-gray-500 transition-colors outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-lime-400 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-lime-400 mb-2 font-mono uppercase">
                  <Terminal className="inline w-3 h-3 mr-1" /> Confirm_Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-lime-500 text-white font-mono placeholder-gray-500 transition-colors outline-none"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border-2 border-red-500/50 flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-lime-500/10 border-2 border-lime-500/50 flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5 text-lime-400 flex-shrink-0" />
                <p className="text-lime-400 text-sm font-mono">{successMessage}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lime-500 border-2 border-black brutal-shadow text-black font-black font-mono hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>LOADING...</span>
                </div>
              ) : (
                isSignUp ? 'START_QUEST' : 'CONTINUE_QUEST'
              )}
            </motion.button>
          </form>

          {/* Forgot Password */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={handleForgotPassword}
                disabled={loading || !isConfigured}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-mono transition-colors disabled:opacity-50"
              >
                forgot_password()?
              </button>
            </div>
          )}

          {/* Toggle Sign Up/In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setLocalError('');
                setSuccessMessage('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              disabled={loading}
              className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors disabled:opacity-50 text-sm"
            >
              {isSignUp
                ? '// Already registered? Sign in'
                : "// No account? Join the quest"}
            </button>
          </div>

          {/* Demo Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-500 font-mono text-xs">OR_TRY_DEMO</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-4 w-full py-3 bg-gray-800 border-2 border-gray-600 hover:border-fuchsia-500 text-fuchsia-400 hover:text-fuchsia-300 font-black font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'LOADING...' : 'DEMO_MODE'}
            </motion.button>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-gray-800 border-2 border-gray-700">
            <p className="text-xs text-gray-500 text-center mb-2 font-mono uppercase">
              {isConfigured ? '// demo_credentials' : '// demo_mode'}
            </p>
            <div className="text-xs text-gray-400 space-y-1 text-center font-mono">
              {isConfigured ? (
                <>
                  <div>email: demo@careerquest.com</div>
                  <div>pass: demo123</div>
                </>
              ) : (
                <div>Click DEMO_MODE to explore</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}