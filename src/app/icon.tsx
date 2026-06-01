import { ImageResponse } from 'next/og';
import { BrandIcon } from './_brand-icon';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BrandIcon bgSize={192} iconSize={120} />, { ...size });
}
