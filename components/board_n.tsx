"use client"

import { useEffect, useState } from "react"
import Token from "@/components/token_n"
import type { GameState } from "@/lib/game-utils_n"

interface BoardProps {
  gameState: GameState
  onTokenClick: (tokenId: number) => void
  availableMoves: number[]
}

export default function Board({ gameState, onTokenClick, availableMoves }: BoardProps) {
  const [boardWidth, setBoardWidth] = useState(0)
  const [boardHeight, setBoardHeight] = useState(0)

  // Define safe cells (cells with red background)
  const safeCells = [
    6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138, 144,
  ]

  // Define cell positions and their dual numbering
  const cellDefinitions = [
    // Bottom row (left to right)
    { id: 1, altId: null, x: 1, y: 0, isSafe: false },
    { id: 2, altId: null, x: 2, y: 0, isSafe: false },
    { id: 3, altId: null, x: 3, y: 0, isSafe: false },
    { id: 4, altId: null, x: 4, y: 0, isSafe: false },
    { id: 5, altId: null, x: 5, y: 0, isSafe: false },
    { id: 6, altId: 84, x: 6, y: 0, isSafe: true },
    { id: 83, altId: null, x: 7, y: 0, isSafe: false },
    { id: 82, altId: null, x: 8, y: 0, isSafe: false },
    { id: 81, altId: null, x: 9, y: 0, isSafe: false },
    { id: 80, altId: null, x: 10, y: 0, isSafe: false },
    { id: 79, altId: null, x: 11, y: 0, isSafe: false },

    // Center vertical path (bottom to top)
    { id: 7, altId: 85, x: 5, y: 1, isSafe: false },
    { id: 8, altId: 86, x: 5, y: 2, isSafe: false },
    { id: 9, altId: 87, x: 5, y: 3, isSafe: false },
    { id: 10, altId: 88, x: 5, y: 4, isSafe: false },
    { id: 11, altId: 89, x: 5, y: 5, isSafe: false },

    // Bottom left corner to top (left column, bottom to top)
    { id: 18, altId: 132, x: 0, y: 6, isSafe: true },
    { id: 19, altId: 131, x: 0, y: 7, isSafe: false },
    { id: 20, altId: 130, x: 0, y: 8, isSafe: false },
    { id: 21, altId: 129, x: 0, y: 9, isSafe: false },
    { id: 22, altId: 128, x: 0, y: 10, isSafe: false },
    { id: 23, altId: 127, x: 0, y: 11, isSafe: false },

    // Bottom row (left to right)
    { id: 17, altId: 133, x: 1, y: 6, isSafe: false },
    { id: 16, altId: 134, x: 2, y: 6, isSafe: false },
    { id: 15, altId: 135, x: 3, y: 6, isSafe: false },
    { id: 14, altId: 136, x: 4, y: 6, isSafe: false },
    { id: 13, altId: 137, x: 5, y: 6, isSafe: false },
    { id: 12, altId: 90, x: 6, y: 6, isSafe: true },//
    { id: 59, altId: 91, x: 7, y: 6, isSafe: false },
    { id: 58, altId: 92, x: 8, y: 6, isSafe: false },
    { id: 57, altId: 93, x: 9, y: 6, isSafe: false },
    { id: 56, altId: 94, x: 10, y: 6, isSafe: false },
    { id: 55, altId: 95, x: 11, y: 6, isSafe: false },
    { id: 54, altId: 96, x: 12, y: 6, isSafe: true },

    // Right column (bottom to top)
    { id: 53, altId: 97, x: 12, y: 7, isSafe: false },
    { id: 52, altId: 98, x: 12, y: 8, isSafe: false },
    { id: 51, altId: 99, x: 12, y: 9, isSafe: false },
    { id: 50, altId: 100, x: 12, y: 10, isSafe: false },
    { id: 49, altId: 101, x: 12, y: 11, isSafe: false },
    { id: 48, altId: 102, x: 11, y: 12, isSafe: true },

    // Top row (right to left)
    { id: 47, altId: 103, x: 12, y: 13, isSafe: false },
    { id: 46, altId: 104, x: 12, y: 14, isSafe: false },
    { id: 45, altId: 105, x: 12, y: 15, isSafe: false },
    { id: 44, altId: 106, x: 12, y: 16, isSafe: false },
    { id: 43, altId: 107, x: 12, y: 17, isSafe: false },
    { id: 42, altId: 108, x: 12, y: 18, isSafe: true },
    { id: 41, altId: 109, x: 11, y: 18, isSafe: false },
    { id: 40, altId: 110, x: 10, y: 18, isSafe: false },
    { id: 39, altId: 111, x: 9, y: 18, isSafe: false },
    { id: 38, altId: 112, x: 8, y: 18, isSafe: false },
    { id: 37, altId: 113, x: 7, y: 18, isSafe: false },
    { id: 36, altId: 114, x: 6, y: 18, isSafe: true },

    // Left column (top to bottom)
    { id: 35, altId: 115, x: 5, y: 18, isSafe: false },
    { id: 34, altId: 116, x: 4, y: 18, isSafe: false },
    { id: 33, altId: 117, x: 3, y: 18, isSafe: false },
    { id: 32, altId: 118, x: 2, y: 18, isSafe: false },
    { id: 31, altId: 119, x: 1, y: 18, isSafe: false },
    { id: 30, altId: 120, x: 0, y: 18, isSafe: true },
//
    // Left diagonal path (top to bottom)
    { id: 73, altId: null, x: 1, y: 2, isSafe: false },
    { id: 74, altId: null, x: 2, y: 2, isSafe: false },
    { id: 75, altId: null, x: 3, y: 2, isSafe: false },
    { id: 76, altId: null, x: 4, y: 2, isSafe: false },
    { id: 77, altId: null, x: 5, y: 2, isSafe: false },
    { id: 78, altId: null, x: 6, y: 2, isSafe: true },

    // Right diagonal path (top to bottom)
    { id: 155, altId: null, x: 6, y: 2, isSafe: false },
    { id: 154, altId: null, x: 7, y: 2, isSafe: false },
    { id: 153, altId: null, x: 8, y: 2, isSafe: false },
    { id: 152, altId: null, x: 9, y: 2, isSafe: false },
    { id: 151, altId: null, x: 10, y: 2, isSafe: false },
    { id: 150, altId: null, x: 11, y: 2, isSafe: true },

    // Center horizontal path (left to right)
    { id: 72, altId: null, x: 1, y: 3, isSafe: false },
    { id: 71, altId: null, x: 2, y: 3, isSafe: false },
    { id: 70, altId: null, x: 3, y: 3, isSafe: false },
    { id: 69, altId: null, x: 4, y: 3, isSafe: false },
    { id: 68, altId: null, x: 5, y: 3, isSafe: false },
    { id: 67, altId: null, x: 6, y: 3, isSafe: false },
    { id: 66, altId: 144, x: 7, y: 3, isSafe: true },
    { id: 145, altId: null, x: 8, y: 3, isSafe: false },
    { id: 146, altId: null, x: 9, y: 3, isSafe: false },
    { id: 147, altId: null, x: 10, y: 3, isSafe: false },
    { id: 148, altId: null, x: 11, y: 3, isSafe: false },
    { id: 149, altId: null, x: 12, y: 3, isSafe: false },

    // Center vertical column (top to bottom)
    { id: 61, altId: 139, x: 6, y: 4, isSafe: false },
    { id: 62, altId: 140, x: 7, y: 4, isSafe: false },
    { id: 63, altId: 141, x: 8, y: 4, isSafe: false },
    { id: 64, altId: 142, x: 9, y: 4, isSafe: false },
    { id: 65, altId: 143, x: 10, y: 4, isSafe: false },

    // Left column (top to bottom)
    { id: 29, altId: 121, x: 1, y: 2, isSafe: false },
    { id: 28, altId: 122, x: 1, y: 3, isSafe: false },
    { id: 27, altId: 123, x: 1, y: 4, isSafe: false },
    { id: 26, altId: 124, x: 1, y: 5, isSafe: false },
    { id: 25, altId: 125, x: 1, y: 6, isSafe: false },
    { id: 24, altId: 126, x: 1, y: 7, isSafe: true },
  ]

  useEffect(() => {
    // Calculate board dimensions based on window size
    const calculateBoardSize = () => {
      const width = Math.min(window.innerWidth * 0.8, 600)
      setBoardWidth(width)
      setBoardHeight(width * 0.8) // Maintain aspect ratio
    }

    calculateBoardSize()
    window.addEventListener("resize", calculateBoardSize)
    return () => window.removeEventListener("resize", calculateBoardSize)
  }, [])

  // Get cell position in pixels
  const getCellPosition = (x: number, y: number) => {
    const cellSize = boardWidth / 13
    return {
      left: x * cellSize,
      top: y * cellSize,
      width: cellSize,
      height: cellSize,
    }
  }

  // Map game cell numbers to visual board positions
  const getTokenPosition = (cellId: number) => {
    const cell = cellDefinitions.find((c) => c.id === cellId || c.altId === cellId)
    if (!cell) return null

    const position = getCellPosition(cell.x, cell.y)
    return {
      left: position.left + position.width / 2,
      top: position.top + position.height / 2,
    }
  }

  if (boardWidth === 0) {
    return <div className="w-full h-96 flex items-center justify-center">Loading board...</div>
  }

  return (
    <div
      className="relative bg-white border-2 border-[#1e1e1e] rounded-lg overflow-hidden"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {/* Draw the board cells */}
      {cellDefinitions.map((cell) => {
        const position = getCellPosition(cell.x, cell.y)

        return (
          <div
            key={`cell-${cell.id}`}
            className={`absolute border border-[#1e1e1e] ${
              cell.isSafe ? "bg-[#f24822] text-white" : "bg-white text-[#1e1e1e]"
            }`}
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
              height: position.height,
            }}
          >
            <div className="absolute top-1 left-1 text-[8px]">
              {cell.id}
              {cell.altId && <span className="block">{`=${cell.altId}`}</span>}
            </div>
          </div>
        )
      })}

      {/* Render tokens */}
      {gameState.players.map((player, playerIndex) =>
        player.tokens
          .filter((token) => token.status === "playing")
          .map((token) => {
            const position = getTokenPosition(token.position)
            if (!position) return null

            return (
              <div
                key={token.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: position.left,
                  top: position.top,
                  zIndex: 10,
                }}
              >
                <Token
                  token={token}
                  player={player}
                  onClick={() => onTokenClick(token.id)}
                  isHighlighted={availableMoves.includes(token.id)}
                />
              </div>
            )
          }),
      )}

      {/* Home areas */}
      <div
        className="absolute bg-white border border-[#1e1e1e] rounded-lg p-2"
        style={{ left: 10, top: boardHeight - 120, width: 100 }}
      >
        <div className="text-xs font-bold text-red-500 mb-1 text-center">Player 1 Home</div>
        <div className="grid grid-cols-2 gap-2">
          {gameState.players[0]?.tokens
            .filter((token) => token.status === "home")
            .map((token) => (
              <Token
                key={token.id}
                token={token}
                player={gameState.players[0]}
                onClick={() => onTokenClick(token.id)}
                isHighlighted={availableMoves.includes(token.id)}
              />
            ))}
        </div>
      </div>

      <div
        className="absolute bg-white border border-[#1e1e1e] rounded-lg p-2"
        style={{ right: 10, top: boardHeight - 120, width: 100 }}
      >
        <div className="text-xs font-bold text-blue-500 mb-1 text-center">Player 2 Home</div>
        <div className="grid grid-cols-2 gap-2">
          {gameState.players[1]?.tokens
            .filter((token) => token.status === "home")
            .map((token) => (
              <Token
                key={token.id}
                token={token}
                player={gameState.players[1]}
                onClick={() => onTokenClick(token.id)}
                isHighlighted={availableMoves.includes(token.id)}
              />
            ))}
        </div>
      </div>

      {/* Finish areas */}
      <div
        className="absolute bg-white border border-[#1e1e1e] rounded-lg p-2"
        style={{ left: 10, top: 10, width: 100 }}
      >
        <div className="text-xs font-bold text-red-500 mb-1 text-center">Player 1 Finish</div>
        <div className="grid grid-cols-2 gap-2">
          {gameState.players[0]?.tokens
            .filter((token) => token.status === "finished")
            .map((token) => (
              <Token
                key={token.id}
                token={token}
                player={gameState.players[0]}
                onClick={() => {}}
                isHighlighted={false}
              />
            ))}
        </div>
      </div>

      <div
        className="absolute bg-white border border-[#1e1e1e] rounded-lg p-2"
        style={{ right: 10, top: 10, width: 100 }}
      >
        <div className="text-xs font-bold text-blue-500 mb-1 text-center">Player 2 Finish</div>
        <div className="grid grid-cols-2 gap-2">
          {gameState.players[1]?.tokens
            .filter((token) => token.status === "finished")
            .map((token) => (
              <Token
                key={token.id}
                token={token}
                player={gameState.players[1]}
                onClick={() => {}}
                isHighlighted={false}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
