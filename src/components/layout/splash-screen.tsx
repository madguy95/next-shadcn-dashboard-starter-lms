'use client';

import * as React from 'react';

const VISIBLE_MS = 400;
const FADE_MS = 200;

/**
 * First-visit splash with an animated robot mascot.
 *
 * Rendered in SSR HTML so it paints with the very first frame (no FOUC).
 * Visibility is driven by `data-splash` on <html>:
 *   - unset       → splash visible (initial state on first session visit)
 *   - "leaving"   → fading out
 *   - "done"      → display:none
 *
 * An inline script in <head> (see splash-init.ts) reads sessionStorage *before*
 * paint and sets data-splash="done" when the user has already seen the splash
 * this session, so the splash never flashes on subsequent navigations.
 *
 * This component only owns the timed dismiss — DOM/visibility comes from CSS.
 */
export function SplashScreen() {
  React.useEffect(() => {
    const root = document.documentElement;
    // Pre-paint script may have already marked the splash as done for this
    // session — in which case there's nothing to dismiss.
    if (root.dataset.splash === 'done') return;
    const t1 = window.setTimeout(() => {
      root.dataset.splash = 'leaving';
    }, VISIBLE_MS);
    const t2 = window.setTimeout(() => {
      root.dataset.splash = 'done';
    }, VISIBLE_MS + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div
      id='iqode-splash'
      aria-hidden
      className='bg-background fixed inset-0 z-[200] grid place-items-center'
    >
      <div className='flex flex-col items-center gap-5'>
        <RobotMascot />
        <div className='text-center'>
          <div className='text-foreground text-base font-semibold tracking-tight'>IQode Lab</div>
          <div className='text-muted-foreground font-mono text-[11px]'>Đang khởi động…</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline script body that runs in <head> before paint. It checks sessionStorage
 * and marks the <html> element so CSS can hide the splash with zero flicker on
 * subsequent visits in the same session.
 */
export const SPLASH_INIT_SCRIPT = `(function () {
  try {
    var key = 'iqode_splash_shown';
    if (sessionStorage.getItem(key)) {
      document.documentElement.dataset.splash = 'done';
    } else {
      sessionStorage.setItem(key, '1');
    }
  } catch (e) {}
})();`;

// transform-box: fill-box lets SVG elements rotate/scale around their own
// bounding box rather than the SVG root — essential for the antenna swing,
// eye blink, and arm wave to look natural.
const fillBox = { transformBox: 'fill-box' as const };

function RobotMascot() {
  return (
    <svg
      width='140'
      height='160'
      viewBox='0 0 140 160'
      fill='none'
      role='img'
      aria-label='Robot mascot'
      className='animate-robot-float'
    >
      {/* Antenna */}
      <g style={{ ...fillBox, transformOrigin: '50% 100%' }} className='animate-robot-antenna'>
        <line
          x1='70'
          y1='32'
          x2='70'
          y2='14'
          stroke='var(--primary)'
          strokeWidth='2.5'
          strokeLinecap='round'
        />
        <circle cx='70' cy='11' r='4.5' fill='var(--primary)' />
      </g>

      {/* Head */}
      <rect x='28' y='32' width='84' height='62' rx='14' fill='var(--primary)' />
      <rect
        x='28'
        y='32'
        width='84'
        height='62'
        rx='14'
        stroke='currentColor'
        strokeOpacity='0.08'
        strokeWidth='1.5'
        fill='none'
      />

      {/* Cheek blush */}
      <ellipse cx='42' cy='74' rx='5' ry='3' fill='#fb7185' opacity='0.6' />
      <ellipse cx='98' cy='74' rx='5' ry='3' fill='#fb7185' opacity='0.6' />

      {/* Eyes — group blinks together */}
      <g style={{ ...fillBox, transformOrigin: '50% 50%' }} className='animate-robot-blink'>
        <circle cx='54' cy='62' r='8.5' fill='white' />
        <circle cx='86' cy='62' r='8.5' fill='white' />
        <circle cx='54' cy='63' r='4' fill='#0f172a' />
        <circle cx='86' cy='63' r='4' fill='#0f172a' />
        <circle cx='56' cy='61' r='1.5' fill='white' />
        <circle cx='88' cy='61' r='1.5' fill='white' />
      </g>

      {/* Smile */}
      <path
        d='M 56 82 Q 70 90 84 82'
        stroke='#0f172a'
        strokeOpacity='0.7'
        strokeWidth='2.5'
        strokeLinecap='round'
        fill='none'
      />

      {/* Neck */}
      <rect x='62' y='94' width='16' height='8' fill='currentColor' opacity='0.2' />

      {/* Body */}
      <rect
        x='22'
        y='102'
        width='96'
        height='44'
        rx='10'
        fill='var(--primary)'
        fillOpacity='0.92'
      />

      {/* Chest light */}
      <circle cx='70' cy='124' r='6' fill='#fbbf24' className='animate-robot-chest' />

      {/* Arms */}
      <rect
        x='10'
        y='106'
        width='12'
        height='30'
        rx='6'
        fill='var(--primary)'
        fillOpacity='0.85'
        style={{ ...fillBox, transformOrigin: '50% 0%' }}
        className='animate-robot-arm-l'
      />
      <rect
        x='118'
        y='106'
        width='12'
        height='30'
        rx='6'
        fill='var(--primary)'
        fillOpacity='0.85'
        style={{ ...fillBox, transformOrigin: '50% 0%' }}
        className='animate-robot-arm-r'
      />
    </svg>
  );
}
