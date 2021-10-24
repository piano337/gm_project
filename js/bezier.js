const POINTS = [];
const COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 10;

let total = 4;
let mover = null;
let slider = null;
let curveP = [];
let addingPoint = false;
let found = false;

function setup() {
  let myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  myCanvas.parent('canvas-container');
  POINTS.push(createVector(100, 100));
  POINTS.push(createVector(300, 100));
  POINTS.push(createVector(300, 300));
  POINTS.push(createVector(100, 300));
  
  slider = select('#slider_t_value');

  select('#button_add').mousePressed(() => {
    addingPoint = true;
  });
  select('#button_del').mousePressed(() => {
    if (total > 2) {
      total--
      console.log("total = " + total);
      POINTS.pop();
      curveP.splice(0);
    }
  });

}

function mousePressed() {
  if (addingPoint) {
    if (mouseX <= CANVAS_WIDTH && mouseY <= CANVAS_HEIGHT) {
      total++;
      POINTS.push(createVector(mouseX, mouseY));
      addingPoint = false;
      curveP.splice(0);
    }
  } else {
    for (const p of POINTS) {
      const d = dist(p.x, p.y, mouseX, mouseY);
      if (d < 6) {
        mover = p;
        found = true;
      }
    }
    if (found) {
      curveP.splice(0);
    }
  }
}

function mouseDragged() {
  if (!addingPoint) {
    if (mover) {
      mover.set(mouseX, mouseY);
    }
    if (found) {
      curveP.splice(0);
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
    circle(p.x, p.y, POINT_RADIUS);
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
      stroke(0);
      fill(0);
      circle(v.x, v.y, POINT_RADIUS);
    }

    stroke(0);
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

  stroke(0);
  noFill();
  beginShape();
  for (const p of curveP) {
    vertex(p.x, p.y);
  }
  endShape();
}