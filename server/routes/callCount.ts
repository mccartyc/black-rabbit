import { Router, type Request, type Response } from 'express';
import { isMongoAvailable } from '../db.js';
import { getCount } from '../models/CallCounter.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  if (!isMongoAvailable()) {
    res.json({ count: 0, limit: 50, remaining: 50, warning: 'MongoDB unavailable — call tracking disabled' });
    return;
  }
  const result = await getCount();
  res.json(result);
});

export default router;
