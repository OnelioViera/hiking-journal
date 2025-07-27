'use client';

import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Activity, BarChart3, FileText, Heart, Zap } from 'lucide-react';

interface ApiResponse {
  status: string;
  data?: any;
  error?: string;
}

export default function ApiTestPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [healthStatus, setHealthStatus] = useState<ApiResponse | null>(null);
  const [activities, setActivities] = useState<ApiResponse | null>(null);
  const [summary, setSummary] = useState<ApiResponse | null>(null);
  const [docs, setDocs] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, setState: (response: ApiResponse) => void) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setState({ status: 'success', data });
      } else {
        setState({ status: 'error', error: data.error || 'Request failed' });
      }
    } catch (error) {
      setState({ status: 'error', error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    
    // Test health endpoint
    await testEndpoint('/api/health', setHealthStatus);
    
    // Test activities endpoint
    await testEndpoint('/api/activities?limit=5', setActivities);
    
    // Test summary endpoint
    await testEndpoint('/api/activities/summary?period=month', setSummary);
    
    // Test docs endpoint
    await testEndpoint('/api/activities/docs', setDocs);
  };

  useEffect(() => {
    if (isSignedIn) {
      runAllTests();
    }
  }, [isSignedIn]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">API Test Page</h1>
          <p className="text-gray-600 mb-4">Please sign in to test the API endpoints.</p>
        </div>
      </div>
    );
  }

  const renderResponse = (response: ApiResponse | null, title: string, icon: React.ReactNode) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      {response ? (
        <div className="space-y-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            response.status === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {response.status === 'success' ? 'Success' : 'Error'}
          </div>
          
          {response.error && (
            <div className="text-red-600 text-sm">{response.error}</div>
          )}
          
          {response.data && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                View Response Data
              </summary>
              <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">No response yet</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">API Test Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Test the hiking journal API endpoints and verify they're working correctly.
          </p>
          
          <button
            onClick={runAllTests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Testing...' : 'Run All Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderResponse(healthStatus, 'Health Check', <Heart className="w-5 h-5" />)}
          {renderResponse(activities, 'Activities Endpoint', <Activity className="w-5 h-5" />)}
          {renderResponse(summary, 'Summary Endpoint', <BarChart3 className="w-5 h-5" />)}
          {renderResponse(docs, 'API Documentation', <FileText className="w-5 h-5" />)}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">API Endpoints Available</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Core Endpoints</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /api/activities - List hiking activities</li>
                <li>• GET /api/activities/{'{id}'} - Get specific activity</li>
                <li>• POST /api/activities - Create new activity</li>
                <li>• PUT /api/activities/{'{id}'} - Update activity</li>
                <li>• DELETE /api/activities/{'{id}'} - Delete activity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Utility Endpoints</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /api/activities/summary - Get statistics</li>
                <li>• GET /api/activities/docs - API documentation</li>
                <li>• GET /api/health - Health check</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Integration Ready</h3>
          <p className="text-blue-800 mb-4">
            Your hiking journal app now has a complete API that other applications can use to access hiking data. 
            The API provides:
          </p>
          <ul className="space-y-2 text-blue-800">
            <li>• ✅ Real-time activity data from completed journal entries</li>
            <li>• ✅ Comprehensive statistics and trends</li>
            <li>• ✅ Proper authentication and authorization</li>
            <li>• ✅ RESTful API design with standard HTTP methods</li>
            <li>• ✅ Detailed documentation and health checks</li>
            <li>• ✅ Pagination and filtering support</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 