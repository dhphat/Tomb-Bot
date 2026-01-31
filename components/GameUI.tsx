import React from 'react';
import { GameState } from '../types';
import { Trophy, Play, RotateCcw, Timer, Puzzle, Crown, Maximize, Minimize } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
  isLoadingHighScore?: boolean;
}

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  score,
  highScore,
  onStart,
  onRestart,
  isLoadingHighScore,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  const safeScore = isNaN(Number(score)) ? 0 : Number(score);
  const safeHighScore = isNaN(Number(highScore)) ? 0 : Number(highScore);
  const isNewRecord = safeScore > safeHighScore && safeHighScore > 0;

  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div
            className={`
              backdrop-blur-md px-5 py-3 rounded-2xl font-mono flex flex-col min-w-[140px] border transition-all duration-500
              ${isNewRecord
                ? 'bg-yellow-900/60 border-yellow-400 text-yellow-100 shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-105'
                : 'bg-black/60 border-white/10 text-white shadow-lg'}
            `}
          >
            {/* Main Score Line */}
            <div className="flex items-center gap-3">
              {isNewRecord ? (
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />
              ) : (
                <Trophy className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`text-3xl font-black tracking-tighter ${isNewRecord ? 'text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : ''}`}>
                {safeScore}m
              </span>
            </div>

            {/* Subtext: Best or New Record */}
            <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 ml-1 ${isNewRecord ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
              {isNewRecord ? '★ NEW RECORD!' : `BEST: ${safeHighScore}m`}
            </div>
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="pointer-events-auto p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-black/60 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </div>
    );
  }

  if (gameState === GameState.START) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="mb-8 relative">
            <div className="w-32 h-32 bg-yellow-600 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center relative border-4 border-gray-600">
                <div className="w-16 h-8 bg-black rounded-full absolute top-6"></div>
                <div className="w-4 h-4 bg-cyan-400 rounded-full absolute top-8 left-6 shadow-[0_0_10px_#22d3ee]"></div>
                <div className="w-4 h-4 bg-cyan-400 rounded-full absolute top-8 right-6 shadow-[0_0_10px_#22d3ee]"></div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-yellow-500 tracking-tighter mb-2 drop-shadow-lg" style={{ fontFamily: 'monospace' }}>
            TOMB OF THE <br /> <span className="text-cyan-400">AERO-BOT</span>
          </h1>
          <p className="text-yellow-200/80 mb-8 max-w-xs font-mono text-sm">
            Descend into the infinite abyss. Avoid the ancient traps.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-xl shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-black" />
              DESCEND
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl border border-stone-600 transition-all flex items-center justify-center gap-2"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              {isFullscreen ? 'QUIT FULLSCREEN' : 'FULLSCREEN'}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-yellow-200/50 font-mono">
            <div className="flex flex-col items-center">
              <div className="mb-1 p-2 bg-yellow-900/30 rounded-lg border border-yellow-800"><Puzzle className="w-4 h-4 text-yellow-400" /></div>
              <span>Relics (+Points)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-1 p-2 bg-cyan-900/30 rounded-lg border border-cyan-800"><Timer className="w-4 h-4 text-cyan-400" /></div>
              <span>Hourglass (+Score)</span>
            </div>
          </div>

          {isLoadingHighScore && (
            <div className="mt-4 text-cyan-400/70 text-[10px] font-mono animate-pulse">
              SYNCING GLOBAL HIGHSCORE...
            </div>
          )}

          <div className="mt-6 text-white/30 text-xs font-mono">
            Tap to change direction
          </div>
        </div>

        {/* Footer Text */}
        <div className="w-full pb-4">
          <p className="text-[10px] md:text-xs text-cyan-500/60 font-mono tracking-widest uppercase border-t border-white/5 pt-4">
            FIRST Tech Challenge Vietnam | Mini Game {safeHighScore > 0 ? `| GLOBAL BEST: ${safeHighScore}m` : ''}
          </p>
        </div>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md p-6 text-center animate-in zoom-in duration-300">
        <h2 className="text-5xl font-black text-white mb-2 drop-shadow-md">CRUSHED!</h2>
        <p className="text-red-200 mb-8 font-mono">Your journey ends here.</p>

        <div className={`p-6 rounded-2xl border w-full max-w-xs mb-8 relative overflow-hidden ${isNewRecord ? 'bg-yellow-900/40 border-yellow-500/50' : 'bg-black/40 border-red-500/30'}`}>
          {isNewRecord && (
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div>
          )}

          <div className="flex justify-between items-end mb-2 relative z-10">
            <span className="text-gray-400 font-mono text-sm">DEPTH REACHED</span>
            <span className={`text-3xl font-bold ${isNewRecord ? 'text-yellow-300' : 'text-yellow-400'}`}>{safeScore}m</span>
          </div>
          <div className="w-full h-px bg-white/10 my-2"></div>
          <div className="flex justify-between items-center relative z-10">
            <span className="text-gray-500 font-mono text-xs">BEST DEPTH</span>
            <div className="flex items-center gap-2">
              {isNewRecord && <Crown className="w-3 h-3 text-yellow-400" />}
              <span className="text-xl font-bold text-gray-300">{Math.max(safeScore, safeHighScore)}m</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full max-w-xs px-8 py-4 bg-white hover:bg-gray-100 text-red-900 font-black text-xl rounded-xl shadow-[0_6px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1.5 transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-6 h-6" />
          TRY AGAIN
        </button>
      </div>
    );
  }

  return null;
};

export default GameUI;