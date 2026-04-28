'use client'

import type { Hole } from '@/lib/types'

interface Props {
  holes: Hole[]
  currentHoleId: number
  onClick: () => void
}

export default function RouteStrip({ holes, currentHoleId, onClick }: Props) {
  const sortedHoles = [...holes].sort((a, b) => a.id - b.id)
  const currentIdx = sortedHoles.findIndex((h) => h.id === currentHoleId)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 py-2.5 active:bg-parchment-dark/40 transition-colors"
      aria-label="Vis rute"
    >
      {sortedHoles.map((h, i) => {
        const isPast = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <span
            key={h.id}
            className={
              isCurrent
                ? 'block w-2.5 h-2.5 rounded-full bg-gold ring-2 ring-gold/30'
                : isPast
                ? 'block w-1.5 h-1.5 rounded-full bg-gold/80'
                : 'block w-1.5 h-1.5 rounded-full border border-rule bg-parchment'
            }
            aria-hidden
          />
        )
      })}
    </button>
  )
}
