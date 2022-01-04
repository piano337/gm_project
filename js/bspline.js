const POINTS = []; //Control points
let BSPLINE_DEGREE=2;
let KNOTS = [100,200,300,450,480,500,529];
let number_of_knots= KNOTS.length;
let MULTIPLICITY=[0,0,0,0,0,0,0];
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
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

// Color constants
const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_TANGENT = "#C0C0C0";
const COLOR_CANVAS = "linen";
const COLOR_POINTS = "#696969"; // 0 means 'black'

// GUI-elements
let slider = null;
let btn_add = null;
let output_t = null;

let number_of_points = 0;
let point_to_move = null;
let bezier_curve = [];
let s_prime = [];
let bspline_curve = [];
let bool_adding = false;
let bool_found = false;


// For Bernstein polynomials
const CANVAS_SIZE = 500;
const GRID_SIZE = CANVAS_SIZE / 4;

let binomial_coefficients = null;

let bezier_sketch = function (p) {
  p.addKnotField = function () {
    let table = document.getElementById("knot-table");
    let lastRowNum = table.rows.length
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let knotHTML = "<input id=\"knot" + lastRowNum + "\" type=\"number\" value=\"" + KNOTS[KNOTS.length-1] + "\"/></td>";
    let multiplicityHTML = "<input id=\"mult" + lastRowNum + "\" type=\"number\" max=\"20\" value=\"0\"/></td>";
    cell0.innerHTML = lastRowNum;
    cell1.innerHTML = knotHTML;
    cell2.innerHTML = multiplicityHTML;

    // Adding last row values to arrays 
    KNOTS.push(KNOTS[KNOTS.length-1]);
    MULTIPLICITY.push(0);
  }

  // Delete last row in knot table
  p.removeKnot = function () {
    if(KNOTS.length < (POINTS.length + BSPLINE_DEGREE - 1)){
      alert('The following equation must apply!:\nNumber of knots = Number of control points + degree - 1\n(Derived from L = K - n + 1)');
    } else {
      document.getElementById("knot-table").deleteRow(-1);
      KNOTS.pop();
      MULTIPLICITY.pop();
    }
  }

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
  p.BoorAlgorithm = function(){
  	let current_points = POINTS.slice();
  	bspline_curve.length = 0;
  	let d = [];
  	let alpha=[];
  	let n = BSPLINE_DEGREE;
  	//We fill d and alpha to operate like algorithm
  	
  	//Algorithm start
  	
  	for (let u = KNOTS[0]; u <= KNOTS[number_of_knots-1]; u=u+1){
  		let I = -1;

  		d.length = 0;

  		alpha.length = 0;
  		for (let i = 0; i <= n; i++){
	  		d.push([]);
	  		alpha.push([]);
	  		for (let j = 0; j <= n; j++){
	  			d[i].push([]);
	  			alpha[i].push([]);
	  		}
  		}

  		for (let i = 0; i < number_of_knots-1; i++){//Obtaining the interval knots where u is
  			if(KNOTS[i]<=u && KNOTS[i+1]>u && i>=n-1 && i+1<=number_of_knots-n){

  				I = i;
  				break;
  			}
  		}

  		let r = MULTIPLICITY[I];
  		if(I!=-1){//Valid u
  		//Construction of (d_j-r)^r
  		for (let j = r; j <= n; j++){
  			d[j-r][r]=current_points[I-n+1+j].copy();

  			
  		}
  		for (let k = r+1; k <= n-1; k++){
  			for (let j = 0; j <= n-k; j++){
  				alpha[j][k]=(u-KNOTS[I-n+k+j])/(KNOTS[I+1+j]-KNOTS[I-n+k+j]);
  				let aux = d[j][k-1].copy();
  				aux.mult(1-alpha[j][k]);
  				let aux2 = d[j+1][k-1].copy();
  				aux2.mult(alpha[j][k]);
  				//d[j][k]=(1-alpha[j][k])*d[j][k-1]+alpha[j][k]*d[j+1][k-1];
  				d[j][k] = p5.Vector.add(aux,aux2)
  			}
  		}
  			//s_prime.push((n/u[I+1]-u[I])*(d[1][n-1]-d[0][n-1]));
	  		alpha[0][n]=(u-KNOTS[I])/(KNOTS[I+1]-KNOTS[I]);
	  		
	  		let aux = d[0][n-1].copy();
	  		aux.mult(1-alpha[0][n]);
	  		let aux2 = d[1][n-1].copy();
	  		aux2.mult(alpha[0][n]);

	  		bspline_curve.push(p5.Vector.add(aux,aux2));
	  		
		}
  		
  	}


  }

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
	  p.addPoint(530, 120);
	  p.addPoint(330, 120);

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

    btn_add_knot = p.select("#button_add_knot");
    btn_add_knot.mousePressed(() => {
      p.addKnotField();
    });

    btn_remove_knot = p.select("#button_remove_knot");
    btn_remove_knot.mousePressed(() => {
      p.removeKnot();
    });

    p.select("#button_del").mousePressed(() => {
      if (number_of_points > 2) {
        number_of_points--;
        POINTS.pop();
        p.clearBezierCurve();
      }
    });
    p.BoorAlgorithm();
    p.noLoop();

    // Init knots table:
    for(let i = 0; i < KNOTS.length; i++){
      let table = document.getElementById("knot-table");
      let lastRowNum = table.rows.length
      let row = table.insertRow(-1);
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      let cell2 = row.insertCell(2);
      let knotHTML = "<input id=\"knot" + lastRowNum + "\" type=\"number\" value=\"" + KNOTS[i] + "\"/></td>";
      let multiplicityHTML = "<input id=\"mult" + lastRowNum + "\" type=\"number\" max=\"20\" value=\"0\"/></td>";
      cell0.innerHTML = lastRowNum;
      cell1.innerHTML = knotHTML;
      cell2.innerHTML = multiplicityHTML;
    }

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
        p.BoorAlgorithm();
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
      p.BoorAlgorithm();
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
    p.BoorAlgorithm();
    p.redraw();
  };

  // Drawing function
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

    // Draw Bézier curve
    p.stroke(COLOR_BEZIER_CURVE);
    p.strokeWeight(STROKE_WEIGHT_BEZIER_CURVE);
    p.noFill();
    p.beginShape();
    for (let i = 0; i <= bspline_curve.length-1; i++) {
      let point = bspline_curve[i];
      p.vertex(point.x, point.y);
    }
    p.endShape();
    p.strokeWeight(STROKE_WEIGHT_HELPER_LINES);
  };
};

