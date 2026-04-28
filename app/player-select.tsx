'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'

const RULES = [
  'Alle drikker den SAMME drink. Alle SKAL tømme den.',
  'Commit hemmeligt: vælg antal slurke INDEN du drikker.',
  'Hulscore = committed slurke + afstandsstraf fra gruppens gennemsnit.',
  'Afstandsstraf: ±0.5 = +0, ±1.0 = +1, ±1.5 = +2, ±2.0 = +3, 2.0+ = +4.',
  'Drukker du IKKE på dit committed tal → +3 strafpoint.',
  'Committer du 8 eller samme tal som forrige hul → straf-shot (ingen point).',
  'Laveste totalscore efter 12 huller vinder. Hul 1 er prøverunde.',
]

const LAUREL_SVG = (
  <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto opacity-60">
    <path d="M60 50 C60 50 20 40 10 20 C20 28 35 32 60 50Z" fill="#C4841D" opacity="0.5" />
    <path d="M60 50 C60 50 100 40 110 20 C100 28 85 32 60 50Z" fill="#C4841D" opacity="0.5" />
    <path d="M60 48 C60 48 25 35 15 15 C25 25 42 30 60 48Z" fill="#5C6B3C" opacity="0.4" />
    <path d="M60 48 C60 48 95 35 105 15 C95 25 78 30 60 48Z" fill="#5C6B3C" opacity="0.4" />
    <path d="M55 50 C55 50 30 30 25 8 C32 20 45 35 55 50Z" fill="#C4841D" opacity="0.35" />
    <path d="M65 50 C65 50 90 30 95 8 C88 20 75 35 65 50Z" fill="#C4841D" opacity="0.35" />
    <circle cx="60" cy="52" r="4" fill="#C4841D" opacity="0.8" />
  </svg>
)

export default function PlayerSelectPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .order('display_order')
      .then(({ data }) => {
        setPlayers(data || [])
        setLoading(false)
      })
  }, [])

  async function handleSelect(player: Player) {
    setSelecting(player.id)
    localStorage.setItem('athens_player_id', player.id)
    router.push('/game')
  }

  return (
    <div className="min-h-screen bg-bg-hero flex flex-col">
      {/* Hero header */}
      <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center">
        {LAUREL_SVG}
        <h1
          className="text-text-on-dark font-serif font-bold mt-4"
          style={{ fontSize: '42px', letterSpacing: '0.02em', lineHeight: 1.1 }}
        >
          ATHENS
          <br />
          PUB GOLF
        </h1>
        <p className="text-accent-primary font-mono font-bold text-xl mt-2">⛳</p>
        <p className="text-text-on-dark font-sans text-base mt-3 opacity-70">
          12 huller · 6 spillere · 1 dag
        </p>
      </div>

      {/* Player selection */}
      <div className="flex-1 bg-bg-primary rounded-t-3xl px-5 pt-8 pb-6">
        <p className="text-text-muted font-sans text-base text-center mb-5 uppercase tracking-widest">
          Hvem er du?
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelect(player)}
                disabled={selecting !== null}
                className="w-full h-14 rounded-xl bg-bg-card shadow-card border border-border text-text-primary font-sans font-semibold text-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {selecting === player.id && (
                  <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                )}
                {player.name}
              </button>
            ))}
          </div>
        )}

        {/* Rules accordion */}
        <div className="mt-8">
          <button
            onClick={() => setRulesOpen((o) => !o)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-bg-elevated text-text-secondary font-sans font-semibold text-base"
          >
            <span>📋 Athens Rules</span>
            <span className="text-accent-primary text-lg">{rulesOpen ? '▲' : '▼'}</span>
          </button>

          {rulesOpen && (
            <div className="mt-3 bg-bg-card rounded-xl shadow-card border-t-2 border-accent-warm p-4 space-y-3 animate-fade-in-up">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-mono font-bold text-accent-primary text-base flex-shrink-0">
                    {i + 1}.
                  </span>
                  <p className="font-sans text-text-secondary text-base leading-snug">{rule}</p>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="font-sans text-text-muted text-base italic">
                  Hul 1 er prøverunde — scoring vises, men point tæller ikke.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
