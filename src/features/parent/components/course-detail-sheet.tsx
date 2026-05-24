'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  courseDetailsById,
  fallbackCourseDetail,
  formatVND,
  type ParentCourse
} from '@/features/parent/data';

export function CourseDetailSheet({
  course,
  isSelected,
  open,
  onOpenChange,
  onSelect
}: {
  course: ParentCourse | null;
  isSelected: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: () => void;
}) {
  const detail = course ? (courseDetailsById[course.id] ?? fallbackCourseDetail) : null;
  const [activeImage, setActiveImage] = useState(0);

  if (!course || !detail) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='sm:max-w-xl'>
          <SheetTitle className='sr-only'>Chi tiết khóa học</SheetTitle>
        </SheetContent>
      </Sheet>
    );
  }

  const heroHue = detail.gallery[activeImage]?.hue ?? 145;
  const ModeIcon = course.mode.includes('Online') ? Icons.video : Icons.workspace;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[760px]'
      >
        <SheetTitle className='sr-only'>{course.name}</SheetTitle>
        <SheetDescription className='sr-only'>{detail.tagline}</SheetDescription>

        <div className='bg-background z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-5'>
          <div className='flex min-w-0 items-center gap-2'>
            <span className='bg-muted/60 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
              {course.code}
            </span>
            <span className='truncate font-semibold tracking-tight'>{course.name}</span>
          </div>
          <div className='flex items-center gap-1 pr-8'>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Icons.star className='size-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Icons.share className='size-4' />
            </Button>
          </div>
        </div>

        <div className='flex-1 overflow-auto'>
          <div className='px-5 pt-5'>
            <div
              className='group relative aspect-video cursor-pointer overflow-hidden rounded-lg border'
              style={{
                background: `radial-gradient(120% 120% at 30% 20%, hsl(${heroHue} 60% 90%) 0%, hsl(${heroHue} 50% 80%) 40%, hsl(${heroHue} 55% 65%) 100%)`
              }}
            >
              <div
                className='absolute inset-0'
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 16px, transparent 16px 32px), radial-gradient(circle at 80% 80%, rgba(0,0,0,.18), transparent 60%)'
                }}
              />
              <div className='absolute inset-0 grid place-items-center text-white'>
                <span className='grid h-16 w-16 place-items-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur transition-transform group-hover:scale-105'>
                  <Icons.play className='ml-0.5 size-7' />
                </span>
              </div>
              <div className='absolute top-3 left-3 flex gap-2'>
                {course.popular && (
                  <Badge className='border-transparent bg-amber-500/90 text-white hover:bg-amber-500/90'>
                    ★ Phổ biến
                  </Badge>
                )}
                {course.isNew && (
                  <Badge className='border-transparent bg-emerald-600 text-white hover:bg-emerald-600'>
                    ✨ Mới
                  </Badge>
                )}
              </div>
              <div className='absolute right-3 bottom-3 left-3 flex items-end justify-between text-white'>
                <div>
                  <div className='text-[11px] font-medium tracking-wider uppercase opacity-80'>
                    Video giới thiệu
                  </div>
                  <div className='text-sm font-medium drop-shadow-sm'>
                    {detail.gallery[activeImage]?.label || course.name}
                  </div>
                </div>
                <span className='rounded-md bg-black/40 px-2 py-0.5 font-mono text-[11px] backdrop-blur'>
                  02:14
                </span>
              </div>
            </div>

            {detail.gallery.length > 1 && (
              <div className='mt-3 flex gap-2 overflow-x-auto pb-1'>
                {detail.gallery.map((g, i) => (
                  <button
                    key={g.label}
                    type='button'
                    onClick={() => setActiveImage(i)}
                    aria-label={g.label}
                    className={cn(
                      'relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border',
                      activeImage === i
                        ? 'ring-ring ring-2 ring-offset-1'
                        : 'opacity-80 hover:opacity-100'
                    )}
                    style={{
                      background: `linear-gradient(135deg, hsl(${g.hue} 55% 78%), hsl(${g.hue} 50% 60%))`
                    }}
                    title={g.label}
                  >
                    <div
                      className='absolute inset-0'
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 8px, transparent 8px 16px)'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='px-5 pt-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <h1 className='text-2xl font-semibold tracking-tight'>{course.name}</h1>
                <p className='text-muted-foreground mt-1 text-sm'>{detail.tagline}</p>
              </div>
              <div className='shrink-0 text-right'>
                <div className='flex items-center justify-end gap-0.5 text-amber-500'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icons.star
                      key={i}
                      className={cn(
                        'size-3.5',
                        i < Math.round(course.rating) ? 'fill-current' : 'opacity-30'
                      )}
                    />
                  ))}
                </div>
                <div className='text-muted-foreground mt-0.5 font-mono text-xs'>
                  {course.rating} · {course.learners} học viên
                </div>
              </div>
            </div>

            <div className='mt-3 flex flex-wrap items-center gap-1.5'>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.teams className='mr-1 size-2.5' /> {course.ageRange} tuổi
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                {course.level}
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <ModeIcon className='mr-1 size-2.5' /> {course.mode}
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.book className='mr-1 size-2.5' /> {course.sessions} buổi
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.clock className='mr-1 size-2.5' /> {course.duration}′/buổi
              </Badge>
            </div>
          </div>

          <Tabs defaultValue='about' className='mt-5'>
            <div className='bg-background sticky top-0 z-10 border-b'>
              <div className='px-5 py-2'>
                <TabsList className='h-9'>
                  <TabsTrigger value='about' className='h-7 px-3 text-xs'>
                    Giới thiệu
                  </TabsTrigger>
                  <TabsTrigger value='syllabus' className='h-7 px-3 text-xs'>
                    Nội dung
                    <span className='ml-1.5 font-mono opacity-70'>({detail.syllabus.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value='teacher' className='h-7 px-3 text-xs'>
                    Giáo viên
                  </TabsTrigger>
                  <TabsTrigger value='reviews' className='h-7 px-3 text-xs'>
                    Đánh giá
                    <span className='ml-1.5 font-mono opacity-70'>({detail.reviews.length})</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className='px-5 py-5 text-sm'>
              <TabsContent value='about' className='space-y-6'>
                <p className='text-foreground/90 leading-relaxed'>{detail.longDescription}</p>
                <div>
                  <h3 className='mb-3 flex items-center gap-2 font-semibold tracking-tight'>
                    <Icons.check className='size-4' /> Học sinh sẽ đạt được
                  </h3>
                  <ul className='space-y-2'>
                    {detail.outcomes.map((o) => (
                      <li key={o} className='text-foreground/85 flex gap-2'>
                        <span className='mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700'>
                          <Icons.check className='size-2.5' strokeWidth={3} />
                        </span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='mb-3 flex items-center gap-2 font-semibold tracking-tight'>
                    <Icons.teams className='size-4' /> Phù hợp với
                  </h3>
                  <ul className='text-foreground/85 marker:text-muted-foreground list-disc space-y-1.5 pl-5'>
                    {detail.suitableFor.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className='mb-3 flex items-center gap-2 font-semibold tracking-tight'>
                    <Icons.help className='size-4' /> Yêu cầu đầu vào
                  </h3>
                  <p className='text-foreground/85'>{detail.prerequisites}</p>
                </div>
              </TabsContent>

              <TabsContent value='syllabus'>
                <div className='mb-3 flex items-baseline justify-between'>
                  <h3 className='font-semibold tracking-tight'>Lộ trình {course.sessions} buổi</h3>
                  <span className='text-muted-foreground font-mono text-xs'>
                    {course.duration}′/buổi · {course.sessions * course.duration} phút tổng
                  </span>
                </div>
                {detail.syllabus.length === 0 ? (
                  <div className='bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm'>
                    Nội dung lộ trình đang được cập nhật.
                  </div>
                ) : (
                  <ol className='bg-card divide-y rounded-lg border'>
                    {detail.syllabus.map((s) => (
                      <li key={s.i} className='flex items-start gap-3 p-3'>
                        <span className='bg-muted text-foreground/80 grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-xs font-medium'>
                          {String(s.i).padStart(2, '0')}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-baseline justify-between gap-3'>
                            <div className='font-medium'>{s.title}</div>
                            <Badge
                              variant='outline'
                              className='shrink-0 font-mono text-[10.5px] font-normal'
                            >
                              {s.kind}
                            </Badge>
                          </div>
                          <div className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
                            {s.desc}
                          </div>
                          <div className='text-muted-foreground mt-1 font-mono text-[11px]'>
                            {s.duration}′
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </TabsContent>

              <TabsContent value='teacher' className='space-y-5'>
                <div className='flex items-start gap-4'>
                  <span className='bg-accent grid h-16 w-16 place-items-center rounded-full text-base font-semibold'>
                    {detail.teacher.initials}
                  </span>
                  <div className='flex-1'>
                    <div className='text-base font-semibold tracking-tight'>
                      {detail.teacher.name}
                    </div>
                    <div className='text-muted-foreground mt-0.5 text-xs'>
                      {detail.teacher.title}
                    </div>
                    <div className='mt-3 flex gap-4'>
                      {detail.teacher.stats.map((s) => (
                        <div key={s.label}>
                          <div className='text-base font-semibold tabular-nums'>{s.value}</div>
                          <div className='text-muted-foreground text-[11px] tracking-wider uppercase'>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Separator />
                <p className='text-foreground/85 leading-relaxed'>{detail.teacher.bio}</p>
                <div className='bg-muted/20 flex items-center gap-3 rounded-lg border p-4'>
                  <Icons.badgeCheck className='size-5 shrink-0 text-amber-600' />
                  <div className='text-muted-foreground text-xs'>
                    <b className='text-foreground'>Chứng chỉ Scratch Educator</b> · Đã đào tạo bởi
                    MIT Scratch Foundation Vietnam.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='reviews' className='space-y-4'>
                <div className='bg-muted/20 flex items-center gap-5 rounded-lg border p-4'>
                  <div className='text-center'>
                    <div className='text-3xl font-semibold tabular-nums'>{course.rating}</div>
                    <div className='mt-0.5 flex items-center justify-center gap-0.5 text-amber-500'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icons.star
                          key={i}
                          className={cn(
                            'size-2.5',
                            i < Math.round(course.rating) ? 'fill-current' : 'opacity-30'
                          )}
                        />
                      ))}
                    </div>
                    <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                      {course.learners} đánh giá
                    </div>
                  </div>
                  <Separator className='h-12 w-px' />
                  <div className='flex-1 space-y-1'>
                    {[
                      [5, 78],
                      [4, 16],
                      [3, 4],
                      [2, 1],
                      [1, 1]
                    ].map(([stars, pct]) => (
                      <div key={stars} className='flex items-center gap-2 text-xs'>
                        <span className='text-muted-foreground w-3 font-mono'>{stars}</span>
                        <Icons.star className='size-2.5 fill-amber-500 text-amber-500' />
                        <div className='bg-muted h-1.5 flex-1 overflow-hidden rounded-full'>
                          <div
                            className='h-full rounded-full bg-amber-400'
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className='text-muted-foreground w-8 text-right font-mono tabular-nums'>
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {detail.reviews.length === 0 ? (
                  <div className='bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm'>
                    Chưa có đánh giá cho khóa học này.
                  </div>
                ) : (
                  detail.reviews.map((r) => (
                    <div key={r.parent + r.date} className='bg-card rounded-lg border p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-sm font-medium'>{r.parent}</div>
                        <div className='text-muted-foreground font-mono text-[11px]'>{r.date}</div>
                      </div>
                      <div className='mt-0.5 flex items-center gap-0.5 text-amber-500'>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Icons.star
                            key={j}
                            className={cn('size-2.5', j < r.stars ? 'fill-current' : 'opacity-30')}
                          />
                        ))}
                      </div>
                      <p className='text-foreground/85 mt-2 text-sm leading-relaxed'>{r.text}</p>
                    </div>
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className='bg-background/95 flex shrink-0 items-center justify-between gap-3 border-t p-4 backdrop-blur'>
          <div>
            <div className='text-muted-foreground text-xs'>Học phí</div>
            <div className='text-xl font-semibold tracking-tight tabular-nums'>
              {formatVND(course.price)}{' '}
              <span className='text-muted-foreground font-mono text-xs font-normal'>/khóa</span>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <Icons.sparkles className='size-3.5' />
              Học thử miễn phí
            </Button>
            <Button
              variant={isSelected ? 'secondary' : 'default'}
              onClick={() => {
                onSelect();
                onOpenChange(false);
              }}
            >
              {isSelected ? (
                <>
                  <Icons.check className='size-3.5' />
                  Đã chọn khóa
                </>
              ) : (
                <>
                  Chọn khóa này
                  <Icons.arrowRight className='size-3.5' />
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
