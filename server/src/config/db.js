import mongoose from 'mongoose';

export let isDbConnected = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisanmitra';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isDbConnected = true;
    console.log('MongoDB Connected successfully');
  } catch (err) {
    isDbConnected = false;
    console.warn('MongoDB connection failed. Using in-memory database store for Phase 1 session:', err.message);
  }
}
