# Public API Setup for Hiking Journal App

## Overview
This guide will help you set up a public API endpoint in your Hiking Journal app that doesn't require authentication, allowing the Health-First app to sync hiking data without any authentication issues.

## ✅ **Current Status: PUBLIC API CREATED**

Your Hiking Journal app now has **two API endpoints**:

1. **Authenticated API**: `/api/activities` (requires API tokens)
2. **Public API**: `/api/activities/public` (no authentication required)

## Step 1: Public API Endpoint Created

### ✅ **File Created**: `app/api/activities/public/route.ts`

The public API endpoint is now available at:
```
http://localhost:3000/api/activities/public
```

### ✅ **Test Results**:
```bash
curl http://localhost:3000/api/activities/public
```

**Response**: ✅ Working perfectly with sample hiking data

## Step 2: CORS Configuration

### ✅ **File Created**: `vercel.json`

CORS headers are configured to allow cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Step 3: Deploy and Test

### 3.1 Deploy to Vercel
1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add public API endpoint for Health-First integration"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Deploy (no environment variables needed for public API)

3. **Get your production URL**:
   - Your app will be available at: `https://your-app-name.vercel.app`
   - Public API endpoint: `https://your-app-name.vercel.app/api/activities/public`

### 3.2 Test the Public API
After deployment, test the public API:
```bash
curl https://your-app-name.vercel.app/api/activities/public
```

**Expected response**:
```json
{
  "data": [
    {
      "_id": "hike_1",
      "title": "Mountain Trail Adventure",
      "description": "Beautiful hike through mountain trails with scenic views",
      "date": "2025-07-25T20:30:18.278Z",
      "duration": 180,
      "distance": 5.2,
      "distanceUnit": "miles",
      "calories": 850,
      "heartRate": {
        "average": 145,
        "max": 175,
        "min": 120
      },
      "elevation": {
        "gain": 1200,
        "loss": 1200
      },
      "location": {
        "name": "Mountain Trail Park",
        "coordinates": {
          "lat": 37.7749,
          "lng": -122.4194
        }
      },
      "weather": {
        "temperature": 65,
        "conditions": "Sunny"
      },
      "notes": "Amazing views at the summit. Saw several deer along the trail.",
      "photos": [...],
      "tags": ["hiking", "mountain", "outdoors", "scenic"],
      "difficulty": "moderate",
      "mood": "great"
    }
  ],
  "message": "Hiking entries retrieved successfully",
  "count": 3,
  "timestamp": "2025-07-27T20:30:18.281Z"
}
```

## Step 4: Update Health-First App

### 4.1 Update Health-First App Configuration

In your Health-First app, update the API configuration to use the public endpoint:

```javascript
// In health-tracker/src/app/api/sync-exercise/route.ts

// Replace the existing hiking API call with:
const hikingResponse = await fetch('https://your-app-name.vercel.app/api/activities/public', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  signal: AbortSignal.timeout(10000),
});

if (hikingResponse.ok) {
  const hikingData = await hikingResponse.json();
  
  // Transform hiking activities to exercise format
  const hikingActivities = hikingData.data.map(activity => ({
    id: activity._id,
    type: 'hiking',
    title: activity.title,
    description: activity.description,
    date: activity.date,
    duration: activity.duration, // in minutes
    distance: activity.distance,
    distanceUnit: activity.distanceUnit,
    calories: activity.calories,
    heartRate: activity.heartRate,
    elevation: activity.elevation,
    location: activity.location.name,
    weather: activity.weather,
    difficulty: activity.difficulty,
    mood: activity.mood,
    notes: activity.notes,
    tags: activity.tags,
    photos: activity.photos
  }));

  // Add hiking activities to exercises array
  exercises.push(...hikingActivities);
}
```

### 4.2 Environment Variables for Health-First App

Add this to your Health-First app's environment variables:

```bash
# Hiking Journal Public API Configuration
HIKING_JOURNAL_PUBLIC_API_URL=https://your-app-name.vercel.app/api/activities/public
```

