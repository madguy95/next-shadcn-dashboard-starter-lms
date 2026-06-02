'use client';

import {
  IconAlertCircle,
  IconZoomQuestion,
  IconPencil,
  IconCode,
  IconArrowBackUp,
  IconCircleCheck,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// ─── Step config ─────────────────────────────────────────────────────────────

const STEP_CONFIG = [
  {
    num: '01',
    key: 'step1' as const,
    stripBg: 'bg-orange-500',
    accentText: 'text-orange-600',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    scienceBg: 'bg-orange-50',
    scienceBorder: 'border-l-orange-400',
    Icon: IconAlertCircle
  },
  {
    num: '02',
    key: 'step2' as const,
    stripBg: 'bg-amber-500',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    scienceBg: 'bg-amber-50',
    scienceBorder: 'border-l-amber-400',
    Icon: IconZoomQuestion
  },
  {
    num: '03',
    key: 'step3' as const,
    stripBg: 'bg-teal-600',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-50',
    accentBorder: 'border-teal-200',
    scienceBg: 'bg-teal-50',
    scienceBorder: 'border-l-teal-500',
    Icon: IconPencil
  },
  {
    num: '04',
    key: 'step4' as const,
    stripBg: 'bg-slate-700',
    accentText: 'text-slate-700',
    accentBg: 'bg-slate-50',
    accentBorder: 'border-slate-200',
    scienceBg: 'bg-slate-50',
    scienceBorder: 'border-l-slate-500',
    Icon: IconCode
  },
  {
    num: '05',
    key: 'step5' as const,
    stripBg: 'bg-violet-700',
    accentText: 'text-violet-700',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    scienceBg: 'bg-violet-50',
    scienceBorder: 'border-l-violet-500',
    Icon: IconArrowBackUp
  }
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function MethodHero() {
  const t = useTranslations('method.hero');
  return (
    <section className='relative flex min-h-[440px] items-center justify-start overflow-hidden bg-gray-900'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className='relative z-10 mx-auto w-full max-w-5xl px-6 py-20 md:px-10'>
        <span className='mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-widest text-cyan-300 uppercase'>
          {t('badge')}
        </span>
        <h1 className='max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl'>
          {t('title')}
        </h1>
        <p className='mt-4 max-w-lg text-base italic leading-relaxed text-white/60 md:text-lg'>
          {t('subtitle')}
        </p>
        <p className='mt-6 text-xs tracking-widest text-white/40 uppercase'>{t('tagline')}</p>
      </div>
    </section>
  );
}

// ─── 5-Step Strip ────────────────────────────────────────────────────────────

function FiveStepStrip() {
  const t = useTranslations('method.strip');
  return (
    <div className='flex w-full overflow-x-auto'>
      {STEP_CONFIG.map((s) => (
        <div
          key={s.num}
          className={`flex min-w-[80px] flex-1 flex-col items-center justify-center gap-1 py-4 ${s.stripBg}`}
        >
          <span className='text-[11px] font-bold tracking-widest text-white/80 uppercase'>
            {s.num}
          </span>
          <span className='text-center text-[13px] font-bold tracking-wide text-white uppercase'>
            {t(s.key)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Intro section ───────────────────────────────────────────────────────────

function IntroSection() {
  const t = useTranslations('method.intro');
  const rows = [
    { step: t('row1Step'), name: t('row1Name'), foundation: t('row1Foundation') },
    { step: t('row2Step'), name: t('row2Name'), foundation: t('row2Foundation') },
    { step: t('row3Step'), name: t('row3Name'), foundation: t('row3Foundation') },
    { step: t('row4Step'), name: t('row4Name'), foundation: t('row4Foundation') },
    { step: t('row5Step'), name: t('row5Name'), foundation: t('row5Foundation') }
  ];
  return (
    <section className='bg-white py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
          {t('eyebrow')}
        </div>
        <h2 className='mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <p className='mb-8 max-w-3xl text-sm leading-relaxed text-gray-600'>{t('body')}</p>

        {/* Core definition box */}
        <div className='mb-8 rounded-xl border-l-4 border-violet-400 bg-violet-50 p-5'>
          <p className='mb-1 text-xs font-bold text-violet-700'>{t('coreDefTitle')}</p>
          <p className='text-sm leading-relaxed text-gray-700'>{t('coreDef')}</p>
        </div>

        <p className='mb-6 max-w-3xl text-sm leading-relaxed text-gray-600'>{t('sdtIntro')}</p>

        {/* SDT table */}
        <div className='overflow-x-auto rounded-xl border border-gray-200'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('tableStep')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('tableName')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('tableFoundation')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className='border-t border-gray-100'>
                  <td className='px-4 py-3 font-mono text-xs font-bold text-gray-400'>
                    {row.step}
                  </td>
                  <td className='px-4 py-3 font-semibold text-gray-800'>{row.name}</td>
                  <td className='px-4 py-3 text-gray-600'>{row.foundation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Why section ─────────────────────────────────────────────────────────────

function WhySection() {
  const t = useTranslations('method.why');
  const rows = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') }
  ];
  return (
    <section className='bg-gray-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
          {t('eyebrow')}
        </div>
        <h2 className='mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <p className='mb-8 max-w-3xl text-sm leading-relaxed text-gray-600'>{t('body')}</p>

        <div className='mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white'>
          <table className='w-full text-sm'>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i > 0 ? 'border-t border-gray-100' : ''}>
                  <td className='w-1/2 px-5 py-4 font-semibold text-gray-800'>{row.q}</td>
                  <td className='w-1/2 px-5 py-4 text-gray-500'>{row.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='rounded-xl border-l-4 border-blue-400 bg-blue-50 p-5'>
          <p className='mb-1 text-xs font-bold text-blue-700'>{t('unescoTitle')}</p>
          <p className='text-sm leading-relaxed text-gray-700'>{t('unescoBody')}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Step card ───────────────────────────────────────────────────────────────

type StepKey = 'step1' | 'step2' | 'step3' | 'step4' | 'step5';

function StepCard({ cfg }: { cfg: (typeof STEP_CONFIG)[number] }) {
  const t = useTranslations('method.steps');
  const sk = cfg.key as StepKey;

  const doItems = [t(`${sk}.do1`), t(`${sk}.do2`), t(`${sk}.do3`)];
  const dontItems = [t(`${sk}.dont1`), t(`${sk}.dont2`), t(`${sk}.dont3`)];

  const isStep4 = cfg.key === 'step4';
  const isStep5 = cfg.key === 'step5';

  return (
    <div className={`rounded-2xl border ${cfg.accentBorder} bg-white overflow-hidden`}>
      {/* Header */}
      <div className={`${cfg.stripBg} px-6 py-5`}>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20'>
            <cfg.Icon size={24} className='text-white' stroke={1.8} />
          </div>
          <div>
            <p className='text-xs font-bold tracking-widest text-white/70 uppercase'>
              {t(`${sk}.label`)}
            </p>
            <h3 className='text-xl font-bold text-white'>{t(`${sk}.name`)}</h3>
            <p className='mt-0.5 text-sm italic text-white/70'>{t(`${sk}.tagline`)}</p>
          </div>
        </div>
        <p className='mt-3 text-xs text-white/60'>
          {t('scienceLabel')}:{' '}
          <span className='font-semibold text-white/80'>{t(`${sk}.science`)}</span>
        </p>
      </div>

      {/* Body */}
      <div className='p-6 space-y-6'>
        {/* Psych */}
        <div>
          <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${cfg.accentText}`}>
            {t('psychTitle')}
          </p>
          <p className='text-sm leading-relaxed text-gray-600'>{t(`${sk}.psychBody`)}</p>
        </div>

        {/* Science note */}
        <div className={`rounded-lg border-l-4 ${cfg.scienceBorder} ${cfg.scienceBg} p-4`}>
          <p className={`mb-1 text-xs font-bold ${cfg.accentText}`}>{t('scienceTitle')}</p>
          <p className='text-xs leading-relaxed text-gray-700'>{t(`${sk}.scienceNote`)}</p>
        </div>

        {/* Step 5: Reflect tiers */}
        {isStep5 && (
          <div>
            <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${cfg.accentText}`}>
              {t('step5.reflectTitle')}
            </p>
            <div className='overflow-x-auto rounded-xl border border-gray-200'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-3 py-2 text-left font-semibold text-gray-500'>
                      {t('reflectColTier')}
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-500'>
                      {t('reflectColQ')}
                    </th>
                    <th className='px-3 py-2 text-left font-semibold text-gray-500'>
                      {t('reflectColSkill')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(['t1', 't2', 't3', 't4'] as const).map((tier) => (
                    <tr key={tier} className='border-t border-gray-100'>
                      <td className='px-3 py-2.5 font-semibold text-gray-800'>
                        {t(`step5.${tier}`)}
                      </td>
                      <td className='px-3 py-2.5 italic text-gray-600'>{t(`step5.${tier}q`)}</td>
                      <td className='px-3 py-2.5 text-gray-500'>{t(`step5.${tier}skill`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DO / DON'T */}
        <div className='grid gap-5 sm:grid-cols-2'>
          <div>
            <p
              className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${cfg.accentText}`}
            >
              <IconCheck size={14} stroke={2.5} />
              {t('doTitle')}
            </p>
            <ul className='space-y-2'>
              {doItems.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2 text-xs leading-relaxed text-gray-600'
                >
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.stripBg}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className='mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500'>
              <IconX size={14} stroke={2.5} />
              {t('dontTitle')}
            </p>
            <ul className='space-y-2'>
              {dontItems.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2 text-xs leading-relaxed text-gray-600'
                >
                  <span className='mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Build step: right/wrong table */}
        {isStep4 && (
          <div className='overflow-x-auto rounded-xl border border-gray-200'>
            <table className='w-full text-xs'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='px-4 py-2 text-left font-semibold text-green-600'>
                    {t('step4.whenRight')}
                  </th>
                  <th className='px-4 py-2 text-left font-semibold text-red-500'>
                    {t('step4.whenWrong')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(['1', '2', '3'] as const).map((n) => (
                  <tr key={n} className='border-t border-gray-100'>
                    <td className='px-4 py-2.5 italic text-gray-700'>{t(`step4.right${n}`)}</td>
                    <td className='px-4 py-2.5 italic text-gray-700'>{t(`step4.wrong${n}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Questions */}
        <div>
          <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${cfg.accentText}`}>
            {t('questionsTitle')}
          </p>
          <ul className='space-y-1.5'>
            {(cfg.key === 'step2'
              ? [t(`${sk}.q1`), t(`${sk}.q2`), t(`${sk}.q3`), t(`step2.q4`)]
              : [t(`${sk}.q1`), t(`${sk}.q2`), t(`${sk}.q3`)]
            ).map((q, i) => (
              <li key={i} className='text-xs leading-relaxed text-gray-600'>
                → {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Step 5: condition box */}
        {isStep5 && (
          <div className='rounded-lg bg-gray-800 p-4'>
            <p className='mb-1 text-xs font-bold text-white'>{t('step5.conditionTitle')}</p>
            <p className='text-xs leading-relaxed text-gray-300'>{t('step5.condition')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Five steps section ───────────────────────────────────────────────────────

function FiveStepDetails() {
  const t = useTranslations('method.steps');
  return (
    <section className='bg-gray-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
          {t('eyebrow')}
        </div>
        <h2 className='mb-10 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <div className='space-y-8'>
          {STEP_CONFIG.map((cfg) => (
            <StepCard key={cfg.key} cfg={cfg} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Summary table ────────────────────────────────────────────────────────────

function SummaryTable() {
  const t = useTranslations('method.summary');
  const rows = [
    {
      step: '01',
      name: 'Real Problem',
      foundation: t('row1Foundation'),
      sdt: t('row1SDT'),
      success: t('row1Success')
    },
    {
      step: '02',
      name: 'Analyze',
      foundation: t('row2Foundation'),
      sdt: t('row2SDT'),
      success: t('row2Success')
    },
    {
      step: '03',
      name: 'Design',
      foundation: t('row3Foundation'),
      sdt: t('row3SDT'),
      success: t('row3Success')
    },
    {
      step: '04',
      name: 'Build',
      foundation: t('row4Foundation'),
      sdt: t('row4SDT'),
      success: t('row4Success')
    },
    {
      step: '05',
      name: 'Reflect',
      foundation: t('row5Foundation'),
      sdt: t('row5SDT'),
      success: t('row5Success')
    }
  ];
  const stepColors = [
    'bg-orange-500',
    'bg-amber-500',
    'bg-teal-600',
    'bg-slate-700',
    'bg-violet-700'
  ];
  return (
    <section className='bg-white py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
          {t('eyebrow')}
        </div>
        <h2 className='mb-8 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <div className='overflow-x-auto rounded-2xl border border-gray-200'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('colStep')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('colFoundation')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500 hidden md:table-cell'>
                  {t('colSDT')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-500'>
                  {t('colSuccess')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className='border-t border-gray-100'>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${stepColors[i]}`}
                    >
                      {row.step} {row.name}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-xs text-gray-700'>{row.foundation}</td>
                  <td className='px-4 py-3 text-xs text-gray-500 hidden md:table-cell'>
                    {row.sdt}
                  </td>
                  <td className='px-4 py-3 text-xs italic text-gray-600'>{row.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Core principle box */}
        <div className='mt-8 rounded-xl border-l-4 border-violet-400 bg-violet-50 p-6'>
          <p className='mb-2 text-xs font-bold text-violet-700'>{t('coreTitle')}</p>
          <p className='text-sm leading-relaxed text-gray-700'>{t('coreBody')}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export function MethodPage() {
  return (
    <div className='min-h-screen'>
      <MethodHero />
      <FiveStepStrip />
      <IntroSection />
      <WhySection />
      <FiveStepDetails />
      <SummaryTable />
    </div>
  );
}
