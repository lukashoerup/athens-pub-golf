interface Props {
  size?: number
  color?: string
  className?: string
}

export default function Amphora({ size = 32, color = '#0D5EAF', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Mouth/lip */}
      <path d="M14 4 Q14 2 16 2 H24 Q26 2 26 4 V6 H14 Z" fill={color} />
      {/* Neck */}
      <path d="M16 6 H24 V12 H16 Z" fill={color} opacity="0.92" />
      {/* Shoulders + body (the bulbous part) */}
      <path
        d="M16 12 Q6 16 6 28 Q6 42 14 48 H26 Q34 42 34 28 Q34 16 24 12 Z"
        fill={color}
      />
      {/* Foot */}
      <path d="M16 48 H24 V52 Q20 56 20 56 Q20 56 16 52 Z" fill={color} opacity="0.95" />
      {/* Handles (left and right) */}
      <path
        d="M14 12 Q4 14 4 22 Q4 28 8 28"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M26 12 Q36 14 36 22 Q36 28 32 28"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Decorative band — meander suggestion */}
      <rect x="10" y="22" width="20" height="2" fill="#FFFFFF" opacity="0.4" />
      <rect x="10" y="32" width="20" height="2" fill="#FFFFFF" opacity="0.4" />
    </svg>
  )
}
