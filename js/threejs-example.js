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

  // Adding some lines >>>>>>>>>>>
  //create a blue LineBasicMaterial 
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points = [];

  points.push(new THREE.Vector3(-10, 0, 0));
  points.push(new THREE.Vector3(0, 10, 0));
  points.push(new THREE.Vector3(10, 0, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line( geometry, material );
  group.add(line);
  // <<<<<<<<<<< Adding some lines

  // Adding some points >>>>>>
  const vertices = [];

  for ( let i = 0; i < 10; i ++ ) {
  
    const x = THREE.MathUtils.randFloatSpread( 100 );
    const y = THREE.MathUtils.randFloatSpread( 100 );
    const z = THREE.MathUtils.randFloatSpread( 100 );
  
    vertices.push( x, y, z );
  
  }
  
  const geometry2 = new THREE.BufferGeometry();
  geometry2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  
  const material2 = new THREE.PointsMaterial( { color: 'red' } );
  
  const points2 = new THREE.Points( geometry2, material2 );
  
  group.add( points2 );
  // <<<<<<< Adding some points

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
