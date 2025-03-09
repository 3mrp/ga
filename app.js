const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('slither-game');
const gameContainer = document.getElementById('game-container');
const scoreboard = document.getElementById('scoreboard');

const clientId = `player-${Math.floor(Math.random() * 10000)}`;
let snake = [{ x: 100, y: 100 }];
let direction = { x: 1, y: 0 };
let speed = 2;
let otherSnakes = {};
let food = { x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500) };
let score = 0;
let lastPosition = { x: 100, y: 100 }; // To track the last sent position

const snakeElements = [];
const foodElement = document.createElement('div');
foodElement.style.width = '10px';
foodElement.style.height = '10px';
foodElement.style.backgroundColor = 'red';
foodElement.style.position = 'absolute';
gameContainer.appendChild(foodElement);

function updateFoodPosition() {
  foodElement.style.left = `${food.x}px`;
  foodElement.style.top = `${food.y}px`;
}

function createSnakeSegment() {
  const segment = document.createElement('div');
  segment.style.width = '10px';
  segment.style.height = '10px';
  segment.style.backgroundColor = 'green';
  segment.style.position = 'absolute';
  gameContainer.appendChild(segment);
  snakeElements.push(segment);
}

function moveSnake() {
  const newHead = {
    x: snake[0].x + direction.x * speed,
    y: snake[0].y + direction.y * speed,
  };
  snake.unshift(newHead);

  if (!(newHead.x === food.x && newHead.y === food.y)) {
    snake.pop();
  } else {
    score += 10;
    food = { x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500) };
    updateFoodPosition();
    channel.publish('FOOD', food);
  }

  while (snake.length > snakeElements.length) {
    createSnakeSegment();
  }
  snake.forEach((segment, i) => {
    snakeElements[i].style.left = `${segment.x}px`;
    snakeElements[i].style.top = `${segment.y}px`;
  });

  if (snakeCollision(newHead)) {
    resetSnake();
  }

  if (newHead.x !== lastPosition.x || newHead.y !== lastPosition.y) {
    channel.publish('MOVE', { id: clientId, snake, score });
    lastPosition = { x: newHead.x, y: newHead.y }; // Update the last sent position
  }
}

function snakeCollision(head) {
  return (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= gameContainer.clientWidth ||
    head.y >= gameContainer.clientHeight ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  );
}

function resetSnake() {
  snake = [{ x: 100, y: 100 }];
  direction = { x: 1, y: 0 };
  score = 0;
}

function updateOtherSnakes(message) {
  const { id, snake: otherSnake, score: otherScore } = message.data;
  if (!otherSnakes[id]) {
    otherSnakes[id] = otherSnake.map(() => createSnakeSegment());
  }
  otherSnake.forEach((segment, i) => {
    const segmentElement = otherSnakes[id][i];
    segmentElement.style.left = `${segment.x}px`;
    segmentElement.style.top = `${segment.y}px`;
  });
}

function updateScoreboard() {
  scoreboard.textContent = `Your Score: ${score}`;
}

channel.subscribe('FOOD', (message) => {
  food = message.data;
  updateFoodPosition();
});

channel.subscribe('MOVE', (message) => {
  if (message.data.id !== clientId) {
    updateOtherSnakes(message);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
  if (event.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
  if (event.key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
  if (event.key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
});

setInterval(() => {
  moveSnake();
  updateScoreboard();
}, 100);

updateFoodPosition();
