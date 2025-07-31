from fastapi import FastAPI
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

@app.get("/")
def hello():
    return {"message": "Backend is running!"}

@app.post("/api/game/new")
def new_game():
    # Generate unique IDs
    game_id = str(uuid.uuid4())
    creator_id = str(uuid.uuid4())
    opponent_join_id = str(uuid.uuid4())
    
    # Create initial chess board
    board = chess.Board()
    
    # Create game in Redis store
    success = game_store.create_game(game_id, creator_id, opponent_join_id)
    
    if not success:
        return {"error": "Failed to create game"}, 500
    
    return {
        "gameId": game_id,
        "fen": board.fen(),
        "creatorColor": "white",
        "playerId": creator_id,
        "opponentJoinId": opponent_join_id
    }

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def join_game(sid, data):
    try:
        game_id = data.get('gameId')
        player_id = data.get('playerId')
        
        if not game_id or not player_id:
            await sio.emit('error', {'message': 'Missing gameId or playerId'}, room=sid)
            return
        
        # Verify game exists in Redis
        game_data = game_store.get_game(game_id)
        if not game_data:
            await sio.emit('error', {'message': 'Game not found'}, room=sid)
            return
        
        # Add client to game room
        await sio.enter_room(sid, game_id)
        
        # Confirm room joined
        await sio.emit('room_joined', {
            'gameId': game_id,
            'playerId': player_id,
            'gameData': game_data
        }, room=sid)
        
        # Notify other players in the room
        await sio.emit('player_joined', {
            'playerId': player_id,
            'gameId': game_id
        }, room=game_id, skip_sid=sid)
        
        print(f"Client {sid} joined game room {game_id}")
        
    except Exception as e:
        print(f"Error in join_game: {e}")
        await sio.emit('error', {'message': 'Failed to join game'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)