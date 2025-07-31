# Backend Flow Documentation

## Overview
This document provides a comprehensive guide to the Dice Chess backend flow, from game creation to real-time gameplay. The backend uses FastAPI for HTTP endpoints, Socket.IO for real-time communication, and Redis for game state management.

## Architecture Components

- **FastAPI**: HTTP API endpoints for game creation and joining
- **Socket.IO**: Real-time communication for game events
- **Redis**: Persistent storage for game state
- **python-chess**: Chess logic validation and board management

## Complete Game Flow

### 1. Creator Flow - Game Creation

#### Step 1: HTTP Request - Create New Game
**Endpoint**: `POST /api/game/new`

**Request**:
```http
POST /api/game/new
Content-Type: application/json

{
  "playerName": "John Doe"
}
```

**Response**:
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "creatorColor": "white",
  "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  "opponentJoinId": "opponent-join-uuid-9z8y7x6w-5v4u-3t2s-1r0q-ponmlkjihgfe",
  "status": "waiting"
}
```

#### Step 2: Socket.IO Connection - Join Game Room
**Event**: `join_game`

**Client Emits**:
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890"
}
```

**Server Responds**:
```json
{
  "event": "room_joined",
  "data": {
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
    "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
    "playerRole": "creator",
    "playerColor": "white",
    "playerName": "John Doe",
    "opponentName": null,
    "gameData": {
      "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
      "creatorId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
      "creatorName": "John Doe",
      "opponentJoinId": "opponent-join-uuid-9z8y7x6w-5v4u-3t2s-1r0q-ponmlkjihgfe",
      "opponentId": null,
      "opponentName": null,
      "status": "waiting",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "activePlayer": "white",
      "createdAt": 1704067200
    }
  }
}
```

### 2. Opponent Flow - Joining Game

#### Step 1: HTTP Request - Join Existing Game
**Endpoint**: `POST /api/game/join`

**Request**:
```http
POST /api/game/join
Content-Type: application/json

{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "opponentJoinId": "opponent-join-uuid-9z8y7x6w-5v4u-3t2s-1r0q-ponmlkjihgfe",
  "playerName": "Jane Smith"
}
```

**Response**:
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "opponentColor": "black",
  "playerId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc",
  "status": "active"
}
```

#### Step 2: Socket.IO Connection - Join Game Room
**Event**: `join_game`

**Client Emits**:
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "playerId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc"
}
```

**Server Responds to Opponent**:
```json
{
  "event": "room_joined",
  "data": {
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
    "playerId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc",
    "playerRole": "opponent",
    "playerColor": "black",
    "playerName": "Jane Smith",
    "opponentName": "John Doe",
    "gameData": {
      "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
      "creatorId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
      "creatorName": "John Doe",
      "opponentId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc",
      "opponentName": "Jane Smith",
      "status": "waiting",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "activePlayer": "white",
      "createdAt": 1704067200
    }
  }
}
```

**Server Broadcasts to Creator**:
```json
{
  "event": "player_joined",
  "data": {
    "playerId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc",
    "playerRole": "opponent",
    "playerName": "Jane Smith",
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
    "gameStatus": "waiting"
  }
}
```
At this point, the game status remains "waiting". The server will broadcast a "game_status_changed" event next, which updates the status to "active" for all clients.

**Server Broadcasts Game Status Change**:
```json
{
  "event": "game_status_changed",
  "data": {
    "status": "active",
    "message": "Both players connected. Game is now active!"
  }
}
```

### 3. Gameplay Flow - Making Moves

#### Step 1: Player Makes a Move
**Event**: `make_move`

**Client Emits**:
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  "move": "e2e4"
}
```

#### Step 2: Server Validates and Updates Game State

**Server Broadcasts to All Players in Room**:
```json
{
  "event": "board_updated",
  "data": {
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "move": "e2e4",
    "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
    "color": "white",
    "activePlayer": "black",
    "isCheck": false,
    "isGameOver": false,
    "winner": null,
    "gameStatus": "active"
  }
}
```

#### Step 3: Invalid Move Handling

**Server Responds to Player Who Made Invalid Move**:
```json
{
  "event": "move_error",
  "data": {
    "message": "Invalid move: e2e5",
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc"
  }
}
```

### 4. Game End Scenarios

#### Checkmate Example
**Server Broadcasts**:
```json
{
  "event": "board_updated",
  "data": {
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
    "fen": "rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 1 4",
    "move": "Qh5",
    "playerId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
    "color": "white",
    "activePlayer": "black",
    "isCheck": true,
    "isGameOver": true,
    "winner": "white",
    "gameStatus": "completed",
    "endReason": "checkmate"
  }
}
```

## Error Handling

### HTTP Errors

#### Game Not Found
```json
{
  "detail": "Game not found"
}
```

#### Invalid Join ID
```json
{
  "detail": "Invalid join ID or game not available"
}
```

### Socket.IO Errors

#### Unauthorized Player
```json
{
  "event": "error",
  "data": {
    "message": "Player not authorized for this game"
  }
}
```

#### Not Player's Turn
```json
{
  "event": "move_error",
  "data": {
    "message": "Not your turn",
    "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc"
  }
}
```

## Redis Data Structure

### Game Data Format
```json
{
  "gameId": "f8a1b2c4-e6d7-4321-9876-123456789abc",
  "creatorId": "creator-uuid-1a2b3c4d-5e6f-7890-abcd-ef1234567890",
  "opponentJoinId": "opponent-join-uuid-9z8y7x6w-5v4u-3t2s-1r0q-ponmlkjihgfe",
  "opponentId": "opponent-uuid-9x8w7v6u-5t4s-3r2q-1p0o-nmlkjihgfedc",
  "status": "active",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "activePlayer": "white",
  "createdAt": 1704067200,
  "lastMoveAt": 1704067300,
  "moveHistory": ["e2e4", "e7e5", "Nf3"]
}
```

### Redis Keys
- `game:{gameId}` - Stores game data (expires in 24 hours)
- `join:{opponentJoinId}` - Maps join ID to game ID (expires in 1 hour)

## Security Considerations

1. **Opponent Join ID**: One-time use token that expires after successful join
2. **Player Validation**: All moves validated against stored player IDs
3. **Game State Validation**: All moves validated using python-chess library
4. **Turn Validation**: Ensures only the active player can make moves
5. **Redis Expiration**: Automatic cleanup of abandoned games

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/game/new` | Create new game | No |
| POST | `/api/game/join` | Join existing game | No |
| GET | `/api/game/{gameId}` | Get game state | No |

## Socket.IO Events Summary

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_game` | Client → Server | Join game room |
| `room_joined` | Server → Client | Confirm room join |
| `player_joined` | Server → Clients | Notify player joined |
| `game_status_changed` | Server → Clients | Game status update |
| `make_move` | Client → Server | Submit move |
| `board_updated` | Server → Clients | Board state update |
| `move_error` | Server → Client | Invalid move notification |
| `error` | Server → Client | General error notification |