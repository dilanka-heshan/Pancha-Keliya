"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { getSupabase } from "@/lib/supabase"

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabase()

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      // Check if room exists
      const { data, error: roomError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("room_code", roomCode.toUpperCase())
        .single()

      if (roomError || !data) {
        setError("Room not found. Please check the code and try again.")
        setIsJoining(false)
        return
      }

      // Check if room is full
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", data.id)

      if (playersError) {
        setError("Error checking room capacity")
        setIsJoining(false)
        return
      }

      if (playersData && playersData.length >= 2) {
        setError("This game is already full")
        setIsJoining(false)
        return
      }

      // Room exists and has space - redirect to the game page
      router.push(`/game/${roomCode.toUpperCase()}`)
    } catch (err) {
      console.error("Error joining game:", err)
      setError("An unexpected error occurred")
      setIsJoining(false)
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container className="max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Join Game</h1>

          <p className="text-amber-700 mb-6 text-center">
            Enter the room code provided by your friend to join their game.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-amber-700 mb-1">
                Room Code
              </label>
              <Input
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                className="text-center text-xl tracking-wider uppercase"
                maxLength={6}
              />
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>}

            <Button
              onClick={handleJoin}
              disabled={isJoining || !roomCode.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
          </div>

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
