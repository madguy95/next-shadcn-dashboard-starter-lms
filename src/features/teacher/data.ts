export type ClassColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

export const classColorTokens: Record<
  ClassColor,
  { swatch: string; bar: string; bg: string; chip: string }
> = {
  emerald: {
    swatch: 'bg-emerald-400',
    bar: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    chip: 'bg-emerald-100 text-emerald-900 border-emerald-200'
  },
  sky: {
    swatch: 'bg-sky-400',
    bar: 'border-l-sky-500',
    bg: 'bg-sky-50',
    chip: 'bg-sky-100 text-sky-900 border-sky-200'
  },
  amber: {
    swatch: 'bg-amber-400',
    bar: 'border-l-amber-500',
    bg: 'bg-amber-50',
    chip: 'bg-amber-100 text-amber-900 border-amber-200'
  },
  violet: {
    swatch: 'bg-violet-400',
    bar: 'border-l-violet-500',
    bg: 'bg-violet-50',
    chip: 'bg-violet-100 text-violet-900 border-violet-200'
  },
  rose: {
    swatch: 'bg-rose-400',
    bar: 'border-l-rose-500',
    bg: 'bg-rose-50',
    chip: 'bg-rose-100 text-rose-900 border-rose-200'
  },
  slate: {
    swatch: 'bg-slate-400',
    bar: 'border-l-slate-400',
    bg: 'bg-slate-50',
    chip: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

export type StudentTone =
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'cyan'
  | 'purple';

export const studentToneClass: Record<StudentTone, string> = {
  emerald: 'bg-gradient-to-br from-emerald-300 to-emerald-600 text-white',
  sky: 'bg-gradient-to-br from-sky-300 to-sky-600 text-white',
  amber: 'bg-gradient-to-br from-amber-300 to-amber-600 text-white',
  violet: 'bg-gradient-to-br from-violet-300 to-violet-600 text-white',
  rose: 'bg-gradient-to-br from-rose-300 to-rose-600 text-white',
  teal: 'bg-gradient-to-br from-teal-300 to-teal-600 text-white',
  indigo: 'bg-gradient-to-br from-indigo-300 to-indigo-600 text-white',
  lime: 'bg-gradient-to-br from-lime-300 to-lime-600 text-white',
  orange: 'bg-gradient-to-br from-orange-300 to-orange-600 text-white',
  pink: 'bg-gradient-to-br from-pink-300 to-pink-600 text-white',
  cyan: 'bg-gradient-to-br from-cyan-300 to-cyan-600 text-white',
  purple: 'bg-gradient-to-br from-purple-300 to-purple-600 text-white'
};

export type ClassStatus = 'running' | 'upcoming' | 'ended';

export const classStatusLabel: Record<ClassStatus, string> = {
  running: 'Đang dạy',
  upcoming: 'Sắp khai giảng',
  ended: 'Đã kết thúc'
};

export type TeacherClass = {
  id: string;
  code: string;
  level: string;
  courseCode: string;
  title: string;
  classLabel: string;
  location: string;
  isOnline: boolean;
  schedule: string;
  studentCount: number;
  capacity?: number;
  sessionCurrent: number;
  sessionTotal: number;
  status: ClassStatus;
  color: ClassColor;
  needsReviewCount?: number;
  startedAt?: string;
  endedAt?: string;
  studentsPreview: { initials: string; tone: StudentTone }[];
  daysRemaining?: number;
};

export const teacherClasses: TeacherClass[] = [
  {
    id: 'A01',
    code: 'A01',
    level: 'Beginner',
    courseCode: 'SC-101',
    title: 'Scratch Cơ bản',
    classLabel: 'Lớp A01',
    location: 'CS Cầu Giấy · P. 301',
    isOnline: false,
    schedule: 'T2 / T4 · 18:00',
    studentCount: 12,
    sessionCurrent: 6,
    sessionTotal: 16,
    status: 'running',
    color: 'emerald',
    needsReviewCount: 2,
    studentsPreview: [
      { initials: 'NA', tone: 'emerald' },
      { initials: 'PT', tone: 'orange' },
      { initials: 'HL', tone: 'violet' }
    ]
  },
  {
    id: 'P03',
    code: 'P03',
    level: 'Intermediate',
    courseCode: 'PY-110',
    title: 'Python Khởi đầu',
    classLabel: 'Lớp P03',
    location: 'Online · Zoom',
    isOnline: true,
    schedule: 'T3 / T5 · 19:30',
    studentCount: 14,
    sessionCurrent: 9,
    sessionTotal: 20,
    status: 'running',
    color: 'sky',
    needsReviewCount: 0,
    studentsPreview: [
      { initials: 'NB', tone: 'orange' },
      { initials: 'TM', tone: 'sky' },
      { initials: 'DQ', tone: 'pink' }
    ]
  },
  {
    id: 'M02',
    code: 'M02',
    level: 'Lớp 3',
    courseCode: 'MT-110',
    title: 'Toán tư duy 3',
    classLabel: 'Lớp M02',
    location: 'CS Cầu Giấy',
    isOnline: false,
    schedule: 'T7 · 09:00',
    studentCount: 15,
    sessionCurrent: 11,
    sessionTotal: 24,
    status: 'running',
    color: 'amber',
    needsReviewCount: 4,
    studentsPreview: [
      { initials: 'NA', tone: 'emerald' },
      { initials: 'LK', tone: 'lime' }
    ]
  },
  {
    id: 'A04',
    code: 'A04',
    level: 'Beginner',
    courseCode: 'SC-101',
    title: 'Scratch Cơ bản',
    classLabel: 'Lớp A04',
    location: 'Online · Zoom',
    isOnline: true,
    schedule: 'CN · 09:30',
    studentCount: 10,
    sessionCurrent: 3,
    sessionTotal: 16,
    status: 'running',
    color: 'emerald',
    needsReviewCount: 0,
    studentsPreview: [
      { initials: 'NK', tone: 'violet' },
      { initials: 'VA', tone: 'teal' }
    ]
  },
  {
    id: 'S05',
    code: 'S05',
    level: 'Nâng cao',
    courseCode: 'SC-201',
    title: 'Scratch Nâng cao',
    classLabel: 'Lớp S05',
    location: 'CS Cầu Giấy',
    isOnline: false,
    schedule: 'Khai giảng 02/06',
    studentCount: 7,
    capacity: 12,
    sessionCurrent: 0,
    sessionTotal: 16,
    status: 'upcoming',
    color: 'violet',
    daysRemaining: 10,
    studentsPreview: []
  },
  {
    id: 'A03',
    code: 'A03',
    level: 'Beginner',
    courseCode: 'SC-101',
    title: 'Scratch Cơ bản',
    classLabel: 'Lớp A03',
    location: 'CS Cầu Giấy',
    isOnline: false,
    schedule: 'Kết thúc 28/04/2026',
    studentCount: 14,
    sessionCurrent: 16,
    sessionTotal: 16,
    status: 'ended',
    color: 'slate',
    endedAt: '28/04/2026',
    studentsPreview: []
  }
];

export type AttendanceStatus = 'present' | 'excused' | 'absent' | 'makeup' | 'unmarked';

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  present: 'Có mặt',
  excused: 'Có phép',
  absent: 'Vắng',
  makeup: 'Học bù',
  unmarked: 'Chưa điểm danh'
};

export const attendanceStatusDot: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500',
  excused: 'bg-amber-500',
  absent: 'bg-rose-500',
  makeup: 'bg-sky-500',
  unmarked: 'bg-muted-foreground'
};

