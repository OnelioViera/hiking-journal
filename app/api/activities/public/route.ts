import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

// Sample hiking data for demonstration
const sampleHikingData = [
  {
    _id: 'hike_1',
    title: 'Mountain Trail Adventure',
    description: 'Beautiful hike through mountain trails with scenic views',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 180, // 3 hours in minutes
    distance: 5.2,
    distanceUnit: 'miles',
    calories: 850,
    heartRate: {
      average: 145,
      max: 175,
      min: 120
    },
    elevation: {
      gain: 1200,
      loss: 1200
    },
    location: {
      name: 'Mountain Trail Park',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    weather: {
      temperature: 65,
      conditions: 'Sunny'
    },
    notes: 'Amazing views at the summit. Saw several deer along the trail.',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        caption: 'Mountain summit view'
      }
    ],
    tags: ['hiking', 'mountain', 'outdoors', 'scenic'],
    difficulty: 'moderate',
    mood: 'great'
  },
  {
    _id: 'hike_2',
    title: 'Riverside Walk',
    description: 'Peaceful walk along the river with gentle terrain',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    duration: 90, // 1.5 hours
    distance: 3.1,
    distanceUnit: 'miles',
    calories: 450,
    heartRate: {
      average: 125,
      max: 150,
      min: 110
    },
    elevation: {
      gain: 200,
      loss: 200
    },
    location: {
      name: 'Riverside Trail',
      coordinates: {
        lat: 37.7849,
        lng: -122.4094
      }
    },
    weather: {
      temperature: 72,
      conditions: 'Partly Cloudy'
    },
    notes: 'Perfect weather for a relaxing walk. Great for bird watching.',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        caption: 'Riverside view'
      }
    ],
    tags: ['walking', 'river', 'relaxing', 'bird-watching'],
    difficulty: 'easy',
    mood: 'good'
  },
  {
    _id: 'hike_3',
    title: 'Forest Trail Challenge',
    description: 'Challenging hike through dense forest with steep climbs',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    duration: 240, // 4 hours
    distance: 7.8,
    distanceUnit: 'miles',
    calories: 1200,
    heartRate: {
      average: 165,
      max: 190,
      min: 140
    },
    elevation: {
      gain: 1800,
      loss: 1800
    },
    location: {
      name: 'National Forest Trail',
      coordinates: {
        lat: 37.7649,
        lng: -122.4294
      }
    },
    weather: {
      temperature: 58,
      conditions: 'Overcast'
    },
    notes: 'Very challenging but rewarding. The forest was incredibly peaceful.',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        caption: 'Forest trail'
      }
    ],
    tags: ['hiking', 'forest', 'challenging', 'steep'],
    difficulty: 'hard',
    mood: 'tough'
  }
];

export async function GET(request: Request) {
  try {
    console.log('Public API endpoint accessed - returning hiking data');
    
    // For now, return sample data
    // In the future, you can connect to your database here
    return NextResponse.json({
      data: sampleHikingData,
      message: 'Hiking entries retrieved successfully',
      count: sampleHikingData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in public hiking API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve hiking entries'
    }, { status: 500 });
  }
}

// Optional: Add POST method if you want to accept new entries
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Here you would typically save to your database
    console.log('Received new hiking entry:', body);
    
    return NextResponse.json({
      message: 'Hiking entry received successfully',
      id: `hike_${Date.now()}`
    });

  } catch (error) {
    console.error('Error in public hiking API POST:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to process hiking entry'
    }, { status: 500 });
  }
} 