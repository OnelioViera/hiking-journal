'use client';

import Link from 'next/link';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-8">
          There was an issue with the authentication setup. This is likely because the environment variables haven't been configured yet.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Setup Required
        </h2>
        <p className="text-yellow-700 mb-4">
          To use the authentication features, you need to configure the following:
        </p>
        <ol className="list-decimal list-inside text-yellow-700 space-y-2">
          <li>Set up Google OAuth credentials</li>
          <li>Configure MongoDB Atlas connection</li>
          <li>Update the environment variables</li>
        </ol>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Google OAuth Setup</h3>
          <p className="text-gray-600 mb-4">
            Create OAuth 2.0 credentials in Google Cloud Console:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
              Google Cloud Console <ExternalLink className="h-4 w-4 ml-1" />
            </a></li>
            <li>Create a new project or select existing one</li>
            <li>Enable Google+ API</li>
            <li>Create OAuth 2.0 credentials</li>
            <li>Add authorized redirect URI: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3002/api/auth/callback/google</code></li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">2. MongoDB Atlas Setup</h3>
          <p className="text-gray-600 mb-4">
            Set up a MongoDB Atlas database:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
            <li>Go to <a href="https://www.mongodb.com/atlas" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
              MongoDB Atlas <ExternalLink className="h-4 w-4 ml-1" />
            </a></li>
            <li>Create a free cluster</li>
            <li>Create a database user</li>
            <li>Get your connection string</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Environment Variables</h3>
          <p className="text-gray-600 mb-4">
            Update your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file with your actual credentials:
          </p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hiking-journal

# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# Other settings...
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3002`}
          </pre>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 