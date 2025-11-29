import { useFrame } from '@/components/farcaster-provider'

export function User() {
  const { context } = useFrame()

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

  if (!context?.user) {
    return null
  }

  return (
    <div className="space-y-4 border-4 border-black p-6 bg-neo-blue neobrutal-shadow">
      <div className="flex flex-row space-x-4 justify-start items-center">
        {context?.user?.pfpUrl && (
          <img
            src={context?.user?.pfpUrl}
            className="w-16 h-16 border-4 border-black rounded-full"
            alt="User Profile"
            width={64}
            height={64}
          />
        )}
        <div className="flex flex-col justify-start items-start space-y-2">
          <h2 className="text-xl font-black text-left">
            {context?.user?.displayName || context?.user?.username}
          </h2>
          <p className="text-sm font-bold text-gray-600">
            @{context?.user?.username}
          </p>
        </div>
      </div>
    </div>
  )
}
