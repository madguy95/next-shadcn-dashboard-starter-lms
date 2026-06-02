import type { AvatarTone } from '@/constants/avatar';

export type PublicTeacher = {
  id: number;
  name: string;
  initials: string;
  tone: AvatarTone;
  subjects: string[];
  bio?: string;
  avatarUrl?: string;
  studentCount: number;
  rating: number;
};
