import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const documentation = {
    name: "Hiking Journal Activities API",
    version: "1.0.0",
    description: "API for accessing hiking activities from the Hiking Journal app. This API transforms journal entries into a format compatible with health tracking and fitness applications.",
    baseUrl: `${baseUrl}/api/activities`,
    authentication: {
      type: "Bearer Token",
      description: "All endpoints require authentication via Clerk. Include the user's session token in the Authorization header."
    },
    endpoints: {
      "GET /api/activities": {
        description: "Retrieve a list of hiking activities",
        parameters: {
          page: "Page number (default: 1)",
          limit: "Number of activities per page (default: 50, max: 100)",
          startDate: "Filter activities from this date (ISO format)",
          endDate: "Filter activities until this date (ISO format)",
          type: "Activity type (default: 'hiking')"
        },
        response: {
          activities: "Array of activity objects",
          pagination: "Pagination information",
          summary: "Aggregated statistics"
        },
        example: `${baseUrl}/api/activities?page=1&limit=10&startDate=2024-01-01`
      },
      "GET /api/activities/{id}": {
        description: "Retrieve a specific hiking activity",
        parameters: {
          id: "Activity ID"
        },
        response: "Single activity object",
        example: `${baseUrl}/api/activities/64f1a2b3c4d5e6f7g8h9i0j1`
      },
      "POST /api/activities": {
        description: "Create a new hiking activity",
        body: {
          title: "Activity title (required)",
          description: "Activity description (required)",
          date: "Activity date (ISO format, required)",
          duration: "Duration in minutes",
          distance: "Distance in miles/km",
          location: "Location name",
          difficulty: "Trail difficulty (easy, moderate, hard, expert)",
          elevationGain: "Elevation gain in feet/meters",
          trailType: "Trail type (loop, out-and-back, lollipop, point-to-point, other)",
          weather: "Weather conditions object",
          tags: "Array of tags",
          rating: "Rating (1-5)",
          photos: "Array of photo objects"
        },
        response: "Created activity object"
      },
      "PUT /api/activities/{id}": {
        description: "Update an existing hiking activity",
        parameters: {
          id: "Activity ID"
        },
        body: "Same as POST body (all fields optional)",
        response: "Updated activity object"
      },
      "DELETE /api/activities/{id}": {
        description: "Delete a hiking activity",
        parameters: {
          id: "Activity ID"
        },
        response: "Success message"
      },
      "GET /api/activities/summary": {
        description: "Get aggregated statistics and trends",
        parameters: {
          period: "Time period (all, week, month, year)",
          startDate: "Custom start date (ISO format)",
          endDate: "Custom end date (ISO format)"
        },
        response: {
          summary: "Aggregated statistics",
          breakdowns: "Difficulty, trail type, and weather breakdowns",
          trends: "Monthly trends data",
          topLocations: "Most visited locations",
          recentActivities: "Recent activity summaries"
        },
        example: `${baseUrl}/api/activities/summary?period=month`
      }
    },
    activityObject: {
      id: "Unique activity identifier",
      title: "Activity title",
      description: "Activity description",
      date: "Activity date (ISO format)",
      duration: "Duration in minutes",
      distance: "Distance in miles/km",
      type: "Activity type (always 'hiking')",
      location: "Location name",
      difficulty: "Trail difficulty",
      elevationGain: "Elevation gain in feet/meters",
      trailType: "Trail type",
      weather: {
        temperature: "Temperature in degrees",
        conditions: "Weather conditions",
        windSpeed: "Wind speed",
        humidity: "Humidity percentage"
      },
      rating: "User rating (1-5)",
      tags: "Array of tags",
      photos: "Array of photo objects",
      metadata: {
        trailName: "Trail name",
        coordinates: "GPS coordinates",
        elevation: "Location elevation",
        trailhead: "Trailhead information",
        createdAt: "Creation timestamp",
        updatedAt: "Last update timestamp"
      }
    },
    errorResponses: {
      400: "Bad Request - Invalid parameters",
      401: "Unauthorized - Authentication required",
      404: "Not Found - Activity not found",
      500: "Internal Server Error - Server error"
    },
    rateLimiting: {
      description: "API requests are limited to 100 requests per minute per user",
      headers: {
        "X-RateLimit-Limit": "Request limit per window",
        "X-RateLimit-Remaining": "Remaining requests in current window",
        "X-RateLimit-Reset": "Time when the rate limit resets"
      }
    },
    dataFormat: {
      dates: "ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
      distances: "Miles or kilometers (specified in response)",
      durations: "Minutes",
      elevations: "Feet or meters (specified in response)",
      coordinates: "Decimal degrees (latitude, longitude)"
    }
  };

  return NextResponse.json(documentation);
} 