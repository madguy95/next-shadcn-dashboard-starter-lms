import { ImageResponse } from 'next/og';

export const alt = 'Liên hệ IQode Lab';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#0d1b35',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 80px',
        fontFamily: 'sans-serif'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>IQode</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#f97316' }}>&nbsp;Lab</span>
        </div>
        <span style={{ display: 'flex', fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>
          iqode.vn
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 18,
            letterSpacing: '-1px'
          }}
        >
          Liên hệ IQode Lab
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
            maxWidth: 700
          }}
        >
          Để lại thông tin và chúng tôi sẽ liên hệ lại trong 24 giờ
        </div>
      </div>
    </div>,
    { ...size }
  );
}
