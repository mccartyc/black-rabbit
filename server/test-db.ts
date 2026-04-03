import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI not set in .env');

console.log('Connecting to MongoDB...');

mongoose.connect(uri)
  .then((conn) => {
    console.log('✓ Connected successfully');
    console.log('  Host:', conn.connection.host);
    console.log('  DB:  ', conn.connection.name);
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('✓ Disconnected cleanly');
    process.exit(0);
  })
  .catch((err: Error) => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  });
