import 'dotenv/config';
import mongoose from 'mongoose';
import { ListingsCache } from './models/ListingsCache.js';

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    const result = await ListingsCache.deleteMany({});
    console.log(`✓ Cleared ${result.deletedCount} cached listing(s)`);
    await mongoose.disconnect();
  });
