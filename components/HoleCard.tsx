import type { Hole } from '@/lib/types'

interface Props {
  hole: Hole
  showMapLink?: boolean
}

/**
 * Map of hole id → district label (small caps section header)
 * and approximate coordinates (for that classical-atlas feel).
 */
const HOLE_META: Record<number, { district: string; coords: string }> = {
  1: { district: 'Koukaki → Veikou', coords: '37.96°N · 23.72°Ø' },
  2: { district: 'Koukaki', coords: '37.97°N · 23.72°Ø' },
  3: { district: 'Syntagma', coords: '37.97°N · 23.73°Ø' },
  4: { district: 'Kolokotroni', coords: '37.97°N · 23.73°Ø' },
  5: { district: 'Agia Irini', coords: '37.97°N · 23.72°Ø' },
  6: { district: 'Areopagos', coords: '37.97°N · 23.72°Ø' },
  7: { district: 'Psiri', coords: '37.97°N · 23.72°Ø' },
  8: { district: 'Psiri · Iroon', coords: '37.97°N · 23.72°Ø' },
  9: { district: 'Psiri', coords: '37.97°N · 23.72°Ø' },
  10: { district: 'Kolokotroni', coords: '37.97°N · 23.73°Ø' },
  11: { district: 'Syntagma', coords: '37.97°N · 23.73°Ø' },
  12: { district: 'Psiri', coords: '37.97°N · 23.72°Ø' },
}

export default function HoleCard({ hole, showMapLink = true }: Props) {
  const meta = HOLE_META[hole.id] ?? { district: hole.address, coords: '' }

  return (
    <article className="space-y-5">
      {/* District + coordinates row */}
      <div className="flex items-baseline justify-between">
        <span className="smallcaps">{meta.district}</span>
        {meta.coords && (
          <span className="font-mono text-ink-muted text-xs" style={{ letterSpacing: '0.08em' }}>
            {meta.coords}
          </span>
        )}
      </div>

      {/* Stop name */}
      <h2 className="display-lg">{hole.name}</h2>

      {/* Address as italic subtitle */}
      <p className="font-serif italic text-ink-secondary text-lg -mt-2">
        {hole.address}
      </p>

      {/* Gold rule */}
      <div className="w-12 h-px bg-gold" />

      {/* Fun fact as field-note quote */}
      <p className="field-quote">
        &ldquo;{hole.fun_fact}&rdquo;
      </p>
      <p className="smallcaps">— Feltnote · Stop {romanShort(hole.id)}</p>

      {/* Maps link */}
      {showMapLink && (
        <a
          href={hole.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-sans text-ink underline underline-offset-4 decoration-gold decoration-1 hover:decoration-2 text-base"
        >
          📍 Åbn i Google Maps
        </a>
      )}
    </article>
  )
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
function romanShort(n: number) {
  return ROMAN[n - 1] ?? String(n)
}
