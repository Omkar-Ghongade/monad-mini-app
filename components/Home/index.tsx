'use client'

import { User } from '@/components/Home/User'
import { Tweets } from './Tweets'
import { Snake } from './Snake'

export function Demo() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-6 space-y-6 bg-white">
      <div className="w-full max-w-4xl space-y-6">
        <User />
        <Snake />
        <Tweets />
      </div>
    </div>
  )
}
