"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rollCowries, getsExtraTurn } from "@/lib/game-utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface CowrieRollerProps {
  onRoll: (value: number) => void
  disabled?: boolean
}

export default function CowrieRoller({ onRoll, disabled = false }: CowrieRollerProps) {
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [cowrieStates, setCowrieStates] = useState<boolean[]>(Array(6).fill(false))
  const [showExtraTurn, setShowExtraTurn] = useState(false)

  const handleRoll = () => {
    if (disabled || rolling) return

    setRolling(true)
    setResult(null)

    // Animate the cowries
    const animationDuration = 1500
    const intervalTime = 100
    let elapsed = 0

    const interval = setInterval(() => {
      // Randomly flip cowries during animation
      setCowrieStates(
        Array(6)
          .fill(0)
          .map(() => Math.random() > 0.5),
      )

      elapsed += intervalTime

      if (elapsed >= animationDuration) {
        clearInterval(interval)

        // Final result
        const roll = rollCowries()
        const finalCowrieStates = Array(6)
          .fill(false)
          .map((_, i) => i < roll)

        setCowrieStates(finalCowrieStates)
        setResult(roll)
        setRolling(false)

        // Check if roll gives extra turn
        const extraTurn = getsExtraTurn(roll)
        setShowExtraTurn(extraTurn)

        onRoll(roll)
      }
    }, intervalTime)
  }

  // Reset extra turn message after a delay
  useEffect(() => {
    if (showExtraTurn) {
      const timer = setTimeout(() => setShowExtraTurn(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showExtraTurn])

  return (
    <div className="flex flex-col items-center p-6 bg-amber-50 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-amber-800 mb-4">Cowrie Shells</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {cowrieStates.map((isUp, index) => (
          <motion.div
            key={index}
            className={`w-14 h-10 rounded-full border-2 ${
              isUp ? "bg-amber-100 border-amber-300" : "bg-amber-700 border-amber-900"
            } shadow-md`}
            animate={{
              rotateX: isUp ? 0 : 180,
              backgroundColor: isUp ? "#fef3c7" : "#b45309",
              borderColor: isUp ? "#d97706" : "#78350f",
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: index * 0.05, // Stagger the animations
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 text-center"
          >
            <motion.p
              className="text-2xl font-bold text-amber-800"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              Result: {result}
            </motion.p>

            <AnimatePresence>
              {showExtraTurn && (
                <motion.p
                  className="text-sm font-medium text-amber-600 mt-2 bg-amber-100 px-3 py-1 rounded-full inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.3 }}
                >
                  You get an extra turn!
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleRoll}
        disabled={disabled || rolling}
        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 text-base"
      >
        {rolling ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rolling...
          </span>
        ) : (
          "Roll Cowries"
        )}
      </Button>
    </div>
  )
}
