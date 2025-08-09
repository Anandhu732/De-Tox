import { useState, useEffect } from 'react';
import { Target, Zap, AlertTriangle, Gift, Sparkles, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const rotatingMessages = [
  "How does this madness work? 🤔",
  "The science behind the chaos! 🧪",
  "Understanding the impossible! 🤯",
  "Decoding the digital insanity! 💻"
];

const AboutPage = () => {
  const [backgroundMode, setBackgroundMode] = useState(0);
  const [rotatingText, setRotatingText] = useState(0);

  const backgroundClasses = [
    'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    'bg-gradient-to-tr from-green-900 via-teal-900 to-blue-900',
    'bg-gradient-to-bl from-red-900 via-pink-900 to-purple-900',
    'bg-gradient-to-tl from-yellow-900 via-orange-900 to-red-900'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMode(prev => (prev + 1) % 4);
      setRotatingText(prev => (prev + 1) % rotatingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Target,
      title: "The Moving Target",
      description: "Our advanced AI-powered box uses quantum mechanics to predict where you DON'T want it to be and immediately teleports there. It's like it can read your mind, but only the frustrated parts.",
      color: "text-red-400",
      bgColor: "bg-red-900"
    },
    {
      icon: Zap,
      title: "Chaos Engine™",
      description: "Powered by pure concentrated chaos, our proprietary engine generates exactly the right amount of visual noise to make your eyes water and your mouse cursor question its life choices.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900"
    },
    {
      icon: AlertTriangle,
      title: "Distraction Generator",
      description: "Our pop-up system is trained on the most annoying advertisements from the early 2000s. Each message is carefully crafted to be maximally irrelevant to your current task.",
      color: "text-orange-400",
      bgColor: "bg-orange-900"
    },
    {
      icon: Gift,
      title: "Sarcasm AI",
      description: "Meet SASS (Sarcastic Artificial Snark System) - an AI that has achieved consciousness purely to mock your gaming abilities. It never sleeps, never forgives, and never forgets your failures.",
      color: "text-purple-400",
      bgColor: "bg-purple-900"
    },
    {
      icon: Sparkles,
      title: "Anti-Success Protocol",
      description: "Our patented technology ensures that just when you think you're winning, something goes hilariously wrong. It's not a bug, it's a feature designed by evil geniuses!",
      color: "text-pink-400",
      bgColor: "bg-pink-900"
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-1000 ${backgroundClasses[backgroundMode]} relative overflow-hidden`}>
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full opacity-30 animate-ping"
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
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-lg transform rotate-1 hover:rotate-3 transition-transform cursor-pointer mb-4">
            {rotatingMessages[rotatingText]}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-yellow-300 font-bold transform -rotate-1 max-w-4xl mx-auto">
            Welcome to the technical documentation for the world's most frustrating game!
            <br className="hidden sm:block" />
            Prepare to have your mind blown (and your patience tested)! 🤯
          </p>
        </div>

        {/* Game Rules */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-black bg-opacity-60 rounded-xl border-4 border-green-400 p-6 sm:p-8 transform rotate-1">
            <h2 className="text-2xl sm:text-3xl font-black text-green-400 mb-6 text-center">
              The "Simple" Rules 📋
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-400 text-black rounded-full flex items-center justify-center font-black">1</div>
                  <p className="text-white">Keep your mouse cursor on the moving box for 10 seconds</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-400 text-black rounded-full flex items-center justify-center font-black">2</div>
                  <p className="text-white">Ignore all distractions (good luck with that!)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-400 text-black rounded-full flex items-center justify-center font-black">3</div>
                  <p className="text-white">Don't click on any pop-ups (they're all fake anyway)</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-400 text-black rounded-full flex items-center justify-center font-black">4</div>
                  <p className="text-white">Try not to throw your mouse across the room</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-400 text-black rounded-full flex items-center justify-center font-black">5</div>
                  <p className="text-white">Accept that the game is rigged against you</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-400 text-black rounded-full flex items-center justify-center font-black">6</div>
                  <p className="text-white">Laugh at your inevitable failure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-8 transform -rotate-1">
            The Technology Behind Your Suffering 🔬
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`${feature.bgColor} bg-opacity-60 p-6 rounded-xl border-2 border-white transform transition-all hover:scale-105 hover:rotate-3`}
                  style={{
                    transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <Icon className={`w-12 h-12 ${feature.color} mb-4 mx-auto`} />
                  <h3 className="text-xl font-bold text-white mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-black bg-opacity-60 rounded-xl border-4 border-blue-400 p-6 sm:p-8 transform -rotate-1">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-400 mb-6 text-center">
              Completely Made-Up Statistics 📊
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-red-400 mb-2">99.9%</div>
                <div className="text-white text-sm">Failure Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-yellow-400 mb-2">47</div>
                <div className="text-white text-sm">Mice Thrown</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-green-400 mb-2">∞</div>
                <div className="text-white text-sm">Frustration Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-2">0</div>
                <div className="text-white text-sm">Actual Winners</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-black bg-opacity-60 rounded-xl border-4 border-purple-400 p-6 sm:p-8 transform rotate-1">
            <h2 className="text-2xl sm:text-3xl font-black text-purple-400 mb-6 text-center">
              Frequently Asked Questions 🤷‍♂️
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Q: Is this game actually winnable?</h3>
                <p className="text-gray-300">A: Technically yes, but we've designed it to be as unlikely as finding a unicorn riding a bicycle while juggling flaming torches.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Q: Why does the timer sometimes reset?</h3>
                <p className="text-gray-300">A: Our timer has trust issues and occasionally forgets what it was counting. It's not you, it's definitely the timer.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Q: Are the pop-ups real?</h3>
                <p className="text-gray-300">A: About as real as your chances of winning this game. Please don't actually expect free pizza.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Q: Can I turn off the chaos?</h3>
                <p className="text-gray-300">A: That would defeat the entire purpose! The chaos is not a bug, it's the main feature!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <Link
            to="/game"
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:rotate-3 transition-all text-lg sm:text-xl shadow-lg border-4 border-white text-center"
          >
            Ready to Suffer? 😈
          </Link>

          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transform hover:scale-110 hover:-rotate-3 transition-all text-lg sm:text-xl border-4 border-yellow-400 text-center"
          >
            <Home className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;