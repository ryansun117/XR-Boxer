import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { Target } from './Target';
import { BoxingGlove } from './BoxingGlove';
import { GAME_CONFIG } from '../constants';
import { TargetEntity, GameState, ScoreState } from '../types';
import { audioService } from '../services/audioService';

interface GameManagerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  updateScore: (fn: (prev: ScoreState) => ScoreState) => void;
}

export const GameManager: React.FC<GameManagerProps> = ({ gameState, setGameState, updateScore }) => {
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  const targetsRef = useRef<TargetEntity[]>([]);
  
  const lastSpawnTime = useRef(0);
  
  // Hand tracking refs
  const leftGloveRef = useRef<Group>(null);
  const rightGloveRef = useRef<Group>(null);
  
  // Temporary vectors for collision math to avoid GC
  const tempVec1 = useRef(new Vector3());
  const tempVec2 = useRef(new Vector3());

  // Sync state with ref for the loop
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useFrame((state, delta, frame) => {
    if (gameState !== GameState.PLAYING) return;

    const now = state.clock.getElapsedTime();
    const currentTargets = [...targetsRef.current];
    let needsUpdate = false;

    // --- XR Controller Tracking ---
    // Manually fetch controller poses compatible with v6 changes
    const session = state.gl.xr.getSession();
    let leftGlovePos: Vector3 | null = null;
    let rightGlovePos: Vector3 | null = null;

    if (session && frame) {
      const refSpace = state.gl.xr.getReferenceSpace();
      if (refSpace) {
        for (const source of session.inputSources) {
          if (!source.gripSpace) continue;
          
          const pose = frame.getPose(source.gripSpace, refSpace);
          if (pose) {
            const p = pose.transform.position;
            const q = pose.transform.orientation;
            
            if (source.handedness === 'left') {
              // Update visual
              if (leftGloveRef.current) {
                leftGloveRef.current.position.set(p.x, p.y, p.z);
                leftGloveRef.current.quaternion.set(q.x, q.y, q.z, q.w);
                leftGloveRef.current.visible = true;
              }
              // Store position for collision
              leftGlovePos = tempVec1.current.set(p.x, p.y, p.z);
            } else if (source.handedness === 'right') {
              if (rightGloveRef.current) {
                rightGloveRef.current.position.set(p.x, p.y, p.z);
                rightGloveRef.current.quaternion.set(q.x, q.y, q.z, q.w);
                rightGloveRef.current.visible = true;
              }
              rightGlovePos = tempVec2.current.set(p.x, p.y, p.z);
            }
          }
        }
      }
    } else {
        // Fallback or hide gloves if not in XR
        if (leftGloveRef.current) leftGloveRef.current.visible = false;
        if (rightGloveRef.current) rightGloveRef.current.visible = false;
    }

    // --- Spawning Logic ---
    if (now * 1000 - lastSpawnTime.current > GAME_CONFIG.SPAWN_RATE_MS) {
      lastSpawnTime.current = now * 1000;
      
      // Randomize lane (Left, Center, Right) and Height
      const lane = (Math.random() - 0.5) * GAME_CONFIG.LANE_WIDTH * 2;
      const height = GAME_CONFIG.LANE_HEIGHT_MIN + Math.random() * (GAME_CONFIG.LANE_HEIGHT_MAX - GAME_CONFIG.LANE_HEIGHT_MIN);
      
      const newTarget: TargetEntity = {
        id: Math.random().toString(36).substr(2, 9),
        position: new Vector3(lane, height, GAME_CONFIG.SPAWN_Z),
        active: true,
        hit: false,
        timestamp: now,
      };
      
      currentTargets.push(newTarget);
      needsUpdate = true;
    }

    // --- Movement & Collision Logic ---
    for (let i = 0; i < currentTargets.length; i++) {
      const target = currentTargets[i];
      if (!target.active) continue;

      // Move Target
      target.position.z += GAME_CONFIG.TARGET_SPEED * delta;

      // Check Collision
      let hit = false;
      if (leftGlovePos && target.position.distanceTo(leftGlovePos) < GAME_CONFIG.HIT_RADIUS) hit = true;
      if (rightGlovePos && target.position.distanceTo(rightGlovePos) < GAME_CONFIG.HIT_RADIUS) hit = true;

      if (hit) {
        target.active = false;
        target.hit = true;
        audioService.playHitSound();
        updateScore(s => ({
          score: s.score + 100 * (1 + (s.combo * 0.1)),
          combo: s.combo + 1,
          maxCombo: Math.max(s.maxCombo, s.combo + 1)
        }));
        needsUpdate = true;
      } 
      // Check Miss (Passed player)
      else if (target.position.z > GAME_CONFIG.DESPAWN_Z) {
        target.active = false;
        target.hit = false;
        audioService.playMissSound();
        updateScore(s => ({ ...s, combo: 0 }));
        needsUpdate = true;
      }
    }

    // Cleanup inactive
    if (needsUpdate) {
      const activeTargets = currentTargets.filter(t => t.active);
      setTargets(activeTargets);
      targetsRef.current = activeTargets;
    }
  });

  return (
    <>
      {/* Gloves visual representation manually tracked */}
      <group ref={leftGloveRef} visible={false}>
         <BoxingGlove handedness="left" />
      </group>
      <group ref={rightGloveRef} visible={false}>
         <BoxingGlove handedness="right" />
      </group>

      {/* Render Active Targets */}
      {targets.map(target => (
        <Target key={target.id} position={target.position} />
      ))}
    </>
  );
};