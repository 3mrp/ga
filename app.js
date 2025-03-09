const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('maze-game');
const gameContainer = document.getElementById('game-container');

const clientId = `player-${Math.floor(Math.random() * 10000)}`;
const cube = document.createElement('div');
cube.id = clientId;
cube.className = 'cube';
cube.style.width = '30px';
cube.style.height = '30px';
cube.style.backgroundColor = getRandomColor();
cube.style.position = 'absolute';
gameContainer.appendChild(cube);

const dataBox = document.createElement('div');
dataBox.id = 'data-box';
dataBox.style.position = 'absolute';
dataBox.style.top = '10px';
dataBox.style.left = '10px';
dataBox.style.width = '300px';
dataBox.style.height = '200px';
dataBox.style.overflowY = 'auto';
dataBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
dataBox.style.color = 'white';
dataBox.style.fontSize = '12px';
dataBox.style.padding = '10px';
dataBox.style.borderRadius = '5px';
dataBox.style.display = 'none';
gameContainer.appendChild(dataBox);

let score = 0;
let otherPlayers = {};
let maze = [];
let cubePosition = { x: 0, y: 0, id: clientId };

function updateCubePosition(cubeElement, position) {
  cubeElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
}

function logDataToBox(label, data) {
  const entry = document.createElement('div');
  entry.textContent = `${label}: ${JSON.stringify(data)}`;
  dataBox.appendChild(entry);
  dataBox.scrollTop = dataBox.scrollHeight;
}

function encodeData(data) {
  const stringifiedData = JSON.stringify(data);
  return btoa(stringifiedData);
}

function decodeData(encodedData) {
  const decodedString = atob(encodedData);
  return JSON.parse(decodedString);
}

function generateMaze() {
  maze = [...Array(15)].map(() =>
    [...Array(15)].map(() => (Math.random() > 0.7 ? 1 : 0))
  );
  renderMaze();
}

function renderMaze() {
  document.querySelectorAll('.wall').forEach(w => w.remove());
  maze.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell === 1) {
        const wall = document.createElement('div');
        wall.className = 'wall';
        wall.style.width = '30px';
        wall.style.height = '30px';
        wall.style.backgroundColor = 'black';
        wall.style.position = 'absolute';
        wall.style.transform = `translate(${cellIndex * 30}px, ${rowIndex * 30}px)`;
        gameContainer.appendChild(wall);
      }
    });
  });
}

function checkCollision(x, y) {
  const cellX = Math.floor(x / 30);
  const cellY = Math.floor(y / 30);
  return maze[cellY]?.[cellX] === 1;
}

window.addEventListener('keydown', (event) => {
  if (event.key === '/') {
    dataBox.style.display = dataBox.style.display === 'none' ? 'block' : 'none';
    return;
  }

  let { x, y } = cubePosition;

  switch (event.key) {
    case 'ArrowUp':
      y -= 30;
      if (!checkCollision(x, y)) cubePosition.y = y;
      break;
    case 'ArrowDown':
      y += 30;
      if (!checkCollision(x, y)) cubePosition.y = y;
      break;
    case 'ArrowLeft':
      x -= 30;
      if (!checkCollision(x, y)) cubePosition.x = x;
      break;
    case 'ArrowRight':
      x += 30;
      if (!checkCollision(x, y)) cubePosition.x = x;
      break;
  }

  updateCubePosition(cube, cubePosition);

  const encodedData = encodeData(cubePosition);
  channel.publish('MOVE', { payload: encodedData });
  logDataToBox('Sent', cubePosition);

  if (x >= 420 && y >= 420) {
    score++;
    const encodedScore = encodeData({ id: clientId, score });
    channel.publish('SCORE', { payload: encodedScore });
    logDataToBox('Sent', { id: clientId, score });
    generateMaze();
    cubePosition = { x: 0, y: 0, id: clientId };
    updateCubePosition(cube, cubePosition);
  }
});

channel.subscribe('MOVE', (message) => {
  const decodedData = decodeData(message.data.payload);
  const { id, x, y } = decodedData;

  if (id === clientId) return;

  if (!otherPlayers[id]) {
    const otherCube = document.createElement('div');
    otherCube.id = id;
    otherCube.className = 'cube';
    otherCube.style.width = '30px';
    otherCube.style.height = '30px';
    otherCube.style.backgroundColor = getRandomColor();
    otherCube.style.position = 'absolute';
    gameContainer.appendChild(otherCube);
    otherPlayers[id] = otherCube;
  }

  updateCubePosition(otherPlayers[id], { x, y });
  logDataToBox('Received', decodedData);
});

channel.subscribe('SCORE', (message) => {
  const decodedData = decodeData(message.data.payload);
  const { id, score } = decodedData;

  if (id === clientId) {
    document.getElementById('scoreboard').textContent = `your score: ${score}`;
  }

  logDataToBox('Received', decodedData);
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

generateMaze();
updateCubePosition(cube, cubePosition);
document.getElementById('scoreboard').textContent = `your score: ${score}`;
