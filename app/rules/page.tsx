import { Container } from "@/components/ui/container"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Rules() {
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
            <h1 className="text-3xl font-bold text-amber-800 ml-4">How to Play Pancha Keliya</h1>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="prose prose-amber max-w-none">
              <p className="lead text-lg text-amber-700">
                Pancha Keliya is a traditional Sri Lankan board game played during the Sinhala and Tamil New Year. It's
                a game of strategy and luck that has been enjoyed for generations.
              </p>

              <h2 className="text-2xl font-bold text-amber-800 mt-8 mb-4">Game Components</h2>
              <ul className="space-y-2">
                <li>
                  <strong>Game Board:</strong> A symmetrical board with a top "home" zone, two player zones in the
                  middle, and a path for pieces to move along.
                </li>
                <li>
                  <strong>Pieces:</strong> Each player has 4 pieces.
                </li>
                <li>
                  <strong>Cowrie Shells:</strong> Six cowrie shells are used to determine movement.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-amber-800 mt-8 mb-4">Rules of the Game</h2>

              <h3 className="text-xl font-semibold text-amber-800 mt-6 mb-2">Setup</h3>
              <p>
                Players begin on opposite sides of the bottom row. Each player has 4 pieces that start off the board.
              </p>

              <h3 className="text-xl font-semibold text-amber-800 mt-6 mb-2">Rolling Cowrie Shells</h3>
              <ul className="space-y-2">
                <li>The number of cowries facing up equals the move distance.</li>
                <li>
                  Rolls of <strong>6, 5, or 1</strong> grant an <strong>additional throw</strong>.
                </li>
                <li>
                  You must roll <strong>6, 5, or 1</strong> to enter a piece onto the board.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-amber-800 mt-6 mb-2">Movement</h3>
              <ul className="space-y-2">
                <li>
                  A roll must be used <strong>completely</strong> by a single piece.
                </li>
                <li>A piece cannot split a move across two tokens.</li>
                <li>A player can have multiple pieces on the board.</li>
                <li>Pieces move around the board in a clockwise direction.</li>
              </ul>

              <h3 className="text-xl font-semibold text-amber-800 mt-6 mb-2">Knocking Out</h3>
              <ul className="space-y-2">
                <li>
                  If a player's piece lands on a square occupied by an opponent's piece, the opponent's piece is{" "}
                  <strong>sent back to start</strong>.
                </li>
                <li>
                  Pieces on <strong>marked/safe squares</strong> are immune to being knocked out.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-amber-800 mt-6 mb-2">Winning</h3>
              <ul className="space-y-2">
                <li>To exit the board, a piece must land exactly one square beyond the final square.</li>
                <li>
                  The <strong>first player</strong> to remove all 4 pieces from the board <strong>wins</strong>.
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-amber-800 mt-8 mb-4">Strategy Tips</h2>
              <ul className="space-y-2">
                <li>Try to get multiple pieces on the board early to increase your options.</li>
                <li>Use the safe squares strategically to protect your pieces.</li>
                <li>When possible, knock out your opponent's pieces to slow their progress.</li>
                <li>Remember that rolls of 6, 5, or 1 give you an extra turn - use these opportunities wisely!</li>
              </ul>

              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Cultural Significance</h3>
                <p className="text-amber-700">
                  Pancha Keliya is traditionally played during the Sinhala and Tamil New Year celebrations in Sri Lanka.
                  It brings families together and is a way to pass down cultural traditions to younger generations.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/game/new">
                <Button className="bg-amber-600 hover:bg-amber-700 text-lg px-6 py-2">Start Playing Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
