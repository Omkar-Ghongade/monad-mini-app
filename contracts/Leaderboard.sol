// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Leaderboard {
    // Game IDs: 0 = snake, 1 = bounce
    uint8 public constant GAME_SNAKE = 0;
    uint8 public constant GAME_BOUNCE = 1;
    
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    // Mapping: gameId => player => best score
    mapping(uint8 => mapping(address => uint256)) public playerScores;
    
    // Array of top scores per game (sorted by score descending)
    mapping(uint8 => Score[]) public topScores;
    
    // Maximum number of top scores to keep per game
    uint256 public constant MAX_TOP_SCORES = 100;
    
    // Reward amount: 0.5 MON = 0.5 * 10^18 wei
    uint256 public constant REWARD_AMOUNT = 5e17; // 0.5 MON
    
    // Last reward timestamp
    uint256 public lastRewardTime;
    
    // Reward interval: 5 minutes = 300 seconds
    uint256 public constant REWARD_INTERVAL = 300;
    
    event ScoreSubmitted(
        uint8 indexed gameId,
        address indexed player,
        uint256 score,
        bool isNewBest
    );
    
    event RewardDistributed(
        address indexed winner,
        uint8 indexed gameId,
        uint256 amount,
        uint256 timestamp
    );
    
    event LeaderboardReset(
        uint8 indexed gameId,
        uint256 timestamp
    );
    
    /**
     * @dev Submit a score for a game
     * @param gameId The game ID (0 = snake, 1 = bounce)
     * @param score The score achieved
     */
    function submitScore(uint8 gameId, uint256 score) external {
        require(gameId <= GAME_BOUNCE, "Invalid game ID");
        require(score > 0, "Score must be greater than 0");
        
        address player = msg.sender;
        uint256 currentBest = playerScores[gameId][player];
        
        // Only update if this is a new best score
        if (score > currentBest) {
            playerScores[gameId][player] = score;
            
            // Update top scores list
            _updateTopScores(gameId, player, score);
            
            emit ScoreSubmitted(gameId, player, score, true);
        } else {
            emit ScoreSubmitted(gameId, player, score, false);
        }
    }
    
    /**
     * @dev Get a player's best score for a game
     */
    function getPlayerScore(uint8 gameId, address player) external view returns (uint256) {
        return playerScores[gameId][player];
    }
    
    /**
     * @dev Get top N scores for a game
     */
    function getTopScores(uint8 gameId, uint256 count) external view returns (Score[] memory) {
        require(gameId <= GAME_BOUNCE, "Invalid game ID");
        Score[] memory scores = topScores[gameId];
        uint256 length = scores.length;
        
        if (count > length) {
            count = length;
        }
        
        Score[] memory result = new Score[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = scores[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all top scores for a game
     */
    function getAllTopScores(uint8 gameId) external view returns (Score[] memory) {
        require(gameId <= GAME_BOUNCE, "Invalid game ID");
        return topScores[gameId];
    }
    
    /**
     * @dev Internal function to update top scores list
     */
    function _updateTopScores(uint8 gameId, address player, uint256 score) internal {
        Score[] storage scores = topScores[gameId];
        uint256 length = scores.length;
        
        // Check if player already has a score in the list
        bool playerExists = false;
        uint256 existingIndex = length;
        for (uint256 i = 0; i < length; i++) {
            if (scores[i].player == player) {
                playerExists = true;
                existingIndex = i;
                break;
            }
        }
        
        // Remove old entry if it exists
        if (playerExists) {
            // Move all entries after the existing one up by one
            for (uint256 i = existingIndex; i < length - 1; i++) {
                scores[i] = scores[i + 1];
            }
            scores.pop();
            length--;
        }
        
        // Find insertion point (scores should be sorted descending)
        uint256 insertIndex = length;
        for (uint256 i = 0; i < length; i++) {
            if (score > scores[i].score) {
                insertIndex = i;
                break;
            }
        }
        
        // Only add if it's in the top MAX_TOP_SCORES
        if (insertIndex < MAX_TOP_SCORES) {
            // If we're at max capacity and inserting at the end, don't add
            if (length >= MAX_TOP_SCORES && insertIndex >= MAX_TOP_SCORES) {
                return;
            }
            
            // If at max capacity, remove the last one
            if (length >= MAX_TOP_SCORES) {
                scores.pop();
            }
            
            // Insert new score at the end first
            scores.push(Score(player, score, block.timestamp));
            
            // Bubble up to correct position
            for (uint256 i = scores.length - 1; i > insertIndex; i--) {
                Score memory temp = scores[i];
                scores[i] = scores[i - 1];
                scores[i - 1] = temp;
            }
        }
    }
    
    /**
     * @dev Receive MON tokens
     */
    receive() external payable {}
    
    /**
     * @dev Fallback function to receive MON tokens
     */
    fallback() external payable {}
    
    /**
     * @dev Distribute reward to top player and reset leaderboard for a specific game
     * Can be called by anyone, but only if enough time has passed
     * @param gameId The game ID (0 = snake, 1 = bounce)
     */
    function distributeRewardAndReset(uint8 gameId) external {
        require(gameId <= GAME_BOUNCE, "Invalid game ID");
        require(block.timestamp >= lastRewardTime + REWARD_INTERVAL, "Reward interval not met");
        
        Score[] storage scores = topScores[gameId];
        
        // Check if there's a top player
        if (scores.length > 0) {
            address winner = scores[0].player;
            uint256 contractBalance = address(this).balance;
            
            // Only send reward if contract has enough balance
            if (contractBalance >= REWARD_AMOUNT) {
                // Send reward to winner
                (bool success, ) = payable(winner).call{value: REWARD_AMOUNT}("");
                require(success, "Failed to send reward");
                
                emit RewardDistributed(winner, gameId, REWARD_AMOUNT, block.timestamp);
            }
        }
        
        // Reset leaderboard for this game
        delete topScores[gameId];
        
        // Reset all player scores for this game
        // Note: We can't iterate over mappings, so we'll just clear the top scores
        // Individual player scores will be overwritten when they submit new scores
        
        emit LeaderboardReset(gameId, block.timestamp);
        
        // Update last reward time
        lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev Distribute rewards to top players for both games and reset all leaderboards
     * Can be called by anyone, but only if enough time has passed
     */
    function distributeRewardsAndResetAll() external {
        require(block.timestamp >= lastRewardTime + REWARD_INTERVAL, "Reward interval not met");
        
        uint256 contractBalance = address(this).balance;
        
        // Process Snake game
        Score[] storage snakeScores = topScores[GAME_SNAKE];
        if (snakeScores.length > 0 && contractBalance >= REWARD_AMOUNT) {
            address winner = snakeScores[0].player;
            (bool success, ) = payable(winner).call{value: REWARD_AMOUNT}("");
            if (success) {
                contractBalance -= REWARD_AMOUNT;
                emit RewardDistributed(winner, GAME_SNAKE, REWARD_AMOUNT, block.timestamp);
            }
        }
        delete topScores[GAME_SNAKE];
        emit LeaderboardReset(GAME_SNAKE, block.timestamp);
        
        // Process Bounce game
        Score[] storage bounceScores = topScores[GAME_BOUNCE];
        if (bounceScores.length > 0 && contractBalance >= REWARD_AMOUNT) {
            address winner = bounceScores[0].player;
            (bool success, ) = payable(winner).call{value: REWARD_AMOUNT}("");
            if (success) {
                emit RewardDistributed(winner, GAME_BOUNCE, REWARD_AMOUNT, block.timestamp);
            }
        }
        delete topScores[GAME_BOUNCE];
        emit LeaderboardReset(GAME_BOUNCE, block.timestamp);
        
        // Update last reward time
        lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get time until next reward can be distributed
     */
    function getTimeUntilNextReward() external view returns (uint256) {
        if (block.timestamp >= lastRewardTime + REWARD_INTERVAL) {
            return 0;
        }
        return (lastRewardTime + REWARD_INTERVAL) - block.timestamp;
    }
}

