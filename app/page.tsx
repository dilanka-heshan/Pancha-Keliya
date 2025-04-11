import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { BookOpen, History, User } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 py-12">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-4">Pancha Keliya</h1>
          <p className="text-lg text-amber-700 mb-8">
            A traditional Sri Lankan board game played during the Sinhala and Tamil New Year
          </p>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="mb-8">
              <img
                src="https://res.cloudinary.com/dyaleu8gi/image/upload/v1744316875/ChatGPT_Image_Apr_11_2025_01_57_25_AM_ks2lvt.png"
                alt="Pancha Keliya Game Board"
                className="mx-auto rounded-lg max-w-full h-auto"
              />
            </div>

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
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-amber-700">
              <h2 className="text-xl font-semibold mb-2">How to Play</h2>
              <ul className="text-left list-disc pl-6 space-y-1">
                <li>Each player has 4 pieces</li>
                <li>Roll cowrie shells to determine moves</li>
                <li>Rolls of 6, 5, or 1 grant an extra turn</li>
                <li>Land on opponent's piece to send it back</li>
                <li>First player to move all pieces home wins</li>
              </ul>

              <div className="mt-4 text-center">
                <Link href="/rules">
                  <Button variant="link" className="text-amber-600">
                    Read Full Rules
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
