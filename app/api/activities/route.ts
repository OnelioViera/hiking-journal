import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Check if it's a valid API token
      if (token === 'test_hiking_journal_token_2024' || 
          token === 'aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0') {
        // This is a valid API token
        console.log('Valid API token used:', token);
        
        // For API token auth, we'll return sample data for demonstration
        // In production, you might want to map API tokens to specific users
        // or allow access to all public data
        return NextResponse.json({
          data: [
            {
              _id: 'activity_1',
              title: 'Mountain Trail Hike',
              description: 'Beautiful hike through the mountain trails',
              date: new Date().toISOString(),
              duration: 180,
              distance: 5.2,
              distanceUnit: 'miles',
              calories: 850,
              elevation: { gain: 1200, loss: 1200 },
              location: { name: 'Mountain Trail Park' },
              weather: { temperature: 65, conditions: 'Sunny' },
              difficulty: 'moderate',
              mood: 'great',
              notes: 'Amazing views at the summit',
              photos: [],
              tags: ['hiking', 'mountain', 'outdoors'],
              rating: 4,
              trailType: 'out-and-back',
              metadata: {
                trailName: 'Mountain Trail',
                coordinates: {},
                elevation: 1200,
                trailhead: 'Main Trailhead',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            },
            {
              _id: 'activity_2',
              title: 'Riverside Walk',
              description: 'Peaceful walk along the river',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 90,
              distance: 3.1,
              distanceUnit: 'miles',
              calories: 450,
              elevation: { gain: 200, loss: 200 },
              location: { name: 'Riverside Trail' },
              weather: { temperature: 72, conditions: 'Partly Cloudy' },
              difficulty: 'easy',
              mood: 'good',
              notes: 'Relaxing afternoon walk',
              photos: [],
              tags: ['hiking', 'riverside', 'easy'],
              rating: 3,
              trailType: 'loop',
              metadata: {
                trailName: 'Riverside Trail',
                coordinates: {},
                elevation: 200,
                trailhead: 'Riverside Park',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            },
            {
              _id: 'activity_3',
              title: 'Forest Loop Trail',
              description: 'Challenging hike through dense forest',
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 240,
              distance: 7.8,
              distanceUnit: 'miles',
              calories: 1200,
              elevation: { gain: 1800, loss: 1800 },
              location: { name: 'Forest National Park' },
              weather: { temperature: 58, conditions: 'Overcast' },
              difficulty: 'hard',
              mood: 'excellent',
              notes: 'Challenging but rewarding hike with great wildlife sightings',
              photos: [],
              tags: ['hiking', 'forest', 'challenging', 'wildlife'],
              rating: 5,
              trailType: 'loop',
              metadata: {
                trailName: 'Forest Loop Trail',
                coordinates: {},
                elevation: 1800,
                trailhead: 'Forest Entrance',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
              }
            },
            {
              _id: 'activity_4',
              title: 'Coastal Cliff Walk',
              description: 'Scenic walk along coastal cliffs',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 120,
              distance: 4.5,
              distanceUnit: 'miles',
              calories: 650,
              elevation: { gain: 400, loss: 400 },
              location: { name: 'Coastal Cliffs Reserve' },
              weather: { temperature: 68, conditions: 'Clear' },
              difficulty: 'moderate',
              mood: 'amazing',
              notes: 'Breathtaking ocean views and sea breeze',
              photos: [],
              tags: ['hiking', 'coastal', 'scenic', 'ocean'],
              rating: 4,
              trailType: 'out-and-back',
              metadata: {
                trailName: 'Coastal Cliff Walk',
                coordinates: {},
                elevation: 400,
                trailhead: 'Coastal Parking',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
          ]
        });
      }
    }
    
    // If not an API token, try Clerk authentication
    const authResult = await auth();
    if (!authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = authResult.userId;

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

    // Transform journal entries into activity format for Health-First app compatibility
    const activities = entries.map(entry => ({
      _id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0, // in minutes
      distance: entry.trail.distance || 0, // in miles/km
      distanceUnit: 'miles', // Default unit
      calories: Math.round((entry.trail.duration || 0) * 4.5), // Rough calorie estimate
      elevation: {
        gain: entry.trail.elevationGain || 0,
        loss: entry.trail.elevationGain || 0 // Assuming similar loss
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
      mood: 'good', // Default mood since not stored in journal entries
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

    const total = await JournalEntry.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: activities,
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
        totalElevationGain: activities.reduce((sum, activity) => sum + (activity.elevation.gain || 0), 0),
        averageRating: activities.length > 0 
          ? activities.reduce((sum, activity) => sum + (activity.rating || 0), 0) / activities.length 
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
        name: data.location?.name || data.location || 'Unknown Location',
        coordinates: data.location?.coordinates || data.coordinates,
        elevation: data.location?.elevation || data.elevation,
        trailhead: data.trailhead
      },
      trail: {
        name: data.trailName || data.metadata?.trailName,
        difficulty: data.difficulty || 'moderate',
        distance: data.distance,
        duration: data.duration,
        elevationGain: data.elevation?.gain || data.elevationGain,
        type: data.trailType || 'other'
      },
      weather: {
        temperature: data.weather?.temperature,
        conditions: data.weather?.conditions || '',
        windSpeed: data.weather?.windSpeed,
        humidity: data.weather?.humidity
      },
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

    // Return the activity in the Health-First compatible format
    const activity = {
      _id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0,
      distance: entry.trail.distance || 0,
      distanceUnit: 'miles',
      calories: Math.round((entry.trail.duration || 0) * 4.5),
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
      mood: 'good',
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
    };

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
} 