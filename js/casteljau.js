
//PoC of Casteljau's Algorithm, INPUT = Control points and parameter t, OUTPUT= Bezier curve.


const POINTS = [];


function addControlPoint(x,y){

    POINTS.push(createVector(x, y));
}

function setup() {
	addControlPoint(1,2);

	addControlPoint(5,2);

	addControlPoint(6,7);

	addControlPoint(9,1);
	
	casteljauAlgorithm(0);
	casteljauAlgorithm(0.1);
	
	casteljauAlgorithm(0.2);

	casteljauAlgorithm(0.3);
	casteljauAlgorithm(0.4);
	casteljauAlgorithm(0.5);
	casteljauAlgorithm(0.6);
	casteljauAlgorithm(0.7);
	casteljauAlgorithm(0.8);
	casteljauAlgorithm(0.9);
	casteljauAlgorithm(1);
}

function casteljauAlgorithm(t){
	n = POINTS.length
	newPoints = [...POINTS]

	for (var r = 1; r <n; r++){
		
		for(var j = 0; j< n-r; j++){
			//X-Coordinate
			newPoints[j].x = newPoints[j].x * (1-t) + t * newPoints[j+1].x
			//Y-Coordinate
			newPoints[j].y = newPoints[j].y*(1-t) + t*newPoints[j+1].y
		}	
	}

	console.log(newPoints[0])

}
