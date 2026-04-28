'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'
import { toRoman, formatDateHeader } from '@/lib/format'
import DoricColumn from '@/components/decorations/DoricColumn'

const RULES = [
  'Alle drikker den SAMME drink. Alle SKAL tømme den.',
  'Vælg hemmeligt antal slurke INDEN du drikker.',
  'Hulscore = committed slurke + afstandsstraf fra gruppens gennemsnit.',
  'Afstandsstraf: ±0.5 = +0, ±1.0 = +1, ±1.5 = +2, ±2.0 = +3, 2.0+ = +4.',
  'Drukker du IKKE på dit committed tal → +3 strafpoint.',
  'Committer du 8 eller samme tal som forrige hul → straf-shot.',
  'Laveste totalscore efter XII stop vinder. Stop I er prøverunde.',
]

export default function PlayerSelectPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)

  const { day, date } = formatDateHeader()

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
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Header masthead */}
      <div className="px-6 pt-12 pb-8 text-center">
        <DoricColumn height={180} color="#1A2438" strokeWidth={1.0} className="mx-auto" />

        <h1 className="display-xl mt-7 leading-none">Athens</h1>
        <p className="display-italic mt-2" style={{ fontSize: '2.0rem' }}>
          Pub Golf
        </p>

        <div className="gold-rule" />

        <div className="smallcaps mt-4">
          {day} · XII STOPS
        </div>
        <div className="font-mono text-ink-muted mt-1.5" style={{ fontSize: '0.78rem', letterSpacing: '0.16em' }}>
          {date}
        </div>
      </div>

      {/* Player list */}
      <div className="flex-1 px-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border border-ink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border-t border-rule">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelect(player)}
                disabled={selecting !== null}
                className="w-full flex items-center justify-between py-4 border-b border-rule active:bg-parchment-dark transition-colors disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-ink-muted text-base w-8" style={{ letterSpacing: '0.05em' }}>
                    {toRoman(player.display_order)}
                  </span>
                  <span className="font-serif font-semibold text-ink text-xl">
                    {player.name}
                  </span>
                </div>
                <span className="smallcaps">
                  {selecting === player.id ? 'Forbinder...' : 'Klar'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Rules collapsible */}
        <div className="mt-8 mb-6">
          <button
            onClick={() => setRulesOpen((o) => !o)}
            className="w-full flex items-center justify-between py-3 border-t border-b border-rule"
          >
            <span className="smallcaps-ink">Athens Rules</span>
            <span className="text-ink-muted text-sm">{rulesOpen ? '−' : '+'}</span>
          </button>

          {rulesOpen && (
            <div className="py-5 space-y-3">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-mono text-gold text-sm pt-0.5 w-6 flex-shrink-0">
                    {toRoman(i + 1)}
                  </span>
                  <p className="font-sans text-ink-secondary text-base leading-snug">{rule}</p>
                </div>
              ))}
              <div className="gold-rule mt-4" />
              <p className="font-serif italic text-ink-muted text-base text-center pb-1">
                Stop I er prøverunde — point tæller ikke.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
