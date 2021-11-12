const POINTS = [];
const COLORS = [];
const GRAPH_COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2 * POINT_RADIUS;
const STROKE_WEIGHT_BEZIER_CURVE = 2;
const STROKE_WEIGHT_HELPER_LINES = 1;
const NUMBER_OF_STEPS = 100;
const TANGENT_LEN_FACTOR = 0.3;

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

// For Bernstein polynomials
const CANVAS_SIZE = 500;
const GRID_SIZE = CANVAS_SIZE / 4;

let binomial_coefficients = null;

let bezier_sketch = function (p) {

  p.clearBezierCurve = function () {
    bezier_curve.splice(0);
    slider.value("0");
    output_t.html(
      "t = " +
      (slider.value() / NUMBER_OF_STEPS).toLocaleString(
        undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
        { minimumFractionDigits: 2 }
      )
    );
  };

  p.deCasteljau = function () {
    for (let t_i = 0; t_i <= NUMBER_OF_STEPS; t_i++) {
      const t = (1.0 * t_i) / NUMBER_OF_STEPS;
      let current_points = POINTS;
      for (let i = 0; i < number_of_points - 1; i++) {
        const helper_points = [];
        for (let j = 0; j < current_points.length - 1; j++) {
          // Linear interpolation
          vec = p.createVector(
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
  };

  p.calcTangent = function (b_1, b_0) {
    let factor = TANGENT_LEN_FACTOR * number_of_points;
    return p.createVector(factor * (b_1.x - b_0.x), factor * (b_1.y - b_0.y));
    
  };
  // Function to add a single point with coordinates (x,y) to the POINTS-list and
  // calculating a new color based only on the hue value as defined in the HSB color model.
  let color_hue = 0;
  p.addPoint = function (x, y) {
    if (x <= CANVAS_WIDTH && y <= CANVAS_HEIGHT) {
      number_of_points++;
      POINTS.push(p.createVector(x, y));
      p.colorMode(p.HSB);
      COLORS.push(p.color(color_hue % 360, 100, 100));
      color_hue += 20;
      p.colorMode(p.HSB);
      binomial_coefficients = pascalsTriangle(number_of_points);
    }
  };
  // Setting up the canvas, the buttons and the slider.
  p.setup = function () {

    let bezierCanvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    bezierCanvas.parent("bezier-canvas-container");
    p.addPoint(100, 130);
    p.addPoint(230, 120);
    p.addPoint(300, 300);
    p.addPoint(530, 320);

    output_t = p.select("#t_value");

    slider = p.select("#slider_t_value");
    slider.input(() => {
      output_t.html(
        "t = " +
        (slider.value() / NUMBER_OF_STEPS).toLocaleString(
          undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
          { minimumFractionDigits: 2 }
        )
      );
    });

    btn_add = p.select("#button_add");
    btn_add.mousePressed(() => {
      bool_adding = true;
      btn_add.style("background-color", "#999");
    });

    p.select("#button_del").mousePressed(() => {
      if (number_of_points > 2) {
        number_of_points--;
        POINTS.pop();
        p.clearBezierCurve();
      }
    });
    p.deCasteljau();
    p.noLoop();
  };

  // Catching mouse pressed events:
  // If "ADD" button was pressed before, set a new point and clear the Bézier curve,
  // else go for moving a point, i.e. mouse drag event.
  p.mousePressed = function () {
    if (bool_adding) {
      if (p.mouseX <= CANVAS_WIDTH && p.mouseY <= CANVAS_HEIGHT) {
        p.addPoint(p.mouseX, p.mouseY);
        bool_adding = false;
        p.clearBezierCurve();
        btn_add.removeAttribute("style");
        p.deCasteljau();
      }
    } else {
      for (const point of POINTS) {
        const d = p.dist(point.x, point.y, p.mouseX, p.mouseY);
        if (d < POINT_RADIUS) {
          point_to_move = point;
          bool_found = true;
          break;
        }
      }
      if (bool_found) {
        p.clearBezierCurve();
      }
      p.deCasteljau();
    }
    p.redraw();
  };

  // If we are not adding a point, we maybe dragging a point to move it... :)
  p.mouseDragged = function () {
    if (!bool_adding) {
      if (point_to_move) {
        point_to_move.set(p.mouseX, p.mouseY);
      }
      if (bool_found) {
        p.clearBezierCurve();
      }
    }
    p.redraw();
  };

  p.mouseReleased = function () {
    if (!bool_adding) {
      point_to_move = null;
      bool_found = false;
    }
    p.deCasteljau();
    p.redraw();
  };

  // Drawing function
  // TODO:
  // - Separate the logic from the view: separate the calculation of the Bézier curve from the visualization of it!
  // - Creating the Bernstein polynomials with CindyJS or with p5.js.
  p.draw = function () {
    p.background(COLOR_CANVAS);

    // Draw points
    for (const point of POINTS) {
      p.stroke(COLOR_POINTS);
      p.fill(COLOR_POINTS);
      p.circle(point.x, point.y, POINT_DIAMETER);
    }

    // Draw control polygon
    p.stroke(COLOR_BEZIER_CURVE);
    p.noFill();
    p.beginShape();
    for (const point of POINTS) {
      p.vertex(point.x, point.y);
    }
    p.endShape();

    let current_points = POINTS;
    for (let i = 0; i < number_of_points - 1; i++) {
      const helper_points = [];

      for (let j = 0; j < current_points.length - 1; j++) {
        t = (1.0 * slider.value()) / NUMBER_OF_STEPS;
        // Linear interpolation
        vec = p.createVector(
          current_points[j].x * (1 - t) + t * current_points[j + 1].x,
          current_points[j].y * (1 - t) + t * current_points[j + 1].y
        );
        helper_points.push(vec);
      }

      current_points = helper_points;


      // Draw helper points
      for (const v of helper_points) {
        // Draw point on Bézier curve...
        if (i == number_of_points - 2) {
          p.stroke(COLOR_BEZIER_CURVE);
          p.fill(COLOR_BEZIER_CURVE);
          p.circle(v.x, v.y, POINT_DIAMETER);
        }
        // ... else draw smaller points as helper points
        else {
          p.stroke(COLORS[i]);
          p.fill(COLORS[i]);
          p.circle(v.x, v.y, POINT_RADIUS);
        }
      }

      // Calculate the tangent vector
      // console.log("h1:", helper_points[1], "h0:", helper_points[0]);
      if(helper_points.length == 2 && slider.value() < NUMBER_OF_STEPS){
        tangent_vec = p.calcTangent(helper_points[1], helper_points[0]);
        p.stroke(COLOR_BEZIER_CURVE);
        p.noFill();
        p.beginShape();
        let point_on_bezier = bezier_curve[slider.value()];
        p.vertex(point_on_bezier.x, point_on_bezier.y);
        p.vertex(point_on_bezier.x + tangent_vec.x, point_on_bezier.y + tangent_vec.y);
        p.endShape();
      }


      // Draw helper lines
      p.stroke(COLORS[i]);
      p.noFill();
      p.beginShape();
      for (const v of helper_points) {
        p.vertex(v.x, v.y);
      }
      p.endShape();
    }

    // Draw Bézier curve
    p.stroke(COLOR_BEZIER_CURVE);
    p.strokeWeight(STROKE_WEIGHT_BEZIER_CURVE);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < slider.value(); i++) {
      let point = bezier_curve[i];
      p.vertex(point.x, point.y);
    }
    p.endShape();
    p.strokeWeight(STROKE_WEIGHT_HELPER_LINES);
  };
}

function pascalsTriangle(n) {
  let line = [1];
  for (let k = 0; k < n; k++) {
    line.push(line[k] * (n - k) / (k + 1));
  }
  return line;
};



////// BERNSTEIN POLYNOMIALS
let bernstein_sketch = function (p) {

  let color_hue = 0
  p.addPoint = function () {
    p.colorMode(p.HSB);
    GRAPH_COLORS.push(p.color(color_hue % 360, 100, 90));
    color_hue += 30
    p.colorMode(p.RGB);
  };

  // p.pascalsTriangle = function (n) {
  //   let line = [1];
  //   for (let k = 0; k < n; k++) {
  //     line.push(line[k] * (n - k) / (k + 1));
  //   }
  //   return line;
  // };


  p.setup = function () {
    let bernsteinCanvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    bernsteinCanvas.parent('bernstein-canvas-container');
    slider = p.select('#slider_t_value');
    slider.input(() => {
      p.redraw();
    });

    binomial_coefficients = pascalsTriangle(number_of_points);
    p.noLoop();
  };

  p.draw = function () {
    p.background('linen');
    p.graphGrid();
    for (let i = 0; i <= number_of_points; i++) p.addPoint();
    p.functionPlot(number_of_points);
    p.graphAxis();
  };

  p.bernstein = function (n, j, t) {
    const coefficient = binomial_coefficients[j];
    return (coefficient * Math.pow(t, j) * Math.pow((CANVAS_SIZE - t), n - j));
  };

  p.graphGrid = function () {
    // Grid
    p.stroke('grey');
    p.strokeWeight(1);
    let x = Math.floor(p.width / GRID_SIZE);
    let y = Math.floor(p.height / GRID_SIZE);
    for (let i = 0; i < x; i++) {
      p.line(i * GRID_SIZE, 0, i * GRID_SIZE, p.height);
    }
    for (let j = 0; j < y; j++) {
      p.line(0, j * GRID_SIZE, p.width, j * GRID_SIZE);
    }
  }

  p.graphAxis = function () {
    p.translate(0, -(p.height));
    p.stroke(0);
    p.strokeWeight(5);

    // x axis
    p.line(0, p.height, p.width, p.height);

    // y axis
    p.line(0, 0, 0, p.height);

  };

  p.functionPlot = function (n) {
    p.translate(0, p.height);
    p.strokeWeight(2);
    p.noFill();
    for (let j = 0; j <= n; j++) {
      p.stroke(GRAPH_COLORS[j]);
      p.beginShape();
      for (let i = 0; i <= NUMBER_OF_STEPS; i++) {
        let x = i * (CANVAS_SIZE / NUMBER_OF_STEPS);
        let f_x = p.bernstein(n, j, x);
        let y = (-1) * f_x * (1 / Math.pow(CANVAS_SIZE, n - 1));
        p.vertex(x, y);

        // Set points for slider value (t parameter)
        if (slider.value() == i) {
          p.fill(GRAPH_COLORS[j]);
          p.circle(x, y, POINT_DIAMETER);
          p.noFill();
        }
      }
      p.endShape();
    }
  };

}

///////

let bezier_p5 = new p5(bezier_sketch);
let bernstein_p5 = new p5(bernstein_sketch);