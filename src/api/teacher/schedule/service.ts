import { apiClient } from '@/lib/api-client';
import type {
  TeacherScheduleClassChip,
  TeacherScheduleColor,
  TeacherScheduleDay,
  TeacherScheduleEvent,
  TeacherScheduleParams,
  TeacherScheduleSummary,
  TeacherScheduleWeek
} from './types';

type EventDto = {
  id: string;
  classId: number | string;
  classLabel: string;
  courseCode: string;
  title: string;
  dayIndex: number;
  startMin: number;
  durationMin: number;
  location: string;
  isOnline: boolean;
  studentCount: number;
  color: TeacherScheduleColor;
  isMakeup: boolean;
  makeupStudent?: string;
};

type DayDto = {
  dayOfMonth: number;
  isToday?: boolean;
  isoDate: string;
};

type ClassChipDto = {
  id: number | string;
  label: string;
  color: TeacherScheduleColor;
};

type SummaryDto = {
  weekStart: string;
  weekEnd: string;
  todayIso?: string;
  sessionsThisWeek: number;
  teachingMinutes: number;
  onlineCount: number;
  makeupCount: number;
};

type TeacherScheduleWeekDto = {
  summary: SummaryDto;
  days: DayDto[];
  events: EventDto[];
  classChips: ClassChipDto[];
};

function mapEvent(dto: EventDto): TeacherScheduleEvent {
  return {
    id: dto.id,
    classId: String(dto.classId),
    classLabel: dto.classLabel,
    courseCode: dto.courseCode,
    title: dto.title,
    dayIndex: dto.dayIndex,
    startMin: dto.startMin,
    durationMin: dto.durationMin,
    location: dto.location,
    isOnline: dto.isOnline,
    studentCount: dto.studentCount,
    color: dto.color,
    isMakeup: dto.isMakeup,
    makeupStudent: dto.makeupStudent
  };
}

function mapDay(dto: DayDto): TeacherScheduleDay {
  return {
    dayOfMonth: dto.dayOfMonth,
    isToday: dto.isToday ?? false,
    isoDate: dto.isoDate
  };
}

function mapChip(dto: ClassChipDto): TeacherScheduleClassChip {
  return { id: String(dto.id), label: dto.label, color: dto.color };
}

function mapSummary(dto: SummaryDto): TeacherScheduleSummary {
  return {
    weekStart: dto.weekStart,
    weekEnd: dto.weekEnd,
    todayIso: dto.todayIso,
    sessionsThisWeek: dto.sessionsThisWeek,
    teachingMinutes: dto.teachingMinutes,
    onlineCount: dto.onlineCount,
    makeupCount: dto.makeupCount
  };
}

function buildQuery(params: TeacherScheduleParams): string {
  const qs = new URLSearchParams();
  if (params.anchor) qs.set('anchor', params.anchor);
  if (params.classId) qs.set('classId', params.classId);
  return qs.toString();
}

export async function getTeacherScheduleWeek(
  params: TeacherScheduleParams = {}
): Promise<TeacherScheduleWeek> {
  const qs = buildQuery(params);
  const endpoint = qs ? `/api/teacher/schedule?${qs}` : '/api/teacher/schedule';
  const dto = await apiClient<TeacherScheduleWeekDto>(endpoint);
  return {
    summary: mapSummary(dto.summary),
    days: dto.days.map(mapDay),
    events: dto.events.map(mapEvent),
    classChips: dto.classChips.map(mapChip)
  };
}
