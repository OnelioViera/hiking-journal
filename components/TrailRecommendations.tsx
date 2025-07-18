import { useState, useEffect } from 'react';
import { Mountain, MapPin, Star, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface TrailRecommendation {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  distance: number;
  duration: number;
  elevationGain: number;
  rating: number;
  reviews: number;
  image?: string;
}

interface TrailRecommendationsProps {
  currentTrail?: any;
  location?: string;
}

export default function TrailRecommendations({ currentTrail, location }: TrailRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TrailRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [location]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trails?location=${encodeURIComponent(location || 'Colorado')}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current trail and limit to 3 recommendations
        const filtered = data.trails
          .filter((trail: any) => trail.id !== currentTrail?.id)
          .slice(0, 3);
        setRecommendations(filtered);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Similar Trails</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Similar Trails</h3>
      <div className="space-y-4">
        {recommendations.map((trail) => (
          <div key={trail.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{trail.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{trail.location}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Mountain className="h-4 w-4 mr-1" />
                    {trail.distance} mi
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(trail.duration / 60)}h {trail.duration % 60}m
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {trail.elevationGain} ft
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium">{trail.rating}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trail.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  trail.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  trail.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {trail.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 