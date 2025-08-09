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
  const [mockingPopups, setMockingPopups] = useState<{id: string, message: string, x: number, y: number}[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

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

  // Mocking popup messages to irritate the player
  const mockingMessages = useMemo(() => [
    `😂 Almost got it ${playerName}!`,
    `🤪 Too slow! Try again!`,
    `😈 The box is laughing at you!`,
    `🙄 Are you even trying?`,
    `😏 Close but no cigar!`,
    `🤔 Maybe use a trackball?`,
    `😅 That's embarrassing...`,
    `🎯 Aim better ${playerName}!`,
    `😆 My grandma moves faster!`,
    `🤨 Suspicious lack of skill...`,
    `😎 The box is too cool for you!`,
    `🤗 Aww, you're trying so hard!`,
    `🙃 Upside down might work better!`,
    `😵‍💫 Dizzy from all that missing?`,
    `🎪 What a circus performance!`
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

    // Calculate distance between mouse and target
    const distanceToMouse = Math.sqrt(
      Math.pow(mousePosition.x - targetPosition.x, 2) +
      Math.pow(mousePosition.y - targetPosition.y, 2)
    );

    let newPosition = { x: 50, y: 50 };

    // AGGRESSIVE EVASION - Target runs away when cursor gets close
    if (distanceToMouse < 30) { // Increased detection range
      // Calculate escape vector - target moves away from cursor
      const angle = Math.atan2(
        targetPosition.y - mousePosition.y,
        targetPosition.x - mousePosition.x
      );
      
      // Much larger escape distance - make it REALLY hard
      const escapeDistance = 35 + Math.random() * 25; // Increased from 15 to 25
      
      newPosition = {
        x: Math.min(90, Math.max(10, targetPosition.x + Math.cos(angle) * escapeDistance)),
        y: Math.min(90, Math.max(10, targetPosition.y + Math.sin(angle) * escapeDistance))
      };
      
      // If target would go out of bounds, try opposite direction or teleport to center opposite side
      if (newPosition.x <= 10 || newPosition.x >= 90 || newPosition.y <= 10 || newPosition.y >= 90) {
        // Teleport to opposite side of the play area
        newPosition = {
          x: mousePosition.x < 50 ? 75 + Math.random() * 15 : 10 + Math.random() * 15,
          y: mousePosition.y < 50 ? 75 + Math.random() * 15 : 10 + Math.random() * 15
        };
      }
      
      setShakeIntensity(8); // Increased shake
      setBgHue(prev => (prev + 120) % 360); // More dramatic color change
      playSound(1000, 'square', 0.3);
      onSarcasticMessage(`🏃‍♂️💨 NOPE! The box says BYE ${playerName}!`);

      // Create multiple mocking popups for extra frustration
      for (let i = 0; i < 2; i++) {
        const mockingId = Math.random().toString(36).substr(2, 9);
        const mockingMessage = mockingMessages[Math.floor(Math.random() * mockingMessages.length)];
        setMockingPopups(prev => [...prev.slice(-1), {
          id: mockingId,
          message: mockingMessage,
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15
        }]);
        setTimeout(() => {
          setMockingPopups(prev => prev.filter(p => p.id !== mockingId));
        }, 1500 + i * 500);
      }

    } else if (distanceToMouse < 50) { // Medium range - nervous movement
      // Target gets nervous and moves unpredictably
      const nervousDistance = 15 + Math.random() * 20;
      const nervousAngle = Math.random() * Math.PI * 2;
      
      newPosition = {
        x: Math.min(85, Math.max(15, targetPosition.x + Math.cos(nervousAngle) * nervousDistance)),
        y: Math.min(85, Math.max(15, targetPosition.y + Math.sin(nervousAngle) * nervousDistance))
      };
      
      setShakeIntensity(4);
      playSound(600, 'triangle', 0.15);
      
      if (Math.random() < 0.3) {
        onSarcasticMessage(`😰 The box is getting nervous around ${playerName}!`);
      }
      
    } else {
      // When cursor is far, target moves more predictably but still challenging
      const moveType = Math.random();
      
      if (moveType < 0.2) { // Random teleport to make it harder
        newPosition = getRandomPosition();
        setShakeIntensity(5);
        setBgHue(prev => (prev + 60) % 360);
        playSound(800, 'square', 0.25);
        onSarcasticMessage(`✨ Surprise teleport! Can't catch ${playerName}! 🌟`);
        
      } else if (moveType < 0.5) { // Drift toward center but away from cursor
        const centerX = 50;
        const centerY = 50;
        
        // Move toward center but bias away from cursor
        const toCenterX = (centerX - targetPosition.x) * 0.3;
        const toCenterY = (centerY - targetPosition.y) * 0.3;
        
        const awayCursorX = (targetPosition.x - mousePosition.x) * 0.1;
        const awayCursorY = (targetPosition.y - mousePosition.y) * 0.1;
        
        newPosition = {
          x: Math.min(80, Math.max(20, targetPosition.x + toCenterX + awayCursorX + (Math.random() - 0.5) * 10)),
          y: Math.min(80, Math.max(20, targetPosition.y + toCenterY + awayCursorY + (Math.random() - 0.5) * 10))
        };
        
        setShakeIntensity(2);
        
      } else { // Orbital movement around center, avoiding cursor
        const time = Date.now() / 1000;
        const centerX = 50;
        const centerY = 50;
        const radius = 25 + Math.sin(time * 0.7) * 15;
        
        // Add cursor avoidance to orbital movement
        let orbitAngle = time * 0.4;
        const cursorAngle = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
        
        // Avoid cursor by adjusting orbit angle
        const angleDiff = ((orbitAngle - cursorAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
        if (Math.abs(angleDiff) < Math.PI / 3) {
          orbitAngle += Math.sign(angleDiff) * Math.PI / 2; // Jump away by 90 degrees
        }
        
        newPosition = {
          x: Math.min(85, Math.max(15, centerX + Math.cos(orbitAngle) * radius)),
          y: Math.min(85, Math.max(15, centerY + Math.sin(orbitAngle) * radius))
        };
        
        setShakeIntensity(1);
      }
    }

    setTargetPosition(newPosition);
    setTargetSize(0.8 + Math.random() * 0.4); // More size variation

    // Make encouragement mode harder to achieve and less helpful
    if (timeHovered > 5 && !encouragementMode) { // Increased from 3 to 5 seconds
      setEncouragementMode(true);
      onSarcasticMessage(`🎉 ${playerName} lasted 5 seconds! The box is impressed... but still running! 💪`);
    }

    setTimeout(() => setShakeIntensity(0), 300);
  }, [getRandomPosition, gameActive, targetPosition.x, targetPosition.y, playerName, onSarcasticMessage, playSound, timeHovered, encouragementMode, mousePosition.x, mousePosition.y, mockingMessages, setMockingPopups]);

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

          // More frequent and aggressive sabotage
          if (Math.random() < 0.012 && newTime > 1.5) { // More frequent, starts earlier
            const sabotageAmount = Math.random() * 1.5 + 0.5; // Larger penalty (0.5-2 seconds)
            const finalTime = Math.max(0, prev - sabotageAmount);
            onSarcasticMessage(`💥 SABOTAGE! The box played a dirty trick on ${playerName}! -${sabotageAmount.toFixed(1)}s �`);
            playSound(100, 'sawtooth', 0.5);
            
            // Create angry popup
            const sabotageId = Math.random().toString(36).substr(2, 9);
            setMockingPopups(prevPopups => [...prevPopups.slice(-2), {
              id: sabotageId,
              message: `💥 GOTCHA! -${sabotageAmount.toFixed(1)}s`,
              x: Math.random() * 50 + 25,
              y: Math.random() * 50 + 25
            }]);
            setTimeout(() => {
              setMockingPopups(prevPopups => prevPopups.filter(p => p.id !== sabotageId));
            }, 2500);
            
            return finalTime;
          }

          // Extra challenge after 7 seconds - target becomes EXTRA evasive
          if (newTime > 7) {
            // Trigger emergency evasion - make the target run away immediately
            if (Math.random() < 0.15) { // 15% chance every 0.1 second after 7s
              onSarcasticMessage(`🚨 FINAL STRETCH! The box is in PANIC MODE! 🏃‍♂️💨`);
              playSound(1200, 'square', 0.4);
              // Force target to move immediately
              setTimeout(() => moveTarget(), 10);
            }
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
      // Much faster decay when not hovering - make it REALLY challenging
      interval = setInterval(() => {
        setTimeHovered(prev => {
          const decayRate = prev > 5 ? 0.08 : 0.05; // Faster decay after 5 seconds
          const newTime = Math.max(0, prev - decayRate);
          
          if (prev > 0 && newTime === 0) {
            setStreak(0);
            setEncouragementMode(false);
            playSound(150, 'sine', 0.7);
            onSarcasticMessage(`💔 ${playerName} lost it! Back to square one! 😈`);
          } else if (prev > 2 && newTime <= 2) {
            onSarcasticMessage(`⚠️ ${playerName} is losing progress! Quick, catch it! 😱`);
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isHovering, gameActive, playerName, onGameEnd, onSarcasticMessage, playSound, timeHovered, streak, encouragementMode, moveTarget, setMockingPopups]);

  // Target movement effect - much more aggressive and responsive
  useEffect(() => {
    if (gameActive) {
      // Calculate dynamic interval based on cursor proximity and hover time
      const distanceToMouse = Math.sqrt(
        Math.pow(mousePosition.x - targetPosition.x, 2) +
        Math.pow(mousePosition.y - targetPosition.y, 2)
      );
      
      // The closer the cursor, the faster the target moves (more frequent updates)
      let baseInterval = 400; // Much faster base interval
      
      if (distanceToMouse < 30) {
        baseInterval = 150; // Very fast when cursor is close
      } else if (distanceToMouse < 50) {
        baseInterval = 250; // Fast when cursor is nearby
      } else if (encouragementMode) {
        baseInterval = 300; // Still fast in encouragement mode
      }
      
      // Add difficulty scaling based on hover time - gets harder as player progresses
      const difficultyMultiplier = Math.max(0.3, 1 - (timeHovered * 0.08)); // Gets up to 70% faster
      baseInterval *= difficultyMultiplier;
      
      const randomVariation = Math.random() * 200; // Less variation, more consistent challenge

      moveIntervalRef.current = setInterval(() => {
        moveTarget();

        // Much more frequent sarcastic messages when target is being chased
        const messageChance = distanceToMouse < 30 ? 0.6 : (encouragementMode ? 0.25 : 0.35);
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
  }, [moveTarget, gameActive, onSarcasticMessage, sarcasticMessages, encouragementMode, mousePosition.x, mousePosition.y, targetPosition.x, targetPosition.y, timeHovered]);

  // Constant mocking popup generation to irritate player - MUCH MORE AGGRESSIVE
  useEffect(() => {
    if (gameActive) {
      const popupInterval = setInterval(() => {
        // More frequent popups when player is doing well (more than 3 seconds)
        const popupChance = timeHovered > 3 ? 0.8 : 0.6; // 80% chance vs 60%
        
        if (Math.random() < popupChance) {
          const mockingId = Math.random().toString(36).substr(2, 9);
          const mockingMessage = mockingMessages[Math.floor(Math.random() * mockingMessages.length)];
          setMockingPopups(prev => [...prev.slice(-2), { // Keep max 3 popups
            id: mockingId,
            message: mockingMessage,
            x: Math.random() * 80 + 10, // Spread across more area
            y: Math.random() * 80 + 10
          }]);
          
          // Shorter duration for more chaos
          const duration = timeHovered > 5 ? 1000 : 1200; // Faster when player is doing well
          setTimeout(() => {
            setMockingPopups(prev => prev.filter(p => p.id !== mockingId));
          }, duration + Math.random() * 500);
        }
      }, 400 + Math.random() * 600); // Much more frequent: every 0.4-1 second

      return () => clearInterval(popupInterval);
    }
  }, [gameActive, mockingMessages, timeHovered]);

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
        onMouseMove={(e) => {
          if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePosition({ x, y });
          }
        }}
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

        {/* Mocking Popups to irritate the player */}
        {mockingPopups.map(popup => (
          <div
            key={popup.id}
            className="absolute z-40 pointer-events-none animate-bounce"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-yellow-400 font-bold text-sm whitespace-nowrap">
              {popup.message}
            </div>
          </div>
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
