'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'
import GreekTemple from '@/components/decorations/GreekTemple'
import GreekDivider from '@/components/GreekDivider'

const RULES = [
  'Alle drikker den SAMME drink. Alle SKAL tømme den.',
  'Commit hemmeligt: vælg antal slurke INDEN du drikker.',
  'Hulscore = committed slurke + afstandsstraf fra gruppens gennemsnit.',
  'Afstandsstraf: ±0.5 = +0, ±1.0 = +1, ±1.5 = +2, ±2.0 = +3, 2.0+ = +4.',
  'Drukker du IKKE på dit committed tal → +3 strafpoint.',
  'Committer du 8 eller samme tal som forrige hul → straf-shot (ingen point).',
  'Laveste totalscore efter 12 huller vinder. Hul 1 er prøverunde.',
]

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
      {/* Hero header with Greek temple */}
      <div className="flex-shrink-0 pt-10 pb-6 px-6 text-center relative">
        {/* Subtle marble light overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(212,162,76,0.14) 0%, transparent 50%)',
          }}
        />

        <div className="relative">
          <GreekTemple size={160} color="#D4A24C" className="mx-auto" />

          <h1
            className="text-text-on-dark font-serif font-bold mt-5"
            style={{ fontSize: '40px', letterSpacing: '0.04em', lineHeight: 1.05 }}
          >
            ATHENS
            <br />
            PUB GOLF
          </h1>

          <p className="text-accent-primary font-mono font-bold text-xl mt-2 tracking-widest">⛳</p>

          {/* Greek meander decoration in gold */}
          <div className="greek-meander-gold mt-4 mx-auto max-w-xs" />

          <p className="text-text-on-dark font-sans text-base mt-3 opacity-75 italic">
            12 huller · 6 spillere · 1 dag
          </p>
        </div>
      </div>

      {/* Player selection panel */}
      <div className="flex-1 bg-bg-primary rounded-t-3xl px-5 pt-7 pb-6 shadow-card-lg">
        <div className="text-center mb-5">
          <p className="text-text-muted font-sans text-base uppercase tracking-widest">
            Hvem er du?
          </p>
          <div className="greek-meander mt-2 mx-auto max-w-[140px]" />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelect(player)}
                disabled={selecting !== null}
                className="w-full h-14 rounded-xl bg-bg-card shadow-card border border-border text-text-primary font-sans font-semibold text-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 hover:border-accent-blue"
              >
                {selecting === player.id && (
                  <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
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
            <span>📜 Athens Rules</span>
            <span className="text-accent-blue text-lg">{rulesOpen ? '▲' : '▼'}</span>
          </button>

          {rulesOpen && (
            <div className="mt-3 bg-bg-card rounded-xl shadow-card border-t-2 border-accent-warm p-4 space-y-3 animate-fade-in-up">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-mono font-bold text-accent-blue text-base flex-shrink-0">
                    {i + 1}.
                  </span>
                  <p className="font-sans text-text-secondary text-base leading-snug">{rule}</p>
                </div>
              ))}
              <GreekDivider variant="gold" />
              <p className="font-sans text-text-muted text-base italic text-center">
                Hul 1 er prøverunde — point tæller ikke.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
