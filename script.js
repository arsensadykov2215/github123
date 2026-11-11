const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');

const gridSize = 20;
const tileSize = canvas.width / gridSize;
const initialSpeed = 140;
const minSpeed = 70;

let snake;
let direction;
let nextDirection;
let food;
let score;
let lastTimestamp;
let accumulatedTime;
let frameId;
let isRunning;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  lastTimestamp = 0;
  accumulatedTime = 0;
  scoreEl.textContent = String(score);
  spawnFood();
  draw();
}

function getCurrentSpeed() {
  return Math.max(minSpeed, initialSpeed - score * 2.5);
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function startGame() {
  resetGame();
  isRunning = true;
  overlay.classList.remove('visible');
  startBtn.textContent = 'Restart Game';
  if (frameId) {
    cancelAnimationFrame(frameId);
  }
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!isRunning) {
    return;
  }

  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  accumulatedTime += delta;

  while (accumulatedTime >= getCurrentSpeed()) {
    update();
    accumulatedTime -= getCurrentSpeed();
  }

  draw();
  frameId = requestAnimationFrame(gameLoop);
}

function update() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const willEat = head.x === food.x && head.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 10;
    scoreEl.textContent = String(score);
    spawnFood();
  } else {
    snake.pop();
  }
}

function endGame() {
  isRunning = false;
  if (frameId) {
    cancelAnimationFrame(frameId);
  }
  overlay.classList.add('visible');
  overlayTitle.textContent = 'Game Over';
  overlayMessage.textContent = `Final score: ${score}. Press Start to try again.`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0a1324';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.015)';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  snake.forEach((segment, index) => {
    const x = segment.x * tileSize;
    const y = segment.y * tileSize;

    ctx.fillStyle = index === 0 ? '#36d399' : '#7ae582';
    ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
  });

  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize / 2.7,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function handleKey(event) {
  const key = event.key.toLowerCase();

  if (key === ' ' && !isRunning) {
    event.preventDefault();
    startGame();
    return;
  }

  let nextDirectionCandidate;

  if (key === 'arrowup' || key === 'w') {
    nextDirectionCandidate = { x: 0, y: -1 };
  } else if (key === 'arrowdown' || key === 's') {
    nextDirectionCandidate = { x: 0, y: 1 };
  } else if (key === 'arrowleft' || key === 'a') {
    nextDirectionCandidate = { x: -1, y: 0 };
  } else if (key === 'arrowright' || key === 'd') {
    nextDirectionCandidate = { x: 1, y: 0 };
  } else {
    return;
  }

  event.preventDefault();

  const isOpposite =
    nextDirectionCandidate.x === -direction.x &&
    nextDirectionCandidate.y === -direction.y;

  if (!isOpposite) {
    nextDirection = nextDirectionCandidate;
  }
}

document.addEventListener('keydown', handleKey);
startBtn.addEventListener('click', startGame);

resetGame();
