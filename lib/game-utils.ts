import type { PiecePosition, GameState } from "./supabase"

// Board constants
export const BOARD_SIZE = 28 // Total number of squares on the board
export const SAFE_SQUARES = [0, 7, 14, 21] // Squares where pieces cannot be knocked out
export const PLAYER1_START = 0 // Starting position for player 1
export const PLAYER2_START = 14 // Starting position for player 2
export const HOME_POSITION = 28 // Position when a piece completes the board

// Initialize a new game state
export function initializeGameState(roomId: string): Omit<GameState, "id" | "created_at" | "updated_at"> {
  return {
    room_id: roomId,
    current_player: 1, // Player 1 starts
    player1_pieces: [
      { id: 1, position: -1, completed: false },
      { id: 2, position: -1, completed: false },
      { id: 3, position: -1, completed: false },
      { id: 4, position: -1, completed: false },
    ],
    player2_pieces: [
      { id: 1, position: -1, completed: false },
      { id: 2, position: -1, completed: false },
      { id: 3, position: -1, completed: false },
      { id: 4, position: -1, completed: false },
    ],
    last_roll: null,
    winner: null,
  }
}

// Simulate rolling 6 cowrie shells
export function rollCowries(): number {
  // Count how many shells land face up (randomly)
  let facingUp = 0
  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.5) {
      facingUp++
    }
  }
  return facingUp
}

// Check if a roll grants an extra turn
export function getsExtraTurn(roll: number): boolean {
  return roll === 1 || roll === 5 || roll === 6
}

// Check if a piece can enter the board with the current roll
export function canEnterBoard(roll: number): boolean {
  return roll === 1 || roll === 5 || roll === 6
}

// Get the next position for a piece
export function getNextPosition(currentPosition: number, roll: number, playerNumber: 1 | 2): number {
  // If piece is not on board yet
  if (currentPosition === -1) {
    // Can only enter with specific rolls
    if (canEnterBoard(roll)) {
      return playerNumber === 1 ? PLAYER1_START : PLAYER2_START
    }
    return -1
  }

  // Calculate next position
  const nextPosition = currentPosition + roll

  // Check if piece has completed the circuit
  if (nextPosition >= BOARD_SIZE) {
    // Piece needs to land exactly on HOME_POSITION to complete
    if (nextPosition === HOME_POSITION) {
      return HOME_POSITION
    } else if (nextPosition > HOME_POSITION) {
      // Cannot move if it would go beyond HOME_POSITION
      return currentPosition
    }
  }

  return nextPosition
}

// Check if a move is valid
export function isValidMove(
  piece: PiecePosition,
  roll: number,
  playerPieces: PiecePosition[],
  opponentPieces: PiecePosition[],
  playerNumber: 1 | 2,
): boolean {
  // Cannot move completed pieces
  if (piece.completed) return false

  // If piece is not on board, check if it can enter
  if (piece.position === -1) {
    return canEnterBoard(roll)
  }

  const nextPosition = getNextPosition(piece.position, roll, playerNumber)

  // Cannot move if position doesn't change
  if (nextPosition === piece.position) return false

  // Check if the next position is occupied by another of player's pieces
  const isOccupiedByPlayer = playerPieces.some((p) => p.id !== piece.id && p.position === nextPosition && !p.completed)

  if (isOccupiedByPlayer) return false

  return true
}

// Check if a piece can knock out an opponent's piece
export function canKnockOut(position: number, opponentPieces: PiecePosition[]): number | null {
  // Cannot knock out on safe squares
  if (SAFE_SQUARES.includes(position)) return null

  // Find opponent piece at this position
  const opponentPiece = opponentPieces.find((p) => p.position === position && !p.completed)

  return opponentPiece ? opponentPiece.id : null
}

// Check if a player has won
export function checkWinner(playerPieces: PiecePosition[]): boolean {
  return playerPieces.every((piece) => piece.completed)
}
