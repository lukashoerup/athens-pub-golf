import type { Hole } from '@/lib/types'
import { toRoman } from '@/lib/format'

interface Props {
  hole: Hole
  showMapLink?: boolean
}

export default function HoleCard({ hole, showMapLink = true }: Props) {
  return (
    <article className="space-y-5">
      {/* District + coordinates row */}
      {(hole.district || hole.coords) && (
        <div className="flex items-baseline justify-between">
          <span className="smallcaps">{hole.district ?? hole.address}</span>
          {hole.coords && (
            <span className="font-mono text-ink-muted text-xs" style={{ letterSpacing: '0.08em' }}>
              {hole.coords}
            </span>
          )}
        </div>
      )}

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
      <p className="smallcaps">— Feltnote · Stop {toRoman(hole.id)}</p>

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
