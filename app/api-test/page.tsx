'use client';

import { useState } from 'react';

interface TestResult {
  status: number | string;
  data?: unknown;
  error?: string;
  timestamp: string;
}

interface ApiResults {
  [endpoint: string]: TestResult;
}

export default function ApiTestPage() {
  const [results, setResults] = useState<ApiResults>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [testToken, setTestToken] = useState<string>('aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0');

  const testEndpoint = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(endpoint);
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testActivitiesWithToken = () => {
    testEndpoint('/api/activities', {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
  };

  const testTokenGeneration = () => {
    testEndpoint('/api/tokens', {
      method: 'POST'
    });
  };

  const testActivitiesWithoutAuth = () => {
    testEndpoint('/api/activities');
  };

  const testHealth = () => {
    testEndpoint('/api/health');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Token Testing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Token:
              </label>
              <input
                type="text"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter test token"
              />
            </div>
            
            <button
              onClick={testActivitiesWithToken}
              disabled={loading === '/api/activities'}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading === '/api/activities' ? 'Testing...' : 'Test Activities with Token'}
            </button>
            
            <button
              onClick={testTokenGeneration}
              disabled={loading === '/api/tokens'}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading === '/api/tokens' ? 'Generating...' : 'Generate New Token'}
            </button>
            
            <button
              onClick={testActivitiesWithoutAuth}
              disabled={loading === '/api/activities'}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {loading === '/api/activities' ? 'Testing...' : 'Test Activities (No Auth)'}
            </button>
            
            <button
              onClick={testHealth}
              disabled={loading === '/api/health'}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400"
            >
              {loading === '/api/health' ? 'Testing...' : 'Test Health Endpoint'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">Available Endpoints:</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>GET /api/activities</strong> - Fetch hiking activities</li>
                <li><strong>POST /api/tokens</strong> - Generate API token</li>
                <li><strong>GET /api/health</strong> - Health check</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Authentication:</h3>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Clerk authentication for web app</li>
                <li>API token authentication for external apps</li>
                <li>Test token: <code className="bg-gray-100 px-1 rounded">test_hiking_journal_token_2024</code></li>
                <li>Generated token: <code className="bg-gray-100 px-1 rounded">aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0</code></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Usage:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`// With API token
fetch('/api/activities', {
  headers: {
    'Authorization': 'Bearer your_token_here'
  }
})

// Generate token
fetch('/api/tokens', {
  method: 'POST'
})`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {Object.keys(results).length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click the buttons above to test the API endpoints.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]: [string, TestResult]) => (
              <div key={endpoint} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{endpoint}</h3>
                <div className="text-sm">
                  <p><strong>Status:</strong> {result.status}</p>
                  <p><strong>Timestamp:</strong> {result.timestamp}</p>
                  {result.error ? (
                    <p><strong>Error:</strong> <span className="text-red-600">{result.error}</span></p>
                  ) : (
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 