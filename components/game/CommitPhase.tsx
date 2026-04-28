'use client'

import { useState } from 'react'
import type { Hole, Score } from '@/lib/types'
import HoleCard from '@/components/HoleCard'
import GreekDivider from '@/components/GreekDivider'

interface Props {
  hole: Hole
  myScore: Score | undefined
  committedCount: number
  totalPlayers: number
  onCommit: (sips: number) => Promise<void>
}

export default function CommitPhase({ hole, myScore, committedCount, totalPlayers, onCommit }: Props) {
  const defaultSips = Math.ceil(hole.max_sips / 2)
  const [sips, setSips] = useState(defaultSips)
  const [submitting, setSubmitting] = useState(false)

  const hasCommitted = myScore?.committed_sips != null

  const decrement = () => setSips((s) => Math.max(1, s - 1))
  const increment = () => setSips((s) => Math.min(hole.max_sips, s + 1))

  async function handleLockIn() {
    setSubmitting(true)
    try {
      await onCommit(sips)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <HoleCard hole={hole} />

      {hole.is_practice && (
        <div className="rounded-xl border-2 border-accent-warm bg-accent-warm/10 p-4 text-center space-y-1">
          <p className="font-sans font-semibold text-accent-warm text-lg">⚠️ PRØVERUNDE</p>
          <p className="font-sans text-text-secondary text-base">
            Point tæller ikke. Gennemgå reglerne mens I går.
          </p>
        </div>
      )}

      {!hasCommitted ? (
        <div className="card">
          <GreekDivider label="Commit dig" />

          <p className="font-sans text-text-secondary text-center text-lg mb-6">
            Hvor mange slurke tømmer du din drink på?
          </p>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-5 mb-4">
            <button
              onClick={decrement}
              disabled={sips <= 1}
              aria-label="Færre slurke"
              className="w-14 h-14 rounded-full bg-accent-warm text-white font-mono font-bold text-3xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform shadow-card"
            >
              −
            </button>

            <div className="w-32 h-32 rounded-full border-4 border-accent-blue flex items-center justify-center shadow-card animate-pulse-blue">
              <span
                className="font-mono font-bold text-text-primary select-none"
                style={{ fontSize: '52px', lineHeight: 1 }}
              >
                {sips}
              </span>
            </div>

            <button
              onClick={increment}
              disabled={sips >= hole.max_sips}
              aria-label="Flere slurke"
              className="w-14 h-14 rounded-full bg-accent-warm text-white font-mono font-bold text-3xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform shadow-card"
            >
              +
            </button>
          </div>

          <p className="text-center font-sans text-text-muted text-base mb-6">
            Max {hole.max_sips} slurke
          </p>

          {sips === 8 && (
            <p className="text-center font-sans text-score-bad text-base mb-4">
              ⚠️ 8 slurke = automatisk straf-shot!
            </p>
          )}

          <button onClick={handleLockIn} disabled={submitting} className="btn-primary">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                Sender...
              </span>
            ) : (
              '🔒 Lock In'
            )}
          </button>
        </div>
      ) : (
        <div className="card text-center space-y-4">
          {/* Already committed display */}
          <div className="w-24 h-24 rounded-full border-4 border-accent-olive mx-auto flex items-center justify-center">
            <span
              className="font-mono font-bold text-text-primary"
              style={{ fontSize: '40px', lineHeight: 1 }}
            >
              {myScore!.committed_sips}
            </span>
          </div>

          <div>
            <p className="font-sans font-semibold text-accent-olive text-xl">✅ Du har committed</p>
            <p className="font-sans text-text-muted text-base mt-1">
              {myScore!.committed_sips} slurke
            </p>
            {myScore!.penalty_shot && (
              <p className="font-sans text-score-bad text-base mt-2 font-semibold">
                ⚠️ Straf-shot venter på dig!
                {myScore!.penalty_shot_reason === '8'
                  ? ' (du committed 8)'
                  : ' (samme tal som forrige)'}
              </p>
            )}
          </div>

          <GreekDivider />

          <div className="bg-bg-elevated rounded-xl py-4 px-5">
            <p className="font-sans text-text-secondary text-lg font-semibold">
              ⏳ {committedCount} / {totalPlayers} har committed
            </p>
            <p className="font-sans text-text-muted text-base mt-1">Venter på de andre...</p>
          </div>
        </div>
      )}
    </div>
  )
}
