export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseMode = 'Offline' | 'Online' | 'Online · Offline';

export type ParentCourse = {
  id: string;
  code: string;
  name: string;
  ageRange: string;
  level: CourseLevel;
  mode: CourseMode;
  sessions: number;
  duration: number;
  price: number;
  popular?: boolean;
  isNew?: boolean;
  goals: string;
  rating: number;
  learners: number;
};

export const parentCourses: ParentCourse[] = [
  {
    id: 'sc-basic',
    code: 'SC-101',
    name: 'Scratch Cơ bản2',
    ageRange: '6–8',
    level: 'Beginner',
    mode: 'Offline',
    sessions: 12,
    duration: 60,
    price: 2_400_000,
    popular: true,
    goals: 'Tư duy logic qua khối lệnh kéo–thả, kể chuyện và hoạt cảnh đơn giản.',
    rating: 4.8,
    learners: 312
  },
  {
    id: 'sc-game',
    code: 'SC-201',
    name: 'Scratch Game',
    ageRange: '9–11',
    level: 'Intermediate',
    mode: 'Online · Offline',
    sessions: 16,
    duration: 75,
    price: 3_200_000,
    popular: true,
    goals: 'Vòng lặp game, va chạm, điểm số — hoàn thiện một mini-game của riêng con.',
    rating: 4.7,
    learners: 218
  },
  {
    id: 'py-intro',
    code: 'PY-110',
    name: 'Python Khởi đầu',
    ageRange: '10–12',
    level: 'Beginner',
    mode: 'Online',
    sessions: 14,
    duration: 75,
    price: 2_800_000,
    isNew: true,
    goals: 'Cú pháp Python qua bài tập tương tác và dự án vẽ với turtle.',
    rating: 4.9,
    learners: 89
  },
  {
    id: 'web-junior',
    code: 'WB-120',
    name: 'Web Junior — HTML/CSS',
    ageRange: '11–14',
    level: 'Beginner',
    mode: 'Offline',
    sessions: 12,
    duration: 90,
    price: 3_000_000,
    goals: 'Xây trang web cá nhân đầu tiên, nguyên lý bố cục responsive cơ bản.',
    rating: 4.6,
    learners: 142
  }
];

export type ClassOption = {
  id: string;
  mode: 'Online' | 'Offline';
  branch: string;
  schedule: string;
  teacher: string;
  teacherInitials: string;
  capacity: number;
  enrolled: number;
  start: string;
  status: 'open' | 'full';
};

export const classesByCourse: Record<string, ClassOption[]> = {
  'sc-basic': [
    {
      id: 'A01',
      mode: 'Offline',
      branch: 'CS Cầu Giấy',
      schedule: 'T2, T4 · 18:00–19:00',
      teacher: 'Ms. Linh',
      teacherInitials: 'LN',
      capacity: 12,
      enrolled: 10,
      start: '20/05/2026',
      status: 'open'
    },
    {
      id: 'A02',
      mode: 'Online',
      branch: 'Zoom',
      schedule: 'T3, T5 · 19:30–20:30',
      teacher: 'Mr. Nam',
      teacherInitials: 'NM',
      capacity: 12,
      enrolled: 12,
      start: '22/05/2026',
      status: 'full'
    },
    {
      id: 'A03',
      mode: 'Offline',
      branch: 'CS Thanh Xuân',
      schedule: 'T7 · 09:00–10:00',
      teacher: 'Ms. Hoa',
      teacherInitials: 'HA',
      capacity: 12,
      enrolled: 7,
      start: '25/05/2026',
      status: 'open'
    },
    {
      id: 'A04',
      mode: 'Online',
      branch: 'Zoom',
      schedule: 'CN · 09:30–10:30',
      teacher: 'Ms. Mai',
      teacherInitials: 'MA',
      capacity: 12,
      enrolled: 3,
      start: '01/06/2026',
      status: 'open'
    }
  ],
  'sc-game': [
    {
      id: 'G01',
      mode: 'Offline',
      branch: 'CS Cầu Giấy',
      schedule: 'T3, T5 · 17:30–18:45',
      teacher: 'Mr. Đức',
      teacherInitials: 'DU',
      capacity: 14,
      enrolled: 9,
      start: '24/05/2026',
      status: 'open'
    },
    {
      id: 'G02',
      mode: 'Online',
      branch: 'Zoom',
      schedule: 'T2, T4 · 19:00–20:15',
      teacher: 'Ms. Linh',
      teacherInitials: 'LN',
      capacity: 14,
      enrolled: 13,
      start: '21/05/2026',
      status: 'open'
    }
  ],
  'py-intro': [
    {
      id: 'P01',
      mode: 'Online',
      branch: 'Zoom',
      schedule: 'T3, T5 · 19:30–20:45',
      teacher: 'Ms. Mai',
      teacherInitials: 'MA',
      capacity: 14,
      enrolled: 8,
      start: '26/05/2026',
      status: 'open'
    }
  ],
  'web-junior': [
    {
      id: 'W01',
      mode: 'Offline',
      branch: 'CS Cầu Giấy',
      schedule: 'T7 · 14:00–15:30',
      teacher: 'Mr. Đức',
      teacherInitials: 'DU',
      capacity: 12,
      enrolled: 5,
      start: '24/05/2026',
      status: 'open'
    }
  ]
};

