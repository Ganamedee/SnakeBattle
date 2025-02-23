// Canvas and game settings
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = 20;
let COLS = 30;
let ROWS = 30;
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;
let tickInterval = 100;

// UI elements
const startBtn = document.getElementById("startBtn");
const uiContainer = document.getElementById("ui");
const scoreRedEl = document.getElementById("scoreRed");
const scoreBlueEl = document.getElementById("scoreBlue");
const fruitCountInput = document.getElementById("fruitCountInput");
const colsInput = document.getElementById("colsInput");
const rowsInput = document.getElementById("rowsInput");
const speedInput = document.getElementById("speedInput");
const updateSettingsBtn = document.getElementById("updateSettings");
const restartBtn = document.getElementById("restartBtn");

// Game state variables
let gameStarted = false;
let maxFruits = parseInt(fruitCountInput.value, 10);
let occupied = new Set();
let snakeRed;
let snakeBlue;
let fruits = [];
let gameInterval;

// Utility functions
const posToKey = (pos) => `${pos.x},${pos.y}`;
const isEqual = (a, b) => a.x === b.x && a.y === b.y;

function getNeighbours(pos) {
  const neighbours = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  directions.forEach((dir) => {
    const newX = pos.x + dir.x;
    const newY = pos.y + dir.y;
    if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS) {
      neighbours.push({ x: newX, y: newY });
    }
  });
  return neighbours;
}

function findPath(start, target, obstacles) {
  const queue = [];
  const visited = new Set();
  const prev = {};
  queue.push(start);
  visited.add(posToKey(start));

  while (queue.length) {
    const current = queue.shift();
    if (isEqual(current, target)) {
      let path = [];
      let temp = posToKey(target);
      while (temp in prev) {
        path.push(prev[temp].pos);
        temp = prev[temp].from;
      }
      path.reverse();
      return path;
    }
    getNeighbours(current).forEach((neighbour) => {
      const key = posToKey(neighbour);
      if (!visited.has(key) && !obstacles.has(key)) {
        visited.add(key);
        queue.push(neighbour);
        prev[key] = { from: posToKey(current), pos: neighbour };
      }
    });
  }
  return null;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeFruit() {
  let empty = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        empty.push({ x, y });
      }
    }
  }
  if (empty.length === 0) return null;
  return empty[randInt(0, empty.length - 1)];
}

class Snake {
  constructor(color, startPos) {
    this.color = color;
    this.body = [startPos];
  }

  get head() {
    return this.body[this.body.length - 1];
  }

  getDirection() {
    if (this.body.length < 2) return { x: 0, y: 0 };
    const neck = this.body[this.body.length - 2];
    return { x: this.head.x - neck.x, y: this.head.y - neck.y };
  }

  move(fruitPositions, obstacles) {
    obstacles.delete(posToKey(this.head));
    let pfObstacles = new Set(obstacles);
    pfObstacles.delete(posToKey(this.body[0]));

    let closestPath = null;
    for (let fruit of fruitPositions) {
      let path = findPath(this.head, fruit, pfObstacles);
      if (path && (!closestPath || path.length < closestPath.length)) {
        closestPath = path;
      }
    }
    let next;
    if (closestPath && closestPath.length > 0) {
      next = closestPath[0];
    } else {
      let neighbours = getNeighbours(this.head);
      let safe = neighbours.filter((n) => !obstacles.has(posToKey(n)));
      if (safe.length > 0) {
        next = safe[randInt(0, safe.length - 1)];
      } else {
        next = neighbours[randInt(0, neighbours.length - 1)];
      }
    }
    this.body.push(next);

    let ateFruit = fruitPositions.some((fruit) => isEqual(next, fruit));
    if (!ateFruit) {
      this.body.shift();
    }
    return ateFruit;
  }

