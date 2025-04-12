// Types for the game state
export type PlayerColor = "red" | "blue"

export type TokenStatus = "home" | "playing" | "finished"

export type Token = {
  id: number
  position: number
  status: TokenStatus
  pathPosition: number // Position in the player's path (0-77)
}

export type Player = {
  id: string
  name: string
  color: PlayerColor
  tokens: Token[]
  isActive: boolean
}

export type GameState = {
  players: Player[]
  currentPlayerIndex: number
  diceValue: number | null
  diceRolled: boolean
  gameOver: boolean
  winner: Player | null
  lastMove: {
    tokenId: number | null
    from: number | null
    to: number | null
    knockout: boolean
  }
}

// Constants
export const BOARD_SIZE = 156 // Total number of cells (1-155)
export const PATH_LENGTH = 78
export const TOKENS_PER_PLAYER = 4
export const SAFE_CELLS = [
  6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138, 144,
]

// Player paths
export const PLAYER_PATHS = {
  red: {
    // Player 1 path
    startCell: 1,
    homeCells: [1, 2, 3, 4, 5, 6],
    path: [
      // Full path for player 1 (cells 1-78)
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    ],
  },
  blue: {
    // Player 2 path
    startCell: 79,
    homeCells: [79, 80, 81, 82, 83, 84],
    path: [
      // Full path for player 2 (cells 79-155 and mapping to shared cells)
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
      106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
      129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
      152, 153, 154, 155,
    ],
  },
}

// Initialize a new game state
export function initializeGame(player1: { id: string; name: string; color: PlayerColor }): GameState {
  const player1Tokens = Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: i,
    position: -1, // Not on board yet
    status: "home" as TokenStatus,
    pathPosition: -1,
  }))

  return {
    players: [
      {
        id: player1.id,
        name: player1.name,
        color: player1.color,
        tokens: player1Tokens,
        isActive: true,
      },
    ],
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    gameOver: false,
    winner: null,
    lastMove: {
      tokenId: null,
      from: null,
      to: null,
      knockout: false,
    },
  }
}

// Add a second player to the game
export function addSecondPlayer(
  gameState: GameState,
  player2: { id: string; name: string; color: PlayerColor },
): GameState {
  const player2Tokens = Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: i + TOKENS_PER_PLAYER,
    position: -1, // Not on board yet
    status: "home" as TokenStatus,
    pathPosition: -1,
  }))

  return {
    ...gameState,
    players: [
      ...gameState.players,
      {
        id: player2.id,
        name: player2.name,
        color: player2.color,
        tokens: player2Tokens,
        isActive: false,
      },
    ],
  }
}

// Roll the dice
export function rollDice(gameState: GameState): GameState {
  const diceValue = Math.floor(Math.random() * 6) + 1

  return {
    ...gameState,
    diceValue,
    diceRolled: true,
  }
}

// Get the board position from a player's path position
export function getPositionFromPath(player: Player, pathPosition: number): number {
  if (pathPosition < 0) return -1
  if (pathPosition >= PATH_LENGTH) return -1

  const path = PLAYER_PATHS[player.color].path
  return path[pathPosition]
}

// Check if a move is valid
export function isValidMove(gameState: GameState, tokenId: number): boolean {
  const { players, currentPlayerIndex, diceValue, diceRolled } = gameState
  if (!diceRolled || diceValue === null) return false

  const currentPlayer = players[currentPlayerIndex]
  const token = currentPlayer.tokens.find((t) => t.id === tokenId)
  if (!token) return false

  // If token is already finished, it can't move
  if (token.status === "finished") return false

  // If token is at home, it can only enter with a 1 or 5
  if (token.status === "home" && diceValue !== 1 && diceValue !== 5) return false

  // If token is playing, check if the move would exceed the path length
  if (token.status === "playing" && token.pathPosition + diceValue >= PATH_LENGTH) {
    // The token must land exactly on the last cell
    return token.pathPosition + diceValue === PATH_LENGTH - 1
  }

  return true
}

