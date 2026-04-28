export interface Player {
  id: string
  name: string
  display_order: number
}

export interface Hole {
  id: number
  name: string
  address: string
  maps_url: string
  drink: string
  drink_emoji: string
  max_sips: number
  stop_type: string
  fun_fact: string
  is_practice: boolean
  district: string | null
  coords: string | null
  score_multiplier: number
  host_notes: string | null
}

export interface Waypoint {
  id: number
  name: string
  description: string
  district: string | null
  coords: string | null
  maps_url: string | null
  after_hole_id: number
  display_order: number
  host_notes: string | null
}

export interface Score {
  id: string
  player_id: string
  hole_id: number
  committed_sips: number | null
  completed: boolean | null
  penalty_shot: boolean
  penalty_shot_reason: string | null
  created_at: string
}

export type Phase = 'committing' | 'reveal' | 'drinking' | 'scoring'

export interface GameState {
  id: number
  current_hole: number
  phase: Phase
}

export interface HoleScore {
  player: Player
  score: Score | undefined
  base: number
  distancePenalty: number
  commitmentPenalty: number
  rawTotal: number
  multiplier: number
  total: number
}
