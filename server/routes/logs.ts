import { Router, type Request, type Response } from 'express';
import { ApiLog } from '../models/ApiLog.js';

const router = Router();

// GET /api/logs?limit=50&endpoint=listings
router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const filter: Record<string, unknown> = {};
  if (req.query.endpoint) filter.endpoint = req.query.endpoint;

  const logs = await ApiLog.find(filter)
    .sort({ calledAt: -1 })
    .limit(limit)
    .lean();

  res.json(logs);
});

export default router;
