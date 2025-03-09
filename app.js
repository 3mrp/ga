const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('movement-game');
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

let keyPressed = {};

window.addEventListener('keydown', (event) => {
  if (event.key === '/') {
    dataBox.style.display = dataBox.style.display === 'none' ? 'block' : 'none';
    return;
  }
  keyPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  delete keyPressed[event.key];
});

function moveCube() {
  let { x, y } = cubePosition;

  if (keyPressed['ArrowUp']) y -= 15;
  if (keyPressed['ArrowDown']) y += 15;
  if (keyPressed['ArrowLeft']) x -= 15;
  if (keyPressed['ArrowRight']) x += 15;

  cubePosition.x = Math.max(0, Math.min(x, gameContainer.clientWidth - cube.offsetWidth));
  cubePosition.y = Math.max(0, Math.min(y, gameContainer.clientHeight - cube.offsetHeight));

  updateCubePosition(cube, cubePosition);

  const encodedData = encodeData(cubePosition);
  channel.publish('MOVE', { payload: encodedData });
  logDataToBox('Sent', cubePosition);

  requestAnimationFrame(moveCube);
}

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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

updateCubePosition(cube, cubePosition);
moveCube();
