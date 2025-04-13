"use client"
import { useEffect, useState } from "react"
import type { GameState } from "@/lib/supabase"
import { SAFE_SQUARES, HOME_POSITION_P1 ,HOME_POSITION_P2 } from "@/lib/game-utils"
import Token from "./token"
import { cn } from "@/lib/utils"

interface BoardProps {
  gameState: GameState
  currentPlayer: 1 | 2
  isPlayerTurn: boolean
  onPieceSelect: (pieceId: number) => void
  availableMoves?: number[] // Added available moves prop

}

export default function Board({ 
  gameState, 
  currentPlayer, 
  isPlayerTurn, 
  onPieceSelect,
  availableMoves = [] // Default to empty array
}: BoardProps) {
  const [boardWidth, setBoardWidth] = useState(0)
  const [boardHeight, setBoardHeight] = useState(0)
  
  useEffect(() => {
    // Trigger a re-render when the gameState changes
    setBoardWidth(prev => prev); // Dummy state update to force re-render
  }, [gameState]);

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
    { id: 7, altId: 85, x: 6, y: 1, isSafe: false },
    { id: 8, altId: 86, x: 6, y: 2, isSafe: false },
    { id: 9, altId: 87, x: 6, y: 3, isSafe: false },
    { id: 10, altId: 88, x: 6, y: 4, isSafe: false },
    { id: 11, altId: 89, x: 6, y: 5, isSafe: false },

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
    { id: 12, altIds: [90, 60, 138], x: 6, y: 6, isSafe: true },
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
    { id: 48, altId: 102, x: 12, y: 12, isSafe: true },

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
    { id: 78, altId: null, x: 4.3, y: 16.8, isSafe: true },
    { id: 77, altId: null, x: 3.7, y: 16, isSafe: false },
    { id: 76, altId: null, x: 3.1, y: 15.2, isSafe: false },
    { id: 75, altId: null, x: 2.5, y: 14.4, isSafe: false },
    { id: 74, altId: null, x: 1.9, y: 13.6, isSafe: false },
    { id: 73, altId: null, x: 1.3, y: 12.8, isSafe: false },



  

    // Right diagonal path (top to bottom)
    { id: 155, altId: null, x: 8.2, y: 16, isSafe: false },
    { id: 154, altId: null, x: 8.8, y: 15.2, isSafe: false },
    { id: 153, altId: null, x: 9.4, y: 14.4, isSafe: false },
    { id: 152, altId: null, x: 10, y: 13.6, isSafe: false },
    { id: 151, altId: null, x: 10.6, y: 12.8, isSafe: false },
    { id: 156, altId: null, x: 7.6, y: 16.8, isSafe: true },


    // Center horizontal path (left to right)
    { id: 72, altId: null, x: 1.3, y: 12, isSafe: true },
    { id: 71, altId: null, x: 2, y: 12, isSafe: false },
    { id: 70, altId: null, x: 2.8, y: 12, isSafe: false },
    { id: 69, altId: null, x: 3.6, y: 12, isSafe: false },
    { id: 68, altId: null, x: 4.4, y: 12, isSafe: false },
    { id: 67, altId: null, x: 5.2, y: 12, isSafe: false },
    { id: 66, altId: 144, x: 6, y: 12, isSafe: true },
    { id: 145, altId: null, x: 6.9, y: 12, isSafe: false },
    { id: 146, altId: null, x: 7.6, y: 12, isSafe: false },
    { id: 147, altId: null, x: 8.4, y: 12, isSafe: false },
    { id: 148, altId: null, x: 9.2, y: 12, isSafe: false },
    { id: 149, altId: null, x: 10, y: 12, isSafe: false },
    { id: 150, altId: null, x: 10.6, y: 12, isSafe: true },

    // Center vertical column (top to bottom)
    { id: 61, altId: 139, x: 6, y: 7, isSafe: false },
    { id: 62, altId: 140, x: 6, y: 8, isSafe: false },
    { id: 63, altId: 141, x: 6, y: 9, isSafe: false },
    { id: 64, altId: 142, x: 6, y: 10, isSafe: false },
    { id: 65, altId: 143, x: 6, y: 11, isSafe: false },

    // Left column (top to bottom)
    { id: 29, altId: 121, x: 0, y: 17, isSafe: false },
    { id: 28, altId: 122, x: 0, y: 16, isSafe: false },
    { id: 27, altId: 123, x: 0, y: 15, isSafe: false },
    { id: 26, altId: 124, x: 0, y: 14, isSafe: false },
    { id: 25, altId: 125, x: 0, y: 13, isSafe: false },
    { id: 24, altId: 126, x: 0, y: 12, isSafe: true },
  ]


  useEffect(() => {
    // Calculate board dimensions based on window size
    const calculateBoardSize = () => {
      const width = Math.min(window.innerWidth *1, 800)
      setBoardWidth(width)
      setBoardHeight(width)
    }

    calculateBoardSize()
    window.addEventListener("resize", calculateBoardSize)
    return () => window.removeEventListener("resize", calculateBoardSize)
  }, [])

  const getCellPosition = (x: number, y: number) => {
    const cellSize = boardWidth / 24; // Increase cell size to reduce free space
    const offsetX = (boardWidth - cellSize * 30) / 2; // Center horizontally
    const offsetY = (boardHeight - cellSize * 20) / 2; // Center vertically
    return {
      left: offsetX + (20 - x) * cellSize, // Adjust for centering and invert x
      top: offsetY + (20 - y) * cellSize, // Adjust for centering and invert y
      width: cellSize,
      height: cellSize,
    };
  };

  const getTokenPosition = (cellId: number) => {
    const cell = cellDefinitions.find(
      (c) => c.id === cellId || c.altId === cellId || (c.altIds && c.altIds.includes(cellId))
    );
    if (!cell) return null;
  
    const position = getCellPosition(cell.x, cell.y);
    return {
      left: position.left + position.width / 2,
      top: position.top + position.height / 2,
    };
  };
  
  // Add the missing onTokenClick function
  const onTokenClick = (tokenId: number) => {
    if (isPlayerTurn) {
      onPieceSelect(tokenId);
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
            </div>
          )
        })}
  
        {/* Render tokens */}
        {/* Player 1 tokens */}
        {gameState.player1_pieces
          .filter((piece) => piece.position >= 0 && !piece.completed)
          .map((piece) => {
            const position = getTokenPosition(piece.position);
            if (!position) return null;
            
            return (
                  <div
                  key={`p1-${piece.id}-${piece.position}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: position.left,
                    top: position.top,
                    zIndex: 10,
                    transition: 'all 0.3s ease-in-out' // Add smooth transition
                  }}
                  >
                  <Token
                    pieceId={piece.id}
                    playerNumber={1}
                    position={piece.position}
                    isSelectable={isPlayerTurn && currentPlayer === 1 && availableMoves.includes(piece.id)}
                    onClick={() => onTokenClick(piece.id)}
                    previousPosition={piece.previous_position}
                  />
                  </div>
            );
          })}
          
        {/* Player 2 tokens */}
        {gameState.player2_pieces
          .filter((piece) => piece.position >= 0 && !piece.completed)
          .map((piece) => {
            const position = getTokenPosition(piece.position);
            if (!position) return null;
            
            return (
              <div
                key={`p2-${piece.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: position.left,
                  top: position.top,
                  zIndex: 10,

                }}
              >
                <Token
                  pieceId={piece.id}
                  playerNumber={2}
                  position={piece.position}
                  isSelectable={isPlayerTurn && currentPlayer === 2 && availableMoves.includes(piece.id)}
                  onClick={() => onTokenClick(piece.id)}
                  previousPosition={piece.previous_position}
                />
              </div>
            );
          })}
  
        {/* Home areas */}
        <div
          className="absolute bg-white border border-[#1e1e1e] rounded-lg p-2"
          style={{ left: 10, top: boardHeight - 120, width: 100 }}
        >
          <div className="text-xs font-bold text-red-500 mb-1 text-center">Player 1 Home</div>
          <div className="grid grid-cols-2 gap-2">
            {gameState.player1_pieces
              .filter((piece) => piece.position === -1 && !piece.completed)
              .map((piece) => (
                <Token
                  key={`p1-${piece.id}`}
                  pieceId={piece.id}
                  playerNumber={1}
                  position={-1}
                  isSelectable={isPlayerTurn && currentPlayer === 1 && availableMoves.includes(piece.id)}
                  onClick={() => onTokenClick(piece.id)}
                  previousPosition={piece.previous_position}
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
            {gameState.player2_pieces
              .filter((piece) => piece.position === -1 && !piece.completed)
              .map((piece) => (
                <Token
                  key={`p2-${piece.id}`}
                  pieceId={piece.id}
                  playerNumber={2}
                  position={-1}
                  isSelectable={isPlayerTurn && currentPlayer === 2 && availableMoves.includes(piece.id)}
                  onClick={() => onTokenClick(piece.id)}
                  previousPosition={piece.previous_position}
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
            {gameState.player1_pieces
              .filter((piece) => piece.completed)
              .map((piece) => (
                <Token
                  key={`p1-${piece.id}`}
                  pieceId={piece.id}
                  playerNumber={1}
                  position={HOME_POSITION_P1}
                  isSelectable={false}
                  onClick={() => {}}
                  previousPosition={piece.previous_position}
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
            {gameState.player2_pieces
              .filter((piece) => piece.completed)
              .map((piece) => (
                <Token
                  key={`p2-${piece.id}`}
                  pieceId={piece.id}
                  playerNumber={2}
                  position={HOME_POSITION_P2}
                  isSelectable={false}
                  onClick={() => {}}
                  previousPosition={piece.previous_position}
                />
              ))}
          </div>
        </div>
      </div>
    )
  }
  
//   const player1Pieces = gameState.player1_pieces
//   const player2Pieces = gameState.player2_pieces




//   const renderSquare = (position: number | null | string) => {
//     if (position === "player1" || position === "player2") {
//       const playerNumber = position === "player1" ? 1 : 2
//       const pieces = playerNumber === 1 ? player1Pieces : player2Pieces
//       const offBoardPieces = pieces.filter((p) => p.position === -1 && !p.completed)

//       return (
//         <div className="bg-amber-100 border-2 border-amber-700 rounded-lg p-4 h-32 w-32 flex flex-col items-center justify-center">
//           <div className="text-amber-800 font-semibold mb-2">Player {playerNumber}</div>
//           <div className="flex flex-wrap gap-2 justify-center">
//             {offBoardPieces.map((piece) => (
//               <Token
//                 key={`${playerNumber}-${piece.id}`}
//                 pieceId={piece.id}
//                 playerNumber={playerNumber}
//                 position={-1}
//                 onClick={() => isPlayerTurn && currentPlayer === playerNumber && onPieceSelect(piece.id)}
//                 isSelectable={isPlayerTurn && currentPlayer === playerNumber && availableMoves.includes(piece.id)}
//               />
//             ))}
//           </div>
//         </div>
//       )
//     }

//     if (position === null) return <div className="h-16 w-16" />

//     const isSafe = SAFE_SQUARES.includes(position as number)
//     const isHome = position === HOME_POSITION

//     const p1Here = player1Pieces.filter(p => p.position === position && !p.completed)
//     const p2Here = player2Pieces.filter(p => p.position === position && !p.completed)

//     return (
//       <div className={cn(
//         "relative border-2 border-amber-700 h-14 w-14 flex items-center justify-center",
//         isSafe ? "bg-amber-300" : "bg-amber-100",
//         isHome && "bg-amber-500"
//       )}>
//         {isHome && <div className="absolute inset-0 flex items-center justify-center text-xs text-amber-900">Home</div>}
//         <div className="absolute top-0 left-0 text-[10px] text-amber-800 opacity-50">{position}</div>
//         <div className="flex flex-wrap gap-1 justify-center items-center">
//           {p1Here.map(piece => (
//             <Token
//               key={`1-${piece.id}`}
//               pieceId={piece.id}
//               playerNumber={1}
//               position={position as number}
//               onClick={() => isPlayerTurn && currentPlayer === 1 && onPieceSelect(piece.id)}
//               isSelectable={isPlayerTurn && currentPlayer === 1 && availableMoves.includes(piece.id)}
//             />
//           ))}
//           {p2Here.map(piece => (
//             <Token
//               key={`2-${piece.id}`}
//               pieceId={piece.id}
//               playerNumber={2}
//               position={position as number}
//               onClick={() => isPlayerTurn && currentPlayer === 2 && onPieceSelect(piece.id)}
//               isSelectable={isPlayerTurn && currentPlayer === 2 && availableMoves.includes(piece.id)}
//             />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   const renderCompletedPieces = (playerNumber: 1 | 2) => {
//     const pieces = playerNumber === 1 ? player1Pieces : player2Pieces
//     const completed = pieces.filter(p => p.completed)
//     if (completed.length === 0) return null

//     return (
//       <div className="mt-4">
//         <h3 className="text-sm font-medium text-amber-800">Player {playerNumber} Completed</h3>
//         <div className="flex gap-2 mt-1">
//           {completed.map(piece => (
//             <Token
//               key={`${playerNumber}-${piece.id}-completed`}
//               pieceId={piece.id}
//               playerNumber={playerNumber}
//               position={HOME_POSITION}
//               isSelectable={false}
//               onClick={() => {}}
//             />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-amber-50 p-6 rounded-xl shadow-lg">
//       <div className="flex flex-col items-center">
//         {boardLayout.map((row, i) => (
//           <div key={i} className="flex">
//             {row.map((cell, j) => (
//               <div key={`${i}-${j}`}>{renderSquare(cell)}</div>
//             ))}
//           </div>
//         ))}
//       </div>
//       <div className="mt-6 flex justify-between">
//         {renderCompletedPieces(1)}
//         {renderCompletedPieces(2)}
//       </div>
//     </div>
//   )
// }
