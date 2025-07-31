import redis
import json
import time
from typing import Optional, Dict, Any

class RedisGameStore:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
    
    def create_game(self, game_id: str, creator_id: str, creator_name: str, opponent_join_id: str) -> bool:
        """
        Create a new game with creator
        """
        game_data = {
            "gameId": game_id,
            "creatorId": creator_id,  # Creator's playerId
            "creatorName": creator_name,       # Set when creating game
            "opponentJoinId": opponent_join_id,
            "opponentId": None,  # Will be set when opponent joins
            "opponentName": None,  # Will be set when opponent joins
            "status": "waiting",
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "activePlayer": "white",
            "createdAt": int(time.time()),
            "moveHistory": []
        }
        
        try:
            # Store game data with 24h expiration
            self.redis_client.setex(f"game:{game_id}", 86400, json.dumps(game_data))
            
            # Store join mapping with shorter expiration (1 hour)
            # This maps opponentJoinId -> gameId for secure joining
            self.redis_client.setex(f"join:{opponent_join_id}", 3600, game_id)
            
            return True
        except Exception as e:
            print(f"Error creating game in Redis: {e}")
            return False
    
    def get_game(self, game_id: str) -> Optional[Dict[Any, Any]]:
        """
        Retrieve game data by gameId
        """
        try:
            game_data = self.redis_client.get(f"game:{game_id}")
            return json.loads(game_data) if game_data else None
        except Exception as e:
            print(f"Error getting game from Redis: {e}")
            return None
    
    def join_game(self, opponent_join_id: str, opponent_id: str, opponent_name: str) -> Optional[Dict[Any, Any]]:
        """
        Opponent joins game using opponentJoinId
        Returns updated game data or None if join failed
        """
        try:
            # Get game_id from opponent_join_id
            game_id = self.redis_client.get(f"join:{opponent_join_id}")
            if not game_id:
                print(f"Invalid or expired join ID: {opponent_join_id}")
                return None
                
            # Get current game data
            game_data = self.get_game(game_id)
            if not game_data:
                print(f"Game not found: {game_id}")
                return None
                
            # Check if game is still waiting for opponent
            if game_data["status"] != "waiting":
                print(f"Game {game_id} is not waiting for opponent. Status: {game_data['status']}")
                return None
                
            # Update game data with opponent
            game_data["opponentId"] = opponent_id
            game_data["opponentName"] = opponent_name
            # game status will remain "waiting", "game_status_changed" will change status to active and broadcast to all clients
            
            # Save updated game data
            self.redis_client.setex(f"game:{game_id}", 86400, json.dumps(game_data))
            
            # Remove join link to prevent reuse
            self.redis_client.delete(f"join:{opponent_join_id}")
            
            print(f"Opponent {opponent_id} successfully joined game {game_id}")
            return game_data
            
        except Exception as e:
            print(f"Error in join_game: {e}")
            return None
    
    def update_game(self, game_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update specific fields in game data
        """
        try:
            game_data = self.get_game(game_id)
            if not game_data:
                return False
                
            # Apply updates
            game_data.update(updates)
            
            # Save updated data
            self.redis_client.setex(f"game:{game_id}", 86400, json.dumps(game_data))
            return True
            
        except Exception as e:
            print(f"Error updating game: {e}")
            return False
    
    def delete_game(self, game_id: str) -> bool:
        """
        Delete a game from Redis
        """
        try:
            result = self.redis_client.delete(f"game:{game_id}")
            return result > 0
        except Exception as e:
            print(f"Error deleting game: {e}")
            return False