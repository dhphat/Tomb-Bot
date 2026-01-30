import React, { useState, useEffect } from 'react';
import GameEngine from './components/GameEngine';
import GameUI from './components/GameUI';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  
  // Initialize high score from localStorage if available
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('aerobot_highscore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      console.warn('Failed to load high score', e);
      return 0;
    }
  });

  // Save high score to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aerobot_highscore', highScore.toString());
    } catch (e) {
      console.warn('Failed to save high score', e);
    }
  }, [highScore]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
  };

  const restartGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
  };

  return (
    <div className="relative w-full h-full bg-stone-900 overflow-hidden select-none">
      <GameEngine 
        gameState={gameState} 
        setGameState={setGameState}
        score={score}
        setScore={setScore}
        setHighScore={setHighScore}
      />
      
      <GameUI 
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStart={startGame}
        onRestart={restartGame}
      />
    </div>
  );
};

export default App;