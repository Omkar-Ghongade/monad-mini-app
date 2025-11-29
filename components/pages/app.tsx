'use client'

import { Demo } from '@/components/Home'
import { useFrame } from '@/components/farcaster-provider'
import { SafeAreaContainer } from '@/components/safe-area-container'

export default function Home() {
  const { context, isLoading, isSDKLoaded } = useFrame()

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 space-y-8 bg-white">
          <h1 className="text-4xl font-black text-center border-4 border-black px-6 py-4 bg-neo-yellow neobrutal-shadow">
            Loading...
          </h1>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 space-y-8 bg-white">
          <h1 className="text-3xl font-black text-center border-4 border-black px-6 py-4 bg-neo-red text-white neobrutal-shadow max-w-2xl">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <Demo />
    </SafeAreaContainer>
  )
}
