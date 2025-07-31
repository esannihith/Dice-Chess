import React from 'react';
import CreateCard from './CreateCard';
import JoinCard from './JoinCard';
import DiceChessImg from '../../assets/Dice-Chess.png';

// Main App component to hold everything
function RoomActions() {
  return (
    // Main container with a background image
    <div className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${DiceChessImg})` }}>
      {/* Overlay to darken the background image slightly */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Main content container - using items-stretch to make cards equal height */}
      <main className="relative z-10 flex flex-col md:flex-row items-stretch justify-center gap-8 p-4">
        <CreateCard />
        <JoinCard />
      </main>
    </div>
  );
}

export default RoomActions;