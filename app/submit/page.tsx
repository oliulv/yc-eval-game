import Link from 'next/link'
import SubmitForm from '@/components/SubmitForm'

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-mono text-gray-900 hover:text-gray-700">
              YC Eval Game
            </Link>
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-sm font-mono text-gray-700 hover:text-gray-900 border-b border-transparent hover:border-gray-300"
              >
                Home
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-mono text-gray-700 hover:text-gray-900 border-b border-transparent hover:border-gray-300"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-mono text-gray-900 mb-2 border-b border-gray-200 pb-2">
            Submit a Video
          </h1>
          <p className="text-sm font-mono text-gray-600">
            Add a new YC application video to the evaluation database
          </p>
        </div>

        <div className="border border-gray-200 rounded-sm p-6 bg-white">
          <SubmitForm />
        </div>
      </main>
    </div>
  )
}

