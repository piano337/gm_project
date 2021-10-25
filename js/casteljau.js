//TODO Cleaning code, adding constants, but seems to work :D
//PoC of Casteljau's Algorithm, INPUT = Control points and parameter t, OUTPUT= Bezier curve.

const POINTS = [];

const COLOR_BEZIER_CURVE = 0; // 0 means 'black'
const COLOR_CANVAS = 'linen';
const COLOR_POINTS = 0; // 0 means 'black'



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

	addControlPoint(450,50);
	
	
}
function draw(){
	background(COLOR_CANVAS);
	// Draw points
	for (const p of POINTS) {
		stroke(COLOR_POINTS);
		fill(COLOR_POINTS);
		circle(p.x, p.y, 15);
	}
	//Draw Polygon lines
	stroke(COLOR_BEZIER_CURVE);
	noFill();
	beginShape();
	for (const p of POINTS) {
		vertex(p.x, p.y);
	}
	endShape();
	//Just to see B-Curve, TODO: something like loading bar
	for (t = 0 ; t<1; t=t+0.001) {
		stroke(COLOR_POINTS);
		fill(COLOR_POINTS);
		bpoint= casteljauAlgorithm(t)
		circle(bpoint.x, bpoint.y, 2);
	}

}

function casteljauAlgorithm(t){
	n = POINTS.length
	newPoints = POINTS.slice()
	for (var r = 1; r <n; r++){
		
		for(var j = 0; j< n-r; j++){
			//Need to create a new Vector Object
			newPoints[j] = createVector(newPoints[j].x * (1-t) + t * newPoints[j+1].x,newPoints[j].y*(1-t) + t*newPoints[j+1].y )
		}	
	}
	//Printing b_0^n i.e the point which traces the B-Curve
	return newPoints[0]
	
}
