import redis
import json
from typing import Optional, Dict, Any

class RedisGameStore:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
    
    def create_game(self, game_id: str, creator_id: str, opponent_join_id: str) -> bool:
        game_data = {
            "gameId": game_id,
            "creatorId": creator_id,
            "opponentJoinId": opponent_join_id,
            "opponentId": None,
            "status": "waiting",
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "activePlayer": "white",
            "createdAt": "timestamp"
        }
        
        # Store game data with 24h expiration
        self.redis_client.setex(f"game:{game_id}", 86400, json.dumps(game_data))
        
        # Store join mapping with shorter expiration (1 hour)
        self.redis_client.setex(f"join:{opponent_join_id}", 3600, game_id)
        
        return True
    
    def get_game(self, game_id: str) -> Optional[Dict[Any, Any]]:
        game_data = self.redis_client.get(f"game:{game_id}")
        return json.loads(game_data) if game_data else None
    
    def join_game(self, join_id: str, opponent_id: str) -> Optional[Dict[Any, Any]]:
        # Get game_id from join_id
        game_id = self.redis_client.get(f"join:{join_id}")
        if not game_id:
            return None
            
        # Get and update game data
        game_data = self.get_game(game_id)
        if not game_data or game_data["status"] != "waiting":
            return None
            
        game_data["opponentId"] = opponent_id
        game_data["status"] = "active"
        
        # Update game data
        self.redis_client.setex(f"game:{game_id}", 86400, json.dumps(game_data))
        
        # Remove join link to prevent reuse
        self.redis_client.delete(f"join:{join_id}")
        
        return game_data