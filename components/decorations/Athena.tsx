interface Props {
  size?: number
  color?: string
  className?: string
}

/** Stylized profile silhouette of Athena (helmet + classical profile) */
export default function Athena({ size = 60, color = '#D4A24C', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Helmet plume */}
      <path
        d="M22 8 Q18 12 20 18 Q12 16 10 22 Q14 22 18 24 Q14 28 16 32 Q22 26 26 24"
        fill={color}
        opacity="0.9"
      />
      {/* Helmet crown */}
      <path
        d="M22 22 Q22 14 32 12 Q44 10 50 16 Q54 20 54 28 H22 Z"
        fill={color}
      />
      {/* Helmet rim */}
      <rect x="22" y="28" width="32" height="3" fill={color} opacity="0.95" />
      {/* Forehead + brow */}
      <path
        d="M28 32 Q26 38 30 42 L32 44"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Nose (Greek-style straight) */}
      <path
        d="M30 42 Q28 48 30 54 L34 56"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Lips */}
      <path d="M32 58 Q34 60 36 58" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Chin */}
      <path d="M34 62 Q38 64 40 62" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Hair behind helmet */}
      <path
        d="M52 28 Q56 36 54 48 Q52 56 48 64 L40 70 Q36 68 38 62"
        fill={color}
        opacity="0.85"
      />
      {/* Neck */}
      <rect x="38" y="62" width="6" height="10" fill={color} opacity="0.85" />
    </svg>
  )
}
