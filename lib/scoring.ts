import type { Player, Score, Hole, HoleScore } from './types'

export function calculateGroupAverage(sips: number[]): number {
  if (sips.length === 0) return 0
  return sips.reduce((a, b) => a + b, 0) / sips.length
}

export function calculateDistancePenalty(committedSips: number, average: number): number {
  const distance = Math.abs(committedSips - average)
  if (distance <= 0.5) return 0
  if (distance <= 1.0) return 1
  if (distance <= 1.5) return 2
  if (distance <= 2.0) return 3
  return 4
}

export function checkPenaltyShot(
  committedSips: number,
  maxSips: number,
  previousSips: number | null,
  currentHoleId: number
): { penalty: boolean; reason: string | null } {
  // Top extreme — committing the maximum (per-hole, e.g. 8 for beer, 3 for shot)
  if (committedSips === maxSips) {
    return { penalty: true, reason: 'max' }
  }
  // Bottom extreme — committing 1 (just nipping)
  if (committedSips === 1) {
    return { penalty: true, reason: 'min' }
  }
  // Same as previous hole's commit — only counts from hole 3 onward
  if (previousSips !== null && committedSips === previousSips && currentHoleId > 2) {
    return { penalty: true, reason: 'same_as_last' }
  }
  return { penalty: false, reason: null }
}

export function computeHoleScores(
  players: Player[],
  scores: Score[],
  holeId: number,
  isPractice: boolean
): HoleScore[] {
  const holeScores = scores.filter((s) => s.hole_id === holeId && s.committed_sips !== null)
  const allSips = holeScores.map((s) => s.committed_sips as number)
  const average = calculateGroupAverage(allSips)

  return players.map((player) => {
    const score = holeScores.find((s) => s.player_id === player.id)
    if (!score || score.committed_sips === null) {
      return { player, score, base: 0, distancePenalty: 0, commitmentPenalty: 0, total: 0 }
    }
    const base = score.committed_sips
    const distancePenalty = isPractice ? 0 : calculateDistancePenalty(base, average)
    const commitmentPenalty = isPractice ? 0 : score.completed === false ? 3 : 0
    const total = base + distancePenalty + commitmentPenalty
    return { player, score, base, distancePenalty, commitmentPenalty, total }
  })
}

export function computeLeaderboard(
  players: Player[],
  scores: Score[],
  holes: Hole[]
): { player: Player; total: number; penaltyShots: number; commitmentFails: number; spotOns: number }[] {
  return players
    .map((player) => {
      let total = 0
      let penaltyShots = 0
      let commitmentFails = 0
      let spotOns = 0

      for (const hole of holes) {
        if (hole.is_practice) continue
        const holeScores = scores.filter((s) => s.hole_id === hole.id && s.committed_sips !== null)
        if (holeScores.length === 0) continue

        const myScore = holeScores.find((s) => s.player_id === player.id)
        if (!myScore || myScore.committed_sips === null) continue

        const allSips = holeScores.map((s) => s.committed_sips as number)
        const average = calculateGroupAverage(allSips)
        const distancePenalty = calculateDistancePenalty(myScore.committed_sips, average)
        const commitmentPenalty = myScore.completed === false ? 3 : 0

        total += myScore.committed_sips + distancePenalty + commitmentPenalty

        if (myScore.penalty_shot) penaltyShots += 1
        if (myScore.completed === false) commitmentFails += 1
        if (distancePenalty === 0) spotOns += 1
      }

      return { player, total, penaltyShots, commitmentFails, spotOns }
    })
    .sort((a, b) => a.total - b.total)
}
