// AvatarTone + avatarToneClass moved to @/constants/avatar (shared with api layer).
// Re-exported here for legacy importers — prefer the new path in new code.
import { avatarToneClass, type AvatarTone } from '@/constants/avatar';
export { avatarToneClass, type AvatarTone };

export type EnrollmentStatus = 'pending' | 'active' | 'waitlist' | 'rejected';

export const enrollmentStatusLabel: Record<EnrollmentStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  waitlist: 'Waitlist',
  rejected: 'Rejected'
};

export const enrollmentStatusClass: Record<EnrollmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  waitlist: 'bg-slate-50 text-slate-700 border-slate-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200'
};

export type RecentEnrollment = {
  id: string;
  studentName: string;
  initials: string;
  tone: AvatarTone;
  grade: number;
  age: number;
  course: string;
  channel: 'parent app' | 'website' | 'referral';
  submittedAt: string;
  status: EnrollmentStatus;
};

export const recentEnrollments: RecentEnrollment[] = [
  {
    id: 'ENR-2026-0843',
    studentName: 'Minh An Trần',
    initials: 'MA',
    tone: 'rose',
    grade: 4,
    age: 9,
    course: 'Scratch Foundations',
    channel: 'parent app',
    submittedAt: '2h ago',
    status: 'pending'
  },
  {
    id: 'ENR-2026-0842',
    studentName: 'Đăng Khoa Phạm',
    initials: 'DK',
    tone: 'sky',
    grade: 6,
    age: 11,
    course: 'Python for Kids · Lvl 2',
    channel: 'website',
    submittedAt: '3h ago',
    status: 'active'
  },
  {
    id: 'ENR-2026-0841',
    studentName: 'Quỳnh Hương Lê',
    initials: 'QH',
    tone: 'amber',
    grade: 5,
    age: 10,
    course: 'Web Design Studio',
    channel: 'referral',
    submittedAt: '5h ago',
    status: 'pending'
  },
  {
    id: 'ENR-2026-0840',
    studentName: 'Vĩnh Khang Đỗ',
    initials: 'VK',
    tone: 'emerald',
    grade: 7,
    age: 12,
    course: 'Robotics with Arduino',
    channel: 'website',
    submittedAt: 'yesterday',
    status: 'waitlist'
  },
  {
    id: 'ENR-2026-0839',
    studentName: 'Tuệ Lâm Nguyễn',
    initials: 'TL',
    tone: 'violet',
    grade: 3,
    age: 8,
    course: 'Scratch Foundations',
    channel: 'parent app',
    submittedAt: 'yesterday',
    status: 'active'
  },
  {
    id: 'ENR-2026-0838',
    studentName: 'Hà Ngân Bùi',
    initials: 'HN',
    tone: 'foreground',
    grade: 8,
    age: 13,
    course: 'Game Dev with Unity',
    channel: 'website',
    submittedAt: '2d ago',
    status: 'rejected'
  }
];

export type UpcomingClass = {
  id: string;
  startTime: string;
  durationMin: number;
  title: string;
  detail: string;
  accent: 'bg-foreground' | 'bg-sky-400' | 'bg-violet-400' | 'bg-amber-400';
  badge?: { label: string; className: string };
};

