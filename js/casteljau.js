//TODO Cleaning code, adding constants, but seems to work :D

//PoC of Casteljau's Algorithm, INPUT = Control points and parameter t, OUTPUT= Bezier curve.

const POINTS = [];
const COLORS = [];

const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_CANVAS = 'linen';
const COLOR_POINTS = 0; // 0 means 'black'

let point_to_move;
let helper_points = [];
let add_boolean = false;
let param_t = 0;

function addControlPoint(x,y){

    POINTS.push(createVector(x, y));
}

function setup() {

	//Setting up Canvas
	let myCanvas = createCanvas(600, 400);
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
		if(mouseX < 600 && mouseY < 400){
			deleteHelperPoints()
			addControlPoint(mouseX,mouseY);
			add_boolean = false;
		}
			
	}
	else{
		for (const p of POINTS){ //Moving points
			deleteHelperPoints()
			d = dist(p.x,p.y,mouseX,mouseY)
			if (d < 15){ //15 point radius
				point_to_move = p;		
			}	
		}
	}
	redraw();
}
//Moving stuff
function mouseDragged(){
	if(mouseX < 600 && mouseY < 400){
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
		circle(p.x, p.y, 15);
	}
	//Draw Helper Points
	for (const p of helper_points) {
		stroke(COLOR_POINTS);
		fill(123);
		circle(p.x, p.y, 15);
	}
	//Draw Helper Lines
	n = POINTS.length
	if (helper_points.length > 1){
		row = n-1;
		j = row;	
		for (var i = 0; i < helper_points.length; i++){
			if (j != 0 ){
				stroke(COLOR_BEZIER_CURVE);
				noFill();
				beginShape();
				line(helper_points[i].x, helper_points[i].y,helper_points[i+1].x, helper_points[i+1].y);
				endShape();
				j--
			} else{
				row--
				j=row;			
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
	for (var r = 1; r <n; r++){
		
		for(var j = 0; j< n-r; j++){
			//Need to create a new Vector Object
			newPoints[j] = createVector(newPoints[j].x * (1-t) + t * newPoints[j+1].x,newPoints[j].y*(1-t) + t*newPoints[j+1].y )
			helperPoint = newPoints[j]
			helper_points.push(helperPoint)
		}	
	}
	//Printing b_0^n i.e the point which traces the B-Curve
	return newPoints[0]
	
}
