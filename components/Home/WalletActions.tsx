import { useFrame } from '@/components/farcaster-provider'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { parseEther } from 'viem'
import { monadTestnet } from 'viem/chains'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from 'wagmi'

export function WalletActions() {
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: hash, sendTransaction } = useSendTransaction()
  const { switchChain } = useSwitchChain()
  const { connect } = useConnect()

  async function sendTransactionHandler() {
    sendTransaction({
      to: '0x7f748f154B6D180D35fA12460C7E4C631e28A9d7',
      value: parseEther('1'),
    })
  }

  if (isConnected) {
    return (
      <div className="space-y-4 border-4 border-black p-6 bg-neo-green neobrutal-shadow">
        <h2 className="text-2xl font-black text-left uppercase">sdk.wallet.ethProvider</h2>
        <div className="flex flex-row space-x-4 justify-start items-start">
          <div className="flex flex-col space-y-4 justify-start w-full">
            <p className="text-base font-bold text-left">
              Connected to wallet:{' '}
              <span className="bg-neo-yellow font-mono text-black border-2 border-black px-2 py-1">
                {address}
              </span>
            </p>
            <p className="text-base font-bold text-left">
              Chain Id:{' '}
              <span className="bg-neo-yellow font-mono text-black border-2 border-black px-2 py-1">
                {chainId}
              </span>
            </p>
            {chainId === monadTestnet.id ? (
              <div className="flex flex-col space-y-3 border-4 border-black p-4 bg-neo-orange neobrutal-shadow-sm">
                <h2 className="text-lg font-black text-left uppercase">
                  Send Transaction Example
                </h2>
                <button
                  type="button"
                  className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
                  onClick={sendTransactionHandler}
                >
                  Send Transaction
                </button>
                {hash && (
                  <button
                    type="button"
                    className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
                    onClick={() =>
                      window.open(
                        `https://testnet.monadexplorer.com/tx/${hash}`,
                        '_blank',
                      )
                    }
                  >
                    View Transaction
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="bg-neo-yellow text-black border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
                onClick={() => switchChain({ chainId: monadTestnet.id })}
              >
                Switch to Monad Testnet
              </button>
            )}

            <button
              type="button"
              className="bg-neo-red text-white border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
              onClick={() => disconnect()}
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isEthProviderAvailable) {
    return (
      <div className="space-y-4 border-4 border-black p-6 bg-neo-green neobrutal-shadow">
        <h2 className="text-2xl font-black text-left uppercase">sdk.wallet.ethProvider</h2>
        <div className="flex flex-row space-x-4 justify-start items-start">
          <button
            type="button"
            className="bg-neo-yellow text-black w-full border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all"
            onClick={() => connect({ connector: miniAppConnector() })}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-4 border-black p-6 bg-neo-green neobrutal-shadow">
      <h2 className="text-2xl font-black text-left uppercase">sdk.wallet.ethProvider</h2>
      <div className="flex flex-row space-x-4 justify-start items-start">
        <p className="text-base font-bold text-left">Wallet connection only via Warpcast</p>
      </div>
    </div>
  )
}
