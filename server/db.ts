import mongoose from 'mongoose';

let mongoAvailable = false;

export function isMongoAvailable(): boolean {
  return mongoAvailable;
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set — running without MongoDB');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    mongoAvailable = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB unavailable (firewall/network?) — running without cache or call tracking.');
    console.warn('Cause:', (err as Error).message.split('\n')[0]);
  }
}
