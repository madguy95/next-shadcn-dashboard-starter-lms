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
