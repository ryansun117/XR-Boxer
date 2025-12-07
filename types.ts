import { Vector3 } from 'three';

export interface TargetEntity {
  id: string;
  position: Vector3;
  active: boolean;
  hit: boolean;
  timestamp: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
}
