'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Player, Score, GameState, Hole } from '@/lib/types'
import { checkPenaltyShot } from '@/lib/scoring'
import { toRoman as romanize } from '@/lib/format'
import CommitPhase from '@/components/game/CommitPhase'
import RevealPhase from '@/components/game/RevealPhase'
import DrinkPhase from '@/components/game/DrinkPhase'
import ScoringPhase from '@/components/game/ScoringPhase'
import FinalScoreboard from '@/components/game/FinalScoreboard'
import InfoSheet from '@/components/InfoSheet'
import RouteStrip from '@/components/RouteStrip'
import RouteTimeline from '@/components/RouteTimeline'

const TOTAL_PLAYERS = 6

export default function GamePage() {
  const router = useRouter()
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [holes, setHoles] = useState<Hole[]>([])
  const [showInfo, setShowInfo] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
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
        const [playerRes, playersRes, gameStateRes, scoresRes, holesRes] = await Promise.all([
          supabase.from('players').select('*').eq('id', playerId).single(),
          supabase.from('players').select('*').order('display_order'),
          supabase.from('game_state').select('*').eq('id', 1).single(),
          supabase.from('scores').select('*'),
          supabase.from('holes').select('*').order('id'),
        ])

        if (playerRes.error || !playerRes.data) {
          router.push('/')
          return
        }

        setCurrentPlayer(playerRes.data)
        setPlayers(playersRes.data || [])
        setGameState(gameStateRes.data)
        setScores(scoresRes.data || [])
        setHoles(holesRes.data || [])
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'holes' },
        (payload) => {
          setHoles((prev) =>
            prev.map((h) => (h.id === (payload.new as Hole).id ? (payload.new as Hole) : h))
          )
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
      const currentHoleData = holes.find((h) => h.id === gameState.current_hole)
      const maxSips = currentHoleData?.max_sips ?? 8
      const { penalty, reason } = checkPenaltyShot(sips, maxSips, prevSips, gameState.current_hole)

      await supabase.from('scores').insert({
        player_id: currentPlayer.id,
        hole_id: gameState.current_hole,
        committed_sips: sips,
        penalty_shot: penalty,
        penalty_shot_reason: reason,
      })
    },
    [currentPlayer, gameState, scores, holes]
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
    if (!gameState || holes.length === 0) return
    // Find next existing hole id (handles gaps + added stops dynamically)
    const sortedIds = holes.map((h) => h.id).sort((a, b) => a - b)
    const idx = sortedIds.indexOf(gameState.current_hole)
    const nextHole = sortedIds[idx + 1]
    if (nextHole == null) return // No more holes — game over
    await supabase
      .from('game_state')
      .update({ current_hole: nextHole, phase: 'committing' })
      .eq('id', 1)
      .eq('phase', 'scoring')
  }, [gameState, holes])

  const handleSwitchPlayer = useCallback(() => {
    localStorage.removeItem('athens_player_id')
    router.push('/')
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4">
        <div className="w-6 h-6 border border-ink border-t-transparent rounded-full animate-spin" />
        <p className="smallcaps">Henter spildata</p>
      </div>
    )
  }

  if (error || !gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-serif italic text-wine text-lg text-center">{error ?? 'Noget gik galt'}</p>
        <button onClick={() => router.push('/')} className="btn-ghost w-auto px-6">
          Tilbage
        </button>
      </div>
    )
  }

  const currentHole = holes.find((h) => h.id === gameState.current_hole)
  const currentHoleScores = scores.filter((s) => s.hole_id === gameState.current_hole)
  const myCurrentScore = currentHoleScores.find((s) => s.player_id === currentPlayer.id)
  const canSwitchPlayer = !myCurrentScore || myCurrentScore.committed_sips == null

  // Sorted hole ids — handles non-contiguous IDs (added/removed stops)
  const sortedHoleIds = holes.map((h) => h.id).sort((a, b) => a - b)
  const totalHoles = sortedHoleIds.length
  const lastHoleId = sortedHoleIds[sortedHoleIds.length - 1]
  const currentHolePosition = sortedHoleIds.indexOf(gameState.current_hole) + 1
  const isLastHole = gameState.current_hole === lastHoleId

  // Defensive: if current hole was deleted from DB, show error
  if (!currentHole) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-serif italic text-wine text-lg text-center">
          Stop {gameState.current_hole} findes ikke længere. Få Lukas til at fixe det.
        </p>
      </div>
    )
  }

  // Final scoreboard — when on the last hole's scoring phase
  if (gameState.phase === 'scoring' && isLastHole) {
    return (
      <FinalScoreboard
        players={players}
        scores={scores}
        holes={holes}
        currentPlayer={currentPlayer}
      />
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Sticky header — minimal, classical */}
      <header className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-sm border-b border-rule">
        <div className="max-w-md mx-auto flex items-center justify-between px-5 py-3">
          {canSwitchPlayer ? (
            <button
              onClick={handleSwitchPlayer}
              className="font-mono text-ink-muted text-sm hover:text-ink"
              aria-label="Skift spiller"
            >
              ‹
            </button>
          ) : (
            <span className="w-3" />
          )}

          <div className="text-center">
            <p className="smallcaps-ink">
              Stop {romanize(currentHolePosition)} <span className="text-gold">·</span> {romanize(totalHoles)}
            </p>
          </div>

          <button
            onClick={() => setShowInfo(true)}
            className="font-mono text-ink-muted text-xs hover:text-ink"
            aria-label="Vis info"
            style={{ letterSpacing: '0.08em' }}
          >
            🏆
          </button>
        </div>

        {/* Route progress strip — tap to open timeline */}
        <div className="max-w-md mx-auto border-t border-rule/50">
          <RouteStrip
            holes={holes}
            currentHoleId={gameState.current_hole}
            onClick={() => setShowRoute(true)}
          />
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
            holes={holes}
            onNextHole={handleNextHole}
          />
        )}
      </main>

      {/* Info sheet — Stilling | Historik | Regler */}
      {showInfo && (
        <InfoSheet
          players={players}
          scores={scores}
          holes={holes}
          gameState={gameState}
          currentPlayerId={currentPlayer.id}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Route timeline overlay */}
      {showRoute && (
        <RouteTimeline
          holes={holes}
          scores={scores}
          players={players}
          currentHoleId={gameState.current_hole}
          onClose={() => setShowRoute(false)}
        />
      )}
    </div>
  )
}
