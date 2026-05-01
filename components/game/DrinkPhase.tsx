'use client'

import { useEffect, useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { toRoman } from '@/lib/format'
import MeanderRule from '@/components/decorations/MeanderRule'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  myScore: Score | undefined
  /** ISO timestamp — set when the first player marks ✓. Null until then. */
  deadlineAt: string | null
  onDrinkResult: (completed: boolean) => Promise<void>
}

export default function DrinkPhase({ hole, scores, players, myScore, deadlineAt, onDrinkResult }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [confirmFail, setConfirmFail] = useState(false)
  const [sipsTaken, setSipsTaken] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Tick once a second while there's an active deadline.
  useEffect(() => {
    if (!deadlineAt) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [deadlineAt])

  const deadlineMs = deadlineAt ? new Date(deadlineAt).getTime() : null
  const remainingMs = deadlineMs != null ? Math.max(0, deadlineMs - now) : null
  const remainingSec = remainingMs != null ? Math.ceil(remainingMs / 1000) : null
  const remainingMin = remainingSec != null ? Math.floor(remainingSec / 60) : null
  const remainingSecPart = remainingSec != null ? remainingSec % 60 : null
  const isUrgent = remainingMs != null && remainingMs <= 30_000 && remainingMs > 0
  const isExpired = remainingMs === 0

  // Persist sip count locally per (hole, player) so a refresh doesn't lose it.
  const sipKey = myScore ? `sip-count-${hole.id}-${myScore.player_id}` : null
  useEffect(() => {
    if (!sipKey) return
    const stored = sessionStorage.getItem(sipKey)
    setSipsTaken(stored ? parseInt(stored, 10) || 0 : 0)
  }, [sipKey])
  useEffect(() => {
    if (!sipKey) return
    sessionStorage.setItem(sipKey, String(sipsTaken))
  }, [sipKey, sipsTaken])

  const hasAnswered = myScore?.completed !== null && myScore?.completed !== undefined
  const confirmedCount = scores.filter((s) => s.completed !== null).length
  const committed = myScore?.committed_sips ?? 0
  const reachedTarget = committed > 0 && sipsTaken >= committed

  async function handleResult(completed: boolean) {
    setSubmitting(true)
    setConfirmFail(false)
    try {
      await onDrinkResult(completed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-7">
      <div className="text-center">
        <p className="smallcaps">
          {hole.name} · Stop {toRoman(hole.id)}
        </p>
        <h2 className="display-lg mt-3">Æresspørgsmål</h2>
        <MeanderRule width={140} className="mx-auto mt-5" />
      </div>

      {/* 5-min countdown — visible to all players once first ✓ has been registered */}
      {remainingMs != null && !hasAnswered && (
        <div
          className={`border px-5 py-4 text-center transition-colors ${
            isExpired
              ? 'border-wine/60 bg-wine/10 text-wine'
              : isUrgent
              ? 'border-wine/40 bg-wine/5 text-wine'
              : 'border-gold/40 bg-gold/5 text-ink'
          }`}
        >
          <p className="smallcaps mb-1">
            {isExpired ? 'Tid udløbet' : 'Tid tilbage'}
          </p>
          <p
            className="font-mono leading-none"
            style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {isExpired
              ? '+III'
              : `${remainingMin}:${String(remainingSecPart).padStart(2, '0')}`}
          </p>
          <p className="font-serif italic text-ink-muted text-sm mt-2">
            {isExpired
              ? 'Du fik tre strafpoint — gruppen er videre.'
              : 'Bunde drinken inden uret går — ellers +III strafpoint.'}
          </p>
        </div>
      )}

      {myScore && (
        <div className="text-center field-card py-8">
          <p className="smallcaps mb-3">Du committed</p>
          <p
            className="font-serif text-ink leading-none"
            style={{ fontSize: '4.6rem', fontWeight: 500, letterSpacing: '0.02em' }}
          >
            {toRoman(myScore.committed_sips!)}
          </p>
          <p className="font-serif italic text-ink-muted text-base mt-3">
            {myScore.committed_sips} slurke
          </p>

          <div className="gold-rule mt-5" />
          <p className="font-serif text-ink text-lg mt-3 leading-tight">
            Drak du den på {toRoman(myScore.committed_sips!)} slurke?
          </p>
        </div>
      )}

      {/* Sip counter (local memory aid — does not affect score) */}
      {myScore && !hasAnswered && (
        <div
          className={`border px-5 py-5 text-center transition-colors ${
            reachedTarget ? 'border-gold/60 bg-gold/5' : 'border-rule bg-parchment-light'
          }`}
        >
          <p className="smallcaps mb-3">Slurketæller</p>
          <button
            type="button"
            onClick={() => setSipsTaken((n) => n + 1)}
            className="w-full py-4 active:bg-parchment-dark/30 transition-colors"
            aria-label="Tilføj én slurk"
          >
            <p
              className="font-serif text-ink leading-none"
              style={{ fontSize: '3.4rem', fontWeight: 500, letterSpacing: '0.02em' }}
            >
              {sipsTaken === 0 ? '·' : toRoman(sipsTaken)}
              <span className="font-serif italic text-ink-muted" style={{ fontSize: '1.6rem' }}>
                {' / '}
              </span>
              {toRoman(committed)}
            </p>
            <p className="font-serif italic text-ink-muted text-sm mt-2">
              {sipsTaken} af {committed} slurke
            </p>
          </button>
          <p className="font-sans text-ink-muted text-xs mt-3" style={{ letterSpacing: '0.06em' }}>
            {reachedTarget
              ? 'Du har ramt dit commit — bekræft nedenfor'
              : 'Tryk på tælleren hver gang du tager en slurk'}
          </p>
          {sipsTaken > 0 && (
            <button
              type="button"
              onClick={() => setSipsTaken((n) => Math.max(0, n - 1))}
              className="font-mono text-ink-muted text-xs mt-3 underline underline-offset-4"
            >
              Trin tilbage
            </button>
          )}
        </div>
      )}

      {!hasAnswered ? (
        <div className="space-y-3">
          {!confirmFail ? (
            <>
              <button
                onClick={() => handleResult(true)}
                disabled={submitting}
                className="btn-success"
              >
                Ja — Klarede det
              </button>
              <button
                onClick={() => setConfirmFail(true)}
                disabled={submitting}
                className="btn-ghost"
              >
                Nej — Fejlede (+III)
              </button>
            </>
          ) : (
            <div className="border border-wine/40 bg-wine/5 px-5 py-6 space-y-4 text-center">
              <p className="font-serif text-ink text-xl">Sikker?</p>
              <p className="font-serif italic text-ink-secondary text-base">
                +III strafpoint på dette stop.
              </p>
              <div className="space-y-3 pt-1">
                <button
                  onClick={() => handleResult(false)}
                  disabled={submitting}
                  className="btn-danger"
                >
                  Ja, jeg fejlede
                </button>
                <button
                  onClick={() => setConfirmFail(false)}
                  disabled={submitting}
                  className="btn-ghost"
                >
                  Tilbage
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center field-card py-6">
          {myScore?.completed === true ? (
            <>
              <p className="smallcaps text-olive mb-2">Klaret</p>
              <p className="font-serif italic text-ink text-lg">Æren intakt.</p>
            </>
          ) : (
            <>
              <p className="smallcaps text-wine mb-2">Fejlede</p>
              <p className="font-serif italic text-ink text-lg">+III strafpoint registreret.</p>
            </>
          )}
        </div>
      )}

      {/* Status list */}
      <div className="border-t border-rule">
        {players.map((player) => {
          const score = scores.find((s) => s.player_id === player.id)
          const done = score?.completed !== null && score?.completed !== undefined
          const status = !done ? 'Venter' : score?.completed ? 'Klaret' : 'Fejlede'
          const tone = !done ? 'text-ink-muted' : score?.completed ? 'text-olive' : 'text-wine'
          return (
            <div
              key={player.id}
              className="flex items-center justify-between py-3 border-b border-rule"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-ink-muted text-xs w-6" style={{ letterSpacing: '0.08em' }}>
                  {toRoman(player.display_order)}
                </span>
                <span className="font-serif text-ink text-lg">{player.name}</span>
              </div>
              <span className={`smallcaps ${tone}`}>{status}</span>
            </div>
          )
        })}
      </div>

      <p className="text-center smallcaps">
        {confirmedCount} af {players.length} har svaret
      </p>
    </div>
  )
}
