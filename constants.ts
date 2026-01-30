export const GAME_CONFIG = {
  FPS: 60,
  SCROLL_SPEED_BASE: 300, // Pixels per second moving up
  SCROLL_ACCELERATION: 5, // Speed increase per second
  PLAYER_SPEED_X: 400, // Horizontal speed
  PLAYER_RADIUS: 18,
  WALL_WIDTH_PCT: 0.05, // Wall is 5% of screen width
  OBSTACLE_SPAWN_RATE: 1500, // ms
  ITEM_SPAWN_RATE: 2000, // ms
  COLORS: {
    BG_SAND: '#e6c288',
    BG_SAND_DARK: '#dcb170',
    WALL: '#5d4037',
    WALL_PATTERN: '#4e342e',
    PLAYER: '#607d8b',
    PLAYER_ACCENT: '#00bcd4',
    OBSTACLE: '#795548',
    OBSTACLE_HIGHLIGHT: '#8d6e63',
    COIN: '#ffc107', // Puzzle piece color
    POWERUP: '#00bcd4', // Hourglass color
  }
};
