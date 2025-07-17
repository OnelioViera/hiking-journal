'use client';

import { AlertTriangle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setup Required</h3>
          <p className="text-yellow-700 mb-4">
            To use all features of the hiking journal, you need to configure the environment variables.
          </p>
          
          <details className="mb-4">
            <summary className="cursor-pointer text-yellow-800 hover:text-yellow-900" style={{ fontWeight: 500 }}>
              Click to see setup instructions
            </summary>
            <div className="mt-4 space-y-4">
              
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900 mb-2">1. Clerk Authentication Setup</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                  <li>Go to <a href="https://clerk.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline">
                    Clerk Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                  </a></li>
                  <li>Create a new application or select existing one</li>
                  <li>Go to API Keys in your dashboard</li>
                  <li>Copy your Publishable Key and Secret Key</li>
                  <li>Add them to your environment variables</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900 mb-2">2. MongoDB Atlas Setup</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                  <li>Go to <a href="https://www.mongodb.com/atlas" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline">
                    MongoDB Atlas <ExternalLink className="h-3 w-3 ml-1" />
                  </a></li>
                  <li>Create a free cluster</li>
                  <li>Create a database user</li>
                  <li>Get your connection string</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-gray-900 mb-2">3. Environment Variables</h4>
                <p className="text-gray-600 text-sm mb-2">Update your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</p>
                <div className="relative">
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key

# MongoDB (for data storage)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hiking-journal

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token`}
                  </pre>
                  <button 
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700" 
                    title="Copy to clipboard"
                    onClick={() => copyToClipboard(`# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key

# MongoDB (for data storage)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hiking-journal

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token`)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border">
                <h4 className="font-semibold text-blue-900 mb-2">4. Restart the Development Server</h4>
                <p className="text-blue-700 text-sm">After updating the environment variables, restart your development server:</p>
                <code className="bg-blue-100 px-2 py-1 rounded text-xs block mt-2">npm run dev</code>
              </div>
            </div>
          </details>
          
          <div className="flex items-center text-sm text-yellow-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>You can still explore the app interface without authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
} 