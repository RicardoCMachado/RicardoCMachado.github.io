

// ************************** //
// Add Scene
// ************************** //
const scene = new THREE.Scene();


// ************************** //
// Add Camera
// ************************** //
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
scene.add(camera);
camera.position.z = 5;


// ************************** //
// Add Renderer
// ************************** //
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);


// ************************** //
// Add Ambient Light
// ************************** //
const ambientLight = new THREE.PointLight(0xffffff, 1.0);
ambientLight.position.copy(camera.position);
scene.add(ambientLight);


// ************************** //
// Add Sun Light
// ************************** //
const sunLight = new THREE.DirectionalLight(0xdddddd, 1.0);
sunLight.position.y = 15;
scene.add(sunLight);


// ************************** //
// Add Cube
// ************************** //
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 'blue' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


// ************************** //
// Add Listener to Move
// ************************** //
document.addEventListener('keydown', onKeyDown, false);


// ************************** //
// Add Player Position
// ************************** //
const playerPos = new THREE.Vector3(0, 2, 5);


// ************************** //
// Add Textures
// ************************** //
const textureLoader = new THREE.TextureLoader();

const floorTexture = textureLoader.load('./images/floor.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(20, 20);

const wallsTexture = textureLoader.load('./images/wall.png');
wallsTexture.wrapS = THREE.RepeatWrapping;
wallsTexture.wrapT = THREE.RepeatWrapping;
wallsTexture.repeat.set(8, 8);

const ceilingTexture = textureLoader.load('./images/ceiling.png');
ceilingTexture.wrapS = THREE.RepeatWrapping;
ceilingTexture.wrapT = THREE.RepeatWrapping;
ceilingTexture.repeat.set(4, 4);


// ************************** //
// Add Floor
// ************************** //
const planeGeometry = new THREE.PlaneBufferGeometry(60, 60);
const planeMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide});
const floorPlane = new THREE.Mesh(planeGeometry, planeMaterial); 

floorPlane.rotation.x = Math.PI / 2; 
floorPlane.position.y = -Math.PI; 
scene.add(floorPlane);


// ************************** //
// Add Walls
// ************************** //
let wallGroup = new THREE.Group(); 
scene.add(wallGroup);


const planeGeo = new THREE.PlaneBufferGeometry(60, 60);
const planeMat = new THREE.MeshBasicMaterial({map: wallsTexture,side: THREE.DoubleSide});


// Front Wall
const frontWall = new THREE.Mesh(planeGeo,planeMat);
frontWall.position.z = -30; 

// Back Wall
const backWall = new THREE.Mesh(planeGeo,planeMat);
backWall.position.z = 30; 


// Left Wall
const leftWall = new THREE.Mesh(planeGeo,planeMat);
leftWall.rotation.y = Math.PI / 2; 
leftWall.position.x = -30; 

// Right Wall
const rightWall = new THREE.Mesh(planeGeo,planeMat);
rightWall.position.x = 30;
rightWall.rotation.y = Math.PI / 2; 

wallGroup.add(frontWall, leftWall, rightWall, backWall);


for (let i = 0; i < wallGroup.children.length; i++) {
  wallGroup.children[i].BBox = new THREE.Box3();
  wallGroup.children[i].BBox.setFromObject(wallGroup.children[i]);
}


// ************************** //
// Add Ceiling
// ************************** //
const planeGeometry2 = new THREE.PlaneBufferGeometry(60, 60); 
const planeMateria2 = new THREE.MeshBasicMaterial({map: ceilingTexture, side: THREE.DoubleSide});
const ceilingPlane = new THREE.Mesh(planeGeometry2, planeMateria2);

ceilingPlane.rotation.x = Math.PI / 2; 
ceilingPlane.position.y = 12;
scene.add(ceilingPlane);


// ************************** //
// Method to Move Character and Avoid Crossing Walls
// ************************** //

