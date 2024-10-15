import {Chess} from 'chess.js';
import Chessboard from 'chessboardjsx';
import React, {useState} from 'react';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);

  // Function to make a move for the user (white)
  const handleMove = async ({sourceSquare, targetSquare, promotion}) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotion,  // Automatically promote to queen if needed
      });

      // If the move is invalid, return early
      if (move === null) {
        console.log('Invalid move attempted');
        return;
      }

      // Update move history with the new move
      setMoveHistory((prevHistory) => [...prevHistory, move.san]);

      // Update the game state for user's move
      setGame(new Chess(game.fen()));

      // After user moves, fetch the best move from the backend for black
      await getBestMoveFromEngine();

    } catch (error) {
      console.error('An error occurred while making the move:', error);
    }
  };

  // Function to fetch the best move from the backend for the engine (black)
  const getBestMoveFromEngine = async () => {
    const fen = game.fen();  // Get current FEN after user's move
    console.log('Sending FEN to backend:', fen);

    try {
      const response = await fetch('http://localhost:18080/chess/best_move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({fen}),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data from backend:', data);

      if (data.from && data.to) {
        // Make the engine's move (black)
        const engineMove = game.move({
          from: data.from,
          to: data.to,
          promotion: data.promotion || 'q',
        });

        if (engineMove !== null) {
          // Update move history with the new engine move
          setMoveHistory((prevHistory) => [...prevHistory, engineMove.san]);

          // Update the game state after engine's move
          setGame(new Chess(game.fen()));
        }
      } else {
        console.log('Invalid engine response');
      }
    } catch (error) {
      console.error(
          'An error occurred while fetching the best move from the engine:',
          error);
    }
  };

  // clang-format off
  return (
    <div className="game-container">
      <div className="board-container">
        <Chessboard
          position={game.fen()}
          onDrop={handleMove}
          width={800}
          showNotation={true}
          boardStyle={{
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.8)',
          }}
        />
      </div>
  
      <div className="move-history">
        <h2>Move History</h2>
        <ul>
          {moveHistory.map((move, index) => (
            <li key={index}>
              {Math.floor(index) + 1}{index % 2 === 0 ? '. White' : '. Black'}: {move}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  // clang-format off
};

export default ChessGame;