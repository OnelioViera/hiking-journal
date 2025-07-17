'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Mountain, Calendar, MapPin, TrendingUp, Camera } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { IPhoto } from '@/models/JournalEntry';

interface Entry {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
  };
  trail: {
    difficulty: string;
    distance?: number;
  };
  rating: number;
  tags: string[];
  photos: IPhoto[];
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalHikes: number;
    thisMonth: number;
    totalDistance: number;
    totalPhotos: number;
  }>({
    totalHikes: 0,
    thisMonth: 0,
    totalDistance: 0,
    totalPhotos: 0
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/entries?limit=100');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
        calculateStats(data.entries);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData();
    }
  }, [isSignedIn, fetchDashboardData]);

  const calculateStats = (entries: Entry[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalHikes = entries.length;
    const thisMonthHikes = entries.filter(entry => 
      new Date(entry.date) >= thisMonth
    ).length;
    
    const totalDistance = entries.reduce((sum, entry) => 
      sum + (entry.trail.distance || 0), 0
    );
    
    const totalPhotos = entries.reduce((sum, entry) => 
      sum + (entry.photos?.length || 0), 0
    );

    setStats({
      totalHikes,
      thisMonth: thisMonthHikes,
      totalDistance,
      totalPhotos
    });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your dashboard</h2>
        <p className="text-gray-600 mb-6">Create an account to see your hiking statistics and progress.</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}! Loading your hiking progress...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}! Here&apos;s your hiking progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Mountain className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-600 stats-label">Total Hikes</p>
              <p className="text-2xl font-bold text-gray-900 stats-number">{stats.totalHikes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-600 stats-label">This Month</p>
              <p className="text-2xl font-bold text-gray-900 stats-number">{stats.thisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-600 stats-label">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900 stats-number">{stats.totalDistance} mi</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-semibold text-gray-600 stats-label">Photos</p>
              <p className="text-2xl font-bold text-gray-900 stats-number">{stats.totalPhotos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2" style={{ fontWeight: 500 }}>No recent activity</h3>
              <p className="text-gray-600 mb-6">
                Start documenting your hiking adventures to see your activity here.
              </p>
              <Link
                href="/entries/new"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Mountain className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-600">{entry.location.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.trail.difficulty} • {entry.trail.distance || 0} mi
                    </p>
                  </div>
                </div>
              ))}
              {entries.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/entries"
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    View All Entries →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/entries/new"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Mountain className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-semibold">Create New Entry</span>
              </div>
            </Link>
            <Link
              href="/entries"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-semibold">View All Entries</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span>Interactive maps with trail plotting</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span>Weather API integration</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span>Advanced statistics and insights</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span>Export functionality (PDF, CSV)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 