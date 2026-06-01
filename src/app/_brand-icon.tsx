export function BrandIcon({ bgSize, iconSize }: { bgSize: number; iconSize: number }) {
  return (
    <div
      style={{
        width: bgSize,
        height: bgSize,
        borderRadius: '50%',
        background: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4' />
        <path d='M12 2v2' />
        <path d='M9 12v9' />
        <path d='M15 12v9' />
        <path d='M5 16l4 -2' />
        <path d='M15 14l4 2' />
        <path d='M9 18h6' />
        <path d='M10 8v.01' />
        <path d='M14 8v.01' />
      </svg>
    </div>
  );
}
