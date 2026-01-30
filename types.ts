export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export type EntityType = 'OBSTACLE' | 'COIN' | 'POWERUP';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EntityType;
  markedForDeletion: boolean;
  rotation: number;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  direction: 1 | -1; // 1 for right, -1 for left
  speedX: number;
  tilt: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
