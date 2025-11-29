'use client'

import { useEffect, useRef, useState } from 'react'
import { useAccount, useConnect, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi'
import { monadTestnet } from 'wagmi/chains'
import { parseEther } from 'viem'
import { useFrame } from '@/components/farcaster-provider'
import { Leaderboard } from './Leaderboard'
import { LEADERBOARD_ABI, LEADERBOARD_CONTRACT_ADDRESS, GAME_BOUNCE } from '@/lib/contract'

type Point = { x: number; y: number }
type Brick = { x: number; y: number; broken: boolean }

type BounceProps = {
  onBack?: () => void
}

export function Bounce({ onBack }: BounceProps) {
  const { isEthProviderAvailable, context } = useFrame()

  const { isConnected, address, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { switchChain } = useSwitchChain()
  const { sendTransaction, data: txHash, isPending: isSendingTx } = useSendTransaction()
  const { writeContract, isPending: isSubmittingScore } = useWriteContract()

  // Game state
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const isGameOverRef = useRef(false)
  const hasSubmittedScoreRef = useRef(false)
  
  const canvasWidth = 320
  const canvasHeight = 400
  const paddleWidth = 60
  const paddleHeight = 10
  const ballSize = 8
  const brickRows = 5
  const brickCols = 8
  const brickWidth = 35
  const brickHeight = 15
  const brickPadding = 2
  const brickOffsetTop = 50
  const brickOffsetLeft = 10
  
  const speedMs = useRef(16) // ~60fps
  
  const tickTimer = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  // Ball state
  const ball = useRef<Point & { vx: number; vy: number }>({
    x: canvasWidth / 2,
    y: canvasHeight - 50,
    vx: 3,
    vy: -3,
  })
  
  // Paddle state
  const paddle = useRef<Point>({
    x: canvasWidth / 2 - paddleWidth / 2,
    y: canvasHeight - 30,
  })
  
  const paddleSpeed = 5
  const keysPressed = useRef<Set<string>>(new Set())
  const paddleDirection = useRef<'left' | 'right' | null>(null)
  
  // Bricks
  const bricks = useRef<Brick[][]>([])
  
  function initBricks() {
    const newBricks: Brick[][] = []
    for (let row = 0; row < brickRows; row++) {
      newBricks[row] = []
      for (let col = 0; col < brickCols; col++) {
        newBricks[row][col] = {
          x: col * (brickWidth + brickPadding) + brickOffsetLeft,
          y: row * (brickHeight + brickPadding) + brickOffsetTop,
          broken: false,
        }
      }
    }
    bricks.current = newBricks
  }

  function resetGame() {
    // Clear existing timer
    if (tickTimer.current) {
      clearTimeout(tickTimer.current)
      tickTimer.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Reset game state
    ball.current = {
      x: canvasWidth / 2,
      y: canvasHeight - 50,
      vx: 3,
      vy: -3,
    }
    paddle.current = {
      x: canvasWidth / 2 - paddleWidth / 2,
      y: canvasHeight - 30,
    }
    scoreRef.current = 0
    setScore(0)
    setIsGameOver(false)
    isGameOverRef.current = false
    hasSubmittedScoreRef.current = false // Reset submission flag
    setRewarded(false)
    keysPressed.current.clear()
    
    initBricks()
    
    // Redraw canvas and restart game loop
    draw()
    gameLoop()
  }

  // Drawing
  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw bricks
    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        const brick = bricks.current[row][col]
        if (!brick.broken) {
          // Color gradient by row
          const hue = (row * 30) % 360
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
          ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight)
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 1
          ctx.strokeRect(brick.x, brick.y, brickWidth, brickHeight)
        }
      }
    }

    // Draw paddle
    ctx.fillStyle = '#4a90e2'
    ctx.fillRect(paddle.current.x, paddle.current.y, paddleWidth, paddleHeight)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.strokeRect(paddle.current.x, paddle.current.y, paddleWidth, paddleHeight)

    // Draw ball
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(ball.current.x, ball.current.y, ballSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.stroke()

    // Score
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`SCORE: ${scoreRef.current}`, 10, 30)
  }

  // Game loop
  function gameLoop() {
    if (isGameOverRef.current) return
    
    // Update paddle position
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
      paddle.current.x = Math.max(0, paddle.current.x - paddleSpeed)
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
      paddle.current.x = Math.min(canvasWidth - paddleWidth, paddle.current.x + paddleSpeed)
    }
    if (paddleDirection.current === 'left') {
      paddle.current.x = Math.max(0, paddle.current.x - paddleSpeed)
    }
    if (paddleDirection.current === 'right') {
      paddle.current.x = Math.min(canvasWidth - paddleWidth, paddle.current.x + paddleSpeed)
    }
    
    // Update ball position
    ball.current.x += ball.current.vx
    ball.current.y += ball.current.vy
    
    // Ball collision with walls
    if (ball.current.x <= ballSize / 2 || ball.current.x >= canvasWidth - ballSize / 2) {
      ball.current.vx = -ball.current.vx
      ball.current.x = Math.max(ballSize / 2, Math.min(canvasWidth - ballSize / 2, ball.current.x))
    }
    if (ball.current.y <= ballSize / 2) {
      ball.current.vy = -ball.current.vy
      ball.current.y = ballSize / 2
    }
    
    // Ball collision with paddle
    if (
      ball.current.y + ballSize / 2 >= paddle.current.y &&
      ball.current.y - ballSize / 2 <= paddle.current.y + paddleHeight &&
      ball.current.x >= paddle.current.x &&
      ball.current.x <= paddle.current.x + paddleWidth &&
      ball.current.vy > 0
    ) {
      // Calculate hit position on paddle (-1 to 1)
      const hitPos = (ball.current.x - (paddle.current.x + paddleWidth / 2)) / (paddleWidth / 2)
      ball.current.vy = -Math.abs(ball.current.vy)
      ball.current.vx = hitPos * 4 // Add spin based on hit position
      ball.current.y = paddle.current.y - ballSize / 2
    }
    
    // Ball collision with bricks
    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        const brick = bricks.current[row][col]
        if (brick.broken) continue
        
        if (
          ball.current.x + ballSize / 2 >= brick.x &&
          ball.current.x - ballSize / 2 <= brick.x + brickWidth &&
          ball.current.y + ballSize / 2 >= brick.y &&
          ball.current.y - ballSize / 2 <= brick.y + brickHeight
        ) {
          brick.broken = true
          scoreRef.current += 10
          setScore(scoreRef.current)
          
          // Determine which side was hit
          const ballLeft = ball.current.x - ballSize / 2
          const ballRight = ball.current.x + ballSize / 2
          const ballTop = ball.current.y - ballSize / 2
          const ballBottom = ball.current.y + ballSize / 2
          
          const brickLeft = brick.x
          const brickRight = brick.x + brickWidth
          const brickTop = brick.y
          const brickBottom = brick.y + brickHeight
          
          // Check which edge was hit
          if (ballRight >= brickLeft && ballLeft < brickLeft && Math.abs(ball.current.vx) > 0) {
            ball.current.vx = -Math.abs(ball.current.vx)
          } else if (ballLeft <= brickRight && ballRight > brickRight && Math.abs(ball.current.vx) > 0) {
            ball.current.vx = Math.abs(ball.current.vx)
          }
          if (ballBottom >= brickTop && ballTop < brickTop && Math.abs(ball.current.vy) > 0) {
            ball.current.vy = -Math.abs(ball.current.vy)
          } else if (ballTop <= brickBottom && ballBottom > brickBottom && Math.abs(ball.current.vy) > 0) {
            ball.current.vy = Math.abs(ball.current.vy)
          }
          
          break
        }
      }
    }
    
    // Check if all bricks are broken
    const allBroken = bricks.current.every(row => row.every(brick => brick.broken))
    if (allBroken) {
      // Level complete - reset bricks and increase speed
      initBricks()
      ball.current.vx *= 1.1
      ball.current.vy *= 1.1
    }
    
    // Game over if ball falls below paddle
    if (ball.current.y > canvasHeight) {
      setIsGameOver(true)
      isGameOverRef.current = true
      return
    }
    
    draw()
    
    // Continue loop
    if (!isGameOverRef.current) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    initBricks()
    draw()
    gameLoop()
    
    return () => {
      if (tickTimer.current) clearTimeout(tickTimer.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key
      if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'a' || key === 'A' || key === 'd' || key === 'D') {
        e.preventDefault()
        keysPressed.current.add(key)
      }
      if (key === 'Enter' && isGameOver) {
        e.preventDefault()
        resetGame()
      }
    }
    
    function onKeyUp(e: KeyboardEvent) {
      const key = e.key
      keysPressed.current.delete(key)
    }
    
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isGameOver])

  // Save best score to contract when game ends (only once per game)
  useEffect(() => {
    // Only submit once per game session
    if (hasSubmittedScoreRef.current) return
    if (!isGameOver || scoreRef.current === 0) return
    if (!isConnected || !address || chainId !== monadTestnet.id) return
    if (isSubmittingScore) return

    // Mark as submitted immediately to prevent duplicate calls
    hasSubmittedScoreRef.current = true

    try {
      writeContract({
        address: LEADERBOARD_CONTRACT_ADDRESS,
        abi: LEADERBOARD_ABI,
        functionName: 'submitScore',
        args: [GAME_BOUNCE, BigInt(scoreRef.current)],
      })
    } catch (error) {
      console.error('Error submitting score to contract:', error)
      // Reset flag on error so user can retry
      hasSubmittedScoreRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]) // Only depend on isGameOver to trigger once

  // Trigger reward at 100 points (one-time per run)
  useEffect(() => {
    if (score >= 100 && !rewarded) {
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

  // On-screen controls
  function startMovePaddle(direction: 'left' | 'right') {
    paddleDirection.current = direction
  }
  
  function stopMovePaddle() {
    paddleDirection.current = null
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="border-8 border-black rounded-[28px] p-4 bg-neutral-100 neobrutal-shadow w-[360px]">
        {/* Nokia top speaker + brand stripe */}
        <div className="flex flex-col items-center mb-3">
          <div className="w-24 h-2 bg-black rounded-full opacity-90" />
          <div className="mt-2 text-xs font-black tracking-widest">NOKIA</div>
        </div>

        {/* Screen bezel */}
        <div className="rounded-[18px] border-4 border-black p-2 bg-neutral-200">
          <div className="rounded-[12px] border-4 border-black overflow-hidden bg-[#1a1a2e]">
            <div className="flex items-center justify-between px-3 py-1 border-b-4 border-black bg-[#16213e]">
              <span className="text-[10px] font-black text-white">BOUNCE</span>
              <span className="text-[10px] font-black text-white">SCORE {score}</span>
            </div>
            <div className="flex items-center justify-center p-2">
              <canvas ref={canvasRef} className="block border-2 border-black" />
            </div>
            {isGameOver && (
              <div className="px-3 pb-2">
                <div className="w-full text-center text-xs font-black border-4 border-black bg-[#16213e] text-white px-2 py-1">
                  GAME OVER — PRESS ENTER OR TAP RESTART
                </div>
              </div>
            )}
            {txHash && (
              <div className="px-3 pb-2">
                <a
                  className="block text-center text-xs font-black underline text-white"
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
            {onBack && (
              <button
                type="button"
                className="bg-neo-blue text-white border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button"
                onClick={onBack}
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              className={onBack ? "col-span-2 bg-neo-green border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button" : "col-span-3 bg-neo-green border-4 border-black px-3 py-2 text-sm font-black uppercase neobrutal-button"}
              onClick={() => resetGame()}
            >
              Restart
            </button>
          </div>
        </div>

        {/* Paddle controls */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="bg-white border-4 border-black px-4 py-3 text-sm font-black"
            onMouseDown={() => startMovePaddle('left')}
            onMouseUp={stopMovePaddle}
            onMouseLeave={stopMovePaddle}
            onTouchStart={() => startMovePaddle('left')}
            onTouchEnd={stopMovePaddle}
          >
            ◀ LEFT
          </button>
          <button
            type="button"
            className="bg-white border-4 border-black px-4 py-3 text-sm font-black"
            onMouseDown={() => startMovePaddle('right')}
            onMouseUp={stopMovePaddle}
            onMouseLeave={stopMovePaddle}
            onTouchStart={() => startMovePaddle('right')}
            onTouchEnd={stopMovePaddle}
          >
            RIGHT ▶
          </button>
        </div>
        {isConnected && (
          <div className="mt-3 text-[10px] text-center">
            <span className="font-black">Player:</span> {address?.slice(0, 6)}…{address?.slice(-4)}
            {isSendingTx ? ' — confirming…' : ''}
          </div>
        )}
      </div>
      <div className="w-full max-w-[360px] mt-6 md:hidden">
        <Leaderboard />
      </div>
    </div>
  )
}

