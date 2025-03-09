const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('cube-movement');
const gameContainer = document.getElementById('game-container');
const clientId = `player-${Math.floor(Math.random() * 10000)}`;
const cube = document.createElement('div');
cube.id = clientId;
cube.className = 'cube';
cube.style.width = '50px';
cube.style.height = '50px';
cube.style.backgroundColor = getRandomColor();
cube.style.position = 'absolute';
gameContainer.appendChild(cube);

let cubePosition = { x: Math.floor(Math.random() * 450), y: Math.floor(Math.random() * 450), id: clientId };
updateCubePosition(cube, cubePosition);
channel.publish('MOVE', cubePosition);

const dataBox = document.createElement('div');
dataBox.id = 'data-box';
dataBox.style.position = 'absolute';
dataBox.style.top = '10px';
dataBox.style.left = '10px';
dataBox.style.width = '200px';
dataBox.style.height = '150px';
dataBox.style.overflowY = 'auto';
dataBox.style.padding = '10px';
dataBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
dataBox.style.color = 'white';
dataBox.style.fontSize = '12px';
dataBox.style.borderRadius = '5px';
dataBox.style.display = 'none';
gameContainer.appendChild(dataBox);

function updateCubePosition(cubeElement, position) {
  cubeElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
}

function logDataToBox(data) {
  const entry = document.createElement('div');
  entry.textContent = JSON.stringify(data);
  dataBox.appendChild(entry);
  dataBox.scrollTop = dataBox.scrollHeight;
}

window.addEventListener('keydown', (event) => {
  if (event.key === '/') {
    dataBox.style.display = dataBox.style.display === 'none' ? 'block' : 'none';
    return;
  }

  switch (event.key) {
    case 'ArrowUp':
      if (cubePosition.y > 0) cubePosition.y -= 5;
      break;
    case 'ArrowDown':
      if (cubePosition.y < gameContainer.clientHeight - cube.offsetHeight) cubePosition.y += 5;
      break;
    case 'ArrowLeft':
      if (cubePosition.x > 0) cubePosition.x -= 5;
      break;
    case 'ArrowRight':
      if (cubePosition.x < gameContainer.clientWidth - cube.offsetWidth) cubePosition.x += 5;
      break;
  }

  updateCubePosition(cube, cubePosition);
  channel.publish('MOVE', cubePosition);
  logDataToBox(cubePosition);
});

channel.subscribe('MOVE', (message) => {
  const { id, x, y } = message.data;

  if (id === clientId) return;

  let otherCube = document.getElementById(id);
  if (!otherCube) {
    otherCube = document.createElement('div');
    otherCube.id = id;
    otherCube.className = 'cube';
    otherCube.style.width = '50px';
    otherCube.style.height = '50px';
    otherCube.style.backgroundColor = getRandomColor();
    otherCube.style.position = 'absolute';
    gameContainer.appendChild(otherCube);
  }

  updateCubePosition(otherCube, { x, y });
  logDataToBox(message.data);
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
