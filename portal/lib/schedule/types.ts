export interface DayPost {
  id: string;
  label: string;
  caption: string;
  /** Public or signed URL for the asset (e.g. Supabase). */
  assetUrl: string | null;
  assetFileName: string | null;
}

export interface DaySchedule {
  id: string;
  dayLabel: string;
  posts: DayPost[];
}

export interface WeekSchedule {
  clientSlug: string;
  clientDisplayName: string;
  weekLabel: string;
  days: DaySchedule[];
}
