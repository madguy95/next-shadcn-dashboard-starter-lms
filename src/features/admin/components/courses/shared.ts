import type * as React from 'react';

export const thumbStripeStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 4%, transparent) 0 8px, transparent 8px 16px)'
};

const VND_FORMATTER = new Intl.NumberFormat('vi-VN');
export const formatVnd = (n: number) => VND_FORMATTER.format(n);
