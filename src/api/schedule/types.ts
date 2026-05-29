export const SCHEDULE_CATEGORIES = ['scratch', 'python', 'web', 'robotics', 'game_ai'] as const;
export type ScheduleEventCategory = (typeof SCHEDULE_CATEGORIES)[number];

export const SCHEDULE_VIEWS = ['week', 'day', 'month'] as const;
export type ScheduleView = (typeof SCHEDULE_VIEWS)[number];

export function isScheduleView(value: string | null | undefined): value is ScheduleView {
  return !!value && (SCHEDULE_VIEWS as readonly string[]).includes(value);
}

export type ScheduleEvent = {
  id: string;
  classId?: string;
  teacherId?: string;
  /** 0 = Mon … 6 = Sun for week view; 0 = single day for day view. */
  dayIndex: number;
  /** Minutes from 08:00 baseline. */
  startOffsetMin: number;
  durationMin: number;
  title: string;
  detail: string;
  timeLabel?: string;
  location?: string;
  category: ScheduleEventCategory;
};

export type ScheduleDay = {
  short: string;
  date: number;
  isToday?: boolean;
  isoDate: string;
};

export type ScheduleSummary = {
  weekLabel: string;
  monthLabel: string;
  todayLabel?: string;
  weekStart: string;
  weekEnd: string;
  totalSessions: number;
  totalTeachers: number;
  totalStudentHours: number;
};

export type ScheduleOption = {
  id: string;
  label: string;
};

export type ScheduleFilters = {
  teachers: ScheduleOption[];
  classes: ScheduleOption[];
  locations: ScheduleOption[];
};

export type ScheduleWeek = {
  summary: ScheduleSummary;
  days: ScheduleDay[];
  events: ScheduleEvent[];
};

export type ScheduleMonthCell = {
  isoDate: string;
  date: number;
  inMonth: boolean;
  isToday?: boolean;
  eventCount: number;
  events: ScheduleEvent[];
};

export type ScheduleMonthWeek = {
  cells: ScheduleMonthCell[];
};

export type ScheduleMonth = {
  summary: ScheduleSummary;
  weekdayHeaders: string[];
  weeks: ScheduleMonthWeek[];
};

export type ScheduleParams = {
  /** Anchor date (YYYY-MM-DD). Week: any day in the target week. Day: the target date. Month: any day in target month. */
  anchor?: string;
  view?: ScheduleView;
  teacherId?: string;
  classId?: string;
  location?: string;
};
