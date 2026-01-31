import React, { useState, useEffect } from 'react';
import GameEngine from './components/GameEngine';
import GameUI from './components/GameUI';
import { GameState } from './types';
import { loadHighScore, saveHighScore } from './services/HighScoreService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isLoadingHighScore, setIsLoadingHighScore] = useState(true);

  // Initialize high score from HighScoreService (Google Sheets + LocalStorage)
  useEffect(() => {
    const fetchScore = async () => {
      setIsLoadingHighScore(true);
      try {
        const fetchedScore = await loadHighScore();
        const validScore = Number.isFinite(Number(fetchedScore)) ? Number(fetchedScore) : 0;
        setHighScore(validScore);
      } catch (e) {
        console.error('Error in initial fetch:', e);
        setHighScore(0);
      }
      setIsLoadingHighScore(false);
    };
    fetchScore();
  }, []);

  // Save high score to HighScoreService whenever it changes
  const updateHighScore = (valueOrFn: number | ((prev: number) => number)) => {
    setHighScore(current => {
      const safeCurrent = Number.isFinite(Number(current)) ? Number(current) : 0;
      const next = typeof valueOrFn === 'function' ? valueOrFn(safeCurrent) : valueOrFn;
      const safeNext = Number.isFinite(Number(next)) ? Number(next) : 0;

      if (safeNext > 0) {
        saveHighScore(safeNext);
      }
      return safeNext;
    });
  };

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
        setHighScore={updateHighScore}
      />

      <GameUI
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStart={startGame}
        onRestart={restartGame}
        isLoadingHighScore={isLoadingHighScore}
      />

    </div>
  );
};

export default App;