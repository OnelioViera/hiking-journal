import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure API token
    const token = randomBytes(32).toString('hex');
    
    console.log(`Generated API token for user ${userId}: ${token}`);

    return NextResponse.json({
      success: true,
      token,
      message: 'API token generated successfully',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      scopes: ['read:activities']
    });
  } catch (error) {
    console.error('Error generating API token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
} 