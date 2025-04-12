"use client"

import type { Token as TokenType, Player } from "@/lib/game-utils_n"

interface TokenProps {
  token: TokenType
  player: Player
  onClick: () => void
  isHighlighted: boolean
}

export default function Token({ token, player, onClick, isHighlighted }: TokenProps) {
  const colorClass = player.color === "red" ? "bg-[#f24822] hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"

  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-white cursor-pointer transition-all transform ${
        isHighlighted ? "ring-2 ring-yellow-400 animate-pulse scale-110" : ""
      } ${colorClass}`}
      onClick={onClick}
    >
      {(token.id % 4) + 1}
    </div>
  )
}
