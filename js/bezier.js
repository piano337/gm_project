const points = [];
let total = 4;
let mover = null;
let slider;
const cols = [];
let curveP = [];
let button;
let addingPoint = false;
let removeButton;
let found = false;

function setup() {
  let myCanvas = createCanvas(600, 400);
  myCanvas.parent('container');
  points.push(createVector(100, 100));
  points.push(createVector(300, 100));
  points.push(createVector(300, 300));
  points.push(createVector(100, 300));
  
  slider = createSlider(0, 1, 0, 0.01);
  button = createButton("Add Point");
  button.mousePressed(() => {
    addingPoint = true;
  });
  removeButton = createButton("Remove Point");
  removeButton.mousePressed(() => {
    total--;
    points.pop();
    curveP.splice(0);
  });
  
  cols.push(color(0, 165, 255));
  cols.push(color(0, 255, 0));
  cols.push(color(255, 0, 0));
  cols.push(color(255, 165, 0));
  cols.push(color(255));
}

function mousePressed() {
  if (addingPoint) {
    if (mouseX <= 400 && mouseY <= 400) {
      total++;
      points.push(createVector(mouseX, mouseY));
      addingPoint = false;
      curveP.splice(0);
    }
  } else {
    for (const p of points) {
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
  background(220);
  
  for (const p of points) {
    stroke(0);
    fill(0);
    circle(p.x, p.y, 12);
  }
  
  stroke(0);
  noFill();
  beginShape();
  for (const p of points) {
    vertex(p.x, p.y);
  }
  endShape();
  
  let current = points;
  for (let i = 0; i < total-1; i++) {
    const vs = [];

    for (let j = 0; j < current.length - 1; j++) {
      vs.push(p5.Vector.lerp(current[j], current[j+1], slider.value()));
    }

    for (const v of vs) {
      stroke(cols[i]);
      fill(cols[i]);
      circle(v.x, v.y, 12);
    }

    stroke(cols[i]);
    noFill();
    beginShape();
    for (const v of vs) {
      vertex(v.x, v.y);
    }
    endShape();
    
    current = vs;
    
    if (i >= total-2) {
      curveP.push(current[0]);
    }
  }
  
  stroke(cols[total-2]);
  noFill();
  beginShape();
  for (const p of curveP) {
    vertex(p.x, p.y);
  }
  endShape();
}