  draw() {
    for (let i = 0; i < this.body.length; i++) {
      let cell = this.body[i];
      ctx.fillStyle = this.color;
      ctx.fillRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cell.x * CELL_SIZE,
        cell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
    this.drawEyes();
  }

  drawEyes() {
    let head = this.head;
    let direction = this.getDirection();
    let offsets = [
      { x: CELL_SIZE * 0.3, y: CELL_SIZE * 0.3 },
      { x: CELL_SIZE * 0.7, y: CELL_SIZE * 0.3 },
    ];
    if (direction.x === 1) {
      offsets = [
        { x: CELL_SIZE * 0.6, y: CELL_SIZE * 0.3 },
        { x: CELL_SIZE * 0.6, y: CELL_SIZE * 0.7 },
      ];
    } else if (direction.x === -1) {
      offsets = [
        { x: CELL_SIZE * 0.4, y: CELL_SIZE * 0.3 },
        { x: CELL_SIZE * 0.4, y: CELL_SIZE * 0.7 },
      ];
    } else if (direction.y === 1) {
      offsets = [
        { x: CELL_SIZE * 0.3, y: CELL_SIZE * 0.6 },
        { x: CELL_SIZE * 0.7, y: CELL_SIZE * 0.6 },
      ];
    } else if (direction.y === -1) {
      offsets = [
        { x: CELL_SIZE * 0.3, y: CELL_SIZE * 0.4 },
        { x: CELL_SIZE * 0.7, y: CELL_SIZE * 0.4 },
      ];
    }
    ctx.fillStyle = "#fff";
    offsets.forEach((offset) => {
      ctx.beginPath();
      ctx.arc(
        head.x * CELL_SIZE + offset.x,
        head.y * CELL_SIZE + offset.y,
        CELL_SIZE * 0.1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }
}

function updateOccupied() {
  occupied.clear();
  snakeRed.body.forEach((cell) => occupied.add(posToKey(cell)));
  snakeBlue.body.forEach((cell) => occupied.add(posToKey(cell)));
}

function updateScoreboard() {
  scoreRedEl.textContent = `Red: ${snakeRed.body.length}`;
  scoreBlueEl.textContent = `Blue: ${snakeBlue.body.length}`;
}

function gameTick() {
  updateOccupied();
  let obstacles = new Set(occupied);

  [snakeRed, snakeBlue].forEach((snake) => {
    obstacles.delete(posToKey(snake.head));
    let ateFruit = snake.move(fruits, obstacles);
    if (ateFruit) {
      fruits = fruits.filter((fruit) => !isEqual(fruit, snake.head));
    }
    obstacles.add(posToKey(snake.head));
  });

  while (fruits.length < maxFruits) {
    let newFruit = placeFruit();
    if (newFruit) fruits.push(newFruit);
    else break;
  }

  drawGame();
  updateScoreboard();

  if (fruits.length === 0) {
    clearInterval(gameInterval);
    gameStarted = false;
    startBtn.textContent = "Start Game";
    startBtn.disabled = false;
    alert("Game Over! Board is full.");
  }
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fruits.forEach((fruit) => {
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(
      fruit.x * CELL_SIZE,
      fruit.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      fruit.x * CELL_SIZE,
      fruit.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  });

  snakeRed.draw();
  snakeBlue.draw();
}

function initGame() {
  COLS = Math.min(parseInt(colsInput.value, 10) || 30, 53);
  ROWS = parseInt(rowsInput.value, 10) || 30;
  maxFruits = parseInt(fruitCountInput.value, 10) || 1;
  tickInterval = parseInt(speedInput.value, 10) || 100;

  canvas.width = COLS * CELL_SIZE;
  canvas.height = ROWS * CELL_SIZE;

  occupied.clear();
  fruits = [];

  snakeRed = new Snake("#ff6b6b", { x: 2, y: 2 });
  snakeBlue = new Snake("#00bfff", { x: COLS - 3, y: ROWS - 3 });

  while (fruits.length < maxFruits) {
    let newFruit = placeFruit();
    if (newFruit) fruits.push(newFruit);
    else break;
  }

  if (gameInterval) {
    clearInterval(gameInterval);
  }

  updateScoreboard();
  drawGame();
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    startBtn.textContent = "Game Running";
    startBtn.disabled = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameTick, tickInterval);
  }
}

// Event Listeners
startBtn.addEventListener("click", startGame);

updateSettingsBtn.addEventListener("click", () => {
  gameStarted = false;
  startBtn.textContent = "Start Game";
  startBtn.disabled = false;
  initGame();
});

restartBtn.addEventListener("click", () => {
  gameStarted = false;
  startBtn.textContent = "Start Game";
  startBtn.disabled = false;
  initGame();
});

// Initialize game board
initGame();
