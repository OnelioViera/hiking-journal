'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  url: string;
  publicId: string;
  caption?: string;
  timestamp: Date;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoGallery({ photos, isOpen, onClose, initialIndex = 0 }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Convert HEIC URLs to JPEG for better browser compatibility
  const convertHeicToJpeg = (url: string): string => {
    if (url.includes('.heic')) {
      return url.replace('.heic', '.jpg');
    }
    return url;
  };

  if (!isOpen || photos.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Navigation Buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative max-w-4xl max-h-full mx-4">
        <Image
          src={convertHeicToJpeg(currentPhoto.url)}
          alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          width={1200}
          height={900}
          unoptimized
          onError={(e) => {
            console.error('PhotoGallery image failed to load:', currentPhoto.url, e);
            // Try to load the original URL as fallback
            const target = e.target as HTMLImageElement;
            if (target.src !== currentPhoto.url) {
              target.src = currentPhoto.url;
            }
          }}
        />
        
        {/* Photo Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <div className="text-center">
            <p className="text-sm">
              {currentIndex + 1} of {photos.length}
            </p>
            {currentPhoto.caption && (
              <p className="text-lg font-semibold mt-1">
                {currentPhoto.caption}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <Image
                src={convertHeicToJpeg(photo.url)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                width={64}
                height={64}
                unoptimized
                onError={(e) => {
                  console.error('PhotoGallery thumbnail failed to load:', photo.url, e);
                  // Try to load the original URL as fallback
                  const target = e.target as HTMLImageElement;
                  if (target.src !== photo.url) {
                    target.src = photo.url;
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 