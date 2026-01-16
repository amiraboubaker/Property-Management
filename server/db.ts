import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URL) {
    console.warn("MONGODB_URL environment variable is not set. Application will run in memory-only mode.");
    return false;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn("Falling back to memory-only mode.");
    return false;
  }
}
