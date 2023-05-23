import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1;
camera.near = 1; // Increase the near clipping plane value
camera.fov = 40; // Adjust the camera's field of view
camera.updateProjectionMatrix(); // Update the camera's projection matrix

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('mousedown', function (event) {
  console.log('Mouse event detected:', event);
});

// Add camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0); // Adjust the light's position
scene.add(directionalLight);

var seatObjects = [];

// Load the model
const loader = new GLTFLoader();
loader.load('untitled.glb', function (gltf) {
 

  // Scale and position the model (if necessary)
  gltf.scene.scale.set(0.1, 0.1, 0.1);
  gltf.scene.position.set(0, 0, 0);

  console.log(gltf)

  // Add the model to the scene
  scene.add(gltf.scene);

  // Iterate over the children and filter the seat objects
  gltf.scene.children.forEach(function (child) {
    // Check if the object's name indicates it's a seat
    if (child.name.startsWith('Sketchfab_model')) {
      seatObjects.push(child);

      child.userData.interactive = true; // Enable interaction
      child.cursor = 'pointer'; // Set cursor style
      
    }
  });

  
});

// Create a raycaster
const raycaster = new THREE.Raycaster();

// Add click event listener to renderer's DOM element
renderer.domElement.addEventListener('click', onClick);

function onClick(event) {
  // Calculate normalized device coordinates (NDC) of mouse click
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  // Set the raycaster's origin and direction based on mouse click
  raycaster.setFromCamera(mouse, camera);

  // Perform raycasting to determine intersected objects
  const intersects = raycaster.intersectObjects(seatObjects, true);

  // Check if any seat objects are intersected
  if (intersects.length > 0) {
    const clickedSeat = intersects[0].object;

    // Move the camera to the position of the clicked seat
    moveCameraToSeat(clickedSeat.position);
    console.log('Seat clicked:', clickedSeat);
  }
}


// Function to move the camera to the seat position
function moveCameraToSeat(seatPosition) {
  const distance = 1; // Adjust this value to control the distance

  // Calculate the camera position based on the seat position and distance
  const cameraPosition = new THREE.Vector3().copy(seatPosition);
  const cameraOffset = new THREE.Vector3(0, 0, distance);
  const cameraDirection = new THREE.Vector3(0, -0.2, -1);
  cameraDirection.applyQuaternion(camera.quaternion); // Apply the camera's rotation
  cameraOffset.applyQuaternion(camera.quaternion); // Apply the camera's rotation
  cameraDirection.multiplyScalar(distance);
  cameraPosition.add(cameraOffset).add(cameraDirection);

  // Set the camera position and look at the seat position
  camera.position.copy(cameraPosition);
  camera.lookAt(seatPosition);
}




// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate the model (if necessary)
  if (scene.children.length > 0) {
    scene.children[0].rotation.y += 0.01;
  }

  // Update the controls
  controls.update();

  renderer.render(scene, camera);
}

const width = 1.5; // Set the desired width of the plane
const height = 1;

const geometry = new THREE.PlaneGeometry(width, height); // Set the desired width and height of the plane


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('wall.jpg'); // Replace with the URL of the website

const color = new THREE.Color(0xEE82EE); // Set the desired color (violet)
const material = new THREE.MeshBasicMaterial({ map: texture });

const screen = new THREE.Mesh(geometry, material);

screen.rotation.y = Math.PI;

scene.add(screen);
 
screen.position.set(0, 0.5, 1);

animate();

