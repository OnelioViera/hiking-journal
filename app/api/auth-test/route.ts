import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        error: 'No authentication token provided or token is invalid',
        message: 'Please include a valid Bearer token in the Authorization header'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      userId: userId,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Authentication test failed:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Authentication failed',
      message: 'Please check your authentication token'
    }, { status: 401 });
  }
} 