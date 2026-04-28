interface Props {
  height?: number
  color?: string
  className?: string
  strokeWidth?: number
}

export default function DoricColumn({
  height = 220,
  color = '#1A2438',
  className = '',
  strokeWidth = 1.2,
}: Props) {
  const width = (height * 0.36) | 0
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 220"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Capital — abacus (square slab on top) */}
      <rect x="10" y="34" width="60" height="6" />

      {/* Echinus — curved cushion below abacus */}
      <path d="M14 40 C14 48, 18 54, 22 54 L58 54 C62 54, 66 48, 66 40" />

      {/* Shaft — outline */}
      <line x1="22" y1="54" x2="22" y2="178" />
      <line x1="58" y1="54" x2="58" y2="178" />

      {/* Fluting (subtle vertical channels) */}
      <line x1="28" y1="58" x2="28" y2="174" strokeWidth={strokeWidth * 0.55} opacity="0.55" />
      <line x1="34" y1="58" x2="34" y2="174" strokeWidth={strokeWidth * 0.55} opacity="0.55" />
      <line x1="40" y1="58" x2="40" y2="174" strokeWidth={strokeWidth * 0.55} opacity="0.55" />
      <line x1="46" y1="58" x2="46" y2="174" strokeWidth={strokeWidth * 0.55} opacity="0.55" />
      <line x1="52" y1="58" x2="52" y2="174" strokeWidth={strokeWidth * 0.55} opacity="0.55" />

      {/* Base / plinth (stepped) */}
      <rect x="16" y="178" width="48" height="4" />
      <rect x="10" y="182" width="60" height="6" />
      <rect x="4" y="188" width="72" height="14" />
    </svg>
  )
}
