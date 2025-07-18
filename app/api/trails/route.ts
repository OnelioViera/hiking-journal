import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock trail data - in a real implementation, you'd integrate with AllTrails API
const mockTrailData = {
  "rampart-reservoir-via-shubarth-trail": {
    name: "Rampart Reservoir via Shubarth Trail",
    location: {
      name: "Pike National Forest, Colorado",
      coordinates: {
        latitude: 38.9567,
        longitude: -105.0167
      },
      elevation: 9200
    },
    trail: {
      name: "Shubarth Trail",
      difficulty: "moderate",
      distance: 6.2,
      duration: 180, // 3 hours
      elevationGain: 800,
      type: "out-and-back"
    },
    description: "A scenic trail leading to Rampart Reservoir with beautiful mountain views and forested sections.",
    tags: ["lake", "forest", "wildlife", "scenic-views"],
    features: ["waterfall", "wildlife", "scenic-views", "lake"],
    seasonality: {
      bestSeasons: ["spring", "summer", "fall"],
      accessibility: "Year-round access"
    }
  },
  "garden-of-the-gods-loop": {
    name: "Garden of the Gods Loop",
    location: {
      name: "Garden of the Gods, Colorado Springs, Colorado",
      coordinates: {
        latitude: 38.8799,
        longitude: -104.8867
      },
      elevation: 6400
    },
    trail: {
      name: "Garden of the Gods Loop Trail",
      difficulty: "easy",
      distance: 4.1,
      duration: 120, // 2 hours
      elevationGain: 300,
      type: "loop"
    },
    description: "A beautiful loop through the iconic red rock formations of Garden of the Gods.",
    tags: ["red-rocks", "scenic-views", "family-friendly", "photography"],
    features: ["red-rocks", "scenic-views", "family-friendly"],
    seasonality: {
      bestSeasons: ["spring", "summer", "fall", "winter"],
      accessibility: "Year-round access"
    }
  },
  "hanging-lake-trail": {
    name: "Hanging Lake Trail",
    location: {
      name: "Glenwood Canyon, Colorado",
      coordinates: {
        latitude: 39.6011,
        longitude: -107.1956
      },
      elevation: 7200
    },
    trail: {
      name: "Hanging Lake Trail",
      difficulty: "hard",
      distance: 3.2,
      duration: 240, // 4 hours
      elevationGain: 1200,
      type: "out-and-back"
    },
    description: "A challenging but rewarding hike to the stunning Hanging Lake with crystal clear waters.",
    tags: ["lake", "waterfall", "challenging", "scenic-views"],
    features: ["lake", "waterfall", "crystal-clear-water"],
    seasonality: {
      bestSeasons: ["spring", "summer", "fall"],
      accessibility: "Seasonal access"
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trailId = searchParams.get('id');
    const search = searchParams.get('search');
    const location = searchParams.get('location');

    if (trailId) {
      // Return specific trail data
      const trailData = mockTrailData[trailId as keyof typeof mockTrailData];
      if (!trailData) {
        return NextResponse.json({ error: 'Trail not found' }, { status: 404 });
      }
      return NextResponse.json(trailData);
    }

    if (search || location) {
      // Search trails - in real implementation, this would query AllTrails API
      const searchResults = Object.entries(mockTrailData)
        .filter(([id, trail]) => {
          const searchTerm = (search || location || '').toLowerCase();
          return trail.name.toLowerCase().includes(searchTerm) ||
                 trail.location.name.toLowerCase().includes(searchTerm) ||
                 trail.trail.name.toLowerCase().includes(searchTerm);
        })
        .map(([id, trail]) => ({
          id,
          ...trail
        }));

      return NextResponse.json({
        trails: searchResults,
        total: searchResults.length
      });
    }

    // Return all available trails
    const allTrails = Object.entries(mockTrailData).map(([id, trail]) => ({
      id,
      ...trail
    }));

    return NextResponse.json({
      trails: allTrails,
      total: allTrails.length
    });
  } catch (error) {
    console.error('Error fetching trail data:', error);
    return NextResponse.json({ error: 'Failed to fetch trail data' }, { status: 500 });
  }
} 