export type CurriculumUnit = {
  i: number;
  title: string;
  desc: string;
  duration: number;
  kind: string;
};

export type CourseReview = {
  stars: number;
  parent: string;
  date: string;
  text: string;
};

export type CourseDetail = {
  tagline: string;
  longDescription: string;
  outcomes: string[];
  suitableFor: string[];
  prerequisites: string;
  syllabus: CurriculumUnit[];
  teacher: {
    name: string;
    initials: string;
    title: string;
    bio: string;
    stats: { label: string; value: string }[];
  };
  reviews: CourseReview[];
  gallery: { hue: number; label: string }[];
};

export const courseDetailsById: Record<string, CourseDetail> = {
  'sc-basic': {
    tagline: 'Bước đầu tiên với lập trình kéo–thả cho các bạn nhỏ 6–8 tuổi.',
    longDescription:
      'Scratch Cơ bản giúp con làm quen với tư duy thuật toán theo cách thân thiện nhất — qua các khối lệnh kéo thả nhiều màu sắc. Trong 12 buổi, con sẽ tự tay tạo ra hoạt cảnh, kể chuyện và game đầu tiên. Khóa học chú trọng việc khám phá và thử–sai, không yêu cầu kiến thức nền tảng.',
    outcomes: [
      'Hiểu khái niệm vòng lặp, điều kiện và sự kiện thông qua khối lệnh.',
      'Tự dựng được 3 dự án nhỏ: hoạt cảnh, kể chuyện và mini-game.',
      'Phát triển tư duy giải quyết vấn đề từng bước (chia nhỏ bài toán).',
      'Trình bày dự án trước lớp ở buổi tổng kết.'
    ],
    suitableFor: [
      'Bạn nhỏ 6–8 tuổi chưa từng học lập trình.',
      'Phụ huynh muốn cho con tiếp cận STEM một cách tự nhiên.',
      'Học sinh thích kể chuyện, vẽ và hoạt hình.'
    ],
    prerequisites: 'Không yêu cầu kinh nghiệm. Con cần biết đọc cơ bản và sử dụng chuột.',
    syllabus: [
      {
        i: 1,
        title: 'Làm quen Scratch',
        desc: 'Tour giao diện, làm quen sân khấu và nhân vật, tạo lệnh đầu tiên.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 2,
        title: 'Di chuyển & xoay',
        desc: 'Khối lệnh chuyển động, hệ tọa độ và hướng nhân vật.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 3,
        title: 'Vẽ với khối Pen',
        desc: 'Vẽ hình học và hoa văn bằng vòng lặp.',
        duration: 60,
        kind: 'Dự án nhỏ'
      },
      {
        i: 4,
        title: 'Hoạt cảnh đầu tiên',
        desc: 'Trang phục, âm thanh và chuyển cảnh.',
        duration: 60,
        kind: 'Dự án nhỏ'
      },
      {
        i: 5,
        title: 'Điều kiện If/Then',
        desc: 'Phản ứng khi chạm cạnh, va chạm với nhân vật khác.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 6,
        title: 'Mini game bóng đập tường',
        desc: 'Sản phẩm tổng hợp 1.',
        duration: 60,
        kind: 'Dự án'
      },
      {
        i: 7,
        title: 'Biến số & điểm số',
        desc: 'Thêm điểm số, mạng và màn hình thắng/thua.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 8,
        title: 'Sự kiện và phát tin',
        desc: 'Đồng bộ nhiều nhân vật, kể chuyện theo lớp.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 9,
        title: 'Câu chuyện tương tác',
        desc: 'Đa lựa chọn, kết thúc khác nhau.',
        duration: 60,
        kind: 'Dự án'
      },
      {
        i: 10,
        title: 'Hiệu ứng & âm thanh',
        desc: 'Hiệu ứng đồ họa, ghi âm và lồng tiếng.',
        duration: 60,
        kind: 'Thực hành'
      },
      {
        i: 11,
        title: 'Hoàn thiện dự án cuối',
        desc: 'Lên ý tưởng, thiết kế và xây dựng.',
        duration: 60,
        kind: 'Dự án'
      },
      {
        i: 12,
        title: 'Trình bày & tổng kết',
        desc: 'Buổi demo trước phụ huynh & nhận chứng chỉ.',
        duration: 60,
        kind: 'Trình bày'
      }
    ],
    teacher: {
      name: 'Ms. Linh',
      initials: 'LN',
      title: 'Giáo viên chính · 6 năm kinh nghiệm',
      bio: 'Tốt nghiệp Sư phạm Toán-Tin, có chứng chỉ Scratch Educator. Đã hướng dẫn 500+ học sinh và dẫn đội tuyển Scratch Day Hà Nội 2023.',
      stats: [
        { label: 'Năm KN', value: '6+' },
        { label: 'Học viên', value: '500+' },
        { label: 'Đánh giá', value: '4.9' }
      ]
    },
    reviews: [
      {
        stars: 5,
        parent: 'Phụ huynh bé Minh Khôi (7 tuổi)',
        date: 'tháng 4/2026',
        text: 'Con rất hào hứng mỗi buổi học, về nhà còn tự mày mò làm thêm. Cô Linh kiên nhẫn và biết cách khích lệ.'
      },
      {
        stars: 5,
        parent: 'Phụ huynh bé Thảo Vy (8 tuổi)',
        date: 'tháng 3/2026',
        text: 'Tiến bộ rõ rệt về cách suy luận từng bước. Dự án cuối khóa con tự làm được hoạt cảnh dài 2 phút.'
      },
      {
        stars: 4,
        parent: 'Phụ huynh bé Tuấn Anh (6 tuổi)',
        date: 'tháng 2/2026',
        text: 'Lớp đông một chút nên đôi lúc cô khó hỗ trợ 1-1, nhưng con rất vui và muốn học tiếp khóa Scratch Game.'
      }
    ],
    gallery: [
      { hue: 145, label: 'Tiết học mẫu' },
      { hue: 25, label: 'Dự án Scratch của HS' },
      { hue: 215, label: 'Buổi demo cuối khóa' },
      { hue: 285, label: 'Phòng học CS Cầu Giấy' }
    ]
  }
};

export const fallbackCourseDetail: CourseDetail = {
  tagline: 'Khóa học STEM dành cho học sinh đam mê khám phá công nghệ.',
  longDescription:
    'Mô tả chi tiết khóa học sẽ được trung tâm cập nhật. Vui lòng liên hệ tư vấn viên để biết thêm thông tin.',
  outcomes: [
    'Phát triển tư duy logic và giải quyết vấn đề.',
    'Hoàn thành dự án thực tế sau khóa học.',
    'Sẵn sàng cho khóa nâng cao tiếp theo.'
  ],
  suitableFor: ['Học sinh phù hợp độ tuổi của khóa.'],
  prerequisites: 'Vui lòng liên hệ trung tâm để được tư vấn cụ thể.',
  syllabus: [],
  teacher: {
    name: 'Đang cập nhật',
    initials: '--',
    title: 'Giáo viên trung tâm',
    bio: 'Hồ sơ giáo viên sẽ được cập nhật.',
    stats: []
  },
  reviews: [],
  gallery: [{ hue: 145, label: 'Đang cập nhật' }]
};

export type ParentChildEnrolled = {
  code: string;
  name: string;
  classId: string;
  mode: 'Online' | 'Offline';
  branch: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  done: number;
  total: number;
  nextOn: string;
};

export type ParentChildPending = {
  code: string;
  name: string;
  className: string;
  note: string;
};

export type ParentChildAchievement = {
  date: string;
  title: string;
  course: string;
  kind: 'project' | 'grade' | 'badge';
};

export type ParentChildWeeklyItem = {
  time: string;
  course: string;
};

