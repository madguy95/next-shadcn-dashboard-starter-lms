import { ImageResponse } from 'next/og';
import { BrandIcon } from './_brand-icon';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<BrandIcon bgSize={180} iconSize={112} />, { ...size });
}
