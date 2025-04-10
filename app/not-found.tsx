import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <Container className="max-w-md text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-amber-800">404</span>
          </div>

          <h1 className="text-2xl font-bold text-amber-800 mb-4">Page Not Found</h1>

          <p className="text-amber-700 mb-8">Oops! The page you're looking for doesn't exist or has been moved.</p>

          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </main>
  )
}
