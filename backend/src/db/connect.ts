import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(uri);
      logger.info('Connected to MongoDB');
      return;
    } catch (err) {
      logger.warn(`MongoDB connection attempt ${attempt}/${maxAttempts} failed`, { error: String(err) });
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
