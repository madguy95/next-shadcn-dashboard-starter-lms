import type { AvatarTone } from '@/constants/avatar';
import { apiClient } from '@/lib/api-client';
import type { PublicTeacher } from './types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

type PublicTeacherDto = {
  id: number;
  fullName: string;
  initials: string;
  avatarUrl?: string;
  subjects: string[];
  bio?: string;
  studentCount: number;
  rating: number;
};

function pickTone(id: number): AvatarTone {
  return AVATAR_TONES[((id % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length];
}

function mapPublicTeacher(dto: PublicTeacherDto): PublicTeacher {
  return {
    id: dto.id,
    name: dto.fullName,
    initials: dto.initials,
    tone: pickTone(dto.id),
    subjects: dto.subjects ?? [],
    bio: dto.bio,
    avatarUrl: dto.avatarUrl,
    studentCount: dto.studentCount ?? 0,
    rating: dto.rating ?? 0
  };
}

// Public endpoint — no auth required. apiClient omits the Authorization header when no token exists.
export async function getPublicTeachers(): Promise<PublicTeacher[]> {
  const data = await apiClient<PublicTeacherDto[]>('/api/public/teachers');
  return data.map(mapPublicTeacher);
}
