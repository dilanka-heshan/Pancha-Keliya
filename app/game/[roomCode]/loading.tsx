import { Container } from "@/components/ui/container"

export default function Loading() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <Container className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-amber-800 mb-2">Loading Game</h2>
        <p className="text-amber-700">Please wait while we set up your Pancha Keliya game...</p>
      </Container>
    </div>
  )
}
