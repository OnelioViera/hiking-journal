'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Mountain, Cloud, Tag, Star, Upload, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { IPhoto } from '@/models/JournalEntry';
import Image from 'next/image';

interface EntryFormEntry {
  _id?: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    elevation?: string;
  };
  trail: {
    name?: string;
    difficulty: string;
    distance?: string | number;
    duration?: string | number;
    elevationGain?: string | number;
    type?: string;
  };
  weather: {
    temperature?: string | number;
    conditions?: string;
    windSpeed?: string | number;
    humidity?: string | number;
  };
  tags: string[];
  rating: number;
  privacy: string;
  status: 'draft' | 'completed';
  photos: IPhoto[];
}

interface EntryFormProps {
  entry?: EntryFormEntry;
}

export default function EntryForm({ entry }: EntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<IPhoto[]>(entry?.photos || []);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  // Convert existing duration to hours and minutes
  const convertDurationToHoursMinutes = (duration: string | number | undefined) => {
    if (!duration) return { hours: '', minutes: '' };
    const totalMinutes = parseInt(duration.toString());
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours: hours.toString(), minutes: minutes.toString() };
  };

  const initialDuration = convertDurationToHoursMinutes(entry?.trail?.duration);
  
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
    date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : '',
    location: {
      name: entry?.location?.name || '',
      elevation: entry?.location?.elevation || ''
    },
    trail: {
      name: entry?.trail?.name || '',
      difficulty: entry?.trail?.difficulty || 'easy',
      distance: entry?.trail?.distance || '',
      duration: entry?.trail?.duration || '',
      elevationGain: entry?.trail?.elevationGain || '',
      type: entry?.trail?.type || ''
    },
    weather: {
      temperature: entry?.weather?.temperature || '',
      conditions: entry?.weather?.conditions || '',
      windSpeed: entry?.weather?.windSpeed || '',
      humidity: entry?.weather?.humidity || ''
    },
    tags: entry?.tags?.join(', ') || '',
    rating: entry?.rating || 3,
    privacy: entry?.privacy || 'private',
    status: entry?.status || 'draft'
  });

  // Add state for hours and minutes
  const [durationHours, setDurationHours] = useState(initialDuration.hours);
  const [durationMinutes, setDurationMinutes] = useState(initialDuration.minutes);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('EntryForm mounted with entry:', entry);
    console.log('Form data initialized:', formData);
  }, [entry, formData]);

  // Convert HEIC URLs to JPEG for better browser compatibility
  const convertHeicToJpeg = (url: string): string => {
    if (url.includes('.heic')) {
      return url.replace('.heic', '.jpg');
    }
    return url;
  };

  const handleFileUpload = async (files: FileList) => {
    setUploadingPhotos(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name, file.type, file.size);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }

        const result = await response.json();
        console.log('Upload result:', result);
        
        return {
          url: result.url,
          publicId: result.publicId,
          caption: '',
          timestamp: new Date()
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}`, {
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
        return null;
      }
    });

    const uploadedPhotos = await Promise.all(uploadPromises);
    const validPhotos = uploadedPhotos.filter(photo => photo !== null) as IPhoto[];
    
    console.log('Valid photos after upload:', validPhotos);
    
    setPhotos(prev => [...prev, ...validPhotos]);
    setUploadingPhotos(false);

    if (validPhotos.length > 0) {
      toast.success(`Successfully uploaded ${validPhotos.length} photo${validPhotos.length > 1 ? 's' : ''}`, {
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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, caption } : photo
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert hours and minutes to total minutes
    const hours = parseInt(durationHours) || 0;
    const minutes = parseInt(durationMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    // Show loading toast
    const toastId = toast.loading(
      entry ? 'Updating your entry...' : 'Creating your entry...',
      {
        style: {
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      }
    );
    
    const submitData = {
      ...formData,
      trail: {
        ...formData.trail,
        duration: totalMinutes
      },
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      location: {
        ...formData.location
      },
      photos
    };

    try {
      const url = entry ? `/api/entries/${entry._id}` : '/api/entries';
      const method = entry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        // Dismiss loading toast
        toast.dismiss(toastId);
        
        // Show success toast
        toast.success(
          entry ? 'Entry updated successfully!' : 'Entry created successfully!',
          {
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        
        router.push('/entries');
      } else {
        const error = await response.json();
        toast.dismiss(toastId);
        toast.error(`Error: ${error.message || 'Failed to save entry'}`, {
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
      console.error('Error saving entry:', error);
      toast.dismiss(toastId);
      toast.error('Failed to save entry. Please try again.', {
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
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mountain className="h-5 w-5 mr-2 text-green-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              required
              placeholder="e.g., Mount Rainier Summit Hike"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent h-32"
            style={{ fontWeight: 500 }}
            required
            placeholder="Describe your hiking experience, what you saw, how you felt..."
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-green-600" />
          Photos
        </h3>
        
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop photos here, or click to select
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports JPEG, PNG, WebP (max 5MB each)
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer"
          >
            {uploadingPhotos ? 'Uploading...' : 'Select Photos'}
          </label>
        </div>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Uploaded Photos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => {
                console.log('Rendering photo:', photo);
                return (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={convertHeicToJpeg(photo.url)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={400}
                        height={400}
                        unoptimized
                        onError={(e) => {
                          console.error('Image failed to load:', photo.url, e);
                          // Try to load the original URL as fallback
                          const target = e.target as HTMLImageElement;
                          if (target.src !== photo.url) {
                            target.src = photo.url;
                          } else {
                            // If both fail, show a placeholder
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE3NSA5MCAxMDAgMTI1IDEwMCAxNTBDMTAwIDE3NSAxMjUgMjAwIDE1MCAyMDBDMTc1IDIwMCAyMDAgMTc1IDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMjUwQzEwMCAyNzUgMTI1IDMwMCAxNTAgMzAwQzE3NSAzMDAgMjAwIDI3NSAyMDAgMjUwQzIwMCAyMjUgMTc1IDIwMCAxNTAgMjAwQzEyNSAyMDAgMTAwIDIyNSAxMDAgMjUwWiIgZmlsbD0iIzlCOUJBQCIvPgo8L3N2Zz4K';
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', photo.url);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={photo.caption || ''}
                      onChange={(e) => updatePhotoCaption(index, e.target.value)}
                      placeholder="Add caption..."
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-green-600" />
          Location Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location Name *
            </label>
            <input
              type="text"
              value={formData.location.name}
              onChange={(e) => setFormData({
                ...formData,
                location: {...formData.location, name: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              required
              placeholder="e.g., Mount Rainier National Park"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Elevation (feet)
            </label>
            <input
              type="number"
              value={formData.location.elevation}
              onChange={(e) => setFormData({
                ...formData,
                location: {...formData.location, elevation: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 14410"
            />
          </div>
        </div>
      </div>

      {/* Trail Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mountain className="h-5 w-5 mr-2 text-green-600" />
          Trail Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trail Name
            </label>
            <input
              type="text"
              value={formData.trail.name}
              onChange={(e) => setFormData({
                ...formData,
                trail: {...formData.trail, name: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., Skyline Trail"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.trail.difficulty}
              onChange={(e) => setFormData({
                ...formData,
                trail: {...formData.trail, difficulty: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Distance (miles)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.trail.distance}
              onChange={(e) => setFormData({
                ...formData,
                trail: {...formData.trail, distance: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 5.2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontWeight: 500 }}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontWeight: 500 }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Elevation Gain (feet)
            </label>
            <input
              type="number"
              value={formData.trail.elevationGain}
              onChange={(e) => setFormData({
                ...formData,
                trail: {...formData.trail, elevationGain: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 1500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trail Type
            </label>
            <select
              value={formData.trail.type}
              onChange={(e) => setFormData({
                ...formData,
                trail: {...formData.trail, type: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
            >
              <option value="">Select trail type</option>
              <option value="loop">Loop</option>
              <option value="out-and-back">Out and Back</option>
              <option value="lollipop">Lollipop</option>
              <option value="point-to-point">Point to Point</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Weather Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-green-600" />
          Weather Conditions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temperature (°F)
            </label>
            <input
              type="number"
              value={formData.weather.temperature}
              onChange={(e) => setFormData({
                ...formData,
                weather: {...formData.weather, temperature: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 65"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conditions
            </label>
            <input
              type="text"
              value={formData.weather.conditions}
              onChange={(e) => setFormData({
                ...formData,
                weather: {...formData.weather, conditions: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., Sunny, Clear skies"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wind Speed (mph)
            </label>
            <input
              type="number"
              value={formData.weather.windSpeed}
              onChange={(e) => setFormData({
                ...formData,
                weather: {...formData.weather, windSpeed: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Humidity (%)
            </label>
            <input
              type="number"
              value={formData.weather.humidity}
              onChange={(e) => setFormData({
                ...formData,
                weather: {...formData.weather, humidity: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="e.g., 45"
            />
          </div>
        </div>
      </div>

      {/* Tags and Rating */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ fontWeight: 500 }}
              placeholder="mountains, waterfall, wildlife, summit"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Rating: {formData.rating}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* Privacy Setting */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Privacy Setting
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={formData.privacy === 'private'}
                onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                className="mr-2"
              />
              <span className="text-sm">Private (only you can see)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={formData.privacy === 'public'}
                onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                className="mr-2"
              />
              <span className="text-sm">Public (visible to others)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        {/* Show Finish button for draft entries */}
        {entry && formData.status === 'draft' && (
          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              const toastId = toast.loading('Marking entry as completed...', {
                style: {
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              });
              
              try {
                const response = await fetch(`/api/entries/${entry._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...formData, status: 'completed' })
                });

                if (response.ok) {
                  toast.dismiss(toastId);
                  toast.success('Entry marked as completed!', {
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
                  router.push('/entries');
                } else {
                  const error = await response.json();
                  toast.dismiss(toastId);
                  toast.error(`Error: ${error.message || 'Failed to update entry'}`, {
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
                console.error('Error updating entry:', error);
                toast.dismiss(toastId);
                toast.error('Failed to update entry. Please try again.', {
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
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Finishing...' : 'Finish Hike'}
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
        </button>
      </div>
    </form>
  );
} 