'use client'

import type { Player, Score, Hole } from '@/lib/types'
import { computeLeaderboard } from '@/lib/scoring'
import { toRoman, formatDateHeader } from '@/lib/format'
import LaurelBranch from '@/components/decorations/LaurelBranch'

interface Props {
  players: Player[]
  scores: Score[]
  holes: Hole[]
  currentPlayer: Player
}

export default function FinalScoreboard({ players, scores, holes, currentPlayer }: Props) {
  const board = computeLeaderboard(players, scores, holes)
  const winner = board[0]
  const { date } = formatDateHeader()

  // Total amphorae drunk = sum of all committed_sips for non-practice holes
  const totalAmphorae = scores
    .filter((s) => {
      const h = holes.find((x) => x.id === s.hole_id)
      return s.committed_sips != null && !h?.is_practice
    })
    .reduce((sum, s) => sum + (s.committed_sips ?? 0), 0)

  // Hours: from first score's created_at to last score's created_at
  const dates = scores
    .map((s) => new Date(s.created_at).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b)
  const hours =
    dates.length >= 2
      ? ((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60)).toFixed(1)
      : '—'

  // Total stops actually played (with at least one committed score)
  const playedStops = new Set(
    scores.filter((s) => s.committed_sips != null).map((s) => s.hole_id)
  ).size

  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-md mx-auto px-6 pt-10 pb-12 space-y-8">
        {/* Top eyebrow */}
        <div className="text-center">
          <p className="smallcaps">
            Final · {date}
          </p>
          <h1 className="display-xl mt-4 leading-none">Turen er forbi.</h1>
        </div>

        {/* Champion */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <LaurelBranch size={56} color="#B89A60" />
          <div className="text-center">
            <p className="font-serif text-ink leading-none" style={{ fontSize: '2.6rem', fontWeight: 500 }}>
              {winner.player.name}
            </p>
            <p className="smallcaps-gold mt-2">Vinder · {winner.total} point</p>
          </div>
          <LaurelBranch size={56} color="#B89A60" mirrored />
        </div>

        <div className="gold-rule" />

        {/* Full leaderboard */}
        <div className="border-t border-rule">
          {board.map((entry, i) => (
            <div
              key={entry.player.id}
              className="flex items-center justify-between py-4 border-b border-rule"
            >
              <div className="flex items-center gap-4">
                <span
                  className="font-mono text-ink-muted text-xs w-6"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {toRoman(i + 1)}
                </span>
                <div>
                  <p className="font-serif text-ink text-xl leading-tight">
                    {entry.player.name}
                    {entry.player.id === currentPlayer.id && (
                      <span className="font-serif italic text-ink-muted text-base ml-2">(dig)</span>
                    )}
                  </p>
                  <p className="font-mono text-ink-muted mt-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                    {entry.spotOns} spot-on
                    {entry.commitmentFails > 0 && ` · ${entry.commitmentFails} fejl`}
                    {entry.penaltyShots > 0 && ` · ${entry.penaltyShots} shots`}
                  </p>
                </div>
              </div>
              <span className="font-serif text-ink" style={{ fontSize: '2rem', fontWeight: 500 }}>
                {entry.total}
              </span>
            </div>
          ))}
        </div>

        {/* Stat tile */}
        <div className="grid grid-cols-3 border border-rule">
          {[
            { label: 'Stops', value: playedStops },
            { label: 'Amforaer', value: totalAmphorae },
            { label: 'Timer', value: hours },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`py-4 px-3 text-center ${i < 2 ? 'border-r border-rule' : ''}`}
            >
              <p className="smallcaps mb-1">{stat.label}</p>
              <p className="font-serif text-ink leading-none" style={{ fontSize: '1.6rem', fontWeight: 500 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center smallcaps">Runde slut</p>
      </div>
    </div>
  )
}
