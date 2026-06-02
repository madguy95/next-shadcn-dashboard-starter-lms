import { Geist, Geist_Mono, Outfit } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const fontOutfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
});

export const fontVariables = cn(fontSans.variable, fontMono.variable, fontOutfit.variable);
