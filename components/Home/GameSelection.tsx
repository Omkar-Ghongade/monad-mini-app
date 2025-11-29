'use client'

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
  return (
    <div className="flex h-screen flex-col items-center justify-start p-6 space-y-6 bg-white overflow-y-auto">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-5xl font-black border-4 border-black px-6 py-4 bg-neo-yellow neobrutal-shadow inline-block">
            nadArcade
          </h1>
          <p className="text-lg font-bold text-gray-700">Choose a game to play</p>
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