export const attendanceStatusActive: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500/15 text-emerald-700',
  excused: 'bg-amber-500/15 text-amber-800',
  absent: 'bg-rose-500/15 text-rose-700',
  makeup: 'bg-sky-500/15 text-sky-700',
  unmarked: 'bg-muted text-muted-foreground'
};

export type ClassStudent = {
  id: string;
  name: string;
  initials: string;
  tone: StudentTone;
  age: number;
  grade: number;
  parentName: string;
  parentPhone: string;
  attendedSessions: number;
  totalSessions: number;
  lastStatus: AttendanceStatus;
  lastSessionLabel: string;
};

export const classA01Students: ClassStudent[] = [
  {
    id: 'HS-2401',
    name: 'Nguyễn An',
    initials: 'NA',
    tone: 'emerald',
    age: 8,
    grade: 3,
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912•••678',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2402',
    name: 'Phạm Thảo',
    initials: 'PT',
    tone: 'orange',
    age: 9,
    grade: 4,
    parentName: 'Phạm Quốc Anh',
    parentPhone: '0987•••123',
    attendedSessions: 5,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2403',
    name: 'Hoàng Linh',
    initials: 'HL',
    tone: 'violet',
    age: 8,
    grade: 3,
    parentName: 'Hoàng Minh Đức',
    parentPhone: '0903•••456',
    attendedSessions: 4,
    totalSessions: 6,
    lastStatus: 'excused',
    lastSessionLabel: 'B5'
  },
  {
    id: 'HS-2404',
    name: 'Trần Minh',
    initials: 'TM',
    tone: 'sky',
    age: 7,
    grade: 2,
    parentName: 'Trần Thị Mai',
    parentPhone: '0978•••890',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2405',
    name: 'Đỗ Quỳnh',
    initials: 'DQ',
    tone: 'pink',
    age: 10,
    grade: 5,
    parentName: 'Đỗ Quang Vinh',
    parentPhone: '0936•••012',
    attendedSessions: 3,
    totalSessions: 6,
    lastStatus: 'absent',
    lastSessionLabel: 'B5'
  },
  {
    id: 'HS-2406',
    name: 'Lê Khang',
    initials: 'LK',
    tone: 'lime',
    age: 9,
    grade: 4,
    parentName: 'Lê Văn Tuấn',
    parentPhone: '0945•••234',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2407',
    name: 'Vũ Anh',
    initials: 'VA',
    tone: 'teal',
    age: 8,
    grade: 3,
    parentName: 'Vũ Văn Hà',
    parentPhone: '0967•••567',
    attendedSessions: 5,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2408',
    name: 'Bùi Nam',
    initials: 'BN',
    tone: 'indigo',
    age: 7,
    grade: 2,
    parentName: 'Bùi Văn Sơn',
    parentPhone: '0918•••789',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2409',
    name: 'Ngô Mai',
    initials: 'NM',
    tone: 'cyan',
    age: 9,
    grade: 4,
    parentName: 'Ngô Thị Hằng',
    parentPhone: '0929•••345',
    attendedSessions: 5,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2410',
    name: 'Phan Hà',
    initials: 'PH',
    tone: 'amber',
    age: 8,
    grade: 3,
    parentName: 'Phan Trung Hiếu',
    parentPhone: '0955•••678',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2411',
    name: 'Tô Lan',
    initials: 'TL',
    tone: 'purple',
    age: 10,
    grade: 5,
    parentName: 'Tô Thanh Hải',
    parentPhone: '0987•••901',
    attendedSessions: 5,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  },
  {
    id: 'HS-2412',
    name: 'Cao Vinh',
    initials: 'CV',
    tone: 'rose',
    age: 9,
    grade: 4,
    parentName: 'Cao Bảo Khanh',
    parentPhone: '0903•••012',
    attendedSessions: 6,
    totalSessions: 6,
    lastStatus: 'present',
    lastSessionLabel: 'B5 14/05'
  }
];

