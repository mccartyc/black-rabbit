import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import listingsRouter from './routes/listings.js';
import rentEstimateRouter from './routes/rentEstimate.js';
import callCountRouter from './routes/callCount.js';
import logsRouter from './routes/logs.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/listings', listingsRouter);
app.use('/api/rent-estimate', rentEstimateRouter);
app.use('/api/call-count', callCountRouter);
app.use('/api/logs', logsRouter);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const isLimitError = err.message.includes('Monthly API limit reached');
  res.status(isLimitError ? 429 : 500).json({ error: err.message });
});

// Start listening immediately so Vite proxy doesn't get ECONNREFUSED
// while MongoDB is still connecting
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Connect to MongoDB in the background (non-fatal if unavailable)
connectDB();
