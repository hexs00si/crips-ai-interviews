import { useEffect } from 'react';
import { AppRouter } from '@/components/AppRouter';
import useAuth from '@/features/auth/hooks/useAuth';
import { testConnection } from '@/lib/supabase';

function App() {
  const { initialize } = useAuth();

  useEffect(() => {
    // Initialize authentication state
    initialize();

    // Test Supabase connection on app start
    const checkConnection = async () => {
      const result = await testConnection();
      if (result.success) {
        console.log('✅ Supabase connection verified');
      } else {
        console.error('❌ Supabase connection failed:', result.error);
      }
    };

    checkConnection();
  }, [initialize]);

  return <AppRouter />;
}

export default App
