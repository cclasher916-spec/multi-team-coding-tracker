import { DailyTotal } from '../types';

export function attachBatchToRecords(data: DailyTotal[], batchResolver?: (r: DailyTotal) => string | undefined) {
  // Helper to tag records with batch if resolvable
  return data.map((r) => ({
    ...r,
    // Prefer explicit resolver, else try to pick from memberId/email patterns if you add later
    batch: batchResolver ? batchResolver(r) : (r as any).batch,
  })) as DailyTotal[];
}
