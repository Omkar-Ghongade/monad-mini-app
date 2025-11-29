'use client'

import { useFrame } from '@/components/farcaster-provider'
import { useEffect, useState } from 'react'

interface Tweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
}

interface TweetsResponse {
  tweets: Tweet[]
  count: number
  error?: string
  message?: string
}

export function Tweets() {
  const { context } = useFrame()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to find Twitter username in various possible properties
  const user = context?.user as any
  const twitterUsername = 
    user?.twitterUsername || 
    user?.twitter?.username || 
    user?.verifications?.find((v: any) => v?.platform === 'twitter')?.username ||
    user?.socialVerifications?.find((v: any) => v?.platform === 'twitter')?.username ||
    user?.verifiedAddresses?.find((v: any) => v?.platform === 'twitter')?.username ||
    user?.twitterHandle ||
    user?.twitter_id

  useEffect(() => {
    if (!twitterUsername) {
      setError('No Twitter username available')
      return
    }

    const fetchTweets = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/tweets?username=${encodeURIComponent(twitterUsername)}`
        )
        const data: TweetsResponse = await response.json()

        if (!response.ok) {
          setError(data.error || data.message || 'Failed to fetch tweets')
          setTweets([])
          return
        }

        setTweets(data.tweets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets')
        setTweets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
  }, [twitterUsername])

  if (!twitterUsername) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4 border-4 border-black p-6 bg-neo-blue neobrutal-shadow">
      <h2 className="text-2xl font-black text-left uppercase">
        Recent Tweets
      </h2>

      {loading && (
        <p className="text-base font-bold text-left">Loading tweets...</p>
      )}

      {error && (
        <div className="space-y-2">
          <p className="text-base font-bold text-left text-red-600">
            Error: {error}
          </p>
          {error.includes('TWITTER_BEARER_TOKEN') && (
            <p className="text-sm text-gray-600">
              Please configure Twitter API credentials in your environment variables.
            </p>
          )}
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <p className="text-base font-bold text-left text-gray-600">
          No tweets found
        </p>
      )}

      {!loading && !error && tweets.length > 0 && (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="border-2 border-black p-4 bg-white neobrutal-shadow"
            >
              <p className="text-sm font-bold text-gray-600 mb-2">
                {formatDate(tweet.created_at)}
              </p>
              <p className="text-base text-left mb-3 whitespace-pre-wrap">
                {tweet.text}
              </p>
              {tweet.public_metrics && (
                <div className="flex flex-row space-x-4 text-sm font-bold">
                  <span className="text-gray-600">
                    ❤️ {tweet.public_metrics.like_count || 0}
                  </span>
                  <span className="text-gray-600">
                    🔄 {tweet.public_metrics.retweet_count || 0}
                  </span>
                  <span className="text-gray-600">
                    💬 {tweet.public_metrics.reply_count || 0}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

