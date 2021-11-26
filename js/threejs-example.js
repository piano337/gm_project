import * as THREE from "./three.js/build/three.module.js";

import Stats from "./three.js/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";

let renderer, stats, scene, camera;

init();
animate();

function init() {
  const container = document.getElementById("container");

  //

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb0b0b0);

  //

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 200);

  //

  const group = new THREE.Group();
  scene.add(group);

  //

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(0.75, 0.75, 1.0).normalize();
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.2);
  scene.add(ambientLight);

  //

  const helper = new THREE.GridHelper(160, 10);
  helper.rotation.x = Math.PI / 2;
  group.add(helper);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  //

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 100;
  controls.maxDistance = 1000;

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
