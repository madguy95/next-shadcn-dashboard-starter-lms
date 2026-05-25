'use client';

import type { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { stepKeys, type StepKey } from './schema';

interface StepperProps {
  step: StepKey;
  tDialog: ReturnType<typeof useTranslations>;
  onJumpTo: (step: StepKey, targetIndex: number, currentIndex: number) => void;
}

export function Stepper({ step, tDialog, onJumpTo }: StepperProps) {
  const currentIdx = stepKeys.indexOf(step);
  return (
    <div className='bg-muted/30 border-y px-6 py-3'>
      <ol className='flex items-center gap-2'>
        {stepKeys.map((s, i) => {
          const active = step === s;
          const completed = currentIdx > i;
          return (
            <li key={s} className='flex flex-1 items-center gap-2'>
              <button
                type='button'
                onClick={() => onJumpTo(s, i, currentIdx)}
                className='flex items-center gap-2 outline-none focus-visible:opacity-80'
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition',
                    active && 'bg-foreground text-background border-foreground',
                    completed && 'border-emerald-500 bg-emerald-500 text-white',
                    !active && !completed && 'bg-background text-muted-foreground'
                  )}
                >
                  {completed ? <Icons.check className='size-3.5' /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-[12px] whitespace-nowrap',
                    active && 'font-semibold',
                    !active && 'text-muted-foreground'
                  )}
                >
                  {tDialog(`steps.${s}`)}
                </span>
              </button>
              {i < stepKeys.length - 1 && (
                <div className={cn('h-px flex-1', completed ? 'bg-emerald-500' : 'bg-border')} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
