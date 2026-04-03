import 'dotenv/config';
import mongoose from 'mongoose';
import { CallCounter, currentMonth } from './models/CallCounter.js';

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    await CallCounter.findOneAndUpdate(
      { month: currentMonth() },
      { month: currentMonth(), count: 0 },
      { upsert: true, new: true }
    );
    console.log('✓ Reset count to 0');
    await mongoose.disconnect();
  });