export const upcomingClasses: UpcomingClass[] = [
  {
    id: 'UC-1',
    startTime: '09:00',
    durationMin: 60,
    title: 'Scratch Foundations · A1',
    detail: 'Linh Nguyễn · Room 204 · 12 students',
    accent: 'bg-foreground',
    badge: { label: 'live', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  },
  {
    id: 'UC-2',
    startTime: '10:30',
    durationMin: 90,
    title: 'Python · Level 2 · B3',
    detail: 'Quang Vũ · Online · 14 students',
    accent: 'bg-sky-400',
    badge: { label: 'online', className: 'bg-sky-50 text-sky-700 border-sky-100' }
  },
  {
    id: 'UC-3',
    startTime: '14:00',
    durationMin: 75,
    title: 'Web Design Studio · W2',
    detail: 'Mai Hương · Room 101 · 10 students',
    accent: 'bg-violet-400'
  },
  {
    id: 'UC-4',
    startTime: '16:30',
    durationMin: 60,
    title: 'Robotics · R1',
    detail: 'Đức Anh · Lab 3 · 8 students',
    accent: 'bg-amber-400',
    badge: { label: 'low cap', className: 'bg-amber-50 text-amber-800 border-amber-200' }
  }
];

export type CourseFill = {
  id: string;
  name: string;
  enrolled: number;
  capacity: number;
};

export const courseFill: CourseFill[] = [
  { id: 'CODE-101', name: 'Scratch Foundations', enrolled: 46, capacity: 50 },
  { id: 'CODE-201', name: 'Python for Kids', enrolled: 39, capacity: 50 },
  { id: 'DSGN-110', name: 'Web Design Studio', enrolled: 32, capacity: 50 },
  { id: 'ROBO-220', name: 'Robotics with Arduino', enrolled: 16, capacity: 40 }
];

// Teacher domain types + data moved to @/api/teachers/.
// UI metadata for teacher status stays here (presentation concern, not server data).
import type { TeacherStatus } from '@/api/teachers';

export const teacherStatusLabel: Record<TeacherStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  pending: 'Pending'
};

export const teacherStatusClass: Record<TeacherStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  on_leave: 'bg-slate-50 text-slate-700 border-slate-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200'
};

// Course domain types + data moved to @/api/courses/.
// UI metadata for course status stays here (presentation concern, not server data).
import type { CourseStatus } from '@/api/courses';
// Re-exported for legacy imports (e.g. add-class-dialog) that still pull `courses` from this module.
export { courses } from '@/api/courses';
export type { Course, CourseCategory, CourseStatus } from '@/api/courses';

export const courseStatusClass: Record<CourseStatus, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  draft: 'bg-amber-50 text-amber-800 border-amber-200'
};

export type ClassStatus = 'running' | 'upcoming' | 'ended';

export type ClassRow = {
  id: string;
  name: string;
  courseTitle: string;
  location: string;
  teacherInitials: string;
  teacherShort: string;
  teacherTone: AvatarTone;
  schedule: string;
  enrolled: number;
  capacity: number;
  status: ClassStatus;
  selected?: boolean;
};

export const classRows: ClassRow[] = [
  {
    id: 'cl-1',
    name: 'Scratch · A1',
    courseTitle: 'Scratch Foundations',
    location: 'Room 204',
    teacherInitials: 'LN',
    teacherShort: 'Linh N.',
    teacherTone: 'rose',
    schedule: 'Mon · Wed · 09:00',
    enrolled: 12,
    capacity: 12,
    status: 'running',
    selected: true
  },
  {
    id: 'cl-2',
    name: 'Scratch · A2',
    courseTitle: 'Scratch Foundations',
    location: 'Online',
    teacherInitials: 'LN',
    teacherShort: 'Linh N.',
    teacherTone: 'rose',
    schedule: 'Tue · Thu · 17:30',
    enrolled: 10,
    capacity: 12,
    status: 'running'
  },
  {
    id: 'cl-3',
    name: 'Python · B3',
    courseTitle: 'Python for Kids',
    location: 'Online',
    teacherInitials: 'QV',
    teacherShort: 'Quang V.',
    teacherTone: 'sky',
    schedule: 'Mon · Wed · 10:30',
    enrolled: 14,
    capacity: 14,
    status: 'running'
  },
  {
    id: 'cl-4',
    name: 'Web Design · W2',
    courseTitle: 'Web Design Studio',
    location: 'Room 101',
    teacherInitials: 'MH',
    teacherShort: 'Mai H.',
    teacherTone: 'violet',
    schedule: 'Tue · Fri · 14:00',
    enrolled: 10,
    capacity: 12,
    status: 'running'
  },
  {
    id: 'cl-5',
    name: 'Robotics · R1',
    courseTitle: 'Robotics with Arduino',
    location: 'Lab 3',
    teacherInitials: 'DA',
    teacherShort: 'Đức A.',
    teacherTone: 'amber',
    schedule: 'Sat · 09:00 · 14:00',
    enrolled: 8,
    capacity: 10,
    status: 'running'
  },
  {
    id: 'cl-6',
    name: 'Game Dev · G1',
    courseTitle: 'Game Dev with Unity',
    location: 'Room 305',
    teacherInitials: 'TT',
    teacherShort: 'Tùng V.',
    teacherTone: 'emerald',
    schedule: 'Wed · Fri · 16:00',
    enrolled: 6,
    capacity: 10,
    status: 'upcoming'
  },
  {
    id: 'cl-7',
    name: 'AI Explorers · X1',
    courseTitle: 'AI Explorers',
    location: 'Room 207',
    teacherInitials: 'HG',
    teacherShort: 'Hà G.',
    teacherTone: 'foreground',
    schedule: 'Thu · 17:00',
    enrolled: 9,
    capacity: 12,
    status: 'running'
  }
];