export type SessionRecord = {
  id: string;
  index: number;
  dateLabel: string;
  title: string;
  status: 'reviewed' | 'in_progress' | 'taught' | 'upcoming';
  needsReviewCount?: number;
};

export const classA01Sessions: SessionRecord[] = [
  {
    id: 'B1',
    index: 1,
    dateLabel: '12/05',
    title: 'Giới thiệu Scratch & môi trường',
    status: 'reviewed'
  },
  { id: 'B2', index: 2, dateLabel: '14/05', title: 'Khối lệnh chuyển động', status: 'reviewed' },
  { id: 'B3', index: 3, dateLabel: '17/05', title: 'Sự kiện & vòng lặp', status: 'reviewed' },
  { id: 'B4', index: 4, dateLabel: '19/05', title: 'Biến số đầu tiên', status: 'reviewed' },
  { id: 'B5', index: 5, dateLabel: '14/05', title: 'Điều kiện if/else', status: 'reviewed' },
  {
    id: 'B6',
    index: 6,
    dateLabel: '19/05',
    title: 'Mini game: Cat & Mouse',
    status: 'in_progress',
    needsReviewCount: 2
  },
  { id: 'B7', index: 7, dateLabel: '21/05', title: 'Hàm & khối tự tạo', status: 'upcoming' },
  { id: 'B8', index: 8, dateLabel: '24/05', title: 'Dự án giữa kỳ', status: 'upcoming' }
];

