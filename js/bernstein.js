const CANVAS_SIZE = 500;
const GRID_SIZE = CANVAS_SIZE/10;
const NUMBER_OF_STEPS = 100;

function pascalsTriangle(n) {
  let line = [1];
  for (let k = 0; k < n; k++)
    line.push(line[k] * (n - k) / (k + 1));
  return line;
}


function setup() {
  let myCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  myCanvas.parent('canvas-container');
  console.log(pascalsTriangle(4));
  noLoop();
}

function draw() {
  background('linen');
  graphAxis();
  functionPlot();
}

function graphAxis() {
  
  stroke(0);
  strokeWeight(5);

  // x axis
  line(0, height, width, height);

  // y axis
  line(0, 0, 0, height);

  // Grid
  stroke('grey');
  strokeWeight(1);
  let x = Math.floor(width / GRID_SIZE);
  let y = Math.floor(height / GRID_SIZE);
  for (let i = 0; i < x; i++) {
    line(i * GRID_SIZE, 0, i * GRID_SIZE, height);
  }
  for (let j = 0; j < y; j++) {
    line(0, j * GRID_SIZE, width, j * GRID_SIZE);
  }
}

function functionPlot() {
  translate(0, height)
  strokeWeight(2)
  noFill()
  stroke(0, 0, 255)
  beginShape();
  vertex(0, 0)
  for (let i = 1; i <= NUMBER_OF_STEPS; i++) {
    // let x = i * (width / NUMBER_OF_STEPS);
    let x = i * (width / NUMBER_OF_STEPS);
    let f_x = x * x;
    let y = (-1) * f_x * (1 / NUMBER_OF_STEPS);
    vertex(x, y);
  }
  endShape()
}