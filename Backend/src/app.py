from fastapi import FastAPI
import chess
import socketio
import uvicorn

# Create Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*")

# Create FastAPI app
app = FastAPI()

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

@app.get("/")
def hello():
    return {"message": "Backend is running!"}

@app.get("/api/game/new")
def new_game():
    board = chess.Board()
    return {"fen": board.fen()}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)