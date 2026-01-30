import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, Entity, Player, Particle, EntityType } from '../types';
import { GAME_CONFIG } from '../constants';

interface GameEngineProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (fn: (prev: number) => number) => void;
  setHighScore: (fn: (prev: number) => number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({
  gameState,
  setGameState,
  setScore,
  setHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Game State Refs (mutable for performance in loop)
  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    radius: GAME_CONFIG.PLAYER_RADIUS,
    direction: -1,
    speedX: GAME_CONFIG.PLAYER_SPEED_X,
    tilt: 0,
  });
  
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scrollSpeedRef = useRef(GAME_CONFIG.SCROLL_SPEED_BASE);
  const spawnTimerRef = useRef(0);
  const itemTimerRef = useRef(0);
  const scoreRef = useRef(0); // Internal score ref for sync
  const wallOffsetRef = useRef(0); // For scrolling wall texture

  // Helper: Create Particles
  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.5,
        color,
        size: Math.random() * 3 + 1,
      });
    }
  };

  const resetGame = (canvas: HTMLCanvasElement) => {
    const w = canvas.width;
    const h = canvas.height;
    
    playerRef.current = {
      x: w / 2,
      y: h * 0.3, // Fixed Y position at 30% from top
      radius: w * 0.03, // Responsive radius
      direction: -1,
      speedX: w * 0.6, // Responsive speed
      tilt: 0,
    };
    
    entitiesRef.current = [];
    particlesRef.current = [];
    scrollSpeedRef.current = h * 0.4; // Responsive scroll speed
    spawnTimerRef.current = 0;
    itemTimerRef.current = 0;
    scoreRef.current = 0;
    setScore(() => 0);
  };

  const spawnEntity = (canvas: HTMLCanvasElement, type: EntityType) => {
    const w = canvas.width;
    const wallWidth = w * GAME_CONFIG.WALL_WIDTH_PCT;
    const playableWidth = w - (wallWidth * 2);
    
    // Random position within playable area
    const size = type === 'OBSTACLE' ? w * 0.08 : w * 0.05;
    const x = wallWidth + size + Math.random() * (playableWidth - size * 2);
    const y = canvas.height + 50; // Just below screen

    entitiesRef.current.push({
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      width: size,
      height: size,
      type,
      markedForDeletion: false,
      rotation: Math.random() * 360,
    });
  };

  const update = (time: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05); // Cap dt
    lastTimeRef.current = time;

    if (gameState === GameState.PLAYING) {
      // 1. Update Score based on time/depth
      const scoreIncrement = dt * 10; // 10 points per second base
      scoreRef.current += scoreIncrement;
      setScore(() => Math.floor(scoreRef.current));
      
      // Accelerate game
      scrollSpeedRef.current += GAME_CONFIG.SCROLL_ACCELERATION * dt;

      // 2. Update Player
      const p = playerRef.current;
      p.x += p.speedX * p.direction * dt;
      // Tilt animation
      const targetTilt = p.direction * 15 * (Math.PI / 180);
      p.tilt += (targetTilt - p.tilt) * 10 * dt;

      // 3. Wall Collisions
      const wallWidth = canvas.width * GAME_CONFIG.WALL_WIDTH_PCT;
      if (p.x < wallWidth + p.radius || p.x > canvas.width - wallWidth - p.radius) {
        // Game Over
        setGameState(GameState.GAME_OVER);
        setHighScore(prev => Math.max(prev, Math.floor(scoreRef.current)));
        // Explosion particles
        createParticles(p.x, p.y, GAME_CONFIG.COLORS.PLAYER_ACCENT, 20);
        return;
      }

      // 4. Update Entities
      // Spawning
      spawnTimerRef.current += dt * 1000;
      itemTimerRef.current += dt * 1000;

      // Dynamic spawn rate based on speed
      const currentSpawnRate = Math.max(500, GAME_CONFIG.OBSTACLE_SPAWN_RATE - (scrollSpeedRef.current * 0.5));
      
      if (spawnTimerRef.current > currentSpawnRate) {
        spawnEntity(canvas, 'OBSTACLE');
        spawnTimerRef.current = 0;
      }
      
      if (itemTimerRef.current > GAME_CONFIG.ITEM_SPAWN_RATE) {
        spawnEntity(canvas, Math.random() > 0.5 ? 'COIN' : 'POWERUP');
        itemTimerRef.current = 0;
      }

      entitiesRef.current.forEach(entity => {
        // Move Up
        entity.y -= scrollSpeedRef.current * dt;
        
        // Rotation for effect
        entity.rotation += dt * 2;

        // Cleanup
        if (entity.y < -50) {
          entity.markedForDeletion = true;
        }

        // Collision with Player
        // Simple Circle-Circle collision approximation
        const dx = p.x - entity.x;
        const dy = p.y - entity.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const minDist = p.radius + (entity.width / 2);

        if (distance < minDist) {
          if (entity.type === 'OBSTACLE') {
            setGameState(GameState.GAME_OVER);
            setHighScore(prev => Math.max(prev, Math.floor(scoreRef.current)));
            createParticles(p.x, p.y, GAME_CONFIG.COLORS.PLAYER, 15);
          } else if (entity.type === 'COIN') {
            // Puzzle Piece: Bonus Points
            scoreRef.current += 100;
            createParticles(entity.x, entity.y, GAME_CONFIG.COLORS.COIN, 10);
            entity.markedForDeletion = true;
          } else if (entity.type === 'POWERUP') {
            // Hourglass: Bonus "Age" (Score)
            scoreRef.current += 300; // +5 seconds worth roughly
            createParticles(entity.x, entity.y, GAME_CONFIG.COLORS.POWERUP, 10);
            entity.markedForDeletion = true;
          }
        }
      });

      entitiesRef.current = entitiesRef.current.filter(e => !e.markedForDeletion);

      // 5. Update Particles
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
      });
      particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

      // 6. Wall Texture Scroll
      wallOffsetRef.current = (wallOffsetRef.current + scrollSpeedRef.current * dt) % 100;
    }

    draw(canvas);
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background (Sand)
    ctx.fillStyle = GAME_CONFIG.COLORS.BG_SAND;
    ctx.fillRect(0, 0, w, h);
    
    // Subtle noise/grain (simulated with random dots for performance)
    // In a real optimized game, use a pre-rendered pattern
    ctx.fillStyle = GAME_CONFIG.COLORS.BG_SAND_DARK;
    // We can draw a few static "bg details" that move up
    // For now, let's keep it simple

    // Walls
    const wallWidth = w * GAME_CONFIG.WALL_WIDTH_PCT;
    ctx.fillStyle = GAME_CONFIG.COLORS.WALL;
    
    // Left Wall
    ctx.fillRect(0, 0, wallWidth, h);
    // Right Wall
    ctx.fillRect(w - wallWidth, 0, wallWidth, h);

    // Wall Spikes / Pattern
    ctx.fillStyle = GAME_CONFIG.COLORS.WALL_PATTERN;
    const spikeHeight = 40;
    const spikeOffset = wallOffsetRef.current;
    
    // Draw scrolling spikes
    for (let y = -spikeHeight + spikeOffset; y < h; y += spikeHeight) {
      // Left Spikes
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(wallWidth + 5, y + spikeHeight / 2);
      ctx.lineTo(0, y + spikeHeight);
      ctx.fill();

      // Right Spikes
      ctx.beginPath();
      ctx.moveTo(w, y);
      ctx.lineTo(w - wallWidth - 5, y + spikeHeight / 2);
      ctx.lineTo(w, y + spikeHeight);
      ctx.fill();
    }

    // Entities
    entitiesRef.current.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rotation);

      if (e.type === 'OBSTACLE') {
        // Hieroglyph Block
        ctx.fillStyle = GAME_CONFIG.COLORS.OBSTACLE;
        ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
        
        // Inner glyph detail
        ctx.strokeStyle = GAME_CONFIG.COLORS.OBSTACLE_HIGHLIGHT;
        ctx.lineWidth = 2;
        ctx.strokeRect(-e.width/3, -e.height/3, e.width*0.6, e.height*0.6);
      } else if (e.type === 'COIN') {
        // Puzzle Piece
        ctx.fillStyle = GAME_CONFIG.COLORS.COIN;
        ctx.beginPath();
        // Simplified puzzle shape (circle with notches)
        ctx.arc(0, 0, e.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = `${Math.floor(e.width * 0.6)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
      } else if (e.type === 'POWERUP') {
        // Hourglass
        ctx.fillStyle = GAME_CONFIG.COLORS.POWERUP;
        ctx.beginPath();
        ctx.moveTo(-e.width/2, -e.height/2);
        ctx.lineTo(e.width/2, -e.height/2);
        ctx.lineTo(0, 0);
        ctx.lineTo(e.width/2, e.height/2);
        ctx.lineTo(-e.width/2, e.height/2);
        ctx.lineTo(0, 0);
        ctx.fill();
      }

      ctx.restore();
    });

    // Player (Robot)
    const p = playerRef.current;
    if (gameState !== GameState.GAME_OVER) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, p.radius + 5, p.radius * 0.8, p.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
      ctx.beginPath();
      ctx.roundRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2, 5);
      ctx.fill();

      // Eyes/Visor
      ctx.fillStyle = '#222';
      ctx.fillRect(-p.radius * 0.7, -p.radius * 0.3, p.radius * 1.4, p.radius * 0.6);
      
      // Glowing Eyes
      ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER_ACCENT;
      ctx.shadowColor = GAME_CONFIG.COLORS.PLAYER_ACCENT;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-p.radius * 0.3, 0, p.radius * 0.15, 0, Math.PI * 2);
      ctx.arc(p.radius * 0.3, 0, p.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Antenna
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -p.radius);
      ctx.lineTo(0, -p.radius - 8);
      ctx.stroke();
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(0, -p.radius - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Particles
    particlesRef.current.forEach(pt => {
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  const handleInput = useCallback(() => {
    if (gameState === GameState.START || gameState === GameState.GAME_OVER) {
       // Handled by UI overlay
    } else if (gameState === GameState.PLAYING) {
      playerRef.current.direction *= -1;
      
      // Feedback (small dust puff at turn)
      // createParticles(playerRef.current.x, playerRef.current.y, '#FFF', 3);
    }
  }, [gameState]);

  // Event Listeners
  useEffect(() => {
    const handleTouch = (e: TouchEvent | MouseEvent) => {
      if (gameState === GameState.PLAYING) {
        e.preventDefault(); // Prevent double firing
        handleInput();
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('mousedown', handleTouch);

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleTouch);
    };
  }, [handleInput, gameState]);

  // Init & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive Canvas
    const handleResize = () => {
      // Maintain aspect ratio or fill screen?
      // Fill screen for mobile feeling
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // If we just resized, we might need to reposition player if playing
      // But usually resize on mobile means rotation, better to just let game over or pause.
      // For this simple game, we just reset player Y if needed or leave it.
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // If starting a new game (from GAME_OVER -> START transition isn't handled here directly, 
    // but we can detect state change to PLAYING)
    if (gameState === GameState.PLAYING && scoreRef.current === 0) {
      resetGame(canvas);
      lastTimeRef.current = performance.now();
    }

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]); 

  // Reset when entering PLAYING state from UI
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
       if (canvasRef.current) resetGame(canvasRef.current);
       scoreRef.current = 0;
    }
  }, [gameState, setScore]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameEngine;
