import type { ClassAssignOption, ClassRow, ClassStatusFilter, ClassStudent } from './types';

export const classRows: ClassRow[] = [
  {
    id: 'cl-1',
    name: 'Scratch · A1',
    courseCode: 'CODE-101',
    courseTitle: 'Scratch Foundations',
    location: 'Room 204',
    teacherInitials: 'LN',
    teacherShort: 'Linh N.',
    teacherTone: 'rose',
    schedule: 'Mon · Wed · 09:00',
    enrolled: 12,
    capacity: 12,
    status: 'running',
    weekIndex: 4,
    weeksTotal: 12
  },
  {
    id: 'cl-2',
    name: 'Scratch · A2',
    courseCode: 'CODE-101',
    courseTitle: 'Scratch Foundations',
    location: 'Online',
    teacherInitials: 'LN',
    teacherShort: 'Linh N.',
    teacherTone: 'rose',
    schedule: 'Tue · Thu · 17:30',
    enrolled: 10,
    capacity: 12,
    status: 'running',
    weekIndex: 3,
    weeksTotal: 12
  },
  {
    id: 'cl-3',
    name: 'Python · B3',
    courseCode: 'CODE-201',
    courseTitle: 'Python for Kids',
    location: 'Online',
    teacherInitials: 'QV',
    teacherShort: 'Quang V.',
    teacherTone: 'sky',
    schedule: 'Mon · Wed · 10:30',
    enrolled: 14,
    capacity: 14,
    status: 'running',
    weekIndex: 6,
    weeksTotal: 16
  },
  {
    id: 'cl-4',
    name: 'Web Design · W2',
    courseCode: 'DSGN-110',
    courseTitle: 'Web Design Studio',
    location: 'Room 101',
    teacherInitials: 'MH',
    teacherShort: 'Mai H.',
    teacherTone: 'violet',
    schedule: 'Tue · Fri · 14:00',
    enrolled: 10,
    capacity: 12,
    status: 'running',
    weekIndex: 2,
    weeksTotal: 10
  },
  {
    id: 'cl-5',
    name: 'Robotics · R1',
    courseCode: 'ROBO-220',
    courseTitle: 'Robotics with Arduino',
    location: 'Lab 3',
    teacherInitials: 'DA',
    teacherShort: 'Đức A.',
    teacherTone: 'amber',
    schedule: 'Sat · 09:00 · 14:00',
    enrolled: 8,
    capacity: 10,
    status: 'running',
    weekIndex: 5,
    weeksTotal: 14
  },
  {
    id: 'cl-6',
    name: 'Game Dev · G1',
    courseCode: 'GAME-310',
    courseTitle: 'Game Dev with Unity',
    location: 'Room 305',
    teacherInitials: 'TT',
    teacherShort: 'Tùng V.',
    teacherTone: 'emerald',
    schedule: 'Wed · Fri · 16:00',
    enrolled: 6,
    capacity: 10,
    status: 'upcoming',
    weeksTotal: 18
  },
  {
    id: 'cl-7',
    name: 'AI Explorers · X1',
    courseCode: 'AI-150',
    courseTitle: 'AI Explorers',
    location: 'Room 207',
    teacherInitials: 'HG',
    teacherShort: 'Hà G.',
    teacherTone: 'foreground',
    schedule: 'Thu · 17:00',
    enrolled: 9,
    capacity: 12,
    status: 'running',
    weekIndex: 2,
    weeksTotal: 8
  },
  {
    id: 'cl-8',
    name: 'Lego Robotics · L1',
    courseCode: 'ROBO-110',
    courseTitle: 'Lego Robotics',
    location: 'Lab 2',
    teacherInitials: 'PT',
    teacherShort: 'Phương T.',
    teacherTone: 'amber',
    schedule: 'Sat · 10:00',
    enrolled: 10,
    capacity: 12,
    status: 'ended',
    weekIndex: 10,
    weeksTotal: 10
  }
];

export const classStudents: ClassStudent[] = [
  {
    id: 's-1',
    classId: 'cl-1',
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
    classId: 'cl-1',
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
    classId: 'cl-1',
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
    classId: 'cl-1',
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
    classId: 'cl-1',
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
    classId: 'cl-1',
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
    classId: 'cl-1',
    name: 'Hữu Thắng Nguyễn',
    initials: 'HT',
    tone: 'sky',
    grade: 4,
    age: 9,
    attendance: 66,
    status: 'absent_x3'
  }
];

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

export const classStatusTabConfig: { value: ClassStatusFilter }[] = [
  { value: 'all' },
  { value: 'running' },
  { value: 'upcoming' },
  { value: 'ended' }
];
