import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Zap, Target, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [glitchMode, setGlitchMode] = useState(false);

  const backgroundClasses = [
    'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900',
    'bg-gradient-to-tr from-blue-900 via-purple-900 to-pink-900',
    'bg-gradient-to-bl from-green-900 via-blue-900 to-purple-900',
    'bg-gradient-to-tl from-red-900 via-orange-900 to-yellow-900'
  ];

  // Fake leaderboard data with sarcastic entries
  const leaderboardData = [
    { rank: 1, name: "CheatMaster3000", score: "9.9s", status: "Definitely Not Cheating 😏", icon: Trophy, color: "text-yellow-400" },
    { rank: 2, name: "MouseNinja", score: "8.7s", status: "Suspiciously Good 🤔", icon: Medal, color: "text-gray-300" },
    { rank: 3, name: "LuckyGuesser", score: "7.2s", status: "Pure Luck (Obviously)", icon: Award, color: "text-orange-400" },
    { rank: 4, name: "TryHard2023", score: "6.8s", status: "Gave Up After This", icon: Target, color: "text-blue-400" },
    { rank: 5, name: "CoffeeAddict", score: "5.1s", status: "Needs More Caffeine ☕", icon: Zap, color: "text-green-400" },
    { rank: 6, name: "RandomClicker", score: "3.9s", status: "Clicked Everything", icon: Target, color: "text-purple-400" },
    { rank: 7, name: "GiveUpEarly", score: "2.4s", status: "Rage Quit Immediately", icon: Target, color: "text-red-400" },
    { rank: 8, name: "ConfusedUser", score: "1.1s", status: "Still Doesn't Understand", icon: Target, color: "text-pink-400" },
    { rank: 9, name: "AccidentalWin", score: "0.8s", status: "Mouse Slipped", icon: Target, color: "text-indigo-400" },
    { rank: 10, name: "You", score: "0.0s", status: "Haven't Even Tried Yet! 😂", icon: Target, color: "text-gray-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);
      
      // Random glitch effect
      if (Math.random() < 0.2) {
        setGlitchMode(true);
        setTimeout(() => setGlitchMode(false), 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClasses[backgroundMode]} relative overflow-hidden`}>
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full opacity-40 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className={`text-center mb-8 sm:mb-12 ${glitchMode ? 'animate-pulse' : ''}`}>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer mb-4">
            Hall of Shame 🏆
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 max-w-4xl mx-auto">
            These "champions" somehow managed to not fail completely! 
            <br className="hidden sm:block" />
            (Results may be fabricated for entertainment purposes) 😈
          </p>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black bg-opacity-60 rounded-xl border-4 border-yellow-400 p-4 sm:p-6 lg:p-8">
            <div className="space-y-3 sm:space-y-4">
              {leaderboardData.map((entry, index) => {
                const Icon = entry.icon;
                const isTopThree = entry.rank <= 3;
                
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transform transition-all hover:scale-105 ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400' 
                        : 'bg-gray-800 bg-opacity-80 border border-gray-600'
                    } ${glitchMode && index % 2 === 0 ? 'animate-bounce' : ''}`}
                    style={{
                      transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
                        isTopThree ? 'bg-white text-yellow-600' : 'bg-gray-700 text-white'
                      } font-black text-lg sm:text-xl`}>
                        {entry.rank}
                      </div>
                      
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${entry.color}`} />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm sm:text-lg truncate">
                          {entry.name}
                        </h3>
                        <p className="text-gray-300 text-xs sm:text-sm truncate">
                          {entry.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-black text-lg sm:text-2xl ${entry.color}`}>
                        {entry.score}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm">
                        {entry.rank === 1 ? 'LEGEND' : 
                         entry.rank <= 3 ? 'HERO' : 
                         entry.rank <= 5 ? 'DECENT' : 'NOOB'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-red-600 bg-opacity-80 p-4 sm:p-6 rounded-lg border-4 border-yellow-400 transform -rotate-1">
            <p className="text-white font-bold text-center text-sm sm:text-base">
              ⚠️ DISCLAIMER: This leaderboard is 100% fake and exists purely to mock your inevitable failure! 
              Real scores are immediately deleted to prevent anyone from feeling good about themselves! ⚠️
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 justify-center">
            <Link
              to="/game"
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:rotate-3 transition-all text-lg sm:text-xl shadow-lg border-4 border-white text-center"
            >
              Try to Beat Them! 🎯
            </Link>

            <Link
              to="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:-rotate-3 transition-all text-lg sm:text-xl border-4 border-yellow-400 text-center"
            >
              <Home className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Back to Safety
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;