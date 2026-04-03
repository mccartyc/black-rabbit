import { Schema, model, type Document } from 'mongoose';

export type ApiEndpoint = 'listings' | 'rent-estimate';
export type ApiStatus = 'success' | 'error' | 'blocked';

export interface IApiLog extends Document {
  endpoint: ApiEndpoint;
  params: Record<string, unknown>;
  cached: boolean;
  status: ApiStatus;
  errorMessage?: string;
  durationMs?: number;
  calledAt: Date;
}

const ApiLogSchema = new Schema<IApiLog>({
  endpoint:     { type: String, required: true },
  params:       { type: Schema.Types.Mixed, required: true },
  cached:       { type: Boolean, required: true },
  status:       { type: String, required: true },
  errorMessage: { type: String },
  durationMs:   { type: Number },
  calledAt:     { type: Date, required: true, default: Date.now },
});

// Keep logs for 90 days then auto-expire
ApiLogSchema.index({ calledAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
// Index for efficient queries by endpoint and date
ApiLogSchema.index({ endpoint: 1, calledAt: -1 });

export const ApiLog = model<IApiLog>('ApiLog', ApiLogSchema);
