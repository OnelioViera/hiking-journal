'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EntryForm from '@/components/forms/EntryForm';
import { use } from 'react';

interface Entry {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    elevation?: number;
  };
  trail: {
    name?: string;
    difficulty: string;
    distance?: number;
    duration?: number;
    elevationGain?: number;
  };
  weather: {
    temperature?: number;
    conditions?: string;
    windSpeed?: number;
    humidity?: number;
  };
  tags: string[];
  rating: number;
  privacy: string;
  photos: any[];
}

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap the params promise
  const { id } = use(params);

  useEffect(() => {
    if (isSignedIn) {
      fetchEntry();
    }
  }, [isSignedIn, id]);

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/entries/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data);
      } else if (response.status === 404) {
        setError('Entry not found');
      } else {
        setError('Failed to load entry');
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      setError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to edit entries</h2>
        <p className="text-gray-600 mb-6">Create an account to edit your hiking journal entries.</p>
        <Link
          href="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/entries"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading entry...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/entries"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/entries"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/entries"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Entry not found</h2>
          <p className="text-gray-600 mb-6">The entry you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/entries"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link
          href="/entries"
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Entry</h1>
        <p className="text-gray-600">
          Update your hiking journal entry
        </p>
      </div>

      <EntryForm entry={entry} />
    </div>
  );
} 