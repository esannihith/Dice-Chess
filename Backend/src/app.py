from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import chess
import socketio
import uvicorn
from .RedisGameStore import RedisGameStore

# Create Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*")

# Create FastAPI app
app = FastAPI()

# Initialize Redis game store
game_store = RedisGameStore()

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

# Pydantic models for request validation
class JoinGameRequest(BaseModel):
    gameId: str
    opponentJoinId: str

@app.get("/")
def hello():
    return {"message": "Backend is running!"}

@app.post("/api/game/new")
def new_game():
    """
    Creator flow: Create a new game
    Returns: gameId, playerId (creatorId), fen, creatorColor, opponentJoinId
    """
    try:
        # Generate unique IDs
        game_id = str(uuid.uuid4())
        creator_id = str(uuid.uuid4())  # This will be playerId for creator
        opponent_join_id = str(uuid.uuid4())
        
        # Create initial chess board
        board = chess.Board()
        
        # Create game in Redis store
        success = game_store.create_game(game_id, creator_id, opponent_join_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create game")
        
        return {
            "gameId": game_id,
            "fen": board.fen(),
            "creatorColor": "white",
            "playerId": creator_id,  # Creator's playerId
            "opponentJoinId": opponent_join_id,
            "status": "waiting"
        }
    
    except Exception as e:
        print(f"Error creating game: {e}")
        raise HTTPException(status_code=500, detail="Failed to create game")

@app.post("/api/game/join")
def join_game_http(request: JoinGameRequest):
    """
    Opponent flow: Join an existing game using gameId and opponentJoinId
    Returns: gameId, playerId (opponentId), fen, opponentColor
    """
    try:
        game_id = request.gameId
        opponent_join_id = request.opponentJoinId
        
        # Generate new playerId for opponent
        opponent_id = str(uuid.uuid4())
        
        # Attempt to join the game using the RedisGameStore
        game_data = game_store.join_game(opponent_join_id, opponent_id)
        
        if not game_data:
            raise HTTPException(
                status_code=400, 
                detail="Invalid join ID or game not available"
            )
        
        # Verify the gameId matches (additional security check)
        if game_data["gameId"] != game_id:
            raise HTTPException(
                status_code=400, 
                detail="Game ID mismatch"
            )
        
        return {
            "gameId": game_data["gameId"],
            "fen": game_data["fen"],
            "opponentColor": "black",
            "playerId": opponent_id,  # Opponent's playerId
            "status": game_data["status"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error joining game: {e}")
        raise HTTPException(status_code=500, detail="Failed to join game")

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def join_game(sid, data):
    """
    Socket.IO handler for both creator and opponent joining the game room
    Expects: gameId and playerId (either creatorId or opponentId)
    """
    try:
        game_id = data.get('gameId')
        player_id = data.get('playerId')
        
        if not game_id or not player_id:
            await sio.emit('error', {
                'message': 'Missing gameId or playerId'
            }, room=sid)
            return
        
        # Verify game exists in Redis
        game_data = game_store.get_game(game_id)
        if not game_data:
            await sio.emit('error', {
                'message': 'Game not found'
            }, room=sid)
            return
        
        # Verify player is part of this game
        if player_id not in [game_data.get("creatorId"), game_data.get("opponentId")]:
            await sio.emit('error', {
                'message': 'Player not authorized for this game'
            }, room=sid)
            return
        
        # Add client to game room
        await sio.enter_room(sid, game_id)
        
        # Determine player role
        player_role = "creator" if player_id == game_data.get("creatorId") else "opponent"
        player_color = "white" if player_role == "creator" else "black"
        
        # Confirm room joined
        await sio.emit('room_joined', {
            'gameId': game_id,
            'playerId': player_id,
            'playerRole': player_role,
            'playerColor': player_color,
            'gameData': game_data
        }, room=sid)
        
        # Notify other players in the room
        await sio.emit('player_joined', {
            'playerId': player_id,
            'playerRole': player_role,
            'gameId': game_id,
            'gameStatus': game_data["status"]
        }, room=game_id, skip_sid=sid)
        
        # If opponent just joined, broadcast game status change to active
        if player_role == "opponent" and game_data["status"] == "active":
            await sio.emit('game_status_changed', {
                'status': 'active',
                'message': 'Both players connected. Game is now active!'
            }, room=game_id)
        
        print(f"Client {sid} ({player_role}) joined game room {game_id}")
        
    except Exception as e:
        print(f"Error in join_game: {e}")
        await sio.emit('error', {
            'message': 'Failed to join game room'
        }, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)