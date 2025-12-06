'use client'

import { useEffect, useState } from 'react'
import type { ModelStats } from '@/types'

export default function Leaderboard() {
  const [stats, setStats] = useState<ModelStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data.stats || [])
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 font-mono text-gray-500">
        Loading leaderboard...
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 font-mono text-gray-500">
        No predictions yet. Make some predictions to see the leaderboard!
      </div>
    )
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-mono text-sm text-gray-600">Rank</th>
            <th className="text-left py-3 px-4 font-mono text-sm text-gray-600">Model</th>
            <th className="text-right py-3 px-4 font-mono text-sm text-gray-600">Accuracy</th>
            <th className="text-right py-3 px-4 font-mono text-sm text-gray-600">Correct</th>
            <th className="text-right py-3 px-4 font-mono text-sm text-gray-600">Total</th>
            <th className="text-right py-3 px-4 font-mono text-sm text-gray-600">Avg Time</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr
              key={stat.model_name}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 font-mono text-sm text-gray-500">
                #{index + 1}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-gray-900">
                {stat.model_name}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-right">
                <span className={stat.accuracy >= 70 ? 'text-green-600' : stat.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                  {stat.accuracy.toFixed(1)}%
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-sm text-right text-gray-700">
                {stat.correct_predictions}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-right text-gray-700">
                {stat.total_predictions}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-right text-gray-500">
                {Math.round(stat.avg_response_time)}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

