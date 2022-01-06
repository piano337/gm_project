const POINTS = []; //Control points
let BSPLINE_DEGREE=2;
let KNOTS = [0,10,20,30,40,50,60];
let number_of_knots= KNOTS.length;
let MULTIPLICITY=[0,0,0,0,0,0,0];
const COLORS = [];
const GRAPH_COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2 * POINT_RADIUS;
const STROKE_WEIGHT_BSPLINE_CURVE = 2;
const STROKE_WEIGHT_HELPER_LINES = 1;
const NUMBER_OF_STEPS = 100;
const TANGENT_LEN_FACTOR = 0.3;
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

// Color constants
const COLOR_BSPLINE_CURVE = 0; // 0 means 'black'
const COLOR_TANGENT = "#C0C0C0";
const COLOR_CANVAS = "linen";
const COLOR_POINTS = "#696969"; // 0 means 'black'

// GUI-elements
let slider = null;
let btn_add = null;
let output_t = null;

let number_of_points = 0;
let point_to_move = null;
let bspline_curve = [];
let s_prime = [];
let bool_adding = false;
let bool_found = false;


// For Bernstein polynomials
const CANVAS_SIZE = 500;
const GRID_SIZE = CANVAS_SIZE / 4;

let bspline_sketch = function (p) {
  p.addKnotField = function () {
    let table = document.getElementById("knot-table");
    let lastRowNum = table.rows.length
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let knotHTML = "<input id=\"knot" + lastRowNum + "\" type=\"number\" min=\"0\" max=\"100\" value=\"" + KNOTS[KNOTS.length-1] + "\"/></td>";
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
    p.redraw();
  }

  p.saveKnots = function () {
    // Check if values are correct
    for(let i = 1; i < KNOTS.length; i++){
      if(Number(document.getElementById("knot"+i).value) < Number(document.getElementById("knot"+(i-1)).value)){
        alert("Knots must be monotonic (nondecreasing)!");
        return;
      }
    }

    for(let i = 0; i < KNOTS.length; i++){
      KNOTS[i] = Number(document.getElementById("knot"+i).value);
      MULTIPLICITY[i] = Number(document.getElementById("mult"+i).value);
    }
  }

  p.clearBSplineCurve = function () {
    // bspline_curve.splice(0);
    slider.value("0");
    output_t.html(
      "u = " +
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
    }
  };
  // Setting up the canvas, the buttons and the slider.
  p.setup = function () {
    let bsplineCanvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    bsplineCanvas.parent("bspline-canvas-container");

    p.addPoint(100, 130);
    p.addPoint(230, 120);
    p.addPoint(300, 300);
    p.addPoint(530, 320);
	  p.addPoint(530, 120);
	  p.addPoint(330, 120);

    output_t = p.select("#u_value");

    slider = p.select("#slider_u_value");
    slider.input(() => {
      output_t.html(
        "u = " +
          (slider.value() / NUMBER_OF_STEPS).toLocaleString(
            undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
            { minimumFractionDigits: 2 }
          )
      );
    });

    const input_degree = p.select("#input_degree");
    input_degree.input(() => {
      let degree = Number(input_degree.value());
      if(number_of_points < degree + 1){
        alert("At least (Degree + 1) control points needed!")
        document.getElementById("input_degree").value = BSPLINE_DEGREE;
      } else {
        BSPLINE_DEGREE = degree;
      }
    });

    btn_add = p.select("#button_add");
    btn_add.mousePressed(() => {
      bool_adding = true;
      btn_add.style("background-color", "#999");
    });

    const btn_add_knot = p.select("#button_add_knot");
    btn_add_knot.mousePressed(() => {
      p.addKnotField();
    });

    const btn_remove_knot = p.select("#button_remove_knot");
    btn_remove_knot.mousePressed(() => {
      p.removeKnot();
    });

    const btn_save_knots = p.select("#button_save_knots");
    btn_save_knots.mousePressed(() => {
      p.saveKnots();
    });

    p.select("#button_del").mousePressed(() => {
      if (number_of_points > BSPLINE_DEGREE + 1) {
        number_of_points--;
        POINTS.pop();
        p.clearBSplineCurve();
      } else {
        alert("At least (Degree + 1) control points needed!");
      }
      p.redraw();
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
      let knotHTML = "<input id=\"knot" + lastRowNum + "\" type=\"number\" min=\"0\" max=\"100\" value=\"" + KNOTS[i] + "\"/></td>";
      let multiplicityHTML = "<input id=\"mult" + lastRowNum + "\" type=\"number\" max=\"20\" value=\"0\"/></td>";
      cell0.innerHTML = lastRowNum;
      cell1.innerHTML = knotHTML;
      cell2.innerHTML = multiplicityHTML;
    }

  };

  // Catching mouse pressed events:
  // If "ADD" button was pressed before, set a new point and clear the curve,
  // else go for moving a point, i.e. mouse drag event.
  p.mousePressed = function () {
    if (bool_adding) {
      if (p.mouseX <= CANVAS_WIDTH && p.mouseY <= CANVAS_HEIGHT) {
        p.addPoint(p.mouseX, p.mouseY);
        bool_adding = false;
        p.clearBSplineCurve();
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
        p.clearBSplineCurve();
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
        p.clearBSplineCurve();
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
    p.stroke(COLOR_BSPLINE_CURVE);
    p.noFill();
    p.beginShape();
    for (const point of POINTS) {
      p.vertex(point.x, point.y);
    }
    p.endShape();

    // Draw B-Spline curve
    p.stroke(COLOR_BSPLINE_CURVE);
    p.strokeWeight(STROKE_WEIGHT_BSPLINE_CURVE);
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

////// BASIS FUNCTIONS
let basis_functions_sketch = function (p) {
  let color_hue = 0;
  p.addPoint = function () {
    p.colorMode(p.HSB);
    GRAPH_COLORS.push(p.color(color_hue % 360, 100, 90));
    color_hue += 30;
    p.colorMode(p.RGB);
  };

  p.setup = function () {
    let basisFunctionsCanvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    basisFunctionsCanvas.parent("basis-functions-canvas-container");
    slider = p.select("#slider_u_value");
    slider.input(() => {
      p.redraw();
    });
    p.select("#button_del").mousePressed(() => {
      p.redraw();
    });
    p.noLoop();
  };

  p.mousePressed = function () {
    p.redraw();
  }

  p.draw = function () {
    p.background("linen");
    p.graphGrid();
    for (let i = 0; i <= number_of_points; i++) p.addPoint();
    p.functionPlot(number_of_points);
    p.graphAxis();
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

  // Cox-de Boor recursion formula
  p.basisFunction = function (m, j, u) {
    // Simple case for B-Splines of order 1
    if(m == 1){
      if((KNOTS[j-1] <= u) && (u < KNOTS[j])){
        return 1;
      } else {
        return 0;
      }
    } else { // … else: use recursion!
      return (u - KNOTS[j-1])/(KNOTS[j+m-2] - KNOTS[j-1]) * p.basisFunction(m-1, j, u) + (KNOTS[j+m-1] - u)/(KNOTS[j+m-1] - KNOTS[j]) * p.basisFunction(m-1, j+1, u);
    }
  }

  p.functionPlot = function (n) {
    p.translate(0, p.height);
    p.strokeWeight(2);
    p.noFill();
    for (let j = 0; j <= n; j++) {
      p.stroke(GRAPH_COLORS[j]);
      p.beginShape();
      for (let i = 0; i <= NUMBER_OF_STEPS; i++) {
        const x = i * CANVAS_SIZE/NUMBER_OF_STEPS;
        const f_x = p.basisFunction(BSPLINE_DEGREE+1, j, i);
        const y = -1 * f_x * CANVAS_SIZE;
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

let bspline_p5 = new p5(bspline_sketch);
let basis_functions_p5 = new p5(basis_functions_sketch);
