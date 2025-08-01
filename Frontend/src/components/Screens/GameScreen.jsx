import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { ChessBoard } from '../GameRoom'

function GameScreen() {
  const { playerColor, playerName } = useGameStore();
  
  const player = {
    name: playerName || 'Player',
    color: playerColor || 'white'
  };
  
  return (
    <ChessBoard player={player} />
  )
}

export default GameScreen