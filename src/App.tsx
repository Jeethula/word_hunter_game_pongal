import React, { useState, useEffect } from 'react';
import { Sun, Award, Heart, RotateCw, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { allWords, getRandomWords } from './words';

interface Cell {
  row: number;
  col: number;
  letter: string;
}

interface BestTime {
  time: number;
  date: string;
}

function generateGrid(size: number, words: string[]): string[][] {
  const grid: string[][] = Array(size).fill(null).map(() => 
    Array(size).fill('')
  );
  
  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      const direction = Math.floor(Math.random() * 3);
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      if (canPlaceWord(grid, word, row, col, direction, size)) {
        placeWord(grid, word, row, col, direction);
        placed = true;
      }
      attempts++;
    }
  });
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
  
  return grid;
}

function canPlaceWord(grid: string[][], word: string, row: number, col: number, direction: number, size: number): boolean {
  const wordLength = word.length;
  
  if (direction === 0) {
    if (col + wordLength > size) return false;
    for (let i = 0; i < wordLength; i++) {
      if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) return false;
    }
  } else if (direction === 1) {
    if (row + wordLength > size) return false;
    for (let i = 0; i < wordLength; i++) {
      if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) return false;
    }
  } else {
    if (row + wordLength > size || col + wordLength > size) return false;
    for (let i = 0; i < wordLength; i++) {
      if (grid[row + i][col + i] !== '' && grid[row + i][col + i] !== word[i]) return false;
    }
  }
  
  return true;
}

function placeWord(grid: string[][], word: string, row: number, col: number, direction: number) {
  const wordLength = word.length;
  const wordArray = word.toUpperCase().split('');
  
  if (direction === 0) {
    for (let i = 0; i < wordLength; i++) {
      grid[row][col + i] = wordArray[i];
    }
  } else if (direction === 1) {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col] = wordArray[i];
    }
  } else {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col + i] = wordArray[i];
    }
  }
}

