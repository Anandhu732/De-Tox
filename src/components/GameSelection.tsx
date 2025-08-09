import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, MousePointer, Shield, User, Play, Sparkles } from 'lucide-react';

const emojis = ['🎮', '🎯', '🤪', '😵‍💫', '🎉', '💫', '⭐', '🌟', '🎈', '🦄', '🌈'];

const GameSelection = () => {
  const [playerName, setPlayerName] = useState('');
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<string[]>([]);
  const navigate = useNavigate();

  const backgroundClasses = [
    'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600',
    'bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600',
    'bg-gradient-to-bl from-green-600 via-blue-600 to-purple-600',
    'bg-gradient-to-tl from-yellow-600 via-orange-600 to-red-600'
  ];

  const games = [
    {
      id: 'hover',
      name: 'Hover Hell',
      icon: Target,
      description: 'Keep your mouse on a moving box for 10 seconds. Sounds easy? Think again!',
      difficulty: 'Impossible',
      color: 'from-red-500 to-pink-600',
      borderColor: 'border-red-400',
      emojis: ['🎯', '😵‍💫', '🤪']
    },
    {
      id: 'click',
      name: 'Click Chaos',
      icon: MousePointer,
      description: 'Click the moving target 10 times in 15 seconds. Your mouse will hate you!',
      difficulty: 'Insane',
      color: 'from-blue-500 to-purple-600',
      borderColor: 'border-blue-400',
      emojis: ['👆', '💥', '⚡']
    },
    {
      id: 'avoid',
      name: 'Dodge Disaster',
      icon: Shield,
      description: 'Avoid the red obstacles for as long as possible. They multiply like rabbits!',
      difficulty: 'Nightmare',
      color: 'from-green-500 to-teal-600',
      borderColor: 'border-green-400',
      emojis: ['🛡️', '💀', '🏃‍♂️']
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);

      // Add random floating emojis
      if (Math.random() < 0.4) {
        const newEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        setFloatingEmojis(prev => [...prev, newEmoji]);

        // Remove emoji after animation
        setTimeout(() => {
          setFloatingEmojis(prev => prev.slice(1));
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleGameSelect = (gameId: string) => {
    if (!playerName.trim()) {
      alert('Please enter your name first! We need someone to blame for the inevitable failure! 😈');
      return;
    }

    navigate(`/play/${gameId}`, {
      state: { playerName: playerName.trim() }
    });
  };

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
        {Array.from({ length: 20 }).map((_, i) => (
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

      <div className="relative z-20 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer mb-4">
            Choose Your Torture! 🎮
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 max-w-4xl mx-auto">
            Pick a game and prepare for the most frustrating experience of your life!
            <br className="hidden sm:block" />
            Each one is specially designed to break your spirit! 😈
          </p>
        </div>

        {/* Player Name Input */}
        <div className="max-w-md mx-auto mb-8 sm:mb-12">
          <div className="bg-black bg-opacity-60 p-6 rounded-xl border-4 border-yellow-400 transform -rotate-1">
            <div className="flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-black text-white">Who's About to Fail?</h2>
            </div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name (so we can mock you personally)"
              className="w-full px-4 py-3 text-lg font-bold text-center bg-white border-4 border-purple-400 rounded-lg focus:outline-none focus:border-pink-400 transform hover:scale-105 transition-transform"
              maxLength={20}
            />
            <p className="text-yellow-300 text-sm text-center mt-2">
              Don't worry, we'll remember your name when you inevitably give up! 😏
            </p>
          </div>
        </div>

        {/* Game Selection */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  className={`bg-black bg-opacity-60 p-6 sm:p-8 rounded-xl border-4 ${game.borderColor} transform transition-all hover:scale-105 hover:rotate-3 cursor-pointer`}
                  style={{
                    transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br ${game.color} rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform`}>
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      {game.name}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-3">
                      {game.emojis.map((emoji, i) => (
                        <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-red-400 font-bold text-sm">
                      Difficulty: {game.difficulty}
                    </span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      ))}
                    </div>
                  </div>

                  <button
                    className={`w-full bg-gradient-to-r ${game.color} hover:scale-110 text-white font-black py-3 px-6 rounded-lg transform transition-all text-lg shadow-lg border-2 border-white flex items-center justify-center space-x-2`}
                    disabled={!playerName.trim()}
                  >
                    <Play className="w-5 h-5" />
                    <span>Start the Pain!</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 sm:mt-12 max-w-4xl mx-auto">
          <div className="bg-red-600 bg-opacity-80 p-4 sm:p-6 rounded-lg border-4 border-yellow-400 transform rotate-1">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
              <h3 className="text-lg sm:text-xl font-black text-white">Fair Warning!</h3>
              <Sparkles className="w-6 h-6 text-yellow-400 ml-2" />
            </div>
            <p className="text-white font-bold text-center text-sm sm:text-base">
              ⚠️ These games are scientifically designed to be impossible! Side effects may include:
              uncontrollable laughter, mild frustration, and an irresistible urge to throw your mouse!
              We are not responsible for any damage to your ego or computer equipment! ⚠️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;