export type ParentChildWeekDay = {
  day: string;
  date: string;
  items: ParentChildWeeklyItem[];
};

export type ParentChild = {
  id: string;
  name: string;
  initials: string;
  hue: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dob: string;
  age: number;
  level: CourseLevel;
  joinedAt: string;
  status: 'active' | 'new' | 'paused';
  school: string;
  address: string;
  parent: { name: string; relation: string; phone: string; email: string };
  parent2: { name: string; relation: string; phone: string; email: string } | null;
  health: { allergies: string; notes: string };
  interests: string[];
  enrolled: ParentChildEnrolled[];
  pending: ParentChildPending[];
  attendance: { attended: number; total: number; percent: number };
  skills: { k: string; v: number }[];
  achievements: ParentChildAchievement[];
  weekly: ParentChildWeekDay[];
};

const baseWeek = [
  { day: 'T2', date: '19/05' },
  { day: 'T3', date: '20/05' },
  { day: 'T4', date: '21/05' },
  { day: 'T5', date: '22/05' },
  { day: 'T6', date: '23/05' },
  { day: 'T7', date: '24/05' },
  { day: 'CN', date: '25/05' }
];

export const parentChildren: ParentChild[] = [
  {
    id: 'c1',
    name: 'Nguyễn An',
    initials: 'NA',
    hue: 145,
    gender: 'Nam',
    dob: '12/03/2018',
    age: 8,
    level: 'Beginner',
    joinedAt: '09/2024',
    status: 'active',
    school: 'TH Nguyễn Trãi · Lớp 3A',
    address: 'Cầu Giấy, Hà Nội',
    parent: {
      name: 'Nguyễn Văn Hùng',
      relation: 'Bố · Liên hệ chính',
      phone: '0912 345 678',
      email: 'hung.nguyen@gmail.com'
    },
    parent2: {
      name: 'Trần Thị Hoa',
      relation: 'Mẹ',
      phone: '0987 654 321',
      email: 'hoa.tran@gmail.com'
    },
    health: { allergies: 'Đậu phộng', notes: 'Cần để ý khi ăn nhẹ giữa giờ.' },
    interests: ['Lego', 'Vẽ', 'Game phiêu lưu'],
    enrolled: [
      {
        code: 'SC-101',
        name: 'Scratch Cơ bản',
        classId: 'A01',
        mode: 'Offline',
        branch: 'CS Cầu Giấy',
        teacher: 'Ms. Linh',
        teacherInitials: 'LN',
        schedule: 'T2, T4 · 18:00–19:00',
        done: 7,
        total: 12,
        nextOn: 'T2 · 19/05 · 18:00'
      },
      {
        code: 'MT-110',
        name: 'Toán tư duy 3',
        classId: 'M02',
        mode: 'Offline',
        branch: 'CS Cầu Giấy',
        teacher: 'Mr. Nam',
        teacherInitials: 'NM',
        schedule: 'T7 · 09:00–10:30',
        done: 3,
        total: 10,
        nextOn: 'T7 · 24/05 · 09:00'
      }
    ],
    pending: [
      { code: 'AR-120', name: 'Robot AR sơ cấp', className: 'R01', note: 'Chờ duyệt · gửi 11/05' }
    ],
    attendance: { attended: 18, total: 20, percent: 90 },
    skills: [
      { k: 'Tư duy logic', v: 78 },
      { k: 'Sáng tạo', v: 85 },
      { k: 'Tập trung', v: 62 },
      { k: 'Hợp tác nhóm', v: 70 }
    ],
    achievements: [
      {
        date: '04/05/2026',
        title: 'Hoàn thành dự án Hoạt cảnh đầu tiên',
        course: 'SC-101',
        kind: 'project'
      },
      {
        date: '27/04/2026',
        title: 'Đạt 9/10 bài kiểm tra giữa khóa',
        course: 'MT-110',
        kind: 'grade'
      },
      {
        date: '14/04/2026',
        title: 'Huy hiệu Tinh thần đồng đội',
        course: 'SC-101',
        kind: 'badge'
      }
    ],
    weekly: baseWeek.map((d, i) => ({
      ...d,
      items:
        i === 0 || i === 2
          ? [{ time: '18:00–19:00', course: 'SC-101 · Scratch Cơ bản' }]
          : i === 5
            ? [{ time: '09:00–10:30', course: 'MT-110 · Toán tư duy' }]
            : []
    }))
  },
  {
    id: 'c2',
    name: 'Nguyễn Bảo',
    initials: 'NB',
    hue: 25,
    gender: 'Nam',
    dob: '04/08/2014',
    age: 11,
    level: 'Intermediate',
    joinedAt: '02/2026',
    status: 'active',
    school: 'THCS Lê Quý Đôn · Lớp 6C',
    address: 'Cầu Giấy, Hà Nội',
    parent: {
      name: 'Nguyễn Văn Hùng',
      relation: 'Bố · Liên hệ chính',
      phone: '0912 345 678',
      email: 'hung.nguyen@gmail.com'
    },
    parent2: {
      name: 'Trần Thị Hoa',
      relation: 'Mẹ',
      phone: '0987 654 321',
      email: 'hoa.tran@gmail.com'
    },
    health: { allergies: 'Không', notes: '—' },
    interests: ['Game', 'Bóng rổ', 'Khoa học'],
    enrolled: [
      {
        code: 'PY-110',
        name: 'Python Khởi đầu',
        classId: 'P03',
        mode: 'Online',
        branch: 'Zoom',
        teacher: 'Ms. Mai',
        teacherInitials: 'MA',
        schedule: 'T3, T5 · 19:30–20:45',
        done: 2,
        total: 14,
        nextOn: 'T3 · 20/05 · 19:30'
      }
    ],
    pending: [],
    attendance: { attended: 2, total: 2, percent: 100 },
    skills: [
      { k: 'Tư duy logic', v: 72 },
      { k: 'Sáng tạo', v: 60 },
      { k: 'Tập trung', v: 80 },
      { k: 'Hợp tác nhóm', v: 55 }
    ],
    achievements: [
      { date: '08/05/2026', title: 'Buổi học đầu tiên · Python', course: 'PY-110', kind: 'badge' }
    ],
    weekly: baseWeek.map((d, i) => ({
      ...d,
      items: i === 1 || i === 3 ? [{ time: '19:30–20:45', course: 'PY-110 · Python Khởi đầu' }] : []
    }))
  },
  {
    id: 'c3',
    name: 'Nguyễn Khôi',
    initials: 'NK',
    hue: 285,
    gender: 'Nam',
    dob: '21/11/2019',
    age: 6,
    level: 'Beginner',
    joinedAt: '05/2026',
    status: 'new',
    school: 'MN Hoa Sen · Lớp Lá',
    address: 'Cầu Giấy, Hà Nội',
    parent: {
      name: 'Trần Thị Hoa',
      relation: 'Mẹ · Liên hệ chính',
      phone: '0987 654 321',
      email: 'hoa.tran@gmail.com'
    },
    parent2: null,
    health: { allergies: 'Không', notes: 'Cần khởi động vận động nhẹ trước buổi học.' },
    interests: ['Lego', 'Hoạt hình', 'Âm nhạc'],
    enrolled: [],
    pending: [
      {
        code: 'SC-101',
        name: 'Scratch Cơ bản',
        className: 'A04 · CN 09:30',
        note: 'Học thử · 25/05'
      }
    ],
    attendance: { attended: 0, total: 0, percent: 0 },
    skills: [
      { k: 'Tư duy logic', v: 30 },
      { k: 'Sáng tạo', v: 55 },
      { k: 'Tập trung', v: 40 },
      { k: 'Hợp tác nhóm', v: 45 }
    ],
    achievements: [],
    weekly: baseWeek.map((d, i) => ({
      ...d,
      items: i === 6 ? [{ time: '09:30–10:30', course: 'SC-101 · Học thử' }] : []
    }))
  }
];

