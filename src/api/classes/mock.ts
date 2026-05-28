import type { ClassAssignOption, ClassStudent } from './types';

// Class list / detail come from the real API. These mock collections only
// back the enrolments panel and the in-class roster preview while those
// modules are not yet wired to the backend.

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
