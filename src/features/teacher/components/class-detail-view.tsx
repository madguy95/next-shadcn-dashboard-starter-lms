'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import {
  attendanceStatusActive,
  attendanceStatusDot,
  attendanceStatusLabel,
  classA01B6Notes,
  classA01Detail,
  classA01Sessions,
  classA01Students,
  classColorTokens,
  sessionStatusDot,
  sessionStatusLabel,
  studentNoteRatingClass,
  studentNoteRatingLabel,
  studentToneClass,
  type AttendanceStatus,
  type ClassStudent,
  type SessionRecord,
  type StudentNote
} from '@/features/teacher/data';

const ATTENDANCE_ORDER: AttendanceStatus[] = ['present', 'excused', 'absent', 'makeup'];

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
  const pct = (attended / total) * 100;
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

function ClassHeader() {
  const d = classA01Detail;
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div
        className={cn(
          'h-24 border-b',
          classColorTokens[d.color].bg,
          'bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_8px,transparent_8px_16px)]'
        )}
      />
      <div className='flex flex-wrap items-start justify-between gap-6 p-5'>
        <div>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            <span className='bg-background inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
              {d.id}
            </span>
            <span className='text-muted-foreground font-mono text-[11px]'>{d.courseCode}</span>
            <span className='inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-emerald-800 uppercase'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              Đang dạy
            </span>
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
            Giáo trình
          </Button>
          <Button variant='outline' size='sm' className='h-9'>
            <Icons.upload className='size-3.5 rotate-180' />
            Xuất báo cáo
          </Button>
          <Button size='sm' className='h-9 px-4'>
            <Icons.check className='size-3.5' />
            Điểm danh hôm nay
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 divide-x border-t md:grid-cols-4'>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            Tiến độ
          </div>
          <div className='text-lg leading-tight font-semibold'>
            Buổi {d.sessionCurrent} / {d.sessionTotal}
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
            Sĩ số
          </div>
          <div className='text-lg leading-tight font-semibold'>{d.studentCount} học sinh</div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            tuần này: {d.presentLastWeek} đi · {d.absentLastWeek} vắng
          </div>
        </div>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            Chuyên cần TB
          </div>
          <div className='text-lg leading-tight font-semibold text-emerald-700'>
            {d.attendanceRate}
            <span className='text-muted-foreground text-sm font-normal'>%</span>
          </div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            {d.attendedCount}/{d.attendedTotal} lượt đi học
          </div>
        </div>
        <div className='px-5 py-3'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            Cần nhận xét
          </div>
          <div className='text-lg leading-tight font-semibold text-amber-700'>
            {d.needsReviewCount} học sinh
          </div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
            {d.needsReviewSession}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='relative w-72'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3 -translate-y-1/2' />
          <Input
            placeholder='Tìm tên học sinh, mã HS, SĐT phụ huynh…'
            className='h-8 pl-8 text-xs'
          />
        </div>
        <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
          <Icons.adjustments className='size-3' />
          Bộ lọc
        </Button>
        <span className='text-muted-foreground ml-auto font-mono text-xs'>
          {classA01Students.length} học sinh
        </span>
      </div>

      <Table>
        <TableHeader className='bg-muted/30'>
          <TableRow>
            <TableHead className='w-9 px-4'>
              <Checkbox aria-label='Chọn tất cả' />
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Học sinh</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Mã HS</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Phụ huynh</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Liên hệ</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Chuyên cần</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Buổi gần nhất</TableHead>
            <TableHead className='px-4 text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {classA01Students.map((s) => (
            <TableRow key={s.id}>
              <TableCell className='px-4 py-3'>
                <Checkbox aria-label={`Chọn ${s.name}`} />
              </TableCell>
              <TableCell className='py-3'>
                <div className='flex items-center gap-2.5'>
                  <StudentAvatar student={s} />
                  <div className='leading-tight'>
                    <div className='font-medium'>{s.name}</div>
                    <div className='text-muted-foreground text-[11px]'>
                      {s.age} tuổi · Lớp {s.grade}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='text-muted-foreground py-3 font-mono text-xs'>{s.id}</TableCell>
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
                    className={cn('h-1.5 w-1.5 rounded-full', attendanceStatusDot[s.lastStatus])}
                  />
                  {attendanceStatusLabel[s.lastStatus]} · {s.lastSessionLabel}
                </span>
              </TableCell>
              <TableCell className='px-4 py-3 text-right'>
                <Button variant='ghost' size='icon' className='h-7 w-7'>
                  <Icons.ellipsis className='size-3.5' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className='text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-3 text-xs'>
        <span>
          Hiển thị {classA01Students.length} / {classA01Students.length} học sinh
        </span>
        <div className='flex items-center gap-1'>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
            Trước
          </Button>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}

