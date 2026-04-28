'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'
import { formatDateHeader, toRoman } from '@/lib/format'
import DoricColumn from '@/components/decorations/DoricColumn'
import Rules from '@/components/Rules'

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
            <div className="py-5">
              <Rules compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
