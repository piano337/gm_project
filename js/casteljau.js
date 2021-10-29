//TODO Cleaning code, adding constants, but seems to work :D

//PoC of Casteljau's Algorithm, INPUT = Control points and parameter t, OUTPUT= Bezier curve.

const POINTS = [];
const COLORS = [];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const POINT_RADIUS = 5;
const POINT_DIAMETER = 2 * POINT_RADIUS;
const STROKE_WEIGHT_BEZIER_CURVE = 2;
const STROKE_WEIGHT_HELPER_LINES = 1;

const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_CANVAS = 'linen';
const COLOR_POINTS = 0; // 0 means 'black'

let point_to_move;
let helper_points = [];
let add_boolean = false;
let param_t = 0;

// Function to add a single point with coordinates (x,y) to the POINTS-list and
// calculating a new color based only on the hue value as defined in the HSB color model.
let color_hue = 0
function addControlPoint(x, y) {
	if (x < CANVAS_WIDTH && y < CANVAS_HEIGHT) {
		POINTS.push(createVector(x, y));
		colorMode(HSB);
		COLORS.push(color(color_hue % 360, 100, 100));
		color_hue += 20
		colorMode(RGB);
	}
}

function setup() {

	//Setting up Canvas
	let myCanvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
	myCanvas.parent('canvas-container');
  
	//Setting up points	
	addControlPoint(50,100);
	addControlPoint(250,100);
	addControlPoint(300,350);
	
	//Setting up ADD Points
	btn_add = select('#button_add');
	btn_add.mousePressed(() => {
		add_boolean = true;
	});
	//Setting up DELETE Points
	btn_add = select('#button_del');
	btn_add.mousePressed(() => {
		deleteHelperPoints()
		if (POINTS.length > 2){
			POINTS.pop();		
		}
		
	});
	//Setting up t-value
	write_t = select('#t_value');
	
	bar = select('#slider_t_value');
	bar.input(() => {
		write_t.html('t = ' + bar.value().toLocaleString(
		undefined, // leave undefined to use the visitor's browser locale or a string like 'en-US' to override it.
		{ minimumFractionDigits: 2 }
		));
	})
	noLoop();
	
	
	
}
//Mouse Pressed Events
function mousePressed(){
	if (add_boolean){ //ADD new control point
		if(mouseX < CANVAS_WIDTH && mouseY < CANVAS_HEIGHT){
			deleteHelperPoints()
			addControlPoint(mouseX,mouseY);
			add_boolean = false;
		}

	}
	else{
		for (const p of POINTS){ //Moving points
			deleteHelperPoints()
			d = dist(p.x,p.y,mouseX,mouseY)
			if (d < POINT_RADIUS){ //15 point radius
				point_to_move = p;		
			}	
		}
	}
	redraw();
}
//Moving stuff
function mouseDragged(){
	if(mouseX < CANVAS_WIDTH && mouseY < CANVAS_HEIGHT){
		deleteHelperPoints()
		point_to_move.set(mouseX,mouseY);
	}
	redraw();
}

function draw(){


	
	background(COLOR_CANVAS);
	// Draw points
	for (const p of POINTS) {
		stroke(COLOR_POINTS);
		fill(COLOR_POINTS);
		circle(p.x, p.y, POINT_DIAMETER);
	}
	//Draw Helper Points
	let idx = 0;
	for (const h of helper_points) {
		idx++;
		for(const p of h){
			stroke(COLORS[idx]);
			fill(COLORS[idx]);
			circle(p.x, p.y, POINT_DIAMETER);
		}
	}
	//Draw Helper Lines
	for (const h of helper_points) {
		for(i = 0; i < POINTS.length; i++){
			if (i!=POINTS.length){
				stroke(COLOR_BEZIER_CURVE);
				noFill();
				beginShape();
				//line(h[i].x,h[i].y,h[i+1].x,h[i+1].y);
				endShape();
			}
		}
	}
	//Draw Polygon lines
	stroke(COLOR_BEZIER_CURVE);
	noFill();
	beginShape();
	for (const p of POINTS) {
		vertex(p.x, p.y);
	}
	endShape();
	
	param_t = bar.value(); //Refreshing continously the t chosen
	
	for (t = 0 ; t<param_t; t=t+0.001) {
		stroke(COLOR_POINTS);
		fill(COLOR_POINTS);
		bpoint= casteljauAlgorithm(t)
		circle(bpoint.x, bpoint.y, 2);
	}
	
	

}


function deleteHelperPoints(){

	for (let i = helper_points.length; i > 0; i--) {
  		helper_points.pop();
	}
	
}
function casteljauAlgorithm(t){
	n = POINTS.length
	newPoints = POINTS.slice()
	deleteHelperPoints()
	let row = []
	for (var r = 1; r <n; r++){
		for (let i = helper_points.length; i > 0; i--) {
  			row.pop();
		}
		for(var j = 0; j< n-r; j++){
			//Need to create a new Vector Object
			newPoints[j] = createVector(newPoints[j].x * (1-t) + t * newPoints[j+1].x,newPoints[j].y*(1-t) + t*newPoints[j+1].y )
			helperPoint = newPoints[j]
			row.push(helperPoint)
		}
		helper_points.push(row.slice())	
	}
	//Printing b_0^n i.e the point which traces the B-Curve
	return newPoints[0]
	
}
