import { Router, type Request, type Response } from 'express';
import axios from 'axios';
import { isMongoAvailable } from '../db.js';
import { ListingsCache } from '../models/ListingsCache.js';
import { checkAndIncrement } from '../models/CallCounter.js';
import { ApiLog } from '../models/ApiLog.js';

const router = Router();

const RESIDENTIAL_TYPES = 'Single Family,Multi Family';

// Keywords that indicate a builder/new-construction listing
const BUILDER_KEYWORDS = [
  'builder', 'construction', 'new home', 'homes by', 'communities',
  'development', 'homebuilder', 'built by', 'new build',
];

function isBuilderListing(listing: Record<string, unknown>): boolean {
  const currentYear = new Date().getFullYear();

  if (listing.yearBuilt === currentYear) return true;

  const listingType = String(listing.listingType ?? '').toLowerCase();
  if (listingType.includes('new construction') || listingType.includes('builder')) return true;

  const officeName = String((listing.listingOffice as Record<string, unknown> | undefined)?.name ?? '').toLowerCase();
  const agentName = String((listing.listingAgent as Record<string, unknown> | undefined)?.name ?? '').toLowerCase();

  return BUILDER_KEYWORDS.some(kw => officeName.includes(kw) || agentName.includes(kw));
}

router.get('/', async (req: Request, res: Response) => {
  const zipCode = req.query.zipCode as string;
  const start = Date.now();
  const mongo = isMongoAvailable();
  const resultsLimit = Number(process.env.LISTINGS_LIMIT ?? 3);

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

  // Enforce monthly limit (skip if MongoDB unavailable)
  if (mongo) {
    try {
      await checkAndIncrement();
    } catch (err) {
      await ApiLog.create({ endpoint: 'listings', params: { zipCode }, cached: false, status: 'blocked', errorMessage: (err as Error).message, durationMs: Date.now() - start });
      throw err;
    }
  }

  // Fetch extra from RentCast to have buffer after filtering out builder listings
  const fetchLimit = resultsLimit * 4;

  const { data: raw } = await axios.get<Record<string, unknown>[]>('https://api.rentcast.io/v1/listings/sale', {
    headers: { 'X-Api-Key': process.env.RENTCAST_API_KEY },
    params: {
      zipCode,
      status: 'Active',
      propertyType: RESIDENTIAL_TYPES,
      limit: fetchLimit,
    },
  });

  const data = raw
    .filter(listing => !isBuilderListing(listing))
    .slice(0, resultsLimit);

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