export const sessionStatusLabel: Record<SessionRecord['status'], string> = {
  reviewed: 'Đã nhận xét',
  in_progress: 'Đang ghi nhận xét',
  taught: 'Chưa nhận xét',
  upcoming: 'Chưa dạy'
};

export const sessionStatusDot: Record<SessionRecord['status'], string> = {
  reviewed: 'bg-emerald-500',
  in_progress: 'bg-amber-500',
  taught: 'bg-sky-500',
  upcoming: 'bg-muted-foreground'
};

export type StudentNoteRating = 'weak' | 'average' | 'good' | 'great' | 'excellent';

export const studentNoteRatingLabel: Record<StudentNoteRating, string> = {
  weak: 'Yếu',
  average: 'TB',
  good: 'Khá',
  great: 'Tốt',
  excellent: 'Xuất sắc'
};

export const studentNoteRatingClass: Record<StudentNoteRating, string> = {
  weak: 'bg-rose-50 border-rose-200 text-rose-800',
  average: 'bg-slate-50 border-slate-200 text-slate-700',
  good: 'bg-amber-50 border-amber-200 text-amber-800',
  great: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  excellent: 'bg-emerald-50 border-emerald-200 text-emerald-800'
};

export type StudentNote = {
  studentId: string;
  attendance: AttendanceStatus;
  note?: string;
  rating?: StudentNoteRating;
  tags?: string[];
  saved: boolean;
};

export const classA01B6Notes: StudentNote[] = [
  {
    studentId: 'HS-2401',
    attendance: 'present',
    note: 'An hoàn thành mini game sớm và đề xuất thêm âm thanh. Suy luận logic tốt, có thể thử thử thách nâng cao buổi sau.',
    rating: 'excellent',
    tags: ['Tư duy logic', 'Sáng tạo'],
    saved: true
  },
  {
    studentId: 'HS-2402',
    attendance: 'present',
    saved: false
  },
  {
    studentId: 'HS-2404',
    attendance: 'present',
    note: 'Minh nắm khái niệm vòng lặp nhưng còn lúng túng khi kết hợp với điều kiện. Nên ôn thêm bài tập 4.3 ở nhà.',
    rating: 'good',
    tags: ['Cần luyện tập'],
    saved: true
  },
  {
    studentId: 'HS-2406',
    attendance: 'present',
    saved: false
  },
  {
    studentId: 'HS-2407',
    attendance: 'present',
    note: 'Anh tham gia rất tích cực, hỗ trợ bạn bên cạnh. Sản phẩm hoàn thiện đẹp, có thêm âm thanh tự thêm.',
    rating: 'great',
    tags: ['Hợp tác'],
    saved: true
  },
  {
    studentId: 'HS-2403',
    attendance: 'excused',
    note: 'PH đã báo nghỉ — không yêu cầu nhận xét. Đã được xếp học bù vào B7 (24/05).',
    saved: true
  }
];

export type ClassDetail = {
  id: string;
  classLabel: string;
  courseCode: string;
  courseName: string;
  status: ClassStatus;
  title: string;
  location: string;
  schedule: string;
  termRange: string;
  sessionCurrent: number;
  sessionTotal: number;
  studentCount: number;
  presentLastWeek: number;
  absentLastWeek: number;
  attendanceRate: number;
  attendedCount: number;
  attendedTotal: number;
  needsReviewCount: number;
  needsReviewSession: string;
  color: ClassColor;
};

export const classA01Detail: ClassDetail = {
  id: 'A01',
  classLabel: 'Lớp A01',
  courseCode: 'SC-101',
  courseName: 'Scratch Cơ bản',
  status: 'running',
  title: 'Scratch Cơ bản · Lớp A01',
  location: 'CS Cầu Giấy · P. 301',
  schedule: 'T2 / T4 · 18:00–19:00',
  termRange: '12/05 — 28/07/2026',
  sessionCurrent: 6,
  sessionTotal: 16,
  studentCount: 12,
  presentLastWeek: 11,
  absentLastWeek: 1,
  attendanceRate: 94,
  attendedCount: 62,
  attendedTotal: 66,
  needsReviewCount: 2,
  needsReviewSession: 'buổi 6 · 19/05',
  color: 'emerald'
};