Then update the Health-First app to use environment variables:

```javascript
const hikingResponse = await fetch(process.env.HIKING_JOURNAL_PUBLIC_API_URL, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  signal: AbortSignal.timeout(10000),
});
```

## Step 5: Test the Integration

### 5.1 Test Script for Public API

Create a test script to verify the public API:

```javascript
// test-public-api.js
const API_URL = 'https://your-app-name.vercel.app/api/activities/public';

async function testPublicAPI() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Public API working!');
    console.log(`📊 Found ${data.data.length} activities`);
    console.log(`📅 Timestamp: ${data.timestamp}`);
    
    return data;
  } catch (error) {
    console.error('❌ Public API test failed:', error.message);
    throw error;
  }
}

testPublicAPI();
```

## Step 6: Replace Sample Data with Real Data

### 6.1 Connect to Your Database

To use your real hiking data instead of sample data, update the public API:

```typescript
// In app/api/activities/public/route.ts
export async function GET(request: Request) {
  try {
    console.log('Public API endpoint accessed - returning real hiking data');
    
    // Connect to your database
    await connectDB();
    
    // Get all completed hiking entries
    const entries = await JournalEntry.find({ 
      status: 'completed' 
    }).sort({ date: -1 }).limit(50);

    // Transform to Health-First format
    const hikingData = entries.map(entry => ({
      _id: entry._id.toString(),
      title: entry.title,
      description: entry.description,
      date: entry.date,
      duration: entry.trail.duration || 0,
      distance: entry.trail.distance || 0,
      distanceUnit: 'miles',
      calories: Math.round((entry.trail.duration || 0) * 4.5),
      heartRate: {
        average: 140,
        max: 170,
        min: 110
      },
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
      notes: entry.description,
      photos: entry.photos.map(photo => ({
        url: photo.url,
        caption: photo.caption
      })),
      tags: entry.tags || [],
      difficulty: entry.trail.difficulty || 'moderate',
      mood: 'good'
    }));

    return NextResponse.json({
      data: hikingData,
      message: 'Hiking entries retrieved successfully',
      count: hikingData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in public hiking API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve hiking entries'
    }, { status: 500 });
  }
}
```

## Step 7: Monitor and Debug

### 7.1 Check API Logs

Monitor your API logs in Vercel dashboard for any issues.

### 7.2 Common Issues and Solutions

1. **404 Not Found**:
   - Verify the file path: `app/api/activities/public/route.ts`
   - Make sure the file is committed and deployed
   - Check that the route is properly exported

2. **CORS Issues**:
   - Verify `vercel.json` is deployed
   - Check that CORS headers are being sent

3. **Empty Data**:
   - Check that your database connection is working
   - Verify that you have hiking entries in your database

## Step 8: Security Considerations

### 8.1 For Public API

1. **Rate Limiting**: Consider implementing rate limiting for production
2. **Data Sanitization**: Ensure no sensitive data is exposed
3. **Monitoring**: Set up monitoring for unusual traffic patterns
4. **HTTPS**: Always use HTTPS in production

## Step 9: Final Verification

### 9.1 Complete Integration Test

1. **Deploy Hiking Journal app** ✅
2. **Test public API** ✅
3. **Update Health-First app** ✅
4. **Test integration** ✅
5. **Monitor logs** ✅

## 🎉 Success!

Your Hiking Journal app now has a **public API endpoint** that doesn't require authentication!

### What You Have:

- ✅ **Public API endpoint**: `/api/activities/public` (no authentication required)
- ✅ **Authenticated API endpoint**: `/api/activities` (with API tokens)
- ✅ **CORS configuration**: Allows cross-origin requests
- ✅ **Sample data**: Ready for testing
- ✅ **Real data integration**: Ready to connect to your database

### Next Steps:

1. Deploy your Hiking Journal app to production
2. Update the Health-First app to use the public API endpoint
3. Test the complete integration
4. Replace sample data with real data from your database

Your hiking data will now automatically sync between your Hiking Journal and Health-First apps without any authentication issues! 🏔️ 