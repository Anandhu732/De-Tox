import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target } from 'lucide-react';

interface HoverGameProps {
  playerName: string;
  onGameEnd: (result: 'won' | 'lost', score: number) => void;
  onSarcasticMessage: (message: string) => void;
}

const HoverGame: React.FC<HoverGameProps> = ({ playerName, onGameEnd, onSarcasticMessage }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [timeHovered, setTimeHovered] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const sarcasticMessages = [
    `${playerName}, your mouse skills are... questionable 🤔`,
    `Come on ${playerName}, focus! Oh wait, that's impossible here 😏`,
    `${playerName}, the box is laughing at you! 📦😂`,
    `Nice try ${playerName}, but the box has trust issues 🙄`,
    `${playerName}, maybe try using both hands? 😂`,
    `The box thinks you're too slow, ${playerName}! ⚡`,
    `${playerName}, I believe in you! (Just kidding) 😜`,
    `Stay calm ${playerName}... LOOK BEHIND YOU! 👻`
  ];

  const getRandomPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 50, y: 50 };
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const boxSize = 60;
    const maxX = ((rect.width - boxSize) / rect.width) * 100;
    const maxY = ((rect.height - boxSize) / rect.height) * 100;
    
    return {
      x: Math.random() * maxX,
      y: Math.random() * maxY
    };
  }, []);

  const moveTarget = useCallback(() => {
    if (!gameActive) return;
    
    const moveType = Math.random();
    
    if (moveType < 0.3) {
      // Teleport
      setTargetPosition(getRandomPosition());
      setShakeIntensity(3);
      onSarcasticMessage(`Teleport! The box escaped from ${playerName}! 🌟`);
    } else if (moveType < 0.6) {
      // Jump
      setTargetPosition(prev => {
        const newPos = getRandomPosition();
        return {
          x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 30)),
          y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 30))
        };
      });
      setShakeIntensity(2);
    } else {
      // Drift
      setTargetPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 15))
      }));
      setShakeIntensity(1);
    }
    
    setTimeout(() => setShakeIntensity(0), 200);
  }, [getRandomPosition, gameActive, playerName, onSarcasticMessage]);

  // Game timer effect
  useEffect(() => {
    let interval: any = 0;
    
    if (isHovering && gameActive) {
      interval = setInterval(() => {
        setTimeHovered(prev => {
          const newTime = prev + 0.1;
          
          // Random chance to reset timer (sabotage!)
          if (Math.random() < 0.05) {
            onSarcasticMessage(`Oops! Timer got confused and reset itself, ${playerName}! 🤷‍♂️`);
            return 0;
          }
          
          if (newTime >= 10) {
            setGameActive(false);
            onGameEnd('won', Math.floor(newTime * 10));
            return 10;
          }
          
          return newTime;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isHovering, gameActive, playerName, onGameEnd, onSarcasticMessage]);

  // Target movement effect
  useEffect(() => {
    if (gameActive) {
      moveIntervalRef.current = setInterval(() => {
        moveTarget();
        
        // Random sarcastic messages
        if (Math.random() < 0.1) {
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          onSarcasticMessage(message);
        }
      }, Math.random() * 2000 + 1000);
    }
    
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [moveTarget, gameActive]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Stats */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform rotate-2 hover:rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Timer: {timeHovered.toFixed(1)}s</div>
          <div className="text-xs sm:text-sm opacity-75">Target: 10.0s (good luck!)</div>
        </div>
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform -rotate-2 hover:-rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Status: {isHovering ? '🎯 Hovering' : '❌ Not Even Close'}</div>
          <div className="text-xs sm:text-sm opacity-75">Player: {playerName}</div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square border-4 border-white border-dashed rounded-lg bg-black bg-opacity-30 overflow-hidden"
        style={{
          transform: `rotate(${shakeIntensity * 2}deg) scale(${1 + shakeIntensity * 0.02})`
        }}
      >
        {/* Moving Target */}
        <div
          className="absolute w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-red-500 border-2 sm:border-4 border-white rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-110 shadow-lg"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${shakeIntensity * 45}deg) scale(${1 + shakeIntensity * 0.1})`,
            animation: isHovering ? 'pulse 0.5s infinite' : 'none'
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white m-auto mt-1 sm:mt-1" />
        </div>

        {/* Trail effect */}
        <div
          className="absolute w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 opacity-30 rounded-full animate-ping"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      <div className="text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <p className="text-sm sm:text-base">
          Keep your mouse on the box for 10 seconds, {playerName}!
        </p>
      </div>
    </div>
  );
};

export default HoverGame;

// (removed unused newFunction)
