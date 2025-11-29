import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'

// Contract bytecode (you'll need to compile the contract first)
// This is a placeholder - you'll need to compile the Solidity contract
// and paste the bytecode here, or use a tool like Hardhat/Truffle

const LEADERBOARD_BYTECODE = '0x...' // Replace with actual compiled bytecode

async function deploy() {
  // You'll need a private key with testnet ETH for deployment
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY environment variable is required')
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`)

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(),
  })

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  console.log('Deploying Leaderboard contract...')
  console.log('Deployer address:', account.address)

  try {
    const hash = await walletClient.deployContract({
      abi: [], // Contract ABI
      bytecode: LEADERBOARD_BYTECODE,
    })

    console.log('Deployment transaction hash:', hash)
    console.log('Waiting for confirmation...')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Contract deployed at:', receipt.contractAddress)
    console.log('\nAdd this to your .env.local:')
    console.log(`NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS=${receipt.contractAddress}`)
  } catch (error) {
    console.error('Deployment failed:', error)
    throw error
  }
}

deploy()
  .then(() => {
    console.log('Deployment complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })

