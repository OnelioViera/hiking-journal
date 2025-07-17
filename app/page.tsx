'use client';

import Link from 'next/link';
import { Mountain, Camera, MapPin, BarChart3, Users, Calendar } from 'lucide-react';
import { SignInButton, useAuth } from '@clerk/nextjs';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Mountain landscape"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 to-blue-50/90"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="flex justify-center mb-6">
            <Mountain className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Hiking Adventures
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Document your outdoor experiences, capture memories, and build a personal 
            collection of your hiking journeys with our modern journal app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoaded ? (
              <div className="animate-pulse bg-gray-200 h-12 w-32 rounded-lg"></div>
            ) : isSignedIn ? (
              <>
                <Link
                  href="/entries/new"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Create New Entry
                </Link>
                <Link
                  href="/entries"
                  className="border border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                >
                  View Journal
                </Link>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  Start Journaling
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Your Hiking Journal
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Camera className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Photo Management</h3>
              <p className="text-gray-600">
                Upload and organize photos from your hikes with automatic optimization 
                and cloud storage.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <MapPin className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trail Information</h3>
              <p className="text-gray-600">
                Record trail details, difficulty ratings, GPS coordinates, and 
                elevation data for each adventure.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Weather Tracking</h3>
              <p className="text-gray-600">
                Log weather conditions during your hikes to remember the perfect 
                conditions for future trips.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Statistics Dashboard</h3>
              <p className="text-gray-600">
                Track your hiking progress with detailed statistics and insights 
                about your outdoor activities.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Social Features</h3>
              <p className="text-gray-600">
                Share your adventures with friends and discover new trails from 
                the hiking community.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <Mountain className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Maps</h3>
              <p className="text-gray-600">
                View your hiking locations on integrated maps and plan future 
                adventures with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Hiking Journal?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of hikers documenting their outdoor adventures and 
            preserving memories for years to come.
          </p>
          {!isLoaded ? (
            <div className="animate-pulse bg-white h-12 w-48 rounded-lg mx-auto"></div>
          ) : isSignedIn ? (
            <Link
              href="/entries/new"
              className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Create Your First Entry
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Create Your First Entry
              </button>
            </SignInButton>
          )}
        </div>
      </section>
    </div>
  );
}
