import { createPublicClient, createWalletClient, http, type Address } from 'viem'
import { monadTestnet } from 'viem/chains'

// Contract ABI
export const LEADERBOARD_ABI = [
  {
    inputs: [
      { internalType: 'uint8', name: 'gameId', type: 'uint8' },
      { internalType: 'uint256', name: 'score', type: 'uint256' },
    ],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'gameId', type: 'uint8' },
      { internalType: 'address', name: 'player', type: 'address' },
    ],
    name: 'getPlayerScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'gameId', type: 'uint8' },
      { internalType: 'uint256', name: 'count', type: 'uint256' },
    ],
    name: 'getTopScores',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct Leaderboard.Score[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'gameId', type: 'uint8' }],
    name: 'getAllTopScores',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct Leaderboard.Score[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Game IDs
export const GAME_SNAKE = 0
export const GAME_BOUNCE = 1

// Contract address - using burn address
export const LEADERBOARD_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS ||
  '0x8be5a176ff441425321d21df3821a222e62a16b0') as Address

// Create public client for reading
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})

// Helper function to get top scores from contract
export async function getTopScores(gameId: number, count: number = 10) {
  try {
    const scores = await publicClient.readContract({
      address: LEADERBOARD_CONTRACT_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'getTopScores',
      args: [gameId as 0 | 1, BigInt(count)],
    })

    return scores.map((score) => ({
      player: score.player.toLowerCase(),
      score: Number(score.score),
      timestamp: Number(score.timestamp),
    }))
  } catch (error) {
    console.error('Error fetching top scores from contract:', error)
    return []
  }
}

// Helper function to get all top scores
export async function getAllTopScores(gameId: number) {
  try {
    const scores = await publicClient.readContract({
      address: LEADERBOARD_CONTRACT_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'getAllTopScores',
      args: [gameId as 0 | 1],
    })

    return scores.map((score) => ({
      player: score.player.toLowerCase(),
      score: Number(score.score),
      timestamp: Number(score.timestamp),
    }))
  } catch (error) {
    console.error('Error fetching all top scores from contract:', error)
    return []
  }
}

// Helper function to get player's best score
export async function getPlayerScore(gameId: number, playerAddress: Address) {
  try {
    const score = await publicClient.readContract({
      address: LEADERBOARD_CONTRACT_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'getPlayerScore',
      args: [gameId as 0 | 1, playerAddress],
    })

    return Number(score)
  } catch (error) {
    console.error('Error fetching player score from contract:', error)
    return 0
  }
}

