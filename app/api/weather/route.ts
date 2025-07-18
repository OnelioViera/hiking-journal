import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const location = searchParams.get('location');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Location coordinates required' }, { status: 400 });
    }

    // In a real implementation, you'd call a weather API like OpenWeatherMap
    // For now, returning mock data based on location
    const mockWeatherData = {
      current: {
        temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
        conditions: ["Sunny", "Partly Cloudy", "Clear", "Overcast"][Math.floor(Math.random() * 4)],
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
        humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
        feelsLike: Math.floor(Math.random() * 30) + 50,
        uvIndex: Math.floor(Math.random() * 8) + 2,
        visibility: Math.floor(Math.random() * 5) + 5 // 5-10 miles
      },
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          high: Math.floor(Math.random() * 20) + 60,
          low: Math.floor(Math.random() * 20) + 40,
          conditions: ["Sunny", "Partly Cloudy", "Clear", "Overcast"][Math.floor(Math.random() * 4)],
          precipitation: Math.floor(Math.random() * 30),
          windSpeed: Math.floor(Math.random() * 15) + 5
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          high: Math.floor(Math.random() * 20) + 60,
          low: Math.floor(Math.random() * 20) + 40,
          conditions: ["Sunny", "Partly Cloudy", "Clear", "Overcast"][Math.floor(Math.random() * 4)],
          precipitation: Math.floor(Math.random() * 30),
          windSpeed: Math.floor(Math.random() * 15) + 5
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          high: Math.floor(Math.random() * 20) + 60,
          low: Math.floor(Math.random() * 20) + 40,
          conditions: ["Sunny", "Partly Cloudy", "Clear", "Overcast"][Math.floor(Math.random() * 4)],
          precipitation: Math.floor(Math.random() * 30),
          windSpeed: Math.floor(Math.random() * 15) + 5
        }
      ],
      alerts: location?.toLowerCase().includes('colorado') ? [
        {
          type: "Weather Alert",
          title: "High Elevation Weather Warning",
          description: "Be prepared for rapidly changing weather conditions at high elevations.",
          severity: "moderate"
        }
      ] : []
    };

    return NextResponse.json(mockWeatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
} 