function App() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>(getRandomWords(10));
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [bestTime, setBestTime] = useState<BestTime | null>(null);

  useEffect(() => {
    const savedBestTime = localStorage.getItem('wordSearchBestTime');
    if (savedBestTime) {
      setBestTime(JSON.parse(savedBestTime));
    }
  }, []);

  useEffect(() => {
    setGrid(generateGrid(15, words));
    setIsActive(true);
    setTimer(0);
  }, [words]);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive) {
      interval = window.setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (row: number, col: number, letter: string) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col, letter }]);
  };

  const handleMouseEnter = (row: number, col: number, letter: string) => {
    if (isSelecting) {
      setSelectedCells(prev => [...prev, { row, col, letter }]);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    const selectedWord = selectedCells.map(cell => cell.letter).join('');
    const normalizedWord = selectedWord.toLowerCase();
    
    const foundWord = words.find(word => 
      word.toLowerCase() === normalizedWord || 
      word.toLowerCase() === normalizedWord.split('').reverse().join('')
    );

    if (foundWord && !foundWords.includes(foundWord)) {
      const newFoundWords = [...foundWords, foundWord];
      setFoundWords(newFoundWords);
      
      selectedCells.forEach(cell => {
        setSelectedLetters(prev => new Set([...prev, `${cell.row}-${cell.col}`]));
      });

      if (newFoundWords.length === words.length) {
        setIsWinner(true);
        setIsActive(false);
        triggerConfetti();
        
        if (!bestTime || timer < bestTime.time) {
          const newBestTime = { time: timer, date: new Date().toISOString() };
          setBestTime(newBestTime);
          localStorage.setItem('wordSearchBestTime', JSON.stringify(newBestTime));
        }
      }
    }
    setSelectedCells([]);
  };

  const resetGame = () => {
    setWords(getRandomWords(10));
    setFoundWords([]);
    setSelectedCells([]);
    setSelectedLetters(new Set());
    setIsWinner(false);
    setIsActive(true);
    setTimer(0);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF6B6B', '#4CAF50']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FF6B6B', '#4CAF50']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    return selectedLetters.has(`${row}-${col}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100">
      <header className="relative text-center py-8 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 shadow-lg overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/016/939/590/non_2x/illustration-of-beautiful-pongal-pot-and-sugarcane-on-banana-leaf-for-happy-pongal-holiday-harvest-festival-in-south-india-sugarcane-frame-vector.jpg?auto=format&fit=crop&w=1000&h=1000&q=60')] opacity-10 bg-repeat"></div> */}
        <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/016/939/590/non_2x/illustration-of-beautiful-pongal-pot-and-sugarcane-on-banana-leaf-for-happy-pongal-holiday-harvest-festival-in-south-india-sugarcane-frame-vector.jpg')] opacity-20 bg-cover bg-center"></div>
        <div className="relative">
          <img
            src="https://png.pngtree.com/png-vector/20240106/ourmid/pngtree-pongal-festival-celebration-sugarcane-png-image_11412136.png"
            alt="Sugarcane Left"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-28 w-12 object-cover rounded-full hidden md:block transform -rotate-12"
          />
          <img
            src="https://png.pngtree.com/png-vector/20240106/ourmid/pngtree-pongal-festival-celebration-sugarcane-png-image_11412136.png"
            alt="Sugarcane Right"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-28 w-12 object-cover rounded-full hidden md:block transform rotate-12"
          />
          <h1 className="font-pongal text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            Happy Thai Pongal
            <Sun className="inline-block ml-4 text-yellow-300 animate-spin-slow" />
          </h1>
          <p className="text-white text-xl font-medium tracking-wide">Find all the festive words!</p>
        </div>
      </header>

      {/* Stats bar - Different layouts for mobile and desktop */}
      <div className="bg-orange-100 shadow-inner">
        <div className="container mx-auto px-4">
          {/* Desktop Stats (md and up) */}
          <div className="hidden md:flex justify-center items-center gap-8 py-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-orange-800">
                Found: {foundWords.length}/{words.length}
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-800">
              <Timer className="w-5 h-5" />
              <span className="text-xl font-medium">{formatTime(timer)}</span>
            </div>
            {bestTime && (
              <div className="text-orange-800 font-medium">
                Best: {formatTime(bestTime.time)}
              </div>
            )}
            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RotateCw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Stats (sm only) */}
        <div className="md:hidden flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-orange-800">
              Found: {foundWords.length}/{words.length}
            </div>
            <div className="flex items-center gap-2 text-orange-800">
              <Timer className="w-5 h-5" />
              <span className="text-lg font-medium">{formatTime(timer)}</span>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full"
          >
            <RotateCw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Mobile Words List (sm only) */}
        <div className="md:hidden mb-6 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Words to Find:</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {words.map((word) => (
                <div
                  key={word}
                  className={`flex-shrink-0 p-2 rounded ${
                    foundWords.includes(word)
                      ? 'bg-green-500 text-white line-through'
                      : 'bg-gray-100'
                  }`}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Game Grid */}
            <div className="md:w-2/3 bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-15 gap-1">
              {grid.map((row, rowIndex) => (
              row.map((letter, colIndex) => (
                <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-8 h-8 flex items-center justify-center font-bold text-lg cursor-pointer select-none
                  ${isCellSelected(rowIndex, colIndex) ? 'bg-yellow-300' : 
                  isCellFound(rowIndex, colIndex) ? 'bg-green-300' : 
                  'bg-gray-100 hover:bg-gray-200'}`}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex, letter)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex, letter)}
                onMouseUp={handleMouseUp}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMouseDown(rowIndex, colIndex, letter);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  const cellCoords = element?.getAttribute('data-coords');
                  if (cellCoords) {
                  const [touchRow, touchCol] = cellCoords.split('-').map(Number);
                  handleMouseEnter(touchRow, touchCol, grid[touchRow][touchCol]);
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleMouseUp();
                }}
                data-coords={`${rowIndex}-${colIndex}`}
                >
                {letter}
                </div>
              ))
              ))}
            </div>
            </div>

          {/* Desktop Words List */}
          <div className="hidden md:block md:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Words to Find:</h2>
              <div className="grid grid-cols-1 gap-2">
                {words.map((word) => (
                  <div
                    key={word}
                    className={`p-2 rounded ${
                      foundWords.includes(word)
                        ? 'bg-green-500 text-white line-through'
                        : 'bg-gray-100'
                    }`}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl text-center animate-bounce">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Congratulations!
            </h2>
            <p className="text-xl text-gray-600">
              You found all the Pongal words!
            </p>
          </div>
        </div>
      )}

      <footer className="text-center py-4 text-gray-600">
        Built with{' '}
        <Heart className="inline-block w-5 h-5 text-red-500 mx-1 animate-pulse" />{' '}
        by{' '}
        <a
          href="https://jeethu.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Jeethu
        </a>
      </footer>
    </div>
  );
}

export default App;