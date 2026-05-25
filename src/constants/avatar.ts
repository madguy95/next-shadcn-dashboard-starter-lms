export type AvatarTone = 'rose' | 'sky' | 'amber' | 'violet' | 'emerald' | 'foreground';

export const avatarToneClass: Record<AvatarTone, string> = {
  rose: 'bg-rose-200 text-rose-900',
  sky: 'bg-sky-200 text-sky-900',
  amber: 'bg-amber-200 text-amber-900',
  violet: 'bg-violet-200 text-violet-900',
  emerald: 'bg-emerald-200 text-emerald-900',
  foreground: 'bg-foreground text-background'
};
