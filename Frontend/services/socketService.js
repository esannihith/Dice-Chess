/**
 * Socket Service for Dice Chess
 * Handles all Socket.IO communication with the backend
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
  }

  /**
   * Connect to the Socket.IO server
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        timeout: 20000,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000; // Reset delay
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        this.emit('connectionStatusChanged', { connected: false, reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts === 0) {
          reject(new SocketError('Failed to connect to server', 'CONNECTION_ERROR', error));
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
        this.emit('connectionStatusChanged', { connected: true, reconnected: true });
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Socket reconnection attempt:', attemptNumber);
        this.reconnectAttempts = attemptNumber;
        this.emit('connectionStatusChanged', { 
          connected: false, 
          reconnecting: true, 
          attempt: attemptNumber 
        });
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        this.isConnected = false;
        this.emit('connectionStatusChanged', { 
          connected: false, 
          reconnectFailed: true 
        });
      });

      // Game-specific event handlers
      this.setupGameEventHandlers();
    });
  }

  /**
   * Disconnect from the Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  /**
   * Setup game-specific event handlers
   */
  setupGameEventHandlers() {
    if (!this.socket) return;

    // Game room events
    this.socket.on('room_joined', (data) => {
      console.log('Room joined:', data);
      this.emit('roomJoined', data);
    });

    this.socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
      this.emit('playerJoined', data);
    });

    this.socket.on('game_status_changed', (data) => {
      console.log('Game status changed:', data);
      this.emit('gameStatusChanged', data);
    });

    // Gameplay events
    this.socket.on('board_updated', (data) => {
      console.log('Board updated:', data);
      this.emit('boardUpdated', data);
    });

    this.socket.on('move_error', (data) => {
      console.log('Move error:', data);
      this.emit('moveError', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('gameError', data);
    });

    // Player disconnection
    this.socket.on('player_disconnected', (data) => {
      console.log('Player disconnected:', data);
      this.emit('playerDisconnected', data);
    });

    this.socket.on('player_reconnected', (data) => {
      console.log('Player reconnected:', data);
      this.emit('playerReconnected', data);
    });
  }

  /**
   * Join a game room
   * @param {string} gameId - Game ID
   * @param {string} playerId - Player ID
   * @returns {Promise<void>}
   */
  async joinGame(gameId, playerId) {
    if (!this.isConnected) {
      throw new SocketError('Socket not connected', 'NOT_CONNECTED');
    }

    if (!gameId || !playerId) {
      throw new SocketError('Game ID and Player ID are required', 'INVALID_PARAMS');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new SocketError('Join game timeout', 'TIMEOUT'));
      }, 10000);

      const onRoomJoined = (data) => {
        clearTimeout(timeout);
        this.off('roomJoined', onRoomJoined);
        this.off('gameError', onError);
        resolve(data);
      };

      const onError = (error) => {
        clearTimeout(timeout);
        this.off('roomJoined', onRoomJoined);
        this.off('gameError', onError);
        reject(new SocketError(error.message || 'Failed to join game', 'JOIN_FAILED', error));
      };

      this.on('roomJoined', onRoomJoined);
      this.on('gameError', onError);

      this.socket.emit('join_game', { gameId, playerId });
    });
  }

  /**
   * Make a move in the game
   * @param {string} gameId - Game ID
   * @param {string} playerId - Player ID
   * @param {string} move - Chess move in algebraic notation
   * @returns {Promise<void>}
   */
  async makeMove(gameId, playerId, move) {
    if (!this.isConnected) {
      throw new SocketError('Socket not connected', 'NOT_CONNECTED');
    }

    if (!gameId || !playerId || !move) {
      throw new SocketError('Game ID, Player ID, and move are required', 'INVALID_PARAMS');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new SocketError('Move timeout', 'TIMEOUT'));
      }, 10000);

      const onBoardUpdated = (data) => {
        if (data.gameId === gameId) {
          clearTimeout(timeout);
          this.off('boardUpdated', onBoardUpdated);
          this.off('moveError', onMoveError);
          resolve(data);
        }
      };

      const onMoveError = (error) => {
        if (error.gameId === gameId) {
          clearTimeout(timeout);
          this.off('boardUpdated', onBoardUpdated);
          this.off('moveError', onMoveError);
          reject(new SocketError(error.message || 'Invalid move', 'MOVE_ERROR', error));
        }
      };

      this.on('boardUpdated', onBoardUpdated);
      this.on('moveError', onMoveError);

      this.socket.emit('make_move', { gameId, playerId, move });
    });
  }

  /**
   * Leave the current game room
   * @param {string} gameId - Game ID
   */
  leaveGame(gameId) {
    if (this.socket && gameId) {
      this.socket.emit('leave_game', { gameId });
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  /**
   * Get socket ID
   * @returns {string|null}
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  /**
   * Send a raw socket event (for debugging or custom events)
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  sendRawEvent(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      throw new SocketError('Socket not connected', 'NOT_CONNECTED');
    }
  }
}

/**
 * Custom Socket Error class
 */
class SocketError extends Error {
  constructor(message, code = 'UNKNOWN', data = {}) {
    super(message);
    this.name = 'SocketError';
    this.code = code;
    this.data = data;
  }

  /**
   * Check if error is a specific code
   * @param {string} code - Error code
   * @returns {boolean}
   */
  isCode(code) {
    return this.code === code;
  }

  /**
   * Check if error is connection related
   * @returns {boolean}
   */
  isConnectionError() {
    return ['CONNECTION_ERROR', 'NOT_CONNECTED', 'TIMEOUT'].includes(this.code);
  }

  /**
   * Check if error is game related
   * @returns {boolean}
   */
  isGameError() {
    return ['JOIN_FAILED', 'MOVE_ERROR', 'INVALID_PARAMS'].includes(this.code);
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export both the instance and the class for testing
export default socketService;
export { SocketService, SocketError };
