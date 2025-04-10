"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowLeft, Trophy, Clock, Users } from "lucide-react"

export default function GameHistory() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = getSupabase()

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem("userId")

        if (!userId) {
          setError("Please log in to view your game history")
          setLoading(false)
          return
        }

        // Get all games the user has participated in
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("room_id, player_number")
          .eq("user_id", userId)

        if (playerError) {
          throw playerError
        }

        if (!playerData || playerData.length === 0) {
          setGames([])
          setLoading(false)
          return
        }

        // Get room details
        const roomIds = playerData.map((p) => p.room_id)
        const { data: roomData, error: roomError } = await supabase
          .from("game_rooms")
          .select("*")
          .in("id", roomIds)
          .order("created_at", { ascending: false })

        if (roomError) {
          throw roomError
        }

        // Get game states
        const { data: stateData, error: stateError } = await supabase
          .from("game_states")
          .select("*")
          .in("room_id", roomIds)

        if (stateError) {
          throw stateError
        }

        // Combine data
        const gameHistory = roomData.map((room) => {
          const playerInfo = playerData.find((p) => p.room_id === room.id)
          const gameState = stateData.find((s) => s.room_id === room.id)

          return {
            ...room,
            playerNumber: playerInfo?.player_number,
            isWinner: gameState?.winner === playerInfo?.player_number,
            gameState,
          }
        })

        setGames(gameHistory)
      } catch (err) {
        console.error("Error fetching game history:", err)
        setError("Failed to load game history")
      } finally {
        setLoading(false)
      }
    }

    fetchGameHistory()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-amber-800 ml-4">Game History</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
              <p>{error}</p>
              <Link href="/" className="mt-4 inline-block">
                <Button className="bg-amber-600 hover:bg-amber-700">Go to Home</Button>
              </Link>
            </div>
          ) : games.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-amber-800 text-lg mb-4">You haven't played any games yet.</p>
              <Link href="/game/new">
                <Button className="bg-amber-600 hover:bg-amber-700">Start a New Game</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-amber-100">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          game.status === "active"
                            ? "bg-green-500"
                            : game.status === "completed"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      ></div>
                      <h3 className="font-semibold text-lg text-amber-800">Game #{game.room_code}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-700">{formatDate(game.created_at)}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-amber-600 mr-2" />
                        <span className="text-amber-700">You played as Player {game.playerNumber}</span>
                      </div>

                      {game.status === "completed" && (
                        <div className={`flex items-center ${game.isWinner ? "text-green-600" : "text-amber-600"}`}>
                          {game.isWinner && <Trophy className="h-4 w-4 mr-1" />}
                          <span className="font-medium">
                            {game.isWinner ? "You won!" : `Player ${game.gameState?.winner} won`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-4">
                      <div className="text-sm text-amber-600">
                        Status: <span className="font-medium capitalize">{game.status}</span>
                      </div>

                      {game.status === "active" && (
                        <Link href={`/game/${game.room_code}`}>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                            Resume Game
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
