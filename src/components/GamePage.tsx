import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Zap, AlertTriangle, Gift, Sparkles, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PopupMessage {
  id: string;
  message: string;
  x: number;
  y: number;
  type: 'alert' | 'news' | 'prize' | 'warning';
}

const GamePage = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [timeHovered, setTimeHovered] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [popups, setPopups] = useState<PopupMessage[]>([]);
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [sarcasticMessage, setSarcasticMessage] = useState("Try to keep your mouse on the box for 10 seconds. How hard could it be? 😏");
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [emojiStorm, setEmojiStorm] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<NodeJS.Timeout>();
  const popupIntervalRef = useRef<NodeJS.Timeout>();
  const backgroundIntervalRef = useRef<NodeJS.Timeout>();
  const sarcasticIntervalRef = useRef<NodeJS.Timeout>();

  const sarcasticMessages = [
    "Oh wow, you're actually trying! 🙄",
    "Don't get too excited now... 😴",
    "I'm sure you'll give up soon 😈",
    "Your mouse skills are... questionable 🤔",
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
      // Teleport
      setTargetPosition(getRandomPosition());
      setShakeIntensity(3);
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
    
    // Remove popup after 3-6 seconds
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== popup.id));
    }, Math.random() * 3000 + 3000);
  }, []);

  const changeSarcasticMessage = useCallback(() => {
    setSarcasticMessage(sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)]);
  }, []);

  // Game timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHovering && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeHovered(prev => {
          const newTime = prev + 0.1;
          
          // Random chance to reset timer (sabotage!)
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
  }, [isHovering, gameState]);

  // Target movement effect
  useEffect(() => {
    if (gameState === 'playing') {
      moveIntervalRef.current = setInterval(() => {
        moveTarget();
      }, Math.random() * 2000 + 1000);
    }
    
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [moveTarget, gameState]);

  // Popup spawning effect
  useEffect(() => {
    popupIntervalRef.current = setInterval(() => {
      if (Math.random() < 0.7) {
        createPopup();
      }
    }, 2000);
    
    return () => {
      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current);
      }
    };
  }, [createPopup]);

  // Background chaos effect
  useEffect(() => {
    backgroundIntervalRef.current = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);
      
      // Emoji storm
      if (Math.random() < 0.3) {
        setEmojiStorm(true);
        setTimeout(() => setEmojiStorm(false), 3000);
      }
    }, 3000);
    
    return () => {
      if (backgroundIntervalRef.current) {
        clearInterval(backgroundIntervalRef.current);
      }
    };
  }, []);

  // Sarcastic message changer
  useEffect(() => {
    sarcasticIntervalRef.current = setInterval(() => {
      if (gameState === 'playing') {
        changeSarcasticMessage();
      }
    }, 4000);
    
    return () => {
      if (sarcasticIntervalRef.current) {
        clearInterval(sarcasticIntervalRef.current);
      }
    };
  }, [changeSarcasticMessage, gameState]);

  const resetGame = () => {
    setGameState('playing');
    setTimeHovered(0);
    setIsHovering(false);
    setTargetPosition({ x: 50, y: 50 });
    setPopups([]);
    setSarcasticMessage("Back for more punishment? I respect that! 😤");
  };

  const backgroundClasses = [
    'bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700',
    'bg-gradient-to-tr from-green-400 via-yellow-500 to-red-600',
    'bg-gradient-to-bl from-indigo-600 via-pink-500 to-yellow-400',
    'bg-gradient-to-tl from-red-500 via-orange-500 to-yellow-500'
  ];

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClasses[backgroundMode]} relative overflow-hidden`}>
      {/* Emoji Storm */}
      {emojiStorm && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl sm:text-4xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              {['🎉', '🎊', '💫', '⭐', '✨', '🌟', '🎈', '🎁', '🦄', '🌈'][Math.floor(Math.random() * 10)]}
            </div>
          ))}
        </div>
      )}

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full opacity-60 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className={`text-center py-4 sm:py-6 px-4 transform ${shakeIntensity > 0 ? 'animate-bounce' : ''}`}>
        <h1 
          className="text-3xl sm:text-4xl lg:text-6xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer"
          onClick={() => setSarcasticMessage("Stop clicking the title! Focus on the game! 😤")}
        >
          Focus? Never Heard of It! 🤪
        </h1>
        <div className="mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 px-4">
          {sarcasticMessage}
        </div>
      </div>

      {/* Game Stats */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-4 sm:mb-6 px-4">
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform rotate-2 hover:rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Timer: {timeHovered.toFixed(1)}s</div>
          <div className="text-xs sm:text-sm opacity-75">Target: 10.0s (good luck!)</div>
        </div>
        <div className="bg-black bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transform -rotate-2 hover:-rotate-6 transition-transform">
          <div className="text-base sm:text-lg font-bold">Status: {isHovering ? '🎯 Hovering' : '❌ Not Even Close'}</div>
          <div className="text-xs sm:text-sm opacity-75">Difficulty: Impossible</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex justify-center px-4">
        <div 
          ref={gameAreaRef}
          className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square border-4 border-white border-dashed rounded-lg bg-black bg-opacity-30 overflow-hidden"
          style={{
            transform: `rotate(${shakeIntensity * 2}deg) scale(${1 + shakeIntensity * 0.02})`
          }}
        >
          {/* Moving Target */}
          <div
            ref={targetRef}
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
      </div>

      {/* Pop-up Messages */}
      {popups.map(popup => (
        <div
          key={popup.id}
          className={`fixed z-20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border-2 font-bold text-xs sm:text-sm animate-bounce cursor-pointer transform hover:scale-110 transition-transform ${
            popup.type === 'alert' ? 'bg-red-500 text-white border-red-700' :
            popup.type === 'news' ? 'bg-blue-500 text-white border-blue-700' :
            popup.type === 'prize' ? 'bg-green-500 text-white border-green-700' :
            'bg-yellow-500 text-black border-yellow-700'
          }`}
          style={{
            left: `${popup.x}%`,
            top: `${popup.y}%`,
            transform: 'translate(-50%, -50%)',
            animationDuration: `${0.5 + Math.random() * 0.5}s`
          }}
          onClick={() => {
            setPopups(prev => prev.filter(p => p.id !== popup.id));
            setSarcasticMessage("You clicked a pop-up! That's exactly what we wanted! 😈");
          }}
        >
          {popup.type === 'alert' && <AlertTriangle className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
          {popup.type === 'prize' && <Gift className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
          {popup.type === 'warning' && <Zap className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
          {popup.type === 'news' && <Sparkles className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
          <span className="hidden sm:inline">{popup.message}</span>
          <span className="sm:hidden">{popup.message.slice(0, 20)}...</span>
        </div>
      ))}

      {/* Game Over Screen */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-30 p-4">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 sm:p-8 rounded-xl border-4 border-yellow-400 text-center transform animate-bounce max-w-md w-full">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Wait... You Actually Did It?! 🤯
            </h2>
            <p className="text-base sm:text-xl text-yellow-300 mb-6">
              We weren't prepared for this... Our sabotage systems have failed! 
              <br className="hidden sm:block" />
              (Your score has been deleted for being too good) 🗑️
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transform hover:scale-110 transition-all"
              >
                Try Again 😈
              </button>
              <Link
                to="/"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transform hover:scale-110 transition-all text-center"
              >
                <Home className="inline w-4 h-4 mr-1" />
                Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="fixed bottom-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <button
          onClick={resetGame}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transform hover:scale-110 hover:rotate-6 transition-all order-2 sm:order-1"
        >
          Give Up? 🏳️
        </button>
        <div className="text-white font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg transform -rotate-3 order-1 sm:order-2">
          High Score: Still Zero! 🎯
        </div>
        <button
          onClick={() => setSarcasticMessage("Instructions unclear, got distracted by shiny button! ✨")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transform hover:scale-110 hover:-rotate-6 transition-all animate-pulse order-3"
        >
          Confusion? 🤔
        </button>
      </div>
    </div>
  );
};

export default GamePage;