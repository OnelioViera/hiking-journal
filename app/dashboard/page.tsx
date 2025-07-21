'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Mountain, Calendar, MapPin, TrendingUp, Camera, BarChart3, Target, Award } from 'lucide-react';
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
    type?: string;
    elevationGain?: number;
  };
  rating: number;
  tags: string[];
  photos: IPhoto[];
  status: 'draft' | 'completed';
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalHikes: number;
    thisMonth: number;
    totalDistance: number;
    totalPhotos: number;
    // Advanced analytics
    totalElevation: number;
    averageDistance: number;
    averageRating: number;
    favoriteDifficulty: string;
    favoriteTrailType: string;
    longestHike: number;
    highestElevation: number;
    hikingStreak: number;
    monthlyTrends: { month: string; hikes: number }[];
    difficultyBreakdown: { difficulty: string; count: number }[];
    trailTypeBreakdown: { type: string; count: number }[];
  }>({
    totalHikes: 0,
    thisMonth: 0,
    totalDistance: 0,
    totalPhotos: 0,
    totalElevation: 0,
    averageDistance: 0,
    averageRating: 0,
    favoriteDifficulty: '',
    favoriteTrailType: '',
    longestHike: 0,
    highestElevation: 0,
    hikingStreak: 0,
    monthlyTrends: [],
    difficultyBreakdown: [],
    trailTypeBreakdown: []
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
    
    // Filter for completed entries only
    const completedEntries = entries.filter(entry => entry.status === 'completed');
    
    const totalHikes = completedEntries.length;
    const thisMonthHikes = completedEntries.filter(entry => 
      new Date(entry.date) >= thisMonth
    ).length;
    
    const totalDistance = completedEntries.reduce((sum, entry) => 
      sum + (entry.trail.distance || 0), 0
    );
    
    const totalPhotos = completedEntries.reduce((sum, entry) => 
      sum + (entry.photos?.length || 0), 0
    );

    // Advanced analytics calculations
    const totalElevation = completedEntries.reduce((sum, entry) => 
      sum + (entry.trail.elevationGain || 0), 0
    );
    
    const averageDistance = totalHikes > 0 ? totalDistance / totalHikes : 0;
    const averageRating = completedEntries.reduce((sum, entry) => sum + entry.rating, 0) / totalHikes || 0;
    
    // Difficulty analysis
    const difficultyCounts = completedEntries.reduce((acc, entry) => {
      const difficulty = entry.trail.difficulty;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteDifficulty = Object.entries(difficultyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    // Trail type analysis
    const trailTypeCounts = completedEntries.reduce((acc, entry) => {
      if (entry.trail.type) {
        acc[entry.trail.type] = (acc[entry.trail.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const favoriteTrailType = Object.entries(trailTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    // Longest hike and highest elevation
    const longestHike = Math.max(...completedEntries.map(entry => entry.trail.distance || 0));
    const highestElevation = Math.max(...completedEntries.map(entry => entry.trail.elevationGain || 0));
    
    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthHikes = completedEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= month && entryDate < nextMonth;
      }).length;
      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        hikes: monthHikes
      });
    }
    
    // Difficulty breakdown
    const difficultyBreakdown = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
      difficulty,
      count
    }));
    
    // Trail type breakdown
    const trailTypeBreakdown = Object.entries(trailTypeCounts).map(([type, count]) => ({
      type,
      count
    }));
    
    // Calculate hiking streak (simplified - consecutive months with hikes)
    let hikingStreak = 0;
    for (let i = 0; i < monthlyTrends.length; i++) {
      if (monthlyTrends[i].hikes > 0) {
        hikingStreak++;
      } else {
        break;
      }
    }

    setStats({
      totalHikes,
      thisMonth: thisMonthHikes,
      totalDistance,
      totalPhotos,
      totalElevation,
      averageDistance,
      averageRating,
      favoriteDifficulty,
      favoriteTrailType,
      longestHike,
      highestElevation,
      hikingStreak,
      monthlyTrends,
      difficultyBreakdown,
      trailTypeBreakdown
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

      {/* Advanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Advanced Statistics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.averageDistance.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Avg Distance (mi)</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Avg Rating</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Elevation</span>
                <span className="font-semibold">{stats.totalElevation.toLocaleString()} ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Longest Hike</span>
                <span className="font-semibold">{stats.longestHike} mi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Elevation</span>
                <span className="font-semibold">{stats.highestElevation.toLocaleString()} ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hiking Streak</span>
                <span className="font-semibold">{stats.hikingStreak} months</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Your Insights
          </h3>
          <div className="space-y-4">
            {stats.favoriteDifficulty && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Favorite Difficulty</span>
                </div>
                <span className="text-sm font-semibold capitalize">{stats.favoriteDifficulty}</span>
              </div>
            )}
            
            {stats.favoriteTrailType && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Preferred Trail Type</span>
                </div>
                <span className="text-sm font-semibold capitalize">{stats.favoriteTrailType.replace('-', ' ')}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Average</span>
                <span className="font-semibold">{(stats.totalHikes / 12).toFixed(1)} hikes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Photos per Hike</span>
                <span className="font-semibold">{(stats.totalPhotos / stats.totalHikes).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      {stats.monthlyTrends.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Monthly Hiking Trends
          </h3>
          <div className="flex items-end justify-between h-32">
            {stats.monthlyTrends.map((month, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t w-8 mb-2 transition-all duration-300 hover:bg-green-600"
                  style={{ 
                    height: `${Math.max(month.hikes * 8, 4)}px`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-gray-600">{month.month}</span>
                <span className="text-xs font-semibold text-gray-900">{month.hikes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/entries/new"
            className="flex items-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Mountain className="h-5 w-5 text-green-600 mr-3" />
            <span className="font-semibold">Create New Entry</span>
          </Link>
          <Link
            href="/entries"
            className="flex items-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
            <span className="font-semibold">View All Entries</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 