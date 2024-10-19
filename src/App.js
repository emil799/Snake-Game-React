import React, { useState, useEffect } from "react";  // Добавяне на useState и useEffect
import './App.css';

// Размер на игровата мрежа
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 8, y: 8 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const MAX_SCORE = 250; // Максимален резултат

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [apple, setApple] = useState(generateApple());
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const savedBestScore = localStorage.getItem("bestScore");
    return savedBestScore ? parseInt(savedBestScore) : 0;
  });
  const [lastDirection, setLastDirection] = useState(DIRECTIONS.ArrowRight); // Запомняне на последната посока

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (DIRECTIONS[event.key]) {
        // Забранете обратно движение
        if (
          (event.key === "ArrowLeft" && lastDirection === DIRECTIONS.ArrowRight) ||
          (event.key === "ArrowRight" && lastDirection === DIRECTIONS.ArrowLeft) ||
          (event.key === "ArrowUp" && lastDirection === DIRECTIONS.ArrowDown) ||
          (event.key === "ArrowDown" && lastDirection === DIRECTIONS.ArrowUp)
        ) {
          return; // Не сменяйте посоката, ако е обратно
        }
        setDirection(DIRECTIONS[event.key]);
        setLastDirection(DIRECTIONS[event.key]); // Запомнете новата посока
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [lastDirection]);

  useEffect(() => {
    if (isGameOver) return;

    const moveInterval = setInterval(() => {
      moveSnake();
    }, 200);

    return () => clearInterval(moveInterval);
  }, [snake, direction, isGameOver]);

  function moveSnake() {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Проверка за преминаване през стената
    if (head.x < 0) {
      head.x = GRID_SIZE - 1; // Преминаване от ляво на дясно
    } else if (head.x >= GRID_SIZE) {
      head.x = 0; // Преминаване от дясно на ляво
    }

    if (head.y < 0) {
      head.y = GRID_SIZE - 1; // Преминаване от горе на долу
    } else if (head.y >= GRID_SIZE) {
      head.y = 0; // Преминаване от долу на горе
    }

    newSnake.unshift(head);

    // Проверка за сблъсък със себе си, само ако змията е дълга поне 3
    if (newSnake.length > 2) {
      for (let segment of newSnake.slice(1)) {
        if (segment.x === head.x && segment.y === head.y) {
          setBestScore(prevBestScore => {
            const newBestScore = Math.max(prevBestScore, currentScore);
            localStorage.setItem("bestScore", newBestScore);
            return newBestScore;
          });
          setCurrentScore(0);
          setIsGameOver(true);
          return;
        }
      }
    }

    // Проверка дали змията яде ябълка
    if (head.x === apple.x && head.y === apple.y) {
      const newScore = currentScore + 10;
      if (newScore <= MAX_SCORE) {
        setCurrentScore(newScore);
      }
      if (newScore === MAX_SCORE) {
        setBestScore(newScore);
        localStorage.setItem("bestScore", newScore);
        setIsGameOver(true);
      }
      setApple(generateApple());
    } else {
      newSnake.pop();
    }
  
    setSnake(newSnake);
  }

  function generateApple() {
    let newApple;
    do {
      newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
    return newApple;
  }

  const handleButtonClick = (dir) => {
    // Забранете обратно движение, ако новата посока е обратно на последната
    if (
      (dir === "ArrowLeft" && lastDirection === DIRECTIONS.ArrowRight) ||
      (dir === "ArrowRight" && lastDirection === DIRECTIONS.ArrowLeft) ||
      (dir === "ArrowUp" && lastDirection === DIRECTIONS.ArrowDown) ||
      (dir === "ArrowDown" && lastDirection === DIRECTIONS.ArrowUp)
    ) {
      return; // Не сменяйте посоката, ако е обратно
    }

    setDirection(DIRECTIONS[dir]);
    setLastDirection(DIRECTIONS[dir]); // Запомнете новата посока
  };

  return (
    <div className="game">
      {isGameOver ? (
        <div className="game-over">
          {currentScore === MAX_SCORE ? "You WIN!" : "Game Over! Press F5 to restart."}
        </div>
      ) : (
        <div>
          <div className="scoreboard">
            <div>Current score: {currentScore}</div>
            <div>Best score: {bestScore}</div>
          </div>
          <div className="grid">
            {Array.from({ length: GRID_SIZE }, (_, row) =>
              Array.from({ length: GRID_SIZE }, (_, col) => {
                const isSnake = snake.some(segment => segment.x === col && segment.y === row);
                const isApple = apple.x === col && apple.y === row;
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`cell ${isSnake ? "snake" : ""} ${isApple ? "apple" : ""}`}
                  ></div>
                );
              })
            )}
          </div>
          <div className="controls">
            <button onClick={() => handleButtonClick("ArrowUp")}>↑</button>
            <div className="vertical-controls">
              <button onClick={() => handleButtonClick("ArrowLeft")}>←</button>
              <button onClick={() => handleButtonClick("ArrowRight")}>→</button>
            </div>
            <button onClick={() => handleButtonClick("ArrowDown")}>↓</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;