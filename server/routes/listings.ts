import { Router, type Request, type Response } from 'express';
import axios from 'axios';
import { isMongoAvailable } from '../db.js';
import { ListingsCache } from '../models/ListingsCache.js';
import { checkAndIncrement } from '../models/CallCounter.js';
import { ApiLog } from '../models/ApiLog.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const zipCode = req.query.zipCode as string;
  const start = Date.now();
  const mongo = isMongoAvailable();

  if (!zipCode || zipCode.length !== 5) {
    res.status(400).json({ error: 'zipCode must be a 5-digit string' });
    return;
  }

  // Check MongoDB cache first (skip if unavailable)
  if (mongo) {
    const cached = await ListingsCache.findOne({ zipCode });
    if (cached) {
      await ApiLog.create({ endpoint: 'listings', params: { zipCode }, cached: true, status: 'success', durationMs: Date.now() - start });
      res.json({ data: cached.data, cached: true, cachedAt: cached.fetchedAt });
      return;
    }
  }

  // Enforce monthly limit (skip if MongoDB unavailable — allow call but warn)
  if (mongo) {
    try {
      await checkAndIncrement();
    } catch (err) {
      await ApiLog.create({ endpoint: 'listings', params: { zipCode }, cached: false, status: 'blocked', errorMessage: (err as Error).message, durationMs: Date.now() - start });
      throw err;
    }
  }

  const { data } = await axios.get('https://api.rentcast.io/v1/listings/sale', {
    headers: { 'X-Api-Key': process.env.RENTCAST_API_KEY },
    params: { zipCode, status: 'Active', limit: Number(process.env.LISTINGS_LIMIT ?? 1) },
  });

  if (mongo) {
    await ListingsCache.findOneAndUpdate(
      { zipCode },
      { zipCode, data, fetchedAt: new Date() },
      { upsert: true }
    );
    await ApiLog.create({ endpoint: 'listings', params: { zipCode }, cached: false, status: 'success', durationMs: Date.now() - start });
  }

  res.json({ data, cached: false });
});

export default router;
