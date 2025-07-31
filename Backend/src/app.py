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

@sio.event
async def make_move(sid, data):
    """
    Handle player moves in real-time
    Expects: gameId, playerId, move (in UCI format like 'e2e4')
    """
    try:
        game_id = data.get('gameId')
        player_id = data.get('playerId')
        move = data.get('move')
        
        if not all([game_id, player_id, move]):
            await sio.emit('move_error', {
                'message': 'Missing required data: gameId, playerId, or move',
                'gameId': game_id
            }, room=sid)
            return
        
        # Get current game state
        game_data = game_store.get_game(game_id)
        if not game_data:
            await sio.emit('move_error', {
                'message': 'Game not found',
                'gameId': game_id
            }, room=sid)
            return
        
        # Verify player is part of this game
        if player_id not in [game_data.get("creatorId"), game_data.get("opponentId")]:
            await sio.emit('move_error', {
                'message': 'Player not authorized for this game',
                'gameId': game_id
            }, room=sid)
            return
        
        # Check if game is active
        if game_data.get("status") != "active":
            await sio.emit('move_error', {
                'message': 'Game is not active',
                'gameId': game_id
            }, room=sid)
            return
        
        # Determine player color
        player_color = "white" if player_id == game_data.get("creatorId") else "black"
        
        # Check if it's the player's turn
        if game_data.get("activePlayer") != player_color:
            await sio.emit('move_error', {
                'message': 'Not your turn',
                'gameId': game_id
            }, room=sid)
            return
        
        # Create chess board from current FEN
        try:
            board = chess.Board(game_data.get("fen"))
        except ValueError as e:
            await sio.emit('move_error', {
                'message': f'Invalid board state: {str(e)}',
                'gameId': game_id
            }, room=sid)
            return
        
        # Validate and apply the move
        try:
            chess_move = chess.Move.from_uci(move)
            if chess_move not in board.legal_moves:
                await sio.emit('move_error', {
                    'message': f'Invalid move: {move}',
                    'gameId': game_id
                }, room=sid)
                return
            
            # Apply the move
            board.push(chess_move)
            
        except ValueError as e:
            await sio.emit('move_error', {
                'message': f'Invalid move format: {move}',
                'gameId': game_id
            }, room=sid)
            return
        
        # Determine next active player
        next_active_player = "black" if player_color == "white" else "white"
        
        # Check game end conditions
        is_check = board.is_check()
        is_game_over = board.is_game_over()
        winner = None
        end_reason = None
        game_status = "active"
        
        if is_game_over:
            game_status = "completed"
            if board.is_checkmate():
                winner = player_color
                end_reason = "checkmate"
            elif board.is_stalemate():
                end_reason = "stalemate"
            elif board.is_insufficient_material():
                end_reason = "insufficient_material"
            elif board.is_seventyfive_moves():
                end_reason = "seventyfive_moves"
            elif board.is_fivefold_repetition():
                end_reason = "fivefold_repetition"
            else:
                end_reason = "draw"
        
        # Update game state in Redis
        updates = {
            "fen": board.fen(),
            "activePlayer": next_active_player,
            "status": game_status,
            "lastMoveAt": int(time.time())
        }
        
        # Add move to history if it exists
        move_history = game_data.get("moveHistory", [])
        move_history.append(move)
        updates["moveHistory"] = move_history
        
        success = game_store.update_game(game_id, updates)
        if not success:
            await sio.emit('move_error', {
                'message': 'Failed to update game state',
                'gameId': game_id
            }, room=sid)
            return
        
        # Prepare broadcast data
        broadcast_data = {
            "gameId": game_id,
            "fen": board.fen(),
            "move": move,
            "playerId": player_id,
            "color": player_color,
            "activePlayer": next_active_player,
            "isCheck": is_check,
            "isGameOver": is_game_over,
            "winner": winner,
            "gameStatus": game_status
        }
        
        if end_reason:
            broadcast_data["endReason"] = end_reason
        
        # Broadcast the move to all players in the game room
        await sio.emit('board_updated', broadcast_data, room=game_id)
        
        print(f"Move {move} by {player_color} player in game {game_id}")
        
    except Exception as e:
        print(f"Error in make_move: {e}")
        await sio.emit('move_error', {
            'message': 'Internal server error',
            'gameId': data.get('gameId')
        }, room=sid)

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)