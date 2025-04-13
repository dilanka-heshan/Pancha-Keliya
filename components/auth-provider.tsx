"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"

export interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {
    throw new Error("Not implemented")
  },
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabase()

  // Check for existing user session on mount
  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, username")
          .eq("id", userId)
          .single()

        if (data && !error) {
          setUser(data)
        } else {
          // Invalid user ID stored, clear it
          localStorage.removeItem("userId")
        }
      } catch (err) {
        console.error("Error loading user:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [supabase])

  // Login function
  const login = async (username: string): Promise<User> => {
    if (!username.trim()) {
      throw new Error("Username is required")
    }

    try {
      // Check if user exists
      let { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .single()

      let userData: User

      if (checkError || !existingUser) {
        // If user doesn't exist, create a new one
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([{ username: username.trim() }])
          .select("id, username")
          .single()

        if (createError || !newUser) {
          throw new Error("Failed to create user account")
        }

        userData = newUser as User
      } else {
        userData = existingUser as User
      }

      // Store user info in localStorage
      localStorage.setItem("userId", userData.id)
      setUser(userData)

      return userData
    } catch (err) {
      console.error("Login error:", err)
      throw err
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("playerNumber")
    setUser(null)
  }

  // Auth context value
  const contextValue = {
    user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
