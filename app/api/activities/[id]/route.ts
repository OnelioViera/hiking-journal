import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const entry = await JournalEntry.findOne({
      _id: id,
      userId,
      status: 'completed' // Only return completed activities
    });

    if (!entry) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Transform journal entry into activity format
    const activity = {
      id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0,
      distance: entry.trail.distance || 0,
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
    };

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();

    // Transform activity data to journal entry format
    const updateData = {
      title: data.title,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      location: data.location ? {
        name: data.location,
        coordinates: data.coordinates,
        elevation: data.elevation,
        trailhead: data.trailhead
      } : undefined,
      trail: {
        name: data.trailName,
        difficulty: data.difficulty,
        distance: data.distance,
        duration: data.duration,
        elevationGain: data.elevationGain,
        type: data.trailType
      },
      weather: data.weather,
      tags: data.tags,
      rating: data.rating,
      photos: data.photos
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const entry = await JournalEntry.findOneAndUpdate(
      {
        _id: id,
        userId,
        status: 'completed'
      },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Return the updated activity
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

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const entry = await JournalEntry.findOneAndDelete({
      _id: id,
      userId,
      status: 'completed'
    });

    if (!entry) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
} 