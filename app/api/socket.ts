import { Server } from "socket.io"
import { type NextApiResponseWithSocket, type SocketRequest, GameEvents } from "@/lib/socket"
import { supabaseServer } from "@/lib/supabase"

export default function SocketHandler(req: SocketRequest, res: NextApiResponseWithSocket) {
  // Check if socket.io server is already running
  if (res.socket.server.io) {
    console.log("Socket is already running")
    res.end()
    return
  }

  console.log("Setting up socket")
  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  })
  res.socket.server.io = io

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Handle joining a room
    socket.on(GameEvents.JOIN_ROOM, async ({ roomCode }) => {
      try {
        // Join the socket.io room
        socket.join(roomCode)
        console.log(`Client ${socket.id} joined room ${roomCode}`)

        // Get room data
        const { data: roomData, error: roomError } = await supabaseServer
          .from("game_rooms")
          .select("*")
          .eq("room_code", roomCode)
          .single()

        if (roomError || !roomData) {
          socket.emit(GameEvents.ERROR, "Room not found")
          return
        }

        // Get game state
        const { data: gameState, error: stateError } = await supabaseServer
          .from("game_states")
          .select("*")
          .eq("room_id", roomData.id)
          .single()

        if (stateError || !gameState) {
          socket.emit(GameEvents.ERROR, "Game state not found")
          return
        }

        // Broadcast current game state to the room
        io.to(roomCode).emit(GameEvents.GAME_STATE_UPDATE, gameState)
      } catch (error) {
        console.error("Error joining room:", error)
        socket.emit(GameEvents.ERROR, "Failed to join room")
      }
    })

    // Handle game state updates
    socket.on(GameEvents.GAME_STATE_UPDATE, ({ roomCode, gameState }) => {
      // Broadcast to all clients in the room except sender
      socket.to(roomCode).emit(GameEvents.GAME_STATE_UPDATE, gameState)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  console.log("Socket server started")
  res.end()
}
