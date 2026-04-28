import type { Hole } from '@/lib/types'
import Column from './decorations/Column'

interface Props {
  hole: Hole
  showMapLink?: boolean
}

export default function HoleCard({ hole, showMapLink = true }: Props) {
  return (
    <div className="card space-y-4 relative overflow-hidden">
      {/* Decorative columns flanking the hole */}
      <div className="absolute -top-1 -left-1 opacity-15 pointer-events-none">
        <Column height={80} color="#0D5EAF" />
      </div>
      <div className="absolute -top-1 -right-1 opacity-15 pointer-events-none">
        <Column height={80} color="#0D5EAF" />
      </div>

      {/* Hole number + type */}
      <div className="flex items-start justify-between relative">
        <div className="pl-6">
          <p className="font-sans text-text-muted text-base uppercase tracking-widest">
            {hole.is_practice ? '★ PRØVERUNDE' : `Hul ${hole.id} / 12`}
          </p>
          <h2
            className="font-serif font-bold text-text-primary leading-tight"
            style={{ fontSize: '28px' }}
          >
            {hole.name}
          </h2>
          <p className="font-sans text-text-secondary text-base mt-0.5">{hole.address}</p>
        </div>
        <span className="text-3xl pr-2">{hole.drink_emoji}</span>
      </div>

      {/* Drink info */}
      <div className="flex items-center gap-4 py-3 px-4 bg-bg-elevated rounded-xl border border-border">
        <div className="w-1 h-10 rounded-full bg-accent-primary flex-shrink-0" />
        <div>
          <p className="font-sans font-semibold text-text-primary text-xl">{hole.drink}</p>
          <p className="font-sans text-text-muted text-base">
            {hole.stop_type} · Max {hole.max_sips} slurke
          </p>
        </div>
      </div>

      {/* Fun fact */}
      <p className="font-sans text-text-secondary text-base leading-relaxed italic border-l-2 border-accent-primary pl-3">
        {hole.fun_fact}
      </p>

      {/* Maps link */}
      {showMapLink && (
        <a href={hole.maps_url} target="_blank" rel="noopener noreferrer" className="maps-btn">
          📍 Åbn i Google Maps
        </a>
      )}
    </div>
  )
}
