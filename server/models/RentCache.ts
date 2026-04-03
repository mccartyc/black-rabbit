import { Schema, model, type Document } from 'mongoose';

export interface IRentCache extends Document {
  listingId: string;
  data: object;
  fetchedAt: Date;
}

const RentCacheSchema = new Schema<IRentCache>({
  listingId: { type: String, required: true, unique: true },
  data:      { type: Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, required: true },
});

// Auto-expire documents after 7 days
RentCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 604800 });

export const RentCache = model<IRentCache>('RentCache', RentCacheSchema);
