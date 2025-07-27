'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Copy, Check, AlertCircle, TestTube } from 'lucide-react';

interface TestResult {
  status: number | string;
  data: Record<string, unknown>;
}

export default function AuthHelperPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  const generateToken = async () => {
    try {
      const sessionToken = await getToken();
      setToken(sessionToken || 'No token available');
    } catch {
      setToken('Error getting token');
    }
  };

  const copyToken = async () => {
    if (token && token !== 'No token available' && token !== 'Error getting token') {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testAuth = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/auth-test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      setTestResult({
        status: response.status,
        data: result
      });
    } catch {
      setTestResult({
        status: 'error',
        data: { error: 'Network error' }
      });
    } finally {
      setTesting(false);
    }
  };

  const testActivities = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/activities?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      setTestResult({
        status: response.status,
        data: result
      });
    } catch {
      setTestResult({
        status: 'error',
        data: { error: 'Network error' }
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Helper</h1>
          <p className="text-gray-600 mb-4">Please sign in to test API authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔐 API Authentication Helper</h1>
          <p className="text-gray-600 mb-6">
            Test your authentication tokens and API endpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              User Information
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <p className="text-sm text-gray-600 font-mono">{user?.id}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-sm text-gray-600">{user?.fullName}</p>
              </div>
            </div>
          </div>

          {/* Token Management */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Authentication Token</h2>
            
            <div className="space-y-4">
              <button
                onClick={generateToken}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Session Token
              </button>
              
              {token && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Token:</span>
                    <button
                      onClick={copyToken}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {token}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Testing */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 API Testing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testAuth}
              disabled={!token || testing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Test Auth Endpoint'}
            </button>
            
            <button
              onClick={testActivities}
              disabled={!token || testing}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Test Activities API'}
            </button>
          </div>

          {testResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {testResult.status === 200 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  Status: {testResult.status}
                </span>
              </div>
              
              <details className="bg-gray-50 rounded p-4">
                <summary className="cursor-pointer font-medium text-gray-700">
                  View Response Data
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📖 How to Use</h3>
          
          <div className="space-y-4 text-blue-800">
            <div>
              <h4 className="font-medium">1. Generate Token</h4>
              <p className="text-sm">Click &quot;Generate Session Token&quot; to get your authentication token.</p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Copy Token</h4>
              <p className="text-sm">Copy the token and use it in your API requests.</p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Test API</h4>
              <p className="text-sm">Use the test buttons to verify your authentication works.</p>
            </div>
            
            <div>
              <h4 className="font-medium">4. Use in Your App</h4>
              <p className="text-sm">Include the token in your API requests:</p>
              <code className="block bg-blue-100 p-2 rounded text-xs mt-1">
                Authorization: Bearer YOUR_TOKEN_HERE
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 