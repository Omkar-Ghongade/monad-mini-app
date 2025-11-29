import { useFrame } from '@/components/farcaster-provider'
import { APP_URL } from '@/lib/constants'
import { useMutation } from '@tanstack/react-query'

export function FarcasterActions() {
  const { actions } = useFrame()

  return (
    <div className="space-y-4 border-4 border-black p-6 bg-neo-pink neobrutal-shadow">
      <h2 className="text-2xl font-black text-left uppercase">sdk.actions</h2>
      <div className="flex flex-row space-x-4 justify-start items-start">
        {actions ? (
          <div className="flex flex-col space-y-3 justify-start w-full">
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => actions?.addMiniApp()}
            >
              addFrame
            </button>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => actions?.close()}
            >
              close
            </button>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() =>
                actions?.composeCast({
                  text: 'Check out this Monad Farcaster MiniApp Template!',
                  embeds: [`${APP_URL}`],
                })
              }
            >
              composeCast
            </button>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => actions?.openUrl('https://docs.monad.xyz')}
            >
              openUrl
            </button>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() =>
                actions?.signIn({ nonce: '1201', acceptAuthAddress: true })
              }
            >
              signIn
            </button>
            <button
              type="button"
              className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => actions?.viewProfile({ fid: 17979 })}
            >
              viewProfile
            </button>
          </div>
        ) : (
          <p className="text-base font-bold text-left">Actions not available</p>
        )}
      </div>
    </div>
  )
}
