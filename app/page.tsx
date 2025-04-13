"use client"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import Link from "next/link"
import { BookOpen, Trophy, History, HelpCircle, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { user, isLoading, logout } = useAuth()

  return (
    <main className="min-h-screen bg-amber-50">
      <div
        className="relative bg-amber-800 text-white py-32 px-6 mb-12"
        style={{
          backgroundImage: "url('/hero-pattern.png')",
          backgroundBlendMode: "multiply",
        }}
      >
        <Container>
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pancha Keliya</h1>
            <p className="text-xl mb-6">
              A traditional Sri Lankan board game that has been played for centuries.
            </p>
            
            {isLoading ? (
              <div className="animate-pulse bg-amber-700/30 h-10 w-32 rounded"></div>
            ) : user ? (
              <div className="bg-amber-700/30 py-2 px-4 rounded mb-4 flex justify-between items-center">
                <div>
                  <span className="text-amber-200 text-sm">Logged in as</span>
                  <p className="font-medium">{user.username}</p>
                </div>
                <Button 
                  onClick={logout}
                  variant="outline" 
                  className="text-white border-white hover:bg-amber-700/50"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button 
                  className="bg-white text-amber-800 hover:bg-amber-100"
                >
                  <User className="h-4 w-4 mr-2" /> Log In
                </Button>
              </Link>
            )}
          </div>
        </Container>
      </div>

      <Container className="mb-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">Play Now</h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-md mx-auto mb-8">
              <Link href="/game/new" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6">Create Game</Button>
              </Link>

              <Link href="/game/join" className="block">
                <Button
                  variant="outline"
                  className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 text-lg py-6"
                >
                  Join Game
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
              <Link href="/rules" className="block">
                <Button variant="ghost" className="w-full text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                  <BookOpen className="mr-2 h-4 w-4" /> How to Play
                </Button>
              </Link>

              <Link href="/history" className="block">
                <Button variant="ghost" className="w-full text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                  <History className="mr-2 h-4 w-4" /> Game History
                </Button>
              </Link>

              <Link href="/profile" className="block">
                <Button variant="ghost" className="w-full text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                  <Trophy className="mr-2 h-4 w-4" /> View Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-amber-800 mb-3">About Pancha Keliya</h3>
            <p className="text-amber-700 mb-4">
              Pancha Keliya is a traditional Sri Lankan board game that combines strategy, skill, and a bit of luck.
              Players move their pieces around the board based on the throw of cowrie shells, aiming to be the first to
              complete the circuit.
            </p>
            <div className="border-t border-amber-100 pt-4">
              <Link href="/about" className="text-amber-600 hover:text-amber-800 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" /> Learn more about the game history
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
