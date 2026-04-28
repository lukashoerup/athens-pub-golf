interface Props {
  size?: number
  color?: string
  className?: string
}

/** Small temple-front pictogram, used as map-link icon (replaces 📍) */
export default function TempleMarker({ size = 16, color = 'currentColor', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      strokeLinecap="square"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Pediment (triangle roof) */}
      <path d="M2 6 L8 1.5 L14 6 Z" fill={color} fillOpacity="0.15" />
      {/* Architrave */}
      <line x1="2.5" y1="6" x2="13.5" y2="6" />
      <line x1="2.5" y1="7" x2="13.5" y2="7" />
      {/* Columns */}
      <line x1="4" y1="7.5" x2="4" y2="13" />
      <line x1="6.5" y1="7.5" x2="6.5" y2="13" />
      <line x1="9.5" y1="7.5" x2="9.5" y2="13" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      {/* Base */}
      <line x1="2" y1="13.5" x2="14" y2="13.5" />
      <line x1="1" y1="14.5" x2="15" y2="14.5" />
    </svg>
  )
}
