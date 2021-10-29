const CANVAS_SIZE = 500;
const GRID_SIZE = CANVAS_SIZE / 4;
const NUMBER_OF_STEPS = 100;
const COLORS = [];
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2 * POINT_RADIUS;

let binomial_coefficients;
let number_of_points;

let color_hue = 0
function addPoint() {
  colorMode(HSB);
  COLORS.push(color(color_hue % 360, 100, 90));
  color_hue += 30
  colorMode(RGB);
}

function pascalsTriangle(n) {
  let line = [1];
  for (let k = 0; k < n; k++) {
    line.push(line[k] * (n - k) / (k + 1));
  }
  return line;
}


function setup() {
  let myCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  myCanvas.parent('canvas-container');
  output_t = select('#t_value');
  slider = select('#slider_t_value');
  slider.input(() => {
    output_t.html('t = ' + slider.value().toLocaleString(
      undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
      // { minimumFractionDigits: 2 }
    ));
    redraw();
  });
  num_of_points = select('#nr_of_points');
  num_of_points.input(() => {
    number_of_points = num_of_points.value() - 1;
    binomial_coefficients = pascalsTriangle(number_of_points);
    redraw();
  });

  number_of_points = num_of_points.value() - 1;
  binomial_coefficients = pascalsTriangle(number_of_points);
  noLoop();
}

function draw() {
  background('linen');
  graphGrid();
  for(let i = 0; i <= number_of_points; i++) addPoint();
  functionPlot(number_of_points);
  graphAxis();
}

function bernstein(n, j, t) {
  const coefficient = binomial_coefficients[j];
  return (coefficient * Math.pow(t, j) * Math.pow((CANVAS_SIZE - t), n - j));
}

function graphGrid(){
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

function graphAxis() {
  translate(0, -height);
  stroke(0);
  strokeWeight(5);

  // x axis
  line(0, height, width, height);

  // y axis
  line(0, 0, 0, height);

}

function functionPlot(n) {
  translate(0, height);
  strokeWeight(2);
  noFill();
  for (let j = 0; j <= n; j++) {
    stroke(COLORS[j]);
    beginShape();
    for (let i = 0; i <= NUMBER_OF_STEPS; i++) {
      let x = i * (CANVAS_SIZE / NUMBER_OF_STEPS);
      let f_x = bernstein(n, j, x);
      let y = (-1) * f_x * (1 / Math.pow(CANVAS_SIZE, n - 1));
      vertex(x, y);

      // Set points for slider value (t parameter)
      if(slider.value() == i){
        fill(COLORS[j]);
        circle(x, y, POINT_DIAMETER);
        noFill();
      }
    }
    endShape();
  }
}