export type StudentStatus = 'on_track' | 'at_risk' | 'absent_x3';

export const studentStatusLabel: Record<StudentStatus, string> = {
  on_track: 'on track',
  at_risk: 'at risk',
  absent_x3: 'absent ×3'
};

export const studentStatusClass: Record<StudentStatus, string> = {
  on_track: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  at_risk: 'bg-amber-50 text-amber-800 border-amber-200',
  absent_x3: 'bg-rose-50 text-rose-800 border-rose-200'
};

export type ClassStudent = {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  grade: number;
  age: number;
  attendance: number;
  status: StudentStatus;
};

export const classStudents: ClassStudent[] = [
  {
    id: 's-1',
    name: 'Minh An Trần',
    initials: 'MA',
    tone: 'rose',
    grade: 4,
    age: 9,
    attendance: 94,
    status: 'on_track'
  },
  {
    id: 's-2',
    name: 'Đăng Khoa Phạm',
    initials: 'DK',
    tone: 'sky',
    grade: 4,
    age: 9,
    attendance: 88,
    status: 'on_track'
  },
  {
    id: 's-3',
    name: 'Quỳnh Hương Lê',
    initials: 'QH',
    tone: 'amber',
    grade: 4,
    age: 9,
    attendance: 72,
    status: 'at_risk'
  },
  {
    id: 's-4',
    name: 'Tuệ Lâm Nguyễn',
    initials: 'TL',
    tone: 'violet',
    grade: 3,
    age: 8,
    attendance: 100,
    status: 'on_track'
  },
  {
    id: 's-5',
    name: 'Bảo Long Phan',
    initials: 'BL',
    tone: 'emerald',
    grade: 4,
    age: 10,
    attendance: 81,
    status: 'on_track'
  },
  {
    id: 's-6',
    name: 'Yến Nhi Đỗ',
    initials: 'YN',
    tone: 'rose',
    grade: 3,
    age: 9,
    attendance: 93,
    status: 'on_track'
  },
  {
    id: 's-7',
    name: 'Hữu Thắng Nguyễn',
    initials: 'HT',
    tone: 'sky',
    grade: 4,
    age: 9,
    attendance: 66,
    status: 'absent_x3'
  }
];

export type EnrollmentRow = {
  id: string;
  studentName: string;
  initials: string;
  tone: AvatarTone;
  parentName: string;
  requestedCourse: string;
  note: string;
  submittedAt: string;
  highlighted?: boolean;
};

