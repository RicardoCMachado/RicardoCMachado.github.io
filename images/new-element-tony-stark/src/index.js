import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
global.THREE = THREE;

require("three/examples/js/controls/OrbitControls");
const { GUI } = require("dat.gui");

let container, stats;

let camera, scene, renderer, composer;

let geometry, atomMaterial, bondMaterial;

let controls;

const params = {
  bloomEnabled: true,
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: 0.2
};

init();
render();

function vertexShader() {
  return `
    attribute vec3 center;
    varying vec3 vCenter;
      
    void main() {
      vCenter = center;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
    }
  `;
}

function fragmentShader() {
  return `
    varying vec3 vCenter;

    void main() {
      if (vCenter.x > 0.02 && vCenter.y > 0.02 && vCenter.z > 0.02) {
        discard;
      } else {
        if (vCenter.x < 0.02 && (vCenter.y < 0.25 || vCenter.z < 0.25)) {
          discard;
        }
        if (vCenter.y < 0.02 && (vCenter.x < 0.25 || vCenter.z < 0.25)) {
          discard;
        }
        if (vCenter.z < 0.02 && (vCenter.y < 0.25 || vCenter.x < 0.25)) {
          discard;
        }
      }
	    gl_FragColor = vec4(0.77, 0.90 ,1.0 , 0.2);
    }
  `;
}

function addCenterAttribute(geometry) {
  const vectors = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
  ];

  const position = geometry.attributes.position;
  const centers = new Float32Array(position.count * 3);

  for (let i = 0, l = position.count; i < l; i++) {
    vectors[i % 3].toArray(centers, i * 3);
  }

  geometry.setAttribute("center", new THREE.BufferAttribute(centers, 3));
}

function init() {
  container = document.getElementById("container");

  //

  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    1,
    500
  );
  camera.position.z = 30;

  scene = new THREE.Scene();

  //

  const loader = new THREE.TextureLoader();
  const baseTxt = loader.load("src/white_square.jpg");
  const alphaTxt = loader.load("src/atom_alphamap.jpg");

  geometry = new THREE.IcosahedronGeometry(6, 6);
  addCenterAttribute(geometry);
  atomMaterial = new THREE.PointsMaterial({
    size: 0.8,
    color: 0x0567ba,
    map: baseTxt,
    alphaMap: alphaTxt,
    transparent: true,
    depthWrite: false
  });
  bondMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    side: THREE.DoubleSide,
    transparent: true // this is important for the alpha value to work in the fragment shader
  });
  const spherePoints = new THREE.Points(geometry, atomMaterial);
  const sphereLines = new THREE.Mesh(geometry, bondMaterial);

  scene.add(spherePoints);
  scene.add(sphereLines);

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.bloomStrength,
    params.bloomRadius,
    params.bloomThreshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;

  //

  const gui = new GUI();

  gui.add(params, "bloomEnabled").onChange(function (value) {
    if (!value) {
      composer.removePass(bloomPass);
    } else {
      composer.addPass(bloomPass);
    }
  });

  gui.add(params, "bloomThreshold", 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = Number(value);
  });

  gui.add(params, "bloomStrength", 0.0, 3.0).onChange(function (value) {
    bloomPass.strength = Number(value);
  });

  gui
    .add(params, "bloomRadius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      bloomPass.radius = Number(value);
    });

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(render);

  controls.update();

  stats.update();
}

function render() {
  animate();

  composer.render();
}
