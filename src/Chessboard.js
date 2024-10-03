// src/Chessboard.js
import {Chess} from 'chess.js';
import Chessboard from 'chessboardjsx';
import React, {useState} from 'react';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());

  const handleMove = ({sourceSquare, targetSquare}) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',  // Automatically promote to queen (optional)
      });

      // If the move is invalid (null), just return without updating the state
      if (move === null) {
        console.log('Invalid move attempted');
        return;
      }

      // If the move is valid, update the game state
      setGame(new Chess(game.fen()));  // Use the new FEN to reset the board
    } catch (error) {
      // Handle the error gracefully, log it, and don't crash the app
      console.error('An error occurred while making the move:', error);
    }
  };

  console.log(game.fen())

  return (
    <div className='chess-container'>
      <Chessboard
        position={game.fen()}
        onDrop={handleMove}
        width={800}
        showNotation={true}
        boardStyle={
    {
      borderRadius: '10px', boxShadow: `0 5px 15px rgba(0, 0, 0, 0.8)`,
    }}
      />
    </div>
  );
};

export default ChessGame;