export const pendingEnrollments: EnrollmentRow[] = [
  {
    id: 'ENR-2026-0843',
    studentName: 'Minh An Trần',
    initials: 'MA',
    tone: 'rose',
    parentName: 'Trần Hữu Phước',
    requestedCourse: 'Scratch Foundations',
    note: 'prefers · Mon · Wed mornings',
    submittedAt: '2h ago',
    highlighted: true
  },
  {
    id: 'ENR-2026-0844',
    studentName: 'Quỳnh Hương Lê',
    initials: 'QH',
    tone: 'amber',
    parentName: 'Lê Thị Lan',
    requestedCourse: 'Web Design Studio',
    note: 'prefers · weekends',
    submittedAt: '5h ago'
  },
  {
    id: 'ENR-2026-0845',
    studentName: 'Đăng Khoa Phạm',
    initials: 'DK',
    tone: 'sky',
    parentName: 'Phạm Mai Hoa',
    requestedCourse: 'Python · Level 2',
    note: 'requires placement test',
    submittedAt: 'yesterday'
  },
  {
    id: 'ENR-2026-0846',
    studentName: 'Vĩnh Khang Đỗ',
    initials: 'VK',
    tone: 'emerald',
    parentName: 'Đỗ Văn Hùng',
    requestedCourse: 'Robotics with Arduino',
    note: 'full · suggest waitlist',
    submittedAt: 'yesterday'
  },
  {
    id: 'ENR-2026-0847',
    studentName: 'Tuệ Lâm Nguyễn',
    initials: 'TL',
    tone: 'violet',
    parentName: 'Nguyễn Thị Hà',
    requestedCourse: 'AI Explorers',
    note: 'scholarship requested',
    submittedAt: '2d ago'
  },
  {
    id: 'ENR-2026-0848',
    studentName: 'Hà Ngân Bùi',
    initials: 'HN',
    tone: 'foreground',
    parentName: 'Bùi Quang Minh',
    requestedCourse: 'Game Dev with Unity',
    note: 'age below recommended',
    submittedAt: '3d ago'
  }
];

export type ClassAssignOption = {
  id: string;
  label: string;
  schedule: string;
  detail: string;
  enrolled: number;
  capacity: number;
  disabled?: boolean;
};

export const classAssignOptions: ClassAssignOption[] = [
  {
    id: 'opt-a1',
    label: 'Scratch · A1',
    schedule: 'Mon · Wed · 09:00',
    detail: 'Linh N. · Room 204 · 1 seat available',
    enrolled: 11,
    capacity: 12
  },
  {
    id: 'opt-a2',
    label: 'Scratch · A2',
    schedule: 'Tue · Thu · 17:30',
    detail: 'Linh N. · Online · 2 seats',
    enrolled: 10,
    capacity: 12
  },
  {
    id: 'opt-a3',
    label: 'Scratch · A3',
    schedule: 'Sat · 10:00',
    detail: 'Phương T. · Room 102 · full',
    enrolled: 12,
    capacity: 12,
    disabled: true
  }
];

export type ScheduleEventCategory = 'scratch' | 'python' | 'web' | 'robotics' | 'game_ai';

export const scheduleCategoryClass: Record<ScheduleEventCategory, string> = {
  scratch: 'bg-slate-50 text-slate-900 border-slate-200 border-l-slate-500',
  python: 'bg-sky-50 text-sky-900 border-sky-200 border-l-sky-500',
  web: 'bg-violet-50 text-violet-900 border-violet-200 border-l-violet-500',
  robotics: 'bg-amber-50 text-amber-900 border-amber-200 border-l-amber-500',
  game_ai: 'bg-emerald-50 text-emerald-900 border-emerald-200 border-l-emerald-500'
};

export const scheduleCategoryDot: Record<ScheduleEventCategory, string> = {
  scratch: 'bg-slate-500',
  python: 'bg-sky-500',
  web: 'bg-violet-500',
  robotics: 'bg-amber-500',
  game_ai: 'bg-emerald-500'
};

export type ScheduleEvent = {
  id: string;
  /** 0=Mon … 6=Sun */
  dayIndex: number;
  /** Minutes from 08:00 */
  startOffsetMin: number;
  durationMin: number;
  title: string;
  detail: string;
  timeLabel?: string;
  category: ScheduleEventCategory;
};

