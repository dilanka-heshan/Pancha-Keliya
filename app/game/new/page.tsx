"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { getSupabase } from "@/lib/supabase"
import { initializeGameState } from "@/lib/game-utils"
import Link from "next/link"

export default function CreateGame() {
  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabase()
  
  // Check if user is logged in
  useEffect(() => {
    const checkUserAuth = async () => {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
        
        // Get username from Supabase
        try {
          const { data, error } = await supabase
            .from("users")
            .select("username")
            .eq("id", storedUserId)
            .single<{ username: string }>()
            
          if (data && !error) {
            setUsername(data.username)
          }
        } catch (err) {
          console.error("Error fetching user:", err)
        }
      }
      setIsLoading(false)
    }
    
    checkUserAuth()
  }, [supabase])

  const generateRoomCode = () => {
    // Generate a random 6-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
  
  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("playerNumber")
    setUserId(null)
    setUsername(null)
  }

  const createGame = async () => {
    setIsCreating(true)
    setError("")

    try {
      // Check if user is logged in
      const storedUserId = localStorage.getItem("userId") || userId
      
      if (!storedUserId) {
        throw new Error("You must be logged in to create a game")
      }

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
        .single<{ id: string; room_code: string; status: string }>()

      if (roomError || !roomData) {
        throw new Error("Failed to create game room")
      }

      // Initialize game state
      const initialState = initializeGameState(roomData.id)
      const { error: stateError } = await supabase.from("game_states").insert([initialState])

      if (stateError) {
        throw new Error("Failed to initialize game state")
      }
      
      // Add the current user as player 1
      const { error: playerError } = await supabase.from("players").insert([
        {
          user_id: storedUserId,
          room_id: roomData.id,
          player_number: 1,
          is_turn: true,
        },
      ])
      
      if (playerError) {
        throw new Error("Failed to join as player 1")
      }

      // Success - redirect to the game room
      setRoomCode(newRoomCode)
      router.push(`/game/${newRoomCode}`)
    } catch (err: any) {
      console.error("Error creating game:", err)
      setError(err.message || "Failed to create game. Please try again.")
      setIsCreating(false)
    }
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-amber-50 py-12">
        <Container className="max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-amber-700">Loading...</p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container className="max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Create New Game</h1>

          {userId ? (
            <>
              <div className="mb-6 bg-amber-50 p-4 rounded-lg">
                <p className="text-amber-700 text-center">
                  Logged in as <span className="font-semibold">{username}</span>
                </p>
                <Button 
                  onClick={handleLogout} 
                  variant="link" 
                  className="text-amber-600 w-full mt-2"
                >
                  Log out
                </Button>
              </div>
              
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
            </>
          ) : (
            <>
              <p className="text-amber-700 mb-6 text-center">
                Please log in with a username to create a game.
              </p>
              <Link href="/login" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 py-6 text-lg">
                  Log In
                </Button>
              </Link>
            </>
          )}

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
