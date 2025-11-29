import { NextRequest, NextResponse } from 'next/server'
import { getTopScores, getAllTopScores, getPlayerScore, GAME_SNAKE, GAME_BOUNCE } from '@/lib/contract'
import { isAddress } from 'viem'

// Helper to convert game name to ID
function getGameId(gameId: string): number {
  switch (gameId) {
    case 'snake':
      return GAME_SNAKE
    case 'bounce':
      return GAME_BOUNCE
    default:
      throw new Error(`Invalid game ID: ${gameId}`)
  }
}

// GET - Retrieve leaderboard or user scores from on-chain contract
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const identifier = searchParams.get('identifier')
    const gameId = searchParams.get('gameId')
    const leaderboard = searchParams.get('leaderboard') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // If leaderboard is requested for a specific game
    if (leaderboard && gameId) {
      const gameIdNum = getGameId(gameId)
      const topScores = await getTopScores(gameIdNum, limit)
      
      const formatted = topScores.map((entry) => ({
        identifier: entry.player,
        score: entry.score,
      }))
      
      return NextResponse.json({ leaderboard: formatted })
    }

    // If leaderboard is requested for all games
    if (leaderboard) {
      const games = ['snake', 'bounce']
      const leaderboards: Record<string, Array<{ identifier: string; score: number }>> = {}

      for (const game of games) {
        const gameIdNum = getGameId(game)
        const topScores = await getTopScores(gameIdNum, limit)
        leaderboards[game] = topScores.map((entry) => ({
          identifier: entry.player,
          score: entry.score,
        }))
      }

      return NextResponse.json({ leaderboards })
    }

    // Get user's best score
    if (identifier) {
      // Check if identifier is a valid address
      if (!isAddress(identifier)) {
        return NextResponse.json(
          { error: 'Invalid address format' },
          { status: 400 }
        )
      }

      // If gameId is provided, get score for that specific game
      if (gameId) {
        const gameIdNum = getGameId(gameId)
        const score = await getPlayerScore(gameIdNum, identifier as `0x${string}`)
        return NextResponse.json({ score })
      }

      // Otherwise, get all scores for the user
      const games = ['snake', 'bounce']
      const scores: Record<string, number> = {}

      for (const game of games) {
        const gameIdNum = getGameId(game)
        scores[game] = await getPlayerScore(gameIdNum, identifier as `0x${string}`)
      }

      return NextResponse.json({ scores })
    }

    return NextResponse.json(
      { error: 'Either leaderboard=true or identifier is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Note: Scores should be submitted directly to the contract from the client
// This endpoint is kept for backwards compatibility but returns a message
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Scores must be submitted directly to the contract on-chain. Use writeContract from wagmi in the client.',
      contractAddress: process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS,
    },
    { status: 200 }
  )
}

