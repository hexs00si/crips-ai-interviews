import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');

    // Test basic connection by checking the users table
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Supabase connection successful');
    console.log(`📊 Users table accessible (count: ${data || 0})`);

    return {
      success: true,
      message: 'Connected to Supabase successfully',
      userCount: data || 0
    };
  } catch (err) {
    console.error('❌ Connection test error:', err.message);
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
};

// Auth state helper functions
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getSession = () => {
  return supabase.auth.getSession();
};

// Enhanced error handler for auth operations
export const handleAuthError = (error) => {
  const errorMap = {
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'Email not confirmed': 'Please check your email and click the confirmation link.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    'Unable to validate email address: invalid format': 'Please enter a valid email address.',
    'Signup requires a valid password': 'Please enter a valid password.',
  };

  return errorMap[error.message] || error.message || 'An unexpected error occurred.';
};

// Database helper functions
export const dbQuery = async (table, operation, data = null) => {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'select':
        query = query.select(data?.select || '*');
        if (data?.filter) query = query.eq(data.filter.column, data.filter.value);
        if (data?.limit) query = query.limit(data.limit);
        break;
      case 'insert':
        query = query.insert(data);
        break;
      case 'update':
        query = query.update(data.updates).eq(data.filter.column, data.filter.value);
        break;
      case 'delete':
        query = query.delete().eq(data.filter.column, data.filter.value);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    const { data: result, error } = await query;

    if (error) {
      console.error(`Database ${operation} error:`, error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};