'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedToken(data.token);
      } else {
        console.error('Failed to generate token');
      }
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Integration</h2>
        <p className="text-gray-600 mb-4">
          Generate an API token to allow external applications to access your hiking data.
        </p>
        
        <button 
          onClick={generateToken} 
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded mb-4 transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate API Token'}
        </button>
        
        {generatedToken && (
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm font-semibold mb-2">Your API Token:</p>
            <code className="bg-white p-2 rounded text-sm break-all block">
              {generatedToken}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Copy this token and use it in your external application.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Test Token</h3>
            <p className="text-sm text-gray-600 mb-2">
              For immediate testing, use this test token:
            </p>
            <code className="bg-gray-100 p-2 rounded text-sm block">
              test_hiking_journal_token_2024
            </code>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Generated Token</h3>
            <p className="text-sm text-gray-600 mb-2">
              Your recently generated token:
            </p>
            <code className="bg-gray-100 p-2 rounded text-sm block">
              aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0
            </code>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">API Endpoints</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>GET /api/activities</strong> - Fetch hiking activities
              </div>
              <div>
                <strong>POST /api/tokens</strong> - Generate new API token
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Usage Example</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`fetch('/api/activities', {
  headers: {
    'Authorization': 'Bearer your_token_here'
  }
})`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 