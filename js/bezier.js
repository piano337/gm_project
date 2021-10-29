const POINTS = [];
const COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2 * POINT_RADIUS;
const STROKE_WEIGHT_BEZIER_CURVE = 2;
const STROKE_WEIGHT_HELPER_LINES = 1;
const NUMBER_OF_STEPS = 100;

// Color constants
const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_CANVAS = "linen";
const COLOR_POINTS = "#696969"; // 0 means 'black'

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
let color_hue = 0;
function addPoint(x, y) {
  if (x <= CANVAS_WIDTH && y <= CANVAS_HEIGHT) {
    number_of_points++;
    POINTS.push(createVector(x, y));
    colorMode(HSB);
    COLORS.push(color(color_hue % 360, 100, 100));
    color_hue += 20;
    colorMode(RGB);
  }
}

function clearBezierCurve() {
  bezier_curve.splice(0);
  slider.value("0");
}

// Setting up the canvas, the buttons and the slider.
function setup() {
  let myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  myCanvas.parent("canvas-container");
  addPoint(100, 130);
  addPoint(230, 120);
  addPoint(300, 300);
  addPoint(530, 320);

  output_t = select("#t_value");

  slider = select("#slider_t_value");
  slider.input(() => {
    output_t.html(
      "t = " +
        slider.value().toLocaleString(
          undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
          { minimumFractionDigits: 2 }
        )
    );
  });

  btn_add = select("#button_add");
  btn_add.mousePressed(() => {
    bool_adding = true;
    btn_add.style("background-color", "#999");
  });

  select("#button_del").mousePressed(() => {
    if (number_of_points > 2) {
      number_of_points--;
      POINTS.pop();
      clearBezierCurve();
    }
  });
  deCasteljau();
  noLoop();
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
      btn_add.removeAttribute("style");
      deCasteljau();
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
    deCasteljau();
  }
  redraw();
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
  redraw();
}

function mouseReleased() {
  if (!bool_adding) {
    point_to_move = null;
    bool_found = false;
  }
  deCasteljau();
  redraw();
}

function deCasteljau() {
  for (let t_i = 0; t_i <= NUMBER_OF_STEPS; t_i++) {
    const t = (1.0 * t_i) / NUMBER_OF_STEPS;
    let current_points = POINTS;
    for (let i = 0; i < number_of_points - 1; i++) {
      const helper_points = [];
      for (let j = 0; j < current_points.length - 1; j++) {
        // Linear interpolation
        vec = createVector(
          current_points[j].x * (1 - t) + t * current_points[j + 1].x,
          current_points[j].y * (1 - t) + t * current_points[j + 1].y
        );
        helper_points.push(vec);
      }
      current_points = helper_points;
      if (i >= number_of_points - 2) {
        bezier_curve.push(current_points[0]);
      }
    }
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

  // Draw control polygon
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
      t = slider.value();
      // Linear interpolation
      vec = createVector(
        current[j].x * (1 - t) + t * current[j + 1].x,
        current[j].y * (1 - t) + t * current[j + 1].y
      );
      vs.push(vec);
    }

    // Draw helper points
    for (const v of vs) {
      // Draw point on Bézier curve...
      if (i == number_of_points - 2) {
        stroke(COLOR_BEZIER_CURVE);
        fill(COLOR_BEZIER_CURVE);
        circle(v.x, v.y, POINT_DIAMETER);
      }
      // ... else draw smaller points as helper points
      else {
        stroke(COLORS[i]);
        fill(COLORS[i]);
        circle(v.x, v.y, POINT_RADIUS);
      }
    }

    // Draw helper lines
    stroke(COLORS[i]);
    noFill();
    beginShape();
    for (const v of vs) {
      vertex(v.x, v.y);
    }
    endShape();
  }

  // Draw Bézier curve
  stroke(COLOR_BEZIER_CURVE);
  strokeWeight(STROKE_WEIGHT_BEZIER_CURVE);
  noFill();
  beginShape();
  current_t = Math.floor(slider.value()*NUMBER_OF_STEPS);
  for (let i = 0; i <= current_t; i++) {
    let p = bezier_curve[i];
    vertex(p.x, p.y);
  }
  endShape();
  strokeWeight(STROKE_WEIGHT_HELPER_LINES);
}
