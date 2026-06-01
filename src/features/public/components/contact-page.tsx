'use client';

import { IconBrandFacebook, IconMail, IconMapPin } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { submitConsultationRequest } from '@/api/enrollments/service';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { cn } from '@/lib/utils';

type FormValues = {
  parentName: string;
  parentPhone: string;
  email: string;
  childName: string;
  age: string;
  interestedCourse: string;
  message: string;
};

const EMPTY: FormValues = {
  parentName: '',
  parentPhone: '',
  email: '',
  childName: '',
  age: '',
  interestedCourse: '',
  message: ''
};

function ContactInfoCard({
  icon,
  iconBg,
  label,
  value,
  href
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className='flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm'>
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
        {icon}
      </div>
      <div className='min-w-0'>
        <p className='text-[10px] font-semibold tracking-widest text-gray-400 uppercase'>{label}</p>
        {href ? (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-0.5 block truncate text-sm font-medium text-blue-600 hover:underline'
          >
            {value}
          </a>
        ) : (
          <p className='mt-0.5 text-sm font-medium text-gray-800'>{value}</p>
        )}
      </div>
    </div>
  );
}

function SuccessState({
  title,
  message,
  onReset,
  closeLabel
}: {
  title: string;
  message: string;
  onReset: () => void;
  closeLabel: string;
}) {
  return (
    <div className='flex flex-col items-center gap-4 py-10 text-center'>
      <div className='flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600'>
        <Icons.check className='size-7' />
      </div>
      <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
      <p className='max-w-sm text-sm text-gray-500'>{message}</p>
      <Button variant='outline' onClick={onReset} className='mt-2'>
        {closeLabel}
      </Button>
    </div>
  );
}

export function ContactPage() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  const fieldSchemas = useMemo(
    () => ({
      parentName: z.string().trim().min(2, t('validation.parentNameRequired')).max(120),
      parentPhone: z
        .string()
        .trim()
        .min(1, t('validation.parentPhoneRequired'))
        .regex(/^[0-9+\-\s]{8,20}$/, t('validation.parentPhoneInvalid')),
      email: z
        .string()
        .trim()
        .max(200)
        .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), t('validation.emailInvalid')),
      childName: z.string().trim().max(120),
      age: z.string().trim().max(20),
      interestedCourse: z.string().trim().max(120),
      message: z
        .string()
        .trim()
        .min(1, t('validation.messageRequired'))
        .max(1000, t('validation.messageTooLong'))
    }),
    [t]
  );

  const formSchema = useMemo(() => z.object(fieldSchemas), [fieldSchemas]);

  const form = useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      try {
        const noteParts = [
          value.message.trim(),
          value.email.trim() ? `Email: ${value.email.trim()}` : null,
          value.interestedCourse.trim() ? `Khóa quan tâm: ${value.interestedCourse.trim()}` : null,
          value.age.trim() ? `Tuổi con: ${value.age.trim()}` : null
        ].filter(Boolean);

        await submitConsultationRequest({
          parentName: value.parentName,
          parentPhone: value.parentPhone,
          childName: value.childName.trim() || undefined,
          note: noteParts.join('\n') || undefined
        });
        setSubmitted(true);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('submitError'));
      }
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<FormValues>();

  return (
    <div className='min-h-screen'>
      {/* Hero */}
      <section className='bg-[#0e1f3e] px-4 py-20 text-white'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-5 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-900/50 px-4 py-1 text-[11px] font-semibold tracking-widest text-blue-300 uppercase'>
            {t('heroEyebrow')}
          </div>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>{t('heroTitle')}</h1>
          <p className='mt-4 text-base text-white/60 md:text-lg'>{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* Body */}
      <section className='bg-[#eef2f8] px-4 py-14 md:py-20'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
            {/* Left: contact info + map */}
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-gray-900'>{t('infoTitle')}</h2>

              <ContactInfoCard
                icon={<IconMapPin size={20} />}
                iconBg='bg-orange-100 text-orange-600'
                label={t('addressLabel')}
                value={t('addressValue')}
              />
              <ContactInfoCard
                icon={<Icons.phone size={20} />}
                iconBg='bg-blue-100 text-blue-600'
                label={t('phoneLabel')}
                value={t('phoneValue')}
                href={`tel:${t('phoneValue').replace(/\s/g, '')}`}
              />
              <ContactInfoCard
                icon={<IconMail size={20} />}
                iconBg='bg-green-100 text-green-600'
                label={t('emailContactLabel')}
                value={t('emailContactValue')}
                href={`mailto:${t('emailContactValue')}`}
              />
              <ContactInfoCard
                icon={<IconBrandFacebook size={20} />}
                iconBg='bg-blue-100 text-blue-700'
                label={t('facebookLabel')}
                value={t('facebookValue')}
                href={`https://${t('facebookValue')}`}
              />

              {/* Map */}
              <div className='overflow-hidden rounded-xl border border-gray-200 shadow-sm'>
                <iframe
                  title='IQode Lab Location'
                  src='https://www.openstreetmap.org/export/embed.html?bbox=105.729482,21.003282,105.745704,20.994288&layer=mapnik&marker=20.999076,105.737389'
                  width='100%'
                  height='260'
                  loading='lazy'
                  className='block'
                />
              </div>
            </div>

            {/* Right: form card */}
            <div className='rounded-2xl bg-white px-8 pb-8 pt-7 shadow-sm'>
              {submitted ? (
                <SuccessState
                  title={t('successTitle')}
                  message={t('successBody')}
                  onReset={() => {
                    form.reset();
                    setSubmitted(false);
                  }}
                  closeLabel={t('successClose')}
                />
              ) : (
                <>
                  <h2 className='text-xl font-bold text-gray-900'>{t('formTitle')}</h2>
                  <p className='mt-1 mb-5 text-sm text-gray-500'>{t('formSubtitle')}</p>

                  <form.AppForm>
                    <form.Form className='gap-4 p-0 md:p-0'>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormTextField
                          name='parentName'
                          label={t('parentName')}
                          required
                          placeholder={t('parentNamePlaceholder')}
                          autoComplete='name'
                          validators={{ onBlur: fieldSchemas.parentName }}
                        />
                        <FormTextField
                          name='parentPhone'
                          label={t('parentPhone')}
                          required
                          placeholder={t('parentPhonePlaceholder')}
                          inputMode='tel'
                          autoComplete='tel'
                          validators={{ onBlur: fieldSchemas.parentPhone }}
                        />
                      </div>

                      <FormTextField
                        name='email'
                        label={t('email')}
                        placeholder={t('emailPlaceholder')}
                        type='email'
                        autoComplete='email'
                        validators={{ onBlur: fieldSchemas.email }}
                      />

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                        <FormTextField
                          name='childName'
                          label={t('childName')}
                          placeholder={t('childNamePlaceholder')}
                        />
                        <FormTextField
                          name='age'
                          label={t('age')}
                          placeholder={t('agePlaceholder')}
                        />
                        <FormTextField
                          name='interestedCourse'
                          label={t('interestedCourse')}
                          placeholder={t('interestedCoursePlaceholder')}
                        />
                      </div>

                      <FormTextareaField
                        name='message'
                        label={t('message')}
                        required
                        placeholder={t('messagePlaceholder')}
                        rows={4}
                        validators={{ onBlur: fieldSchemas.message }}
                      />

                      <form.SubmitButton className='mt-2 w-full bg-blue-600 hover:bg-blue-700'>
                        <Icons.send className='mr-2 size-4' />
                        {t('submit')}
                      </form.SubmitButton>
                    </form.Form>
                  </form.AppForm>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
