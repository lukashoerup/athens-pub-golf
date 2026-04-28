'use client'

import { useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { computeHoleScores, computeLeaderboard, calculateGroupAverage } from '@/lib/scoring'
import { HOLES } from '@/data/holes'
import GreekDivider from '@/components/GreekDivider'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  allScores: Score[]
  holes: Hole[]
  onNextHole: () => Promise<void>
}

function scoreColor(penalty: number): string {
  if (penalty === 0) return 'bg-score-great/10 border-score-great/40'
  if (penalty <= 2) return 'bg-score-ok/10 border-score-ok/40'
  return 'bg-score-bad/10 border-score-bad/40'
}

function penaltyColor(p: number): string {
  if (p === 0) return 'text-score-great'
  if (p <= 2) return 'text-score-ok'
  return 'text-score-bad'
}

export default function ScoringPhase({ hole, scores, players, allScores, onNextHole }: Props) {
  const [advancing, setAdvancing] = useState(false)

  const holeScores = computeHoleScores(players, scores, hole.id, hole.is_practice)
  const allSips = scores.filter((s) => s.committed_sips != null).map((s) => s.committed_sips as number)
  const average = calculateGroupAverage(allSips)
  const leaderboard = computeLeaderboard(players, allScores, HOLES)

  const sorted = [...holeScores].sort((a, b) => a.total - b.total)

  const isLastHole = hole.id === 12

  async function handleNext() {
    setAdvancing(true)
    try {
      await onNextHole()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-bg-hero rounded-card p-5 text-center">
        <p className="font-sans text-accent-primary text-base uppercase tracking-widest">
          {hole.is_practice ? '★ Prøverunde' : `Hul ${hole.id}`} · {hole.name}
        </p>
        <h2
          className="font-serif font-bold text-text-on-dark mt-1"
          style={{ fontSize: '28px' }}
        >
          📊 Score
        </h2>
        <p className="font-sans text-text-on-dark opacity-70 text-base mt-1">
          Gennemsnit: {average.toFixed(1)} slurke
        </p>
      </div>

      {/* Hole scores */}
      <div className="card space-y-2">
        <GreekDivider label="Hulscores" />

        {hole.is_practice && (
          <p className="font-sans text-text-muted text-base text-center italic">
            Prøverunde — point tæller ikke
          </p>
        )}

        {sorted.map(({ player, score, base, distancePenalty, commitmentPenalty, total }) => {
          const totalPenalty = distancePenalty + commitmentPenalty
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between py-3 px-4 rounded-xl border ${scoreColor(totalPenalty)}`}
            >
              <div className="flex-1">
                <p className="font-sans font-semibold text-text-primary text-xl">{player.name}</p>
                {score?.penalty_shot && (
                  <p className="font-sans text-text-muted text-base">🥃 Straf-shot</p>
                )}
              </div>
              {!hole.is_practice && (
                <div className="flex items-center gap-1 font-mono font-bold" style={{ fontSize: '22px' }}>
                  <span className="text-text-primary">{base}</span>
                  {distancePenalty > 0 && (
                    <span className={penaltyColor(distancePenalty)}>+{distancePenalty}</span>
                  )}
                  {commitmentPenalty > 0 && (
                    <span className="text-score-bad">+{commitmentPenalty}</span>
                  )}
                  <span className="text-text-muted mx-1">=</span>
                  <span className="text-text-primary" style={{ fontSize: '26px' }}>{total}</span>
                </div>
              )}
              {hole.is_practice && (
                <span className="font-mono font-bold text-text-primary" style={{ fontSize: '26px' }}>
                  {base}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Leaderboard (only show for real holes) */}
      {!hole.is_practice && (
        <div className="card space-y-2">
          <GreekDivider label="Total leaderboard" />
          {leaderboard.map((entry, i) => (
            <div
              key={entry.player.id}
              className="flex items-center justify-between py-2 px-4 rounded-xl bg-bg-elevated"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-accent-primary text-xl w-6">{i + 1}.</span>
                <div>
                  <p className="font-sans font-semibold text-text-primary text-xl">{entry.player.name}</p>
                  {entry.penaltyShots > 0 && (
                    <span className="font-sans text-text-muted text-base">🥃 ×{entry.penaltyShots}</span>
                  )}
                </div>
              </div>
              <span className="font-mono font-bold text-text-primary" style={{ fontSize: '26px' }}>
                {entry.total}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Next hole button */}
      <button onClick={handleNext} disabled={advancing} className="btn-primary">
        {advancing
          ? 'Går videre...'
          : isLastHole
          ? '🏆 Se Finalscoreboard'
          : `NÆSTE HUL → 🔓`}
      </button>
    </div>
  )
}
