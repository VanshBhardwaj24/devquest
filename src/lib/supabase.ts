import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project-ref.supabase.co' || 
    supabaseAnonKey === 'your-anon-key-here') {
  
  if (isProduction) {
    throw new Error('Missing or invalid Supabase environment variables in production');
  }
  
  console.warn('⚠️  Supabase environment variables not configured properly');
  console.warn('📝 Please update your .env file with your actual Supabase credentials:');
  console.warn('   1. Go to https://app.supabase.com');
  console.warn('   2. Select your project');
  console.warn('   3. Go to Settings > API');
  console.warn('   4. Copy the Project URL and anon/public key to your .env file');
  console.warn('');
  console.warn('Current values:');
  console.warn('VITE_SUPABASE_URL:', supabaseUrl || 'Missing');
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present but invalid' : 'Missing');
}

// Provide fallback values for development when credentials are missing
const fallbackUrl = 'https://demo.supabase.co';
const fallbackKey = 'demo-key';

// Use actual credentials if valid, otherwise use fallbacks for development
const clientUrl = (supabaseUrl && supabaseUrl !== 'https://your-project-ref.supabase.co') 
  ? supabaseUrl 
  : fallbackUrl;
  
const clientKey = (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here') 
  ? supabaseAnonKey 
  : fallbackKey;

// Create Supabase client
export const supabase = createClient<Database>(
  clientUrl,
  clientKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Test connection function
export const testSupabaseConnection = async () => {
  // Skip connection test if using fallback credentials
  if (clientUrl === fallbackUrl || clientKey === fallbackKey) {
    console.warn('⚠️  Skipping Supabase connection test - using fallback credentials');
    console.warn('📝 Configure your .env file with real Supabase credentials to enable backend features');
    return false;
  }
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.warn('💡 This might be because:');
      console.warn('   - Your Supabase project is paused or deleted');
      console.warn('   - Your API keys are incorrect');
      console.warn('   - Your internet connection is down');
      console.warn('   - The database tables haven\'t been created yet');
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
};

// Initialize connection test only in development
if (isDevelopment) {
  testSupabaseConnection();
}

// Export connection status for components to use
export const isSupabaseConfigured = () => {
  return clientUrl !== fallbackUrl && clientKey !== fallbackKey;
};