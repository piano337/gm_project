// Demonstrates the difference between mousePressed and mouseDragged event handling

let value = 0;
let value2 = 0;
function setup() {

    let myCanvas = createCanvas(600, 400);
    myCanvas.parent('container');


}

function draw() {
    fill(value);
    r1 = rect(25, 25, 50, 50);

    fill(value2);
    r2 = rect(125, 125, 50, 50);
}

function mousePressed() {
    if (value === 0) {
        value = 255;
    } else {
        value = 0;
    }
}

function mouseDragged() {
    value2 = value2 + 5;
    if (value2 > 255) {
        value2 = 0;
    }
}