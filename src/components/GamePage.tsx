import React, { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles, Home, RefreshCw, Trophy, Target, MousePointer, Shield } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import HoverGame from '../games/HoverGame';
import ClickGame from '../games/ClickGame';
import AvoidGame from '../games/AvoidGame';

interface PopupMessage {
  id: string;
  message: string;
  x: number;
  y: number;
  type: 'alert' | 'news' | 'prize' | 'warning';
}

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

const emojis = ['🎮', '🎯', '🤪', '😵‍💫', '🎉', '💫', '⭐', '🌟', '🎈', '🦄', '🌈'];

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const playerName = location.state?.playerName || 'Anonymous Player';

  const [backgroundMode, setBackgroundMode] = useState(0);
  const [sarcasticMessage, setSarcasticMessage] = useState("Get ready to fail spectacularly! 😈");
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [finalScore, setFinalScore] = useState(0);
  const [popups, setPopups] = useState<PopupMessage[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<string[]>([]);

  const backgroundClasses = [
    'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600',
    'bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600',
    'bg-gradient-to-bl from-green-600 via-blue-600 to-purple-600',
    'bg-gradient-to-tl from-yellow-600 via-orange-600 to-red-600'
  ];

  const gameInfo = {
    hover: {
      name: 'Hover Hell',
      icon: Target,
      description: 'Keep your mouse on the box for 10 seconds',
      emojis: ['🎯', '😵‍💫', '🤪']
    },
    click: {
      name: 'Click Chaos',
      icon: MousePointer,
      description: 'Click the moving target 10 times in 15 seconds',
      emojis: ['👆', '💥', '⚡']
    },
    avoid: {
      name: 'Dodge Disaster',
      icon: Shield,
      description: 'Avoid the red obstacles for as long as possible',
      emojis: ['🛡️', '💀', '🏃‍♂️']
    }
  };

  const currentGameInfo = gameInfo[gameId as keyof typeof gameInfo];

  // Background animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);

      // Add random floating emojis
      if (Math.random() < 0.3) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        setFloatingEmojis(prev => [...prev, randomEmoji]);

        // Remove emoji after animation
        setTimeout(() => {
          setFloatingEmojis(prev => prev.slice(1));
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Chaos popups effect
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        if (Math.random() < 0.15) {
          const message = popupMessages[Math.floor(Math.random() * popupMessages.length)];
          const popup: PopupMessage = {
            id: Math.random().toString(),
            message: message.text,
            type: message.type,
            x: Math.random() * 70 + 15,
            y: Math.random() * 70 + 15
          };

          setPopups(prev => [...prev, popup]);

          setTimeout(() => {
            setPopups(prev => prev.filter(p => p.id !== popup.id));
          }, Math.random() * 2000 + 3000);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleGameEnd = (result: 'won' | 'lost', score: number) => {
    setGameState(result);
    setFinalScore(score);

    if (result === 'won') {
      setSarcasticMessage(`🤯 IMPOSSIBLE! ${playerName} actually won! This must be a glitch in the matrix!`);
    } else {
      setSarcasticMessage(`😂 As expected, ${playerName} failed spectacularly! Better luck never!`);
    }
  };

  const handleSarcasticMessage = (message: string) => {
    setSarcasticMessage(message);
  };

  const resetGame = () => {
    setGameState('playing');
    setFinalScore(0);
    setPopups([]);
    setSarcasticMessage("Back for more punishment? I admire your persistence! 😤");
  };

  const getPopupColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-500 border-red-700';
      case 'news': return 'bg-blue-500 border-blue-700';
      case 'prize': return 'bg-yellow-500 border-yellow-700';
      case 'warning': return 'bg-orange-500 border-orange-700';
      default: return 'bg-purple-500 border-purple-700';
    }
  };

  if (!currentGameInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-purple-600 to-blue-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-black mb-4">Game Not Found! 😵</h1>
          <p className="text-xl mb-8">This game doesn't exist... yet! 🤔</p>
          <Link
            to="/game"
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-black py-3 px-6 rounded-lg hover:scale-110 transform transition-all"
          >
            Back to Game Selection
          </Link>
        </div>
      </div>
    );
  }

  const GameIcon = currentGameInfo.icon;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClasses[backgroundMode]} relative overflow-hidden`}>
      {/* Floating Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <div
          key={index}
          className="fixed text-4xl sm:text-6xl animate-bounce pointer-events-none z-10"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDuration: `${1 + Math.random()}s`
          }}
        >
          {emoji}
        </div>
      ))}

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

      {/* Chaos Popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className={`fixed z-30 ${getPopupColor(popup.type)} text-white px-3 py-2 rounded-lg border-2 shadow-lg animate-bounce text-xs sm:text-sm font-bold cursor-pointer hover:scale-110 transform transition-all`}
          style={{
            left: `${popup.x}%`,
            top: `${popup.y}%`,
            animation: 'bounce 1s infinite, pulse 2s infinite alternate'
          }}
          onClick={() => setPopups(prev => prev.filter(p => p.id !== popup.id))}
        >
          {popup.message}
        </div>
      ))}

      <div className="relative z-20 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <GameIcon className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 mr-3" />
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer">
              {currentGameInfo.name}
            </h1>
            {currentGameInfo.emojis.map((emoji, i) => (
              <span key={i} className="text-2xl sm:text-4xl ml-2 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                {emoji}
              </span>
            ))}
          </div>

          <p className="text-lg sm:text-xl text-yellow-300 font-bold mb-6">
            {currentGameInfo.description}
          </p>
        </div>

        {/* Sarcastic AI Messages */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-black bg-opacity-60 p-4 sm:p-6 rounded-xl border-4 border-yellow-400 transform -rotate-1">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2 animate-spin" />
              <h3 className="text-lg sm:text-xl font-black text-white">Sarcastic AI Says:</h3>
              <Sparkles className="w-6 h-6 text-yellow-400 ml-2 animate-spin" />
            </div>
            <p className="text-white font-bold text-center text-sm sm:text-lg">
              {sarcasticMessage}
            </p>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {gameState === 'playing' && (
            <>
              {gameId === 'hover' && (
                <HoverGame
                  playerName={playerName}
                  onGameEnd={handleGameEnd}
                  onSarcasticMessage={handleSarcasticMessage}
                />
              )}
              {gameId === 'click' && (
                <ClickGame
                  playerName={playerName}
                  onGameEnd={handleGameEnd}
                  onSarcasticMessage={handleSarcasticMessage}
                />
              )}
              {gameId === 'avoid' && (
                <AvoidGame
                  playerName={playerName}
                  onGameEnd={handleGameEnd}
                  onSarcasticMessage={handleSarcasticMessage}
                />
              )}
            </>
          )}

          {/* Game End Screen */}
          {gameState !== 'playing' && (
            <div className="text-center space-y-6">
              <div className="bg-black bg-opacity-60 p-6 sm:p-8 rounded-xl border-4 border-yellow-400">
                <div className="mb-6">
                  {gameState === 'won' ? (
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  ) : (
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  )}

                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                    {gameState === 'won' ? 'IMPOSSIBLE VICTORY!' : 'EPIC FAIL!'}
                  </h2>

                  <p className="text-lg sm:text-xl text-yellow-300 font-bold mb-4">
                    Final Score: {finalScore}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-black py-3 px-6 rounded-lg transform hover:scale-110 hover:rotate-3 transition-all text-lg shadow-lg border-4 border-white flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again (Glutton for Punishment?)
                  </button>

                  <Link
                    to="/game"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-black py-3 px-6 rounded-lg transform hover:scale-110 hover:-rotate-3 transition-all text-lg shadow-lg border-4 border-white flex items-center justify-center"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Choose Different Torture
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/game"
            className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all transform hover:scale-105 inline-flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Game Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamePage;