import type { Server as NetServer } from "http"
import type { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export type SocketRequest = NextApiRequest & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

// Game events
export enum GameEvents {
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  GAME_STATE_UPDATE = "game_state_update",
  ROLL_COWRIES = "roll_cowries",
  MOVE_PIECE = "move_piece",
  GAME_OVER = "game_over",
  PLAYER_READY = "player_ready",
  ERROR = "error",
}

// Socket message types
export type JoinRoomMessage = {
  roomCode: string
  username: string
}

export type RollCowriesMessage = {
  roomCode: string
  playerId: string
}

export type MovePieceMessage = {
  roomCode: string
  playerId: string
  pieceId: number
}

export type GameStateUpdateMessage = {
  roomCode: string
  gameState: any
}
