import React, { useState } from 'react';
import { Dices, Crown } from 'lucide-react';

// Card for creating a new game
function CreateCard() {
  const [playerName, setPlayerName] = useState('');

  return (
    // Added flex flex-col to allow content to grow and make the card fill the height
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-sm text-white shadow-lg flex flex-col text-center">
      {/* This div wraps the top content and will grow to fill available space, pushing the button down */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <Dices className="w-8 h-8 text-yellow-400" />
          </div>
          <Crown className="w-6 h-6 text-white/50" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create Game</h2>
        <p className="text-white/70 mb-6">Start a new dice chess adventure</p>
      </div>
      {/* The form elements are now at the bottom of the card */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 h-[92px]">
          <Dices className="w-5 h-5" />
          Create New Game
        </button>
      </div>
    </div>
  );
}

export default CreateCard;
