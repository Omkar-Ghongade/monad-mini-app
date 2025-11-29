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
    
    event ScoreSubmitted(
        uint8 indexed gameId,
        address indexed player,
        uint256 score,
        bool isNewBest
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
}

