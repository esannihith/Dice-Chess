/**
 * Game Store for Dice Chess
 * Global state management using Zustand
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import apiService from '../../services/apiService.js';
import socketService from '../../services/socketService.js';

// Initial game state
const initialGameState = {
  // Game basic info
  gameId: null,
  playerId: null,
  playerRole: null, // 'creator' | 'opponent'
  playerColor: null, // 'white' | 'black'
  playerName: null,
  opponentName: null,
  
  // Game status
  status: 'idle', // 'idle' | 'waiting' | 'active' | 'completed' | 'error'
  isGameStarted: false,
  isGameOver: false,
  winner: null,
  endReason: null,
  
  // Chess board state
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  activePlayer: 'white',
  moveHistory: [],
  lastMove: null,
  isCheck: false,
  
  // Join tokens
  opponentJoinId: null,
  
  // Connection status
  isConnected: false,
  connectionError: null,
  
  // UI states
  isLoading: false,
  error: null,
  
  // Player states
  players: {
    white: null,
    black: null,
  },
};

// Create the store
export const useGameStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // State
        ...initialGameState,

        // Actions

        /**
         * Reset the entire game state
         */
        resetGame: () => {
          set((state) => {
            Object.assign(state, initialGameState);
          });
        },

        /**
         * Set loading state
         * @param {boolean} loading - Loading state
         */
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        /**
         * Set error state
         * @param {string|null} error - Error message
         */
        setError: (error) => {
          set((state) => {
            state.error = error;
            if (error) {
              state.isLoading = false;
            }
          });
        },

        /**
         * Set connection status
         * @param {boolean} connected - Connection status
         * @param {string|null} error - Connection error
         */
        setConnectionStatus: (connected, error = null) => {
          set((state) => {
            state.isConnected = connected;
            state.connectionError = error;
          });
        },

        /**
         * Create a new game
         * @param {string} playerName - Creator's name
         */
        createGame: async (playerName) => {
          const { setLoading, setError } = get();
          
          try {
            setLoading(true);
            setError(null);

            const response = await apiService.createGame(playerName);
            
            set((state) => {
              state.gameId = response.gameId;
              state.playerId = response.playerId;
              state.playerRole = 'creator';
              state.playerColor = response.creatorColor;
              state.playerName = playerName;
              state.opponentJoinId = response.opponentJoinId;
              state.fen = response.fen;
              state.status = response.status;
              state.players.white = playerName; // Creator is always white
            });

            return response;
          } catch (error) {
            setError(error.message);
            throw error;
          } finally {
            setLoading(false);
          }
        },

        /**
         * Join an existing game
         * @param {string} gameId - Game ID
         * @param {string} opponentJoinId - Join token
         * @param {string} playerName - Opponent's name
         */
        joinGame: async (gameId, opponentJoinId, playerName) => {
          const { setLoading, setError } = get();
          
          try {
            setLoading(true);
            setError(null);

            const response = await apiService.joinGame(gameId, opponentJoinId, playerName);
            
            set((state) => {
              state.gameId = response.gameId;
              state.playerId = response.playerId;
              state.playerRole = 'opponent';
              state.playerColor = response.opponentColor;
              state.playerName = playerName;
              state.fen = response.fen;
              state.status = response.status;
              state.players.black = playerName; // Opponent is always black
            });

            return response;
          } catch (error) {
            setError(error.message);
            throw error;
          } finally {
            setLoading(false);
          }
        },

        /**
         * Connect to socket and join game room
         */
        connectToGame: async () => {
          const { gameId, playerId, setConnectionStatus, setError } = get();
          
          if (!gameId || !playerId) {
            throw new Error('Game ID and Player ID are required to connect');
          }

          try {
            setError(null);
            
            // Connect to socket
            await socketService.connect();
            setConnectionStatus(true);

            // Join game room
            await socketService.joinGame(gameId, playerId);

            return true;
          } catch (error) {
            setConnectionStatus(false, error.message);
            setError(error.message);
            throw error;
          }
        },

        /**
         * Disconnect from socket
         */
        disconnectFromGame: () => {
          const { gameId } = get();
          
          if (gameId) {
            socketService.leaveGame(gameId);
          }
          
          socketService.disconnect();
          
          set((state) => {
            state.isConnected = false;
            state.connectionError = null;
          });
        },

        /**
         * Make a move
         * @param {string} move - Chess move in algebraic notation
         */
        makeMove: async (move) => {
          const { gameId, playerId, activePlayer, playerColor, setError } = get();
          
          if (!gameId || !playerId) {
            throw new Error('Not connected to a game');
          }

          if (activePlayer !== playerColor) {
            throw new Error('Not your turn');
          }

          try {
            setError(null);
            await socketService.makeMove(gameId, playerId, move);
            // Board update will be handled by socket event
          } catch (error) {
            setError(error.message);
            throw error;
          }
        },

        /**
         * Handle room joined event
         * @param {object} data - Room joined data
         */
        handleRoomJoined: (data) => {
          set((state) => {
            state.gameId = data.gameId;
            state.playerId = data.playerId;
            state.playerRole = data.playerRole;
            state.playerColor = data.playerColor;
            state.playerName = data.playerName;
            state.opponentName = data.opponentName;
            
            // Update game data if provided
            if (data.gameData) {
              const gameData = data.gameData;
              state.status = gameData.status;
              state.fen = gameData.fen;
              state.activePlayer = gameData.activePlayer;
              state.moveHistory = gameData.moveHistory || [];
              
              // Set player names
              if (gameData.creatorName) {
                state.players.white = gameData.creatorName;
              }
              if (gameData.opponentName) {
                state.players.black = gameData.opponentName;
              }
            }
          });
        },

        /**
         * Handle player joined event
         * @param {object} data - Player joined data
         */
        handlePlayerJoined: (data) => {
          set((state) => {
            if (data.playerRole === 'opponent') {
              state.opponentName = data.playerName;
              state.players.black = data.playerName;
            }
            state.status = data.gameStatus;
          });
        },

        /**
         * Handle game status changed event
         * @param {object} data - Game status data
         */
        handleGameStatusChanged: (data) => {
          set((state) => {
            state.status = data.status;
            if (data.status === 'active') {
              state.isGameStarted = true;
            }
          });
        },

        /**
         * Handle board updated event
         * @param {object} data - Board update data
         */
        handleBoardUpdated: (data) => {
          set((state) => {
            state.fen = data.fen;
            state.activePlayer = data.activePlayer;
            state.lastMove = data.move;
            state.isCheck = data.isCheck || false;
            state.isGameOver = data.isGameOver || false;
            state.winner = data.winner;
            state.status = data.gameStatus;
            
            if (data.endReason) {
              state.endReason = data.endReason;
            }
            
            // Add move to history
            if (data.move && !state.moveHistory.includes(data.move)) {
              state.moveHistory.push(data.move);
            }
          });
        },

        /**
         * Handle move error event
         * @param {object} error - Move error data
         */
        handleMoveError: (error) => {
          set((state) => {
            state.error = error.message;
          });
        },

        /**
         * Handle game error event
         * @param {object} error - Game error data
         */
        handleGameError: (error) => {
          set((state) => {
            state.error = error.message;
          });
        },

        /**
         * Handle player disconnected event
         * @param {object} data - Disconnection data
         */
        handlePlayerDisconnected: (data) => {
          // Could implement pause game logic or show notification
          console.log('Player disconnected:', data);
        },

        /**
         * Handle player reconnected event
         * @param {object} data - Reconnection data
         */
        handlePlayerReconnected: (data) => {
          // Could implement resume game logic or hide notification
          console.log('Player reconnected:', data);
        },

        /**
         * Setup socket event listeners
         */
        setupSocketListeners: () => {
          const store = get();
          
          socketService.on('roomJoined', store.handleRoomJoined);
          socketService.on('playerJoined', store.handlePlayerJoined);
          socketService.on('gameStatusChanged', store.handleGameStatusChanged);
          socketService.on('boardUpdated', store.handleBoardUpdated);
          socketService.on('moveError', store.handleMoveError);
          socketService.on('gameError', store.handleGameError);
          socketService.on('playerDisconnected', store.handlePlayerDisconnected);
          socketService.on('playerReconnected', store.handlePlayerReconnected);
          
          socketService.on('connectionStatusChanged', (status) => {
            store.setConnectionStatus(status.connected, status.reason);
          });
        },

        /**
         * Remove socket event listeners
         */
        removeSocketListeners: () => {
          const store = get();
          
          socketService.off('roomJoined', store.handleRoomJoined);
          socketService.off('playerJoined', store.handlePlayerJoined);
          socketService.off('gameStatusChanged', store.handleGameStatusChanged);
          socketService.off('boardUpdated', store.handleBoardUpdated);
          socketService.off('moveError', store.handleMoveError);
          socketService.off('gameError', store.handleGameError);
          socketService.off('playerDisconnected', store.handlePlayerDisconnected);
          socketService.off('playerReconnected', store.handlePlayerReconnected);
        },

        // Computed values / Selectors

        /**
         * Get current player info
         */
        getCurrentPlayer: () => {
          const state = get();
          return {
            id: state.playerId,
            name: state.playerName,
            role: state.playerRole,
            color: state.playerColor,
          };
        },

        /**
         * Get opponent info
         */
        getOpponent: () => {
          const state = get();
          const opponentColor = state.playerColor === 'white' ? 'black' : 'white';
          return {
            name: state.opponentName,
            color: opponentColor,
          };
        },

        /**
         * Check if it's current player's turn
         */
        isMyTurn: () => {
          const state = get();
          return state.activePlayer === state.playerColor && state.status === 'active';
        },

        /**
         * Get game info for sharing
         */
        getGameInfo: () => {
          const state = get();
          return {
            gameId: state.gameId,
            opponentJoinId: state.opponentJoinId,
            playerName: state.playerName,
            status: state.status,
          };
        },

        /**
         * Check if game can be started (both players connected)
         */
        canStartGame: () => {
          const state = get();
          return state.players.white && state.players.black && state.status === 'active';
        },
      })),
      {
        name: 'dice-chess-game-store',
      }
    )
  )
);

// Subscribe to game state changes for debugging (development only)
if (import.meta.env.DEV) {
  useGameStore.subscribe(
    (state) => state.status,
    (status, previousStatus) => {
      console.log('Game status changed:', previousStatus, '→', status);
    }
  );

  useGameStore.subscribe(
    (state) => state.isConnected,
    (connected) => {
      console.log('Connection status changed:', connected);
    }
  );
}

export default useGameStore;
