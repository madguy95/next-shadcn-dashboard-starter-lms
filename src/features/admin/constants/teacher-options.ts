export const subjects = [
  'Scratch',
  'Python',
  'Web Design',
  'Robotics',
  'Game Dev',
  'AI Explorers'
] as const;

export const locations = ['Hanoi · Vinsmart', 'Online only'] as const;

export const subjectOptions = subjects.map((s) => ({ value: s, label: s }));
export const locationOptions = locations.map((l) => ({ value: l, label: l }));