export const scheduleEvents: ScheduleEvent[] = [
  // Mon
  {
    id: 'se-1',
    dayIndex: 0,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Scratch · A1',
    detail: 'Linh N. · R204',
    timeLabel: '09:00 — 10:00',
    category: 'scratch'
  },
  {
    id: 'se-2',
    dayIndex: 0,
    startOffsetMin: 150,
    durationMin: 90,
    title: 'Python · B3',
    detail: 'Quang V. · Online',
    timeLabel: '10:30 — 12:00',
    category: 'python'
  },
  {
    id: 'se-3',
    dayIndex: 0,
    startOffsetMin: 420,
    durationMin: 60,
    title: 'AI Explorers · X1',
    detail: 'Hà G. · R207',
    category: 'game_ai'
  },
  // Tue
  {
    id: 'se-4',
    dayIndex: 1,
    startOffsetMin: 360,
    durationMin: 75,
    title: 'Web Design · W2',
    detail: 'Mai H. · R101',
    timeLabel: '14:00 — 15:15',
    category: 'web'
  },
  {
    id: 'se-5',
    dayIndex: 1,
    startOffsetMin: 570,
    durationMin: 60,
    title: 'Scratch · A2',
    detail: 'Linh N. · Online',
    timeLabel: '17:30 — 18:30',
    category: 'scratch'
  },
  // Wed
  {
    id: 'se-6',
    dayIndex: 2,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Scratch · A1',
    detail: 'Linh N. · R204',
    timeLabel: '09:00 — 10:00',
    category: 'scratch'
  },
  {
    id: 'se-7',
    dayIndex: 2,
    startOffsetMin: 150,
    durationMin: 90,
    title: 'Python · B3',
    detail: 'Quang V. · Online',
    timeLabel: '10:30 — 12:00',
    category: 'python'
  },
  {
    id: 'se-8',
    dayIndex: 2,
    startOffsetMin: 480,
    durationMin: 60,
    title: 'Game Dev · G1',
    detail: 'Tùng V. · R305',
    category: 'game_ai'
  },
  // Thu
  {
    id: 'se-9',
    dayIndex: 3,
    startOffsetMin: 540,
    durationMin: 60,
    title: 'AI Explorers · X1',
    detail: 'Hà G. · R207',
    category: 'game_ai'
  },
  // Fri
  {
    id: 'se-10',
    dayIndex: 4,
    startOffsetMin: 360,
    durationMin: 75,
    title: 'Web Design · W2',
    detail: 'Mai H. · R101',
    category: 'web'
  },
  {
    id: 'se-11',
    dayIndex: 4,
    startOffsetMin: 480,
    durationMin: 60,
    title: 'Game Dev · G1',
    detail: 'Tùng V. · R305',
    category: 'game_ai'
  },
  // Sat (today)
  {
    id: 'se-12',
    dayIndex: 5,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Robotics · R1',
    detail: 'Đức A. · Lab 3',
    timeLabel: '09:00 — 10:00',
    category: 'robotics'
  },
  {
    id: 'se-13',
    dayIndex: 5,
    startOffsetMin: 360,
    durationMin: 60,
    title: 'Scratch · A3',
    detail: 'Phương T. · R102',
    timeLabel: '14:00 — 15:00',
    category: 'scratch'
  },
  {
    id: 'se-14',
    dayIndex: 5,
    startOffsetMin: 420,
    durationMin: 60,
    title: 'Robotics · R1',
    detail: 'Đức A. · Lab 3',
    timeLabel: '14:00 — 15:00',
    category: 'robotics'
  }
];

export const scheduleDays = [
  { short: 'Mon', date: 18 },
  { short: 'Tue', date: 19 },
  { short: 'Wed', date: 20 },
  { short: 'Thu', date: 21 },
  { short: 'Fri', date: 22 },
  { short: 'Sat', date: 23, isToday: true },
  { short: 'Sun', date: 24 }
];

export const scheduleHours = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];
