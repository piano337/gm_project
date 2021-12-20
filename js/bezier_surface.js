
import * as THREE from "./three.js/build/three.module.js";

import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";

const sampleU = 0.5;
const sampleW = 0.7;

const m = 3;
const n = 3;
var CONTROLPOINTS = [
[new THREE.Vector3( 1.0, 0.0, -1.0 ),new THREE.Vector3( 0.1, -0.3, -1,0 ),new THREE.Vector3( 0.1, 0.3, -1.0 ),new THREE.Vector3( -1.0, 0.0, -1.0 )]
,
[new THREE.Vector3( 0.1, -1.0, -0.3 ),new THREE.Vector3( 0.1, -0.3, -0.3 ),new THREE.Vector3( 0.1, 0.3, -0.3 ),new THREE.Vector3( 0.1, 1.0, -0.3 )]
,
[new THREE.Vector3( 0.1, -1.0, 0.3 ),new THREE.Vector3( 0.1, -0.3, 0.3 ),new THREE.Vector3( 0.1, 0.3, 0.3 ),new THREE.Vector3( 0.1, 1.0, 0.3 )]
,
[new THREE.Vector3( 1.0, 0.0, 1.0 ),new THREE.Vector3( 0.1, -0.3, 1.0 ),new THREE.Vector3( 0.1, 0.3, 1.0 ),new THREE.Vector3( -1.0, 0.0, 1.0 )]
];
var DT = [];
var surfacePoints = [];


let scene, camera, renderer;
let cameraAngle, camRadius;
let arrowHelper1, arrowHelper2, arrowHelper3;
let arrowDirection1 = new THREE.Vector3();
let arrowDirection2 = new THREE.Vector3();
let arrowDirection3 = new THREE.Vector3();

function init() {
  const container = document.getElementById("container");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x685754);
  let width = (7 * window.innerWidth) / 10;
  camera = new THREE.PerspectiveCamera(
    45,
    width / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 200);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);

  renderer.setClearColor(new THREE.Color(0x111111));
  renderer.setSize(width, window.innerHeight);

  
  

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  // White directional light at 0.65 intensity shining from the top.
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
  scene.add(directionalLight);

  // For Camera Control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 20;
  cameraAngle = 25;
  camRadius = 5;
  let angle = (cameraAngle * Math.PI) / 180.0;
  let xCam = camRadius * Math.cos(angle);
  let zCam = camRadius * Math.sin(angle);
  camera.position.set(xCam, 3, zCam);
  camera.lookAt(scene.position);



}

let sphereGeometry = new THREE.SphereGeometry(0.015, 20, 20);

let sphereMaterialRed = new THREE.MeshBasicMaterial({
    color: 0xfa8072,
    wireframe: false,
});

function setUpControlPoints(){
  
  for(var i= 0; i<=m; i++){
      for(var j = 0; j<=n ; j++){
        var point = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
        point.position.x = CONTROLPOINTS[i][j].x;
        point.position.y = CONTROLPOINTS[i][j].y;
        point.position.z = CONTROLPOINTS[i][j].z;
        scene.add(point);
      }
  }
}
let material = new THREE.LineBasicMaterial({
    color: 0xffff00,
    opacity: 0.25,
    transparent: true,
});
function setUpControlLines(){
  let vertices= [];
  for(var i= 0; i<=m; i++){
    vertices.length = 0;
    let geo = new THREE.BufferGeometry();
      for(var j = 0; j<=n ; j++){
        vertices.push(CONTROLPOINTS[i][j].x,CONTROLPOINTS[i][j].y,CONTROLPOINTS[i][j].z);
      }
    geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
    );
    let line = new THREE.Line(geo, material);
    scene.add(line);
  }
  for(var i= 0; i<=m; i++){
    vertices.length = 0;
    let geo = new THREE.BufferGeometry();
      for(var j = 0; j<=n ; j++){
        vertices.push(CONTROLPOINTS[j][i].x,CONTROLPOINTS[j][i].y,CONTROLPOINTS[j][i].z);
      }
    geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
    );
    let line = new THREE.Line(geo, material);
    scene.add(line);
  }

}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}





  let sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
  });
  var oneTime = true;
