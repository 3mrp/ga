const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('slither-game');
const gameContainer = document.getElementById('game-container');
const scoreboard = document.getElementById('scoreboard');

const clientId = `player-${Math.floor(Math.random() * 10000)}`;
let snake = [{ x: 100, y: 100 }];
let direction = { x: 1, y: 0 };
let speed = 6;
let otherSnakes = {};
let food = { x: Math.floor(Math.random() * 590), y: Math.floor(Math.random() * 590) };
let score = 0;
let lastPosition = { x: 100, y: 100 };
let lastMovePublishTime = 0;
let lastStateResponseTime = 0;
const MOVE_PUBLISH_INTERVAL = 100; // Publish moves at most every 100ms (10 times per second)
const STATE_RESPONSE_COOLDOWN = 1000; // Respond to state requests at most once per second

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

  if (
    newHead.x < food.x + 10 &&
    newHead.x + 10 > food.x &&
    newHead.y < food.y + 10 &&
    newHead.y + 10 > food.y
  ) {
    score += 10;
    food = { x: Math.floor(Math.random() * (gameContainer.clientWidth - 10)), y: Math.floor(Math.random() * (gameContainer.clientHeight - 10)) };
    updateFoodPosition();
    channel.publish('FOOD', food);
  } else {
    snake.pop();
  }

  while (snake.length > snakeElements.length) {
    createSnakeSegment();
  }
  while (snake.length < snakeElements.length) {
    const segmentToRemove = snakeElements.pop();
    gameContainer.removeChild(segmentToRemove);
  }
  snake.forEach((segment, i) => {
    snakeElements[i].style.left = `${segment.x}px`;
    snakeElements[i].style.top = `${segment.y}px`;
  });

  if (snakeCollision(newHead)) {
    resetSnake();
  }

  // Throttle MOVE messages to prevent rate limiting
  const now = Date.now();
  if (newHead.x !== lastPosition.x || newHead.y !== lastPosition.y) {
    if (now - lastMovePublishTime >= MOVE_PUBLISH_INTERVAL) {
      channel.publish('MOVE', { id: clientId, snake, score });
      lastMovePublishTime = now;
    }
    lastPosition = { x: newHead.x, y: newHead.y };
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
  const { id, snake: otherSnake } = message.data;

  if (!otherSnakes[id]) {
    otherSnakes[id] = otherSnake.map(() => {
      const segment = document.createElement('div');
      segment.style.width = '10px';
      segment.style.height = '10px';
      segment.style.backgroundColor = 'blue';
      segment.style.position = 'absolute';
      gameContainer.appendChild(segment);
      return segment;
    });
  }

  while (otherSnake.length > otherSnakes[id].length) {
    const segment = document.createElement('div');
    segment.style.width = '10px';
    segment.style.height = '10px';
    segment.style.backgroundColor = 'blue';
    segment.style.position = 'absolute';
    gameContainer.appendChild(segment);
    otherSnakes[id].push(segment);
  }
  while (otherSnake.length < otherSnakes[id].length) {
    const segmentToRemove = otherSnakes[id].pop();
    gameContainer.removeChild(segmentToRemove);
  }

  otherSnake.forEach((segment, i) => {
    if (otherSnakes[id][i]) {
      otherSnakes[id][i].style.left = `${segment.x}px`;
      otherSnakes[id][i].style.top = `${segment.y}px`;
    }
  });
}

function updateScoreboard() {
  scoreboard.textContent = `your score: ${score}`;
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

channel.subscribe('STATE_REQUEST', (message) => {
  // Add cooldown to prevent responding to multiple STATE_REQUESTs too quickly
  const now = Date.now();
  if (now - lastStateResponseTime >= STATE_RESPONSE_COOLDOWN) {
    channel.publish('STATE_RESPONSE', {
      id: clientId,
      snake,
      score,
      food
    });
    lastStateResponseTime = now;
  }
});

channel.subscribe('STATE_RESPONSE', (message) => {
  if (message.data.id !== clientId) {
    updateOtherSnakes(message);
    food = message.data.food;
    updateFoodPosition();
  }
});

channel.publish('STATE_REQUEST', { id: clientId });

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
  if (event.key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
  if (event.key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
  if (event.key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
});

setInterval(() => {
  moveSnake();
  updateScoreboard();
}, 50);

updateFoodPosition();
