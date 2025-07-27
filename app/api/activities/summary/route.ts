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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'all'; // all, week, month, year

    // Build query for completed hiking activities only
    const query: Record<string, unknown> = { 
      userId,
      status: 'completed'
    };

    // Date filtering based on period or custom date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    } else if (period !== 'all') {
      const now = new Date();
      let startDateFilter: Date;
      
      switch (period) {
        case 'week':
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDateFilter = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDateFilter = new Date(0);
      }
      
      query.date = { $gte: startDateFilter };
    }

    const entries = await JournalEntry.find(query).sort({ date: -1 });

    // Calculate comprehensive statistics
    const totalActivities = entries.length;
    const totalDistance = entries.reduce((sum, entry) => sum + (entry.trail.distance || 0), 0);
    const totalDuration = entries.reduce((sum, entry) => sum + (entry.trail.duration || 0), 0);
    const totalElevationGain = entries.reduce((sum, entry) => sum + (entry.trail.elevationGain || 0), 0);
    const averageRating = totalActivities > 0 
      ? entries.reduce((sum, entry) => sum + entry.rating, 0) / totalActivities 
      : 0;

    // Calculate averages
    const averageDistance = totalActivities > 0 ? totalDistance / totalActivities : 0;
    const averageDuration = totalActivities > 0 ? totalDuration / totalActivities : 0;
    const averageElevationGain = totalActivities > 0 ? totalElevationGain / totalActivities : 0;

    // Difficulty breakdown
    const difficultyBreakdown = entries.reduce((acc, entry) => {
      const difficulty = entry.trail.difficulty || 'unknown';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trail type breakdown
    const trailTypeBreakdown = entries.reduce((acc, entry) => {
      const type = entry.trail.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEntries = entries.filter(entry => 
        entry.date >= monthStart && entry.date <= monthEnd
      );
      
      monthlyTrends.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        activities: monthEntries.length,
        distance: monthEntries.reduce((sum, entry) => sum + (entry.trail.distance || 0), 0),
        duration: monthEntries.reduce((sum, entry) => sum + (entry.trail.duration || 0), 0),
        elevationGain: monthEntries.reduce((sum, entry) => sum + (entry.trail.elevationGain || 0), 0)
      });
    }

    // Personal records
    const longestHike = Math.max(...entries.map(entry => entry.trail.distance || 0));
    const highestElevation = Math.max(...entries.map(entry => entry.trail.elevationGain || 0));
    const longestDuration = Math.max(...entries.map(entry => entry.trail.duration || 0));

    // Recent activities (last 5)
    const recentActivities = entries.slice(0, 5).map(entry => ({
      id: entry._id.toString(),
      title: entry.title,
      date: entry.date,
      distance: entry.trail.distance || 0,
      duration: entry.trail.duration || 0,
      difficulty: entry.trail.difficulty,
      rating: entry.rating
    }));

    // Weather statistics
    const weatherStats = entries.reduce((acc, entry) => {
      if (entry.weather.conditions) {
        acc[entry.weather.conditions] = (acc[entry.weather.conditions] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Location statistics
    const locationStats = entries.reduce((acc, entry) => {
      const location = entry.location.name;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top locations (most visited)
    const topLocations = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    return NextResponse.json({
      summary: {
        totalActivities,
        totalDistance,
        totalDuration,
        totalElevationGain,
        averageRating,
        averageDistance,
        averageDuration,
        averageElevationGain,
        personalRecords: {
          longestHike,
          highestElevation,
          longestDuration
        }
      },
      breakdowns: {
        difficulty: difficultyBreakdown,
        trailType: trailTypeBreakdown,
        weather: weatherStats
      },
      trends: {
        monthly: monthlyTrends
      },
      topLocations,
      recentActivities,
      period: {
        type: period,
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    return NextResponse.json({ error: 'Failed to fetch activity summary' }, { status: 500 });
  }
} 