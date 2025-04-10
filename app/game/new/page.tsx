"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { getSupabase } from "@/lib/supabase"
import { initializeGameState } from "@/lib/game-utils"

export default function CreateGame() {
  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabase()

  const generateRoomCode = () => {
    // Generate a random 6-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const createGame = async () => {
    setIsCreating(true)
    setError("")

    try {
      const newRoomCode = generateRoomCode()

      // Create a new game room
      const { data: roomData, error: roomError } = await supabase
        .from("game_rooms")
        .insert([
          {
            room_code: newRoomCode,
            status: "waiting",
          },
        ])
        .select()
        .single()

      if (roomError || !roomData) {
        throw new Error("Failed to create game room")
      }

      // Initialize game state
      const initialState = initializeGameState(roomData.id)
      const { error: stateError } = await supabase.from("game_states").insert([initialState])

      if (stateError) {
        throw new Error("Failed to initialize game state")
      }

      // Success - redirect to the game room
      setRoomCode(newRoomCode)
      router.push(`/game/${newRoomCode}`)
    } catch (err) {
      console.error("Error creating game:", err)
      setError("Failed to create game. Please try again.")
      setIsCreating(false)
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container className="max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Create New Game</h1>

          <p className="text-amber-700 mb-6 text-center">
            Create a new Pancha Keliya game and invite a friend to play with you.
          </p>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6">{error}</div>}

          <Button
            onClick={createGame}
            disabled={isCreating}
            className="w-full bg-amber-600 hover:bg-amber-700 py-6 text-lg"
          >
            {isCreating ? "Creating Game..." : "Create Game"}
          </Button>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => router.push("/")} className="text-amber-600">
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </main>
  )
}
