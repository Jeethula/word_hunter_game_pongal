// All possible words for the game
export const allWords = [
  // Original words
  'PONGAL',
  'SUN',
  'RICE',
  'MILK',
  'COW',
  'POT',
  'FIRE',
  'KOLAM',
  'SWEET',
  'FARM',
  // Additional words
  'HARVEST',
  'SUGARCANE',
  'JAGGERY',
  'TEMPLE',
  'FESTIVAL',
  'TRADITION',
  'BLESSING',
  'FAMILY',
  'PRAYER',
  'GRATITUDE'
];

// Get random words from the pool
export function getRandomWords(count: number = 10): string[] {
  const shuffled = [...allWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}