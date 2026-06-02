'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  ATTENDANCE_STATUSES,
  NOTE_RATINGS,
  classDetailOptions,
  classSessionsOptions,
  classStudentsOptions,
  saveSessionAttendance,
  saveSessionNotes,
  sessionAttendanceOptions,
  sessionNotesOptions,
  teacherClassDetailKeys,
  type AttendanceStatus,
  type ClassDetail,
  type ClassSession,
  type ClassStudent,
  type StudentNote,
  type StudentNoteRating
} from '@/api/teacher/class-detail';
import { formatApiError } from '@/lib/api-client';
import { ClassDetailSkeleton } from './class-detail-skeleton';
import {
  attendanceStatusActive,
  attendanceStatusDot,
  classColorTokens,
  sessionStatusDot,
  studentNoteRatingClass,
  studentToneClass
} from '@/features/teacher/data';
import { cn } from '@/lib/utils';

// Status buttons exclude 'unmarked' — it's the empty state, not a pickable mark.
const ATTENDANCE_ORDER = ATTENDANCE_STATUSES.filter(
  (s): s is Exclude<AttendanceStatus, 'unmarked'> => s !== 'unmarked'
);

function StudentAvatar({
  student,
  size = 8
}: {
  student: Pick<ClassStudent, 'initials' | 'tone'>;
  size?: 7 | 8 | 9 | 10;
}) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-full text-[11px] font-semibold',
        studentToneClass[student.tone],
        size === 7 && 'h-7 w-7 text-[10px]',
        size === 8 && 'h-8 w-8',
        size === 9 && 'h-9 w-9 text-xs',
        size === 10 && 'h-10 w-10 text-[13px]'
      )}
    >
      {student.initials}
    </span>
  );
}

function AttendanceBar({ attended, total }: { attended: number; total: number }) {
  const pct = total > 0 ? (attended / total) * 100 : 0;
  const tone = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className='flex items-center gap-2'>
      <div className='bg-muted h-1.5 w-16 overflow-hidden rounded-full'>
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className='font-mono text-xs tabular-nums'>
        {attended}/{total}
      </span>
    </div>
  );
}

function ClassHeader({ d }: { d: ClassDetail }) {
  const t = useTranslations('teacherClassDetail');
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div
        className={cn(
          'relative h-24 border-b',
          !d.coverUrl && classColorTokens[d.color].bg,
          !d.coverUrl &&
            'bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_8px,transparent_8px_16px)]'
        )}
      >
        {d.coverUrl && (
          <Image
            src={d.coverUrl}
            alt={d.title}
            fill
            sizes='(min-width: 1024px) 768px, 100vw'
            className='object-cover'
          />
        )}
      </div>
      <div className='flex flex-wrap items-start justify-between gap-6 p-5'>
        <div>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            <span className='bg-background inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
              {d.id}
            </span>
            <span className='text-muted-foreground font-mono text-[11px]'>{d.courseCode}</span>
            {d.status === 'running' && (
              <span className='inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-emerald-800 uppercase'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                {t('statusTeaching')}
              </span>
            )}
          </div>
          <h1 className='text-2xl font-semibold tracking-tight'>{d.title}</h1>
          <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm'>
            <span className='inline-flex items-center gap-1.5'>
              <Icons.workspace className='size-3.5' />
              {d.location}
            </span>
            <span>·</span>
            <span>{d.schedule}</span>
            <span>·</span>
            <span className='font-mono'>{d.termRange}</span>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='sm' className='h-9'>
            <Icons.book className='size-3.5' />
            {t('actions.syllabus')}
          </Button>
          <Button variant='outline' size='sm' className='h-9'>
            <Icons.upload className='size-3.5 rotate-180' />
            {t('actions.exportReport')}
          </Button>
          <Button size='sm' className='h-9 px-4'>
            <Icons.check className='size-3.5' />
            {t('actions.attendanceToday')}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 divide-x border-t md:grid-cols-4'>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('header.progress')}
          </div>
          <div className='text-lg leading-tight font-semibold'>
            {t('header.sessionOf', { current: d.sessionCurrent, total: d.sessionTotal })}
          </div>
          <div className='bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full'>
            <div
              className='bg-foreground h-full rounded-full'
              style={{ width: `${(d.sessionCurrent / d.sessionTotal) * 100}%` }}
            />
          </div>
        </div>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('header.size')}
          </div>
          <div className='text-lg leading-tight font-semibold'>
            {t('header.studentsCount', { count: d.studentCount })}
          </div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            {t('header.weekPresentAbsent', {
              present: d.presentLastWeek,
              absent: d.absentLastWeek
            })}
          </div>
        </div>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('header.attendanceAvg')}
          </div>
          <div className='text-lg leading-tight font-semibold text-emerald-700'>
            {d.attendanceRate}
            <span className='text-muted-foreground text-sm font-normal'>%</span>
          </div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            {t('header.attendedRatio', { attended: d.attendedCount, total: d.attendedTotal })}
          </div>
        </div>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {t('header.needsReview')}
          </div>
          <div className='text-lg leading-tight font-semibold text-amber-700'>
            {t('header.needsReviewStudents', { count: d.needsReviewCount })}
          </div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            {d.needsReviewSession}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ classId }: { classId: string }) {
  const t = useTranslations('teacherClassDetail');
  const [search, setSearch] = React.useState('');
  const { data, isFetching } = useQuery({
    ...classStudentsOptions(classId, search || undefined),
    placeholderData: keepPreviousData
  });

  const students = data?.students ?? [];
  const totalAll = data?.totalAll ?? 0;

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='relative w-full sm:w-72'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('students.searchPlaceholder')}
            className='h-8 pl-8 text-xs'
          />
        </div>
        <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
          <Icons.adjustments className='size-3' />
          {t('students.filter')}
        </Button>
        <span className='text-muted-foreground ml-auto font-mono text-xs'>
          {t('students.count', { count: totalAll })}
        </span>
      </div>

      <LoadingOverlay visible={isFetching} message={t('updating')}>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/30'>
              <TableRow>
                <TableHead className='w-9 px-4'>
                  <Checkbox aria-label={t('students.selectAll')} />
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colStudent')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colCode')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colParent')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colContact')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colAttendance')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('students.colLastSession')}
                </TableHead>
                <TableHead className='px-4 text-right' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='text-muted-foreground py-10 text-center text-sm'
                  >
                    {t('students.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className='px-4 py-3'>
                      <Checkbox aria-label={t('students.select', { name: s.name })} />
                    </TableCell>
                    <TableCell className='py-3'>
                      <div className='flex items-center gap-2.5'>
                        <StudentAvatar student={s} />
                        <div className='leading-tight'>
                          <div className='font-medium'>{s.name}</div>
                          <div className='text-muted-foreground text-[11px]'>
                            {t('students.ageGrade', { age: s.age, grade: s.grade })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground py-3 font-mono text-xs'>
                      {s.id}
                    </TableCell>
                    <TableCell className='py-3'>{s.parentName}</TableCell>
                    <TableCell className='text-muted-foreground py-3 font-mono text-xs'>
                      {s.parentPhone}
                    </TableCell>
                    <TableCell className='py-3'>
                      <AttendanceBar attended={s.attendedSessions} total={s.totalSessions} />
                    </TableCell>
                    <TableCell className='py-3'>
                      <span className='inline-flex items-center gap-1.5 text-xs'>
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            attendanceStatusDot[s.lastStatus]
                          )}
                        />
                        {t(`attendanceStatus.${s.lastStatus}`)} · {s.lastSessionLabel}
                      </span>
                    </TableCell>
                    <TableCell className='px-4 py-3 text-right'>
                      <Button variant='ghost' size='icon' className='h-7 w-7'>
                        <Icons.ellipsis className='size-3.5' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LoadingOverlay>

      <div className='text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-3 text-xs'>
        <span>{t('students.showing', { shown: students.length, total: totalAll })}</span>
        <div className='flex items-center gap-1'>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
            {t('students.prev')}
          </Button>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
            {t('students.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AttendanceSessionPill({
  session,
  active,
  label,
  onSelect
}: {
  session: ClassSession;
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  if (session.status === 'upcoming') {
    return (
      <button
        type='button'
        disabled
        className='text-muted-foreground inline-flex h-7 items-center gap-1 rounded-md border border-dashed px-2 font-mono text-xs whitespace-nowrap opacity-60'
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-xs whitespace-nowrap',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'text-muted-foreground hover:bg-accent'
      )}
    >
      {label}
      <span className={cn('h-1.5 w-1.5 rounded-full', sessionStatusDot[session.status])} />
    </button>
  );
}

function SessionsEmptyState() {
  const t = useTranslations('teacherClassDetail');
  return (
    <div className='bg-card rounded-lg border p-10 text-center shadow-sm'>
      <div className='bg-muted text-muted-foreground mx-auto grid h-12 w-12 place-items-center rounded-md'>
        <Icons.check className='size-5' />
      </div>
      <h3 className='mt-3 font-semibold tracking-tight'>{t('emptySessions.title')}</h3>
      <p className='text-muted-foreground mt-1 text-sm'>{t('emptySessions.description')}</p>
    </div>
  );
}

function AttendanceTab({
  classId,
  students,
  sessions,
  currentSessionId
}: {
  classId: string;
  students: ClassStudent[];
  sessions: ClassSession[];
  currentSessionId: string;
}) {
  const t = useTranslations('teacherClassDetail');
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = React.useState(currentSessionId);
  const { data, isFetching } = useQuery(sessionAttendanceOptions(classId, sessionId));

  const [marks, setMarks] = React.useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (data?.marks) setMarks(data.marks);
  }, [data?.marks]);
  React.useEffect(() => {
    if (data) setNotes(data.notes ?? {});
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => saveSessionAttendance(classId, sessionId, { marks, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherClassDetailKeys.attendance(classId, sessionId)
      });
      queryClient.invalidateQueries({ queryKey: teacherClassDetailKeys.detail(classId) });
      toast.success(t('attendance.saveSuccess'));
    },
    onError: (err) => toast.error(formatApiError(err, t('attendance.saveError')).title)
  });

  if (!sessionId) return <SessionsEmptyState />;
  if (!data) return <AttendanceTabSkeleton />;

  const meta = data.meta;
  const activeSession = sessions.find((s) => s.id === sessionId);
  const markedCount = students.filter((s) => (marks[s.id] ?? 'unmarked') !== 'unmarked').length;
  const counts = { present: 0, excused: 0, absent: 0, unmarked: 0 };
  for (const s of students) {
    const m = marks[s.id] ?? 'unmarked';
    if (m === 'present') counts.present++;
    else if (m === 'excused') counts.excused++;
    else if (m === 'absent') counts.absent++;
    else counts.unmarked++;
  }

  const setAll = (status: AttendanceStatus) =>
    setMarks(Object.fromEntries(students.map((s) => [s.id, status])));

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>
            {t('attendance.sessionLabel')}
          </span>
          <Button variant='outline' size='sm' className='h-8 px-3 text-sm font-medium'>
            <span className='font-mono'>
              {activeSession ? `${activeSession.id} · ${activeSession.dateLabel}` : sessionId}
            </span>
            {sessionId === currentSessionId && (
              <span className='bg-foreground text-background rounded px-1.5 py-0.5 text-[10px] tracking-wider uppercase'>
                {t('attendance.today')}
              </span>
            )}
            <Icons.chevronDown className='size-3' />
          </Button>
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto'>
          {sessions.map((s) => (
            <AttendanceSessionPill
              key={s.id}
              session={s}
              active={s.id === sessionId}
              label={`${s.id} · ${s.dateLabel}`}
              onSelect={() => setSessionId(s.id)}
            />
          ))}
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <span className='text-muted-foreground text-xs'>
            <span className='text-foreground font-mono'>
              {markedCount}/{students.length}
            </span>{' '}
            {t('attendance.marked')}
          </span>
          <Button
            size='sm'
            className='h-8 px-3 text-xs'
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <Icons.spinner className='size-3 animate-spin' />
            ) : (
              <Icons.check className='size-3' />
            )}
            {t('attendance.save')}
          </Button>
        </div>
      </div>

      <div className='bg-muted/30 flex flex-wrap items-center gap-2 px-4 py-2 text-xs'>
        <span className='text-muted-foreground'>{t('attendance.quickSet')}</span>
        <button
          type='button'
          onClick={() => setAll('present')}
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-emerald-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />{' '}
          {t('attendanceStatus.present')}
        </button>
        <button
          type='button'
          onClick={() => setAll('absent')}
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-rose-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' /> {t('attendanceStatus.absent')}
        </button>
        <button
          type='button'
          onClick={() => setAll('excused')}
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-amber-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-amber-500' /> {t('attendanceStatus.excused')}
        </button>
        <span className='text-muted-foreground ml-auto font-mono'>{meta?.timeLabel ?? ''}</span>
      </div>

      <LoadingOverlay visible={isFetching} message={t('updating')}>
        <ul className='divide-y'>
          {students.map((s) => {
            const status = marks[s.id] ?? 'unmarked';
            const isHighlightExcused = status === 'excused';
            const isHighlightAbsent = status === 'absent';
            return (
              <li
                key={s.id}
                className={cn(
                  'hover:bg-muted/30 flex flex-wrap items-center gap-3 px-4 py-3',
                  isHighlightExcused && 'bg-amber-50/40',
                  isHighlightAbsent && 'bg-rose-50/40'
                )}
              >
                <StudentAvatar student={s} size={9} />
                <div className='min-w-0 flex-1'>
                  <div className='font-medium'>
                    {s.name}
                    <span className='text-muted-foreground ml-1 font-mono text-[11px]'>{s.id}</span>
                    {status === 'unmarked' && (
                      <span className='bg-muted text-muted-foreground ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px]'>
                        {t('attendance.unmarkedBadge')}
                      </span>
                    )}
                  </div>
                  <div className='text-muted-foreground text-[11px]'>
                    {t('attendance.studentAttendance', {
                      attended: s.attendedSessions,
                      total: s.totalSessions
                    })}
                    {isHighlightAbsent && ` · ${t('attendance.considerCall')}`}
                  </div>
                </div>

                <div className='bg-muted inline-flex items-center rounded-md border p-0.5'>
                  {ATTENDANCE_ORDER.map((opt) => {
                    const active = status === opt;
                    return (
                      <button
                        key={opt}
                        type='button'
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: opt }))}
                        className={cn(
                          'inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition',
                          active
                            ? attendanceStatusActive[opt]
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', attendanceStatusDot[opt])}
                        />
                        {t(`attendanceStatus.${opt}`)}
                      </button>
                    );
                  })}
                </div>

                <Input
                  value={notes[s.id] ?? ''}
                  onChange={(e) => setNotes((m) => ({ ...m, [s.id]: e.target.value }))}
                  placeholder={t('attendance.notePlaceholder')}
                  className='h-8 w-full text-xs sm:w-40'
                />
              </li>
            );
          })}
        </ul>
      </LoadingOverlay>

      <div className='bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
        <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-xs'>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' /> {t('attendance.legendPresent')}
            : <span className='text-foreground font-mono'>{counts.present}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-amber-500' /> {t('attendance.legendExcused')}:{' '}
            <span className='text-foreground font-mono'>{counts.excused}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-rose-500' /> {t('attendance.legendAbsent')}:{' '}
            <span className='text-foreground font-mono'>{counts.absent}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='bg-muted-foreground h-2 w-2 rounded-full' />{' '}
            {t('attendance.legendUnmarked')}:{' '}
            <span className='text-foreground font-mono'>{counts.unmarked}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function NotesTab({
  classId,
  students,
  sessions,
  currentSessionId
}: {
  classId: string;
  students: ClassStudent[];
  sessions: ClassSession[];
  currentSessionId: string;
}) {
  const t = useTranslations('teacherClassDetail');
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = React.useState(currentSessionId);
  const { data, isFetching } = useQuery(sessionNotesOptions(classId, sessionId));

  const [summary, setSummary] = React.useState('');
  const [rating, setRating] = React.useState<StudentNoteRating>('good');
  const [noteText, setNoteText] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!data) return;
    setSummary(data.summary.comment);
    setRating(data.summary.rating);
    setNoteText(Object.fromEntries(data.notes.map((n) => [n.studentId, n.note ?? ''])));
  }, [data]);

  const notes = data?.notes ?? [];
  const meta = data?.meta;

  const saveMutation = useMutation({
    mutationFn: async (sendToParents: boolean) => {
      await saveSessionNotes(classId, sessionId, {
        summary: { comment: summary, rating },
        notes: notes.map((n) => ({
          ...n,
          note: noteText[n.studentId] ?? n.note,
          saved: n.attendance === 'present' ? true : n.saved
        })),
        sendToParents
      });
      return sendToParents;
    },
    onSuccess: (sendToParents) => {
      queryClient.invalidateQueries({ queryKey: teacherClassDetailKeys.notes(classId, sessionId) });
      queryClient.invalidateQueries({ queryKey: teacherClassDetailKeys.detail(classId) });
      toast.success(sendToParents ? t('notes.saveSendSuccess') : t('notes.saveDraftSuccess'));
    },
    onError: (err) => toast.error(formatApiError(err, t('notes.saveError')).title)
  });

  const presentNotes = notes.filter((n) => n.attendance === 'present');
  const savedCount = presentNotes.filter((n) => n.saved).length;

  if (sessions.length === 0) return <SessionsEmptyState />;

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]'>
      <div className='bg-card h-fit overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h3 className='text-sm font-semibold tracking-tight'>{t('notes.sessionsTitle')}</h3>
          <span className='text-muted-foreground font-mono text-[11px]'>
            {t('tabs.sessionsCount', { count: sessions.length })}
          </span>
        </div>
        <ul className='divide-y text-sm'>
          {sessions.map((s) => {
            const isActive = s.id === sessionId;
            const isUpcoming = s.status === 'upcoming';
            return (
              <li key={s.id}>
                <button
                  type='button'
                  disabled={isUpcoming}
                  onClick={() => setSessionId(s.id)}
                  className={cn(
                    'block w-full px-4 py-3 text-left',
                    isActive ? 'bg-accent border-foreground border-l-2' : 'hover:bg-muted/40',
                    isUpcoming ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  )}
                >
                  <div className='flex items-baseline justify-between'>
                    <span
                      className={cn(
                        'font-mono text-xs',
                        isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      {s.id} · {s.dateLabel}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px]',
                        s.status === 'reviewed' && 'text-emerald-700',
                        s.status === 'in_progress' && 'text-amber-700',
                        s.status === 'upcoming' && 'text-muted-foreground'
                      )}
                    >
                      <span
                        className={cn('h-1.5 w-1.5 rounded-full', sessionStatusDot[s.status])}
                      />
                      {s.status === 'in_progress'
                        ? t('sessionStatus.remaining', { count: s.needsReviewCount ?? 0 })
                        : t(`sessionStatus.${s.status}`)}
                    </span>
                  </div>
                  <div className={cn('mt-0.5 text-[13px]', isActive && 'font-medium')}>
                    {s.title}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <LoadingOverlay visible={isFetching} message={t('updating')}>
        <div className='space-y-4'>
          <div className='bg-card rounded-lg border p-5 shadow-sm'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='bg-muted rounded px-2 py-0.5 font-mono text-xs'>
                    {sessionId}
                  </span>
                  <span className='text-muted-foreground font-mono text-xs'>{meta?.dayLabel}</span>
                  <span className='inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-amber-800 uppercase'>
                    <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                    {t('notes.recordingBadge')}
                  </span>
                </div>
                <h2 className='mt-1.5 text-xl font-semibold tracking-tight'>
                  {meta?.title ?? sessions.find((s) => s.id === sessionId)?.title}
                </h2>
                {meta?.description && (
                  <p className='text-muted-foreground mt-1 max-w-2xl text-sm'>{meta.description}</p>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
                  <Icons.book className='size-3' />
                  {t('notes.openLesson')}
                </Button>
                <Button size='sm' className='h-8 px-3 text-xs'>
                  <Icons.send className='size-3' />
                  {t('notes.sendToParents')}
                </Button>
              </div>
            </div>

            <div className='mt-4 border-t pt-4'>
              <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                {t('notes.classComment')}
              </div>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className='mt-2 min-h-[80px] text-sm'
              />
              <div className='mt-2 flex flex-wrap items-center gap-3'>
                <span className='text-muted-foreground text-[11px]'>
                  {t('notes.objectiveLevel')}
                </span>
                <div className='bg-muted inline-flex items-center rounded-md border p-0.5'>
                  {NOTE_RATINGS.map((r) => (
                    <button
                      key={r}
                      type='button'
                      onClick={() => setRating(r)}
                      className={cn(
                        'h-6 rounded px-2 text-[11px] font-medium',
                        r === rating ? 'bg-background shadow-sm' : 'text-muted-foreground'
                      )}
                    >
                      {t(`rating.${r}`)}
                    </button>
                  ))}
                </div>
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs'
                >
                  <Icons.paperclip className='size-3' />
                  {t('notes.attach')}
                </button>
              </div>
            </div>
          </div>

          <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
            <div className='flex items-center justify-between border-b px-4 py-3'>
              <div>
                <h3 className='text-sm font-semibold tracking-tight'>
                  {t('notes.perStudentTitle')}
                </h3>
                <p className='text-muted-foreground mt-0.5 text-[11px]'>
                  {t('notes.perStudentDesc')}
                </p>
              </div>
              <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
                <Icons.sparkles className='size-3' />
                {t('notes.aiSuggest')}
              </Button>
            </div>

            {notes.length === 0 ? (
              <p className='text-muted-foreground px-4 py-10 text-center text-sm'>
                {t('notes.empty')}
              </p>
            ) : (
              <ul className='divide-y'>
                {notes.map((n) => {
                  const student = students.find((s) => s.id === n.studentId);
                  if (!student) return null;
                  return (
                    <SessionNoteCard
                      key={n.studentId}
                      student={student}
                      note={n}
                      value={noteText[n.studentId] ?? ''}
                      onChange={(v) => setNoteText((p) => ({ ...p, [n.studentId]: v }))}
                    />
                  );
                })}
              </ul>
            )}

            <div className='bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs'>
              <span className='text-muted-foreground'>
                {t('notes.reviewedPrefix')}{' '}
                <span className='text-foreground font-mono'>
                  {savedCount} / {presentNotes.length}
                </span>{' '}
                {t('notes.reviewedSuffix')}
              </span>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 px-3 text-xs'
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(false)}
                >
                  {t('notes.saveDraft')}
                </Button>
                <Button
                  size='sm'
                  className='h-8 px-3 text-xs'
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(true)}
                >
                  {saveMutation.isPending && <Icons.spinner className='size-3 animate-spin' />}
                  {t('notes.saveAndSend')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}

function SessionNoteCard({
  student,
  note,
  value,
  onChange
}: {
  student: ClassStudent;
  note: StudentNote;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations('teacherClassDetail');
  if (note.attendance === 'excused' || note.attendance === 'absent') {
    return (
      <li className='flex gap-4 px-4 py-4 opacity-60'>
        <StudentAvatar student={student} size={10} />
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <span className='font-medium'>{student.name}</span>
            <span className='text-muted-foreground font-mono text-[11px]'>{student.id}</span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
                attendanceStatusActive[note.attendance]
              )}
            >
              {t(`attendanceStatus.${note.attendance}`)}
            </span>
          </div>
          {note.note && <p className='text-muted-foreground mt-1 text-xs'>{note.note}</p>}
        </div>
      </li>
    );
  }
  return (
    <li className={cn('flex gap-4 px-4 py-4', !note.saved && 'bg-amber-50/30')}>
      <StudentAvatar student={student} size={10} />
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{student.name}</span>
          <span className='text-muted-foreground font-mono text-[11px]'>{student.id}</span>
          <span className='inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700'>
            {t('notes.present')}
          </span>
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 text-[10px]',
              note.saved ? 'text-emerald-700' : 'text-amber-700'
            )}
          >
            {note.saved ? (
              <>
                <Icons.check className='size-2.5' strokeWidth={3} /> {t('notes.saved')}
              </>
            ) : (
              <>
                <span className='h-1.5 w-1.5 rounded-full bg-amber-500' /> {t('notes.unsaved')}
              </>
            )}
          </span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('notes.commentPlaceholder', { name: student.name })}
          className='mt-2 min-h-[60px] text-sm'
        />
        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <span className='text-muted-foreground text-[11px]'>{t('notes.rating')}</span>
          {note.rating ? (
            <span
              className={cn(
                'inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]',
                studentNoteRatingClass[note.rating]
              )}
            >
              {t(`rating.${note.rating}`)}
            </span>
          ) : (
            <button
              type='button'
              className='text-muted-foreground inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]'
            >
              {t('notes.choose')}
            </button>
          )}
          {note.tags && note.tags.length > 0 && (
            <>
              <span className='text-muted-foreground ml-2 text-[11px]'>{t('notes.skills')}</span>
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-muted inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]'
                >
                  {tag}
                </span>
              ))}
              <button
                type='button'
                className='text-muted-foreground inline-flex h-6 items-center gap-1 rounded-md border border-dashed px-2 text-[11px]'
              >
                {t('notes.addTag')}
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function MaterialsTab() {
  const t = useTranslations('teacherClassDetail');
  return (
    <div className='bg-card rounded-lg border p-10 text-center shadow-sm'>
      <div className='bg-muted text-muted-foreground mx-auto grid h-12 w-12 place-items-center rounded-md'>
        <Icons.book className='size-5' />
      </div>
      <h3 className='mt-3 font-semibold tracking-tight'>{t('materials.title')}</h3>
      <p className='text-muted-foreground mt-1 text-sm'>{t('materials.description')}</p>
    </div>
  );
}

function AttendanceTabSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center gap-3 border-b p-3 px-4'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-7 w-48' />
        <Skeleton className='ml-auto h-8 w-32' />
      </div>
      <ul className='divide-y'>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className='flex items-center gap-3 px-4 py-3'>
            <Skeleton className='size-9 rounded-full' />
            <div className='flex-1 space-y-1.5'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-24' />
            </div>
            <Skeleton className='h-7 w-64' />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClassDetailView({ classId }: { classId: string }) {
  const t = useTranslations('teacherClassDetail');
  const detailQuery = useQuery(classDetailOptions(classId));
  const sessionsQuery = useQuery(classSessionsOptions(classId));
  const studentsQuery = useQuery(classStudentsOptions(classId));

  const detail = detailQuery.data;
  const sessions = sessionsQuery.data?.sessions;
  const currentSessionId = detail?.currentSessionId || sessionsQuery.data?.currentSessionId || '';
  const students = studentsQuery.data?.students;

  const taughtCount = React.useMemo(
    () => (sessions ?? []).filter((s) => s.status !== 'upcoming').length,
    [sessions]
  );

  if (!detail || !sessions || !students) return <ClassDetailSkeleton />;

  return (
    <div className='space-y-6'>
      <Link
        href='/teacher/classes'
        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm'
      >
        <Icons.chevronLeft className='size-3.5' />
        {t('back')}
      </Link>

      <ClassHeader d={detail} />

      <Tabs defaultValue='students'>
        <TabsList className='h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0'>
          <TabsTrigger
            value='students'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.teams className='size-3.5' />
            {t('tabs.students')}
            <span className='text-muted-foreground font-mono text-[11px]'>
              {studentsQuery.data?.totalAll}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='attendance'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.check className='size-3.5' />
            {t('tabs.attendance')}
            <span className='text-muted-foreground font-mono text-[11px]'>
              {t('tabs.sessionsCount', { count: taughtCount })}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='notes'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.post className='size-3.5' />
            {t('tabs.notes')}
            {detail.needsReviewCount > 0 && (
              <span className='inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-100 px-1 font-mono text-[10px] font-medium text-amber-900'>
                {detail.needsReviewCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='materials'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.book className='size-3.5' />
            {t('tabs.materials')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='students' className='mt-6'>
          <StudentsTab classId={classId} />
        </TabsContent>
        <TabsContent value='attendance' className='mt-6'>
          <AttendanceTab
            classId={classId}
            students={students}
            sessions={sessions}
            currentSessionId={currentSessionId}
          />
        </TabsContent>
        <TabsContent value='notes' className='mt-6'>
          <NotesTab
            classId={classId}
            students={students}
            sessions={sessions}
            currentSessionId={currentSessionId}
          />
        </TabsContent>
        <TabsContent value='materials' className='mt-6'>
          <MaterialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