function AttendanceSessionPill({ session, active }: { session: SessionRecord; active: boolean }) {
  if (session.status === 'upcoming') {
    return (
      <button
        type='button'
        disabled
        className='text-muted-foreground inline-flex h-7 items-center gap-1 rounded-md border border-dashed px-2 font-mono text-xs whitespace-nowrap opacity-60'
      >
        {session.id} · {session.dateLabel}
      </button>
    );
  }
  return (
    <button
      type='button'
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-xs whitespace-nowrap',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'text-muted-foreground hover:bg-accent'
      )}
    >
      {session.id} · {session.dateLabel}
      <span className={cn('h-1.5 w-1.5 rounded-full', sessionStatusDot[session.status])} />
    </button>
  );
}

function AttendanceTab() {
  // Initial attendance state derived from each student's last status.
  const initialAttendance: Record<string, AttendanceStatus> = {
    'HS-2401': 'present',
    'HS-2402': 'present',
    'HS-2403': 'excused',
    'HS-2404': 'present',
    'HS-2405': 'absent',
    'HS-2406': 'present',
    'HS-2407': 'present',
    'HS-2408': 'unmarked',
    'HS-2409': 'present',
    'HS-2410': 'present',
    'HS-2411': 'present',
    'HS-2412': 'present'
  };
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(initialAttendance);

  const markedCount = classA01Students.filter((s) => marks[s.id] !== 'unmarked').length;
  const counts = {
    present: 0,
    excused: 0,
    absent: 0,
    unmarked: 0
  };
  for (const s of classA01Students) {
    const m = marks[s.id] ?? 'unmarked';
    if (m === 'present') counts.present++;
    else if (m === 'excused') counts.excused++;
    else if (m === 'absent') counts.absent++;
    else counts.unmarked++;
  }

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>Buổi:</span>
          <Button variant='outline' size='sm' className='h-8 px-3 text-sm font-medium'>
            <span className='font-mono'>B6 · T2 19/05</span>
            <span className='bg-foreground text-background rounded px-1.5 py-0.5 text-[10px] tracking-wider uppercase'>
              Hôm nay
            </span>
            <Icons.chevronDown className='size-3' />
          </Button>
        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto'>
          {classA01Sessions.map((s) => (
            <AttendanceSessionPill key={s.id} session={s} active={s.id === 'B6'} />
          ))}
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <span className='text-muted-foreground text-xs'>
            <span className='text-foreground font-mono'>
              {markedCount}/{classA01Students.length}
            </span>{' '}
            đã điểm danh
          </span>
          <Button size='sm' className='h-8 px-3 text-xs'>
            <Icons.check className='size-3' />
            Lưu điểm danh
          </Button>
        </div>
      </div>

      <div className='bg-muted/30 flex items-center gap-2 px-4 py-2 text-xs'>
        <span className='text-muted-foreground'>Đặt nhanh tất cả:</span>
        <button
          type='button'
          onClick={() =>
            setMarks(
              Object.fromEntries(classA01Students.map((s) => [s.id, 'present' as AttendanceStatus]))
            )
          }
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-emerald-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> Có mặt
        </button>
        <button
          type='button'
          onClick={() =>
            setMarks(
              Object.fromEntries(classA01Students.map((s) => [s.id, 'absent' as AttendanceStatus]))
            )
          }
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-rose-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' /> Vắng
        </button>
        <button
          type='button'
          onClick={() =>
            setMarks(
              Object.fromEntries(classA01Students.map((s) => [s.id, 'excused' as AttendanceStatus]))
            )
          }
          className='bg-background inline-flex h-6 items-center gap-1 rounded-md border px-2 hover:bg-amber-50'
        >
          <span className='h-1.5 w-1.5 rounded-full bg-amber-500' /> Vắng có phép
        </button>
        <span className='text-muted-foreground ml-auto font-mono'>
          Thời gian: 18:00–19:00 · Phòng 301
        </span>
      </div>

      <ul className='divide-y'>
        {classA01Students.map((s) => {
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
                      chưa điểm danh
                    </span>
                  )}
                </div>
                <div className='text-muted-foreground text-[11px]'>
                  Chuyên cần {s.attendedSessions}/{s.totalSessions}
                  {isHighlightAbsent && ' · cân nhắc gọi điện'}
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
                      <span className={cn('h-1.5 w-1.5 rounded-full', attendanceStatusDot[opt])} />
                      {attendanceStatusLabel[opt]}
                    </button>
                  );
                })}
              </div>

              <Input
                placeholder='Ghi chú…'
                className='h-8 w-40 text-xs'
                defaultValue={s.id === 'HS-2403' ? 'Sắp xếp học bù B6 — 24/05' : ''}
              />
            </li>
          );
        })}
      </ul>

      <div className='bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
        <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-xs'>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' /> Có mặt:{' '}
            <span className='text-foreground font-mono'>{counts.present}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-amber-500' /> Có phép:{' '}
            <span className='text-foreground font-mono'>{counts.excused}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-rose-500' /> Vắng:{' '}
            <span className='text-foreground font-mono'>{counts.absent}</span>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='bg-muted-foreground h-2 w-2 rounded-full' /> Chưa:{' '}
            <span className='text-foreground font-mono'>{counts.unmarked}</span>
          </span>
        </div>
        <span className='text-muted-foreground font-mono text-xs'>
          Tự động lưu lần cuối · 10:42
        </span>
      </div>
    </div>
  );
}

