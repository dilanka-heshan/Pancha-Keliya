"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
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
            .single()
            
          if (data && !error) {
            setUsername(data.username as string)
          }
        } catch (err) {
          console.error("Error fetching user:", err)
        }
      }
      setIsLoading(false)
    }
    
    checkUserAuth()
  }, [supabase])
  
  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("playerNumber")
    setUserId(null)
    setUsername(null)
  }

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }
    
    if (!userId) {
      router.push(`/login?returnTo=/game/join`)
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
        .eq("room_id", data.id as string)

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
          <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Join Game</h1>

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
            </>
          ) : (
            <>
              <p className="text-amber-700 mb-6 text-center">
                Please log in with a username to join a game.
              </p>
              <Link href="/login?returnTo=/game/join" className="block">
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
