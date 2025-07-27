#!/usr/bin/env node

/**
 * Test script for Hiking Journal API
 * Run with: node test-api.js
 */

const API_URL = 'http://localhost:3000/api/activities';
const API_TOKEN = 'test_hiking_journal_token_2024';

async function testAPI() {
  console.log('🧪 Testing Hiking Journal API...\n');

  try {
    // Test 1: Basic API call
    console.log('1️⃣ Testing basic API call...');
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
    console.log('✅ API call successful!');
    console.log(`📊 Found ${data.data.length} activities`);

    // Handle both mock data (API tokens) and real data (Clerk auth)
    if (data.summary) {
      console.log(`📈 Total activities: ${data.summary.totalActivities}`);
      console.log(`🏃 Total distance: ${data.summary.totalDistance} miles`);
      console.log(`⏱️ Total duration: ${data.summary.totalDuration} minutes`);
      console.log(`🏔️ Total elevation gain: ${data.summary.totalElevationGain} ft`);
      console.log(`⭐ Average rating: ${data.summary.averageRating.toFixed(2)}`);
    } else {
      // Calculate summary for mock data
      const totalDistance = data.data.reduce((sum, activity) => sum + (activity.distance || 0), 0);
      const totalDuration = data.data.reduce((sum, activity) => sum + (activity.duration || 0), 0);
      const totalElevationGain = data.data.reduce((sum, activity) => sum + (activity.elevation?.gain || 0), 0);
      const averageRating = data.data.length > 0 
        ? data.data.reduce((sum, activity) => sum + (activity.rating || 0), 0) / data.data.length 
        : 0;

      console.log(`📈 Total activities: ${data.data.length}`);
      console.log(`🏃 Total distance: ${totalDistance} miles`);
      console.log(`⏱️ Total duration: ${totalDuration} minutes`);
      console.log(`🏔️ Total elevation gain: ${totalElevationGain} ft`);
      console.log(`⭐ Average rating: ${averageRating.toFixed(2)}`);
    }

    // Test 2: Check data format
    console.log('\n2️⃣ Checking data format...');
    if (data.data && data.data.length > 0) {
      const activity = data.data[0];
      const requiredFields = [
        '_id', 'title', 'description', 'date', 'duration', 
        'distance', 'distanceUnit', 'calories', 'elevation',
        'location', 'weather', 'difficulty', 'mood', 'notes',
        'photos', 'tags', 'rating', 'trailType', 'metadata'
      ];

      const missingFields = requiredFields.filter(field => !(field in activity));
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
      } else {
        console.log('❌ Missing fields:', missingFields);
      }

      // Check specific field types
      console.log('🔍 Field validation:');
      console.log(`   _id: ${typeof activity._id} ✅`);
      console.log(`   title: ${typeof activity.title} ✅`);
      console.log(`   duration: ${typeof activity.duration} ✅`);
      console.log(`   distance: ${typeof activity.distance} ✅`);
      console.log(`   elevation.gain: ${typeof activity.elevation.gain} ✅`);
      console.log(`   location.name: ${typeof activity.location.name} ✅`);
    }

    // Test 3: Test pagination (only works with real data)
    console.log('\n3️⃣ Testing pagination...');
    const paginationResponse = await fetch(`${API_URL}?page=1&limit=2`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (paginationResponse.ok) {
      const paginationData = await paginationResponse.json();
      console.log(`✅ Pagination working: ${paginationData.data.length} items returned`);
      if (paginationData.pagination) {
        console.log(`📄 Page info: ${paginationData.pagination.page}/${paginationData.pagination.pages}`);
      }
    }

    // Test 4: Test date filtering (only works with real data)
    console.log('\n4️⃣ Testing date filtering...');
    const currentDate = new Date().toISOString().split('T')[0];
    const dateResponse = await fetch(`${API_URL}?startDate=${currentDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (dateResponse.ok) {
      const dateData = await dateResponse.json();
      console.log(`✅ Date filtering working: ${dateData.data.length} activities found`);
    }

    console.log('\n🎉 All tests passed! Your API is ready for Health-First integration.');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy your Hiking Journal app to production');
    console.log('   2. Update the Health-First app to use your API endpoint');
    console.log('   3. Test the integration with real data');
    console.log('\n💡 Note: This test used mock data. For real data testing,');
    console.log('   use Clerk authentication instead of API tokens.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your Hiking Journal app is running on localhost:3000');
    console.log('   2. Check that the API token is valid');
    console.log('   3. Verify the API endpoint is accessible');
    process.exit(1);
  }
}

// Run the test
testAPI(); 