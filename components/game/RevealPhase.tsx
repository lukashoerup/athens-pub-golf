'use client'

import { useEffect, useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { calculateGroupAverage } from '@/lib/scoring'
import { toRoman } from '@/lib/format'
import MeanderRule from '@/components/decorations/MeanderRule'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  myScore: Score | undefined
  onRevealComplete: () => Promise<void>
}

interface RevealedPlayer {
  player: Player
  score: Score | undefined
  sips: number
  distance: number
  position: number // rank by lowest distance penalty
}

function penaltyReasonText(reason: string | null, maxSips: number): string {
  switch (reason) {
    case 'max':
      return `committed ${toRoman(maxSips)} (max)`
    case 'min':
      return 'committed I (min)'
    case 'same_as_last':
      return 'samme tal som forrige'
    case '8':
      return 'committed VIII' // legacy data
    default:
      return 'straf-shot'
  }
}

function distanceLabel(sips: number, avg: number): { text: string; tone: 'good' | 'neutral' | 'bad' } {
  const diff = +(sips - avg).toFixed(1)
  if (Math.abs(diff) <= 0.5) return { text: 'Spot on', tone: 'good' }
  if (diff < 0) return { text: `${diff.toFixed(1)} under`, tone: Math.abs(diff) <= 1.0 ? 'good' : 'neutral' }
  return { text: `+${diff.toFixed(1)} over`, tone: diff <= 1.0 ? 'neutral' : 'bad' }
}

export default function RevealPhase({ hole, scores, players, onRevealComplete }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const committed = scores.filter((s) => s.committed_sips != null)
  const allSips = committed.map((s) => s.committed_sips as number)
  const avg = calculateGroupAverage(allSips)

  const revealedPlayers: RevealedPlayer[] = players.map((p) => {
    const score = committed.find((s) => s.player_id === p.id)
    const sips = (score?.committed_sips as number) ?? 0
    return { player: p, score, sips, distance: Math.abs(sips - avg), position: 0 }
  })

  // Position by closest-to-avg (with tiebreak: lower committed_sips wins for the "leader" feel)
  const sorted = [...revealedPlayers].sort(
    (a, b) => a.distance - b.distance || a.sips - b.sips
  )
  sorted.forEach((p, i) => (p.position = i + 1))

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200)
    return () => clearTimeout(t)
  }, [])

  async function handleAdvance() {
    setAdvancing(true)
    await onRevealComplete()
  }

  return (
    <div className="space-y-7">
      {/* Header eyebrow */}
      <div className="text-center">
        <p className="smallcaps">
          {hole.name} · Max {toRoman(hole.max_sips)}
        </p>
        <h2 className="display-lg mt-3">
          Tallene,
          <br />
          omsider.
        </h2>
        <MeanderRule width={140} className="mx-auto mt-5" />
      </div>

      {/* Grid of player cards */}
      <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
        {revealedPlayers.map((rp) => {
          const isLeader = rp.position === 1 && !hole.is_practice
          const label = distanceLabel(rp.sips, avg)
          const numberColor =
            label.tone === 'good' ? 'text-olive' : label.tone === 'bad' ? 'text-wine' : 'text-ink'
          return (
            <div
              key={rp.player.id}
              className={`bg-parchment-light p-4 transition-all duration-500 ${
                revealed ? 'opacity-100' : 'opacity-0'
              } ${isLeader ? 'border-l-2 border-l-gold' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-ink-muted text-xs" style={{ letterSpacing: '0.1em' }}>
                  {toRoman(rp.player.display_order)}
                </span>
                {isLeader && <span className="smallcaps-gold">Leader</span>}
              </div>
              <p className="font-serif font-semibold text-ink text-lg mt-1.5">{rp.player.name}</p>
              <p
                className={`font-serif leading-none mt-2.5 ${numberColor}`}
                style={{ fontSize: '2.8rem', fontWeight: 500, letterSpacing: '0.02em' }}
              >
                {revealed ? toRoman(rp.sips) : '·'}
              </p>
              <p className="smallcaps mt-2">{label.text}</p>
            </div>
          )
        })}
      </div>

      {/* Average + penalty shots */}
      <div className="flex items-center justify-between border-t border-b border-rule py-3">
        <span className="smallcaps">Gennemsnit</span>
        <span className="font-mono text-ink text-lg font-semibold">{avg.toFixed(1)}</span>
      </div>

      {committed.some((s) => s.penalty_shot) && (
        <div className="border-l-2 border-wine pl-4 py-2 space-y-1">
          <p className="smallcaps text-wine">Straf-shots</p>
          {committed
            .filter((s) => s.penalty_shot)
            .map((s) => {
              const player = players.find((p) => p.id === s.player_id)
              return (
                <p key={s.id} className="font-serif italic text-ink text-base">
                  {player?.name} —{' '}
                  {penaltyReasonText(s.penalty_shot_reason, hole.max_sips)}
                </p>
              )
            })}
        </div>
      )}

      {/* Drink instruction */}
      <div className="text-center py-3">
        <p className="smallcaps">Drik nu</p>
        <p className="font-serif italic text-ink-secondary text-lg mt-1.5">
          Tøm din drink på dit committed antal slurke.
        </p>
      </div>

      <button onClick={handleAdvance} disabled={advancing} className="btn-primary">
        {advancing ? 'Venter...' : 'Fortsæt'}
      </button>
    </div>
  )
}
