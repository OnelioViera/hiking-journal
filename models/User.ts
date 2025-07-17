import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  preferences: {
    units: 'metric' | 'imperial';
    defaultPrivacy: 'public' | 'private';
  };
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  createdAt: { type: Date, default: Date.now },
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    defaultPrivacy: { type: String, enum: ['public', 'private'], default: 'private' }
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 