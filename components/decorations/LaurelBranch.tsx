interface Props {
  size?: number
  color?: string
  className?: string
  /** When true, mirrors horizontally (use for the right-hand laurel) */
  mirrored?: boolean
}

export default function LaurelBranch({ size = 60, color = '#B89A60', className = '', mirrored = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      {/* Main branch curve */}
      <path d="M70 64 C 50 56, 30 44, 14 22" strokeWidth="1.4" />

      {/* Leaves on upper side */}
      <path d="M58 50 Q 50 38, 60 32" />
      <path d="M48 42 Q 40 30, 50 24" />
      <path d="M38 32 Q 30 20, 40 14" />
      <path d="M28 22 Q 20 10, 30 4" />

      {/* Leaves on lower side */}
      <path d="M64 60 Q 60 70, 70 74" />
      <path d="M54 52 Q 50 62, 60 66" />
      <path d="M44 42 Q 40 52, 50 56" />
      <path d="M34 30 Q 30 40, 40 44" />
      <path d="M24 18 Q 20 28, 30 32" />
    </svg>
  )
}
