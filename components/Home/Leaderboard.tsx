'use client'

import { useEffect, useState } from 'react'

type LeaderboardEntry = {
  identifier: string
  score: number
}

type Leaderboards = {
  snake: LeaderboardEntry[]
  bounce: LeaderboardEntry[]
}

const gameInfo: Record<string, { name: string; icon: string; color: string }> = {
  snake: {
    name: 'Snake',
    icon: '🐍',
    color: 'bg-neo-green',
  },
  bounce: {
    name: 'Bounce Classic',
    icon: '⚽',
    color: 'bg-neo-blue',
  },
}

function formatIdentifier(identifier: string): string {
  // If it's a wallet address, format it
  if (identifier.startsWith('0x') && identifier.length === 42) {
    return `${identifier.slice(0, 6)}…${identifier.slice(-4)}`
  }
  // If it's a FID, show as "User {fid}"
  if (/^\d+$/.test(identifier)) {
    return `User ${identifier}`
  }
  // Otherwise, truncate if too long
  if (identifier.length > 12) {
    return `${identifier.slice(0, 8)}…`
  }
  return identifier
}

export function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState<Leaderboards>({ snake: [], bounce: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/scores?leaderboard=true&limit=5')
        if (response.ok) {
          const data = await response.json()
          setLeaderboards(data.leaderboards || { snake: [], bounce: [] })
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="border-4 border-black p-6 bg-neo-yellow neobrutal-shadow">
        <h2 className="text-2xl font-black text-left mb-4 uppercase">
          Leaderboard
        </h2>
        <p className="text-sm font-bold">Loading...</p>
      </div>
    )
  }

  const hasAnyScores = leaderboards.snake.length > 0 || leaderboards.bounce.length > 0

  return (
    <div className="border-4 border-black p-6 bg-neo-yellow neobrutal-shadow">
      <h2 className="text-2xl font-black text-left mb-4 uppercase">
        Leaderboard
      </h2>
      {!hasAnyScores ? (
        <p className="text-sm font-bold text-gray-700">
          No scores yet. Be the first to play!
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(leaderboards).map(([gameId, entries]) => {
            const game = gameInfo[gameId]
            if (!game || entries.length === 0) return null
            
            return (
              <div key={gameId} className="space-y-2">
                <div className={`${game.color} border-4 border-black p-3 flex items-center space-x-2`}>
                  <span className="text-2xl">{game.icon}</span>
                  <h3 className="text-lg font-black">{game.name}</h3>
                </div>
                <div className="space-y-1">
                  {entries.map((entry, index) => (
                    <div
                      key={`${gameId}-${entry.identifier}-${index}`}
                      className="bg-white border-2 border-black p-2 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-gray-600 w-6">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-bold">
                          {formatIdentifier(entry.identifier)}
                        </span>
                      </div>
                      <span className="text-sm font-black">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

