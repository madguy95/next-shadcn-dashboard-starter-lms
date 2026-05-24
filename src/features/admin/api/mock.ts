import type { Teacher, TeacherCounts } from './types';

export const teachers: Teacher[] = [
  {
    id: 'T-001',
    name: 'Linh Nguyễn',
    email: 'linh.n@lumen.edu',
    initials: 'LN',
    tone: 'rose',
    subjects: ['Scratch', 'Python'],
    classCount: 5,
    studentCount: 62,
    rating: 4.9,
    status: 'active'
  },
  {
    id: 'T-002',
    name: 'Quang Vũ Phạm',
    email: 'quang.v@lumen.edu',
    initials: 'QV',
    tone: 'sky',
    subjects: ['Python', 'JavaScript'],
    classCount: 4,
    studentCount: 48,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 'T-003',
    name: 'Mai Hương Lê',
    email: 'mai.h@lumen.edu',
    initials: 'MH',
    tone: 'violet',
    subjects: ['Web Design', 'UI/UX'],
    classCount: 3,
    studentCount: 32,
    rating: 4.7,
    status: 'active'
  },
  {
    id: 'T-004',
    name: 'Đức Anh Hoàng',
    email: 'duc.a@lumen.edu',
    initials: 'DA',
    tone: 'amber',
    subjects: ['Robotics', 'Arduino', '+1'],
    classCount: 2,
    studentCount: 18,
    rating: 4.6,
    status: 'active'
  },
  {
    id: 'T-005',
    name: 'Thanh Tùng Vũ',
    email: 'tung.v@lumen.edu',
    initials: 'TT',
    tone: 'emerald',
    subjects: ['Game Dev', 'Unity'],
    classCount: 3,
    studentCount: 36,
    rating: 4.9,
    status: 'on_leave'
  },
  {
    id: 'T-006',
    name: 'Hà Giang Trịnh',
    email: 'ha.g@lumen.edu',
    initials: 'HG',
    tone: 'foreground',
    subjects: ['Math', 'Logic'],
    classCount: 4,
    studentCount: 52,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 'T-007',
    name: 'Phương Thảo Bùi',
    email: 'thao.b@lumen.edu',
    initials: 'PT',
    tone: 'rose',
    subjects: ['English', 'Creative Writing'],
    classCount: 2,
    studentCount: 22,
    rating: 5.0,
    status: 'pending'
  }
];

export const teacherCounts: TeacherCounts = {
  all: 24,
  active: 21,
  on_leave: 3,
  pending: 2
};
