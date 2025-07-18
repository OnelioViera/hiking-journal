'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Star, 
  Mountain, 
  Cloud, 
  Tag, 
  Camera, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoGallery from '@/components/PhotoGallery';

interface Entry {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    elevation?: number;
  };
  trail: {
    name?: string;
    difficulty: string;
    distance?: number;
    duration?: number;
    elevationGain?: number;
    type?: string;
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
  photos: {
    url: string;
    publicId: string;
    caption?: string;
    timestamp: Date;
  }[];
}

export default function EntryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isSignedIn, isLoaded } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const fetchEntry = useCallback(async () => {
    try {
      const response = await fetch(`/api/entries/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data);
      } else {
        setEntry(null);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isSignedIn && id) {
      fetchEntry();
    }
  }, [isSignedIn, id, fetchEntry]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!entry) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/entries/${entry._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Entry deleted successfully!', {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        window.location.href = '/entries';
      } else {
        toast.error('Failed to delete entry', {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view entries</h2>
        <p className="text-gray-600 mb-6">Create an account to view your hiking journal.</p>
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Entry not found</h2>
        <p className="text-gray-600 mb-6">The entry you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Link
          href="/entries"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/entries"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Journal
            </Link>
            
            <div className="flex space-x-3">
              <Link
                href={`/entries/${entry._id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{entry.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                <MapPin className="h-4 w-4 ml-4 mr-2" />
                {entry.location.name}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < entry.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">({entry.rating}/5)</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed" style={{ fontWeight: 500 }}>
                {entry.description}
              </p>
            </div>

            {/* Trail Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mountain className="h-5 w-5 mr-2 text-green-600" />
                Trail Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.trail.name && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trail Name</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.trail.name}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    entry.trail.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    entry.trail.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    entry.trail.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {entry.trail.difficulty}
                  </span>
                </div>
                
                {entry.trail.distance && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Distance</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.trail.distance} miles</p>
                  </div>
                )}
                
                {entry.trail.duration && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{formatDuration(entry.trail.duration)}</p>
                  </div>
                )}
                
                {entry.trail.elevationGain && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Elevation Gain</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.trail.elevationGain} feet</p>
                  </div>
                )}
                
                {entry.trail.type && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trail Type</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.trail.type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Information */}
            {(entry.weather.temperature || entry.weather.conditions || entry.weather.windSpeed || entry.weather.humidity) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-green-600" />
                  Weather Conditions
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.weather.temperature && (
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Temperature</label>
                        <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.weather.temperature}°F</p>
                      </div>
                    </div>
                  )}
                  
                  {entry.weather.conditions && (
                    <div className="flex items-center">
                      <Cloud className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Conditions</label>
                        <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.weather.conditions}</p>
                      </div>
                    </div>
                  )}
                  
                  {entry.weather.windSpeed && (
                    <div className="flex items-center">
                      <Wind className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Wind Speed</label>
                        <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.weather.windSpeed} mph</p>
                      </div>
                    </div>
                  )}
                  
                  {entry.weather.humidity && (
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Humidity</label>
                        <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.weather.humidity}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-green-600" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {entry.photos && entry.photos.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-green-600" />
                  Photos ({entry.photos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entry.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="group cursor-pointer"
                      onClick={() => {
                        setSelectedPhotoIndex(index);
                        setGalleryOpen(true);
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden border hover:scale-105 transition-transform duration-200">
                        <Image
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={400}
                          height={400}
                          unoptimized
                        />
                      </div>
                      {photo.caption && (
                        <p className="mt-2 text-sm text-gray-600 text-center" style={{ fontWeight: 500 }}>
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Location & Stats */}
          <div className="space-y-6">
            {/* Location Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Location Details
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.location.name}</p>
                </div>
                
                {entry.location.elevation && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Elevation</label>
                    <p className="text-gray-900" style={{ fontWeight: 500 }}>{entry.location.elevation} feet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              
              <div className="space-y-3">
                {entry.trail.distance && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-semibold text-gray-900">{entry.trail.distance} mi</span>
                  </div>
                )}
                
                {entry.trail.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">{formatDuration(entry.trail.duration)}</span>
                  </div>
                )}
                
                {entry.trail.elevationGain && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Elevation Gain</span>
                    <span className="font-semibold text-gray-900">{entry.trail.elevationGain} ft</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold text-gray-900">{entry.rating}/5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Privacy</span>
                  <span className="font-semibold text-gray-900 capitalize">{entry.privacy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Entry
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{entry.title}&quot;</span>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {entry && (
        <PhotoGallery
          photos={entry.photos}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </>
  );
} 