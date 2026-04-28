'use client'

import type { Player, Score, Hole } from '@/lib/types'
import { computeLeaderboard } from '@/lib/scoring'
import { HOLES } from '@/data/holes'

interface Props {
  players: Player[]
  scores: Score[]
  holes: Hole[]
  onClose: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_BG = ['bg-amber-50 border-amber-300', 'bg-slate-50 border-slate-300', 'bg-orange-50 border-orange-300']

export default function Leaderboard({ players, scores, onClose }: Props) {
  const board = computeLeaderboard(players, scores, HOLES)
  const completedHoles = HOLES.filter(
    (h) => !h.is_practice && scores.some((s) => s.hole_id === h.id && s.committed_sips !== null)
  ).length

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Luk" />

      {/* Panel */}
      <div className="relative mt-auto w-full max-w-md mx-auto bg-bg-primary rounded-t-3xl shadow-card-lg max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-3 flex items-center justify-between border-b border-border">
          <h2 className="font-serif font-bold text-text-primary" style={{ fontSize: '24px' }}>
            🏆 Leaderboard
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-sans text-text-muted text-base">
              {completedHoles}/11 huller
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary font-sans text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {board.map((entry, i) => (
            <div
              key={entry.player.id}
              className={`rounded-xl border p-4 ${i < 3 ? MEDAL_BG[i] : 'bg-bg-card border-border'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{MEDALS[i] ?? `${i + 1}.`}</span>
                  <div>
                    <p className="font-sans font-semibold text-text-primary text-xl">
                      {entry.player.name}
                    </p>
                    <div className="flex gap-3 mt-0.5">
                      {entry.penaltyShots > 0 && (
                        <span className="font-sans text-text-muted text-base">
                          🥃 ×{entry.penaltyShots}
                        </span>
                      )}
                      {entry.commitmentFails > 0 && (
                        <span className="font-sans text-score-bad text-base">
                          ❌ ×{entry.commitmentFails}
                        </span>
                      )}
                      {entry.spotOns > 0 && (
                        <span className="font-sans text-score-great text-base">
                          🎯 ×{entry.spotOns}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className="font-mono font-bold text-text-primary"
                  style={{ fontSize: '28px' }}
                >
                  {entry.total}
                </span>
              </div>
            </div>
          ))}

          {board.every((e) => e.total === 0) && (
            <p className="text-center text-text-muted font-sans text-base py-8">
              Ingen scores endnu — spil et hul!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
