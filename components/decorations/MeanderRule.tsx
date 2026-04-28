interface Props {
  width?: number
  color?: string
  className?: string
}

/** Subtle gold horizontal rule with central meander accent — used as section divider */
export default function MeanderRule({ width = 160, color = '#B89A60', className = '' }: Props) {
  return (
    <svg
      width={width}
      height="14"
      viewBox="0 0 160 14"
      fill="none"
      stroke={color}
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Left rule */}
      <line x1="0" y1="7" x2="55" y2="7" />
      {/* Central meander pattern */}
      <path d="M58 2 V12 H68 V6 H64 V8 M72 2 V12 H82 V6 H78 V8 M86 2 V12 H96 V6 H92 V8" strokeWidth="0.9" fill="none" />
      {/* Right rule */}
      <line x1="105" y1="7" x2="160" y2="7" />
    </svg>
  )
}
