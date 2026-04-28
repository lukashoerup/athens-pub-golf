'use client'

import type { Hole, Score, Player } from '@/lib/types'
import { toRoman } from '@/lib/format'
import { calculateGroupAverage } from '@/lib/scoring'
import TempleMarker from '@/components/decorations/TempleMarker'

function MapsLink({ hole }: { hole: Hole }) {
  if (!hole.maps_url) return null
  return (
    <a
      href={hole.maps_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 mt-2 text-ink-secondary text-sm font-sans underline underline-offset-4 decoration-gold/60 decoration-1 hover:decoration-2"
    >
      <TempleMarker size={14} color="#B89A60" />
      Google Maps
    </a>
  )
}

interface Props {
  holes: Hole[]
  scores: Score[]
  players: Player[]
  currentHoleId: number
  onClose: () => void
}

export default function RouteTimeline({ holes, scores, players, currentHoleId, onClose }: Props) {
  const sortedHoles = [...holes].sort((a, b) => a.id - b.id)
  const currentIdx = sortedHoles.findIndex((h) => h.id === currentHoleId)

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Luk"
      />

      <div className="relative mt-auto w-full max-w-md mx-auto bg-parchment max-h-[88vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
          <div className="w-10 h-0.5 bg-rule" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-rule">
          <div>
            <p className="smallcaps">Ruten</p>
            <p className="font-serif text-ink text-xl mt-0.5">
              Stop {toRoman(currentIdx + 1)} af {toRoman(sortedHoles.length)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-ink-muted text-sm w-9 h-9 flex items-center justify-center"
            aria-label="Luk"
          >
            ✕
          </button>
        </div>

        {/* Vertical timeline */}
        <div className="overflow-y-auto flex-1 px-6 py-3">
          {sortedHoles.map((hole, i) => {
            const isPast = i < currentIdx
            const isCurrent = i === currentIdx
            const isFuture = i > currentIdx

            const holeScores = scores.filter(
              (s) => s.hole_id === hole.id && s.committed_sips != null
            )
            const avg =
              isPast && holeScores.length > 0
                ? calculateGroupAverage(holeScores.map((s) => s.committed_sips as number))
                : null
            const isLast = i === sortedHoles.length - 1

            return (
              <div key={hole.id} className="flex items-stretch gap-4">
                {/* Timeline rail (dot + connector line) */}
                <div className="flex flex-col items-center pt-2">
                  <span
                    className={
                      isCurrent
                        ? 'block w-3 h-3 rounded-full bg-gold ring-2 ring-gold/30 shrink-0'
                        : isPast
                        ? 'block w-2.5 h-2.5 rounded-full bg-gold/80 shrink-0'
                        : 'block w-2.5 h-2.5 rounded-full border border-rule bg-parchment shrink-0'
                    }
                    aria-hidden
                  />
                  {!isLast && (
                    <div
                      className={
                        isPast
                          ? 'w-px flex-1 bg-gold/50 mt-1.5 mb-1'
                          : 'w-px flex-1 bg-rule mt-1.5 mb-1'
                      }
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-5 ${isCurrent ? '-my-1' : ''}`}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="font-mono text-ink-muted text-xs"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      {toRoman(hole.id)}
                    </span>
                    {hole.is_practice && <span className="smallcaps-gold">Prøve</span>}
                    {isCurrent && <span className="smallcaps-gold">· Nu</span>}
                  </div>

                  {/* Past stops — full info + group avg */}
                  {isPast && (
                    <>
                      <p className="font-serif text-ink text-lg leading-tight mt-1">{hole.name}</p>
                      <p className="smallcaps mt-1">
                        {hole.district} · {hole.drink}
                      </p>
                      {avg != null && (
                        <p
                          className="font-mono text-ink-muted text-xs mt-2"
                          style={{ letterSpacing: '0.06em' }}
                        >
                          Gennemsnit: {avg.toFixed(1)} slurke
                        </p>
                      )}
                      <MapsLink hole={hole} />
                    </>
                  )}

                  {/* Current stop — full info */}
                  {isCurrent && (
                    <>
                      <p className="font-serif text-ink text-xl leading-tight mt-1">{hole.name}</p>
                      <p className="smallcaps mt-1">
                        {hole.district} · {hole.drink} · Max {toRoman(hole.max_sips)}
                      </p>
                      {hole.score_multiplier > 1 && (
                        <p className="smallcaps-gold mt-1">× {hole.score_multiplier} multiplikator</p>
                      )}
                      <MapsLink hole={hole} />
                    </>
                  )}

                  {/* Future stops — name + district visible, drink hidden */}
                  {isFuture && (
                    <>
                      <p className="font-serif text-ink text-lg leading-tight mt-1">{hole.name}</p>
                      <p className="smallcaps mt-1">
                        {hole.district}
                        {hole.stop_type ? ` · ${hole.stop_type}` : ''}
                      </p>
                      {hole.score_multiplier > 1 && (
                        <p className="smallcaps-gold mt-1">× {hole.score_multiplier} multiplikator</p>
                      )}
                      <p className="smallcaps text-ink-muted mt-1 italic">
                        🔒 Drink afsløres ved ankomst
                      </p>
                      <MapsLink hole={hole} />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-rule">
          <p className="text-center font-serif italic text-ink-muted text-base">
            Drikkene afsløres ved ankomst.
          </p>
        </div>
      </div>
    </div>
  )
}
