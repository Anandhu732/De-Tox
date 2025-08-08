import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MousePointer, Zap } from 'lucide-react';

interface ClickGameProps {
  playerName: string;
  onGameEnd: (result: 'won' | 'lost', score: number) => void;
  onSarcasticMessage: (message: string) => void;
}

const ClickGame: React.FC<ClickGameProps> = ({ playerName, onGameEnd, onSarcasticMessage }) => {
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [targetClicks, setTargetClicks] = useState(10);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const sarcasticMessages = [
    `${playerName}, your clicking speed is... concerning 🐌`,
    `Faster ${playerName}! The box is getting bored! 😴`,
    `${playerName}, are you clicking or just admiring the box? 🤔`,
    `The box is running away from ${playerName}'s slow clicks! 🏃‍♂️`,
    `${playerName}, maybe try clicking with your eyes closed? 😂`,
    `Time's ticking ${playerName}! Click like your dignity depends on it! ⏰`,
    `${playerName}, the box thinks you're too gentle! 💪`,
    `Come on ${playerName}, show that box who's boss! 👑`
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
    
    if (moveType < 0.4) {
      // Quick teleport
      setTargetPosition(getRandomPosition());
      setShakeIntensity(3);
    } else if (moveType < 0.7) {
      // Jump away from current position
      setTargetPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 40)),
        y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 40))
      }));
      setShakeIntensity(2);
    } else {
      // Drift
      setTargetPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 20)),
        y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 20))
      }));
      setShakeIntensity(1);
    }
    
    setTimeout(() => setShakeIntensity(0), 200);
  }, [getRandomPosition, gameActive]);

  const handleTargetClick = () => {
    if (!gameActive) return;
    
    setClickCount(prev => {
      const newCount = prev + 1;
      
      if (newCount >= targetClicks) {
        setGameActive(false);
        onGameEnd('won', newCount * 10 + timeLeft);
        onSarcasticMessage(`Impossible! ${playerName} actually clicked fast enough! 🤯`);
      } else {
        // Move target after successful click
        moveTarget();
        
        if (Math.random() < 0.3) {
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          onSarcasticMessage(message);
        }
      }
      
      return newCount;
    });
  };

  // Game timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            if (clickCount >= targetClicks) {
              onGameEnd('won', clickCount * 10);
            } else {
              onGameEnd('lost', clickCount);
              onSarcasticMessage(`Time's up ${playerName}! Your clicking skills need work! ⏰`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameActive, timeLeft, clickCount, targetClicks, playerName, onGameEnd, onSarcasticMessage]);

  // Target movement effect
  useEffect(() => {
    if (gameActive) {
      moveIntervalRef.current = setInterval(() => {
        moveTarget();
        
        // Random sarcastic messages
        if (Math.random() < 0.15) {
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          onSarcasticMessage(message);
        }
      }, Math.random() * 1500 + 800);
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
          <div className="text-base sm:text-lg font-bold">Clicks: {clickCount}/{targetClicks}</div>
          <div className="text-xs sm:text-sm opacity-75">Time: {timeLeft}s</div>
        </div>
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform -rotate-2 hover:-rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Player: {playerName}</div>
          <div className="text-xs sm:text-sm opacity-75">Speed: {timeLeft > 0 ? (clickCount / (15 - timeLeft) || 0).toFixed(1) : '0'} clicks/sec</div>
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
        {/* Clickable Target */}
        <div
          className="absolute w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 border-2 sm:border-4 border-white rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-110 shadow-lg active:scale-95"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${shakeIntensity * 45}deg) scale(${1 + shakeIntensity * 0.1})`,
          }}
          onClick={handleTargetClick}
        >
          <MousePointer className="w-3 h-3 sm:w-4 sm:h-4 text-white m-auto mt-1 sm:mt-1" />
        </div>

        {/* Click effect */}
        <div
          className="absolute w-4 h-4 sm:w-6 sm:h-6 bg-blue-400 opacity-30 rounded-full animate-ping"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Lightning effects for speed */}
        {clickCount > 5 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <Zap
                key={i}
                className="absolute w-6 h-6 text-yellow-400 opacity-60 animate-pulse"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <p className="text-sm sm:text-base">
          Click the moving target {targetClicks} times in {timeLeft > 0 ? timeLeft : 15} seconds, {playerName}!
        </p>
      </div>
    </div>
  );
};

export default ClickGame;