function SessionNoteCard({ student, note }: { student: ClassStudent; note: StudentNote }) {
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
              {attendanceStatusLabel[note.attendance]}
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
            Có mặt
          </span>
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 text-[10px]',
              note.saved ? 'text-emerald-700' : 'text-amber-700'
            )}
          >
            {note.saved ? (
              <>
                <Icons.check className='size-2.5' strokeWidth={3} /> Đã lưu
              </>
            ) : (
              <>
                <span className='h-1.5 w-1.5 rounded-full bg-amber-500' /> Chưa lưu
              </>
            )}
          </span>
        </div>
        <Textarea
          defaultValue={note.note ?? ''}
          placeholder={`Viết nhận xét cho ${student.name}…`}
          className='mt-2 min-h-[60px] text-sm'
        />
        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <span className='text-muted-foreground text-[11px]'>Đánh giá:</span>
          {note.rating ? (
            <span
              className={cn(
                'inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]',
                studentNoteRatingClass[note.rating]
              )}
            >
              {studentNoteRatingLabel[note.rating]}
            </span>
          ) : (
            <button
              type='button'
              className='text-muted-foreground inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]'
            >
              — Chọn —
            </button>
          )}
          {note.tags && note.tags.length > 0 && (
            <>
              <span className='text-muted-foreground ml-2 text-[11px]'>Kỹ năng:</span>
              {note.tags.map((t) => (
                <span
                  key={t}
                  className='bg-muted inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px]'
                >
                  {t}
                </span>
              ))}
              <button
                type='button'
                className='text-muted-foreground inline-flex h-6 items-center gap-1 rounded-md border border-dashed px-2 text-[11px]'
              >
                + Thêm tag
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function NotesTab() {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]'>
      <div className='bg-card h-fit overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h3 className='text-sm font-semibold tracking-tight'>Buổi học</h3>
          <span className='text-muted-foreground font-mono text-[11px]'>6 / 16</span>
        </div>
        <ul className='divide-y text-sm'>
          {classA01Sessions.map((s) => {
            const isActive = s.id === 'B6';
            const isUpcoming = s.status === 'upcoming';
            return (
              <li
                key={s.id}
                className={cn(
                  'cursor-pointer px-4 py-3',
                  isActive ? 'bg-accent border-foreground border-l-2' : 'hover:bg-muted/40',
                  isUpcoming && 'opacity-60'
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
                    <span className={cn('h-1.5 w-1.5 rounded-full', sessionStatusDot[s.status])} />
                    {s.status === 'in_progress'
                      ? `Còn ${s.needsReviewCount ?? 0} hs`
                      : sessionStatusLabel[s.status]}
                  </span>
                </div>
                <div className={cn('mt-0.5 text-[13px]', isActive && 'font-medium')}>{s.title}</div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className='space-y-4'>
        <div className='bg-card rounded-lg border p-5 shadow-sm'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='bg-muted rounded px-2 py-0.5 font-mono text-xs'>B6</span>
                <span className='text-muted-foreground font-mono text-xs'>
                  T2 · 19/05/2026 · 18:00–19:00
                </span>
                <span className='inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-amber-800 uppercase'>
                  <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                  Đang ghi nhận xét
                </span>
              </div>
              <h2 className='mt-1.5 text-xl font-semibold tracking-tight'>
                Buổi 6 · Mini game Cat &amp; Mouse
              </h2>
              <p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
                Học sinh áp dụng vòng lặp + điều kiện + biến điểm số để hoàn thành mini game đầu
                tiên. Sản phẩm cần demo trong 5 phút cuối.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
                <Icons.book className='size-3' />
                Mở giáo án
              </Button>
              <Button size='sm' className='h-8 px-3 text-xs'>
                <Icons.send className='size-3' />
                Gửi tới phụ huynh
              </Button>
            </div>
          </div>

          <div className='mt-4 border-t pt-4'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              Nhận xét chung cả lớp
            </div>
            <Textarea
              defaultValue='Lớp tiếp thu nhanh khái niệm vòng lặp lồng. 8/10 hs hoàn thành mini game; 2 hs cần hỗ trợ thêm về vị trí (x,y). Bài tập về nhà: thêm 1 con mèo thứ hai vào game.'
              className='mt-2 min-h-[80px] text-sm'
            />
            <div className='mt-2 flex flex-wrap items-center gap-3'>
              <span className='text-muted-foreground text-[11px]'>Mức độ hoàn thành mục tiêu:</span>
              <div className='bg-muted inline-flex items-center rounded-md border p-0.5'>
                {(['weak', 'average', 'good', 'great', 'excellent'] as const).map((r) => (
                  <button
                    key={r}
                    type='button'
                    className={cn(
                      'h-6 rounded px-2 text-[11px] font-medium',
                      r === 'great' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    {studentNoteRatingLabel[r]}
                  </button>
                ))}
              </div>
              <button
                type='button'
                className='text-muted-foreground hover:text-foreground ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs'
              >
                <Icons.paperclip className='size-3' />
                Đính file / ảnh sản phẩm
              </button>
            </div>
          </div>
        </div>

        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div>
              <h3 className='text-sm font-semibold tracking-tight'>Nhận xét theo từng học sinh</h3>
              <p className='text-muted-foreground mt-0.5 text-[11px]'>
                Chỉ học sinh có mặt mới hiển thị. Phụ huynh sẽ nhận được nhận xét riêng của con
                mình.
              </p>
            </div>
            <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
              <Icons.sparkles className='size-3' />
              Gợi ý bằng AI
            </Button>
          </div>

          <ul className='divide-y'>
            {classA01B6Notes.map((n) => {
              const student = classA01Students.find((s) => s.id === n.studentId);
              if (!student) return null;
              return <SessionNoteCard key={n.studentId} student={student} note={n} />;
            })}
          </ul>

          <div className='bg-muted/20 flex items-center justify-between gap-3 border-t px-4 py-3 text-xs'>
            <span className='text-muted-foreground'>
              Đã nhận xét{' '}
              <span className='text-foreground font-mono'>
                {classA01B6Notes.filter((n) => n.attendance === 'present' && n.saved).length} /{' '}
                {classA01B6Notes.filter((n) => n.attendance === 'present').length}
              </span>{' '}
              học sinh có mặt
            </span>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
                Lưu nháp
              </Button>
              <Button size='sm' className='h-8 px-3 text-xs'>
                Lưu &amp; gửi PH
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialsTab() {
  return (
    <div className='bg-card rounded-lg border p-10 text-center shadow-sm'>
      <div className='bg-muted text-muted-foreground mx-auto grid h-12 w-12 place-items-center rounded-md'>
        <Icons.book className='size-5' />
      </div>
      <h3 className='mt-3 font-semibold tracking-tight'>Giáo trình &amp; bài tập</h3>
      <p className='text-muted-foreground mt-1 text-sm'>
        Khu vực này hiển thị giáo án từng buổi và bài tập về nhà — sẽ thiết kế ở vòng sau.
      </p>
    </div>
  );
}

export function ClassDetailView() {
  return (
    <div className='space-y-6'>
      <Link
        href='/teacher/classes'
        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm'
      >
        <Icons.chevronLeft className='size-3.5' />
        Quay lại danh sách lớp
      </Link>

      <ClassHeader />

      <Tabs defaultValue='students'>
        <TabsList className='h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0'>
          <TabsTrigger
            value='students'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.teams className='size-3.5' />
            Danh sách học sinh
            <span className='text-muted-foreground font-mono text-[11px]'>
              {classA01Students.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='attendance'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.check className='size-3.5' />
            Điểm danh
            <span className='text-muted-foreground font-mono text-[11px]'>6 buổi</span>
          </TabsTrigger>
          <TabsTrigger
            value='notes'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.post className='size-3.5' />
            Nhận xét buổi học
            <span className='inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-100 px-1 font-mono text-[10px] font-medium text-amber-900'>
              2
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='materials'
            className='data-[state=active]:border-foreground data-[state=active]:text-foreground -mb-px h-10 rounded-none border-b-2 border-transparent px-4 text-sm font-medium shadow-none data-[state=active]:shadow-none'
          >
            <Icons.book className='size-3.5' />
            Giáo trình &amp; bài tập
          </TabsTrigger>
        </TabsList>

        <TabsContent value='students' className='mt-6'>
          <StudentsTab />
        </TabsContent>
        <TabsContent value='attendance' className='mt-6'>
          <AttendanceTab />
        </TabsContent>
        <TabsContent value='notes' className='mt-6'>
          <NotesTab />
        </TabsContent>
        <TabsContent value='materials' className='mt-6'>
          <MaterialsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
