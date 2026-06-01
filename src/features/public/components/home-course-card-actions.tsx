'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { PublicCourse } from '@/api/courses/types';
import { ConsultationRequestDialog } from './consultation-request-dialog';
import { CourseInquiryDialog } from './course-inquiry-dialog';

export function HomeCourseCardActions({ course }: { course: PublicCourse }) {
  const t = useTranslations('home.courses');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    // stopPropagation here catches all events from buttons AND dialog portals (backdrop/close),
    // preventing them from bubbling up to the parent Link card and triggering navigation.
    <div onClick={(e) => e.stopPropagation()}>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConsultOpen(true);
          }}
          className='inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900'
        >
          {t('consultBtn')}
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEnrollOpen(true);
          }}
          className='inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700'
        >
          {t('enrollBtn')}
        </button>
      </div>

      <ConsultationRequestDialog
        open={consultOpen}
        onOpenChange={setConsultOpen}
        course={{ id: course.id, title: course.title }}
      />

      <CourseInquiryDialog open={enrollOpen} onOpenChange={setEnrollOpen} course={course} />
    </div>
  );
}
