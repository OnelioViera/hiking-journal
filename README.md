# 🏔️ Hiking Journal App

A modern web application for documenting hiking adventures and outdoor experiences. Built with Next.js 14, Tailwind CSS v4, MongoDB Atlas, and Clerk authentication.

## ✨ Features

- **User Authentication**: Secure sign-in with Clerk
- **Journal Entries**: Create, edit, and manage hiking entries
- **Photo Management**: Upload and organize photos with Cloudinary
- **Search & Filtering**: Find entries by location, difficulty, and tags
- **Responsive Design**: Works perfectly on desktop and mobile
- **Interactive Maps**: View and plot hiking locations
- **Statistics Dashboard**: Track your hiking progress
- **API Integration**: Complete REST API for external app integration

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hiking-journal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# App URL (for API documentation)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up External Services

#### Clerk Authentication
1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable key and secret key
4. Add them to your `.env.local` file

#### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env.local` file

#### Cloudinary
1. Create a Cloudinary account
2. Get your cloud name, API key, and secret
3. Add them to your `.env.local` file

#### Mapbox
1. Create a Mapbox account
2. Get your access token
3. Add it to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
hiking-journal/
├── app/
│   ├── api/
│   │   ├── activities/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── summary/
│   │   │   │   └── route.ts
│   │   │   └── docs/
│   │   │       └── route.ts
│   │   ├── entries/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── health/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── api-test/
│   │   └── page.tsx
│   ├── entries/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/
│   │           └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── forms/
│   │   └── EntryForm.tsx
│   ├── layout/
│   │   └── Header.tsx
│   └── SetupGuide.tsx
├── lib/
│   ├── mongodb.ts
│   └── cloudinary.ts
├── models/
│   ├── User.ts
│   └── JournalEntry.ts
└── public/
```

## 🔌 API Integration

The Hiking Journal app provides a complete REST API that allows other applications to access hiking data. This enables integration with health tracking apps, fitness platforms, and other outdoor applications.

### API Endpoints

#### Core Endpoints
- `GET /api/activities` - List hiking activities
- `GET /api/activities/{id}` - Get specific activity
- `POST /api/activities` - Create new activity
- `PUT /api/activities/{id}` - Update activity
- `DELETE /api/activities/{id}` - Delete activity

#### Utility Endpoints
- `GET /api/activities/summary` - Get aggregated statistics
- `GET /api/activities/docs` - API documentation
- `GET /api/health` - Health check

### Authentication

All API endpoints require authentication via Clerk. Include the user's session token in the Authorization header.

### Data Format

Activities are automatically transformed from journal entries with the following structure:

```json
{
  "id": "activity_id",
  "title": "Hike Title",
  "description": "Hike description",
  "date": "2024-01-15T10:00:00.000Z",
  "duration": 180,
  "distance": 5.2,
  "type": "hiking",
  "location": "Trail Name",
  "difficulty": "moderate",
  "elevationGain": 800,
  "trailType": "out-and-back",
  "weather": {
    "temperature": 65,
    "conditions": "sunny",
    "windSpeed": 10,
    "humidity": 45
  },
  "rating": 4,
  "tags": ["scenic", "wildlife"],
  "photos": [...],
  "metadata": {...}
}
```

### Testing the API

Visit `/api-test` in your browser to test all API endpoints and verify they're working correctly.

### Integration Examples

#### Health Tracking App Integration
```javascript
// Fetch user's hiking activities
const response = await fetch('/api/activities?limit=50', {
  headers: {
    'Authorization': 'Bearer user_session_token'
  }
});
const activities = await response.json();
```

#### Statistics Integration
```javascript
// Get monthly hiking statistics
const response = await fetch('/api/activities/summary?period=month', {
  headers: {
    'Authorization': 'Bearer user_session_token'
  }
});
const stats = await response.json();
```

## 🔧 Core Features

### Authentication
- Clerk integration for secure authentication
- Protected routes and API endpoints
- User session management

### Journal Entries
- Create, read, update, and delete entries
- Rich form with trail information, weather data, and photos
- Search and filtering capabilities
- Pagination for large datasets

### Photo Management
- Cloudinary integration for image uploads
- Automatic image optimization
- Secure file storage

### Database Models
- User model with preferences
- Journal Entry model with comprehensive hiking data
- Proper TypeScript interfaces

### API Integration
- RESTful API design
- Comprehensive activity data transformation
- Real-time statistics and trends
- Health monitoring and documentation

## 🎨 UI Components

### Responsive Design
- Mobile-first approach
- Tailwind CSS v4 for styling
- Modern, clean interface

### Navigation
- Header with authentication status
- Mobile menu support
- Breadcrumb navigation

### Forms
- Comprehensive entry form
- Form validation
- Loading states
- Error handling

## 🔒 Security Features

- Input validation and sanitization
- Authentication on all protected routes
- Secure file uploads
- Environment variable protection
- CORS configuration
- API rate limiting

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Test API endpoints
npm run dev
# Then visit http://localhost:3000/api-test
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all the environment variables in your production environment:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## 📱 Key Features to Implement

### Phase 1: Core Features ✅
- [x] User authentication and registration
- [x] Create, read, update, delete journal entries
- [x] Photo upload and management
- [x] Basic search and filtering
- [x] Responsive design
- [x] API integration for external apps

### Phase 2: Enhanced Features
- [ ] Interactive maps with trail plotting
- [ ] Weather API integration
- [ ] Statistics dashboard
- [ ] Export functionality (PDF, CSV)
- [ ] Social features (sharing, comments)

### Phase 3: Advanced Features
- [ ] Offline capability with PWA
- [ ] Mobile app with React Native
- [ ] GPS tracking integration
- [ ] Machine learning for trail recommendations
- [ ] Advanced analytics and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Clerk](https://clerk.com/) for authentication
- [MongoDB](https://www.mongodb.com/) for the database
- [Cloudinary](https://cloudinary.com/) for image management
- [Tailwind CSS](https://tailwindcss.com/) for styling
