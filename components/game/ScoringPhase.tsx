'use client'

import { useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { computeHoleScores, computeLeaderboard, calculateGroupAverage } from '@/lib/scoring'
import { toRoman } from '@/lib/format'
import MeanderRule from '@/components/decorations/MeanderRule'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  allScores: Score[]
  holes: Hole[]
  onNextHole: () => Promise<void>
}

export default function ScoringPhase({ hole, scores, players, allScores, holes, onNextHole }: Props) {
  const [advancing, setAdvancing] = useState(false)

  const holeScores = computeHoleScores(players, scores, hole.id, hole.is_practice)
  const allSips = scores.filter((s) => s.committed_sips != null).map((s) => s.committed_sips as number)
  const avg = calculateGroupAverage(allSips)
  const leaderboard = computeLeaderboard(players, allScores, holes)

  const sorted = [...holeScores].sort((a, b) => a.total - b.total)
  const lastHoleId = Math.max(...holes.map((h) => h.id))
  const isLastHole = hole.id === lastHoleId
  const sortedIds = holes.map((h) => h.id).sort((a, b) => a - b)
  const nextHoleId = sortedIds[sortedIds.indexOf(hole.id) + 1]

  async function handleNext() {
    setAdvancing(true)
    try {
      await onNextHole()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="text-center">
        <p className="smallcaps">
          {hole.name} · Stop {toRoman(hole.id)}
        </p>
        <h2 className="display-lg mt-3">Stillingen</h2>
        <p className="font-serif italic text-ink-muted mt-2 text-base">
          Gennemsnit: {avg.toFixed(1)} slurke
        </p>
        <MeanderRule width={140} className="mx-auto mt-5" />
      </div>

      {/* Hole scores */}
      <section>
        <p className="smallcaps mb-3">Hulscore</p>

        {hole.is_practice && (
          <p className="font-serif italic text-ink-muted text-center text-base py-2 border-y border-rule">
            Prøverunde — point tæller ikke
          </p>
        )}

        <div className="border-t border-rule">
          {sorted.map(({ player, score, base, distancePenalty, commitmentPenalty, total }, i) => {
            const totalPenalty = distancePenalty + commitmentPenalty
            const tone =
              totalPenalty === 0 ? 'text-olive' : totalPenalty <= 2 ? 'text-ink' : 'text-wine'
            return (
              <div
                key={player.id}
                className="flex items-center justify-between py-3 border-b border-rule"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-ink-muted text-xs w-6" style={{ letterSpacing: '0.08em' }}>
                    {toRoman(i + 1)}
                  </span>
                  <div>
                    <p className="font-serif text-ink text-lg leading-tight">{player.name}</p>
                    {score?.penalty_shot && (
                      <p className="font-mono text-ink-muted text-xs mt-0.5">+ straf-shot</p>
                    )}
                  </div>
                </div>

                {!hole.is_practice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-ink-muted text-sm">
                      {base}
                      {distancePenalty > 0 && ` +${distancePenalty}`}
                      {commitmentPenalty > 0 && ` +${commitmentPenalty}`}
                    </span>
                    <span className={`font-serif ${tone}`} style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                      {total}
                    </span>
                  </div>
                ) : (
                  <span className="font-serif text-ink" style={{ fontSize: '1.4rem' }}>
                    {base}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Total leaderboard */}
      {!hole.is_practice && (
        <section>
          <p className="smallcaps mb-3">Total</p>
          <div className="border-t border-rule">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.player.id}
                className="flex items-center justify-between py-3 border-b border-rule"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-ink-muted text-xs w-6" style={{ letterSpacing: '0.08em' }}>
                    {toRoman(i + 1)}
                  </span>
                  <div>
                    <p className="font-serif text-ink text-lg leading-tight">{entry.player.name}</p>
                    {(entry.penaltyShots > 0 || entry.commitmentFails > 0) && (
                      <p className="font-mono text-ink-muted text-xs mt-0.5">
                        {entry.penaltyShots > 0 && `${entry.penaltyShots} shots`}
                        {entry.penaltyShots > 0 && entry.commitmentFails > 0 && ' · '}
                        {entry.commitmentFails > 0 && `${entry.commitmentFails} fejl`}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-serif text-ink" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                  {entry.total}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <button onClick={handleNext} disabled={advancing} className="btn-primary">
        {advancing
          ? 'Går videre...'
          : isLastHole
          ? 'Afslut · Vis Resultat'
          : `Fortsæt · Stop ${nextHoleId != null ? toRoman(nextHoleId) : ''}`}
      </button>
    </div>
  )
}
