"use client"
import type { GameState } from "@/lib/supabase"
import { SAFE_SQUARES } from "@/lib/game-utils"
import Token from "./token"
import { cn } from "@/lib/utils"

interface BoardProps {
  gameState: GameState
  currentPlayer: 1 | 2
  isPlayerTurn: boolean
  onPieceSelect: (pieceId: number) => void
}

const HOME_POSITION = 0 // Define HOME_POSITION

export default function Board({ gameState, currentPlayer, isPlayerTurn, onPieceSelect }: BoardProps) {
  // Board layout configuration
  const boardLayout = [
    // Top row (home zone)
    [0, 1, 2, 3, 4, 5, 6],
    // Middle rows (player zones)
    [27, null, null, null, null, null, 7],
    [26, null, "player1", null, "player2", null, 8],
    [25, null, null, null, null, null, 9],
    // Bottom row
    [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
  ]

  // Get player pieces
  const player1Pieces = gameState.player1_pieces
  const player2Pieces = gameState.player2_pieces

  // Function to render a board square
  const renderSquare = (position: number | null | string) => {
    // If position is a player zone
    if (position === "player1" || position === "player2") {
      const playerNumber = position === "player1" ? 1 : 2
      const playerName = position === "player1" ? "Player 1" : "Player 2"
      const pieces = playerNumber === 1 ? player1Pieces : player2Pieces

      // Filter pieces that are not on the board yet
      const offBoardPieces = pieces.filter((p) => p.position === -1 && !p.completed)

      return (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center",
            "bg-amber-100 border-2 border-amber-700 rounded-lg p-4",
            "h-40 w-40",
          )}
        >
          <div className="text-amber-800 font-semibold mb-2">{playerName}</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {offBoardPieces.map((piece) => (
              <Token
                key={`${playerNumber}-${piece.id}`}
                pieceId={piece.id}
                playerNumber={playerNumber}
                position={-1}
                onClick={() => isPlayerTurn && currentPlayer === playerNumber && onPieceSelect(piece.id)}
                isSelectable={isPlayerTurn && currentPlayer === playerNumber}
              />
            ))}
          </div>
        </div>
      )
    }

    // If position is null (empty space)
    if (position === null) {
      return <div className="h-20 w-20"></div>
    }

    // Regular board square
    const isSafeSquare = SAFE_SQUARES.includes(position as number)
    const isHomeSquare = position === 0 // Top center is home

    // Find pieces at this position
    const player1PiecesHere = player1Pieces.filter((p) => p.position === position && !p.completed)
    const player2PiecesHere = player2Pieces.filter((p) => p.position === position && !p.completed)

    return (
      <div
        className={cn(
          "relative flex items-center justify-center",
          "border-2 border-amber-700 h-16 w-16",
          isSafeSquare ? "bg-amber-300" : "bg-amber-100",
          isHomeSquare ? "bg-amber-500" : "",
        )}
      >
        {isHomeSquare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-amber-800 text-xs">Home</div>
          </div>
        )}

        {/* Position number (for development) */}
        <div className="absolute top-0 left-0 text-xs text-amber-800 opacity-50">{position}</div>

        {/* Render pieces */}
        <div className="flex flex-wrap gap-1 justify-center items-center">
          {player1PiecesHere.map((piece) => (
            <Token
              key={`1-${piece.id}`}
              pieceId={piece.id}
              playerNumber={1}
              position={position as number}
              onClick={() => isPlayerTurn && currentPlayer === 1 && onPieceSelect(piece.id)}
              isSelectable={isPlayerTurn && currentPlayer === 1}
            />
          ))}
          {player2PiecesHere.map((piece) => (
            <Token
              key={`2-${piece.id}`}
              pieceId={piece.id}
              playerNumber={2}
              position={position as number}
              onClick={() => isPlayerTurn && currentPlayer === 2 && onPieceSelect(piece.id)}
              isSelectable={isPlayerTurn && currentPlayer === 2}
            />
          ))}
        </div>
      </div>
    )
  }

  // Render completed pieces area
  const renderCompletedPieces = (playerNumber: 1 | 2) => {
    const pieces = playerNumber === 1 ? player1Pieces : player2Pieces
    const completedPieces = pieces.filter((p) => p.completed)

    if (completedPieces.length === 0) return null

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-amber-800">Player {playerNumber} Completed Pieces</h3>
        <div className="flex gap-2 mt-1">
          {completedPieces.map((piece) => (
            <Token
              key={`${playerNumber}-${piece.id}-completed`}
              pieceId={piece.id}
              playerNumber={playerNumber}
              position={HOME_POSITION}
              isSelectable={false}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 p-6 rounded-xl shadow-lg">
      {/* Game board */}
      <div className="flex flex-col items-center">
        {boardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((position, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`}>{renderSquare(position)}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Completed pieces */}
      <div className="mt-6 flex justify-between">
        {renderCompletedPieces(1)}
        {renderCompletedPieces(2)}
      </div>
    </div>
  )
}
