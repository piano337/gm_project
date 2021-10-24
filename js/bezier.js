const POINTS = [];
const COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2*POINT_RADIUS;

let total = 0;
let mover = null;
let slider = null;
let curveP = [];
let addingPoint = false;
let found = false;

// Function to add a single point with coordinates (x,y) to the POINTS-list and
// calculating a new color based only on the hue value as defined in the HSB color model.
let color_hue = 0
function addPoint(x, y){
  if (x <= CANVAS_WIDTH && y <= CANVAS_HEIGHT) {
    total++;
    POINTS.push(createVector(x, y));
    colorMode(HSB);
    COLORS.push(color(color_hue % 360, 100, 100));
    color_hue += 20
    console.log(color_hue);
    colorMode(RGB);
  }
}

function clearBezierCurve(){
  curveP.splice(0);
  slider.value('0');
}


// Setting up the 
function setup() {
  let myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  myCanvas.parent('canvas-container');
  addPoint(100, 130);
  addPoint(230, 120);
  addPoint(300, 300);
  addPoint(100, 300);
  
  slider = select('#slider_t_value');

  select('#button_add').mousePressed(() => {
    addingPoint = true;
  });
  select('#button_del').mousePressed(() => {
    if (total > 2) {
      total--
      POINTS.pop();
      clearBezierCurve();
    }
  });

}

function mousePressed() {
  if (addingPoint) {
    if (mouseX <= CANVAS_WIDTH && mouseY <= CANVAS_HEIGHT) {
      addPoint(mouseX, mouseY);
      addingPoint = false;
      clearBezierCurve();
    }
  } else {
    for (const p of POINTS) {
      const d = dist(p.x, p.y, mouseX, mouseY);
      if (d < POINT_RADIUS) {
        mover = p;
        found = true;
      }
    }
    if (found) {
      clearBezierCurve();
    }
  }
}

function mouseDragged() {
  if (!addingPoint) {
    if (mover) {
      mover.set(mouseX, mouseY);
    }
    if (found) {
      clearBezierCurve();
    }
  }
}

function mouseReleased() {
  if (!addingPoint) {
    mover = null;
    found = false;
  }
}

function draw() {
  background('linen');

  for (const p of POINTS) {
    stroke(0);
    fill(0);
    circle(p.x, p.y, POINT_DIAMETER);
  }

  stroke(0);
  noFill();
  beginShape();
  for (const p of POINTS) {
    vertex(p.x, p.y);
  }
  endShape();

  let current = POINTS;
  for (let i = 0; i < total - 1; i++) {
    const vs = [];

    for (let j = 0; j < current.length - 1; j++) {
      vs.push(p5.Vector.lerp(current[j], current[j + 1], slider.value()));
    }

    for (const v of vs) {
      stroke(COLORS[i]);
      fill(COLORS[i]);
      circle(v.x, v.y, POINT_DIAMETER);
    }

    stroke(COLORS[i]);
    noFill();
    beginShape();
    for (const v of vs) {
      vertex(v.x, v.y);
    }
    endShape();

    current = vs;

    if (i >= total - 2) {
      curveP.push(current[0]);
    }
  }

  // Final Bézier curve
  stroke(0);
  noFill();
  beginShape();
  for (const p of curveP) {
    vertex(p.x, p.y);
  }
  endShape();
}