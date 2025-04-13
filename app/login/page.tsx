"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { getSupabase } from "@/lib/supabase"
import Link from "next/link"

export default function Login() {
  const [username, setUsername] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = getSupabase()

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsLoggingIn(true)
    setError("")

    try {
      // Check if user exists
      let { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .single()

      let userId: string

      if (checkError || !existingUser) {
        // If user doesn't exist, create a new one
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([{ username: username.trim() }])
          .select()
          .single()

        if (createError || !newUser) {
          throw new Error("Failed to create user account")
        }

        userId = newUser.id
      } else {
        userId = existingUser.id
      }

      // Store user info in localStorage
      localStorage.setItem("userId", userId)

      // Redirect to homepage or previous page
      const returnPath = new URLSearchParams(window.location.search).get("returnTo") || "/"
      router.push(returnPath)
    } catch (err: any) {
      console.error("Error during login:", err)
      setError(err.message || "An error occurred during login")
      setIsLoggingIn(false)
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container className="max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">Log In</h1>

          <p className="text-amber-700 mb-6 text-center">
            Enter your username to continue or create a new account.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-amber-700 mb-1">
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>}

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || !username.trim()}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {isLoggingIn ? "Logging in..." : "Continue"}
            </Button>

            <div className="text-center">
              <Button variant="link" onClick={() => router.push("/")} className="text-amber-600">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