function onKeyDown(event) {
  switch (event.keyCode) {
    case 87: // w
    case 38: // up arrow
      if (playerPos.z - 1 >= (wallGroup.children[0].BBox.max.z) + 1 && playerPos.y + 1 <= ceilingPlane.position.y) {
        playerPos.z -= 1;
      }
      break;
    case 83: // s
    case 40: // down arrow
      if (playerPos.z + 1 <= wallGroup.children[3].BBox.min.z && playerPos.y - 1 >= floorPlane.position.y) {
        playerPos.z += 1;
      }
      break;
    case 65: // a
    case 37: // left arrow
      if (playerPos.x - 1 >= wallGroup.children[1].BBox.max.x && playerPos.y + 1 <= ceilingPlane.position.y) {
        playerPos.x -= 1;
      }
      break;
    case 68: // d
    case 39: // right arrow
      if (playerPos.x + 1 <= wallGroup.children[2].BBox.min.x && playerPos.y + 1 <= ceilingPlane.position.y) {
        playerPos.x += 1;
      }
      break;
    case 32: // space
      if (playerPos.y + 1 <= ceilingPlane.position.y-1) {
        playerPos.y += 1;
      }
      break;
    case 16: // shift
      if (playerPos.y - 1 >= floorPlane.position.y+5) {
        playerPos.y -= 1;
      }
      break;
  }
}

// ************************** //
// Add Painting to Front Wall
// ************************** //

const paintingWidth = 12; 
const paintingHeight = 8; 
const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
const frameGeometry = new THREE.BoxGeometry(12.5, 8.5, 0.00001);


const paintingTexture = new THREE.TextureLoader().load('./images/captain_america_1.jpg');
const paintingGeometry = new THREE.PlaneBufferGeometry(paintingWidth, paintingHeight);
const paintingMaterial = new THREE.MeshBasicMaterial({ map: paintingTexture, side: THREE.FrontSide });
const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
painting.position.set(-22, 4.5, -29.98); 
scene.add(painting);

const frame = new THREE.Mesh(frameGeometry, frameMaterial);
frame.position.set(-22, 4.5, -29.99);
scene.add(frame);

// ************************** //
// Add Painting to Front Wall
// ************************** //

const paintingTexture2 = new THREE.TextureLoader().load('./images/capitamarvel.jpg'); // Load painting texture
const paintingGeometry2 = new THREE.PlaneBufferGeometry(paintingWidth, paintingHeight);
const paintingMaterial2 = new THREE.MeshBasicMaterial({ map: paintingTexture2, side: THREE.FrontSide });
const painting2 = new THREE.Mesh(paintingGeometry2, paintingMaterial2);
painting2.position.set(-7.5, 4.5, -29.98); 
scene.add(painting2);

const frame2 = new THREE.Mesh(frameGeometry, frameMaterial);
frame2.position.set(-7.5, 4.5, -29.99);
scene.add(frame2);


// ************************** //
// Add Painting to Front Wall
// ************************** //

const paintingTexture3 = new THREE.TextureLoader().load('./images/iron-man-1.jpg'); // Load painting texture
const paintingGeometry3 = new THREE.PlaneBufferGeometry(paintingWidth, paintingHeight);
const paintingMaterial3 = new THREE.MeshBasicMaterial({ map: paintingTexture3, side: THREE.FrontSide });
const painting3 = new THREE.Mesh(paintingGeometry3, paintingMaterial3);
painting3.position.set(7.5, 4.5, -29.98); 
scene.add(painting3);

const frame3 = new THREE.Mesh(frameGeometry, frameMaterial);
frame3.position.set(7.5, 4.5, -29.99);
scene.add(frame3);


const paintingTexture4 = new THREE.TextureLoader().load('./images/hulk.jpg'); // Load painting texture
const paintingGeometry4 = new THREE.PlaneBufferGeometry(paintingWidth, paintingHeight);
const paintingMaterial4 = new THREE.MeshBasicMaterial({ map: paintingTexture4, side: THREE.FrontSide });
const painting4 = new THREE.Mesh(paintingGeometry4, paintingMaterial4);
painting4.position.set(22, 4.5, -29.98); 
scene.add(painting4);

const frame4 = new THREE.Mesh(frameGeometry, frameMaterial);
frame4.position.set(22, 4.5, -29.99);
scene.add(frame4);



let render = function () {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;


  renderer.render(scene, camera);
  camera.position.copy(playerPos);

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = cam;
    camera.updateProjectionMatrix();
  })

  requestAnimationFrame(render);
};

render();