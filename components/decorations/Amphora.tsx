interface Props {
  size?: number
  color?: string
  className?: string
}

/** Refined line-drawn amphora — used as inline decoration */
export default function Amphora({ size = 24, color = '#1A2438', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={(size * 1.4) | 0}
      viewBox="0 0 24 34"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Mouth */}
      <path d="M9 2 H15 V4 H9 Z" />
      {/* Neck */}
      <path d="M10 4 V8" />
      <path d="M14 4 V8" />
      {/* Body — rounded urn */}
      <path d="M10 8 Q 3 11, 3 18 Q 3 25, 8 28 H16 Q 21 25, 21 18 Q 21 11, 14 8" />
      {/* Foot */}
      <path d="M9 28 V31 H15 V28" />
      {/* Handles */}
      <path d="M10 8 Q 5 9, 5 13" />
      <path d="M14 8 Q 19 9, 19 13" />
      {/* Decorative band */}
      <line x1="6" y1="16" x2="18" y2="16" strokeWidth="0.5" opacity="0.5" />
      <line x1="6" y1="20" x2="18" y2="20" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}
