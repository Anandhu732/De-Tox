import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Zap, AlertTriangle, Gift, Sparkles, Home, MousePointer, Clock, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PopupMessage {
  id: string;
  message: string;
  x: number;
  y: number;
  type: 'alert' | 'news' | 'prize' | 'warning';
}

type GameType = 'hover' | 'click' | 'avoid' | 'memory';

const GamePage = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('hover');
  const [isHovering, setIsHovering] = useState(false);
  const [timeHovered, setTimeHovered] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [popups, setPopups] = useState<PopupMessage[]>([]);
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [sarcasticMessage, setSarcasticMessage] = useState("Choose your poison! Each game is designed to break your spirit! 😈");
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [emojiStorm, setEmojiStorm] = useState(false);
  
  // Click Game States
  const [clickCount, setClickCount] = useState(0);
  const [clickTarget, setClickTarget] = useState(10);
  const [clickTimeLeft, setClickTimeLeft] = useState(15);
  
  // Avoid Game States
  const [avoidScore, setAvoidScore] = useState(0);
  const [obstacles, setObstacles] = useState<Array<{id: string, x: number, y: number}>>([]);
  
  // Memory Game States
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [memoryLevel, setMemoryLevel] = useState(1);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout>();
  const popupIntervalRef = useRef<NodeJS.Timeout>();
  const backgroundIntervalRef = useRef<NodeJS.Timeout>();
  const sarcasticIntervalRef = useRef<NodeJS.Timeout>();

  const games = [
    { 
      id: 'hover' as GameType, 
      name: 'Hover Hell', 
      icon: Target, 
      description: 'Keep your mouse on the box for 10 seconds',
      color: 'bg-red-500'
    },
    { 
      id: 'click' as GameType, 
      name: 'Click Chaos', 
      icon: MousePointer, 
      description: 'Click the moving target 10 times in 15 seconds',
      color: 'bg-blue-500'
    },
    { 
      id: 'avoid' as GameType, 
      name: 'Dodge Disaster', 
      icon: Zap, 
      description: 'Avoid the red obstacles for as long as possible',
      color: 'bg-green-500'
    },
    { 
      id: 'memory' as GameType, 
      name: 'Memory Mayhem', 
      icon: Clock, 
      description: 'Remember the sequence (if you can focus)',
      color: 'bg-purple-500'
    }
  ];

  const sarcasticMessages = [
    "Oh wow, you're actually trying! 🙄",
    "Don't get too excited now... 😴",
    "I'm sure you'll give up soon 😈",
    "Your skills are... questionable 🤔",
    "Is that the best you can do? 😏",
    "Focus? What's that? 🤪",
    "Maybe try using both hands? 😂",
    "I believe in you! (Just kidding) 😜",
    "You've got this! (You don't) 🤭",
    "Stay calm and... LOOK BEHIND YOU! 👻"
  ];

  const popupMessages = [
    { text: "🍕 FREE PIZZA DELIVERY!", type: 'prize' as const },
    { text: "⚠️ BREAKING NEWS: Your chair is haunted!", type: 'news' as const },
    { text: "🎉 CONGRATULATIONS! You've won absolutely nothing!", type: 'prize' as const },
    { text: "🚨 URGENT: Your cat is judging you right now", type: 'alert' as const },
    { text: "💰 CLICK HERE FOR $1,000,000!", type: 'prize' as const },
    { text: "⚡ WARNING: Fun levels critically low!", type: 'warning' as const },
    { text: "🎮 Your high score: Still zero!", type: 'alert' as const },
    { text: "🌟 You're doing great! (We're lying)", type: 'news' as const },
    { text: "🦄 UNICORN ALERT: None detected nearby", type: 'warning' as const },
    { text: "🍪 COOKIE EMERGENCY: Jar is empty!", type: 'alert' as const }
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
    const moveType = Math.random();
    
    if (moveType < 0.3) {
      setTargetPosition(getRandomPosition());
      setShakeIntensity(3);
    } else if (moveType < 0.6) {
      setTargetPosition(prev => {
        const newPos = getRandomPosition();
        return {
          x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 30)),
          y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 30))
        };
      });
      setShakeIntensity(2);
    } else {
      setTargetPosition(prev => ({
        x: Math.min(90, Math.max(10, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.min(90, Math.max(10, prev.y + (Math.random() - 0.5) * 15))
      }));
      setShakeIntensity(1);
    }
    
    setTimeout(() => setShakeIntensity(0), 200);
  }, [getRandomPosition]);

  const createPopup = useCallback(() => {
    const message = popupMessages[Math.floor(Math.random() * popupMessages.length)];
    const popup: PopupMessage = {
      id: Math.random().toString(),
      message: message.text,
      type: message.type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    };
    
    setPopups(prev => [...prev, popup]);
    
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== popup.id));
    }, Math.random() * 3000 + 3000);
  }, []);

  const changeSarcasticMessage = useCallback(() => {
    setSarcasticMessage(sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)]);
  }, []);

  const resetGame = () => {
    setGameState('playing');
    setTimeHovered(0);
    setIsHovering(false);
    setTargetPosition({ x: 50, y: 50 });
    setPopups([]);
    setClickCount(0);
    setClickTimeLeft(15);
    setAvoidScore(0);
    setObstacles([]);
    setMemorySequence([]);
    setPlayerSequence([]);
    setMemoryLevel(1);
    setSarcasticMessage("Back for more punishment? I respect that! 😤");
  };

  const switchGame = (gameType: GameType) => {
    setCurrentGame(gameType);
    resetGame();
    const gameNames = {
      hover: "Hover Hell",
      click: "Click Chaos", 
      avoid: "Dodge Disaster",
      memory: "Memory Mayhem"
    };
    setSarcasticMessage(`Welcome to ${gameNames[gameType]}! Prepare for disappointment! 😈`);
  };

  // Hover Game Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentGame === 'hover' && isHovering && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeHovered(prev => {
          const newTime = prev + 0.1;
          
          if (Math.random() < 0.05) {
            setSarcasticMessage("Oops! Timer got confused and reset itself! 🤷‍♂️");
            return 0;
          }
          
          if (newTime >= 10) {
            setGameState('won');
            setSarcasticMessage("Wait... you actually did it? 😱 (We weren't prepared for this...)");
            return 10;
          }
          
          return newTime;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [currentGame, isHovering, gameState]);

  // Click Game Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentGame === 'click' && gameState === 'playing' && clickTimeLeft > 0) {
      interval = setInterval(() => {
        setClickTimeLeft(prev => {
          if (prev <= 1) {
            if (clickCount >= clickTarget) {
              setGameState('won');
              setSarcasticMessage("Impossible! You actually clicked fast enough! 🤯");
            } else {
              setGameState('lost');
              setSarcasticMessage("Time's up! Your clicking skills need work! ⏰");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentGame, gameState, clickTimeLeft, clickCount, clickTarget]);

  // Avoid Game Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentGame === 'avoid' && gameState === 'playing') {
      interval = setInterval(() => {
        setObstacles(prev => {
          const newObstacles = prev.map(obstacle => ({
            ...obstacle,
            x: obstacle.x + (Math.random() - 0.5) * 10,
            y: obstacle.y + (Math.random() - 0.5) * 10
          })).filter(obstacle => 
            obstacle.x >= 0 && obstacle.x <= 100 && 
            obstacle.y >= 0 && obstacle.y <= 100
          );
          
          if (Math.random() < 0.3 && newObstacles.length < 8) {
            newObstacles.push({
              id: Math.random().toString(),
              x: Math.random() * 100,
              y: Math.random() * 100
            });
          }
          
          return newObstacles;
        });
        
        setAvoidScore(prev => prev + 1);
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [currentGame, gameState]);

  // Memory Game Logic
  const startMemorySequence = useCallback(() => {
    const sequence = Array.from({ length: memoryLevel + 2 }, () => Math.floor(Math.random() * 4));
    setMemorySequence(sequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    
    sequence.forEach((num, index) => {
      setTimeout(() => {
        // Flash the button
        const button = document.getElementById(`memory-btn-${num}`);
        if (button) {
          button.classList.add('bg-white');
          setTimeout(() => button.classList.remove('bg-white'), 300);
        }
        
        if (index === sequence.length - 1) {
          setTimeout(() => setShowingSequence(false), 500);
        }
      }, (index + 1) * 600);
    });
  }, [memoryLevel]);

  const handleMemoryClick = (buttonIndex: number) => {
    if (showingSequence) return;
    
    const newPlayerSequence = [...playerSequence, buttonIndex];
    setPlayerSequence(newPlayerSequence);
    
    if (newPlayerSequence[newPlayerSequence.length - 1] !== memorySequence[newPlayerSequence.length - 1]) {
      setGameState('lost');
      setSarcasticMessage("Wrong! Your memory is as bad as your focus! 🧠💥");
      return;
    }
    
    if (newPlayerSequence.length === memorySequence.length) {
      if (memoryLevel >= 5) {
        setGameState('won');
        setSarcasticMessage("Incredible! You remembered something! 🎉");
      } else {
        setMemoryLevel(prev => prev + 1);
        setSarcasticMessage(`Level ${memoryLevel + 1}! Don't get cocky! 😤`);
        setTimeout(() => startMemorySequence(), 1000);
      }
    }
  };

  // Target movement effect
  useEffect(() => {
    if ((currentGame === 'hover' || currentGame === 'click') && gameState === 'playing') {
      moveIntervalRef.current = setInterval(() => {
        moveTarget();
      }, Math.random() * 2000 + 1000);
    }
    
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [currentGame, gameState, moveTarget]);

  // Popup spawning effect
  useEffect(() => {
    if (gameState === 'playing') {
      popupIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.3) {
          createPopup();
        }
      }, 2000);
    }
    
    return () => {
      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current);
      }
    };
  }, [gameState, createPopup]);

  // Background cycling effect
  useEffect(() => {
    backgroundIntervalRef.current = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => {
      if (backgroundIntervalRef.current) {
        clearInterval(backgroundIntervalRef.current);
      }
    };
  }, []);

  // Sarcastic message cycling
  useEffect(() => {
    if (gameState === 'playing') {
      sarcasticIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.2) {
          changeSarcasticMessage();
        }
      }, 3000);
    }
    
    return () => {
      if (sarcasticIntervalRef.current) {
        clearInterval(sarcasticIntervalRef.current);
      }
    };
  }, [gameState, changeSarcasticMessage]);

  return (
    <div className={`relative min-h-screen overflow-hidden ${
      backgroundMode === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
      backgroundMode === 1 ? 'bg-gradient-to-br from-blue-500 to-green-500' :
      backgroundMode === 2 ? 'bg-gradient-to-br from-yellow-500 to-red-500' :
      'bg-gradient-to-br from-indigo-500 to-purple-500'
    }`}>
      {/* Game Selection */}
      {gameState === 'playing' && (
        <div className="absolute top-4 left-4 space-y-2">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => switchGame(game.id)}
              className={`${game.color} p-2 rounded-lg flex items-center space-x-2 text-white ${
                currentGame === game.id ? 'ring-2 ring-white' : ''
              }`}
            >
              <game.icon className="w-5 h-5" />
              <span>{game.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-full min-h-[500px] flex items-center justify-center"
        onMouseMove={(e) => {
          if (currentGame === 'avoid' && gameState === 'playing') {
            const rect = gameAreaRef.current?.getBoundingClientRect();
            if (rect) {
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              // Check collision with obstacles here
              const collision = obstacles.some(obs => 
                Math.abs(obs.x - x) < 5 && Math.abs(obs.y - y) < 5
              );
              if (collision) {
                setGameState('lost');
                setSarcasticMessage("Ouch! That looked painful! 🤕");
              }
            }
          }
        }}
      >
        {/* Target for Hover and Click games */}
        {(currentGame === 'hover' || currentGame === 'click') && (
          <div
            ref={targetRef}
            className={`absolute w-16 h-16 rounded-lg cursor-pointer transform transition-transform ${
              currentGame === 'hover' ? 'bg-red-500' : 'bg-blue-500'
            } ${shakeIntensity > 0 ? 'animate-shake' : ''}`}
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              transform: `translate(-50%, -50%) scale(${isHovering ? 1.1 : 1})`
            }}
            onMouseEnter={() => currentGame === 'hover' && setIsHovering(true)}
            onMouseLeave={() => currentGame === 'hover' && setIsHovering(false)}
            onClick={() => {
              if (currentGame === 'click' && gameState === 'playing') {
                setClickCount(prev => {
                  const newCount = prev + 1;
                  if (newCount >= clickTarget) {
                    setGameState('won');
                    setSarcasticMessage("What?! You actually did it! 🎯");
                  }
                  return newCount;
                });
                moveTarget();
              }
            }}
          />
        )}

        {/* Memory Game Buttons */}
        {currentGame === 'memory' && (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(index => (
              <button
                key={index}
                id={`memory-btn-${index}`}
                onClick={() => handleMemoryClick(index)}
                disabled={showingSequence || gameState !== 'playing'}
                className={`w-24 h-24 rounded-lg transition-colors ${
                  index === 0 ? 'bg-red-500' :
                  index === 1 ? 'bg-blue-500' :
                  index === 2 ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Avoid Game Obstacles */}
        {currentGame === 'avoid' && obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="absolute w-4 h-4 bg-red-500 rounded-full"
            style={{
              left: `${obstacle.x}%`,
              top: `${obstacle.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Popups */}
        {popups.map(popup => (
          <div
            key={popup.id}
            className={`absolute p-3 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
              popup.type === 'alert' ? 'bg-red-500' :
              popup.type === 'warning' ? 'bg-yellow-500' :
              popup.type === 'prize' ? 'bg-green-500' :
              'bg-blue-500'
            } text-white`}
            style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
          >
            {popup.message}
          </div>
        ))}
      </div>

      {/* Game Status */}
      <div className="absolute top-4 right-4 text-white text-xl font-bold">
        {currentGame === 'hover' && `Time: ${timeHovered.toFixed(1)}s / 10s`}
        {currentGame === 'click' && `Clicks: ${clickCount} / ${clickTarget} (${clickTimeLeft}s)`}
        {currentGame === 'avoid' && `Score: ${avoidScore}`}
        {currentGame === 'memory' && `Level: ${memoryLevel}`}
      </div>

      {/* Sarcastic Message */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xl font-bold text-center">
        {sarcasticMessage}
      </div>
    </div>
  );
}

export default GamePage;