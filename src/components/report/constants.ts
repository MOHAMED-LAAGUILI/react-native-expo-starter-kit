import type { ReportRange } from '@/data/report';

/** Ranges the report can be sliced by, in the order the tab bar shows them. */
export const reportRanges: ReportRange[] = ['daily', 'weekly', 'monthly', 'yearly'];

/** How a daily figure scales when the report is widened to a longer range. */
export const reportRangeMultiplier: Record<ReportRange, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};
