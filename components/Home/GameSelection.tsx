'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

type Game = {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

const games: Game[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game with rewards',
    color: 'bg-neo-green',
    icon: '🐍',
  },
  {
    id: 'bounce',
    name: 'Bounce Classic',
    description: 'Break bricks with a bouncing ball',
    color: 'bg-neo-blue',
    icon: '⚽',
  },
  // Add more games here in the future
]

type GameSelectionProps = {
  onSelectGame: (gameId: string) => void
}

export function GameSelection({ onSelectGame }: GameSelectionProps) {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // Get MetaMask and Phantom connectors
  const metaMaskConnector = connectors.find(
    (connector) => connector.id === 'injected' && connector.name?.toLowerCase().includes('metamask'),
  )
  const phantomConnector = connectors.find(
    (connector) => connector.id === 'injected' && connector.name?.toLowerCase().includes('phantom'),
  )
  // Fallback to any injected connector
  const injectedConnector = connectors.find(
    (connector) => connector.id === 'injected' && connector !== metaMaskConnector && connector !== phantomConnector,
  )

  const handleConnect = (connector: any) => {
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-start p-6 space-y-6 bg-white overflow-y-auto">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-5xl font-black border-4 border-black px-6 py-4 bg-neo-yellow neobrutal-shadow inline-block">
            nadArcade
          </h1>
          <p className="text-lg font-bold text-gray-700">Choose a game to play</p>
        </div>

        {/* Wallet Connection Section */}
        <div className="border-4 border-black p-6 bg-neo-purple neobrutal-shadow">
          <h2 className="text-2xl font-black mb-4 text-white">Connect Wallet</h2>
          {isConnected ? (
            <div className="space-y-4">
              <p className="text-base font-bold text-white">
                Connected:{' '}
                <span className="bg-neo-yellow font-mono text-black border-2 border-black px-2 py-1">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </p>
              <button
                type="button"
                className="bg-neo-red text-white border-4 border-black p-3 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all w-full"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metaMaskConnector && (
                <button
                  type="button"
                  className="bg-neo-yellow text-black border-4 border-black p-4 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all flex items-center justify-center gap-2"
                  onClick={() => handleConnect(metaMaskConnector)}
                  disabled={isPending}
                >
                  <span className="text-2xl">🦊</span>
                  <span>MetaMask</span>
                </button>
              )}
              {phantomConnector && (
                <button
                  type="button"
                  className="bg-neo-yellow text-black border-4 border-black p-4 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all flex items-center justify-center gap-2"
                  onClick={() => handleConnect(phantomConnector)}
                  disabled={isPending}
                >
                  <span className="text-2xl">👻</span>
                  <span>Phantom</span>
                </button>
              )}
              {injectedConnector && !metaMaskConnector && !phantomConnector && (
                <button
                  type="button"
                  className="bg-neo-yellow text-black border-4 border-black p-4 text-base font-black uppercase neobrutal-shadow neobrutal-button transition-all flex items-center justify-center gap-2"
                  onClick={() => handleConnect(injectedConnector)}
                  disabled={isPending}
                >
                  <span className="text-2xl">🔌</span>
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              className={`${game.color} border-4 border-black p-6 neobrutal-shadow hover:neobrutal-shadow-sm transition-all neobrutal-button text-left`}
            >
              <div className="text-6xl mb-4">{game.icon}</div>
              <h2 className="text-2xl font-black mb-2">{game.name}</h2>
              <p className="text-sm font-bold text-gray-700">{game.description}</p>
            </button>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12 border-4 border-black bg-gray-100 neobrutal-shadow">
            <p className="text-xl font-black">No games available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

