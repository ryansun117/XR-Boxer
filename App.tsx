import React, { useState, useEffect } from 'react';
import { VRButton, XR } from '@react-three/xr';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { BoxingRoom } from './components/BoxingRoom';
import { GameManager } from './components/GameManager';
import { GameState, ScoreState } from './types';
import { audioService } from './services/audioService';
import { COLORS, xrStore } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    combo: 0,
    maxCombo: 0
  });

  const startGame = () => {
    setScoreState({ score: 0, combo: 0, maxCombo: 0 });
    setGameState(GameState.PLAYING);
    audioService.startMusic();
  };

  const stopGame = () => {
    setGameState(GameState.MENU);
    audioService.stopMusic();
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* 2D UI Overlay (Only visible on monitor or if DOM Overlay enabled, but sticking to Monitor UI + In-Game 3D UI for simplicity) */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-black/80 p-4 rounded-xl border border-red-800 text-white">
          <h1 className="text-3xl font-bold tracking-wider text-red-500 italic">XR BOXER</h1>
          <p className="text-sm text-gray-400">WebXR Fitness</p>
        </div>
        
        {gameState === GameState.PLAYING && (
          <div className="bg-black/80 p-4 rounded-xl border border-yellow-600 text-right">
            <div className="text-4xl font-mono font-bold">{scoreState.score.toLocaleString()}</div>
            <div className="text-xl text-yellow-400 font-bold">COMBO x{scoreState.combo}</div>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 w-full flex justify-center z-10">
         <VRButton store={xrStore} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-red-500/50 transition-all transform hover:scale-105" />
      </div>

      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 75 }}>
        <XR store={xrStore}>
          <BoxingRoom />
          
          {/* Menu / Lobby 3D UI */}
          {gameState === GameState.MENU && (
            <group position={[0, 1.5, -2]}>
               <Text fontSize={0.8} color="white" anchorX="center" anchorY="middle" position={[0, 0.5, 0]}>
                 XR BOXER
               </Text>
               <Text fontSize={0.2} color="#aaaaaa" anchorX="center" anchorY="middle" position={[0, -0.2, 0]}>
                 Punch to Start
               </Text>
               
               {/* Start Button (3D Interactive) */}
               <mesh 
                 position={[0, -0.8, 0]} 
                 onClick={() => startGame()}
                 onPointerOver={() => document.body.style.cursor = 'pointer'}
                 onPointerOut={() => document.body.style.cursor = 'auto'}
               >
                 <boxGeometry args={[1.5, 0.5, 0.2]} />
                 <meshStandardMaterial color={COLORS.WALL_RED} />
                 <Text position={[0, 0, 0.11]} fontSize={0.2} color="white">
                    START
                 </Text>
               </mesh>
            </group>
          )}

          {/* Game Logic */}
          <GameManager 
            gameState={gameState} 
            setGameState={setGameState} 
            updateScore={setScoreState} 
          />

          {/* In-Game 3D Score Display (Floating) */}
          {gameState === GameState.PLAYING && (
            <group position={[0, 2.5, -5]}>
              <Text fontSize={1.2} color="white" anchorX="center" anchorY="middle">
                {scoreState.score}
              </Text>
              <Text fontSize={0.5} color={scoreState.combo > 5 ? COLORS.TARGET_RIM : "white"} position={[0, -0.8, 0]} anchorX="center" anchorY="middle">
                x{scoreState.combo}
              </Text>
            </group>
          )}

          {/* Helper for dev testing without headset */}
          <OrbitControls target={[0, 1.6, -2]} />
        </XR>
      </Canvas>
    </div>
  );
};

export default App;