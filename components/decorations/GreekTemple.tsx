interface Props {
  size?: number
  color?: string
  className?: string
}

export default function GreekTemple({ size = 140, color = '#D4A24C', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={(size * 0.7) | 0}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Pediment (triangular roof) */}
      <path
        d="M30 50 L100 12 L170 50 Z"
        fill={color}
        opacity="0.95"
      />
      {/* Pediment shadow line */}
      <path
        d="M30 50 L170 50 L100 12 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />

      {/* Architrave (horizontal beam under pediment) */}
      <rect x="22" y="50" width="156" height="9" fill={color} opacity="0.9" />
      <rect x="22" y="59" width="156" height="3" fill={color} opacity="0.5" />

      {/* Columns — 4 Doric columns */}
      {[36, 76, 116, 156].map((x, i) => (
        <g key={i}>
          {/* Column shaft with vertical fluting suggestion */}
          <rect x={x} y="64" width="12" height="60" fill={color} opacity="0.85" />
          <line x1={x + 3} y1="64" x2={x + 3} y2="124" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" />
          <line x1={x + 6} y1="64" x2={x + 6} y2="124" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" />
          <line x1={x + 9} y1="64" x2={x + 9} y2="124" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4" />
          {/* Column capital (top) */}
          <rect x={x - 2} y="62" width="16" height="3" fill={color} />
          {/* Column base */}
          <rect x={x - 2} y="124" width="16" height="3" fill={color} />
        </g>
      ))}

      {/* Stylobate (base platform) */}
      <rect x="14" y="127" width="172" height="6" fill={color} opacity="0.9" />
      <rect x="10" y="133" width="180" height="4" fill={color} opacity="0.7" />
    </svg>
  )
}
