"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { getSupabase, type User } from "@/lib/supabase"

interface LobbyProps {
  roomCode: string
  onGameStart: () => void
}

export default function Lobby({ roomCode, onGameStart }: LobbyProps) {
  const [username, setUsername] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [players, setPlayers] = useState<User[]>([])
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabase()

  useEffect(() => {
    // Subscribe to player changes in this room
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from("players").select("user_id").eq("room_id", roomCode)

      if (error) {
        console.error("Error fetching players:", error)
        return
      }

      if (data && data.length > 0) {
        const userIds = data.map((player) => player.user_id)
        const { data: userData, error: userError } = await supabase.from("users").select("*").in("id", userIds)

        if (userError) {
          console.error("Error fetching users:", userError)
          return
        }

        setPlayers(userData || [])

        // If we have 2 players, the game can start
        if (userData && userData.length === 2) {
          onGameStart()
        }
      }
    }

    fetchPlayers()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`room:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomCode}`,
        },
        (payload) => {
          fetchPlayers()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomCode, onGameStart])

  const handleJoin = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      // Check if room exists and has space
      const { data: roomData, error: roomError } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("room_code", roomCode)
        .single()

      if (roomError || !roomData) {
        setError("Room not found")
        setIsJoining(false)
        return
      }

      // Check how many players are in the room
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomData.id)

      if (playersError) {
        setError("Error checking room capacity")
        setIsJoining(false)
        return
      }

      if (playersData && playersData.length >= 2) {
        setError("Room is full")
        setIsJoining(false)
        return
      }

      // Create user
      const { data: userData, error: userError } = await supabase.from("users").insert([{ username }]).select().single()

      if (userError || !userData) {
        setError("Error creating user")
        setIsJoining(false)
        return
      }

      // Add player to room
      const playerNumber = playersData?.length === 0 ? 1 : 2
      const { error: playerError } = await supabase.from("players").insert([
        {
          user_id: userData.id,
          room_id: roomData.id,
          player_number: playerNumber,
          is_turn: playerNumber === 1, // First player gets first turn
        },
      ])

      if (playerError) {
        setError("Error joining room")
        setIsJoining(false)
        return
      }

      // If this is the second player, update room status to active
      if (playerNumber === 2) {
        await supabase.from("game_rooms").update({ status: "active" }).eq("id", roomData.id)
      }

      // Successfully joined
      localStorage.setItem("userId", userData.id)
      localStorage.setItem("playerNumber", playerNumber.toString())

      // Refresh players list
      setPlayers([...players, userData])
    } catch (err) {
      console.error("Error joining room:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Container className="max-w-md py-12">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Waiting Lobby</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Room Code</h2>
          <div className="flex items-center justify-center">
            <div className="bg-amber-100 px-4 py-2 rounded-md text-xl font-mono tracking-wider text-amber-800">
              {roomCode}
            </div>
          </div>
          <p className="text-sm text-center mt-2 text-amber-600">Share this code with your opponent</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Players ({players.length}/2)</h2>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div key={player.id} className="bg-amber-50 p-3 rounded-md flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${index === 0 ? "bg-teal-500" : "bg-purple-500"}`} />
                <span className="font-medium">
                  {player.username} (Player {index + 1})
                </span>
              </div>
            ))}

            {players.length < 2 && (
              <div className="bg-amber-50 p-3 rounded-md border-2 border-dashed border-amber-200 text-amber-400 text-center">
                Waiting for opponent...
              </div>
            )}
          </div>
        </div>

        {players.length < 2 && !localStorage.getItem("userId") && (
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-amber-700 mb-1">
                Your Name
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={handleJoin}
              disabled={isJoining || !username.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
          </div>
        )}

        {players.length === 2 && (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">All players have joined! Starting game...</p>
            <div className="animate-pulse">
              <div className="w-8 h-8 mx-auto border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
