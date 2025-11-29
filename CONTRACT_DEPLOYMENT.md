# Contract Deployment Guide

## Overview

The leaderboard system now stores all scores on the Monad blockchain using a smart contract. This guide will help you deploy the contract.

## Prerequisites

1. A wallet with Monad Testnet ETH for deployment
2. Node.js and pnpm installed
3. Access to a Monad Testnet RPC endpoint

## Steps

### 1. Compile the Contract

You'll need to compile the Solidity contract. You can use:

- **Hardhat** (recommended)
- **Foundry**
- **Remix IDE**

#### Using Hardhat:

```bash
# Install Hardhat
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat (if not already done)
npx hardhat init

# Compile
npx hardhat compile
```

The compiled bytecode will be in `artifacts/contracts/Leaderboard.sol/Leaderboard.json`

### 2. Update Deployment Script

1. Copy the compiled bytecode from the JSON file
2. Update `scripts/deploy.ts` with the actual bytecode
3. Add your deployer private key to `.env.local`:

```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 3. Deploy the Contract

```bash
# Make sure you're on Monad Testnet
npx tsx scripts/deploy.ts
```

After deployment, you'll get a contract address. Add it to your `.env.local`:

```env
NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=0x...
```

### 4. Verify the Contract (Optional)

If using Hardhat, you can verify the contract:

```bash
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
```

## Contract Details

- **Game IDs**: 
  - `0` = Snake
  - `1` = Bounce
- **Max Top Scores**: 100 per game
- **Functions**:
  - `submitScore(uint8 gameId, uint256 score)` - Submit a score (only updates if it's a new best)
  - `getPlayerScore(uint8 gameId, address player)` - Get a player's best score
  - `getTopScores(uint8 gameId, uint256 count)` - Get top N scores
  - `getAllTopScores(uint8 gameId)` - Get all top scores

## Testing

After deployment, test the contract:

1. Connect your wallet to Monad Testnet
2. Play a game and achieve a score
3. The score will automatically be submitted to the contract when the game ends
4. Check the leaderboard to see your score

## Notes

- Scores are stored on-chain permanently
- Only the best score per player per game is kept
- Top 100 scores per game are maintained in the contract
- Submitting a score requires a transaction (gas fees apply)
- The contract automatically handles sorting and ranking

