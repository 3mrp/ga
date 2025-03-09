// Initialize Ably with your API key
const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');

// Create or join a channel
const channel = ably.channels.get('cube-movement');

// DOM Elements
const cube = document.getElementById('cube');
const gameContainer = document.getElementById('game-container');

// Cube state
let cubePosition = { x: 0, y: 0 };
const step = 10; // Movement step size

// Function to update cube position in the DOM
function updateCubePosition() {
  cube.style.left = `${cubePosition.x}px`;
  cube.style.top = `${cubePosition.y}px`;
}

// Handle Arrow Key Movement
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      if (cubePosition.y > 0) cubePosition.y -= step;
      break;
    case 'ArrowDown':
      if (cubePosition.y < gameContainer.clientHeight - cube.offsetHeight)
        cubePosition.y += step;
      break;
    case 'ArrowLeft':
      if (cubePosition.x > 0) cubePosition.x -= step;
      break;
    case 'ArrowRight':
      if (cubePosition.x < gameContainer.clientWidth - cube.offsetWidth)
        cubePosition.x += step;
      break;
  }

  // Update cube's position locally
  updateCubePosition();

  // Publish updated position to the channel
  channel.publish('MOVE', cubePosition, (err) => {
    if (err) console.error('Error publishing position:', err);
  });
});

// Subscribe to movement updates from other clients
channel.subscribe('MOVE', (message) => {
  cubePosition = message.data;
  updateCubePosition();
});
