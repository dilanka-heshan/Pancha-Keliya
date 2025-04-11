import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey)

export type User = {
    id: string
    username: string
    created_at: string
  }
  
  export type GameRoom = {
    id: string
    room_code: string
    status: "waiting" | "active" | "completed"
    created_at: string
    updated_at: string
  }
  
  export type Player = {
    id: string
    user_id: string
    room_id: string
    player_number: 1 | 2
    is_turn: boolean
    created_at: string
    updated_at: string
  }
  
  export type GameState = {
    id: string
    room_id: string
    current_player: 1 | 2 | null
    player1_pieces: PiecePosition[]
    player2_pieces: PiecePosition[]
    last_roll: number | null
    winner: 1 | 2 | null
    created_at: string
    updated_at: string
  }
  
  export type PiecePosition = {
    id: number
    position: number // -1 means not on board yet, 0-27 for board positions
    completed: boolean
  }
  