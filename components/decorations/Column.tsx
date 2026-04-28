interface Props {
  height?: number
  color?: string
  className?: string
}

export default function Column({ height = 60, color = '#D4A24C', className = '' }: Props) {
  const width = (height * 0.22) | 0
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Capital (top) */}
      <rect x="0" y="0" width="14" height="3" fill={color} />
      <rect x="1" y="3" width="12" height="2" fill={color} opacity="0.85" />
      {/* Shaft with fluting */}
      <rect x="2" y="5" width="10" height="50" fill={color} opacity="0.85" />
      <line x1="4" y1="5" x2="4" y2="55" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />
      <line x1="7" y1="5" x2="7" y2="55" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />
      <line x1="10" y1="5" x2="10" y2="55" stroke="#FFFFFF" strokeWidth="0.4" opacity="0.5" />
      {/* Base */}
      <rect x="1" y="55" width="12" height="2" fill={color} opacity="0.85" />
      <rect x="0" y="57" width="14" height="3" fill={color} />
    </svg>
  )
}
