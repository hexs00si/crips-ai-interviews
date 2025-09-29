import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { testConnection } from '@/lib/supabase';
import useAuth from '@/features/auth/hooks/useAuth';

export function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const runConnectionTest = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testConnection();
      setConnectionStatus(result);
    } catch (err) {
      setConnectionStatus({
        success: false,
        error: err.message || 'Failed to test connection'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm z-50">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">System Status</h3>
          <button
            onClick={runConnectionTest}
            disabled={isTestingConnection}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Database Connection Status */}
        <div className="flex items-center space-x-2">
          {isTestingConnection ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : connectionStatus?.success ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            Database: {isTestingConnection ? 'Testing...' : connectionStatus?.success ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : isAuthenticated ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            Auth: {isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </span>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-xs text-gray-500 border-t pt-2">
            <div>User: {user.email}</div>
            <div>Role: {user.user_metadata?.role || 'Unknown'}</div>
          </div>
        )}

        {/* Error Info */}
        {connectionStatus && !connectionStatus.success && (
          <div className="text-xs text-red-600 border-t pt-2">
            Error: {connectionStatus.error}
          </div>
        )}
      </div>
    </div>
  );
}