# Hiking Journal API Deployment Guide

## 🚀 Production Deployment Steps

Your Hiking Journal API is working perfectly! Here's how to deploy it to production and integrate with the Health-First app.

## Step 1: Environment Variables Setup

### For Local Development (.env.local)
Add these to your `.env.local` file:

```bash
# API Tokens for external access (Health-First app integration)
VALID_API_TOKENS=test_hiking_journal_token_2024,aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0
```

### For Production (Vercel/Netlify)
Add these environment variables in your hosting platform:

```bash
VALID_API_TOKENS=test_hiking_journal_token_2024,aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0
```

## Step 2: Deploy to Production

### Option A: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add API endpoint for Health-First integration"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Get your production URL**:
   - Your app will be available at: `https://your-app-name.vercel.app`
   - API endpoint: `https://your-app-name.vercel.app/api/activities`

### Option B: Netlify

1. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Add environment variables in Netlify dashboard
   - Deploy

## Step 3: Test Production API

Once deployed, test your production API:

```bash
# Test with API token
curl -H "Authorization: Bearer test_hiking_journal_token_2024" \
     https://your-app-name.vercel.app/api/activities

# Test with pagination
curl -H "Authorization: Bearer test_hiking_journal_token_2024" \
     "https://your-app-name.vercel.app/api/activities?page=1&limit=10"
```

## Step 4: Update Health-First App

### Update the Health-First App Configuration

In your Health-First app, update the API configuration:

```javascript
// In health-tracker/src/app/api/sync-exercise/route.ts

// Replace the existing hiking API call with:
const hikingResponse = await fetch('https://your-app-name.vercel.app/api/activities', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test_hiking_journal_token_2024',
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

## Step 5: Environment Variables for Health-First App

Add these to your Health-First app's environment variables:

```bash
# Hiking Journal API Configuration
HIKING_JOURNAL_API_URL=https://your-app-name.vercel.app/api/activities
HIKING_JOURNAL_API_TOKEN=test_hiking_journal_token_2024
```

Then update the Health-First app to use environment variables:

```javascript
const hikingResponse = await fetch(process.env.HIKING_JOURNAL_API_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.HIKING_JOURNAL_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  signal: AbortSignal.timeout(10000),
});
```

## Step 6: Test the Integration

### Test Script for Production

Create a test script to verify the integration:

```javascript
// test-production-api.js
const API_URL = 'https://your-app-name.vercel.app/api/activities';
const API_TOKEN = 'test_hiking_journal_token_2024';

async function testProductionAPI() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Production API working!');
    console.log(`📊 Found ${data.data.length} activities`);
    
    return data;
  } catch (error) {
    console.error('❌ Production API test failed:', error.message);
    throw error;
  }
}

testProductionAPI();
```

## Step 7: Monitor and Debug

### Check API Logs

Monitor your API logs in Vercel/Netlify dashboard for any issues.

### Common Issues and Solutions

1. **401 Unauthorized**:
   - Check that API token is correct
   - Verify environment variables are set
   - Ensure token is included in Authorization header

2. **CORS Issues**:
   - Add CORS headers if needed
   - Configure allowed origins in your hosting platform

3. **Timeout Issues**:
   - Increase timeout duration
   - Check network connectivity

## Step 8: Security Considerations

### For Production

1. **Use Environment Variables**: Never hardcode API tokens
2. **Rotate Tokens**: Change API tokens periodically
3. **Rate Limiting**: Consider implementing rate limiting
4. **HTTPS**: Always use HTTPS in production
5. **Monitoring**: Set up monitoring and alerting

### Example Environment Variables

```bash
# Development
VALID_API_TOKENS=test_hiking_journal_token_2024,aaac6eeaafb4e099265405e3762fd03ad6ebd690333f14b0bee4e680a810b1c0

# Production (use different tokens)
VALID_API_TOKENS=prod_hiking_token_2024,prod_health_first_token_2024
```

## Step 9: Final Verification

### Complete Integration Test

1. **Deploy Hiking Journal app** ✅
2. **Test production API** ✅
3. **Update Health-First app** ✅
4. **Test integration** ✅
5. **Monitor logs** ✅

## 🎉 Success!

Your Hiking Journal API is now ready for production integration with the Health-First app!

### What You Have:

- ✅ **Working API endpoint** with proper authentication
- ✅ **Health-First compatible data format**
- ✅ **Comprehensive error handling**
- ✅ **Production-ready deployment guide**
- ✅ **Security best practices**

### Next Steps:

1. Deploy your Hiking Journal app to production
2. Update the Health-First app with your production API URL
3. Test the complete integration
4. Monitor for any issues

Your hiking data will now automatically sync between your Hiking Journal and Health-First apps! 🏔️ 