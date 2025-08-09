export interface ScoreEntry {
  id: string;
  playerName: string;
  gameType: string;
  score: number;
  timestamp: number;
  status: string;
}

const STORAGE_KEY = 'detox-leaderboard';
const MAX_ENTRIES = 10;

// Get all scores from localStorage
export const getAllScores = (): ScoreEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Add a new score entry
export const addScore = (playerName: string, gameType: string, score: number): void => {
  const newEntry: ScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerName: playerName.trim() || 'Anonymous Player',
    gameType,
    score,
    timestamp: Date.now(),
    status: generateSarcasticStatus(score, gameType)
  };

  const scores = getAllScores();
  scores.push(newEntry);

  // Sort by score (higher is better for most games)
  scores.sort((a, b) => b.score - a.score);

  // Keep only top entries
  const topScores = scores.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
  } catch (error) {
    console.warn('Could not save score to localStorage:', error);
  }
};

// Generate sarcastic status messages based on score
const generateSarcasticStatus = (score: number, gameType: string): string => {
  const messages = {
    high: [
      "Definitely Not Cheating 😏",
      "Suspiciously Good 🤔",
      "Pure Luck (Obviously)",
      "Probably Used Both Hands",
      "Must Have Had Coffee ☕"
    ],
    medium: [
      "Not Terrible",
      "Could Be Worse",
      "Gave Up After This",
      "Needs More Practice",
      "Almost Acceptable"
    ],
    low: [
      "Rage Quit Immediately",
      "Still Doesn't Understand",
      "Mouse Slipped",
      "Haven't Even Tried Yet! 😂",
      "Spectacular Failure",
      "Better Luck Next Time"
    ]
  };

  let category: 'high' | 'medium' | 'low';

  if (gameType === 'hover') {
    category = score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low';
  } else if (gameType === 'click') {
    category = score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low';
  } else if (gameType === 'avoid') {
    category = score >= 20 ? 'high' : score >= 10 ? 'medium' : 'low';
  } else {
    category = score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low';
  }

  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
};

// Clear all scores (for testing)
export const clearScores = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear scores:', error);
  }
};

// Get top scores for a specific game type
export const getTopScoresForGame = (gameType: string, limit: number = 5): ScoreEntry[] => {
  const allScores = getAllScores();
  return allScores
    .filter(score => score.gameType === gameType)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Format score for display
export const formatScore = (score: number, gameType: string): string => {
  switch (gameType) {
    case 'hover':
      return `${(score / 10).toFixed(1)}s`;
    case 'click':
      return `${score} clicks`;
    case 'avoid':
      return `${score} points`;
    case 'memory':
      return `Level ${score}`;
    default:
      return `${score}`;
  }
};

// Get game type display name
export const getGameDisplayName = (gameType: string): string => {
  const names: Record<string, string> = {
    hover: 'Hover Hell',
    click: 'Click Chaos',
    avoid: 'Dodge Disaster',
    memory: 'Memory Mayhem'
  };
  return names[gameType] || gameType;
};
