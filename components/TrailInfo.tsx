import { Mountain, MapPin, Clock, TrendingUp, Users, Star } from 'lucide-react';

interface TrailInfoProps {
  trail: {
    name?: string;
    difficulty: string;
    distance?: number;
    duration?: number;
    elevationGain?: number;
    type?: string;
  };
  location: {
    name: string;
    elevation?: number;
  };
  rating?: number;
  reviews?: number;
}

export default function TrailInfo({ trail, location, rating, reviews }: TrailInfoProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{trail.name}</h2>
          <p className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {location.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 font-medium">{rating}</span>
              {reviews && <span className="text-gray-500 text-sm ml-1">({reviews})</span>}
            </div>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trail.difficulty)}`}>
            {trail.difficulty}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Mountain className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-lg font-semibold">{trail.distance || 'N/A'}</div>
          <div className="text-xs text-gray-500">miles</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-lg font-semibold">{formatDuration(trail.duration)}</div>
          <div className="text-xs text-gray-500">duration</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-lg font-semibold">{trail.elevationGain || 'N/A'}</div>
          <div className="text-xs text-gray-500">ft gain</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-lg font-semibold">{trail.type || 'N/A'}</div>
          <div className="text-xs text-gray-500">trail type</div>
        </div>
      </div>

      {location.elevation && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Trailhead elevation: {location.elevation} feet</span>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Trail Features</h3>
        <div className="flex flex-wrap gap-2">
          {trail.type && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {trail.type} trail
            </span>
          )}
          {trail.difficulty && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {trail.difficulty} difficulty
            </span>
          )}
          {trail.elevationGain && trail.elevationGain > 1000 && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Significant elevation gain
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 