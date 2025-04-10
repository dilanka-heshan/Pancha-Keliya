"use client"

import { useState, useEffect } from "react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowLeft, Trophy, User, Clock, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Profile() {
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    winRate: 0,
    avgGameTime: 0,
  })
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabase()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get user ID from localStorage
        const storedUserId = localStorage.getItem("userId")

        if (!storedUserId) {
          setError("Please log in to view your profile")
          setIsLoading(false)
          return
        }

        setUserId(storedUserId)

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", storedUserId)
          .single()

        if (userError) {
          throw userError
        }

        setUsername(userData.username)

        // Get player stats
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("room_id, player_number")
          .eq("user_id", storedUserId)

        if (playerError) {
          throw playerError
        }

        if (!playerData || playerData.length === 0) {
          setStats({
            totalGames: 0,
            wins: 0,
            winRate: 0,
            avgGameTime: 0,
          })
          setIsLoading(false)
          return
        }

        // Get game states to calculate wins
        const roomIds = playerData.map((p) => p.room_id)
        const { data: stateData, error: stateError } = await supabase
          .from("game_states")
          .select("*")
          .in("room_id", roomIds)

        if (stateError) {
          throw stateError
        }

        // Get room data to calculate game times
        const { data: roomData, error: roomError } = await supabase.from("game_rooms").select("*").in("id", roomIds)

        if (roomError) {
          throw roomError
        }

        // Calculate stats
        const completedGames = roomData.filter((r) => r.status === "completed")
        const wins = stateData.filter((s) => {
          const player = playerData.find((p) => p.room_id === s.room_id)
          return s.winner === player?.player_number
        })

        const totalGames = playerData.length
        const winCount = wins.length
        const winRate = totalGames > 0 ? Math.round((winCount / totalGames) * 100) : 0

        // Calculate average game time (mock data for now)
        const avgGameTime = 15 // minutes

        setStats({
          totalGames,
          wins: winCount,
          winRate,
          avgGameTime,
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleUpdateProfile = async () => {
    if (!userId) return

    setIsSaving(true)
    setError("")

    try {
      const { error } = await supabase.from("users").update({ username }).eq("id", userId)

      if (error) {
        throw error
      }

      // Success message or redirect
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("playerNumber")
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-amber-800 ml-4">Your Profile</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
          ) : error && !userId ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
              <p>{error}</p>
              <Link href="/" className="mt-4 inline-block">
                <Button className="bg-amber-600 hover:bg-amber-700">Go to Home</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-amber-700" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-800">{username}</h2>
                    <p className="text-amber-600 text-sm">Player since {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-amber-700 mb-1">
                        Username
                      </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isSaving || !username.trim()}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {isSaving ? "Saving..." : "Update Profile"}
                    </Button>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-amber-600 text-amber-700 hover:bg-amber-50"
                    >
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-amber-800 mb-4">Game Statistics</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-2">
                        <BarChart className="h-5 w-5 text-amber-600 mr-2" />
                        <h3 className="font-medium text-amber-800">Total Games</h3>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{stats.totalGames}</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-5 w-5 text-amber-600 mr-2" />
                        <h3 className="font-medium text-amber-800">Wins</h3>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{stats.wins}</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-5 w-5 text-amber-600 mr-2" />
                        <h3 className="font-medium text-amber-800">Win Rate</h3>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{stats.winRate}%</p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-amber-600 mr-2" />
                        <h3 className="font-medium text-amber-800">Avg. Game Time</h3>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{stats.avgGameTime} min</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-amber-800 mb-4">Recent Activity</h2>

                  {stats.totalGames === 0 ? (
                    <div className="text-center py-6 text-amber-600">
                      <p>You haven't played any games yet.</p>
                      <Link href="/game/new" className="mt-4 inline-block">
                        <Button className="bg-amber-600 hover:bg-amber-700">Start Your First Game</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link href="/history" className="block">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700">View Full Game History</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
