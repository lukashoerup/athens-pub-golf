'use client'

import { useState } from 'react'
import type { Player, Score, Hole } from '@/lib/types'
import { computeLeaderboard } from '@/lib/scoring'
import { toRoman } from '@/lib/format'
import Rules from './Rules'

type Tab = 'standing' | 'history' | 'rules'

interface Props {
  players: Player[]
  scores: Score[]
  holes: Hole[]
  onClose: () => void
  initialTab?: Tab
}

export default function InfoSheet({ players, scores, holes, onClose, initialTab = 'standing' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)

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

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-rule">
          <div className="flex">
            {(
              [
                { key: 'standing', label: 'Stilling' },
                { key: 'history', label: 'Historik' },
                { key: 'rules', label: 'Regler' },
              ] as { key: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-4 transition-colors ${
                  tab === t.key
                    ? 'text-ink border-b-2 border-gold -mb-px'
                    : 'text-ink-muted'
                }`}
              >
                <span
                  className="font-sans uppercase font-semibold"
                  style={{ fontSize: '0.78rem', letterSpacing: '0.18em' }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Close button absolute right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 font-mono text-ink-muted text-base w-8 h-8 flex items-center justify-center"
            aria-label="Luk"
          >
            ✕
          </button>
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1">
          {tab === 'standing' && <StandingTab players={players} scores={scores} holes={holes} />}
          {tab === 'history' && <HistoryTab players={players} scores={scores} holes={holes} />}
          {tab === 'rules' && <Rules />}
        </div>
      </div>
    </div>
  )
}

/* ─── STANDING ────────────────────────────────────────── */
function StandingTab({ players, scores, holes }: { players: Player[]; scores: Score[]; holes: Hole[] }) {
  const board = computeLeaderboard(players, scores, holes)
  const playedStops = new Set(
    scores
      .filter(
        (s) =>
          s.committed_sips != null && !holes.find((h) => h.id === s.hole_id)?.is_practice
      )
      .map((s) => s.hole_id)
  ).size

  return (
    <div className="px-6 py-4">
      <p className="smallcaps mb-2">
        Efter {playedStops > 0 ? `Stop ${toRoman(playedStops)}` : 'ingen stop'}
      </p>

      {board.every((e) => e.total === 0) ? (
        <p className="text-center font-serif italic text-ink-muted text-base py-10">
          Ingen scores endnu — spil et stop.
        </p>
      ) : (
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
                  <p className="font-serif text-ink text-lg leading-tight">{entry.player.name}</p>
                  {(entry.spotOns > 0 || entry.commitmentFails > 0 || entry.penaltyShots > 0) && (
                    <p
                      className="font-mono text-ink-muted mt-1"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
                    >
                      {entry.spotOns > 0 && `${entry.spotOns} spot-on`}
                      {entry.spotOns > 0 && entry.commitmentFails > 0 && ' · '}
                      {entry.commitmentFails > 0 && `${entry.commitmentFails} fejl`}
                      {(entry.spotOns > 0 || entry.commitmentFails > 0) &&
                        entry.penaltyShots > 0 &&
                        ' · '}
                      {entry.penaltyShots > 0 && `${entry.penaltyShots} shots`}
                    </p>
                  )}
                </div>
              </div>
              <span
                className="font-serif text-ink"
                style={{ fontSize: '1.6rem', fontWeight: 500 }}
              >
                {entry.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── HISTORY ────────────────────────────────────────── */
function HistoryTab({ players, scores, holes }: { players: Player[]; scores: Score[]; holes: Hole[] }) {
  const sortedHoles = [...holes].sort((a, b) => a.id - b.id)
  const board = computeLeaderboard(players, scores, holes)
  const totalsByPlayerId = new Map(board.map((e) => [e.player.id, e.total]))

  // Has any scores at all?
  const hasScores = scores.some((s) => s.committed_sips != null)

  if (!hasScores) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="font-serif italic text-ink-muted text-base">
          Ingen historik endnu — spil et stop og kom igen.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-5 space-y-1">
      <p className="smallcaps mb-3 px-1">
        Hvad har folk gættet?
      </p>

      {[...players]
        .sort((a, b) => a.display_order - b.display_order)
        .map((player) => {
          const playerCommits = sortedHoles.map((hole) => {
            const score = scores.find(
              (s) => s.player_id === player.id && s.hole_id === hole.id
            )
            return { hole, score }
          })
          const total = totalsByPlayerId.get(player.id) ?? 0

          return (
            <div key={player.id} className="py-3 border-b border-rule">
              <div className="flex items-baseline justify-between mb-2 px-1">
                <p className="font-serif text-ink text-lg">{player.name}</p>
                <p className="font-mono text-ink-muted text-xs" style={{ letterSpacing: '0.08em' }}>
                  Total: <span className="text-ink font-semibold">{total}</span>
                </p>
              </div>

              {/* Commit cells per hole */}
              <div className="grid grid-cols-12 gap-px">
                {playerCommits.map(({ hole, score }) => {
                  const sips = score?.committed_sips
                  const failed = score?.completed === false
                  const isPractice = hole.is_practice
                  return (
                    <div
                      key={hole.id}
                      className={`text-center py-2 border ${
                        sips != null
                          ? failed
                            ? 'bg-wine/8 border-wine/30 text-wine'
                            : isPractice
                            ? 'bg-parchment-dark/60 border-rule text-ink-muted'
                            : 'bg-parchment-light border-rule text-ink'
                          : 'border-rule/50 text-ink-faint'
                      } ${score?.penalty_shot ? 'ring-1 ring-gold/60 ring-inset' : ''}`}
                      title={
                        sips != null
                          ? `Stop ${toRoman(hole.id)}: ${sips} slurke${failed ? ' (fejlede)' : ''}${
                              score?.penalty_shot ? ' (straf-shot)' : ''
                            }`
                          : `Stop ${toRoman(hole.id)}: endnu ikke spillet`
                      }
                    >
                      <p className="font-mono text-base font-semibold leading-none">
                        {sips ?? '·'}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Roman numeral labels under cells */}
              <div className="grid grid-cols-12 gap-px mt-1 px-px">
                {sortedHoles.map((h) => (
                  <p
                    key={h.id}
                    className="text-center font-mono text-ink-faint"
                    style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}
                  >
                    {toRoman(h.id)}
                  </p>
                ))}
              </div>
            </div>
          )
        })}

      {/* Legend */}
      <div className="pt-4 px-1 space-y-1">
        <p className="smallcaps mb-2">Legende</p>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="inline-block w-3 h-3 bg-parchment-light border border-rule" />
          <span className="font-sans text-sm">Spillet</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="inline-block w-3 h-3 bg-wine/8 border border-wine/30" />
          <span className="font-sans text-sm">Fejlede commitment (+III)</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="inline-block w-3 h-3 border border-rule ring-1 ring-gold/60 ring-inset" />
          <span className="font-sans text-sm">Straf-shot udløst</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="inline-block w-3 h-3 bg-parchment-dark/60 border border-rule" />
          <span className="font-sans text-sm">Prøverunde (point tæller ikke)</span>
        </div>
      </div>
    </div>
  )
}
