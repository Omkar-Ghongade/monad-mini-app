import { NextRequest, NextResponse } from 'next/server'

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
}

interface TwitterResponse {
  data?: TwitterTweet[]
  meta?: {
    result_count: number
  }
  errors?: Array<{ message: string }>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    )
  }

  // Remove @ if present
  const cleanUsername = username.replace('@', '')

  const bearerToken = process.env.TWITTER_BEARER_TOKEN

  if (!bearerToken) {
    return NextResponse.json(
      { 
        error: 'Twitter API not configured',
        message: 'Please set TWITTER_BEARER_TOKEN environment variable'
      },
      { status: 500 }
    )
  }

  try {
    // First, get the user ID from username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanUsername}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )

    if (!userResponse.ok) {
      const errorData = await userResponse.json()
      return NextResponse.json(
        { error: 'Failed to fetch user', details: errorData },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    const userId = userData.data?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Then, get recent tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json()
      return NextResponse.json(
        { error: 'Failed to fetch tweets', details: errorData },
        { status: tweetsResponse.status }
      )
    }

    const tweetsData: TwitterResponse = await tweetsResponse.json()

    return NextResponse.json({
      tweets: tweetsData.data || [],
      count: tweetsData.meta?.result_count || 0,
    })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

