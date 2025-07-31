import React, { useState } from 'react';
import { Gamepad2, Crown, ArrowRight } from 'lucide-react';

// Card for joining an existing game
function JoinCard() {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [opponentJoinId, setOpponentJoinId] = useState('');

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md text-white shadow-lg flex flex-col text-center">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <Gamepad2 className="w-8 h-8 text-yellow-400" />
          </div>
          <Crown className="w-6 h-6 text-white/50" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Join Game</h2>
        <p className="text-white/70 mb-6">Enter an existing game room</p>
      </div>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
        />
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-1/2"
          />
          <input
            type="text"
            placeholder="Join ID"
            value={opponentJoinId}
            onChange={(e) => setOpponentJoinId(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-1/2"
          />
        </div>
        <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Join Game
        </button>
      </div>
    </div>
  );
}

export default JoinCard;