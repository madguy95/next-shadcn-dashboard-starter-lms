import type {
  ScheduleDay,
  ScheduleEvent,
  ScheduleFilters,
  ScheduleSummary,
  ScheduleWeek
} from './types';

export const mockScheduleSummary: ScheduleSummary = {
  weekLabel: 'Week May 18 — 24',
  monthLabel: 'May 2026',
  todayLabel: 'Sat (today)',
  weekStart: '2026-05-18',
  weekEnd: '2026-05-24',
  totalSessions: 14,
  totalTeachers: 8,
  totalStudentHours: 216
};

export const mockScheduleDays: ScheduleDay[] = [
  { short: 'Mon', date: 18, isoDate: '2026-05-18' },
  { short: 'Tue', date: 19, isoDate: '2026-05-19' },
  { short: 'Wed', date: 20, isoDate: '2026-05-20' },
  { short: 'Thu', date: 21, isoDate: '2026-05-21' },
  { short: 'Fri', date: 22, isoDate: '2026-05-22' },
  { short: 'Sat', date: 23, isoDate: '2026-05-23', isToday: true },
  { short: 'Sun', date: 24, isoDate: '2026-05-24' }
];

export const mockScheduleEvents: ScheduleEvent[] = [
  // Mon
  {
    id: 'se-1',
    classId: 'cl-1',
    teacherId: 't-1',
    dayIndex: 0,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Scratch · A1',
    detail: 'Linh N. · R204',
    timeLabel: '09:00 — 10:00',
    location: 'R204',
    category: 'scratch'
  },
  {
    id: 'se-2',
    classId: 'cl-2',
    teacherId: 't-2',
    dayIndex: 0,
    startOffsetMin: 150,
    durationMin: 90,
    title: 'Python · B3',
    detail: 'Quang V. · Online',
    timeLabel: '10:30 — 12:00',
    location: 'Online',
    category: 'python'
  },
  {
    id: 'se-3',
    classId: 'cl-3',
    teacherId: 't-3',
    dayIndex: 0,
    startOffsetMin: 420,
    durationMin: 60,
    title: 'AI Explorers · X1',
    detail: 'Hà G. · R207',
    location: 'R207',
    category: 'game_ai'
  },
  // Tue
  {
    id: 'se-4',
    classId: 'cl-4',
    teacherId: 't-4',
    dayIndex: 1,
    startOffsetMin: 360,
    durationMin: 75,
    title: 'Web Design · W2',
    detail: 'Mai H. · R101',
    timeLabel: '14:00 — 15:15',
    location: 'R101',
    category: 'web'
  },
  {
    id: 'se-5',
    classId: 'cl-5',
    teacherId: 't-1',
    dayIndex: 1,
    startOffsetMin: 570,
    durationMin: 60,
    title: 'Scratch · A2',
    detail: 'Linh N. · Online',
    timeLabel: '17:30 — 18:30',
    location: 'Online',
    category: 'scratch'
  },
  // Wed
  {
    id: 'se-6',
    classId: 'cl-1',
    teacherId: 't-1',
    dayIndex: 2,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Scratch · A1',
    detail: 'Linh N. · R204',
    timeLabel: '09:00 — 10:00',
    location: 'R204',
    category: 'scratch'
  },
  {
    id: 'se-7',
    classId: 'cl-2',
    teacherId: 't-2',
    dayIndex: 2,
    startOffsetMin: 150,
    durationMin: 90,
    title: 'Python · B3',
    detail: 'Quang V. · Online',
    timeLabel: '10:30 — 12:00',
    location: 'Online',
    category: 'python'
  },
  {
    id: 'se-8',
    classId: 'cl-6',
    teacherId: 't-5',
    dayIndex: 2,
    startOffsetMin: 480,
    durationMin: 60,
    title: 'Game Dev · G1',
    detail: 'Tùng V. · R305',
    location: 'R305',
    category: 'game_ai'
  },
  // Thu
  {
    id: 'se-9',
    classId: 'cl-3',
    teacherId: 't-3',
    dayIndex: 3,
    startOffsetMin: 540,
    durationMin: 60,
    title: 'AI Explorers · X1',
    detail: 'Hà G. · R207',
    location: 'R207',
    category: 'game_ai'
  },
  // Fri
  {
    id: 'se-10',
    classId: 'cl-4',
    teacherId: 't-4',
    dayIndex: 4,
    startOffsetMin: 360,
    durationMin: 75,
    title: 'Web Design · W2',
    detail: 'Mai H. · R101',
    location: 'R101',
    category: 'web'
  },
  {
    id: 'se-11',
    classId: 'cl-6',
    teacherId: 't-5',
    dayIndex: 4,
    startOffsetMin: 480,
    durationMin: 60,
    title: 'Game Dev · G1',
    detail: 'Tùng V. · R305',
    location: 'R305',
    category: 'game_ai'
  },
  // Sat (today)
  {
    id: 'se-12',
    classId: 'cl-7',
    teacherId: 't-6',
    dayIndex: 5,
    startOffsetMin: 60,
    durationMin: 60,
    title: 'Robotics · R1',
    detail: 'Đức A. · Lab 3',
    timeLabel: '09:00 — 10:00',
    location: 'Lab 3',
    category: 'robotics'
  },
  {
    id: 'se-13',
    classId: 'cl-8',
    teacherId: 't-7',
    dayIndex: 5,
    startOffsetMin: 360,
    durationMin: 60,
    title: 'Scratch · A3',
    detail: 'Phương T. · R102',
    timeLabel: '14:00 — 15:00',
    location: 'R102',
    category: 'scratch'
  },
  {
    id: 'se-14',
    classId: 'cl-7',
    teacherId: 't-6',
    dayIndex: 5,
    startOffsetMin: 420,
    durationMin: 60,
    title: 'Robotics · R1',
    detail: 'Đức A. · Lab 3',
    timeLabel: '14:00 — 15:00',
    location: 'Lab 3',
    category: 'robotics'
  }
];

export const mockScheduleFilters: ScheduleFilters = {
  teachers: [
    { id: 't-1', label: 'Linh Nguyễn' },
    { id: 't-2', label: 'Quang Vũ' },
    { id: 't-3', label: 'Hà Giang' },
    { id: 't-4', label: 'Mai Hương' },
    { id: 't-5', label: 'Tùng Vương' },
    { id: 't-6', label: 'Đức Anh' },
    { id: 't-7', label: 'Phương Thảo' }
  ],
  classes: [
    { id: 'cl-1', label: 'Scratch · A1' },
    { id: 'cl-2', label: 'Python · B3' },
    { id: 'cl-3', label: 'AI Explorers · X1' },
    { id: 'cl-4', label: 'Web Design · W2' },
    { id: 'cl-5', label: 'Scratch · A2' },
    { id: 'cl-6', label: 'Game Dev · G1' },
    { id: 'cl-7', label: 'Robotics · R1' },
    { id: 'cl-8', label: 'Scratch · A3' }
  ],
  locations: [
    { id: 'R101', label: 'R101' },
    { id: 'R102', label: 'R102' },
    { id: 'R204', label: 'R204' },
    { id: 'R207', label: 'R207' },
    { id: 'R305', label: 'R305' },
    { id: 'Lab 3', label: 'Lab 3' },
    { id: 'Online', label: 'Online' }
  ]
};

export const mockScheduleWeek: ScheduleWeek = {
  summary: mockScheduleSummary,
  days: mockScheduleDays,
  events: mockScheduleEvents
};
