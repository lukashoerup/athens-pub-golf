'use client'

import { useEffect, useState } from 'react'
import type { Player, Score, Hole } from '@/lib/types'
import { computeLeaderboard } from '@/lib/scoring'

interface Props {
  players: Player[]
  scores: Score[]
  holes: Hole[]
  currentPlayer: Player
}

const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_BG = [
  'bg-amber-50 border-amber-300',
  'bg-slate-50 border-slate-300',
  'bg-orange-50 border-orange-300',
]

function Confetti() {
  const [dots, setDots] = useState<{ x: number; y: number; color: string; size: number; delay: number }[]>([])

  useEffect(() => {
    const colors = ['#C4841D', '#5C6B3C', '#A0522D', '#1B365D', '#FAF6F0']
    setDots(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 2,
      }))
    )
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-bounce"
          style={{
            left: `${dot.x}%`,
            top: `-${dot.size}px`,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            animationDuration: `${1.5 + dot.delay}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function FinalScoreboard({ players, scores, holes, currentPlayer }: Props) {
  const board = computeLeaderboard(players, scores, holes)
  const winner = board[0]

  const maxSpotOns = Math.max(...board.map((e) => e.spotOns))
  const maxFails = Math.max(...board.map((e) => e.commitmentFails))
  const maxShots = Math.max(...board.map((e) => e.penaltyShots))

  const sniper = maxSpotOns > 0 ? board.find((e) => e.spotOns === maxSpotOns) : null
  const bunderen = maxFails > 0 ? board.find((e) => e.commitmentFails === maxFails) : null
  const shame = maxShots > 0 ? board.find((e) => e.penaltyShots === maxShots) : null

  // Variance for Mr. Consistent
  const playerVariances = players.map((player) => {
    const playerScores = scores.filter(
      (s) => s.player_id === player.id && s.committed_sips != null && !holes.find((h) => h.id === s.hole_id)?.is_practice
    )
    const sips = playerScores.map((s) => s.committed_sips as number)
    if (sips.length < 2) return { player, variance: Infinity }
    const mean = sips.reduce((a, b) => a + b, 0) / sips.length
    const variance = sips.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sips.length
    return { player, variance }
  })
  const consistent = playerVariances.sort((a, b) => a.variance - b.variance)[0]

  return (
    <div className="min-h-screen bg-bg-hero relative pb-8">
      <Confetti />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-8 space-y-6">
        {/* Trophy header */}
        <div className="text-center py-6 space-y-2">
          <p className="text-6xl">🏆</p>
          <h1
            className="font-serif font-bold text-text-on-dark"
            style={{ fontSize: '36px' }}
          >
            ATHENS PUB GOLF
          </h1>
          <p className="font-sans text-accent-primary font-semibold text-xl">Finalresultater</p>
        </div>

        {/* Winner callout */}
        <div className="bg-accent-primary rounded-card p-5 text-center space-y-1">
          <p className="font-sans text-text-primary text-base uppercase tracking-widest font-semibold">
            Vinderen er
          </p>
          <p
            className="font-serif font-bold text-text-primary"
            style={{ fontSize: '40px' }}
          >
            {winner.player.name}
          </p>
          <p className="font-mono font-bold text-text-primary text-2xl">{winner.total} point</p>
        </div>

        {/* Full leaderboard */}
        <div className="bg-bg-card rounded-card shadow-card-lg p-4 space-y-3">
          {board.map((entry, i) => (
            <div
              key={entry.player.id}
              className={`rounded-xl border p-4 ${i < 3 ? MEDAL_BG[i] : 'bg-bg-elevated border-border'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{MEDALS[i] ?? `${i + 1}.`}</span>
                  <div>
                    <p className="font-sans font-semibold text-text-primary text-xl">
                      {entry.player.name}
                      {entry.player.id === currentPlayer.id && (
                        <span className="font-sans text-text-muted text-base ml-2">(dig)</span>
                      )}
                    </p>
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      <span className="font-sans text-text-muted text-base">
                        🎯 {entry.spotOns} spot-ons
                      </span>
                      {entry.commitmentFails > 0 && (
                        <span className="font-sans text-score-bad text-base">
                          ❌ {entry.commitmentFails} fejl
                        </span>
                      )}
                      {entry.penaltyShots > 0 && (
                        <span className="font-sans text-text-muted text-base">
                          🥃 {entry.penaltyShots} shots
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className="font-mono font-bold text-text-primary"
                  style={{ fontSize: '30px' }}
                >
                  {entry.total}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Fun awards */}
        <div className="bg-bg-card rounded-card shadow-card p-4 space-y-3">
          <p className="font-sans font-semibold text-text-secondary text-base uppercase tracking-widest text-center">
            Priser
          </p>
          {(
            [
              sniper ? { icon: '🎯', title: 'Sniper', sub: 'Flest spot-ons', name: sniper.player.name } : null,
              bunderen ? { icon: '💀', title: 'Bunderen', sub: 'Flest commitment-fails', name: bunderen.player.name } : null,
              shame ? { icon: '🥃', title: 'Shame Champion', sub: 'Flest straf-shots', name: shame.player.name } : null,
              consistent && consistent.variance < Infinity
                ? { icon: '📐', title: 'Mr. Consistent', sub: 'Laveste varians i committed slurke', name: consistent.player.name }
                : null,
            ] as ({ icon: string; title: string; sub: string; name: string } | null)[]
          )
            .filter((a): a is { icon: string; title: string; sub: string; name: string } => a !== null)
            .map((award) => (
              <div
                key={award.title}
                className="flex items-center gap-3 py-2 px-3 rounded-xl bg-bg-elevated"
              >
                <span className="text-2xl">{award.icon}</span>
                <div className="flex-1">
                  <p className="font-sans font-semibold text-text-primary text-lg">{award.title}</p>
                  <p className="font-sans text-text-muted text-base">{award.sub}</p>
                </div>
                <p className="font-sans font-semibold text-text-secondary text-lg">{award.name}</p>
              </div>
            ))}
        </div>

        <p className="text-center font-sans text-text-on-dark opacity-50 text-base pb-4">
          GUD HAR TALT ⛳
        </p>
      </div>
    </div>
  )
}