function calcPoints(){


  var points =[];
  var points2 = [];
  for (let t = 0; t<=1.01;t=t+0.05){
    surfacePoints.push([]);
    points.length = 0;
    var result = new THREE.Vector3();
    var result_dt = new THREE.Vector3();
    var result_ds = new THREE.Vector3();

    //Setting up array
    for (let i = 0; i<=m;i++) {
        points.push([]);
        for (let j =0; j<=n;j++) {
            points[i].push(CONTROLPOINTS[i][j].clone());
      }
    }
  //Starting algorithm TO-DO adding dt's to algorithm
  
  for (let i = 0; i<=m;i++) {
      for (let r =1; r<=n-1;r++) {
        for (let j=0; j <= n-r; j++) {

        var aux1 = points[i][j].clone();
        var aux2 = points[i][j+1].clone(); 
        aux1.multiplyScalar(1-t)
        aux2.multiplyScalar(t)
        points[i][j].addVectors(aux1,aux2)
        //points[i][j]=points[i][j]*(1-t)+t*points[i][j+1]  
        }
        //dt calculations
        var aux3 = points[i][1].clone();
        aux3.sub(points[i][0]);
        aux3.multiplyScalar(n);
        DT.push(aux3);
      }

        var aux1 = points[i][0].clone();
        var aux2 = points[i][1].clone();
        aux1.multiplyScalar(1-t)
        aux2.multiplyScalar(t)
        points[i][0].addVectors(aux1,aux2)
        //points[i][0]=points[i][0]*(1-t)+t*points[i][1] 
  }

    for (let s = 0; s<=1.01;s=s+0.05){
      //Ssetting up array
      points2.length = 0;
      for (let i = 0; i<=m;i++) {
        points2.push(points[i][0].clone());
        
      }
      for (let r =1; r<=m-1;r++) {
        for (let i=0; i <= m-r; i++) {
        
        var aux1 = points2[i].clone();
        var aux2 = points2[i+1].clone();
        aux1.multiplyScalar(1-s)
        aux2.multiplyScalar(s)
        points2[i].addVectors(aux1,aux2)
        //points[i][0]=points[i][0]*(1-s)+s*points[i+1][0] 
        //dt calculations
        var aux3 = DT[i].clone();
        var aux4 = DT[i+1].clone();
        aux3.multiplyScalar(1-s)
        aux4.multiplyScalar(s)
        DT[i].addVectors(aux3,aux4)
        }
      }
    
      //ds(s,t)
      var aux3 = points2[1].clone();
      aux3.sub(points2[0]);
      aux3.multiplyScalar(m);
      result_ds = aux3.clone();
      //b(s,t)
      var aux1 = points2[0].clone();
      var aux2 = points2[1].clone();
      aux1.multiplyScalar(1-s)
      aux2.multiplyScalar(s)
      result.addVectors(aux1,aux2)
      //dt(s,t)
      var aux3 = DT[0].clone();
      var aux4 = DT[1].clone();
      aux3.multiplyScalar(1-s)
      aux4.multiplyScalar(s)
      result_dt.addVectors(aux3,aux4)
      

      surfacePoints[Math.round(t*20)].push(result.clone());

      const S = 0.5;
      const T = 0.5;

      //We calculate all dt and ds but we only show one hard coded at s = 0.5 t = 0.5
      if(s-S<0.05 && t-T<0.05 && t>=T && s>=S && oneTime){
      	oneTime=false
      	//Draw lines
      	result_dt.normalize();
      	result_ds.normalize();


	  	arrowHelper1 = new THREE.ArrowHelper(
	    result_dt,
	    result,
	    0.4,
	    0xff0000,
	    0.07,
	    0.04
	  );
	  scene.add(arrowHelper1);

	  arrowHelper2 = new THREE.ArrowHelper(
	    result_ds,
	    result,
	    0.4,
	    0x00ff0,
	    0.07,
	    0.04
	  );
	  scene.add(arrowHelper2);
	  var arrow3 = new THREE.Vector3();
	  arrow3.crossVectors(result_dt,result_ds);
	  arrowHelper3 = new THREE.ArrowHelper(
	    arrow3,
	    result,
	    0.4,
	    0x60ff00,
	    0.07,
	    0.04
	  );
	  scene.add(arrowHelper3);
	 }
    }
  }
}
let materialWhite = new THREE.LineBasicMaterial({
    color: 0xffffff,
});
function drawSurface(){
  let vertices= [];
  for(let i= 0; i<=surfacePoints.length-1; i++){
    vertices.length=0;
    for(let j= 0; j<=surfacePoints[i].length-1; j++){
      vertices.push(surfacePoints[i][j].x,surfacePoints[i][j].y,surfacePoints[i][j].z);
    }
    let geo = new THREE.BufferGeometry();
    geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
    );
    let line = new THREE.Line(geo, materialWhite);
    scene.add(line);
    
  }
  for(let i= 0; i<=surfacePoints.length-1; i++){
    vertices.length=0;
    for(let j= 0; j<=surfacePoints[i].length-1; j++){
      vertices.push(surfacePoints[j][i].x,surfacePoints[j][i].y,surfacePoints[j][i].z);
    }
    let geo = new THREE.BufferGeometry();
    geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
    );
    let line = new THREE.Line(geo, materialWhite);
    scene.add(line);
    
  }
}




init();
setUpControlPoints();
setUpControlLines();

calcPoints();
drawSurface();
animate();
