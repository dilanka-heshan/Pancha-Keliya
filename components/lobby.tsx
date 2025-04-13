"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { getSupabase, type User } from "@/lib/supabase"
import Link from "next/link"

interface LobbyProps {
  roomCode: string
  onGameStart: () => void
}

export default function Lobby({ roomCode, onGameStart }: LobbyProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [players, setPlayers] = useState<User[]>([])
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = getSupabase()

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const userId = localStorage.getItem("userId")
      
      if (!userId) {
        // If no user id in localStorage, redirect to login
        router.push(`/login?returnTo=/game/${roomCode}`)
        return
      }
      
      // Get current user data
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()
          
        if (userError || !userData) {
          // User not found, clear localStorage and redirect
          localStorage.removeItem("userId")
          localStorage.removeItem("playerNumber")
          router.push(`/login?returnTo=/game/${roomCode}`)
          return
        }
        
        setCurrentUser(userData)
      } catch (err) {
        console.error("Error checking auth:", err)
      }
    }
    
    checkAuth()
  }, [roomCode, router, supabase])

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data: playersData, error } = await supabase
        .from("players")
        .select("user_id, player_number")
        .eq("room_id", roomCode);

      if (error) {
        console.error("Error fetching players:", error);
        return;
      }

      if (playersData && playersData.length > 0) {
        const userIds = playersData.map((player) => player.user_id);
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .in("id", userIds);

        if (userError) {
          console.error("Error fetching user details:", userError);
          return;
        }

        const playersWithDetails = playersData.map((player) => ({
          ...player,
          username: userData.find((user) => user.id === player.user_id)?.username || "Unknown",
        }));

        setPlayers(playersWithDetails);

        // If we have 2 players, the game can start
        if (playersWithDetails.length === 2) {
          onGameStart();
        }
      }
    };

    fetchPlayers();

    // Subscribe to player changes in this room
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
        () => {
          fetchPlayers(); // Fetch players on new player addition
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomCode, onGameStart, supabase])

  const handleJoin = async () => {
    if (!currentUser) {
      router.push(`/login?returnTo=/game/${roomCode}`)
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
      
      // Check if user already joined this room
      const existingPlayer = playersData?.find(player => player.user_id === currentUser.id)
      if (existingPlayer) {
        // User already joined, nothing to do
        setIsJoining(false)
        return
      }

      // Assign player number based on existing players
      const playerNumber = playersData.length === 0 ? 1 : 2

      // Add player to room
      const { error: playerError } = await supabase.from("players").insert([
        {
          user_id: currentUser.id,
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

      // Store player number in localStorage
      localStorage.setItem("playerNumber", playerNumber.toString())
    } catch (err) {
      console.error("Error joining room:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsJoining(false)
    }
  }

  // Automatic join if user is logged in and not joined yet
  useEffect(() => {
    if (currentUser && players.length < 2 && !players.some(p => p.id === currentUser.id)) {
      handleJoin()
    }
  }, [currentUser, players])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("playerNumber")
    router.push(`/login?returnTo=/game/${roomCode}`)
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
                  {currentUser?.id === player.id && " (You)"}
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

        {currentUser && (
          <div className="mb-4 bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700 text-center">
              Logged in as <span className="font-semibold">{currentUser.username}</span>
            </p>
            <Button 
              onClick={handleLogout} 
              variant="link" 
              className="text-amber-600 w-full mt-2"
            >
              Log out
            </Button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
