const POINTS = [];
const COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2*POINT_RADIUS;
const STROKE_WEIGHT_BEZIER_CURVE = 2;
const STROKE_WEIGHT_HELPER_LINES = 1;

// Color constants
const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_CANVAS = 'linen';
const COLOR_POINTS = 0; // 0 means 'black'

// GUI-elements
let slider = null;
let btn_add = null;
let output_t = null;

let number_of_points = 0;
let point_to_move = null;
let bezier_curve = [];
let bool_adding = false;
let bool_found = false;

// Function to add a single point with coordinates (x,y) to the POINTS-list and
// calculating a new color based only on the hue value as defined in the HSB color model.
let color_hue = 0
function addPoint(x, y){
  if (x <= CANVAS_WIDTH && y <= CANVAS_HEIGHT) {
    number_of_points++;
    POINTS.push(createVector(x, y));
    colorMode(HSB);
    COLORS.push(color(color_hue % 360, 100, 100));
    color_hue += 20
    colorMode(RGB);
  }
}

function clearBezierCurve(){
  bezier_curve.splice(0);
  slider.value('0');
}


// Setting up the canvas, the buttons and the slider.
function setup() {
  let myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  myCanvas.parent('canvas-container');
  addPoint(100, 130);
  addPoint(230, 120);
  addPoint(300, 300);
  addPoint(530, 320);
  
  output_t = select('#t_value');

  slider = select('#slider_t_value');
  slider.input(() => {
    output_t.html('t = ' + slider.value().toLocaleString(
      undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
      { minimumFractionDigits: 2 }
    ));
  })

  btn_add = select('#button_add');
  btn_add.mousePressed(() => {
    bool_adding = true;
    btn_add.style('background-color', '#999');
  });

  select('#button_del').mousePressed(() => {
    if (number_of_points > 2) {
      number_of_points--
      POINTS.pop();
      clearBezierCurve();
    }
  });
}

// Catching mouse pressed events:
// If "ADD" button was pressed before, set a new point and clear the Bézier curve,
// else go for moving a point, i.e. mouse drag event.
function mousePressed() {
  if (bool_adding) {
    if (mouseX <= CANVAS_WIDTH && mouseY <= CANVAS_HEIGHT) {
      addPoint(mouseX, mouseY);
      bool_adding = false;
      clearBezierCurve();
      btn_add.removeAttribute('style');
    }
  } else {
    for (const p of POINTS) {
      const d = dist(p.x, p.y, mouseX, mouseY);
      if (d < POINT_RADIUS) {
        point_to_move = p;
        bool_found = true;
        break;
      }
    }
    if (bool_found) {
      clearBezierCurve();
    }
  }
}

// If we are not adding a point, we maybe dragging a point to move it... :)
function mouseDragged() {
  if (!bool_adding) {
    if (point_to_move) {
      point_to_move.set(mouseX, mouseY);
    }
    if (bool_found) {
      clearBezierCurve();
    }
  }
}

function mouseReleased() {
  if (!bool_adding) {
    point_to_move = null;
    bool_found = false;
  }
}

// Drawing function
// TODO:
// - Separate the logic from the view: separate the calculation of the Bézier curve from the visualization of it!
// - Creating the Bernstein polynomials with CindyJS or with p5.js.
function draw() {
  background(COLOR_CANVAS);

  // Draw points
  for (const p of POINTS) {
    stroke(COLOR_POINTS);
    fill(COLOR_POINTS);
    circle(p.x, p.y, POINT_DIAMETER);
  }

  // Draw lines between the control points
  stroke(COLOR_BEZIER_CURVE);
  noFill();
  beginShape();
  for (const p of POINTS) {
    vertex(p.x, p.y);
  }
  endShape();

  let current = POINTS;
  for (let i = 0; i < number_of_points - 1; i++) {
    const vs = [];

    for (let j = 0; j < current.length - 1; j++) {
      vs.push(p5.Vector.lerp(current[j], current[j + 1], slider.value())); // TODO: Write De Casteljau's algorithm!
    }

    // Draw helper points
    for (const v of vs) {
      stroke(COLORS[i]);
      fill(COLORS[i]);
      circle(v.x, v.y, POINT_RADIUS);
    }

    // Draw helper lines
    stroke(COLORS[i]);
    noFill();
    beginShape();
    for (const v of vs) {
      vertex(v.x, v.y);
    }
    endShape();


    current = vs;
    if (i >= number_of_points - 2) {
      bezier_curve.push(current[0]);
    }
  }

  // Draw Bézier curve
  stroke(COLOR_BEZIER_CURVE);
  strokeWeight(STROKE_WEIGHT_BEZIER_CURVE);
  noFill();
  beginShape();
  for (const p of bezier_curve) {
    vertex(p.x, p.y);
  }
  endShape();
  strokeWeight(STROKE_WEIGHT_HELPER_LINES);

}