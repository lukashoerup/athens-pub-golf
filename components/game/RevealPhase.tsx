'use client'

import { useEffect, useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { calculateGroupAverage } from '@/lib/scoring'
import GreekDivider from '@/components/GreekDivider'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  myScore: Score | undefined
  onRevealComplete: () => Promise<void>
}

export default function RevealPhase({ hole, scores, players, myScore, onRevealComplete }: Props) {
  const [revealed, setRevealed] = useState<boolean[]>([])
  const [showAverage, setShowAverage] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const committedScores = scores.filter((s) => s.committed_sips != null)
  const allSips = committedScores.map((s) => s.committed_sips as number)
  const average = calculateGroupAverage(allSips)

  // Staggered reveal animation
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    players.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setRevealed((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, 300 + i * 200)
      )
    })
    timers.push(setTimeout(() => setShowAverage(true), 300 + players.length * 200 + 300))
    return () => timers.forEach(clearTimeout)
  }, [players.length])

  async function handleAdvance() {
    setAdvancing(true)
    await onRevealComplete()
  }

  function penaltyShotReason(score: Score | undefined): string | null {
    if (!score?.penalty_shot) return null
    return score.penalty_shot_reason === '8' ? 'committed 8' : 'samme tal som sidst'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-bg-hero rounded-card p-5 text-center">
        <p className="font-sans text-accent-primary text-base uppercase tracking-widest">
          {hole.is_practice ? '★ Prøverunde' : `Hul ${hole.id}`}
        </p>
        <h2
          className="font-serif font-bold text-text-on-dark mt-1"
          style={{ fontSize: '28px' }}
        >
          🎯 REVEAL
        </h2>
        <p className="font-sans text-text-on-dark opacity-70 text-base mt-1">{hole.name}</p>
      </div>

      {/* Players reveal */}
      <div className="card space-y-3">
        <GreekDivider label="Alle valg" />

        {players.map((player, i) => {
          const score = committedScores.find((s) => s.player_id === player.id)
          const isMe = player.id === myScore?.player_id
          const penaltyReason = penaltyShotReason(score)

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                revealed[i] ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
              } ${isMe ? 'bg-accent-primary/10 border border-accent-primary/30' : 'bg-bg-elevated'}`}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div>
                <p className="font-sans font-semibold text-text-primary text-xl">
                  {player.name} {isMe && <span className="text-text-muted text-base">(dig)</span>}
                </p>
                {penaltyReason && (
                  <p className="font-sans text-score-bad text-base">⚠️ Straf-shot ({penaltyReason})</p>
                )}
              </div>
              <span
                className="font-mono font-bold text-text-primary"
                style={{ fontSize: '28px' }}
              >
                {revealed[i] ? (score?.committed_sips ?? '?') : '·'}
              </span>
            </div>
          )
        })}

        {/* Average */}
        {showAverage && (
          <div
            className="flex items-center justify-between py-3 px-4 rounded-xl bg-accent-primary/20 border-2 border-accent-primary animate-pop-in"
          >
            <p className="font-sans font-semibold text-text-primary text-xl">
              Gennemsnit
            </p>
            <span
              className="font-mono font-bold text-accent-primary"
              style={{ fontSize: '28px' }}
            >
              {average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Penalty shots summary */}
      {committedScores.some((s) => s.penalty_shot) && (
        <div className="rounded-xl border-2 border-score-bad bg-score-bad/10 p-4 space-y-2">
          <p className="font-sans font-semibold text-score-bad text-lg">🥃 Straf-shots</p>
          {committedScores
            .filter((s) => s.penalty_shot)
            .map((s) => {
              const player = players.find((p) => p.id === s.player_id)
              return (
                <p key={s.id} className="font-sans text-text-primary text-base">
                  {player?.name}:{' '}
                  {s.penalty_shot_reason === '8'
                    ? 'Committed 8 — stop med at være kedelig!'
                    : 'Samme tal som forrige runde!'}
                </p>
              )
            })}
          <p className="font-sans text-text-secondary text-base">
            Disse drikkes inden gruppen går videre.
          </p>
        </div>
      )}

      {/* Drink instruction */}
      <div className="bg-bg-elevated rounded-xl p-4 text-center">
        <p className="font-sans font-semibold text-text-primary text-xl">
          {hole.drink_emoji} DRIK NU!
        </p>
        <p className="font-sans text-text-secondary text-base mt-1">
          Tøm din drink på dit committed antal slurke.
        </p>
      </div>

      {/* Advance button */}
      <button
        onClick={handleAdvance}
        disabled={!showAverage || advancing}
        className="btn-primary"
      >
        {advancing ? 'Venter...' : 'Alle har set — fortsæt →'}
      </button>
    </div>
  )
}
