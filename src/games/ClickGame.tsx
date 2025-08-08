import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [bgHue, setBgHue] = useState(Math.floor(Math.random() * 360));
  const [clickEffects, setClickEffects] = useState<{id: string, x: number, y: number, color: string}[]>([]);
  const [combo, setCombo] = useState(0);
  const [targetSize, setTargetSize] = useState(1);
  const [speedBoost, setSpeedBoost] = useState(false);
  const targetClicks = 10;

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Enhanced sarcastic messages with more variety
  const sarcasticMessages = useMemo(() => [
    `${playerName}, your clicking speed is... concerning 🐌`,
    `Faster ${playerName}! The box is getting bored! 😴`,
    `${playerName}, are you clicking or just admiring the box? 🤔`,
    `The box is running away from ${playerName}'s slow clicks! 🏃‍♂️`,
    `${playerName}, maybe try clicking with your eyes closed? 😂`,
    `Time's ticking ${playerName}! Click like your dignity depends on it! ⏰`,
    `${playerName}, the box thinks you're too gentle! 💪`,
    `Come on ${playerName}, show that box who's boss! 👑`,
    `${playerName}, are you clicking or just tapping? 🤨`,
    `The box is laughing at your technique! 📦😂`,
    `${playerName}, channel your inner speed demon! 🔥`,
    `That's it ${playerName}! Give me that chaotic energy! ⚡`
  ], [playerName]);

  // Audio feedback for ADHD engagement
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
      gainNode.gain.value = 0.1;

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

    if (moveType < 0.25) { // Teleport - reduced frequency
      newPosition = getRandomPosition();
      setShakeIntensity(4);
      setBgHue(prev => (prev + 60) % 360);
      playSound(800, 'square', 0.15);
    } else if (moveType < 0.5) { // Jump away - ADHD-friendly larger movements
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + (Math.random() - 0.5) * 40)),
        y: Math.min(85, Math.max(15, targetPosition.y + (Math.random() - 0.5) * 40))
      };
      setShakeIntensity(3);
      playSound(600, 'triangle', 0.1);
    } else if (moveType < 0.75) { // Drift - smooth movement
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + (Math.random() - 0.5) * 20)),
        y: Math.min(85, Math.max(15, targetPosition.y + (Math.random() - 0.5) * 20))
      };
      setShakeIntensity(1);
    } else { // Chaos mode - rapid mini-teleports
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 15;
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + Math.cos(angle) * distance)),
        y: Math.min(85, Math.max(15, targetPosition.y + Math.sin(angle) * distance))
      };
      setShakeIntensity(2);
      setBgHue(prev => (prev + 30) % 360);
    }

    setTargetPosition(newPosition);

    // Dynamic target size for engagement
    setTargetSize(0.8 + Math.random() * 0.4);

    setTimeout(() => setShakeIntensity(0), 300);
  }, [getRandomPosition, gameActive, targetPosition.x, targetPosition.y, playSound]);

  const handleTargetClick = useCallback(() => {
    if (!gameActive) return;

    // Create click effect
    const effectId = Math.random().toString(36).substr(2, 9);
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const newEffect = {
      id: effectId,
      x: targetPosition.x,
      y: targetPosition.y,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setClickEffects(prev => [...prev.slice(-4), newEffect]); // Keep last 5 effects
    setTimeout(() => {
      setClickEffects(prev => prev.filter(e => e.id !== effectId));
    }, 800);

    setClickCount(prev => {
      const newCount = prev + 1;

      // Combo system for ADHD engagement
      setCombo(prevCombo => {
        const newCombo = prevCombo + 1;
        if (newCombo % 3 === 0) {
          playSound(1200 + newCombo * 50, 'sawtooth', 0.2);
          onSarcasticMessage(`🔥 ${newCombo}x COMBO! ${playerName} is on fire! 🔥`);
          setSpeedBoost(true);
          setTimeout(() => setSpeedBoost(false), 2000);
        } else {
          playSound(400 + newCount * 50, 'sine', 0.1);
        }
        return newCombo;
      });

      if (newCount >= targetClicks) {
        setGameActive(false);
        playSound(800, 'square', 0.5);
        onGameEnd('won', newCount * 10 + timeLeft + combo * 5);
        onSarcasticMessage(`🎉 Impossible! ${playerName} actually clicked fast enough! Final combo: ${combo}! 🤯`);
      } else {
        // Move target after successful click
        moveTarget();

        // Reduced message frequency but more varied
        if (Math.random() < 0.25) {
          const message = sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)];
          onSarcasticMessage(message);
        }
      }

      return newCount;
    });
  }, [gameActive, targetPosition.x, targetPosition.y, moveTarget, onSarcasticMessage, playSound, playerName, onGameEnd, timeLeft, combo, targetClicks, sarcasticMessages]);

  // Background animation for ADHD engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setBgHue(prev => (prev + 2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Reset combo on timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (combo > 0) {
        setCombo(0);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [combo]);

  // Game timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameActive(false);
            if (clickCount >= targetClicks) {
              onGameEnd('won', clickCount * 10 + combo * 5);
            } else {
              onGameEnd('lost', clickCount);
              onSarcasticMessage(`⏰ Time's up ${playerName}! Your clicking skills need work! Better luck next time! 😅`);
            }
            return 0;
          }

          // Urgency effects in last 5 seconds
          if (prev <= 5) {
            playSound(200 + prev * 100, 'triangle', 0.1);
            setBgHue(Math.random() * 360);
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameActive, timeLeft, clickCount, targetClicks, playerName, onGameEnd, onSarcasticMessage, playSound, combo]);

  // Target movement effect - dynamic intervals for ADHD engagement
  useEffect(() => {
    if (gameActive) {
      const baseInterval = speedBoost ? 800 : 1500;
      const randomVariation = Math.random() * 1000;

      moveIntervalRef.current = setInterval(() => {
        moveTarget();

        // Random sarcastic messages with better timing
        if (Math.random() < 0.15) {
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
  }, [moveTarget, gameActive, onSarcasticMessage, sarcasticMessages, speedBoost]);

  return (
    <div className="flex flex-col items-center space-y-6 relative">
      {/* Game Stats - Enhanced */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
        <div
          className="bg-gradient-to-br from-black to-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border transform hover:scale-105 transition-all duration-300"
          style={{
            borderColor: `hsl(${bgHue}, 60%, 50%)`,
            boxShadow: `0 0 20px hsla(${bgHue}, 60%, 50%, 0.3)`
          }}
        >
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Clicks: {clickCount}/{targetClicks}
          </div>
          <div className="text-sm text-cyan-300">Time: {timeLeft}s</div>
          {combo > 0 && (
            <div className="text-xs text-yellow-400 animate-pulse">
              🔥 {combo}x COMBO!
            </div>
          )}
        </div>

        <div
          className="bg-gradient-to-br from-black to-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border transform hover:scale-105 transition-all duration-300"
          style={{
            borderColor: `hsl(${(bgHue + 120) % 360}, 60%, 50%)`,
            boxShadow: `0 0 20px hsla(${(bgHue + 120) % 360}, 60%, 50%, 0.3)`
          }}
        >
          <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Player: {playerName}
          </div>
          <div className="text-sm text-pink-300">
            Speed: {timeLeft < 15 ? (clickCount / (15 - timeLeft) || 0).toFixed(1) : '0'} clicks/sec
          </div>
          {speedBoost && (
            <div className="text-xs text-red-400 animate-bounce">
              ⚡ SPEED BOOST!
            </div>
          )}
        </div>
      </div>

      {/* Game Area - Completely redesigned */}
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-lg aspect-square border-4 border-white rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsla(${bgHue}, 70%, 60%, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, hsla(${(bgHue + 120) % 360}, 70%, 60%, 0.3) 0%, transparent 50%),
            linear-gradient(135deg,
              hsla(${bgHue}, 50%, 20%, 0.8) 0%,
              hsla(${(bgHue + 60) % 360}, 50%, 15%, 0.9) 50%,
              hsla(${(bgHue + 120) % 360}, 50%, 20%, 0.8) 100%
            )
          `,
          transform: `rotate(${shakeIntensity * 1.5}deg) scale(${1 + shakeIntensity * 0.01})`,
          boxShadow: `
            inset 0 0 50px hsla(${bgHue}, 50%, 30%, 0.4),
            0 0 30px hsla(${bgHue}, 60%, 50%, 0.3)
          `,
        }}
      >
        {/* Click effects */}
        {clickEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none z-20"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-16 h-16 rounded-full animate-ping opacity-60"
              style={{ backgroundColor: effect.color }}
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg animate-bounce"
            >
              +1
            </div>
          </div>
        ))}

        {/* Background particles for ADHD stimulation */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${(i * 37 + 25) % 85 + 5}%`,
              top: `${(i * 23 + 15) % 85 + 5}%`,
              background: `hsl(${(bgHue + i * 30) % 360}, 70%, 60%)`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}

        {/* Clickable Target - Enhanced */}
        <div
          className="absolute z-30 cursor-pointer group"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${shakeIntensity * 45}deg) scale(${targetSize})`,
          }}
          onClick={handleTargetClick}
        >
          {/* Target glow effect */}
          <div
            className="absolute inset-0 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-all duration-200"
            style={{
              width: '60px',
              height: '60px',
              background: `linear-gradient(135deg,
                hsl(${bgHue + 180}, 80%, 60%),
                hsl(${(bgHue + 240) % 360}, 80%, 70%)
              )`
            }}
          />

          {/* Main target */}
          <div
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-2xl flex items-center justify-center transform transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white"
            style={{
              background: `linear-gradient(135deg,
                hsl(${(bgHue + 180) % 360}, 80%, 60%) 0%,
                hsl(${(bgHue + 240) % 360}, 80%, 70%) 100%
              )`,
              boxShadow: `0 0 15px hsla(${bgHue + 180}, 70%, 60%, 0.6)`
            }}
          >
            <MousePointer className="w-6 h-6 text-white drop-shadow-lg" />

            {/* Rotating ring */}
            <div
              className="absolute inset-0 rounded-xl border-2 border-transparent border-t-yellow-400 border-r-yellow-400 animate-spin opacity-60"
              style={{ animationDuration: speedBoost ? '0.5s' : '2s' }}
            />
          </div>
        </div>

        {/* Lightning effects for high combos */}
        {combo > 5 && Array.from({ length: Math.min(combo - 4, 6) }).map((_, i) => (
          <Zap
            key={i}
            className="absolute w-6 h-6 text-yellow-400 opacity-80 animate-pulse pointer-events-none z-10"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.2}s`,
              filter: 'drop-shadow(0 0 5px rgba(255, 255, 0, 0.8))'
            }}
          />
        ))}

        {/* Urgency warning for last 5 seconds */}
        {timeLeft <= 5 && timeLeft > 0 && (
          <div className="absolute inset-0 border-4 border-red-500 rounded-2xl animate-pulse bg-red-500 bg-opacity-10 pointer-events-none z-40" />
        )}
      </div>

      {/* Instructions - Enhanced */}
      <div className="text-center text-white bg-gradient-to-br from-black to-gray-800 bg-opacity-80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl border border-purple-400 max-w-lg">
        <p className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          🎯 Click the moving target {targetClicks} times, {playerName}!
        </p>
        <p className="text-sm text-cyan-300 mb-2">
          ⚡ Build combos for bonus points! Speed boost activates at 3x combo!
        </p>
        <div className="flex justify-center space-x-4 text-xs">
          <span className="text-yellow-400">🟡 Combo = More Points</span>
          <span className="text-red-400">🔴 Speed = Higher Score</span>
          <span className="text-purple-400">🟣 Chaos = Fun!</span>
        </div>
      </div>
    </div>
  );
};

export default ClickGame;