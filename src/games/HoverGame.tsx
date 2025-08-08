import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [bgHue, setBgHue] = useState(Math.floor(Math.random() * 360));
  const [targetSize, setTargetSize] = useState(1);
  const [hoverEffects, setHoverEffects] = useState<{id: string, intensity: number}[]>([]);
  const [streak, setStreak] = useState(0);
  const [encouragementMode, setEncouragementMode] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Enhanced sarcastic messages with more personality
  const sarcasticMessages = useMemo(() => [
    `${playerName}, your mouse skills are... questionable 🤔`,
    `Come on ${playerName}, focus! Oh wait, that's impossible here 😏`,
    `${playerName}, the box is laughing at you! 📦😂`,
    `Nice try ${playerName}, but the box has trust issues 🙄`,
    `${playerName}, maybe try using both hands? 😂`,
    `The box thinks you're too slow, ${playerName}! ⚡`,
    `${playerName}, I believe in you! (Just kidding) 😜`,
    `Stay calm ${playerName}... LOOK BEHIND YOU! 👻`,
    `${playerName}, are you hovering or just visiting? 🏠`,
    `The box is having second thoughts about ${playerName}! 🤨`,
    `${playerName}, channel your inner zen master! 🧘‍♂️`,
    `Focus ${playerName}! The box believes in you... sort of 😅`
  ], [playerName]);

  // Audio feedback for engagement
  const playSound = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
    try {
      if (!audioCtxRef.current && 'AudioContext' in window) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = type;
      gainNode.gain.value = 0.08;

      const now = ctx.currentTime;
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // Audio failed, continue without sound
    }
  }, []);

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
    let newPosition = { x: 50, y: 50 };

    if (moveType < 0.15) { // Reduced teleport frequency for better gameplay
      newPosition = getRandomPosition();
      setShakeIntensity(4);
      setBgHue(prev => (prev + 45) % 360);
      playSound(700, 'square', 0.2);
      onSarcasticMessage(`Teleport! The box escaped from ${playerName}! 🌟`);
    } else if (moveType < 0.4) { // Predictable jumps
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + (Math.random() - 0.5) * 30)),
        y: Math.min(85, Math.max(15, targetPosition.y + (Math.random() - 0.5) * 30))
      };
      setShakeIntensity(3);
      playSound(500, 'triangle', 0.15);
    } else if (moveType < 0.8) { // Smooth drift - ADHD friendly
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + (Math.random() - 0.5) * 15)),
        y: Math.min(85, Math.max(15, targetPosition.y + (Math.random() - 0.5) * 15))
      };
      setShakeIntensity(1);
    } else { // Gentle spiral movement
      const time = Date.now() / 1000;
      const centerX = 50;
      const centerY = 50;
      const radius = 20 + Math.sin(time) * 10;
      newPosition = {
        x: Math.min(85, Math.max(15, centerX + Math.cos(time * 0.5) * radius)),
        y: Math.min(85, Math.max(15, centerY + Math.sin(time * 0.5) * radius))
      };
      setShakeIntensity(0.5);
    }

    setTargetPosition(newPosition);
    setTargetSize(0.9 + Math.random() * 0.3); // Dynamic size for engagement

    // Encourage mode after player shows commitment
    if (timeHovered > 3 && !encouragementMode) {
      setEncouragementMode(true);
      onSarcasticMessage(`🎉 ${playerName} is actually trying! Keep it up! 💪`);
    }

    setTimeout(() => setShakeIntensity(0), 250);
  }, [getRandomPosition, gameActive, targetPosition.x, targetPosition.y, playerName, onSarcasticMessage, playSound, timeHovered, encouragementMode]);

  // Enhanced timer effect with better feedback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isHovering && gameActive) {
      // Positive feedback when hovering
      playSound(300 + timeHovered * 20, 'sine', 0.05);
      setBgHue(prev => (prev + 1) % 360);

      interval = setInterval(() => {
        setTimeHovered(prev => {
          const newTime = prev + 0.1;

          // Streak system for motivation
          setStreak(prevStreak => {
            const newStreak = Math.floor(newTime);
            if (newStreak > prevStreak && newStreak % 2 === 0) {
              playSound(400 + newStreak * 50, 'triangle', 0.2);
              if (!encouragementMode) {
                onSarcasticMessage(`${newStreak}s! ${playerName} is actually doing it! 😮`);
              }
            }
            return newStreak;
          });

          // Occasional sabotage but much fairer
          if (Math.random() < 0.005 && newTime > 2) { // Very rare, only after 2 seconds
            onSarcasticMessage(`Tiny hiccup! But ${playerName} is unstoppable! 💪`);
            playSound(150, 'sawtooth', 0.3);
            return Math.max(0, prev - 0.5); // Much smaller penalty
          }

          // Victory condition
          if (newTime >= 10) {
            setGameActive(false);
            playSound(800, 'square', 0.8);
            onGameEnd('won', Math.floor(newTime * 10) + streak * 5);
            return 10;
          }

          // Milestone feedback
          if (Math.floor(newTime) !== Math.floor(prev) && Math.floor(newTime) % 3 === 0) {
            const messages = [
              `${Math.floor(newTime)}s! ${playerName} is in the zone! 🔥`,
              `Halfway there ${playerName}! Don't give up now! ⚡`,
              `${playerName} is defying all expectations! 🌟`
            ];
            onSarcasticMessage(messages[Math.floor(Math.random() * messages.length)]);
          }

          return newTime;
        });
      }, 100);
    } else if (!isHovering && gameActive && timeHovered > 0) {
      // Gentle decrease when not hovering - ADHD friendly
      interval = setInterval(() => {
        setTimeHovered(prev => {
          const newTime = Math.max(0, prev - 0.02); // Much slower decay
          if (prev > 0 && newTime === 0) {
            setStreak(0);
            setEncouragementMode(false);
            playSound(200, 'sine', 0.5);
          }
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isHovering, gameActive, playerName, onGameEnd, onSarcasticMessage, playSound, timeHovered, streak, encouragementMode]);

  // Target movement effect - adaptive difficulty
  useEffect(() => {
    if (gameActive) {
      // Slower movement when player is doing well (encouragement mode)
      const baseInterval = encouragementMode ? 4000 : 2500;
      const randomVariation = Math.random() * 1500;

      moveIntervalRef.current = setInterval(() => {
        moveTarget();

        // Less frequent sarcastic messages when in encouragement mode
        const messageChance = encouragementMode ? 0.05 : 0.1;
        if (Math.random() < messageChance) {
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          onSarcasticMessage(message);
        }
      }, baseInterval + randomVariation);
    }

    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [moveTarget, gameActive, onSarcasticMessage, sarcasticMessages, encouragementMode]);

  // Background hue animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBgHue(prev => (prev + 0.5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 relative">
      {/* Game Stats - Enhanced */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <div
          className="bg-gradient-to-br from-black to-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border transform hover:scale-105 transition-all duration-300"
          style={{
            borderColor: `hsl(${bgHue}, 70%, 50%)`,
            boxShadow: `0 0 20px hsla(${bgHue}, 70%, 50%, 0.4)`
          }}
        >
          <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Timer: {timeHovered.toFixed(1)}s
          </div>
          <div className="text-sm text-cyan-300">Target: 10.0s</div>
          {streak > 0 && (
            <div className="text-xs text-green-400 animate-pulse">
              🎯 {streak}s streak!
            </div>
          )}
        </div>

        <div
          className="bg-gradient-to-br from-black to-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border transform hover:scale-105 transition-all duration-300"
          style={{
            borderColor: `hsl(${(bgHue + 120) % 360}, 70%, 50%)`,
            boxShadow: `0 0 20px hsla(${(bgHue + 120) % 360}, 70%, 50%, 0.4)`
          }}
        >
          <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Status: {isHovering ? '🎯 Locked On!' : '❌ Find Target'}
          </div>
          <div className="text-sm text-pink-300">Player: {playerName}</div>
          {encouragementMode && (
            <div className="text-xs text-yellow-400 animate-bounce">
              💪 Encouragement Mode!
            </div>
          )}
        </div>
      </div>

      {/* Game Area - Completely redesigned */}
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-lg aspect-square border-4 border-white rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, hsla(${bgHue}, 60%, 50%, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, hsla(${(bgHue + 120) % 360}, 60%, 50%, 0.3) 0%, transparent 50%),
            linear-gradient(135deg,
              hsla(${bgHue}, 40%, 15%, 0.9) 0%,
              hsla(${(bgHue + 60) % 360}, 40%, 20%, 0.8) 50%,
              hsla(${(bgHue + 120) % 360}, 40%, 15%, 0.9) 100%
            )
          `,
          transform: `rotate(${shakeIntensity * 1}deg) scale(${1 + shakeIntensity * 0.005})`,
          boxShadow: `
            inset 0 0 60px hsla(${bgHue}, 50%, 30%, 0.5),
            0 0 40px hsla(${bgHue}, 60%, 50%, 0.3)
          `,
        }}
      >
        {/* Hover effects */}
        {hoverEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none z-20 animate-ping"
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${20 + effect.intensity * 10}px`,
              height: `${20 + effect.intensity * 10}px`,
              background: `hsla(${bgHue + 180}, 80%, 60%, 0.6)`,
              borderRadius: '50%'
            }}
          />
        ))}

        {/* Progress visualization */}
        <div
          className="absolute top-2 left-2 right-2 h-2 bg-black bg-opacity-50 rounded-full overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${(timeHovered / 10) * 100}%`,
              background: `linear-gradient(90deg,
                hsl(${bgHue}, 80%, 60%),
                hsl(${(bgHue + 60) % 360}, 80%, 70%)
              )`
            }}
          />
        </div>

        {/* Background particles for ADHD stimulation */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${(i * 23 + 10) % 80 + 10}%`,
              top: `${(i * 37 + 15) % 80 + 10}%`,
              background: `hsl(${(bgHue + i * 24) % 360}, 70%, 60%)`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '3s'
            }}
          />
        ))}

        {/* Moving Target - Enhanced */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${shakeIntensity * 30}deg) scale(${targetSize})`,
          }}
          onMouseEnter={() => {
            setIsHovering(true);
            const effectId = Math.random().toString(36).substr(2, 9);
            setHoverEffects(prev => [...prev.slice(-3), { id: effectId, intensity: Math.random() }]);
            setTimeout(() => {
              setHoverEffects(prev => prev.filter(e => e.id !== effectId));
            }, 500);
          }}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Target glow effect */}
          <div
            className="absolute inset-0 rounded-xl blur-lg opacity-60 transition-all duration-200"
            style={{
              width: '70px',
              height: '70px',
              background: isHovering
                ? `linear-gradient(135deg,
                    hsl(120, 80%, 60%),
                    hsl(150, 80%, 70%)
                  )`
                : `linear-gradient(135deg,
                    hsl(${bgHue + 60}, 80%, 60%),
                    hsl(${(bgHue + 120) % 360}, 80%, 70%)
                  )`
            }}
          />

          {/* Main target */}
          <div
            className={`relative w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center transform transition-all duration-200 border-2 border-white ${
              isHovering ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              background: isHovering
                ? `linear-gradient(135deg,
                    hsl(120, 80%, 50%) 0%,
                    hsl(150, 80%, 60%) 100%
                  )`
                : `linear-gradient(135deg,
                    hsl(${(bgHue + 60) % 360}, 80%, 50%) 0%,
                    hsl(${(bgHue + 120) % 360}, 80%, 60%) 100%
                  )`,
              boxShadow: isHovering
                ? `0 0 25px hsla(120, 80%, 60%, 0.8)`
                : `0 0 15px hsla(${bgHue + 60}, 70%, 60%, 0.6)`
            }}
          >
            <Target className="w-7 h-7 text-white drop-shadow-lg" />

            {/* Rotating ring */}
            <div
              className={`absolute inset-0 rounded-xl border-2 border-transparent ${
                isHovering ? 'border-t-white border-r-white' : 'border-t-yellow-400 border-r-yellow-400'
              } animate-spin opacity-80`}
              style={{
                animationDuration: isHovering ? '0.3s' : '2s',
                animationDirection: isHovering ? 'reverse' : 'normal'
              }}
            />

            {/* Pulse effect when hovering */}
            {isHovering && (
              <div className="absolute inset-0 rounded-xl border-4 border-green-400 animate-ping opacity-60" />
            )}
          </div>
        </div>

        {/* Success effects for milestones */}
        {streak >= 5 && Array.from({ length: Math.min(streak - 4, 8) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full opacity-70 animate-bounce pointer-events-none z-10"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              background: `hsl(${120 + i * 30}, 80%, 60%)`,
              animationDelay: `${i * 0.3}s`,
              filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))'
            }}
          />
        ))}

        {/* Urgency indicator for final stretch */}
        {timeHovered >= 7 && timeHovered < 10 && (
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse bg-yellow-400 bg-opacity-5 pointer-events-none z-5" />
        )}
      </div>

      {/* Instructions - Enhanced */}
      <div className="text-center text-white bg-gradient-to-br from-black to-gray-800 bg-opacity-80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl border border-cyan-400 max-w-lg">
        <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          🎯 Keep your mouse on the target for 10 seconds, {playerName}!
        </p>
        <p className="text-sm text-cyan-300 mb-2">
          ⚡ The target will move, but stay focused! Encouragement mode helps!
        </p>
        <div className="flex justify-center space-x-4 text-xs">
          <span className="text-green-400">🟢 Hovering = Progress</span>
          <span className="text-yellow-400">🟡 Streak = Bonus</span>
          <span className="text-blue-400">🔵 Focus = Victory!</span>
        </div>
      </div>
    </div>
  );
};

export default HoverGame;

// (removed unused newFunction)
