'use client'

import type { Player, Score, Hole } from '@/lib/types'
import { computeLeaderboard } from '@/lib/scoring'
import { HOLES } from '@/data/holes'
import { toRoman } from '@/lib/format'

interface Props {
  players: Player[]
  scores: Score[]
  holes: Hole[]
  onClose: () => void
}

export default function Leaderboard({ players, scores, onClose }: Props) {
  const board = computeLeaderboard(players, scores, HOLES)
  const playedStops = new Set(
    scores.filter((s) => s.committed_sips != null && !HOLES.find((h) => h.id === s.hole_id)?.is_practice).map((s) => s.hole_id)
  ).size

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-label="Luk" />

      <div className="relative mt-auto w-full max-w-md mx-auto bg-parchment max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
          <div className="w-10 h-0.5 bg-rule" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-rule">
          <div>
            <p className="smallcaps">Stilling</p>
            <p className="font-serif text-ink text-xl mt-0.5">Efter Stop {toRoman(playedStops)}</p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-ink-muted text-sm w-9 h-9 flex items-center justify-center"
            aria-label="Luk"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-6 py-2">
          {board.map((entry, i) => (
            <div
              key={entry.player.id}
              className="flex items-center justify-between py-4 border-b border-rule"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-ink-muted text-xs w-6" style={{ letterSpacing: '0.08em' }}>
                  {toRoman(i + 1)}
                </span>
                <div>
                  <p className="font-serif text-ink text-lg leading-tight">{entry.player.name}</p>
                  <p className="font-mono text-ink-muted mt-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    {entry.spotOns > 0 && `${entry.spotOns} spot-on`}
                    {entry.spotOns > 0 && entry.commitmentFails > 0 && ' · '}
                    {entry.commitmentFails > 0 && `${entry.commitmentFails} fejl`}
                    {(entry.spotOns > 0 || entry.commitmentFails > 0) && entry.penaltyShots > 0 && ' · '}
                    {entry.penaltyShots > 0 && `${entry.penaltyShots} shots`}
                  </p>
                </div>
              </div>
              <span className="font-serif text-ink" style={{ fontSize: '1.6rem', fontWeight: 500 }}>
                {entry.total}
              </span>
            </div>
          ))}

          {board.every((e) => e.total === 0) && (
            <p className="text-center font-serif italic text-ink-muted text-base py-10">
              Ingen scores endnu — spil et stop.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
