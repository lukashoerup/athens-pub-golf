'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player, Score, GameState } from '@/lib/types'
import { HOLES } from '@/data/holes'
import { checkPenaltyShot } from '@/lib/scoring'
import CommitPhase from '@/components/game/CommitPhase'
import RevealPhase from '@/components/game/RevealPhase'
import DrinkPhase from '@/components/game/DrinkPhase'
import ScoringPhase from '@/components/game/ScoringPhase'
import FinalScoreboard from '@/components/game/FinalScoreboard'
import Leaderboard from '@/components/Leaderboard'

const TOTAL_PLAYERS = 6

export default function GamePage() {
  const router = useRouter()
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial data load
  useEffect(() => {
    const playerId = localStorage.getItem('athens_player_id')
    if (!playerId) {
      router.push('/')
      return
    }

    async function initialize() {
      try {
        const [playerRes, playersRes, gameStateRes, scoresRes] = await Promise.all([
          supabase.from('players').select('*').eq('id', playerId).single(),
          supabase.from('players').select('*').order('display_order'),
          supabase.from('game_state').select('*').eq('id', 1).single(),
          supabase.from('scores').select('*'),
        ])

        if (playerRes.error || !playerRes.data) {
          router.push('/')
          return
        }

        setCurrentPlayer(playerRes.data)
        setPlayers(playersRes.data || [])
        setGameState(gameStateRes.data)
        setScores(scoresRes.data || [])
      } catch {
        setError('Kunne ikke hente spildata. Tjek forbindelsen og prøv igen.')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('game-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores' },
        (payload) => {
          setScores((prev) => [...prev, payload.new as Score])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'scores' },
        (payload) => {
          setScores((prev) =>
            prev.map((s) => (s.id === (payload.new as Score).id ? (payload.new as Score) : s))
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_state' },
        (payload) => {
          setGameState(payload.new as GameState)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-transition: committing → reveal (when all players committed)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'committing') return
    const committedThisHole = scores.filter(
      (s) => s.hole_id === gameState.current_hole && s.committed_sips != null
    )
    if (committedThisHole.length >= TOTAL_PLAYERS) {
      supabase
        .from('game_state')
        .update({ phase: 'reveal' })
        .eq('id', 1)
        .eq('phase', 'committing')
        .then()
    }
  }, [scores, gameState])

  // Auto-transition: drinking → scoring (when all players answered)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'drinking') return
    const answeredThisHole = scores.filter(
      (s) => s.hole_id === gameState.current_hole && s.completed !== null
    )
    if (answeredThisHole.length >= TOTAL_PLAYERS) {
      supabase
        .from('game_state')
        .update({ phase: 'scoring' })
        .eq('id', 1)
        .eq('phase', 'drinking')
        .then()
    }
  }, [scores, gameState])

  const handleCommit = useCallback(
    async (sips: number) => {
      if (!currentPlayer || !gameState) return
      const prevScore = scores.find(
        (s) => s.player_id === currentPlayer.id && s.hole_id === gameState.current_hole - 1
      )
      const prevSips = prevScore?.committed_sips ?? null
      const { penalty, reason } = checkPenaltyShot(sips, prevSips, gameState.current_hole)

      await supabase.from('scores').insert({
        player_id: currentPlayer.id,
        hole_id: gameState.current_hole,
        committed_sips: sips,
        penalty_shot: penalty,
        penalty_shot_reason: reason,
      })
    },
    [currentPlayer, gameState, scores]
  )

  const handleRevealComplete = useCallback(async () => {
    await supabase
      .from('game_state')
      .update({ phase: 'drinking' })
      .eq('id', 1)
      .eq('phase', 'reveal')
  }, [])

  const handleDrinkResult = useCallback(
    async (completed: boolean) => {
      if (!currentPlayer || !gameState) return
      await supabase
        .from('scores')
        .update({ completed })
        .eq('player_id', currentPlayer.id)
        .eq('hole_id', gameState.current_hole)
    },
    [currentPlayer, gameState]
  )

  const handleNextHole = useCallback(async () => {
    if (!gameState) return
    const nextHole = gameState.current_hole + 1
    if (nextHole > 12) return
    await supabase
      .from('game_state')
      .update({ current_hole: nextHole, phase: 'committing' })
      .eq('id', 1)
      .eq('phase', 'scoring')
  }, [gameState])

  const handleSwitchPlayer = useCallback(() => {
    localStorage.removeItem('athens_player_id')
    router.push('/')
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-sans text-text-secondary text-lg">Henter spildata...</p>
      </div>
    )
  }

  if (error || !gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-sans text-score-bad text-lg text-center">{error ?? 'Noget gik galt'}</p>
        <button onClick={() => router.push('/')} className="btn-secondary w-auto px-6">
          ← Tilbage
        </button>
      </div>
    )
  }

  const currentHole = HOLES.find((h) => h.id === gameState.current_hole)!
  const currentHoleScores = scores.filter((s) => s.hole_id === gameState.current_hole)
  const myCurrentScore = currentHoleScores.find((s) => s.player_id === currentPlayer.id)
  const canSwitchPlayer = !myCurrentScore || myCurrentScore.committed_sips == null

  // Final scoreboard (after hole 12 scoring)
  if (gameState.phase === 'scoring' && gameState.current_hole === 12) {
    return (
      <FinalScoreboard
        players={players}
        scores={scores}
        holes={HOLES}
        currentPlayer={currentPlayer}
      />
    )
  }

  const phaseLabel: Record<string, string> = {
    committing: 'Commit',
    reveal: 'Reveal',
    drinking: 'Drik',
    scoring: 'Score',
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-bg-hero border-b border-white/10 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-accent-primary font-bold text-xl">
              ⛳ {gameState.current_hole}/12
            </span>
            {currentHole.is_practice && (
              <span className="text-xs bg-accent-warm text-text-on-dark px-2 py-0.5 rounded-full font-sans">
                PRØVE
              </span>
            )}
            <span className="text-xs bg-white/10 text-text-on-dark px-2 py-0.5 rounded-full font-sans">
              {phaseLabel[gameState.phase] ?? gameState.phase}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {canSwitchPlayer && (
              <button
                onClick={handleSwitchPlayer}
                className="text-text-on-dark text-base opacity-60 hover:opacity-100 px-2 py-1 font-sans"
              >
                ↩ {currentPlayer.name}
              </button>
            )}
            {!canSwitchPlayer && (
              <span className="text-text-on-dark text-base opacity-60 px-2 font-sans">
                {currentPlayer.name}
              </span>
            )}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-10 h-10 flex items-center justify-center text-xl text-accent-primary rounded-full hover:bg-white/10"
              aria-label="Vis leaderboard"
            >
              🏆
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-5 pb-10">
        {gameState.phase === 'committing' && (
          <CommitPhase
            hole={currentHole}
            myScore={myCurrentScore}
            committedCount={currentHoleScores.filter((s) => s.committed_sips != null).length}
            totalPlayers={TOTAL_PLAYERS}
            onCommit={handleCommit}
          />
        )}

        {gameState.phase === 'reveal' && (
          <RevealPhase
            hole={currentHole}
            scores={currentHoleScores}
            players={players}
            myScore={myCurrentScore}
            onRevealComplete={handleRevealComplete}
          />
        )}

        {gameState.phase === 'drinking' && (
          <DrinkPhase
            hole={currentHole}
            scores={currentHoleScores}
            players={players}
            myScore={myCurrentScore}
            onDrinkResult={handleDrinkResult}
          />
        )}

        {gameState.phase === 'scoring' && (
          <ScoringPhase
            hole={currentHole}
            scores={currentHoleScores}
            players={players}
            allScores={scores}
            holes={HOLES}
            onNextHole={handleNextHole}
          />
        )}
      </main>

      {/* Leaderboard overlay */}
      {showLeaderboard && (
        <Leaderboard
          players={players}
          scores={scores}
          holes={HOLES}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  )
}
