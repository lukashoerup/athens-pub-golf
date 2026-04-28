'use client'

import { useState } from 'react'
import type { Hole, Score } from '@/lib/types'
import HoleCard from '@/components/HoleCard'
import Amphora from '@/components/decorations/Amphora'
import { toRoman } from '@/lib/format'
import { checkPenaltyShot } from '@/lib/scoring'

function penaltyShotLabel(reason: string | null, maxSips: number): string {
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
      return ''
  }
}

interface Props {
  hole: Hole
  myScore: Score | undefined
  /** This player's committed sips on the previous hole — for live straf-shot preview */
  myPreviousSips: number | null
  committedCount: number
  totalPlayers: number
  currentPlayerName: string
  onCommit: (sips: number) => Promise<void>
}

export default function CommitPhase({ hole, myScore, myPreviousSips, committedCount, totalPlayers, currentPlayerName, onCommit }: Props) {
  const defaultSips = Math.ceil(hole.max_sips / 2)
  const [sips, setSips] = useState(defaultSips)
  const [submitting, setSubmitting] = useState(false)

  const hasCommitted = myScore?.committed_sips != null

  // Live preview of which penalty rules trigger for the currently selected number
  const previewReasons = checkPenaltyShot(sips, hole.max_sips, myPreviousSips, hole.id).reasons

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
    <div className="space-y-8">
      <HoleCard hole={hole} currentPlayerName={currentPlayerName} />

      {hole.is_practice && (
        <div className="border border-gold/50 bg-gold/5 px-5 py-4">
          <p className="smallcaps-gold mb-1">Prøverunde</p>
          <p className="font-serif italic text-ink-secondary text-base leading-snug">
            Point tæller ikke. Gennemgå reglerne mens I går.
          </p>
        </div>
      )}

      {!hasCommitted ? (
        <section className="space-y-6">
          {/* Max sips reference card */}
          <div className="field-card flex items-center justify-between">
            <div>
              <p className="smallcaps mb-0.5">Max</p>
              <p className="font-serif font-medium text-ink" style={{ fontSize: '2rem', lineHeight: 1 }}>
                {toRoman(hole.max_sips)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(hole.max_sips, 8) }).map((_, i) => (
                <Amphora key={i} size={14} color="#1A2438" />
              ))}
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="smallcaps-ink">Dit tal</span>
              {previewReasons.length > 0 && (
                <span className="smallcaps text-wine">
                  Straf-shot{previewReasons.length > 1 ? ` × ${previewReasons.length}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-stretch justify-between">
              <button
                onClick={decrement}
                disabled={sips <= 1}
                aria-label="Færre slurke"
                className="stepper-btn"
              >
                −
              </button>
              <div className="flex-1 flex items-center justify-center bg-parchment-light border-y border-rule h-24 pb-2">
                <span
                  className="font-serif text-ink select-none leading-none"
                  style={{ fontSize: '3.4rem', fontWeight: 500, letterSpacing: '0.02em' }}
                >
                  {toRoman(sips)}
                </span>
              </div>
              <button
                onClick={increment}
                disabled={sips >= hole.max_sips}
                aria-label="Flere slurke"
                className="stepper-btn"
              >
                +
              </button>
            </div>

            <p className="font-serif italic text-ink-muted text-center text-base pt-1">
              Antal slurke til at tømme drinken.
            </p>

            {/* Live straf-shot preview — list each rule that would trigger */}
            {previewReasons.length > 0 && (
              <div className="border-l-2 border-wine pl-3 py-1.5 mt-2">
                <p className="smallcaps text-wine mb-1">
                  ⚠ {previewReasons.length === 1 ? '1 straf-shot' : `${previewReasons.length} straf-shots`}
                </p>
                <ul className="space-y-0.5">
                  {previewReasons.map((r, i) => (
                    <li key={i} className="font-sans text-ink-secondary text-sm leading-snug">
                      — {penaltyShotLabel(r, hole.max_sips)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button onClick={handleLockIn} disabled={submitting} className="btn-primary">
            {submitting ? 'Sender...' : 'Lås Ind'}
          </button>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Confirmation */}
          <div className="field-card text-center py-8">
            <p className="smallcaps mb-3">Du committed</p>
            <p
              className="font-serif text-ink leading-none"
              style={{ fontSize: '4.6rem', fontWeight: 500, letterSpacing: '0.02em' }}
            >
              {toRoman(myScore!.committed_sips!)}
            </p>
            <p className="font-serif italic text-ink-muted text-base mt-3">
              {myScore!.committed_sips} slurke
            </p>
            {myScore!.penalty_shot && (() => {
              const reasons = myScore!.penalty_shot_reasons && myScore!.penalty_shot_reasons.length > 0
                ? myScore!.penalty_shot_reasons
                : (myScore!.penalty_shot_reason ? [myScore!.penalty_shot_reason] : [])
              return (
                <div className="mt-4 border-l-2 border-wine pl-3 py-1 inline-block text-left">
                  <p className="smallcaps text-wine mb-1">
                    ⚠ {reasons.length === 1 ? 'Straf-shot' : `${reasons.length} straf-shots`}
                  </p>
                  <ul className="space-y-0.5">
                    {reasons.map((r, i) => (
                      <li key={i} className="font-sans text-ink-secondary text-sm leading-snug">
                        — {penaltyShotLabel(r, hole.max_sips)}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>

          {/* Waiting status */}
          <div className="text-center">
            <p className="smallcaps">Venter på de andre</p>
            <p className="font-serif text-ink mt-2" style={{ fontSize: '1.4rem' }}>
              {toRoman(committedCount)} <span className="text-ink-muted">af</span> {toRoman(totalPlayers)}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