export type ScheduleEvent = {
  id: string;
  dayIndex: number;
  startMin: number;
  durationMin: number;
  classId: string;
  classLabel: string;
  courseCode: string;
  title: string;
  location: string;
  isOnline: boolean;
  studentCount: number;
  color: ClassColor;
  isMakeup?: boolean;
  makeupStudent?: string;
};

export const teacherScheduleEvents: ScheduleEvent[] = [
  {
    id: 'sch-1',
    dayIndex: 0,
    startMin: 600,
    durationMin: 60,
    classId: 'A01',
    classLabel: 'A01',
    courseCode: 'SC-101',
    title: 'Scratch · A01',
    location: 'P. 301',
    isOnline: false,
    studentCount: 12,
    color: 'emerald'
  },
  {
    id: 'sch-2',
    dayIndex: 1,
    startMin: 690,
    durationMin: 75,
    classId: 'P03',
    classLabel: 'P03',
    courseCode: 'PY-110',
    title: 'Python · P03',
    location: 'Online',
    isOnline: true,
    studentCount: 14,
    color: 'sky'
  },
  {
    id: 'sch-3',
    dayIndex: 2,
    startMin: 600,
    durationMin: 60,
    classId: 'A01',
    classLabel: 'A01',
    courseCode: 'SC-101',
    title: 'Scratch · A01',
    location: 'P. 301',
    isOnline: false,
    studentCount: 12,
    color: 'emerald'
  },
  {
    id: 'sch-4',
    dayIndex: 3,
    startMin: 540,
    durationMin: 60,
    classId: 'A01',
    classLabel: 'A01',
    courseCode: 'SC-101',
    title: 'Scratch · học bù',
    location: 'Zoom',
    isOnline: true,
    studentCount: 1,
    color: 'emerald',
    isMakeup: true,
    makeupStudent: 'HL'
  },
  {
    id: 'sch-5',
    dayIndex: 3,
    startMin: 690,
    durationMin: 75,
    classId: 'P03',
    classLabel: 'P03',
    courseCode: 'PY-110',
    title: 'Python · P03',
    location: 'Online',
    isOnline: true,
    studentCount: 14,
    color: 'sky'
  },
  {
    id: 'sch-6',
    dayIndex: 5,
    startMin: 60,
    durationMin: 90,
    classId: 'M02',
    classLabel: 'M02',
    courseCode: 'MT-110',
    title: 'Toán tư duy · M02',
    location: 'P. 205',
    isOnline: false,
    studentCount: 15,
    color: 'amber'
  },
  {
    id: 'sch-7',
    dayIndex: 5,
    startMin: 360,
    durationMin: 60,
    classId: 'A01',
    classLabel: 'A01',
    courseCode: 'SC-101',
    title: 'Scratch · học bù HL',
    location: 'Zoom',
    isOnline: true,
    studentCount: 1,
    color: 'emerald',
    isMakeup: true,
    makeupStudent: 'HL'
  },
  {
    id: 'sch-8',
    dayIndex: 6,
    startMin: 90,
    durationMin: 60,
    classId: 'A04',
    classLabel: 'A04',
    courseCode: 'SC-101',
    title: 'Scratch · A04',
    location: 'Online',
    isOnline: true,
    studentCount: 10,
    color: 'emerald'
  }
];

export const teacherScheduleDays = [
  { short: 'T2', date: '19/05', isToday: true },
  { short: 'T3', date: '20/05' },
  { short: 'T4', date: '21/05' },
  { short: 'T5', date: '22/05' },
  { short: 'T6', date: '23/05' },
  { short: 'T7', date: '24/05' },
  { short: 'CN', date: '25/05' }
];

export const teacherScheduleHours = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00'
];

export const teacherClassFilterChips = [
  { color: 'emerald' as ClassColor, label: 'A01' },
  { color: 'sky' as ClassColor, label: 'P03' },
  { color: 'amber' as ClassColor, label: 'M02' },
  { color: 'emerald' as ClassColor, label: 'A04' }
];

export const teacherProfile = {
  name: 'Ms. Linh Nguyễn',
  initials: 'LN',
  subject: 'Scratch / Python'
};
