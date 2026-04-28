'use client'

import { useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import { toRoman } from '@/lib/format'
import MeanderRule from '@/components/decorations/MeanderRule'

interface Props {
  hole: Hole
  scores: Score[]
  players: Player[]
  myScore: Score | undefined
  onDrinkResult: (completed: boolean) => Promise<void>
}

export default function DrinkPhase({ hole, scores, players, myScore, onDrinkResult }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [confirmFail, setConfirmFail] = useState(false)

  const hasAnswered = myScore?.completed !== null && myScore?.completed !== undefined
  const confirmedCount = scores.filter((s) => s.completed !== null).length

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
