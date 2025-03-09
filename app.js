
const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');


const channel = ably.channels.get('cube-movement');


const gameContainer = document.getElementById('game-container');

// Generate a unique ID for this client
const clientId = `player-${Math.floor(Math.random() * 10000)}`;


const cube = document.createElement('div');
cube.id = clientId;
cube.className = 'cube';
cube.style.width = '50px';
cube.style.height = '50px';
cube.style.backgroundColor = getRandomColor(); 
cube.style.position = 'absolute';
cube.style.top = '0px';
cube.style.left = '0px';
gameContainer.appendChild(cube);

let cubePosition = { x: 0, y: 0, id: clientId };


function updateCubePosition(cubeElement, position) {
  cubeElement.style.left = `${position.x}px`;
  cubeElement.style.top = `${position.y}px`;
}

// Handle Arrow Key Movement
window.addEventListener('keydown', (event) => {
  let moved = false;

  switch (event.key) {
    case 'ArrowUp':
      if (cubePosition.y > 0) {
        cubePosition.y -= 10;
        moved = true;
      }
      break;
    case 'ArrowDown':
      if (cubePosition.y < gameContainer.clientHeight - cube.offsetHeight) {
        cubePosition.y += 10;
        moved = true;
      }
      break;
    case 'ArrowLeft':
      if (cubePosition.x > 0) {
        cubePosition.x -= 10;
        moved = true;
      }
      break;
    case 'ArrowRight':
      if (cubePosition.x < gameContainer.clientWidth - cube.offsetWidth) {
        cubePosition.x += 10;
        moved = true;
      }
      break;
  }

  if (moved) {
    // Update cube position locally
    updateCubePosition(cube, cubePosition);

    // Publish the updated position to the channel thing
    channel.publish('MOVE', cubePosition, (err) => {
      if (err) console.error('Error publishing position:', err);
    });
  }
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
});


function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
