# Hiking Journal API Integration with Health-First App

## Overview

Your Hiking Journal app now has a fully functional API endpoint that can be integrated with the Health-First app. The API provides hiking activities in a format that's compatible with health tracking applications.

## API Endpoint

**URL**: `http://localhost:3000/api/activities` (or your deployed URL)

**Method**: `GET`

**Authentication**: Supports both API tokens and Clerk authentication

## Authentication Options

### Option 1: API Token Authentication (Recommended for Health-First Integration)

Use one of these valid API tokens:
- `test_hiking_journal_token_2024`
- `aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0`

**Headers**:
```
Authorization: Bearer test_hiking_journal_token_2024
```

### Option 2: Clerk Authentication

For authenticated users, the API will return their personal hiking data.

## Data Format

The API returns hiking activities in the following format:

```json
{
  "data": [
    {
      "_id": "activity_id",
      "title": "Mountain Trail Hike",
      "description": "Beautiful hike through the mountain trails",
      "date": "2025-07-27T19:59:34.223Z",
      "duration": 180,
      "distance": 5.2,
      "distanceUnit": "miles",
      "calories": 850,
      "elevation": {
        "gain": 1200,
        "loss": 1200
      },
      "location": {
        "name": "Mountain Trail Park",
        "coordinates": {}
      },
      "weather": {
        "temperature": 65,
        "conditions": "Sunny"
      },
      "difficulty": "moderate",
      "mood": "great",
      "notes": "Amazing views at the summit",
      "photos": [],
      "tags": ["hiking", "mountain", "outdoors"],
      "rating": 4,
      "trailType": "out-and-back",
      "metadata": {
        "trailName": "Mountain Trail",
        "coordinates": {},
        "elevation": 1200,
        "trailhead": "Main Trailhead",
        "createdAt": "2025-07-27T19:59:34.223Z",
        "updatedAt": "2025-07-27T19:59:34.223Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 4,
    "pages": 1
  },
  "summary": {
    "totalActivities": 4,
    "totalDistance": 20.6,
    "totalDuration": 630,
    "totalElevationGain": 3600,
    "averageRating": 4.25
  }
}
```

## Query Parameters

- `page`: Page number (default: 1)
- `limit`: Number of activities per page (default: 50, max: 100)
- `startDate`: Filter activities from this date (ISO format)
- `endDate`: Filter activities until this date (ISO format)

## Testing the API

### Using curl

```bash
# Test with API token
curl -H "Authorization: Bearer test_hiking_journal_token_2024" \
     http://localhost:3000/api/activities

# Test with pagination
curl -H "Authorization: Bearer test_hiking_journal_token_2024" \
     "http://localhost:3000/api/activities?page=1&limit=10"

# Test with date filtering
curl -H "Authorization: Bearer test_hiking_journal_token_2024" \
     "http://localhost:3000/api/activities?startDate=2025-01-01&endDate=2025-12-31"
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/activities', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test_hiking_journal_token_2024',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data); // Array of hiking activities
```

## Integration with Health-First App

### Step 1: Update Health-First App Configuration

In your Health-First app, update the API configuration to use your Hiking Journal endpoint:

```javascript
// In health-tracker/src/app/api/sync-exercise/route.ts
const hikingResponse = await fetch('http://localhost:3000/api/activities', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test_hiking_journal_token_2024',
    'Content-Type': 'application/json'
  },
  signal: AbortSignal.timeout(10000),
});
```

### Step 2: Data Transformation

The Health-First app should transform the hiking data into its internal format:

```javascript
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
  elevation: activity.elevation,
  location: activity.location.name,
  weather: activity.weather,
  difficulty: activity.difficulty,
  mood: activity.mood,
  notes: activity.notes,
  tags: activity.tags,
  photos: activity.photos
}));
```

## Production Deployment

### 1. Deploy Your Hiking Journal App

Deploy your app to Vercel, Netlify, or your preferred hosting platform.

### 2. Update API URL

Update the Health-First app to use your deployed URL:

```javascript
const hikingResponse = await fetch('https://your-hiking-journal-app.vercel.app/api/activities', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test_hiking_journal_token_2024',
    'Content-Type': 'application/json'
  },
  signal: AbortSignal.timeout(10000),
});
```

### 3. Environment Variables

Add your API tokens to environment variables:

```bash
# In your Hiking Journal app's .env.local
VALID_API_TOKENS=test_hiking_journal_token_2024,aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0
```

## Security Considerations

1. **API Token Management**: Store API tokens securely in environment variables
2. **Rate Limiting**: Consider implementing rate limiting for production use
3. **CORS**: Configure CORS if needed for cross-origin requests
4. **HTTPS**: Always use HTTPS for production API communication
5. **User Isolation**: Ensure users can only access their own data

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `401`: Unauthorized (invalid or missing token)
- `404`: Activity not found
- `500`: Internal server error

## Monitoring and Logging

The API includes comprehensive logging:

```javascript
console.log('Valid API token used:', token);
console.error('Error fetching activities:', error);
```

## Next Steps

1. **Test the Integration**: Use the provided curl commands to test the API
2. **Update Health-First App**: Modify the Health-First app to use your API endpoint
3. **Deploy**: Deploy both apps to production
4. **Monitor**: Monitor the integration for any issues

## Support

If you encounter any issues:

1. Check the browser's Network tab for API requests
2. Review server logs for error messages
3. Verify API token authentication
4. Ensure the data format matches expectations

Your Hiking Journal API is now ready for integration with the Health-First app! 🏔️ 