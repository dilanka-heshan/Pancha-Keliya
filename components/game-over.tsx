"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Home, RotateCcw } from "lucide-react"

interface GameOverProps {
  winner: 1 | 2
  playerNumber: 1 | 2 | null
}

export default function GameOver({ winner, playerNumber }: GameOverProps) {
  const isWinner = playerNumber === winner

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Trophy className="h-10 w-10 text-amber-600" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-amber-800 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Game Over
          </motion.h2>

          <motion.p
            className={`text-xl font-medium mb-6 ${isWinner ? "text-green-600" : "text-amber-700"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isWinner ? "Congratulations! You won!" : `Player ${winner} wins!`}
          </motion.p>

          <div className="grid gap-4">
            <Link href="/game/new">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                <RotateCcw className="mr-2 h-4 w-4" /> Play Again
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50">
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
