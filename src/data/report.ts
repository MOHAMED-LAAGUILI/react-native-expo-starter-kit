export type ReportRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ReportProject = {
  project: string;
  hours: number;
  color: string;
};

/** One bucket of the selected range, split by how the time was booked. */
export type ReportTrendPoint = {
  label: string;
  billable: number;
  internal: number;
  overtime: number;
};

/** Velocity of a closed sprint, measured in delivered hours. */
export type ReportSprint = {
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
};

/** A teammate's output over the current quarter. */
export type ReportTeamMember = {
  name: string;
  tasks: number;
  hours: number;
  reviews: number;
  color: string;
};

/** Hours logged during one calendar week, Monday first. */
export type ReportActivityWeek = {
  label: string;
  hours: number[];
};

/** A quarterly objective and how far it has been met, in percent. */
export type ReportGoal = {
  label: string;
  percent: number;
  color: string;
};

/** How the logged hours break down by kind of work. */
export type ReportWorkItem = {
  label: string;
  hours: number;
  color: string;
};

export const reportWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const projectData: ReportProject[] = [
  { project: 'Project Alpha', hours: 42, color: '#6366f1' },
  { project: 'Project Beta', hours: 28, color: '#f59e0b' },
  { project: 'Project Gamma', hours: 18, color: '#10b981' },
  { project: 'Project Delta', hours: 12, color: '#ef4444' },
];

/** Buckets differ per range, so each range ships its own labelled series. */
export const hoursTrend: Record<ReportRange, ReportTrendPoint[]> = {
  daily: [
    { label: '9a', billable: 1.5, internal: 0.5, overtime: 0 },
    { label: '11a', billable: 1.8, internal: 0.2, overtime: 0 },
    { label: '1p', billable: 1.2, internal: 0.6, overtime: 0 },
    { label: '3p', billable: 1.9, internal: 0.1, overtime: 0 },
    { label: '5p', billable: 1.4, internal: 0.3, overtime: 0.3 },
    { label: '7p', billable: 0.6, internal: 0.1, overtime: 0.8 },
  ],
  weekly: [
    { label: 'Mon', billable: 5.5, internal: 1.5, overtime: 0 },
    { label: 'Tue', billable: 6.2, internal: 1, overtime: 0.5 },
    { label: 'Wed', billable: 7, internal: 0.8, overtime: 1 },
    { label: 'Thu', billable: 6.4, internal: 1.2, overtime: 0.4 },
    { label: 'Fri', billable: 5.1, internal: 1.9, overtime: 0 },
    { label: 'Sat', billable: 1.2, internal: 0.3, overtime: 0.6 },
    { label: 'Sun', billable: 0, internal: 0.4, overtime: 0 },
  ],
  monthly: [
    { label: 'W1', billable: 26, internal: 7, overtime: 2 },
    { label: 'W2', billable: 31, internal: 5, overtime: 3 },
    { label: 'W3', billable: 28, internal: 9, overtime: 1 },
    { label: 'W4', billable: 34, internal: 4, overtime: 5 },
  ],
  yearly: [
    { label: 'Q1', billable: 312, internal: 74, overtime: 21 },
    { label: 'Q2', billable: 348, internal: 62, overtime: 30 },
    { label: 'Q3', billable: 295, internal: 88, overtime: 18 },
    { label: 'Q4', billable: 361, internal: 57, overtime: 42 },
  ],
};

/** Colours for the three booking types shared by the trend charts. */
export const trendSeriesColors = {
  billable: '#6366f1',
  internal: '#0ea5e9',
  overtime: '#f59e0b',
};

export const sprintVelocity: ReportSprint[] = [
  { label: 'S1', open: 62, close: 74, high: 78, low: 58 },
  { label: 'S2', open: 74, close: 69, high: 80, low: 65 },
  { label: 'S3', open: 69, close: 82, high: 86, low: 67 },
  { label: 'S4', open: 82, close: 77, high: 88, low: 74 },
  { label: 'S5', open: 77, close: 91, high: 94, low: 75 },
];

export const teamThroughput: ReportTeamMember[] = [
  { name: 'Priya', tasks: 31, hours: 42, reviews: 9, color: '#6366f1' },
  { name: 'Dana', tasks: 24, hours: 38, reviews: 6, color: '#f59e0b' },
  { name: 'Alex', tasks: 27, hours: 35, reviews: 5, color: '#10b981' },
  { name: 'Milo', tasks: 18, hours: 31, reviews: 4, color: '#0ea5e9' },
  { name: 'Sam', tasks: 12, hours: 22, reviews: 3, color: '#ec4899' },
];

export const activityHeatmap: ReportActivityWeek[] = [
  { label: 'W1', hours: [6, 7, 8, 6, 5, 1, 0] },
  { label: 'W2', hours: [7, 8, 7, 7, 6, 2, 0] },
  { label: 'W3', hours: [5, 6, 9, 8, 7, 0, 0] },
  { label: 'W4', hours: [8, 7, 6, 9, 4, 3, 1] },
  { label: 'W5', hours: [6, 9, 8, 7, 6, 0, 0] },
];

export const goalProgress: ReportGoal[] = [
  { label: 'Billable target', percent: 82, color: '#6366f1' },
  { label: 'Sprint scope', percent: 64, color: '#f59e0b' },
  { label: 'Review SLA', percent: 91, color: '#10b981' },
  { label: 'Docs coverage', percent: 47, color: '#ec4899' },
];

export const workBreakdown: ReportWorkItem[] = [
  { label: 'Feature work', hours: 58, color: '#6366f1' },
  { label: 'Bug fixes', hours: 26, color: '#ef4444' },
  { label: 'Meetings', hours: 22, color: '#f59e0b' },
  { label: 'Code review', hours: 18, color: '#10b981' },
  { label: 'Planning', hours: 12, color: '#0ea5e9' },
  { label: 'Support', hours: 9, color: '#ec4899' },
];

/** Total hours booked in a trend bucket, across every booking type. */
export function trendTotal(point: ReportTrendPoint) {
  return point.billable + point.internal + point.overtime;
}
