import { Schema, model, type Document } from 'mongoose';

// One document per calendar month, keyed by 'YYYY-MM'.
// count is incremented each time a real RentCast API call is made.

export interface ICallCounter extends Document {
  month: string;
  count: number;
}

const CallCounterSchema = new Schema<ICallCounter>({
  month:  { type: String, required: true, unique: true },
  count:  { type: Number, required: true, default: 0 },
});

export const CallCounter = model<ICallCounter>('CallCounter', CallCounterSchema);

export const FREE_TIER_LIMIT = 50;

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Returns current count. Throws if at or over the limit. */
export async function checkAndIncrement(): Promise<number> {
  const month = currentMonth();

  // Find or create the counter for this month
  const counter = await CallCounter.findOneAndUpdate(
    { month },
    { $setOnInsert: { month, count: 0 } },
    { upsert: true, new: true }
  );

  if (counter.count >= FREE_TIER_LIMIT) {
    throw new Error(
      `Monthly API limit reached (${counter.count}/${FREE_TIER_LIMIT} calls used). Resets on the 1st of next month.`
    );
  }

  // Increment atomically
  const updated = await CallCounter.findOneAndUpdate(
    { month, count: { $lt: FREE_TIER_LIMIT } },
    { $inc: { count: 1 } },
    { new: true }
  );

  // If updated is null, another request beat us to the limit
  if (!updated) {
    throw new Error(
      `Monthly API limit reached (${FREE_TIER_LIMIT}/${FREE_TIER_LIMIT} calls used). Resets on the 1st of next month.`
    );
  }

  return updated.count;
}

export async function getCount(): Promise<{ count: number; limit: number; remaining: number }> {
  const month = currentMonth();
  const counter = await CallCounter.findOne({ month });
  const count = counter?.count ?? 0;
  return { count, limit: FREE_TIER_LIMIT, remaining: FREE_TIER_LIMIT - count };
}
