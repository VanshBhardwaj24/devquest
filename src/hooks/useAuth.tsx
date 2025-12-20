import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Demo user object for demo mode
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@careerquest.com',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('⚠️  Supabase not configured - running in demo mode');
      setLoading(false);
      // Don't set error in demo mode - let user use demo login
      return;
    }

    // Get initial session with proper error handling
    const getSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Log error safely (stringify to avoid React conversion issues)
          console.error('Error getting session:', error?.message || JSON.stringify(error));
          setError(`Authentication error: ${error.message}`);
        } else if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error in getSession:', (error as any)?.message || JSON.stringify(error));
        if (mounted) {
          setError('Failed to connect to authentication service');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        if (mounted) {
          setUser(session?.user ?? null);
          setError(null);
          
          // Only set loading to false after initial load
          if (event !== 'INITIAL_SESSION') {
            setLoading(false);
          }
        }
      } catch (error) {
        // Log error safely (stringify to avoid React conversion issues)
        console.error('Error in auth state change:', (error as any)?.message || JSON.stringify(error));
        if (mounted) {
          setError('Authentication state error');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Demo mode: Supabase not configured. Please add your credentials to .env file.' } 
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        setError(`Sign up failed: ${error.message}`);
        return { data: null, error };
      }

      console.log('Sign up successful:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Sign up exception:', (error as any)?.message || JSON.stringify(error));
      const errorMessage = (error as any).message || 'An unexpected error occurred during sign up';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return { 
        data: null, 
        error: { message: 'Demo mode: Supabase not configured. Please add your credentials to .env file.' } 
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setError(`Sign in failed: ${error.message}`);
        return { data: null, error };
      }

      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Sign in exception:', (error as any)?.message || JSON.stringify(error));
      const errorMessage = (error as any).message || 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setUser(null);
      return { error: null };
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
        return { error };
      }

      console.log('Sign out successful');
      setUser(null);
      return { error: null };
    } catch (error) {
      // Log error safely (stringify to avoid React conversion issues)
      console.error('Sign out exception:', (error as any)?.message || JSON.stringify(error));
      const errorMessage = (error as any).message || 'An unexpected error occurred during sign out';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Demo mode: Password reset not available without Supabase configuration.' } };
    }

    try {
      setLoading(true);
      setError(null);

      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      
      if (error) {
        console.error('Reset password error:', error);
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password exception:', error);
      const errorMessage = (error as any).message || 'An unexpected error occurred';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  // Demo login function for demo mode
  const demoLogin = () => {
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setError(null);
    setLoading(false);
    return { data: { user: DEMO_USER }, error: null };
  };

  // Demo logout function
  const demoLogout = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      setError(null);
    }
  };

  return {
    user,
    loading,
    error,
    isDemoMode,
    signUp,
    signIn,
    signOut: isDemoMode ? demoLogout : signOut,
    resetPassword,
    demoLogin,
  };
}