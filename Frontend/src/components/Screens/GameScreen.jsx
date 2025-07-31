import React from 'react'
import { ChessBoard } from '../GameRoom'

function GameScreen() {
  const player ={
    name: 'Player 1',
    color: 'white'
  }
  return (
    <ChessBoard player={player} />
  )
}

export default GameScreen