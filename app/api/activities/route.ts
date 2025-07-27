import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

export async function GET(request: NextRequest) {
  try {
    console.log('Public API endpoint accessed - returning hiking data');
    
    await connectDB();

    // Get all completed journal entries
    const entries = await JournalEntry.find({
      status: 'completed'
    }).sort({ date: -1 }).limit(10); // Get last 10 entries

    // Transform journal entries into Health-First compatible format
    const activities = entries.map(entry => ({
      _id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0,
      distance: entry.trail.distance || 0,
      distanceUnit: 'miles',
      calories: Math.round((entry.trail.duration || 0) * 4.5),
      heartRate: {
        average: 140, // Default values since not stored
        max: 160,
        min: 120
      },
      elevation: {
        gain: entry.trail.elevationGain || 0,
        loss: entry.trail.elevationGain || 0
      },
      location: {
        name: entry.location.name,
        coordinates: entry.location.coordinates || {}
      },
      weather: {
        temperature: entry.weather.temperature,
        conditions: entry.weather.conditions || ''
      },
      difficulty: entry.trail.difficulty || 'moderate',
      mood: 'good', // Default mood
      notes: entry.description,
      photos: entry.photos.map((photo: { url: string; caption?: string }) => ({
        url: photo.url,
        caption: photo.caption
      })),
      tags: entry.tags || [],
      rating: entry.rating,
      trailType: entry.trail.type,
      metadata: {
        trailName: entry.trail.name,
        coordinates: entry.location.coordinates,
        elevation: entry.location.elevation,
        trailhead: entry.location.trailhead,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    }));

    // Return the hiking data without authentication
    return NextResponse.json({
      data: activities,
      message: 'Hiking entries retrieved successfully',
      count: activities.length,
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
export async function POST(request: NextRequest) {
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