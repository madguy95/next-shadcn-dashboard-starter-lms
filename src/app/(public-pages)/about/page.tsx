export const revalidate = 360;
export const fetchCache = 'default-cache';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  publicTeacherKeys,
  publicTeachersOptions,
  type PublicTeacher
} from '@/api/public-teachers';
import { AboutPage } from '@/features/public/components/about-page';
import { getQueryClient } from '@/lib/query-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iqode.vn';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: {
      canonical: '/about',
      languages: { 'x-default': '/about' }
    },
    openGraph: {
      title,
      description,
      url: '/about',
      siteName: 'IQode Lab',
      type: 'website',
      locale: 'vi_VN',
      alternateLocale: ['en_US']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

function buildJsonLd(teachers: PublicTeacher[]) {
  const orgId = `${SITE_URL}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': orgId,
        name: 'IQode Lab',
        url: SITE_URL,
        description:
          'IQode Lab là startup giáo dục dạy tư duy lập trình cho trẻ 6–17 tuổi. Chúng tôi đào tạo tư duy logic và kỹ năng giải quyết vấn đề thay vì chỉ học ngôn ngữ.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Tầng 2, Parking Zone 4, VinSmart City',
          addressLocality: 'Quận Tây Hồ',
          addressRegion: 'Hà Nội',
          addressCountry: 'VN'
        },
        telephone: '+84901234567',
        email: 'iqode.file@gmail.com'
      },
      ...teachers.map((t) => ({
        '@type': 'Person',
        name: t.name,
        ...(t.subjects[0] ? { jobTitle: t.subjects[0] } : {}),
        ...(t.bio ? { description: t.bio } : {}),
        ...(t.avatarUrl ? { image: t.avatarUrl } : {}),
        worksFor: { '@id': orgId }
      }))
    ]
  };
}

export default async function AboutRoute() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(publicTeachersOptions());
  const teachers = queryClient.getQueryData<PublicTeacher[]>(publicTeacherKeys.all) ?? [];

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(teachers))
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
        }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AboutPage />
      </HydrationBoundary>
    </>
  );
}
