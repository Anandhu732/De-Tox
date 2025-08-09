import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, Sparkles, ArrowRight } from 'lucide-react';

const emojis = ['🎯', '🤪', '😵‍💫', '🎉', '💫', '⭐', '🌟', '🎈', '🦄', '🌈'];

const HomePage = () => {
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<string[]>([]);

  const backgroundClasses = [
    'bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700',
    'bg-gradient-to-tr from-green-400 via-yellow-500 to-red-600',
    'bg-gradient-to-bl from-indigo-600 via-pink-500 to-yellow-400',
    'bg-gradient-to-tl from-red-500 via-orange-500 to-yellow-500'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);

      // Add random floating emojis
      if (Math.random() < 0.3) {
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

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer mb-4">
            Focus? Never Heard of It! 🤪
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 max-w-4xl mx-auto">
            The most impossible game ever created! Try to keep your mouse on a box for 10 seconds.
            <br className="hidden sm:block" />
            Spoiler alert: You probably can't! 😈
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-6xl w-full">
          <div className="bg-black bg-opacity-50 p-4 sm:p-6 rounded-lg transform rotate-2 hover:rotate-6 transition-transform border-2 border-pink-400">
            <Target className="w-8 h-8 sm:w-12 sm:h-12 text-pink-400 mb-3 mx-auto" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Moving Target</h3>
            <p className="text-sm sm:text-base text-gray-300 text-center">
              A box that teleports, jumps, and runs away from your cursor like it owes you money!
            </p>
          </div>

          <div className="bg-black bg-opacity-50 p-4 sm:p-6 rounded-lg transform -rotate-2 hover:-rotate-6 transition-transform border-2 border-green-400">
            <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mb-3 mx-auto" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Chaos Mode</h3>
            <p className="text-sm sm:text-base text-gray-300 text-center">
              Pop-ups, flashing colors, and distractions designed by evil geniuses!
            </p>
          </div>

          <div className="bg-black bg-opacity-50 p-4 sm:p-6 rounded-lg transform rotate-1 hover:rotate-4 transition-transform border-2 border-yellow-400 sm:col-span-2 lg:col-span-1">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 mb-3 mx-auto" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">Sarcastic AI</h3>
            <p className="text-sm sm:text-base text-gray-300 text-center">
              An AI that mocks your every move and celebrates your failures!
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link
            to="/game"
            className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:rotate-3 transition-all text-lg sm:text-xl shadow-lg border-4 border-white"
          >
            <span className="flex items-center justify-center">
              Start the Chaos!
              <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/about"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:-rotate-3 transition-all text-lg sm:text-xl border-4 border-yellow-400"
          >
            How Does This Work? 🤔
          </Link>
        </div>

        {/* Warning */}
        <div className="mt-8 sm:mt-12 bg-red-600 bg-opacity-80 p-4 sm:p-6 rounded-lg border-4 border-yellow-400 transform -rotate-1 max-w-2xl">
          <p className="text-white font-bold text-center text-sm sm:text-base">
            ⚠️ WARNING: This game may cause uncontrollable laughter, mild frustration,
            and an irresistible urge to throw your mouse across the room! ⚠️
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;