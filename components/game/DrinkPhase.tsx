'use client'

import { useState } from 'react'
import type { Hole, Player, Score } from '@/lib/types'
import GreekDivider from '@/components/GreekDivider'

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
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-bg-hero rounded-card p-5 text-center">
        <p className="font-sans text-accent-primary text-base uppercase tracking-widest">
          {hole.is_practice ? '★ Prøverunde' : `Hul ${hole.id}`} · {hole.name}
        </p>
        <h2
          className="font-serif font-bold text-text-on-dark mt-2"
          style={{ fontSize: '28px' }}
        >
          Commitment-check
        </h2>
      </div>

      {/* My commitment */}
      {myScore && (
        <div className="card text-center">
          <p className="font-sans text-text-secondary text-base">Du committed</p>
          <div className="w-28 h-28 rounded-full border-4 border-accent-primary mx-auto flex items-center justify-center my-4">
            <span
              className="font-mono font-bold text-text-primary"
              style={{ fontSize: '52px', lineHeight: 1 }}
            >
              {myScore.committed_sips}
            </span>
          </div>
          <p className="font-sans font-semibold text-text-primary text-xl">
            Drak du din drink på {myScore.committed_sips} slurke?
          </p>
        </div>
      )}

      {/* Answer buttons or status */}
      {!hasAnswered ? (
        <div className="space-y-3">
          {!confirmFail ? (
            <>
              <button
                onClick={() => handleResult(true)}
                disabled={submitting}
                className="btn-success"
              >
                ✅ Ja, klarede det!
              </button>
              <button
                onClick={() => setConfirmFail(true)}
                disabled={submitting}
                className="btn-danger"
              >
                ❌ Nej, fejlede (+3)
              </button>
            </>
          ) : (
            <div className="card space-y-4 border-t-2 border-score-bad">
              <p className="font-sans font-semibold text-text-primary text-xl text-center">
                Er du sikker?
              </p>
              <p className="font-sans text-text-secondary text-base text-center">
                Du får +3 strafpoint på dette hul.
              </p>
              <button
                onClick={() => handleResult(false)}
                disabled={submitting}
                className="btn-danger"
              >
                Ja, jeg fejlede ❌
              </button>
              <button
                onClick={() => setConfirmFail(false)}
                disabled={submitting}
                className="btn-secondary"
              >
                Tilbage
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center space-y-3">
          {myScore?.completed === true ? (
            <>
              <p className="text-4xl">✅</p>
              <p className="font-sans font-semibold text-score-great text-xl">Klaret!</p>
            </>
          ) : (
            <>
              <p className="text-4xl">❌</p>
              <p className="font-sans font-semibold text-score-bad text-xl">+3 strafpoint</p>
            </>
          )}
        </div>
      )}

      {/* Status */}
      <GreekDivider />
      <div className="space-y-2">
        {players.map((player) => {
          const score = scores.find((s) => s.player_id === player.id)
          const done = score?.completed !== null && score?.completed !== undefined
          return (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 px-4 rounded-xl bg-bg-elevated"
            >
              <p className="font-sans text-text-primary text-lg">{player.name}</p>
              <span className="text-xl">
                {!done ? '⏳' : score?.completed ? '✅' : '❌'}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-center font-sans text-text-muted text-base">
        {confirmedCount} / {players.length} har svaret
      </p>
    </div>
  )
}
