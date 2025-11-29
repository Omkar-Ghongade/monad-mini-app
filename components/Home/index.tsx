'use client'

import { useState } from 'react'
import { GameSelection } from './GameSelection'
import { Snake } from './Snake'
import { Bounce } from './Bounce'

export function Demo() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId)
  }

  // Show game selection screen by default
  if (!selectedGame) {
    return <GameSelection onSelectGame={handleSelectGame} />
  }

  const handleBack = () => {
    setSelectedGame(null)
  }

  // Show selected game
  return (
    <div className="flex h-screen flex-col items-center justify-start p-6 space-y-6 bg-white overflow-y-auto">
      <div className="w-full max-w-4xl space-y-6">
        {/* Render selected game */}
        {selectedGame === 'snake' && <Snake onBack={handleBack} />}
        {selectedGame === 'bounce' && <Bounce onBack={handleBack} />}
      </div>
    </div>
  )
}
