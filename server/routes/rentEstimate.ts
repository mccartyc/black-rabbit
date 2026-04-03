import { Router, type Request, type Response } from 'express';
import axios from 'axios';
import { isMongoAvailable } from '../db.js';
import { RentCache } from '../models/RentCache.js';
import { checkAndIncrement } from '../models/CallCounter.js';
import { ApiLog } from '../models/ApiLog.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { listingId, address, propertyType, bedrooms, bathrooms, squareFootage } = req.query;
  const start = Date.now();
  const mongo = isMongoAvailable();
  const logParams = { listingId, address, propertyType, bedrooms, bathrooms };

  if (!listingId || !address || !propertyType || !bedrooms || !bathrooms) {
    res.status(400).json({ error: 'Missing required query params' });
    return;
  }

  // Check MongoDB cache first (skip if unavailable)
  if (mongo) {
    const cached = await RentCache.findOne({ listingId: listingId as string });
    if (cached) {
      await ApiLog.create({ endpoint: 'rent-estimate', params: logParams, cached: true, status: 'success', durationMs: Date.now() - start });
      res.json({ data: cached.data, cached: true, cachedAt: cached.fetchedAt });
      return;
    }
  }

  // Enforce monthly limit (skip if MongoDB unavailable)
  if (mongo) {
    try {
      await checkAndIncrement();
    } catch (err) {
      await ApiLog.create({ endpoint: 'rent-estimate', params: logParams, cached: false, status: 'blocked', errorMessage: (err as Error).message, durationMs: Date.now() - start });
      throw err;
    }
  }

  const params: Record<string, unknown> = {
    address,
    propertyType,
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
  };
  if (squareFootage) params.squareFootage = Number(squareFootage);

  const { data } = await axios.get('https://api.rentcast.io/v1/avm/rent/long-term', {
    headers: { 'X-Api-Key': process.env.RENTCAST_API_KEY },
    params,
  });

  if (mongo) {
    await RentCache.findOneAndUpdate(
      { listingId: listingId as string },
      { listingId, data, fetchedAt: new Date() },
      { upsert: true }
    );
    await ApiLog.create({ endpoint: 'rent-estimate', params: logParams, cached: false, status: 'success', durationMs: Date.now() - start });
  }

  res.json({ data, cached: false });
});

export default router;
