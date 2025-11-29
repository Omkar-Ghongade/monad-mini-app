import { NextRequest, NextResponse } from 'next/server'
import { distributeRewardsAndResetAll, getTimeUntilNextReward, getContractBalance } from '@/lib/contract'

// Verify the request is from Vercel Cron (optional but recommended)
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if set
    if (process.env.CRON_SECRET && !verifyCronRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const timeUntilNext = await getTimeUntilNextReward()
    
    // Check if enough time has passed (with 10 second buffer for safety)
    if (timeUntilNext > 10) {
      return NextResponse.json({
        message: 'Reward interval not met yet',
        timeUntilNext,
        timestamp: new Date().toISOString(),
      })
    }

    const contractBalance = await getContractBalance()
    const rewardAmount = BigInt('500000000000000000') // 0.5 MON = 0.5 * 10^18
    const totalRequired = rewardAmount * BigInt(2) // Need 0.5 MON for each game

    // Check if contract has enough balance for both games
    if (contractBalance < totalRequired) {
      return NextResponse.json({
        message: 'Insufficient contract balance',
        contractBalance: contractBalance.toString(),
        requiredAmount: totalRequired.toString(),
        timestamp: new Date().toISOString(),
      }, { status: 400 })
    }

    // Distribute rewards and reset all leaderboards in a single transaction
    try {
      const txHash = await distributeRewardsAndResetAll()
      
      return NextResponse.json({
        message: 'Reward distribution completed',
        transactionHash: txHash,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        message: 'Failed to distribute rewards',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in reward cron job:', error)
    return NextResponse.json(
      {
        error: 'Failed to process reward distribution',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

