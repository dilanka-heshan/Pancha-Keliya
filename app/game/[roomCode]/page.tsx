"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Container } from "@/components/ui/container"
import Board from "@/components/board"
import CowrieRoller from "@/components/cowrie-roller"
import Lobby from "@/components/lobby"
import { getSupabase, type GameState } from "@/lib/supabase"
import { isValidMove, getNextPosition, canKnockOut, checkWinner, getsExtraTurn } from "@/lib/game-utils"
import { io, type Socket } from "socket.io-client"
import { GameEvents } from "@/lib/socket"
import GameOver from "@/components/game-over"

export default function GameRoom() {
  const { roomCode } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const supabase = getSupabase()

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io({
      path: "/api/socket",
    })

    newSocket.on("connect", () => {
      console.log("Socket connected")

      // Join the room
      if (roomCode) {
        newSocket.emit(GameEvents.JOIN_ROOM, { roomCode })
      }
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    newSocket.on(GameEvents.GAME_STATE_UPDATE, (updatedState: GameState) => {
      setGameState(updatedState)

      // Check for winner
      if (updatedState.winner) {
        setMessage(`Player ${updatedState.winner} wins!`)
      }
    })

    newSocket.on(GameEvents.ERROR, (errorMsg: string) => {
      setError(errorMsg)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [roomCode])

  // Load initial game state
  useEffect(() => {
    const fetchGameState = async () => {
      if (!roomCode) return

      try {
        // Get room ID from room code
        const { data: roomData, error: roomError } = await supabase
          .from("game_rooms")
          .select("*")
          .eq("room_code", roomCode)
          .single()

        if (roomError || !roomData) {
          setError("Room not found")
          setIsLoading(false)
          return
        }

        // Get game state
        const { data: stateData, error: stateError } = await supabase
          .from("game_states")
          .select("*")
          .eq("room_id", roomData.id)
          .single()

        if (stateError || !stateData) {
          setError("Game state not found")
          setIsLoading(false)
          return
        }

        setGameState(stateData)

        // Get player number from localStorage
        const storedPlayerNumber = localStorage.getItem("playerNumber")
        if (storedPlayerNumber) {
          setPlayerNumber(Number.parseInt(storedPlayerNumber) as 1 | 2)
        }

        // Check if game has started (both players joined)
        const { data: playersData } = await supabase.from("players").select("*").eq("room_id", roomData.id)

        if (playersData && playersData.length === 2) {
          setGameStarted(true)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching game state:", err)
        setError("Failed to load game")
        setIsLoading(false)
      }
    }

    fetchGameState()

    // Set up real-time subscription for game state changes
    if (roomCode) {
      const subscription = supabase
        .channel(`game:${roomCode}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "game_states",
          },
          (payload) => {
            setGameState(payload.new as GameState)
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [roomCode])

  const handleGameStart = () => {
    setGameStarted(true)
  }

  const handleRoll = async (roll: number) => {
    if (!gameState || !playerNumber || gameState.current_player !== playerNumber) {
      return
    }

    setLastRoll(roll)
    setMessage(`You rolled ${roll}`)

    // Update game state with the roll
    const updatedState = {
      ...gameState,
      last_roll: roll,
    }

    // If no valid moves are available, switch turns
    const playerPieces = playerNumber === 1 ? gameState.player1_pieces : gameState.player2_pieces
    const opponentPieces = playerNumber === 1 ? gameState.player2_pieces : gameState.player1_pieces

    const hasValidMove = playerPieces.some((piece) =>
      isValidMove(piece, roll, playerPieces, opponentPieces, playerNumber),
    )

    if (!hasValidMove) {
      setMessage(`No valid moves available. Turn passes to Player ${playerNumber === 1 ? 2 : 1}`)

      // Switch turns if no extra turn
      if (!getsExtraTurn(roll)) {
        updatedState.current_player = playerNumber === 1 ? 2 : 1
      }

      // Update game state
      await updateGameState(updatedState)

      // Reset selected piece and last roll
      setSelectedPiece(null)
      setTimeout(() => setLastRoll(null), 2000)
    }
  }

  const handlePieceSelect = async (pieceId: number) => {
    if (!gameState || !playerNumber || gameState.current_player !== playerNumber || lastRoll === null) {
      return
    }

    // Get the selected piece
    const playerPieces = playerNumber === 1 ? gameState.player1_pieces : gameState.player2_pieces
    const opponentPieces = playerNumber === 1 ? gameState.player2_pieces : gameState.player1_pieces

    const piece = playerPieces.find((p) => p.id === pieceId)
    if (!piece) return

    // Check if move is valid
    if (!isValidMove(piece, lastRoll, playerPieces, opponentPieces, playerNumber)) {
      setMessage("Invalid move")
      return
    }

    // Calculate new position
    const newPosition = getNextPosition(piece.position, lastRoll, playerNumber)

    // Check if piece has completed the circuit
    const completed = newPosition === 28

    // Update piece position
    const updatedPieces = playerPieces.map((p) => (p.id === pieceId ? { ...p, position: newPosition, completed } : p))

    // Check if opponent piece is knocked out
    let updatedOpponentPieces = [...opponentPieces]
    if (!completed && newPosition !== piece.position) {
      const knockedPieceId = canKnockOut(newPosition, opponentPieces)
      if (knockedPieceId !== null) {
        updatedOpponentPieces = opponentPieces.map((p) => (p.id === knockedPieceId ? { ...p, position: -1 } : p))
        setMessage(`You knocked out opponent's piece ${knockedPieceId}!`)
      }
    }

    // Check for winner
    const hasWon = checkWinner(updatedPieces)

    // Update game state
    const updatedState = {
      ...gameState,
      player1_pieces: playerNumber === 1 ? updatedPieces : updatedOpponentPieces,
      player2_pieces: playerNumber === 2 ? updatedPieces : updatedOpponentPieces,
      winner: hasWon ? playerNumber : null,
    }

    // Switch turns if no extra turn
    if (!getsExtraTurn(lastRoll) && !hasWon) {
      updatedState.current_player = playerNumber === 1 ? 2 : 1
    } else if (getsExtraTurn(lastRoll) && !hasWon) {
      setMessage(`You get another turn!`)
    }

    // Update game state
    await updateGameState(updatedState)

    // Reset selected piece and last roll
    setSelectedPiece(null)
    setLastRoll(null)
  }

  const updateGameState = async (newState: GameState) => {
    try {
      const { error } = await supabase.from("game_states").update(newState).eq("id", newState.id)

      if (error) {
        throw error
      }

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit(GameEvents.GAME_STATE_UPDATE, {
          roomCode,
          gameState: newState,
        })
      }
    } catch (err) {
      console.error("Error updating game state:", err)
      setError("Failed to update game state")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-amber-800 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!gameStarted || !gameState) {
    return <Lobby roomCode={roomCode as string} onGameStart={handleGameStart} />
  }

  return (
    <main className="min-h-screen bg-amber-50 py-6">
      <Container>
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-800">Pancha Keliya - Room {roomCode}</h1>
          <div className="bg-amber-100 px-3 py-1 rounded-md">
            <span className="font-medium text-amber-800">
              {gameState.current_player === playerNumber ? "Your Turn" : `Player ${gameState.current_player}'s Turn`}
            </span>
          </div>
        </div>

        {message && <div className="mb-4 bg-amber-100 p-3 rounded-md text-amber-800">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Board
              gameState={gameState}
              currentPlayer={gameState.current_player as 1 | 2}
              isPlayerTurn={gameState.current_player === playerNumber}
              onPieceSelect={handlePieceSelect}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Game Info</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-amber-700">Your Player:</span>
                  <span className="font-medium">
                    Player {playerNumber}
                    {playerNumber === 1 ? " (Teal)" : " (Purple)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Current Turn:</span>
                  <span className="font-medium">Player {gameState.current_player}</span>
                </div>
                {gameState.winner && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Winner:</span>
                    <span>Player {gameState.winner}</span>
                  </div>
                )}
              </div>
            </div>

            <CowrieRoller
              onRoll={handleRoll}
              disabled={gameState.current_player !== playerNumber || lastRoll !== null || gameState.winner !== null}
            />

            {lastRoll !== null && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-amber-800 mb-2">Instructions</h2>
                <p className="text-amber-700">Select a piece to move {lastRoll} spaces.</p>
              </div>
            )}
          </div>
        </div>
        {gameState.winner && <GameOver winner={gameState.winner} playerNumber={playerNumber} />}
      </Container>
    </main>
  )
}
