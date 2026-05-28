import type { useTranslations } from 'next-intl';
import * as z from 'zod';

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const LOCATIONS = ['Room 204', 'Room 101', 'Online'] as const;
export type ClassLocation = (typeof LOCATIONS)[number];

export const VISIBILITIES = ['public_enrollable', 'public_view', 'private'] as const;
export type ClassVisibility = (typeof VISIBILITIES)[number];

export type DaySchedule = {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
};

export type ClassFormValues = {
  courseId: string;
  label: string;
  teacherId: string;
  location: ClassLocation;
  daySchedules: DaySchedule[];
  startDate: string;
  endDate: string;
  capacity: number | '';
  visibility: ClassVisibility;
};

export const defaultValues: ClassFormValues = {
  courseId: '',
  label: 'A4',
  teacherId: '',
  location: 'Room 204',
  daySchedules: [
    { day: 'Mon', startTime: '09:00', endTime: '10:00' },
    { day: 'Wed', startTime: '09:00', endTime: '10:00' }
  ],
  startDate: '',
  endDate: '',
  capacity: 12,
  visibility: 'public_enrollable'
};

type ValidationT = ReturnType<typeof useTranslations>;

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Un-refined object schema — used for per-field validators via `.shape.X`.
export function buildBaseSchema(tValidation: ValidationT) {
  return z.object({
    courseId: z.string().min(1, tValidation('courseRequired')),
    label: z.string().trim().min(1, tValidation('labelRequired')),
    teacherId: z.string().min(1, tValidation('teacherRequired')),
    location: z.enum(LOCATIONS, { error: tValidation('locationRequired') }),
    daySchedules: z
      .array(
        z.object({
          day: z.enum(DAYS_OF_WEEK),
          startTime: z.string(),
          endTime: z.string()
        })
      )
      .min(1, tValidation('daysRequired'))
      .superRefine((arr, ctx) => {
        arr.forEach((s, i) => {
          if (!TIME_RE.test(s.startTime)) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'startTime'],
              message: tValidation('timeFormat')
            });
            return;
          }
          if (!TIME_RE.test(s.endTime)) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'endTime'],
              message: tValidation('timeFormat')
            });
            return;
          }
          if (toMinutes(s.endTime) <= toMinutes(s.startTime)) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'endTime'],
              message: tValidation('timeOrder')
            });
          }
        });
      }),
    startDate: z.string().min(1, tValidation('startDateRequired')),
    endDate: z.string().min(1, tValidation('endDateRequired')),
    capacity: z
      .number({ error: tValidation('capacityMin') })
      .int()
      .min(1, tValidation('capacityMin')),
    visibility: z.enum(VISIBILITIES, { error: tValidation('visibilityRequired') })
  });
}

export type BaseSchema = ReturnType<typeof buildBaseSchema>;

export function buildSchema(baseSchema: BaseSchema, tValidation: ValidationT) {
  return baseSchema.refine((v) => new Date(v.endDate).getTime() > new Date(v.startDate).getTime(), {
    path: ['endDate'],
    message: tValidation('dateOrder')
  });
}

// Local YYYY-MM-DD for today. Chronological comparison via string ordering
// works on `YYYY-MM-DD`, which dodges every timezone surprise the Date API
// invites (UTC midnight vs local midnight, etc.).
function todayYmd(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isFutureYmd(value: string): boolean {
  // Accept full ISO too in case an older stored value sneaks in — we only need
  // the date part for ordering.
  const ymd = value.length >= 10 ? value.slice(0, 10) : value;
  return ymd > todayYmd();
}

/**
 * Per-field validator for the CREATE form's startDate. Schema-level refines
 * only fire on submit; this attaches an onBlur check so the user sees
 * "must be after today" immediately when they pick a past date.
 */
export function buildStartDateCreateValidator(tValidation: ValidationT) {
  return z
    .string()
    .min(1, tValidation('startDateRequired'))
    .refine(isFutureYmd, { message: tValidation('startDateFuture') });
}

// CREATE-only: a brand-new class must start in the future. Edit doesn't enforce
// this universally (e.g. admin can leave a DRAFT class with a past startDate
// while still editing other fields). The BE re-checks via
// validateStartDateChange when the class has enrolments.
export function buildCreateSchema(baseSchema: BaseSchema, tValidation: ValidationT) {
  return buildSchema(baseSchema, tValidation).refine((v) => isFutureYmd(v.startDate), {
    path: ['startDate'],
    message: tValidation('startDateFuture')
  });
}

function toMinutes(time: string): number {
  const match = TIME_RE.exec(time);
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

// Sort daySchedules by their day's position in the week so the UI shows them
// Sun → Sat regardless of the order the user picked them.
const DAY_INDEX = new Map(DAYS_OF_WEEK.map((d, i) => [d, i]));
export function sortDaySchedules(arr: DaySchedule[]): DaySchedule[] {
  return arr.toSorted((a, b) => (DAY_INDEX.get(a.day) ?? 0) - (DAY_INDEX.get(b.day) ?? 0));
}