// Move a token
export function moveToken(gameState: GameState, tokenId: number): GameState {
  if (!isValidMove(gameState, tokenId)) return gameState

  const { players, currentPlayerIndex, diceValue } = gameState
  const currentPlayer = { ...players[currentPlayerIndex] }
  const tokenIndex = currentPlayer.tokens.findIndex((t) => t.id === tokenId)
  const token = { ...currentPlayer.tokens[tokenIndex] }

  // Store the previous position for animation
  const fromPosition = token.position

  // Update token status and position
  if (token.status === "home") {
    token.status = "playing"
    token.pathPosition = 0
    token.position = getPositionFromPath(currentPlayer, 0)
  } else {
    token.pathPosition += diceValue!
    token.position = getPositionFromPath(currentPlayer, token.pathPosition)

    // Check if token has finished
    if (token.pathPosition === PATH_LENGTH - 1) {
      token.status = "finished"
    }
  }

  // Update the player's tokens
  const updatedTokens = [...currentPlayer.tokens]
  updatedTokens[tokenIndex] = token
  currentPlayer.tokens = updatedTokens

  // Check for knockouts
  let knockout = false
  let updatedPlayers = [...players]
  updatedPlayers[currentPlayerIndex] = currentPlayer

  // Only check for knockouts if the token is still playing
  if (token.status === "playing") {
    // Check if the token landed on an opponent's token
    const opponentIndex = 1 - currentPlayerIndex // Toggle between 0 and 1
    if (opponentIndex >= 0 && opponentIndex < players.length) {
      const opponent = { ...players[opponentIndex] }

      // Check if the token landed on a safe cell
      const isSafeCell = SAFE_CELLS.includes(token.position)

      if (!isSafeCell) {
        const knockedTokenIndex = opponent.tokens.findIndex(
          (t) => t.status === "playing" && t.position === token.position,
        )

        if (knockedTokenIndex !== -1) {
          // Knock out the opponent's token
          const knockedToken = { ...opponent.tokens[knockedTokenIndex] }
          knockedToken.status = "home"
          knockedToken.pathPosition = -1
          knockedToken.position = -1

          const updatedOpponentTokens = [...opponent.tokens]
          updatedOpponentTokens[knockedTokenIndex] = knockedToken
          opponent.tokens = updatedOpponentTokens

          updatedPlayers[opponentIndex] = opponent
          knockout = true
        }
      }
    }
  }

  // Check if the game is over
  let gameOver = false
  let winner = null

  if (currentPlayer.tokens.every((t) => t.status === "finished")) {
    gameOver = true
    winner = currentPlayer
  }

  // Determine next player (if rolled 6, same player goes again)
  let nextPlayerIndex = currentPlayerIndex
  if (diceValue !== 6) {
    nextPlayerIndex = (currentPlayerIndex + 1) % players.length
  }

  // Update player active status
  updatedPlayers = updatedPlayers.map((player, index) => ({
    ...player,
    isActive: index === nextPlayerIndex,
  }))

  return {
    ...gameState,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    diceRolled: false,
    diceValue: null,
    gameOver,
    winner,
    lastMove: {
      tokenId,
      from: fromPosition,
      to: token.position,
      knockout,
    },
  }
}

// Get available moves for the current player
export function getAvailableMoves(gameState: GameState): number[] {
  const { players, currentPlayerIndex, diceValue, diceRolled } = gameState
  if (!diceRolled || diceValue === null) return []

  const currentPlayer = players[currentPlayerIndex]

  return currentPlayer.tokens.filter((token) => isValidMove(gameState, token.id)).map((token) => token.id)
}

// Check if the current player can make any moves
export function canMakeMove(gameState: GameState): boolean {
  return getAvailableMoves(gameState).length > 0
}

// Skip turn if no moves are available
export function skipTurn(gameState: GameState): GameState {
  if (canMakeMove(gameState)) return gameState

  const { players, currentPlayerIndex } = gameState
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length

  // Update player active status
  const updatedPlayers = players.map((player, index) => ({
    ...player,
    isActive: index === nextPlayerIndex,
  }))

  return {
    ...gameState,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    diceRolled: false,
    diceValue: null,
  }
}
