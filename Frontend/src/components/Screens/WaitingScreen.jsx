import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faClock, faGamepad, faLightbulb, faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';
import { useGameStore } from '../../store/gameStore';

function WaitingScreen() {
  const navigate = useNavigate();
  const {
    gameId,
    playerName,
    opponentName,
    playerRole,
    playerColor,
    status,
    isConnected,
    connectionError,
    error,
    players,
    opponentJoinId,
    connectToGame,
    disconnectFromGame,
    setupSocketListeners,
    removeSocketListeners,
    resetGame
  } = useGameStore();

  // Handle socket connection and navigation
  useEffect(() => {
    // If no game data, redirect to home
    if (!gameId || !playerName) {
      navigate('/');
      return;
    }

    // Setup socket listeners
    setupSocketListeners();

    // Connect to game if not already connected
    if (!isConnected) {
      connectToGame().catch(error => {
        console.error('Failed to connect to game:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      removeSocketListeners();
    };
  }, [gameId, playerName, isConnected, navigate, connectToGame, setupSocketListeners, removeSocketListeners]);

  // Navigate to game when both players are ready
  useEffect(() => {
    if (status === 'active' && players.white && players.black) {
      navigate('/game');
    }
  }, [status, players, navigate]);

  const handleLeaveGame = () => {
    disconnectFromGame();
    resetGame();
    navigate('/');
  };

  const handleCopyGameInfo = () => {
    if (playerRole === 'creator' && opponentJoinId) {
      const gameInfo = `Game ID: ${gameId}\nJoin ID: ${opponentJoinId}`;
      navigator.clipboard.writeText(gameInfo).then(() => {
        // Could add a toast notification here
        console.log('Game info copied to clipboard');
      });
    }
  };

  const getPlayerStatus = (color) => {
    const playerName = players[color];
    if (playerName) {
      return { name: playerName, status: 'Ready', connected: true };
    }
    return { name: 'Waiting...', status: 'Connecting', connected: false };
  };

  const currentPlayerStatus = getPlayerStatus(playerColor);
  const opponentColor = playerColor === 'white' ? 'black' : 'white';
  const opponentStatus = getPlayerStatus(opponentColor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-800 via-orange-700 to-red-800 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-white">
          <FontAwesomeIcon icon={faDice} className="text-2xl" />
          <span className="text-xl font-bold">Dice Chess</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm">Game ID: {gameId?.slice(0, 8)}...</span>
          <button
            onClick={handleLeaveGame}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTimes} />
            Leave Game
          </button>
        </div>
      </div>

      {/* Main waiting card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'waiting' ? 'Waiting for Opponent' : 'Game Starting...'}
          </h1>
          <p className="text-white/70 text-sm">
            {status === 'waiting' 
              ? 'Game will start when another player joins' 
              : 'Both players connected!'
            }
          </p>
        </div>

        {/* Players section */}
        <div className="flex items-center justify-center mb-8 relative">
          {/* Current player */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-2 border-4 border-white/20">
                <span className="text-white font-bold text-lg">
                  {playerName?.charAt(0)?.toUpperCase() || 'Y'}
                </span>
              </div>
              {currentPlayerStatus.connected && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <span className="text-white font-medium text-sm">You</span>
            <span className="text-white/60 text-xs">{playerName}</span>
            <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-300 text-xs font-medium">Ready</span>
            </div>
          </div>

          {/* Dice icon in center */}
          <div className="mx-8 flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
              <FontAwesomeIcon icon={faDice} className="text-yellow-400 text-xl" />
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 border-4 border-white/20">
                {opponentStatus.connected ? (
                  <span className="text-white font-bold text-lg">
                    {opponentName?.charAt(0)?.toUpperCase() || 'O'}
                  </span>
                ) : (
                  <span className="text-white/40 text-2xl">?</span>
                )}
              </div>
              {opponentStatus.connected && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <span className="text-white font-medium text-sm">Opponent</span>
            <span className="text-white/60 text-xs">{opponentStatus.name}</span>
            <div className="mt-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
              <span className="text-white/60 text-xs font-medium">{opponentStatus.status}</span>
            </div>
          </div>
        </div>

        {/* Game info cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <FontAwesomeIcon icon={faClock} className="text-yellow-400 text-lg mb-2" />
            <div className="text-white font-medium text-sm mb-1">Time Control</div>
            <div className="text-white/70 text-xs">10 min + 5 sec</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
            <FontAwesomeIcon icon={faGamepad} className="text-yellow-400 text-lg mb-2" />
            <div className="text-white font-medium text-sm mb-1">Game Mode</div>
            <div className="text-white/70 text-xs">Dice Chess</div>
          </div>
        </div>

        {/* Pro tip */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400" />
            <span className="text-yellow-300 font-medium text-sm">Pro Tip</span>
          </div>
          <p className="text-white/80 text-xs leading-relaxed">
            In Dice Chess, you roll a die to determine which piece type you can move each turn!
          </p>
        </div>

        {/* Share game info (only for creator) */}
        {playerRole === 'creator' && status === 'waiting' && (
          <div className="text-center">
            <button
              onClick={handleCopyGameInfo}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <FontAwesomeIcon icon={faCopy} />
              Copy Game Info
            </button>
            <p className="text-white/60 text-xs mt-2">Share with your opponent to join</p>
          </div>
        )}

        {/* Connection status */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-xs text-center">{connectionError}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-xs text-center">{error}</p>
          </div>
        )}

        {!isConnected && !connectionError && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs text-center">Connecting to game...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingScreen;