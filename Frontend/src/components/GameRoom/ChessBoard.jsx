import React from 'react'
import { Chessboard, generateBoard } from 'react-chessboard';

function ChessBoard({ player }) {

  const options = {
    allowDrawingArrows: false,
    boardOrientation: player.color,
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-100">
        <Chessboard  options = {options}/>
      </div>
    </div>
  )
}

export default ChessBoard