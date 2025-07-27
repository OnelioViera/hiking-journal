import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build query for completed hiking activities only
    const query: Record<string, unknown> = { 
      userId,
      status: 'completed' // Only return completed activities
    };

    // Date range filtering
    if (startDate || endDate) {
      const dateQuery: Record<string, unknown> = {};
      if (startDate) {
        dateQuery.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.$lte = new Date(endDate);
      }
      query.date = dateQuery;
    }

    const entries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Transform journal entries into activity format
    const activities = entries.map(entry => ({
      id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0, // in minutes
      distance: entry.trail.distance || 0, // in miles/km
      type: 'hiking',
      location: entry.location.name,
      difficulty: entry.trail.difficulty,
      elevationGain: entry.trail.elevationGain || 0,
      trailType: entry.trail.type,
      weather: {
        temperature: entry.weather.temperature,
        conditions: entry.weather.conditions,
        windSpeed: entry.weather.windSpeed,
        humidity: entry.weather.humidity
      },
      rating: entry.rating,
      tags: entry.tags,
      photos: entry.photos.map((photo: { url: string; caption?: string }) => ({
        url: photo.url,
        caption: photo.caption
      })),
      metadata: {
        trailName: entry.trail.name,
        coordinates: entry.location.coordinates,
        elevation: entry.location.elevation,
        trailhead: entry.location.trailhead,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    }));

    const total = await JournalEntry.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages
      },
      summary: {
        totalActivities: total,
        totalDistance: activities.reduce((sum, activity) => sum + (activity.distance || 0), 0),
        totalDuration: activities.reduce((sum, activity) => sum + (activity.duration || 0), 0),
        totalElevationGain: activities.reduce((sum, activity) => sum + (activity.elevationGain || 0), 0),
        averageRating: activities.length > 0 
          ? activities.reduce((sum, activity) => sum + activity.rating, 0) / activities.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    // Transform activity data to journal entry format
    const entryData = {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      location: {
        name: data.location || 'Unknown Location',
        coordinates: data.coordinates,
        elevation: data.elevation,
        trailhead: data.trailhead
      },
      trail: {
        name: data.trailName,
        difficulty: data.difficulty || 'moderate',
        distance: data.distance,
        duration: data.duration,
        elevationGain: data.elevationGain,
        type: data.trailType || 'other'
      },
      weather: data.weather || {},
      photos: data.photos || [],
      tags: data.tags || [],
      rating: data.rating || 3,
      privacy: data.privacy || 'private',
      status: 'completed' // Activities are always completed
    };

    const entry = new JournalEntry({
      ...entryData,
      userId
    });

    await entry.save();

    // Return the activity in the expected format
    const activity = {
      id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration,
      distance: entry.trail.distance,
      type: 'hiking',
      location: entry.location.name,
      difficulty: entry.trail.difficulty,
      elevationGain: entry.trail.elevationGain,
      trailType: entry.trail.type,
      weather: entry.weather,
      rating: entry.rating,
      tags: entry.tags,
      photos: entry.photos,
      metadata: {
        trailName: entry.trail.name,
        coordinates: entry.location.coordinates,
        elevation: entry.location.elevation,
        trailhead: entry.location.trailhead,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    };

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
} 