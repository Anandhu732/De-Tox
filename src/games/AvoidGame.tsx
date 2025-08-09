import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Skull, Zap } from 'lucide-react';

interface AvoidGameProps {
  playerName: string;
  onGameEnd: (result: 'won' | 'lost', score: number) => void;
  onSarcasticMessage: (message: string) => void;
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  taunt?: string | null;
  golden?: boolean;
  fake?: boolean;
}

interface FloatingTaunt {
  id: string;
  text: string;
  left: number;
  top: number;
  lifetime: number;
}

const TAUNTS = [
  "Nice try! 😂",
  "Too slow! 🐌",
  "Almost hit me! 🤡",
  "That was close! 😅",
  "Move faster! 🏃‍♂️",
  "Catch me if you can! 👻",
  "You're getting warmer! 🔥",
  "Oops, missed again! �",
  "I'm over here! �",
  "Getting tired? �",
  "Try harder! �",
  "So close, yet so far! �",
  "Is that your best? 🤔",
  "Getting dizzy? �",
  "I'm right behind you! 👀",
  "Dance with me! �",
  "Can't touch this! ✋",
  "You're improving... not! 📉",
  "Giving up already? 🏳️",
  "I'm everywhere! �"
];

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const AvoidGame: React.FC<AvoidGameProps> = ({ playerName, onGameEnd, onSarcasticMessage }) => {
  // Core state
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [difficulty, setDifficulty] = useState(1);
  const [invertedControls, setInvertedControls] = useState(false);

  // UI effects
  const [bgHue, setBgHue] = useState(Math.floor(Math.random() * 360));
  const [shake, setShake] = useState(0);
  const [flash, setFlash] = useState(false);
  const [confetti, setConfetti] = useState<{id:string,left:number,top:number,rot:number,size:number,color:string}[]>([]);
  const [floatingTaunts, setFloatingTaunts] = useState<FloatingTaunt[]>([]);

  // Refs
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastNearRef = useRef<number>(0);
  const lastTauntRef = useRef<number>(0);

  // Memoized values
  const bgStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at 20% 20%, hsla(${(bgHue+20)%360},80%,65%,0.15), transparent 25%),
      radial-gradient(circle at 80% 80%, hsla(${(bgHue+40)%360},75%,60%,0.12), transparent 30%),
      linear-gradient(135deg,
        hsl(${bgHue} 65% 65%) 0%,
        hsl(${(bgHue+30)%360} 70% 55%) 25%,
        hsl(${(bgHue+60)%360} 65% 50%) 50%,
        hsl(${(bgHue+90)%360} 70% 55%) 75%,
        hsl(${(bgHue+120)%360} 65% 60%) 100%
      )`,
    boxShadow: `inset 0 0 60px hsla(${bgHue}, 50%, 30%, 0.3)`,
    filter: 'contrast(1.1) saturate(1.2)'
  }), [bgHue]);

  // Helper functions
  const playBeep = useCallback((freq=440, type: OscillatorType = 'sine', dur=0.08) => {
    try {
      if (!audioCtxRef.current && 'AudioContext' in window) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.value = 0.0001;
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now);
      o.stop(now + dur + 0.02);
    } catch {
      // Audio failed, ignore silently
    }
  }, []);

  const spawnObstacle = useCallback((opts?: Partial<Obstacle>) => {
    let x = 0, y = 0, vx = 0, vy = 0;
    const spawnNearPlayer = Math.random() < 0.12;

    if (spawnNearPlayer && gameAreaRef.current) {
      const angle = Math.random() * Math.PI * 2;
      const dist = rand(8, 18);
      x = Math.max(0, Math.min(100, playerPosition.x + Math.cos(angle) * dist));
      y = Math.max(0, Math.min(100, playerPosition.y + Math.sin(angle) * dist));
      vx = (Math.random() - 0.5) * (0.6 + difficulty * 0.12);
      vy = (Math.random() - 0.5) * (0.6 + difficulty * 0.12);
    } else {
      const side = Math.floor(Math.random() * 4);
      const baseSpeed = (0.6 + difficulty * 0.14);
      switch (side) {
        case 0: x = Math.random() * 100; y = -6; vx = (Math.random() - 0.5) * 1.6; vy = baseSpeed; break;
        case 1: x = 106; y = Math.random() * 100; vx = -baseSpeed; vy = (Math.random() - 0.5) * 1.6; break;
        case 2: x = Math.random() * 100; y = 106; vx = (Math.random() - 0.5) * 1.6; vy = -baseSpeed; break;
        default: x = -6; y = Math.random() * 100; vx = baseSpeed; vy = (Math.random() - 0.5) * 1.6; break;
      }
    }

    const isGolden = Math.random() < 0.03;
    const isFake = Math.random() < 0.06;
    const taunt = Math.random() < 0.12 ? randomFrom(TAUNTS) : null;

    const obstacle: Obstacle = {
      id: Math.random().toString(36).slice(2, 9),
      x, y, vx, vy,
      size: rand(2.8, 5.2),
      taunt,
      golden: isGolden,
      fake: isFake,
      ...opts
    };

    setObstacles(prev => {
      if (prev.length > 28 + difficulty * 2 + Math.floor(score / 5)) return prev;
      return [...prev, obstacle];
    });

    playBeep(isGolden ? 880 : 440, isGolden ? 'triangle' : 'sine', 0.06);
  }, [difficulty, playerPosition.x, playerPosition.y, playBeep, score]);

  const checkCollision = useCallback((p:{x:number,y:number}, o:Obstacle) => {
    const dx = p.x - o.x;
    const dy = p.y - o.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < (o.size / 2 + 2.8);
  }, []);

  const addFloatingTaunt = useCallback((text: string) => {
    // Avoid spawning too many taunts in same area
    const safeZones = [
      { left: rand(10, 25), top: rand(10, 25) },   // Top-left
      { left: rand(75, 90), top: rand(10, 25) },   // Top-right
      { left: rand(10, 25), top: rand(75, 90) },   // Bottom-left
      { left: rand(75, 90), top: rand(75, 90) },   // Bottom-right
      { left: rand(40, 60), top: rand(5, 15) },    // Top-center
      { left: rand(40, 60), top: rand(85, 95) }    // Bottom-center
    ];

    const position = safeZones[Math.floor(Math.random() * safeZones.length)];

    const newTaunt: FloatingTaunt = {
      id: Math.random().toString(36).slice(2, 9),
      text,
      left: position.left,
      top: position.top,
      lifetime: 3000 + Math.random() * 1000 // Reduced lifetime for better performance
    };

    setFloatingTaunts(prev => {
      // Keep max 3 taunts for better performance
      const filtered = prev.slice(-2);
      return [...filtered, newTaunt];
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    let lastTime = performance.now();
    const frameRate = 60;
    const interval = 1000 / frameRate;
    let delta = 0;

    const gameLoop = (currentTime: number) => {
      delta = currentTime - lastTime;

      if (delta >= interval) {
        lastTime = currentTime - (delta % interval);

        // Update obstacles
        setObstacles(prev => {
          const updated = prev.map(o => {
            const wobble = (Math.random() - 0.5) * 0.08 * (1 + difficulty * 0.1);
            const nx = o.x + o.vx + wobble;
            const ny = o.y + o.vy + wobble;
            let nvx = o.vx;
            let nvy = o.vy;

            if (nx <= 0 || nx >= 100) nvx *= -1;
            if (ny <= 0 || ny >= 100) nvy *= -1;

            if (o.fake && Math.random() < 0.025) return null;

            return { ...o, x: nx, y: ny, vx: nvx, vy: nvy };
          }).filter(Boolean) as Obstacle[];

          // Collision check
          const collision = updated.some(o => !o.fake && checkCollision(playerPosition, o));
          if (collision) {
            const collided = updated.find(o => !o.fake && checkCollision(playerPosition, o));
            if (collided?.golden) {
              setScore(s => s + 5);
              playBeep(1200, 'sawtooth', 0.12);
              onSarcasticMessage(`You greedy genius! +5 points ${playerName}! 🪙`);
              addFloatingTaunt(`+5!`);
              return updated.filter(o => o.id !== collided.id);
            } else {
              setGameActive(false);
              onGameEnd('lost', score);
              onSarcasticMessage(`💥 Game Over, ${playerName}. You lasted ${score}s. Pathetic! 😂`);
              playBeep(120, 'sine', 0.25);
              return updated;
            }
          }

          // Spawn new obstacles
          if (Math.random() < 0.018 * difficulty * (1 + score/20) && updated.length < 16 + difficulty + Math.floor(score/3)) {
            spawnObstacle();
          }

          return updated;
        });

        // Screen shake when near obstacles
        const near = obstacles.some(o => {
          const dx = playerPosition.x - o.x;
          const dy = playerPosition.y - o.y;
          return Math.sqrt(dx*dx + dy*dy) < 9;
        });

        if (near) {
          setShake(6);
          lastNearRef.current = performance.now();
          setBgHue(h => (h + Math.random() * 8) % 360);
          playBeep(540 + Math.random()*200, 'square', 0.05);

          const now = performance.now();
          if (now - lastTauntRef.current > 3000) { // Increased from 2000 to reduce spam
            const taunt = randomFrom(TAUNTS);
            onSarcasticMessage(taunt);
            addFloatingTaunt(taunt);
            lastTauntRef.current = now;
          }
        } else if (performance.now() - lastNearRef.current > 300) {
          setShake(0);
        }

        // Fake pop-ups
        if (Math.random() < 0.007) {
          const px = rand(10, 90);
          const py = rand(10, 90);
          spawnObstacle({ x: px, y: py, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6, fake: true });
        }
      }

      loopRef.current = requestAnimationFrame(gameLoop);
    };

    loopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameActive, difficulty, spawnObstacle, playerPosition, checkCollision, obstacles, onGameEnd, onSarcasticMessage, score, playerName, playBeep, addFloatingTaunt]);

  // Score & difficulty timer
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setScore(s => {
        const ns = s + 1;

        if (ns % 10 === 0) {
          setDifficulty(d => Math.min(10, d + 1));
          const levelUpMessage = `Level ${Math.floor(ns/10)+1}! Things are getting spicy 🌶️ Not that you'll last long! 😏`;
          onSarcasticMessage(levelUpMessage);
          addFloatingTaunt(levelUpMessage);
          playBeep(300, 'sawtooth', 0.18);

          if (Math.random() < 0.45) {
            setFlash(true);
            setTimeout(() => setFlash(false), 160);
          }

          if (Math.random() < 0.5) {
            setInvertedControls(true);
            const invertMessage = "Controls inverted! Good luck 😉 You'll need it!";
            onSarcasticMessage(invertMessage);
            addFloatingTaunt(invertMessage);
            setTimeout(() => setInvertedControls(false), 2500);
          }

          const confettiBurst = new Array(22).fill(0).map(() => ({
            id: Math.random().toString(),
            left: rand(10, 90),
            top: rand(40, 80),
            rot: rand(0, 360),
            size: rand(6, 14),
            color: `hsl(${Math.random()*360}, 80%, 60%)`
          }));
          setConfetti(confettiBurst);
          setTimeout(() => setConfetti([]), 1100);
        }

        if (Math.random() < 0.15) { // Reduced from 0.25 to reduce taunt spam
          const taunt = randomFrom(TAUNTS);
          onSarcasticMessage(taunt);
          addFloatingTaunt(taunt);
        }

        return ns;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, onSarcasticMessage, addFloatingTaunt, playBeep]);

  // Optimized floating taunt lifetime management
  useEffect(() => {
    if (floatingTaunts.length === 0) return;

    const interval = setInterval(() => {
      setFloatingTaunts(prev => {
        const updated = prev.map(t => ({ ...t, lifetime: t.lifetime - 150 })); // Faster cleanup
        return updated.filter(t => t.lifetime > 0);
      });
    }, 150); // Less frequent updates for better performance

    return () => clearInterval(interval);
  }, [floatingTaunts.length]);

  // Background hue cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBgHue(h => (h + rand(10,40)) % 360);
    }, rand(2000, 3600));

    return () => clearInterval(interval);
  }, []);

  // Player controls
  useEffect(() => {
    const area = gameAreaRef.current;
    if (!area) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!gameActive) return;
      const rect = area.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      if (invertedControls) {
        x = 100 - x;
        y = 100 - y;
      }

      setPlayerPosition({
        x: Math.max(4.8, Math.min(95.2, x)),
        y: Math.max(4.8, Math.min(95.2, y))
      });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    area.addEventListener('mousemove', onMouseMove);
    area.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      area.removeEventListener('mousemove', onMouseMove);
      area.removeEventListener('touchmove', onTouchMove);
    };
  }, [gameActive, invertedControls]);

  // Initial obstacles
  useEffect(() => {
    if (!gameActive) return;
    setObstacles([]);
    for (let i = 0; i < 6; i++) spawnObstacle();
  }, [gameActive, spawnObstacle]);

  // Game restart
  const restart = useCallback(() => {
    setObstacles([]);
    setScore(0);
    setDifficulty(1);
    setGameActive(true);
    setInvertedControls(false);
    setShake(0);
    setFlash(false);
    setConfetti([]);
    setFloatingTaunts([]);
    onSarcasticMessage(`Back in the ring, ${playerName}. Try not to embarrass yourself again. 😒`);
  }, [onSarcasticMessage, playerName]);

  // Render functions
  const renderSpeech = (o: Obstacle) => {
    if (!o.taunt) return null;

    // Dynamic bubble size based on text length
    const isLongText = o.taunt.length > 15;
    const bubbleClass = isLongText ? 'text-xs px-3 py-2' : 'text-sm px-2 py-1';

    return (
      <div
        className={`absolute ${bubbleClass} bg-gradient-to-br from-gray-900 to-black border-2 border-purple-400 text-white rounded-xl whitespace-nowrap transform -translate-x-1/2 -translate-y-full shadow-2xl backdrop-blur-sm z-70`}
        style={{
          left: `${o.x}%`,
          top: `${o.y - (o.size/2) - 1.5}%`,
          maxWidth: '200px',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
        }}
      >
        <div className="font-medium text-center">{o.taunt}</div>

        {/* Speech bubble tail */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-gray-900"
          style={{
            borderTopColor: '#111827',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
          }}
        />

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-xl opacity-30 blur-sm -z-10" />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Floating taunts - Optimized */}
      {floatingTaunts.map(taunt => {
        const progress = 1 - (taunt.lifetime / 4000); // Reduced from 6000 for faster animation
        const scale = 0.9 + Math.sin(progress * Math.PI * 2) * 0.1; // Smoother scaling
        const opacity = taunt.lifetime < 800 ? taunt.lifetime / 800 : Math.max(0.2, 1 - progress * 1.2);
        const yOffset = Math.sin(progress * Math.PI * 4) * 2; // Floating effect

        return (
          <div
            key={taunt.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: `${taunt.left}%`,
              top: `${taunt.top + yOffset}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              transition: 'opacity 0.3s ease-out'
            }}
          >
            {/* Simplified glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 rounded-xl blur-sm opacity-40"></div>

            {/* Streamlined taunt bubble */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-400 px-3 py-2 rounded-xl shadow-xl">
              <div className="text-white font-semibold text-sm text-center whitespace-nowrap">
                {taunt.text}
              </div>

              {/* Single accent sparkle */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full animate-ping"></div>
            </div>
          </div>
        );
      })}

      {/* Game container */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-4xl" style={{ transform: `translate(${shake ? rand(-shake, shake) : 0}px, ${shake ? rand(-shake, shake) : 0}px)` }}>
        {/* Stats - Enhanced */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-8 text-white">
          <div className="bg-gradient-to-br from-black to-gray-800 bg-opacity-80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl border border-purple-400">
            <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Score: {score}s
            </div>
            <div className="text-sm opacity-80 text-cyan-300">Level: {difficulty}</div>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-800 bg-opacity-80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl border border-blue-400">
            <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Player: {playerName}
            </div>
            <div className="text-sm opacity-80 text-pink-300">Obstacles: {obstacles.length}</div>
          </div>
        </div>

        {/* Game Area - Enhanced */}
        <div
          ref={gameAreaRef}
          className="relative w-full max-w-2xl aspect-square border-4 border-white rounded-xl overflow-hidden cursor-none shadow-2xl"
          style={{
            ...bgStyle,
            boxShadow: `
              inset 0 0 60px hsla(${bgHue}, 50%, 30%, 0.4),
              0 0 40px hsla(${bgHue}, 60%, 50%, 0.3),
              0 0 80px hsla(${(bgHue + 120) % 360}, 40%, 40%, 0.2)
            `,
          }}
        >
          {/* Animated border effect */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `conic-gradient(from ${bgHue}deg,
                hsla(${bgHue}, 80%, 60%, 0.3) 0deg,
                hsla(${(bgHue + 60) % 360}, 80%, 60%, 0.3) 60deg,
                hsla(${(bgHue + 120) % 360}, 80%, 60%, 0.3) 120deg,
                hsla(${(bgHue + 180) % 360}, 80%, 60%, 0.3) 180deg,
                hsla(${(bgHue + 240) % 360}, 80%, 60%, 0.3) 240deg,
                hsla(${(bgHue + 300) % 360}, 80%, 60%, 0.3) 300deg,
                hsla(${bgHue}, 80%, 60%, 0.3) 360deg)`,
              padding: '2px',
              mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
              maskComposite: 'xor',
              WebkitMask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
              WebkitMaskComposite: 'xor',
              zIndex: 5
            }}
          />

          {/* Particle effects in corners */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${(i % 4) * 25 + 5}%`,
                top: `${Math.floor(i / 4) * 90 + 5}%`,
                background: `hsla(${(bgHue + i * 45) % 360}, 80%, 70%, 0.7)`,
                animationDelay: `${i * 0.2}s`,
                zIndex: 10
              }}
            />
          ))}
          {/* Flash overlay */}
          {flash && <div className="absolute inset-0 bg-white" style={{ opacity: 0.95, zIndex: 70 }} />}

          {/* Confetti - Enhanced */}
          {confetti.map(c => (
            <div
              key={c.id}
              className="absolute animate-bounce"
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                width: c.size,
                height: c.size,
                transform: `rotate(${c.rot}deg)`,
                background: c.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                zIndex: 65,
                opacity: 0.9,
                boxShadow: `0 0 10px ${c.color}`,
                filter: 'brightness(1.2)'
              }}
            />
          ))}

          {/* Player - Enhanced */}
          <div
            className="absolute z-40 flex items-center justify-center"
            style={{
              left: `${playerPosition.x}%`,
              top: `${playerPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
            }}
          >
            {/* Player glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-sm opacity-60 animate-pulse"></div>

            {/* Player main body */}
            <div className="relative w-8 h-8 bg-gradient-to-br from-green-400 via-emerald-500 to-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white drop-shadow-md" />

              {/* Rotating shield effect */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-400 border-r-yellow-400 animate-spin"
                style={{ animationDuration: '2s' }}
              ></div>
            </div>
          </div>

          {/* Obstacles - Enhanced */}
          {obstacles.map(o => (
            <React.Fragment key={o.id}>
              {o.taunt && renderSpeech(o)}
              <div
                className={`absolute rounded-full shadow-2xl flex items-center justify-center z-30 transition-all duration-300 ${
                  o.golden ? 'ring-4 ring-yellow-300 animate-pulse' : ''
                } ${o.fake ? 'opacity-50 animate-bounce scale-90' : 'scale-100'}`}
                style={{
                  left: `${o.x}%`,
                  top: `${o.y}%`,
                  width: `${o.size}%`,
                  height: `${o.size}%`,
                  transform: `translate(-50%, -50%) ${o.fake ? 'scale(0.9)' : 'scale(1.0)'}`,
                  filter: o.fake ? 'blur(0.5px) brightness(0.8)' : 'none'
                }}
              >
                {/* Enhanced obstacle glow effect */}
                <div
                  className={`absolute inset-0 rounded-full blur-lg opacity-60 ${
                    o.golden ? 'bg-gradient-to-br from-yellow-200 to-orange-500' :
                    o.fake ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    'bg-gradient-to-br from-red-400 to-orange-700'
                  }`}
                ></div>

                {/* Outer ring for better visibility */}
                <div
                  className={`absolute inset-0 rounded-full border-4 ${
                    o.golden ? 'border-yellow-200' :
                    o.fake ? 'border-gray-400' :
                    'border-red-300'
                  } opacity-70`}
                ></div>

                {/* Main obstacle body with improved contrast */}
                <div
                  className={`relative w-full h-full rounded-full flex items-center justify-center border-3 ${
                    o.golden ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 border-yellow-700' :
                    o.fake ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 border-gray-800' :
                    'bg-gradient-to-br from-red-600 via-red-700 to-orange-800 border-red-900'
                  }`}
                  style={{
                    boxShadow: o.golden ?
                      '0 0 25px rgba(255, 215, 0, 0.8), inset 0 3px 6px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0,0,0,0.3)' :
                      o.fake ?
                      '0 0 10px rgba(107, 114, 128, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0,0,0,0.2)' :
                      '0 0 20px rgba(239, 68, 68, 0.8), inset 0 3px 6px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  {/* Enhanced icon with better contrast */}
                  <Skull className={`w-full h-full p-1 ${
                    o.golden ? 'text-yellow-900 drop-shadow-lg' :
                    o.fake ? 'text-gray-300 drop-shadow-sm' :
                    'text-white drop-shadow-xl'
                  }`} strokeWidth={o.golden ? 2.5 : 2} />

                  {/* Enhanced rotating danger indicator */}
                  {!o.golden && !o.fake && (
                    <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-red-200 border-r-red-200 animate-spin opacity-80"></div>
                  )}

                  {/* Enhanced golden sparkle effects */}
                  {o.golden && (
                    <>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-200 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-300 rounded-full animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    </>
                  )}

                  {/* Fake obstacle indicator */}
                  {o.fake && (
                    <div className="absolute inset-0 rounded-full bg-gray-300 opacity-20 animate-pulse"></div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Danger zaps */}
          {difficulty > 2 && Array.from({ length: Math.max(1, difficulty - 2) }).map((_, i) => (
            <Zap
              key={i}
              className="absolute w-5 h-5 text-yellow-200 opacity-40 animate-ping"
              style={{
                left: `${(i*37 + (i*17)) % 82 + 8}%`,
                top: `${(i*23 + (i*13)) % 82 + 8}%`,
                zIndex: 20
              }}
            />
          ))}
        </div>

        {/* Instructions - Enhanced */}
        <div className="text-center text-white bg-gradient-to-br from-black to-gray-800 bg-opacity-70 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl border border-gray-600 max-w-lg">
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            🎯 Move your mouse to avoid the obstacles — or don't. Chaos is the point! 😉
          </p>
          <p className="text-sm opacity-90 text-cyan-300">
            ⚡ Obstacles increase every second! The game will mock you relentlessly. Good luck, you'll need it! 😈
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs">
            <span className="text-yellow-400">🟡 Golden = Bonus Points</span>
            <span className="text-red-400">🔴 Red = Instant Death</span>
            <span className="text-gray-400">⚪ Faded = Fake</span>
          </div>
        </div>

        {/* Restart/Exit buttons */}
        {!gameActive && (
          <div className="flex items-center space-x-4">
            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
              onClick={restart}
            >
              Restart
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white transition-colors"
              onClick={() => onGameEnd('lost', score)}
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvoidGame;