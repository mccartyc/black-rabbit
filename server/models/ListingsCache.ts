import { Schema, model, type Document } from 'mongoose';

export interface IListingsCache extends Document {
  zipCode: string;
  data: object[];
  fetchedAt: Date;
}

const ListingsCacheSchema = new Schema<IListingsCache>({
  zipCode:   { type: String, required: true, unique: true },
  data:      { type: [Schema.Types.Mixed], required: true },
  fetchedAt: { type: Date, required: true },
});

// Auto-expire documents after 24 hours
ListingsCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 86400 });

export const ListingsCache = model<IListingsCache>('ListingsCache', ListingsCacheSchema);
