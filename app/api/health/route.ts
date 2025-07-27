import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        authentication: 'operational',
        database: 'unknown',
        api: 'operational'
      },
      features: {
        activities: 'available',
        summary: 'available',
        documentation: 'available'
      },
      authentication: {
        authenticated: !!userId,
        userId: userId || null
      }
    };

    // Check database connection
    try {
      await connectDB();
      healthStatus.services.database = 'operational';
      
      // If user is authenticated, check if they have any activities
      if (userId) {
        const activityCount = await JournalEntry.countDocuments({ 
          userId, 
          status: 'completed' 
        });
        
        healthStatus.user = {
          hasActivities: activityCount > 0,
          totalActivities: activityCount
        };
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      healthStatus.services.database = 'error';
      healthStatus.status = 'degraded';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        authentication: 'error',
        database: 'unknown',
        api: 'error'
      }
    }, { status: 500 });
  }
} 