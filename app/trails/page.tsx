'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import TrailInfo from '@/components/TrailInfo';
import TrailRecommendations from '@/components/TrailRecommendations';
import { Mountain, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface Trail {
  id: string;
  name: string;
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
    distance: number;
    duration: number;
    elevationGain: number;
    type?: string;
  };
  description: string;
  tags: string[];
  rating?: number;
  reviews?: number;
}

export default function TrailsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchTrails();
    }
  }, [isSignedIn]);

  const fetchTrails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trails');
      if (response.ok) {
        const data = await response.json();
        setTrails(data.trails || []);
      }
    } catch (error) {
      console.error('Error fetching trails:', error);
      toast.error('Failed to fetch trails');
    } finally {
      setLoading(false);
    }
  };

  const searchTrails = async (query: string) => {
    if (!query.trim()) {
      await fetchTrails();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/trails?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setTrails(data.trails || []);
      }
    } catch (error) {
      console.error('Error searching trails:', error);
      toast.error('Failed to search trails');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTrails(searchQuery);
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Mountain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trail Explorer</h1>
          <p className="text-gray-600">Sign in to explore trails and get recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trail Explorer</h1>
        <p className="text-gray-600">Discover and explore hiking trails with detailed information.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trails by name, location, or difficulty..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Trail List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Trails</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trails.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trails found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trails.map((trail) => (
                <div
                  key={trail.id}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTrail(trail)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{trail.name}</h3>
                      <p className="text-gray-600 mb-3">{trail.location.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mountain className="h-4 w-4 mr-1" />
                          {trail.trail.distance} mi
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {trail.trail.elevationGain} ft gain
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trail.trail.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          trail.trail.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          trail.trail.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trail.trail.difficulty}
                        </span>
                      </div>
                    </div>
                    {trail.rating && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium">{trail.rating}</span>
                        <span className="text-gray-500 ml-1">★</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trail Details Sidebar */}
        <div className="space-y-6">
          {selectedTrail && (
            <>
              <TrailInfo
                trail={selectedTrail.trail}
                location={selectedTrail.location}
                rating={selectedTrail.rating}
                reviews={selectedTrail.reviews}
              />
              
              <TrailRecommendations
                currentTrail={selectedTrail}
                location={selectedTrail.location.name}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 