function pascalsTriangle(n) {
  let line = [1];
  for (let k = 0; k < n; k++) {
    line.push((line[k] * (n - k)) / (k + 1));
  }
  return line;
}

////// BERNSTEIN POLYNOMIALS
let bernstein_sketch = function (p) {
  let color_hue = 0;
  p.addPoint = function () {
    p.colorMode(p.HSB);
    GRAPH_COLORS.push(p.color(color_hue % 360, 100, 90));
    color_hue += 30;
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
    bernsteinCanvas.parent("bernstein-canvas-container");
    slider = p.select("#slider_t_value");
    slider.input(() => {
      p.redraw();
    });

    binomial_coefficients = pascalsTriangle(number_of_points);
    p.noLoop();
  };

  p.draw = function () {
    p.background("linen");
    p.graphGrid();
    for (let i = 0; i <= number_of_points; i++) p.addPoint();
    p.functionPlot(number_of_points);
    p.graphAxis();
  };

  p.bernstein = function (n, j, t) {
    const coefficient = binomial_coefficients[j];
    return coefficient * Math.pow(t, j) * Math.pow(CANVAS_SIZE - t, n - j);
  };

  p.graphGrid = function () {
    // Grid
    p.stroke("grey");
    p.strokeWeight(1);
    let x = Math.floor(p.width / GRID_SIZE);
    let y = Math.floor(p.height / GRID_SIZE);
    for (let i = 0; i < x; i++) {
      p.line(i * GRID_SIZE, 0, i * GRID_SIZE, p.height);
    }
    for (let j = 0; j < y; j++) {
      p.line(0, j * GRID_SIZE, p.width, j * GRID_SIZE);
    }
  };

  p.graphAxis = function () {
    p.translate(0, -p.height);
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
        let y = -1 * f_x * (1 / Math.pow(CANVAS_SIZE, n - 1));
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
};

///////

let bezier_p5 = new p5(bezier_sketch);
let bernstein_p5 = new p5(bernstein_sketch);
