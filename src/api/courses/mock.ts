import type { Course, CourseToolFilter } from './types';

export const courses: Course[] = [
  {
    id: 'c-1',
    code: 'CODE-101',
    title: 'Scratch Foundations',
    minAge: 7,
    maxAge: 10,
    tagline: 'Block-based intro',
    totalSessions: 24,
    sessionDurationMinutes: 75,
    classes: 3,
    enrolled: 46,
    capacity: 50,
    status: 'published',
    tool: 'scratch',
    cover: 'SCRATCH · COVER',
    version: 'v2.3',
    tuitionAmount: 3240000,
    originalTuitionAmount: 3600000,
    perClassCapacity: 12,
    description:
      'A block-based introduction to programming. Students build games & stories using motion, looks, events and variables.',
    curriculum: [
      'Sprites & stage',
      'Motion & looks',
      'Events & broadcasts',
      'Variables & lists',
      '… 8 more units'
    ],
    discounts: [
      {
        name: 'Early Bird',
        type: 'percentage',
        value: 10,
        condition: 'before_date',
        conditionDate: '2026-06-30'
      },
      { name: 'Sibling discount', type: 'fixed', value: 200000, condition: 'has_sibling' },
      {
        name: 'Free trial week',
        type: 'special',
        value: '1 trial session',
        condition: 'trial_only'
      }
    ],
    pricingNotes: 'Refundable within 7 days if you cancel before the first session.'
  },
  {
    id: 'c-2',
    code: 'CODE-201',
    title: 'Python for Kids',
    minAge: 10,
    maxAge: 13,
    tagline: 'Text-based intro',
    totalSessions: 32,
    sessionDurationMinutes: 90,
    classes: 4,
    enrolled: 39,
    capacity: 50,
    status: 'published',
    tool: 'scratch',
    cover: 'PYTHON · COVER',
    version: 'v1.8',
    tuitionAmount: 3780000,
    originalTuitionAmount: 4200000,
    perClassCapacity: 14,
    description:
      'Move from blocks to real code. Students write Python scripts to solve puzzles, build small games and explore data.',
    curriculum: [
      'Hello, Python',
      'Variables & types',
      'Conditionals',
      'Loops & iteration',
      '… 12 more units'
    ],
    discounts: [
      {
        name: 'Summer promo',
        type: 'percentage',
        value: 10,
        condition: 'before_date',
        conditionDate: '2026-07-15'
      },
      { name: 'Returning student', type: 'fixed', value: 300000, condition: 'none' }
    ]
  },
  {
    id: 'c-3',
    code: 'DSGN-110',
    title: 'Web Design Studio',
    minAge: 11,
    maxAge: 14,
    tagline: 'HTML & CSS',
    totalSessions: 20,
    sessionDurationMinutes: 75,
    classes: 3,
    enrolled: 32,
    capacity: 50,
    status: 'published',
    tool: 'scratch',
    cover: 'WEB · COVER',
    version: 'v1.4',
    tuitionAmount: 3200000,
    perClassCapacity: 12,
    description:
      'Design and build personal websites with HTML, CSS, and responsive layout fundamentals.',
    curriculum: [
      'HTML structure',
      'CSS basics',
      'Flexbox & grid',
      'Responsive design',
      '… 6 more units'
    ]
  },
  {
    id: 'c-4',
    code: 'ROBO-220',
    title: 'Robotics with mBot2',
    minAge: 12,
    maxAge: 15,
    tagline: 'Hardware',
    totalSessions: 28,
    sessionDurationMinutes: 90,
    classes: 2,
    enrolled: 16,
    capacity: 40,
    status: 'published',
    tool: 'mbot2',
    cover: 'MBOT2 · COVER',
    version: 'v2.0',
    tuitionAmount: 4860000,
    originalTuitionAmount: 5400000,
    perClassCapacity: 10,
    description:
      'Hands-on robotics: students build and program mBot2 robots, control motors, read sensors and design mini-robots.',
    curriculum: ['Circuits & wiring', 'mBot2 IDE', 'Sensors', 'Motors & servos', '… 10 more units'],
    discounts: [
      { name: 'Hardware bundle', type: 'percentage', value: 10, condition: 'none' },
      {
        name: 'Free mBot2 kit',
        type: 'special',
        value: 'Includes a starter kit',
        condition: 'none'
      }
    ],
    pricingNotes: 'Tuition includes the mBot2 starter kit (worth ₫800,000).'
  },
  {
    id: 'c-5',
    code: 'GAME-310',
    title: 'Game Dev with Unity',
    minAge: 13,
    maxAge: 16,
    tagline: 'C#',
    totalSessions: 36,
    sessionDurationMinutes: 90,
    classes: 2,
    enrolled: 21,
    capacity: 50,
    status: 'draft',
    tool: 'scratch',
    cover: 'UNITY · COVER',
    version: 'v0.9',
    tuitionAmount: 5800000,
    perClassCapacity: 10,
    description:
      'Build 2D and 3D games in Unity using C#. Capstone: ship a small playable game to itch.io.',
    curriculum: [
      'Unity editor tour',
      'C# fundamentals',
      'Sprites & physics',
      'Scenes & prefabs',
      '… 14 more units'
    ]
  },
  {
    id: 'c-6',
    code: 'AI-150',
    title: 'AI Explorers',
    minAge: 12,
    maxAge: 15,
    tagline: 'No-code AI',
    totalSessions: 16,
    sessionDurationMinutes: 75,
    classes: 2,
    enrolled: 24,
    capacity: 40,
    status: 'published',
    tool: 'techai',
    cover: 'AI · COVER',
    version: 'v1.0',
    tuitionAmount: 3000000,
    perClassCapacity: 12,
    description:
      'Hands-on intro to machine learning with no-code tools. Train models for images, sound, and text.',
    curriculum: [
      'What is AI',
      'Teachable Machine',
      'Image models',
      'Bias & fairness',
      '… 4 more units'
    ]
  },
  {
    id: 'c-7',
    code: 'MUSIC-101',
    title: 'Violin Beginners',
    minAge: 8,
    maxAge: 11,
    tagline: 'Strings & posture',
    totalSessions: 24,
    sessionDurationMinutes: 60,
    classes: 3,
    enrolled: 28,
    capacity: 45,
    status: 'published',
    tool: 'violin',
    cover: 'VIOLIN · COVER',
    version: 'v1.2',
    tuitionAmount: 3400000,
    perClassCapacity: 15,
    description:
      'Build a strong foundation on the violin through posture, bowing, and simple repertoire.',
    curriculum: [
      'Posture & grip',
      'First bowing',
      'Open strings',
      'Simple melodies',
      '… 8 more units'
    ]
  },
  {
    id: 'c-8',
    code: 'CODE-301',
    title: 'JavaScript Builders',
    minAge: 13,
    maxAge: 16,
    tagline: 'Web apps',
    totalSessions: 28,
    sessionDurationMinutes: 90,
    classes: 2,
    enrolled: 18,
    capacity: 40,
    status: 'published',
    tool: 'scratch',
    cover: 'JS · COVER',
    version: 'v1.5',
    tuitionAmount: 4800000,
    perClassCapacity: 12,
    description:
      'Modern JavaScript from variables to fetch. Students ship a small web app deployed to the cloud.',
    curriculum: [
      'JS fundamentals',
      'DOM & events',
      'Fetch & APIs',
      'State patterns',
      '… 10 more units'
    ]
  },
  {
    id: 'c-9',
    code: 'DSGN-210',
    title: 'UI/UX Workshop',
    minAge: 12,
    maxAge: 15,
    tagline: 'Figma',
    totalSessions: 20,
    sessionDurationMinutes: 90,
    classes: 2,
    enrolled: 14,
    capacity: 30,
    status: 'draft',
    tool: 'scratch',
    cover: 'UIUX · COVER',
    version: 'v0.6',
    tuitionAmount: 3800000,
    perClassCapacity: 10,
    description:
      'Design thinking, wireframes and high-fidelity mockups in Figma. Culminates in a portfolio piece.',
    curriculum: ['Design thinking', 'Wireframing', 'Components', 'Prototyping', '… 6 more units']
  },
  {
    id: 'c-10',
    code: 'ROBO-110',
    title: 'mTiny Adventures',
    minAge: 4,
    maxAge: 7,
    tagline: 'Early robotics',
    totalSessions: 20,
    sessionDurationMinutes: 60,
    classes: 4,
    enrolled: 38,
    capacity: 60,
    status: 'published',
    tool: 'mtiny',
    cover: 'MTINY · COVER',
    version: 'v1.7',
    tuitionAmount: 3990000,
    originalTuitionAmount: 4200000,
    perClassCapacity: 12,
    description:
      'Pre-readers guide the mTiny robot with map cards. Introduces logical sequencing and event-based thinking without screens.',
    curriculum: [
      'Tap Pen basics',
      'Direction cards',
      'Map missions',
      'Story sequences',
      '… 6 more units'
    ],
    discounts: [
      { name: 'Sibling discount', type: 'fixed', value: 210000, condition: 'has_sibling' }
    ]
  },
  {
    id: 'c-11',
    code: 'STEM-120',
    title: 'Math Olympiad Prep',
    minAge: 10,
    maxAge: 13,
    tagline: 'Problem solving',
    totalSessions: 32,
    sessionDurationMinutes: 75,
    classes: 3,
    enrolled: 30,
    capacity: 45,
    status: 'published',
    tool: 'techai',
    cover: 'MATH · COVER',
    version: 'v2.1',
    tuitionAmount: 3600000,
    perClassCapacity: 12,
    description:
      'Sharpen problem-solving skills with classic Olympiad-style questions and mathematical reasoning.',
    curriculum: [
      'Number theory',
      'Combinatorics',
      'Geometry tricks',
      'Logic puzzles',
      '… 12 more units'
    ]
  },
  {
    id: 'c-12',
    code: 'GAME-210',
    title: 'Roblox Studio',
    minAge: 10,
    maxAge: 13,
    tagline: 'Lua',
    totalSessions: 24,
    sessionDurationMinutes: 75,
    classes: 3,
    enrolled: 33,
    capacity: 45,
    status: 'published',
    tool: 'scratch',
    cover: 'ROBLOX · COVER',
    version: 'v1.3',
    tuitionAmount: 4000000,
    perClassCapacity: 12,
    description:
      'Build games in Roblox Studio with Lua scripting, terrain editing, and multiplayer basics.',
    curriculum: ['Studio tour', 'Lua basics', 'Parts & scripts', 'Multiplayer', '… 8 more units']
  },
  {
    id: 'c-13',
    code: 'MUSIC-201',
    title: 'Violin Intermediate',
    minAge: 11,
    maxAge: 14,
    tagline: 'Repertoire',
    totalSessions: 16,
    sessionDurationMinutes: 60,
    classes: 2,
    enrolled: 12,
    capacity: 30,
    status: 'draft',
    tool: 'violin',
    cover: 'VIOLIN · COVER',
    version: 'v0.4',
    tuitionAmount: 2800000,
    perClassCapacity: 10,
    description:
      'Move past the basics with shifting, vibrato fundamentals, and small ensemble work.',
    curriculum: ['Shifting basics', 'Vibrato', 'Phrasing', 'Ensemble cues', '… 4 more units']
  },
  {
    id: 'c-14',
    code: 'CODE-150',
    title: 'mTiny Storytellers',
    minAge: 5,
    maxAge: 8,
    tagline: 'Story coding',
    totalSessions: 20,
    sessionDurationMinutes: 75,
    classes: 2,
    enrolled: 22,
    capacity: 30,
    status: 'published',
    tool: 'mtiny',
    cover: 'MTINY · COVER',
    version: 'v1.1',
    tuitionAmount: 3200000,
    perClassCapacity: 10,
    description:
      'Combine mTiny missions with story prompts so kids author small adventures while learning sequencing.',
    curriculum: [
      'Tap Pen routines',
      'Sequencing cards',
      'Conditionals',
      'Mission design',
      '… 6 more units'
    ]
  },
  {
    id: 'c-15',
    code: 'STEM-220',
    title: 'TechAI Data Science Junior',
    minAge: 13,
    maxAge: 16,
    tagline: 'Pandas & charts',
    totalSessions: 24,
    sessionDurationMinutes: 90,
    classes: 1,
    enrolled: 8,
    capacity: 20,
    status: 'draft',
    tool: 'techai',
    cover: 'DATA · COVER',
    version: 'v0.3',
    tuitionAmount: 4400000,
    perClassCapacity: 8,
    description:
      'Wrangle real datasets in Python with Pandas. Learn to ask questions, plot answers and tell data stories.',
    curriculum: ['CSV & DataFrames', 'Cleaning', 'Plotting', 'Storytelling', '… 8 more units']
  }
];

export const courseToolTabConfig: { value: CourseToolFilter }[] = [
  { value: 'all' },
  { value: 'mtiny' },
  { value: 'scratch' },
  { value: 'mbot2' },
  { value: 'techai' },
  { value: 'violin' }
];
