const CONTROLPOINTS = [
[new THREE.Vector3( 10, 1, 30 ),new THREE.Vector3( 0, 10, 20 ),new THREE.Vector3( 70, -10, 0 )]
,
[new THREE.Vector3( 0, 1, 7 ),new THREE.Vector3( 0, 10, 20 ),new THREE.Vector3( 20, 10, 0 )]
,
[new THREE.Vector3( 0, 1, 7 ),new THREE.Vector3( 0, 10, 20 ),new THREE.Vector3( 20, 10, 0 )]
];
var DT = [];
const m = 2;
const n = 2;


function calcPoints(s,t){

  var points = CONTROLPOINTS;
  var result = null;
  var result_dt = null;
  var result_ds = new THREE.Vector3();

  //Setting up array

  //console.log(points[0][1])
  //Starting algorithm TO-DO adding dt's to algorithm
  for (let i = 0; i<m;i++) {
      for (let r =1; r<n-1;r++) {
        for (let j=0; j < n-r; j++) {

          //console.log(points[i][j])
          points[i][j].multiplyScalar(1-t).add(points[i][j+1].multiplyScalar(t))
          //console.log(points[i][j]) 
        }
      }
        DT.push(points[i][1].sub(points[i][0]).multiplyScalar(n))
        points[i][0].multiplyScalar(1-t).add(points[i][1].multiplyScalar(t))
        //points[i][0]=points[i][0]*(1-t)+t*points[i][1] 
  }

  
      for (let r =1; r<m-1;r++) {
        for (let i=0; i < m-r; i++) {
        
        points[i][0].multiplyScalar(1-s).add(points[i+1][0].multiplyScalar(s))
        DT[i] = (DT[i].multiplyScalar(1-s).add(DT[i+1].multiplyScalar(s)))
        //points[i][0]=points[i][0]*(1-s)+s*points[i+1][0] 
        }
      }
    result_ds.subVectors(points[1][0],points[0][0])
    result_ds.multiplyScalar(m)
    points[0][0].multiplyScalar(1-s).add(points[1][0].multiplyScalar(s))
    result = points[0][0]
    DT[0] = (DT[0].multiplyScalar(1-s).add(DT[1].multiplyScalar(s)))
    result_dt = DT[0];
    //result = points[0][0]*(1-s)+s*points[1][0] 
    //console.log(result)
  


  console.log(result_dt)
  console.log(result_ds)
  console.log(result)
}

calcPoints(0.8,0.2);