'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { publicCourseDetailOptions } from '@/api/courses/queries';
import type { PublicCourseDetail } from '@/api/courses/types';
import { cn } from '@/lib/utils';
import { formatVND, type ParentCourse } from '@/features/parent/data';

export function CourseDetailSheet({
  course,
  open,
  onOpenChange
}: {
  course: ParentCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // course.id is BE numeric id stringified by the adapter. Only fetch while the sheet is open,
  // so closing it doesn't keep the request alive.
  const detailId = open && course ? course.id : null;
  const { data: detail, isLoading, error } = useQuery(publicCourseDetailOptions(detailId));

  if (!course) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='sm:max-w-xl'>
          <SheetTitle className='sr-only'>Chi tiết khóa học</SheetTitle>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        // [&>button:last-of-type]:hidden strips Radix's default top-right
        // close (a small low-contrast X that mobile users routinely miss). We
        // render an explicit, same-weight close button in the header instead.
        className='flex w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[760px] [&>button:last-of-type]:hidden'
      >
        <SheetTitle className='sr-only'>{course.name}</SheetTitle>
        <SheetDescription className='sr-only'>{detail?.tagline}</SheetDescription>

        <div className='bg-background z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-5'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <span className='bg-muted/60 shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
              {course.code}
            </span>
            <span className='truncate font-semibold tracking-tight'>{course.name}</span>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Icons.star className='size-4' />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <Icons.share className='size-4' />
            </Button>
            <SheetClose asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8' aria-label='Đóng'>
                <Icons.close className='size-4' />
              </Button>
            </SheetClose>
          </div>
        </div>

        <div className='flex-1 overflow-auto'>
          {/* Hero: cover image + intro video play affordance. Falls back to a striped placeholder
              while the detail loads or when the course has no cover uploaded yet. */}
          <div className='px-4 pt-4 sm:px-5 sm:pt-5'>
            <HeroMedia detail={detail} course={course} isLoading={isLoading} />
          </div>

          <div className='px-4 pt-4 sm:px-5 sm:pt-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <h1 className='text-2xl font-semibold tracking-tight'>{course.name}</h1>
                {isLoading ? (
                  <Skeleton className='mt-2 h-4 w-2/3' />
                ) : (
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {detail?.tagline ||
                      course.goals ||
                      'Khóa học sẵn sàng cho con — xem nội dung chi tiết bên dưới.'}
                  </p>
                )}
              </div>
            </div>

            <div className='mt-3 flex flex-wrap items-center gap-1.5'>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.teams className='mr-1 size-2.5' /> {course.ageRange} tuổi
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.book className='mr-1 size-2.5' /> {course.sessions} buổi
              </Badge>
              <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                <Icons.clock className='mr-1 size-2.5' /> {course.duration}′/buổi
              </Badge>
              {detail?.perClassCapacity ? (
                <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                  <Icons.teams className='mr-1 size-2.5' />
                  Sĩ số ≤ {detail.perClassCapacity}
                </Badge>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className='border-destructive/30 bg-destructive/5 text-destructive mx-4 mt-4 rounded-md border p-4 text-sm sm:mx-5 sm:mt-5'>
              Không tải được chi tiết khóa học. Vui lòng thử lại.
            </div>
          ) : null}

          <Tabs defaultValue='about' className='mt-5'>
            <div className='bg-background sticky top-0 z-10 border-b'>
              <div className='px-4 py-2 sm:px-5'>
                <TabsList className='h-9'>
                  <TabsTrigger value='about' className='h-7 px-3 text-xs'>
                    Giới thiệu
                  </TabsTrigger>
                  <TabsTrigger value='syllabus' className='h-7 px-3 text-xs'>
                    Nội dung
                    <span className='ml-1.5 font-mono opacity-70'>
                      ({detail?.sessions?.length ?? course.sessions})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value='pricing' className='h-7 px-3 text-xs'>
                    Học phí
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className='px-4 py-4 text-sm sm:px-5 sm:py-5'>
              <TabsContent value='about' className='space-y-6'>
                {isLoading ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-4/5' />
                  </div>
                ) : (
                  <p className='text-foreground/90 leading-relaxed whitespace-pre-wrap'>
                    {detail?.description?.trim() ||
                      detail?.tagline ||
                      course.goals ||
                      'Trung tâm đang cập nhật mô tả cho khóa học này.'}
                  </p>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <InfoCard
                    icon={<Icons.book className='size-4' />}
                    label='Tổng số buổi'
                    value={`${course.sessions} buổi`}
                  />
                  <InfoCard
                    icon={<Icons.clock className='size-4' />}
                    label='Thời lượng / buổi'
                    value={`${course.duration} phút`}
                  />
                  <InfoCard
                    icon={<Icons.teams className='size-4' />}
                    label='Độ tuổi'
                    value={`${course.ageRange} tuổi`}
                  />
                  <InfoCard
                    icon={<Icons.info className='size-4' />}
                    label='Mô tả'
                    value={course.goals || 'Đang cập nhật.'}
                  />
                </div>
              </TabsContent>

              <TabsContent value='syllabus'>
                <div className='mb-3 flex items-baseline justify-between'>
                  <h3 className='font-semibold tracking-tight'>Lộ trình {course.sessions} buổi</h3>
                  <span className='text-muted-foreground font-mono text-xs'>
                    {course.duration}′/buổi · {course.sessions * course.duration} phút tổng
                  </span>
                </div>
                {isLoading ? (
                  <ol className='bg-card divide-y rounded-lg border'>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <li key={i} className='flex items-start gap-3 p-3'>
                        <Skeleton className='h-7 w-7 rounded-md' />
                        <div className='flex-1 space-y-2'>
                          <Skeleton className='h-4 w-1/2' />
                          <Skeleton className='h-3 w-3/4' />
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (detail?.sessions ?? []).length === 0 ? (
                  <div className='bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm'>
                    Nội dung lộ trình đang được cập nhật.
                  </div>
                ) : (
                  <ol className='bg-card divide-y rounded-lg border'>
                    {detail!.sessions.map((s, idx) => (
                      <li key={`${idx}-${s.title}`} className='flex items-start gap-3 p-3'>
                        <span className='bg-muted text-foreground/80 grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-xs font-medium'>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <div className='font-medium'>{s.title || `Buổi ${idx + 1}`}</div>
                          {s.description?.trim() ? (
                            <div className='text-muted-foreground mt-0.5 text-xs leading-relaxed whitespace-pre-wrap'>
                              {s.description}
                            </div>
                          ) : null}
                          <div className='text-muted-foreground mt-1 font-mono text-[11px]'>
                            {course.duration}′
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </TabsContent>

              <TabsContent value='pricing' className='space-y-4'>
                <div className='bg-muted/20 flex items-baseline justify-between rounded-lg border p-4'>
                  <div className='text-muted-foreground text-xs'>Học phí mỗi khóa</div>
                  <div className='text-right'>
                    <div className='text-xl font-semibold tracking-tight tabular-nums'>
                      {formatVND(course.price)}
                    </div>
                    {detail?.originalTuitionAmount &&
                    detail.originalTuitionAmount > detail.tuitionAmount ? (
                      <div className='text-muted-foreground text-[11px] line-through tabular-nums'>
                        {formatVND(detail.originalTuitionAmount)}
                      </div>
                    ) : null}
                  </div>
                </div>
                {detail?.pricingNotes?.trim() ? (
                  <div>
                    <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold tracking-tight'>
                      <Icons.info className='size-4' /> Ghi chú học phí
                    </h3>
                    <p className='text-foreground/85 whitespace-pre-wrap'>{detail.pricingNotes}</p>
                  </div>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    Không có ghi chú học phí. Liên hệ trung tâm nếu cần tư vấn thêm về thanh toán.
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer stacks on <sm so the two CTAs don't crash into the price
            block (combined ~390px against ~382px viewport width). On sm+ it
            returns to the inline price / actions split. */}
        <div className='bg-background/95 flex shrink-0 flex-col gap-3 border-t p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='text-muted-foreground text-xs'>Học phí</div>
            <div className='text-xl font-semibold tracking-tight tabular-nums'>
              {formatVND(course.price)}{' '}
              <span className='text-muted-foreground font-mono text-xs font-normal'>/khóa</span>
            </div>
          </div>
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center'>
            <Button variant='outline' className='w-full sm:w-auto'>
              <Icons.sparkles className='size-3.5' />
              Học thử miễn phí
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HeroMedia({
  detail,
  course,
  isLoading
}: {
  detail: PublicCourseDetail | undefined;
  course: ParentCourse;
  isLoading: boolean;
}) {
  const coverUrl = detail?.coverUrl || course.coverUrl;
  const introVideoUrl = detail?.introVideoUrl;

  if (isLoading) {
    return <Skeleton className='aspect-video w-full rounded-lg' />;
  }

  // Prefer the intro video when available — render a real <video> element with controls so
  // parents can preview the course without leaving the sheet.
  if (introVideoUrl) {
    return (
      <div className='aspect-video w-full overflow-hidden rounded-lg border bg-black'>
        <video
          src={introVideoUrl}
          poster={coverUrl}
          controls
          preload='metadata'
          className='h-full w-full'
        />
      </div>
    );
  }

  if (coverUrl) {
    return (
      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
        <Image src={coverUrl} alt={course.name} fill sizes='480px' className='object-cover' />
      </div>
    );
  }

  // Empty state: striped placeholder with the course code badge so the sheet doesn't render blank.
  return (
    <div className='bg-muted/40 grid aspect-video w-full place-items-center rounded-lg border [background-image:repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_12px,transparent_12px_24px)]'>
      <div className='text-muted-foreground text-center'>
        <Icons.media className='mx-auto size-6 opacity-60' />
        <div className='mt-2 font-mono text-[11px] tracking-wider uppercase'>{course.code}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='bg-muted/20 flex items-start gap-3 rounded-lg border p-3'>
      <span className='text-foreground/70 mt-0.5'>{icon}</span>
      <div className='min-w-0'>
        <div className='text-muted-foreground text-[11px] tracking-wider uppercase'>{label}</div>
        <div className={cn('mt-0.5 text-sm font-medium')}>{value}</div>
      </div>
    </div>
  );
}