export type ParentEventType = 'regular' | 'trial' | 'makeup' | 'workshop' | 'cancelled' | 'family';

export const parentEventTypeLabel: Record<ParentEventType, string> = {
  regular: 'Lớp định kỳ',
  trial: 'Học thử',
  makeup: 'Học bù',
  workshop: 'Workshop',
  cancelled: 'Đã hủy',
  family: 'Sự kiện gia đình'
};

export const parentEventTypeDot: Record<ParentEventType, string> = {
  regular: 'bg-foreground',
  trial: 'bg-emerald-500',
  makeup: 'bg-amber-500',
  workshop: 'bg-violet-500',
  cancelled: 'bg-destructive opacity-60',
  family: 'bg-sky-500'
};

export type ParentScheduleEvent = {
  id: string;
  childId: string | 'family';
  dayIndex: number;
  startHour: number;
  endHour: number;
  code: string;
  name: string;
  classId: string;
  mode: 'Online' | 'Offline';
  branch: string;
  teacher: string;
  teacherInitials: string;
  type: ParentEventType;
};

export const parentScheduleEvents: ParentScheduleEvent[] = [
  {
    id: 'pe-1',
    childId: 'c1',
    dayIndex: 0,
    startHour: 18,
    endHour: 19,
    code: 'SC-101',
    name: 'Scratch Cơ bản',
    classId: 'A01',
    mode: 'Offline',
    branch: 'CS Cầu Giấy',
    teacher: 'Ms. Linh',
    teacherInitials: 'LN',
    type: 'regular'
  },
  {
    id: 'pe-2',
    childId: 'c1',
    dayIndex: 2,
    startHour: 18,
    endHour: 19,
    code: 'SC-101',
    name: 'Scratch Cơ bản',
    classId: 'A01',
    mode: 'Offline',
    branch: 'CS Cầu Giấy',
    teacher: 'Ms. Linh',
    teacherInitials: 'LN',
    type: 'regular'
  },
  {
    id: 'pe-3',
    childId: 'c1',
    dayIndex: 5,
    startHour: 9,
    endHour: 10.5,
    code: 'MT-110',
    name: 'Toán tư duy 3',
    classId: 'M02',
    mode: 'Offline',
    branch: 'CS Cầu Giấy',
    teacher: 'Mr. Nam',
    teacherInitials: 'NM',
    type: 'regular'
  },
  {
    id: 'pe-4',
    childId: 'c1',
    dayIndex: 3,
    startHour: 17,
    endHour: 18,
    code: 'SC-101',
    name: 'Scratch — học bù buổi 6',
    classId: 'A01',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Linh',
    teacherInitials: 'LN',
    type: 'makeup'
  },
  {
    id: 'pe-5',
    childId: 'c2',
    dayIndex: 1,
    startHour: 19.5,
    endHour: 20.75,
    code: 'PY-110',
    name: 'Python Khởi đầu',
    classId: 'P03',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Mai',
    teacherInitials: 'MA',
    type: 'regular'
  },
  {
    id: 'pe-6',
    childId: 'c2',
    dayIndex: 3,
    startHour: 19.5,
    endHour: 20.75,
    code: 'PY-110',
    name: 'Python Khởi đầu',
    classId: 'P03',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Mai',
    teacherInitials: 'MA',
    type: 'regular'
  },
  {
    id: 'pe-7',
    childId: 'c2',
    dayIndex: 5,
    startHour: 14,
    endHour: 15.5,
    code: 'PY-110',
    name: 'Workshop dự án tự chọn',
    classId: 'P03',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Mai',
    teacherInitials: 'MA',
    type: 'workshop'
  },
  {
    id: 'pe-8',
    childId: 'c3',
    dayIndex: 6,
    startHour: 9.5,
    endHour: 10.5,
    code: 'SC-101',
    name: 'Scratch Cơ bản — học thử',
    classId: 'A04',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Mai',
    teacherInitials: 'MA',
    type: 'trial'
  },
  {
    id: 'pe-9',
    childId: 'c2',
    dayIndex: 4,
    startHour: 19,
    endHour: 20,
    code: 'PY-110',
    name: 'Buổi bổ trợ (hủy)',
    classId: 'P03',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Ms. Mai',
    teacherInitials: 'MA',
    type: 'cancelled'
  },
  {
    id: 'pe-10',
    childId: 'family',
    dayIndex: 4,
    startHour: 20,
    endHour: 21,
    code: 'PH-MEET',
    name: 'Họp PH định kỳ Q2',
    classId: '—',
    mode: 'Online',
    branch: 'Zoom',
    teacher: 'Trung tâm',
    teacherInitials: 'LM',
    type: 'family'
  }
];

export const parentScheduleDays = [
  { idx: 0, day: 'T2', date: '19/05', isToday: true },
  { idx: 1, day: 'T3', date: '20/05' },
  { idx: 2, day: 'T4', date: '21/05' },
  { idx: 3, day: 'T5', date: '22/05' },
  { idx: 4, day: 'T6', date: '23/05' },
  { idx: 5, day: 'T7', date: '24/05' },
  { idx: 6, day: 'CN', date: '25/05' }
];

export const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export const formatScheduleTime = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};
