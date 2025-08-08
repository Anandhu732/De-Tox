import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Zap, Skull } from 'lucide-react';

interface AvoidGameProps {
  playerName: string;
  onGameEnd: (result: 'won' | 'lost', score: number) => void;
  onSarcasticMessage: (message: string) => void;
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const AvoidGame: React.FC<AvoidGameProps> = ({ playerName, onGameEnd, onSarcasticMessage }) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [difficulty, setDifficulty] = useState(1);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const sarcasticMessages = [
    `${playerName}, those obstacles are laughing at your dodging skills! 😂`,
    `Nice moves ${playerName}! (That was sarcasm) 🕺`,
    `${playerName}, are you trying to get hit? 🤔`,
    `The obstacles think ${playerName} is too easy to catch! 🎯`,
    `${playerName}, maybe try moving faster than a snail? 🐌`,
    `Impressive ${playerName}! You lasted longer than expected! ⏱️`,
    `${playerName}, the obstacles are getting bored! 😴`,
    `Run ${playerName}, run! (Or don't, we don't care) 🏃‍♂️`
  ];

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!gameAreaRef.current || !gameActive) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlayerPosition({
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y))
    });
  }, [gameActive]);

  const checkCollision = useCallback((player: {x: number, y: number}, obstacle: Obstacle) => {
    const distance = Math.sqrt(
      Math.pow(player.x - obstacle.x, 2) + Math.pow(player.y - obstacle.y, 2)
    );
    return distance < (obstacle.size / 2 + 3); // Player size is roughly 3
  }, []);

  const updateGame = useCallback(() => {
    if (!gameActive) return;

    setObstacles(prev => {
      const updated = prev.map(obstacle => ({
        ...obstacle,
        x: obstacle.x + obstacle.vx,
        y: obstacle.y + obstacle.vy,
        // Bounce off walls
        vx: obstacle.x <= 0 || obstacle.x >= 100 ? -obstacle.vx : obstacle.vx,
        vy: obstacle.y <= 0 || obstacle.y >= 100 ? -obstacle.vy : obstacle.vy
      })).filter(obstacle => 
        obstacle.x >= -10 && obstacle.x <= 110 && 
        obstacle.y >= -10 && obstacle.y <= 110
      );

      // Check collisions
      const collision = updated.some(obstacle => 
        checkCollision(playerPosition, obstacle)
      );

      if (collision) {
        setGameActive(false);
        onGameEnd('lost', score);
        onSarcasticMessage(`Game Over ${playerName}! You lasted ${score} seconds! 💥`);
        return updated;
      }

      // Add new obstacles based on difficulty
      if (Math.random() < 0.02 * difficulty && updated.length < 8 + difficulty) {
        const side = Math.floor(Math.random() * 4);
        let newObstacle: Obstacle;
        
        switch (side) {
          case 0: // Top
            newObstacle = {
              id: Math.random().toString(),
              x: Math.random() * 100,
              y: -5,
              vx: (Math.random() - 0.5) * 2,
              vy: Math.random() * 2 + 1,
              size: Math.random() * 4 + 3
            };
            break;
          case 1: // Right
            newObstacle = {
              id: Math.random().toString(),
              x: 105,
              y: Math.random() * 100,
              vx: -(Math.random() * 2 + 1),
              vy: (Math.random() - 0.5) * 2,
              size: Math.random() * 4 + 3
            };
            break;
          case 2: // Bottom
            newObstacle = {
              id: Math.random().toString(),
              x: Math.random() * 100,
              y: 105,
              vx: (Math.random() - 0.5) * 2,
              vy: -(Math.random() * 2 + 1),
              size: Math.random() * 4 + 3
            };
            break;
          default: // Left
            newObstacle = {
              id: Math.random().toString(),
              x: -5,
              y: Math.random() * 100,
              vx: Math.random() * 2 + 1,
              vy: (Math.random() - 0.5) * 2,
              size: Math.random() * 4 + 3
            };
        }
        
        updated.push(newObstacle);
      }

      return updated;
    });

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, [gameActive, playerPosition, score, difficulty, checkCollision, onGameEnd, onSarcasticMessage, playerName]);

  // Score and difficulty progression
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameActive) {
      interval = setInterval(() => {
        setScore(prev => {
          const newScore = prev + 1;
          
          // Increase difficulty every 10 seconds
          if (newScore % 10 === 0) {
            setDifficulty(prev => Math.min(prev + 1, 5));
            onSarcasticMessage(`Level ${Math.floor(newScore / 10) + 1}! Things are getting spicy ${playerName}! 🌶️`);
          }
          
          // Random sarcastic messages
          if (Math.random() < 0.1) {
            const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
            onSarcasticMessage(message);
          }
          
          return newScore;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameActive, onSarcasticMessage, playerName]);

  // Mouse tracking
  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (gameAreaRef.current) {
        gameAreaRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleMouseMove]);

  // Game loop
  useEffect(() => {
    if (gameActive) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateGame, gameActive]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Stats */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform rotate-2 hover:rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Score: {score}s</div>
          <div className="text-xs sm:text-sm opacity-75">Level: {difficulty}</div>
        </div>
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform -rotate-2 hover:-rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Player: {playerName}</div>
          <div className="text-xs sm:text-sm opacity-75">Obstacles: {obstacles.length}</div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square border-4 border-white border-dashed rounded-lg bg-black bg-opacity-30 overflow-hidden cursor-none"
      >
        {/* Player */}
        <div
          className="absolute w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-blue-500 border-2 border-white rounded-full shadow-lg z-10"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white m-auto mt-0.5 sm:mt-1" />
        </div>

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute bg-gradient-to-br from-red-500 to-orange-600 border border-red-700 rounded-full shadow-lg animate-pulse"
            style={{
              left: `${obstacle.x}%`,
              top: `${obstacle.y}%`,
              width: `${obstacle.size}%`,
              height: `${obstacle.size}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Skull className="w-full h-full text-white p-1" />
          </div>
        ))}

        {/* Danger indicators */}
        {difficulty > 2 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: difficulty - 2 }).map((_, i) => (
              <Zap
                key={i}
                className="absolute w-4 h-4 sm:w-6 sm:h-6 text-red-400 opacity-40 animate-ping"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <p className="text-sm sm:text-base">
          Move your mouse to avoid the red obstacles, {playerName}!
        </p>
        <p className="text-xs sm:text-sm opacity-75 mt-1">
          Survive as long as possible - difficulty increases every 10 seconds!
        </p>
      </div>
    </div>
  );
};

export default AvoidGame;