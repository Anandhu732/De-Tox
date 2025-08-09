import { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Target, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllScores, formatScore, getGameDisplayName, clearScores, ScoreEntry } from '../utils/scoreManager';

// Fallback fake data if no real scores exist
const fallbackScores: ScoreEntry[] = [
  {
    id: '1',
    playerName: "CheatMaster3000",
    gameType: "hover",
    score: 99,
    timestamp: Date.now() - 1000000,
    status: "Definitely Not Cheating 😏"
  },
  {
    id: '2',
    playerName: "MouseNinja",
    gameType: "click",
    score: 87,
    timestamp: Date.now() - 2000000,
    status: "Suspiciously Good 🤔"
  },
  {
    id: '3',
    playerName: "LuckyGuesser",
    gameType: "avoid",
    score: 72,
    timestamp: Date.now() - 3000000,
    status: "Pure Luck (Obviously)"
  }
];

const LeaderboardPage = () => {
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [glitchMode, setGlitchMode] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const backgroundClasses = [
    'bg-gradient-to-br from-purple-900 via-pink-900 to-red-900',
    'bg-gradient-to-tr from-blue-900 via-purple-900 to-pink-900',
    'bg-gradient-to-bl from-green-900 via-blue-900 to-purple-900',
    'bg-gradient-to-tl from-red-900 via-orange-900 to-yellow-900'
  ];

  const gameTypes = [
    { id: 'all', name: 'All Games', icon: Trophy },
    { id: 'hover', name: 'Hover Hell', icon: Target },
    { id: 'click', name: 'Click Chaos', icon: Zap },
    { id: 'avoid', name: 'Dodge Disaster', icon: Award }
  ];

  // Load scores on component mount
  useEffect(() => {
    const loadScores = () => {
      const allScores = getAllScores();

      if (allScores.length === 0) {
        setScores(fallbackScores);
      } else {
        setScores(allScores);
      }
    };

    loadScores();

    // Listen for storage changes (when new scores are added)
    const handleStorageChange = () => {
      loadScores();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for focus events to refresh data
    window.addEventListener('focus', loadScores);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadScores);
    };
  }, []);

  // Filter scores based on selected game
  const filteredScores = selectedGame === 'all'
    ? scores
    : scores.filter(score => score.gameType === selectedGame);

  // Get display data for each score entry
  const getDisplayData = (entry: ScoreEntry, index: number) => {
    const isTopThree = index < 3;
    const gameInfo = gameTypes.find(game => game.id === entry.gameType);
    const Icon = gameInfo?.icon || Target;

    return {
      ...entry,
      displayScore: formatScore(entry.score, entry.gameType),
      displayGame: getGameDisplayName(entry.gameType),
      Icon,
      isTopThree,
      rank: index + 1,
      color: isTopThree
        ? index === 0 ? 'text-yellow-400'
          : index === 1 ? 'text-gray-300'
          : 'text-orange-400'
        : 'text-blue-400'
    };
  };

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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/smily.png"
              alt="De-Tox Logo"
              className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transition-all duration-300 cursor-pointer ${
                glitchMode ? 'animate-spin' : 'animate-pulse hover:animate-bounce'
              }`}
              style={{
                filter: `drop-shadow(0 0 15px hsla(${120 + Math.sin(Date.now() * 0.001) * 60}, 70%, 50%, 0.6)) hue-rotate(${Math.cos(Date.now() * 0.002) * 180}deg)`,
              }}
            />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer mb-4">
            Hall of Shame 🏆
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 max-w-4xl mx-auto">
            These "champions" somehow managed to not fail completely!
            <br className="hidden sm:block" />
            (Results may be fabricated for entertainment purposes) 😈
          </p>
        </div>

        {/* Game Filter Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {gameTypes.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-110 ${
                    selectedGame === game.id
                      ? 'bg-yellow-400 text-black border-2 border-white'
                      : 'bg-black bg-opacity-60 text-white border-2 border-gray-600 hover:border-yellow-400'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{game.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black bg-opacity-60 rounded-xl border-4 border-yellow-400 p-4 sm:p-6 lg:p-8">
            {filteredScores.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Scores Yet!</h3>
                <p className="text-gray-400">Play some games to see your scores here!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredScores.map((entry, index) => {
                  const displayData = getDisplayData(entry, index);

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg transform transition-all hover:scale-105 ${
                        displayData.isTopThree
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
                          displayData.isTopThree ? 'bg-white text-yellow-600' : 'bg-gray-700 text-white'
                        } font-black text-lg sm:text-xl`}>
                          {displayData.rank}
                        </div>

                        <displayData.Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${displayData.color}`} />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm sm:text-lg truncate">
                            {entry.playerName}
                          </h3>
                          <p className="text-gray-300 text-xs sm:text-sm truncate">
                            {entry.status}
                          </p>
                          {selectedGame === 'all' && (
                            <p className="text-gray-400 text-xs">
                              {displayData.displayGame}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black text-lg sm:text-2xl ${displayData.color}`}>
                          {displayData.displayScore}
                        </div>
                        <div className="text-gray-400 text-xs sm:text-sm">
                          {displayData.rank === 1 ? 'LEGEND' :
                           displayData.rank <= 3 ? 'HERO' :
                           displayData.rank <= 5 ? 'DECENT' : 'NOOB'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-red-600 bg-opacity-80 p-4 sm:p-6 rounded-lg border-4 border-yellow-400 transform -rotate-1">
            <p className="text-white font-bold text-center text-sm sm:text-base">
              ⚠️ REAL LEADERBOARD: These are actual scores from real players!
              Your failures are now permanently recorded for posterity! ⚠️
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

            {/* Hidden Clear Scores Button (for testing) */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all scores? This cannot be undone!')) {
                  clearScores();
                  setScores([]);
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transform hover:scale-105 transition-all text-sm border-2 border-gray-400 opacity-50 hover:opacity-100"
              title="Clear all scores (for testing)"
            >
              Clear Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;