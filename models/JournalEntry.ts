import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto {
  url: string;
  publicId: string;
  caption?: string;
  timestamp: Date;
}

export interface ILocation {
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  elevation?: number;
  trailhead?: string;
}

export interface ITrail {
  name?: string;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  distance?: number;
  duration?: number; // in minutes
  elevationGain?: number;
  type?: 'loop' | 'out-and-back' | 'lollipop' | 'point-to-point' | 'other';
}

export interface IWeather {
  temperature?: number;
  conditions?: string;
  windSpeed?: number;
  humidity?: number;
}

export interface IJournalEntry extends Document {
  userId: string; // Changed from mongoose.Types.ObjectId to string for Clerk
  title: string;
  description: string;
  date: Date;
  location: ILocation;
  trail: ITrail;
  weather: IWeather;
  photos: IPhoto[];
  tags: string[];
  rating: number;
  privacy: 'public' | 'private';
  status: 'draft' | 'completed'; // New field to track entry status
  createdAt: Date;
  updatedAt: Date;
}

const journalEntrySchema = new Schema<IJournalEntry>({
  userId: { type: String, required: true }, // Changed from ObjectId to String
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: {
    name: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    elevation: Number,
    trailhead: String
  },
  trail: {
    name: String,
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard', 'expert'] },
    distance: Number,
    duration: Number, // in minutes
    elevationGain: Number,
    type: { type: String, enum: ['loop', 'out-and-back', 'lollipop', 'point-to-point', 'other'] }
  },
  weather: {
    temperature: Number,
    conditions: String,
    windSpeed: Number,
    humidity: Number
  },
  photos: [{
    url: String,
    publicId: String,
    caption: String,
    timestamp: { type: Date, default: Date.now }
  }],
  tags: [String],
  rating: { type: Number, min: 1, max: 5, default: 3 },
  privacy: { type: String, enum: ['public', 'private'], default: 'private' },
  status: { type: String, enum: ['draft', 'completed'], default: 'draft' }, // Added status field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema); 