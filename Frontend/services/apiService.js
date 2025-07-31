/**
 * API Service for Dice Chess
 * Handles all HTTP API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        `Network error: ${error.message}`,
        0,
        { originalError: error }
      );
    }
  }

  /**
   * Create a new game
   * @param {string} playerName - Creator's name
   * @returns {Promise<object>} Game creation response
   */
  async createGame(playerName) {
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      throw new APIError('Player name is required', 400);
    }

    const response = await this.makeRequest('/api/game/new', {
      method: 'POST',
      body: JSON.stringify({
        playerName: playerName.trim()
      }),
    });

    return {
      gameId: response.gameId,
      fen: response.fen,
      creatorColor: response.creatorColor,
      playerId: response.playerId,
      opponentJoinId: response.opponentJoinId,
      status: response.status,
    };
  }

  /**
   * Join an existing game
   * @param {string} gameId - Game ID
   * @param {string} opponentJoinId - Opponent join token
   * @param {string} playerName - Opponent's name
   * @returns {Promise<object>} Game join response
   */
  async joinGame(gameId, opponentJoinId, playerName) {
    if (!gameId || typeof gameId !== 'string') {
      throw new APIError('Game ID is required', 400);
    }
    
    if (!opponentJoinId || typeof opponentJoinId !== 'string') {
      throw new APIError('Opponent join ID is required', 400);
    }
    
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      throw new APIError('Player name is required', 400);
    }

    const response = await this.makeRequest('/api/game/join', {
      method: 'POST',
      body: JSON.stringify({
        gameId,
        opponentJoinId,
        playerName: playerName.trim()
      }),
    });

    return {
      gameId: response.gameId,
      fen: response.fen,
      opponentColor: response.opponentColor,
      playerId: response.playerId,
      status: response.status,
    };
  }

  /**
   * Get game state (if this endpoint exists)
   * @param {string} gameId - Game ID
   * @returns {Promise<object>} Game state
   */
  async getGameState(gameId) {
    if (!gameId || typeof gameId !== 'string') {
      throw new APIError('Game ID is required', 400);
    }

    const response = await this.makeRequest(`/api/game/${gameId}`, {
      method: 'GET',
    });

    return response;
  }

  /**
   * Health check endpoint
   * @returns {Promise<object>} Health status
   */
  async healthCheck() {
    const response = await this.makeRequest('/', {
      method: 'GET',
    });

    return response;
  }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }

  /**
   * Check if error is a specific HTTP status
   * @param {number} status - HTTP status code
   * @returns {boolean}
   */
  isStatus(status) {
    return this.status === status;
  }

  /**
   * Check if error is a client error (4xx)
   * @returns {boolean}
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   * @returns {boolean}
   */
  isServerError() {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is a network error
   * @returns {boolean}
   */
  isNetworkError() {
    return this.status === 0;
  }
}

// Create singleton instance
const apiService = new APIService();

// Export both the instance and the class for testing
export default apiService;
export { APIService, APIError };
