import { createXRStore } from '@react-three/xr';

export const xrStore = createXRStore();

export const GAME_CONFIG = {
  SPAWN_RATE_MS: 600, // Time between spawns (simulating BPM)
  TARGET_SPEED: 8.0, // Units per second
  SPAWN_Z: -12, // Start position
  HIT_Z: 0.5, // Player position (approx)
  DESPAWN_Z: 2, // Behind player
  HIT_RADIUS: 0.4, // Collision tolerance
  LANE_WIDTH: 0.8, // Horizontal spread
  LANE_HEIGHT_MIN: 1.0,
  LANE_HEIGHT_MAX: 1.6,
};

export const COLORS = {
  WALL_RED: '#D32F2F',
  WALL_GREY: '#424242',
  FLOOR: '#111111',
  GLOVE: '#ef4444',
  TARGET_BODY: '#1a1a1a',
  TARGET_RIM: '#fbbf24', // Amber
  LIGHT: '#ffffff',
};