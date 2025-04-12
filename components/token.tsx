// "use client"

// import { cn } from "@/lib/utils"
// import { motion } from "framer-motion"
// import { useState, useEffect } from "react"

// interface TokenProps {
//   pieceId: number
//   playerNumber: 1 | 2
//   position: number
//   isSelectable?: boolean
//   onClick: () => void
//   previousPosition?: number
// }

// export default function Token({
//   pieceId,
//   playerNumber,
//   position,
//   isSelectable = false,
//   onClick,
//   previousPosition,
// }: TokenProps) {
//   const [hasAnimated, setHasAnimated] = useState(false)
//   const [showPulse, setShowPulse] = useState(false)

//   // Token colors based on player
//   const playerColors = {
//     1: {
//       bg: "bg-teal-500",
//       border: "border-teal-700",
//       hover: "hover:bg-teal-400",
//       shadow: "shadow-teal-700/50",
//       pulse: "bg-teal-300",
//     },
//     2: {
//       bg: "bg-purple-500",
//       border: "border-purple-700",
//       hover: "hover:bg-purple-400",
//       shadow: "shadow-purple-700/50",
//       pulse: "bg-purple-300",
//     },
//   }

//   const colors = playerColors[playerNumber]

//   // Determine if this is a new piece entering the board
//   const isEnteringBoard = previousPosition === -1 && position >= 0

//   // Determine if this piece was knocked out
//   const wasKnockedOut = previousPosition !== undefined && previousPosition >= 0 && position === -1

//   // Show pulse effect when piece is selectable
//   useEffect(() => {
//     if (isSelectable) {
//       setShowPulse(true)
//       const timer = setTimeout(() => setShowPulse(false), 2000)
//       return () => clearTimeout(timer)
//     }
//   }, [isSelectable])

//   // Animation variants
//   const variants = {
//     initial: {
//       scale: isEnteringBoard ? 0.5 : wasKnockedOut ? 1 : 0.9,
//       opacity: isEnteringBoard ? 0 : 1,
//       y: isEnteringBoard ? 20 : 0,
//     },
//     animate: {
//       scale: wasKnockedOut ? 0.5 : 1,
//       opacity: wasKnockedOut ? 0 : 1,
//       y: wasKnockedOut ? 20 : 0,
//     },
//     hover: {
//       scale: isSelectable ? 1.1 : 1,
//       boxShadow: isSelectable ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
//     },
//     tap: {
//       scale: isSelectable ? 0.95 : 1,
//     },
//   }

//   return (
//     <div className="relative">
//       {showPulse && (
//         <motion.div
//           className={cn("absolute inset-0 rounded-full", colors.pulse)}
//           initial={{ scale: 1, opacity: 0.7 }}
//           animate={{ scale: 1.5, opacity: 0 }}
//           transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
//         />
//       )}
//       <motion.div
//         className={cn(
//           "w-6 h-6 rounded-full border-2",
//           colors.bg,
//           colors.border,
//           isSelectable && colors.hover,
//           isSelectable ? "cursor-pointer" : "cursor-default",
//           "flex items-center justify-center text-white text-xs font-bold shadow-md",
//           colors.shadow,
//         )}
//         onClick={onClick}
//         initial="initial"
//         animate="animate"
//         whileHover="hover"
//         whileTap="tap"
//         variants={variants}
//         transition={{
//           type: "spring",
//           stiffness: 300,
//           damping: 20,
//           delay: isEnteringBoard ? 0.2 : 0,
//         }}
//         onAnimationComplete={() => setHasAnimated(true)}
//         layout
//       >
//         {pieceId}
//       </motion.div>
//     </div>
//   )
// }

"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface TokenProps {
  pieceId: number
  playerNumber: 1 | 2
  position: number
  isSelectable?: boolean
  onClick: () => void
  previousPosition?: number
}

export default function Token({
  pieceId,
  playerNumber,
  position,
  isSelectable = false,
  onClick,
  previousPosition,
}: TokenProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  // Token colors based on player
  const playerColors = {
    1: {
      bg: "bg-teal-500",
      border: "border-teal-700",
      hover: "hover:bg-teal-400",
      shadow: "shadow-teal-700/50",
      pulse: "bg-teal-300",
    },
    2: {
      bg: "bg-purple-500",
      border: "border-purple-700",
      hover: "hover:bg-purple-400",
      shadow: "shadow-purple-700/50",
      pulse: "bg-purple-300",
    },
  }

  const colors = playerColors[playerNumber]

  // Determine if this is a new piece entering the board
  const isEnteringBoard = previousPosition === -1 && position >= 0

  // Determine if this piece was knocked out
  const wasKnockedOut = previousPosition !== undefined && previousPosition >= 0 && position === -1

  // Show pulse effect when piece is selectable
  useEffect(() => {
    if (isSelectable) {
      setShowPulse(true)
      const timer = setTimeout(() => setShowPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSelectable])

  // Animation variants
  const variants = {
    initial: {
      scale: isEnteringBoard ? 0.5 : wasKnockedOut ? 1 : 0.9,
      opacity: isEnteringBoard ? 0 : 1,
      y: isEnteringBoard ? 20 : 0,
    },
    animate: {
      scale: wasKnockedOut ? 0.5 : 1,
      opacity: wasKnockedOut ? 0 : 1,
      y: wasKnockedOut ? 20 : 0,
    },
    hover: {
      scale: isSelectable ? 1.1 : 1,
      boxShadow: isSelectable ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
    },
    tap: {
      scale: isSelectable ? 0.95 : 1,
    },
  }

  return (
    <div className="relative">
      {/* Enhanced pulse animation for selectable pieces */}
      {showPulse && (
        <motion.div
          className={cn("absolute inset-0 rounded-full", colors.pulse)}
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
      )}
      {isSelectable && (
        <motion.div
          className={cn("absolute inset-0 rounded-full", "ring-2 ring-yellow-400")}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
      )}
      <motion.div
        className={cn(
          "w-6 h-6 rounded-full border-2",
          colors.bg,
          colors.border,
          isSelectable && colors.hover,
          isSelectable ? "cursor-pointer" : "cursor-default",
          "flex items-center justify-center text-white text-xs font-bold shadow-md",
          colors.shadow,
        )}
        onClick={onClick}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: isEnteringBoard ? 0.2 : 0,
        }}
        onAnimationComplete={() => setHasAnimated(true)}
        layout
      >
        {pieceId}
      </motion.div>
    </div>
  )
}