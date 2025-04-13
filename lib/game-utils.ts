import e from "express"
import type { PiecePosition, GameState } from "./supabase"
import next from "next"

// Board constants
export const BOARD_SIZE = 80 // Total number of squares on the board
export const SAFE_SQUARES = [ 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138, 144,150,156] // Squares where pieces cannot be knocked out
export const PLAYER1_START = 1 // Starting position for player 1
export const PLAYER2_START = 79 // Starting position for player 2
export const HOME_POSITION_P1 = 79 // Position when player 1 piece completes the board
export const HOME_POSITION_P2 = 157 // Position when player 2 piece completes the board

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
  return roll === 1 || roll === 5 || roll === 0
}

// Check if a piece can enter the board with the current roll
export function canEnterBoard(roll: number): boolean {
  return roll === 1 || roll === 5 
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
  const nextPosition = playerNumber === 1 
? (currentPosition + roll) 
: (currentPosition + roll); // Fixed: remove the "+ 78" for Player 2

  // Check if piece has completed the circuit based on player number
  if (playerNumber === 1) {
    if (nextPosition >= HOME_POSITION_P1) {
      // Piece needs to land exactly on HOME_POSITION_P1 to complete
      if (nextPosition === HOME_POSITION_P1) {
        return HOME_POSITION_P1
      } else if (nextPosition > HOME_POSITION_P1) {
        // Cannot move if it would go beyond HOME_POSITION_P1
        return currentPosition
      }
    }
  } else {
    if (nextPosition >= HOME_POSITION_P2) {
      // Piece needs to land exactly on HOME_POSITION_P2 to complete
      if (nextPosition === HOME_POSITION_P2) {
        return HOME_POSITION_P2
      } else if (nextPosition > HOME_POSITION_P2) {
        // Cannot move if it would go beyond HOME_POSITION_P2
        return currentPosition
      }
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
  if (piece.completed) return false;

  // If piece is not on board, check if it can enter
  if (piece.position === -1) {
    return canEnterBoard(roll);
  }

  const nextPosition = getNextPosition(piece.position, roll, playerNumber);

  // Cannot move if position doesn't change
  if (nextPosition === piece.position) return false;

  // Check if the next position is occupied by another of player's pieces
  const isOccupiedByPlayer = playerPieces.some((p) => p.id !== piece.id && p.position === nextPosition && !p.completed);
  if (isOccupiedByPlayer) return false;

  // Check if the next position is a safe square occupied by an opponent
  const isSafeOccupiedByOpponent = SAFE_SQUARES.includes(nextPosition) &&
    opponentPieces.some((p) => p.position === nextPosition && !p.completed);
  if (isSafeOccupiedByOpponent) return false;

  return true;
}

// Check if a piece can knock out an opponent's piece
export function canKnockOut(position: number, opponentPieces: PiecePosition[]): number | null {
  // Cannot knock out on safe squares
  if (SAFE_SQUARES.includes(position)) return null

  // Find opponent piece at this position
  const opponentPiece = opponentPieces.find((p) => p.position === position && !p.completed)

  return opponentPiece ? opponentPiece.id : null
}

// Move a piece and handle knockouts
export function movePiece(
  piece: PiecePosition,
  roll: number,
  playerPieces: PiecePosition[],
  opponentPieces: PiecePosition[],
  playerNumber: 1 | 2
): { updatedPiece: PiecePosition; knockedOutPieceId: number | null } {
  const nextPosition = getNextPosition(piece.position, roll, playerNumber);

  // Check if the move is valid
  if (nextPosition === piece.position || nextPosition === -1) {
    return { updatedPiece: piece, knockedOutPieceId: null };
  }

  // Check for knockouts
  const knockedOutPieceId = canKnockOut(nextPosition, opponentPieces);

  if (knockedOutPieceId !== null) {
    // Knock out the opponent's piece
    const opponentPiece = opponentPieces.find((p) => p.id === knockedOutPieceId);
    if (opponentPiece) {
      opponentPiece.position = -1; // Send the opponent's piece back to home
    }
  }

  // Update the piece's position
  piece.position = nextPosition;

  return { updatedPiece: piece, knockedOutPieceId };
}

// Check if a player has won
export function checkWinner(playerPieces: PiecePosition[]): boolean {
  return playerPieces.every((piece) => piece.completed)
}

// Get available moves for the current player
export function getAvailableMoves(
  roll: number,
  playerPieces: PiecePosition[],
  opponentPieces: PiecePosition[],
  playerNumber: 1 | 2,
): number[] {
  return playerPieces
    .filter((piece) => isValidMove(piece, roll, playerPieces, opponentPieces, playerNumber))
    .map((piece) => piece.id)
}

// Check if any move is available for the current player
export function canMakeMove(
  roll: number,
  playerPieces: PiecePosition[],
  opponentPieces: PiecePosition[],
  playerNumber: 1 | 2,
): boolean {
  return getAvailableMoves(roll, playerPieces, opponentPieces, playerNumber).length > 0
}