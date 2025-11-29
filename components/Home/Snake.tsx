'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useConnect, useSendTransaction, useSwitchChain } from 'wagmi'
import { monadTestnet } from 'wagmi/chains'
import { parseEther } from 'viem'
import { useFrame } from '@/components/farcaster-provider'

type Point = { x: number; y: number }
type Direction = 'Up' | 'Down' | 'Left' | 'Right'

export function Snake() {
  const { isEthProviderAvailable } = useFrame()

  const { isConnected, address, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, data: txHash, isPending: isSendingTx } = useSendTransaction()

  // Game state
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [direction, setDirection] = useState<Direction>('Right') // for UI only
  const directionRef = useRef<Direction>('Right')
  const nextDirectionRef = useRef<Direction>('Right')
  const isGameOverRef = useRef(false)
  const [rewarded, setRewarded] = useState(false)
  const gridSize = 16
  const cell = 16 // px
  const speedMs = useRef(140)
  const tickTimer = useRef<NodeJS.Timeout | null>(null)
  const snake = useRef<Point[]>([{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }])
  const food = useRef<Point>({ x: 10, y: 8 })

  // Helpers
  const randomFood = useMemo(
    () =>
      function randomFood() {
        // ensure not on snake
        while (true) {
          const p = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
          }
          if (!snake.current.some((s) => s.x === p.x && s.y === p.y)) {
            return p
          }
        }
      },
    [],
  )

  function resetGame() {
    snake.current = [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }]
    food.current = randomFood()
    scoreRef.current = 0
    setScore(0)
    setIsGameOver(false)
    isGameOverRef.current = false
    setDirection('Right')
    directionRef.current = 'Right'
    nextDirectionRef.current = 'Right'
    speedMs.current = 140
    // keep rewarded state; a new session can reward again
    setRewarded(false)
  }

  // Drawing
  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Nokia LCD greenish background
    ctx.fillStyle = '#c3e88d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid subtle
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cell + 0.5, 0)
      ctx.lineTo(i * cell + 0.5, gridSize * cell)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cell + 0.5)
      ctx.lineTo(gridSize * cell, i * cell + 0.5)
      ctx.stroke()
    }

    // Food
    ctx.fillStyle = '#0b3d02'
    ctx.fillRect(food.current.x * cell, food.current.y * cell, cell, cell)

    // Snake
    for (let i = 0; i < snake.current.length; i++) {
      const seg = snake.current[i]
      ctx.fillStyle = i === 0 ? '#052e01' : '#0b3d02'
      ctx.fillRect(seg.x * cell, seg.y * cell, cell, cell)
    }

    // Score band
    ctx.fillStyle = '#052e01'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`SCORE: ${scoreRef.current}`, 8, 18)
  }

  // Game loop
  function step() {
    const head = { ...snake.current[0] }
    const dir = nextDirectionRef.current
    directionRef.current = dir
    setDirection(dir)
    if (dir === 'Up') head.y -= 1
    if (dir === 'Down') head.y += 1
    if (dir === 'Left') head.x -= 1
    if (dir === 'Right') head.x += 1

    // Wrap like old phones
    if (head.x < 0) head.x = gridSize - 1
    if (head.y < 0) head.y = gridSize - 1
    if (head.x >= gridSize) head.x = 0
    if (head.y >= gridSize) head.y = 0

    // Collision with body
    if (snake.current.some((s) => s.x === head.x && s.y === head.y)) {
      setIsGameOver(true)
      isGameOverRef.current = true
      return
    }

    const newSnake = [head, ...snake.current]
    if (head.x === food.current.x && head.y === food.current.y) {
      food.current = randomFood()
      scoreRef.current += 1
      setScore(scoreRef.current)
      if (speedMs.current > 70) speedMs.current -= 4
    } else {
      newSnake.pop()
    }
    snake.current = newSnake
    draw()
    // continue loop
    if (!isGameOverRef.current) {
      tickTimer.current = setTimeout(step, speedMs.current)
    }
  }

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = gridSize * cell
    canvas.height = gridSize * cell
    draw()
    // start loop
    tickTimer.current = setTimeout(step, speedMs.current)
    return () => {
      if (tickTimer.current) clearTimeout(tickTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key
      if (key === 'ArrowUp' && directionRef.current !== 'Down') {
        nextDirectionRef.current = 'Up'
        setDirection('Up')
      }
      if (key === 'ArrowDown' && directionRef.current !== 'Up') {
        nextDirectionRef.current = 'Down'
        setDirection('Down')
      }
      if (key === 'ArrowLeft' && directionRef.current !== 'Right') {
        nextDirectionRef.current = 'Left'
        setDirection('Left')
      }
      if (key === 'ArrowRight' && directionRef.current !== 'Left') {
        nextDirectionRef.current = 'Right'
        setDirection('Right')
      }
      if (key === 'Enter' && isGameOver) resetGame()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [direction, isGameOver])

  // Trigger reward at 10 points (one-time per run)
  useEffect(() => {
    if (score >= 10 && !rewarded) {
      // Only attempt if provider is available and user can sign
      if (isEthProviderAvailable && isConnected && address && chainId === monadTestnet.id) {
        try {
          sendTransaction({
            to: address,
            value: parseEther('1'),
          })
          setRewarded(true)
        } catch {
          // ignore, user may reject
        }
      }
    }
  }, [score, rewarded, isConnected, address, chainId, sendTransaction, isEthProviderAvailable])

  const canPlay = isEthProviderAvailable
  const needConnect = canPlay && !isConnected
  const needSwitch = canPlay && isConnected && chainId !== monadTestnet.id

  // On-screen keypad handlers
  function tap(d: Direction) {
    if (d === 'Up' && directionRef.current !== 'Down') {
      nextDirectionRef.current = 'Up'
      setDirection('Up')
    }
    if (d === 'Down' && directionRef.current !== 'Up') {
      nextDirectionRef.current = 'Down'
      setDirection('Down')
    }
    if (d === 'Left' && directionRef.current !== 'Right') {
      nextDirectionRef.current = 'Left'
      setDirection('Left')
    }
    if (d === 'Right' && directionRef.current !== 'Left') {
      nextDirectionRef.current = 'Right'
      setDirection('Right')
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="border-8 border-black rounded-[28px] p-4 bg-neutral-100 neobrutal-shadow w-[360px]">
        {/* Nokia top speaker + brand stripe */}
        <div className="flex flex-col items-center mb-3">
          <div className="w-24 h-2 bg-black rounded-full opacity-90" />
          <div className="mt-2 text-xs font-black tracking-widest">NOKIA</div>
        </div>

        {/* Screen bezel */}
        <div className="rounded-[18px] border-4 border-black p-2 bg-neutral-200">
          <div className="rounded-[12px] border-4 border-black overflow-hidden bg-[#c3e88d]">
            <div className="flex items-center justify-between px-3 py-1 border-b-4 border-black bg-[#b6dd7e]">
              <span className="text-[10px] font-black">MON SNAKE</span>
              <span className="text-[10px] font-black">SCORE {score}</span>
            </div>
            <div className="flex items-center justify-center p-2">
              <canvas ref={canvasRef} className="block border-2 border-black" />
            </div>
            {isGameOver && (
              <div className="px-3 pb-2">
                <div className="w-full text-center text-xs font-black border-4 border-black bg-[#b6dd7e] px-2 py-1">
                  GAME OVER — PRESS ENTER OR TAP RESTART
                </div>
              </div>
            )}
            {txHash && (
              <div className="px-3 pb-2">
                <a
                  className="block text-center text-xs font-black underline"
                  href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Reward Tx
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions: connect / switch / restart */}
        <div className="mt-3 space-y-2">
          {!canPlay && (
            <div className="text-center text-xs font-black border-4 border-black bg-neo-red text-white px-2 py-1">
              Open inside Farcaster to play
            </div>
          )}
          {needConnect && (
            <button
              type="button"
              className="w-full bg-neo-yellow text-black border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button"
              onClick={() => connect({ connector: connectors[0] })}
            >
              Connect Wallet
            </button>
          )}
          {needSwitch && (
            <button
              type="button"
              className="w-full bg-neo-yellow text-black border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button"
              onClick={() => switchChain({ chainId: monadTestnet.id })}
            >
              Switch to Monad Testnet
            </button>
          )}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="col-span-3 bg-neo-green border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button"
              onClick={() => resetGame()}
            >
              Restart
            </button>
          </div>
        </div>

        {/* Keypad */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div />
          <button
            type="button"
            className="bg-white border-4 border-black rounded-full h-10 text-sm font-black"
            onClick={() => tap('Up')}
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            className="bg-white border-4 border-black rounded-full h-10 text-sm font-black"
            onClick={() => tap('Left')}
          >
            ◀
          </button>
          <div />
          <button
            type="button"
            className="bg-white border-4 border-black rounded-full h-10 text-sm font-black"
            onClick={() => tap('Right')}
          >
            ▶
          </button>
          <div />
          <button
            type="button"
            className="bg-white border-4 border-black rounded-full h-10 text-sm font-black"
            onClick={() => tap('Down')}
          >
            ▼
          </button>
          <div />
        </div>
        {isConnected && (
          <div className="mt-3 text-[10px] text-center">
            <span className="font-black">Player:</span> {address?.slice(0, 6)}…{address?.slice(-4)}
            {isSendingTx ? ' — confirming…' : ''}
          </div>
        )}
      </div>
    </div>
  )
}


